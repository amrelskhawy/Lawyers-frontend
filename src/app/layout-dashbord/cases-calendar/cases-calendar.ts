import { Component, OnInit, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  CaseType,
  CASE_DEGREE_OPTIONS,
  CASE_TYPE_OPTIONS,
  IDataCase,
  ILawyerOption,
} from '../../core/Models/case.model';
import { Data } from '../../core/Servies/data';
import { HijriCalendar, HijriDayCell, WEEKDAY_NAMES_AR } from './hijri-calendar';

/** A case as it sits inside a calendar day cell, pre-decorated for display. */
interface CalendarCase {
  case: IDataCase;
  customerName: string;
  time: string;
  degreeLabel: string;
  caseTypeLabel: string;
  /** The lawyer/consultant assigned to this case (display only). */
  assigneeName: string;
  /** Background color for the chip — the litigation-degree color, or neutral grey. */
  color: string;
}

const NEUTRAL_DEGREE_COLOR = '#64748b';
/** Max chips rendered inline in a day cell before collapsing into "+N more". */
const MAX_CHIPS_PER_DAY = 3;

@Component({
  selector: 'app-cases-calendar',
  standalone: false,
  templateUrl: './cases-calendar.html',
  styleUrl: './cases-calendar.scss',
})
export class CasesCalendar implements OnInit {
  readonly weekdays = WEEKDAY_NAMES_AR;
  readonly maxChips = MAX_CHIPS_PER_DAY;
  /** Degree colors shown in the legend. */
  readonly degreeOptions = CASE_DEGREE_OPTIONS;

  // ── Current user / role ──────────────────────────────────────────────────
  private get currentUser(): { role: string } | null {
    const raw = sessionStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }
  get role(): string {
    return this.currentUser?.role ?? '';
  }
  /** LAWYER/CONSULTANT see only their own cases (server-enforced) — no lawyer filter. */
  get isAssigneeRole(): boolean {
    return this.role === 'LAWYER' || this.role === 'CONSULTANT';
  }
  get canFilterByLawyer(): boolean {
    return this.role === 'ADMIN' || this.role === 'MODERATOR';
  }

  // ── State ────────────────────────────────────────────────────────────────
  /** All cases returned for this user (already role-scoped by the backend). */
  private allCases = signal<IDataCase[]>([]);
  /** Lawyer/consultant options for the admin filter. */
  lawyerOptions = signal<ILawyerOption[]>([]);
  /** Selected lawyer id for the filter ('' = all). */
  selectedLawyerId = signal<string>('');

  /** Currently displayed Hijri year + month (1-12). */
  viewYear = signal<number>(0);
  viewMonth = signal<number>(0);

  /** The case shown in the dialog. */
  selectedCase = signal<CalendarCase | null>(null);
  /** Whether the centered case dialog is open. */
  showCaseDialog = signal<boolean>(false);

  constructor(
    private data: Data,
    private router: Router,
    private hijri: HijriCalendar,
  ) {}

  ngOnInit(): void {
    const today = this.hijri.todayParts();
    this.viewYear.set(today.iYear);
    this.viewMonth.set(today.iMonth);
    this.loadCases();
    if (this.canFilterByLawyer) this.loadLawyers();
  }

  // ── Data loading ─────────────────────────────────────────────────────────
  private loadCases(): void {
    this.data.get<{ data: IDataCase[] }>('cases').subscribe((res) => {
      this.allCases.set(res?.data ?? []);
    });
  }

  private loadLawyers(): void {
    this.data.get<{ data: ILawyerOption[] }>('cases/lawyers').subscribe((res) => {
      this.lawyerOptions.set(res?.data ?? []);
    });
  }

  // ── Derived: cases after the lawyer filter ───────────────────────────────
  private filteredCases = computed<IDataCase[]>(() => {
    const id = this.selectedLawyerId();
    if (!id) return this.allCases();
    return this.allCases().filter(
      (c) => c.preferredLawyerId === id || c.consultantId === id,
    );
  });

  /** Cases bucketed by canonical Hijri session date. */
  private buckets = computed(() =>
    this.hijri.bucketBySession(this.filteredCases(), (c) => c.sessionHijriDate),
  );

  /** Count of (filtered) cases with no session date — surfaced as a note. */
  unscheduledCount = computed(
    () => this.filteredCases().filter((c) => !c.sessionHijriDate).length,
  );

  /** The 6×7 grid for the displayed month. */
  weeks = computed<HijriDayCell[][]>(() =>
    this.viewYear() && this.viewMonth()
      ? this.hijri.buildMonthGrid(this.viewYear(), this.viewMonth())
      : [],
  );

  /** Header label, e.g. "ذو الحجة 1447". */
  monthLabel = computed(() =>
    this.viewYear() && this.viewMonth()
      ? this.hijri.monthLabel(this.viewYear(), this.viewMonth())
      : '',
  );

  /** Decorated cases for a given day cell (Hijri key). */
  casesForDay(hijri: string): CalendarCase[] {
    const raw = this.buckets().get(hijri) ?? [];
    return raw.map((c) => this.decorate(c)).sort((a, b) => a.time.localeCompare(b.time));
  }

  private decorate(c: IDataCase): CalendarCase {
    const degree = CASE_DEGREE_OPTIONS.find((o) => o.value === c.caseDegree);
    const type = CASE_TYPE_OPTIONS.find((o) => o.value === (c.caseType as CaseType));
    const assignee =
      c.preferredLawyer?.name ?? c.preferredLawyerName ?? c.consultant?.name ?? c.consultantName ?? '';
    return {
      case: c,
      customerName: c.customer?.fullName ?? '',
      time: c.sessionTime ?? '',
      degreeLabel: degree?.label ?? '',
      caseTypeLabel: type?.label ?? '',
      assigneeName: assignee,
      color: degree?.color ?? NEUTRAL_DEGREE_COLOR,
    };
  }

  // ── Navigation ───────────────────────────────────────────────────────────
  prevMonth(): void {
    const { iYear, iMonth } = this.hijri.addMonths(this.viewYear(), this.viewMonth(), -1);
    this.viewYear.set(iYear);
    this.viewMonth.set(iMonth);
  }

  nextMonth(): void {
    const { iYear, iMonth } = this.hijri.addMonths(this.viewYear(), this.viewMonth(), 1);
    this.viewYear.set(iYear);
    this.viewMonth.set(iMonth);
  }

  goToday(): void {
    const today = this.hijri.todayParts();
    this.viewYear.set(today.iYear);
    this.viewMonth.set(today.iMonth);
  }

  onLawyerFilterChange(): void {
    // computed() reacts automatically; nothing to do beyond the signal set in template.
  }

  // ── Dialog ───────────────────────────────────────────────────────────────
  openCase(item: CalendarCase): void {
    this.selectedCase.set(item);
    this.showCaseDialog.set(true);
  }

  viewDetails(): void {
    const sel = this.selectedCase();
    if (!sel) return;
    this.showCaseDialog.set(false);
    this.router.navigate(['/dashboard/content/client-cases', sel.case.id, 'edit']);
  }
}
