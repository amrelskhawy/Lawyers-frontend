import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Data } from '../../core/Servies/data';
import { Auth } from '../../core/Servies/auth';
import {
  FinancialsScope,
  FinancialsTab,
  IFinancialsLawyerTotals,
  IFinancialsRow,
  IFinancialsSummary,
} from '../../core/Models/financials.model';
import { CASE_TYPE_OPTIONS } from '../../core/Models/case.model';

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

/** Roles the backend narrows to their own sourced clients — everyone except ADMIN/MODERATOR. */
const SELF_SCOPED_ROLES = ['RECEPTIONIST', 'LAWYER', 'CONSULTANT'];

/**
 * Money view over the lawyer fees contracts, split by where the client came
 * from: company clients vs. clients a lawyer brought in. Contracts are counted
 * by their contract date; collections by the date the client actually paid —
 * the two answer different questions and are labelled separately.
 */
@Component({
  selector: 'app-financials',
  standalone: false,
  templateUrl: './financials.html',
  styleUrl: './financials.scss',
})
export class Financials implements OnInit {
  private readonly auth = inject(Auth);

  constructor(private data: Data) {}

  readonly months = MONTHS;

  /**
   * A self-scoped role (anyone but ADMIN/MODERATOR) only ever sees the clients
   * they personally sourced — the backend forces that from the token. The scope
   * tabs, the lawyer picker and the collections dialog would all be inert (or
   * 403) for them, so they are dropped from the page rather than shown disabled.
   */
  readonly selfScoped = SELF_SCOPED_ROLES.includes(this.auth.currentUser()?.role);

  scope = signal<FinancialsScope>(this.selfScoped ? 'LAWYER' : 'COMPANY');
  /** Which tab is shown — the two report scopes, or the Consulting CRUD tab (admin/moderator only). */
  activeTab = signal<FinancialsTab>(this.scope());
  /** null = the whole year. */
  month = signal<number | null>(null);
  year = signal<number | null>(null);
  /** null = every lawyer in the lawyer scope. */
  sourceLawyerId = signal<string | null>(null);
  search = signal<string>('');

  years = signal<number[]>([]);
  summary = signal<IFinancialsSummary | null>(null);
  /**
   * Per-lawyer totals for the chip row. Held separately from `summary` because
   * `summary` is narrowed to the selected lawyer — reusing it would make every
   * other chip disappear as soon as one was picked.
   */
  lawyerTotals = signal<IFinancialsLawyerTotals[]>([]);
  rows = signal<IFinancialsRow[]>([]);
  loading = signal<boolean>(false);

  page = signal<number>(1);
  totalRows = signal<number>(0);
  readonly limit = 20;

  paymentsVisible = signal<boolean>(false);
  activeContractId = signal<string | null>(null);

  currency = computed(() => this.rows()[0]?.currency ?? 'SAR');

  /** Share of the period's contract value already collected, for the header bar. */
  collectedRatio = computed(() => {
    const s = this.summary();
    if (!s || s.contractsTotal <= 0) return 0;
    return Math.min(100, (s.paidTotal / s.contractsTotal) * 100);
  });

  /** Naming who sourced a contract is noise when every row is the viewer's own. */
  showSourceLawyer = computed(() => this.scope() === 'LAWYER' && !this.selfScoped);

  /** Seven fixed columns, plus the source-lawyer and actions ones when shown. */
  tableColumns = computed(
    () => 7 + (this.showSourceLawyer() ? 1 : 0) + (this.selfScoped ? 0 : 1),
  );

  ngOnInit() {
    this.loadYears();
  }

  /** Defaults to the newest year that has contracts, then loads that period. */
  private loadYears() {
    this.data.get<{ data: number[] }>('financials/years').subscribe({
      next: (res) => {
        const list = res.data ?? [];
        this.years.set(list);
        if (this.year() === null && list.length) this.year.set(list[0]);
        this.reload();
      },
      error: () => this.reload(),
    });
  }

  private params(): Record<string, unknown> {
    return {
      scope: this.scope(),
      sourceLawyerId: this.sourceLawyerId() ?? undefined,
      year: this.year() ?? undefined,
      month: this.month() ?? undefined,
      search: this.search() || undefined,
    };
  }

  reload() {
    this.loading.set(true);
    const params = this.params();

    this.data.get<{ data: IFinancialsSummary }>('financials/summary', params).subscribe({
      next: (res) => {
        this.summary.set(res.data);
        // Chips come from the unnarrowed call below; only adopt these when
        // no lawyer is selected, so a single request covers the common case.
        if (this.scope() === 'LAWYER' && !this.selfScoped && !this.sourceLawyerId()) {
          this.lawyerTotals.set(res.data.byLawyer ?? []);
        }
      },
      error: () => this.summary.set(null),
    });

    if (this.scope() === 'LAWYER' && this.sourceLawyerId()) {
      this.data
        .get<{ data: IFinancialsSummary }>('financials/summary', {
          ...params,
          sourceLawyerId: undefined,
        })
        .subscribe({ next: (res) => this.lawyerTotals.set(res.data.byLawyer ?? []) });
    }

    this.data
      .get<{ data: IFinancialsRow[]; meta: { total: number } | null }>('financials/contracts', {
        ...params,
        page: this.page(),
        limit: this.limit,
      })
      .subscribe({
        next: (res) => {
          this.rows.set(res.data ?? []);
          this.totalRows.set(res.meta?.total ?? (res.data ?? []).length);
          this.loading.set(false);
        },
        error: () => {
          this.rows.set([]);
          this.loading.set(false);
        },
      });
  }

  /** Any filter change resets paging — page 3 of the old filter is meaningless. */
  private refilter() {
    this.page.set(1);
    this.reload();
  }

  setScope(scope: FinancialsScope) {
    this.activeTab.set(scope);
    if (this.scope() === scope) return;
    this.scope.set(scope);
    this.sourceLawyerId.set(null);
    this.refilter();
  }

  setConsultingTab() {
    this.activeTab.set('CONSULTING');
  }

  setLawyer(lawyerId: string | null) {
    this.sourceLawyerId.set(lawyerId);
    this.refilter();
  }

  setYear(year: number | null) {
    this.year.set(year);
    this.refilter();
  }

  setMonth(month: number | null) {
    this.month.set(this.month() === month ? null : month);
    this.refilter();
  }

  onSearch(value: string) {
    this.search.set(value.trim());
    this.refilter();
  }

  goToPage(page: number) {
    const totalPages = Math.max(1, Math.ceil(this.totalRows() / this.limit));
    const next = Math.min(Math.max(1, page), totalPages);
    if (next === this.page()) return;
    this.page.set(next);
    this.reload();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalRows() / this.limit));
  }

  openPayments(row: IFinancialsRow) {
    this.activeContractId.set(row.id);
    this.paymentsVisible.set(true);
  }

  onPaymentsChanged() {
    this.reload();
  }

  caseTypeLabel(row: IFinancialsRow): string {
    if (!row.caseType) return '—';
    return CASE_TYPE_OPTIONS.find((o) => o.value === row.caseType)?.label ?? row.caseType;
  }
}
