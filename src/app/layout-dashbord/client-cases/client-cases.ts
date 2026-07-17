import { Component, OnInit, signal, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CaseAssignmentStatus, CASE_DEGREE_OPTIONS, CASE_TYPE_OPTIONS, IDataCase } from '../../core/Models/case.model';
import { canonicalToPickerHijri, gregorianToPickerHijri } from '../../core/utils/hijri-format';
import { format12h } from '../../core/utils/time-format';
import { DashboardCrudPage, PageMeta } from '../dashboard-crud-page/dashboard-crud-page';
import { Data } from '../../core/Servies/data';
import { SoundService } from '../../core/Servies/sound';

@Component({
  selector: 'app-client-cases',
  standalone: false,
  templateUrl: './client-cases.html',
  styleUrl: './client-cases.scss',
})
export class ClientCases implements OnInit {
  @ViewChild(DashboardCrudPage) crudPage!: DashboardCrudPage;
  @ViewChild('consultantCell', { static: true }) consultantCell!: TemplateRef<any>;
  @ViewChild('lawyerCell', { static: true }) lawyerCell!: TemplateRef<any>;
  @ViewChild('degreeCell', { static: true }) degreeCell!: TemplateRef<any>;
  @ViewChild('closedCell', { static: true }) closedCell!: TemplateRef<any>;

  columnTemplates: { [columnValue: string]: TemplateRef<any> } = {};

  constructor(
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private data: Data,
    private sound: SoundService,
  ) { }

  /** Server-side filters merged into every cases request (e.g. ?lawyerId=… from the Users page). */
  casesFilter = signal<{ [key: string]: any }>({});
  /** Display name of the user whose cases we're filtered to (drives the "filtered by" banner). */
  filterAssigneeName = signal<string>('');
  /** Degree label when the filter also narrows to a single litigation degree. */
  filterDegreeLabel = signal<string>('');

  /** Guards the pending-assignment chime so it fires only on the first page load,
   *  not on the silent refreshes that follow an accept/reject. */
  private firstLoad = true;
  /** How many cases in the current user's slot are still awaiting accept/reject.
   *  Drives the always-visible banner (the chime can be blocked by the browser). */
  pendingCount = signal<number>(0);

  /** Neutral "card" for cases that have no degree set yet. */
  private static readonly UNASSIGNED_DEGREE = {
    value: 'UNASSIGNED',
    label: 'غير محدد',
    color: '#64748b',
    colorLight: '#94a3b8',
  };

  /** Per-degree case counts for the summary cards above the table (+ unassigned). */
  degreeCounts = signal<
    { value: string; label: string; color: string; colorLight: string; count: number }[]
  >([
    ...CASE_DEGREE_OPTIONS.map((o) => ({ ...o, count: 0 })),
    { ...ClientCases.UNASSIGNED_DEGREE, count: 0 },
  ]);

  /** Count of cases marked fully completed (completedAt IS NOT NULL). */
  closedCount = signal<number>(0);

  columns: { key: string; value: string; frozen?: boolean }[] = [];
  searchFields = [
    'customerName',
    'assignedConsultantName',
    'assignedLawyerName',
    'caseTypeLabel',
    'caseDegreeLabel',
    'caseDate',
    'nextSessionDateFormatted',
    'otherCaseType'
  ];
  visibelform = signal<boolean>(false);
  visibelReminders = signal<boolean>(false);
  visibelReject = signal<boolean>(false);
  selectedCase = signal<IDataCase | null>(null);
  rejectTarget = signal<IDataCase | null>(null);

  get currentUser(): any {
    const raw = sessionStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }
  get role(): string { return this.currentUser?.role ?? ''; }
  // "isLawyer" historically means "an assignee role" (lawyer OR consultant) — kept for
  // shared gating (add button, delete, reports). Slot-specific logic uses mySlotStatus().
  get isLawyer(): boolean { return this.role === 'LAWYER' || this.role === 'CONSULTANT'; }
  get isConsultantRole(): boolean { return this.role === 'CONSULTANT'; }
  get isReceptionist(): boolean { return this.role === 'RECEPTIONIST'; }

  /**
   * The assignment status of the slot the current user owns:
   * a CONSULTANT acts on the consultant slot, a LAWYER on the lawyer slot.
   * Staff roles own no slot, so this returns null for them.
   */
  mySlotStatus(item: IDataCase): CaseAssignmentStatus | null {
    if (this.role === 'CONSULTANT') return item.consultantAssignmentStatus ?? 'UNASSIGNED';
    if (this.role === 'LAWYER') return item.assignmentStatus ?? 'UNASSIGNED';
    return null;
  }
  get canAssign(): boolean { return ['ADMIN', 'MODERATOR', 'RECEPTIONIST'].includes(this.role); }
  get canViewReports(): boolean { return ['ADMIN', 'MODERATOR', 'LAWYER', 'CONSULTANT'].includes(this.role); }
  get canManageFeesContract(): boolean { return ['ADMIN', 'MODERATOR'].includes(this.role); }

  dataMapper = (item: IDataCase, index: number) => ({
    ...item,
    index: index + 1,
    customerName: item.customer?.fullName ?? '',
    caseTypeLabel:
      CASE_TYPE_OPTIONS.find((o) => o.value === item.caseType)?.label ?? item.caseType,
    caseDegreeLabel: item.caseDegree === 'OTHER' && item.otherDegreeText
      ? item.otherDegreeText
      : (CASE_DEGREE_OPTIONS.find((o) => o.value === item.caseDegree)?.label ?? ''),
    caseDegreeColor:
      CASE_DEGREE_OPTIONS.find((o) => o.value === item.caseDegree)?.color ?? '',
    nextSessionDateFormatted: this.formatNextSessionDate(item),
    assignedLawyerName: item.preferredLawyerName ?? item.preferredLawyer?.name ?? '',
    assignedConsultantName: item.consultantName ?? item.consultant?.name ?? '',
    // A case is "closed" once it's marked fully completed (completedAt set).
    isClosed: !!item.completedAt,
  });

  /** "1448 / 01 / 09 - 9:00 AM" — Hijri session date plus the 12h session time. */
  private formatNextSessionDate(item: IDataCase): string {
    const date = item.sessionHijriDate
      ? canonicalToPickerHijri(item.sessionHijriDate)
      : item.sessionDate
        ? gregorianToPickerHijri(item.sessionDate)
        : '';
    if (!date) return '';
    return item.sessionTime ? `${date} - ${format12h(item.sessionTime)}` : date;
  }

  ngOnInit() {
    // Fixed server-side filter carried on the route data — splits this same table
    // into "Client Cases" (isRealCustomer=true) and "Customer Meetings" (=false).
    // Always applied, and merged under any user filter picked up below.
    const fixedFilter: { [key: string]: any } = this.route.snapshot.data['fixedFilter'] ?? {};

    // Pick up a user filter handed over from the Users page (?lawyerId=…). Read
    // synchronously here (parent ngOnInit runs before the crud-page child's first
    // fetch) so the very first load is already scoped to that user.
    const lawyerId = this.route.snapshot.queryParamMap.get('lawyerId');
    if (lawyerId) {
      const filter: { [key: string]: any } = { ...fixedFilter, lawyerId };
      // Optional degree scope, e.g. when a per-degree badge was clicked.
      const caseDegree = this.route.snapshot.queryParamMap.get('caseDegree');
      if (caseDegree) {
        filter['caseDegree'] = caseDegree;
        this.filterDegreeLabel.set(this.degreeLabelFor(caseDegree));
      }
      // Optional closed-only scope, e.g. when the Users page "closed cases" badge was clicked.
      if (this.route.snapshot.queryParamMap.get('onlyClosed') === 'true') {
        filter['onlyClosed'] = 'true';
      }
      this.casesFilter.set(filter);
      this.filterAssigneeName.set(this.route.snapshot.queryParamMap.get('assigneeName') ?? '');
    } else if (Object.keys(fixedFilter).length) {
      this.casesFilter.set({ ...fixedFilter });
    }

    this.columns = [
      { key: '#', value: 'index' },
      { key: this.translate.instant('case_customer'), value: 'customerName', frozen: true },
      { key: this.translate.instant('case_type'), value: 'caseTypeLabel' },
      { key: this.translate.instant('other_case_type'), value: 'otherCaseType' },
      { key: this.translate.instant('case_degree'), value: 'caseDegreeLabel' },
      // Single "next session date + time" column (Hijri), replacing the former
      // Gregorian meeting-date + standalone Hijri session-date columns.
      { key: this.translate.instant('next_session'), value: 'nextSessionDateFormatted' },
      { key: this.translate.instant('assigned_consultant'), value: 'assignedConsultantName' },
      { key: this.translate.instant('assigned_lawyer'), value: 'assignedLawyerName' },
      { key: this.translate.instant('case_state'), value: 'isClosed' },
      { key: this.translate.instant('created_by'), value: 'createdBy.name' },
    ];
    // Render the consultant/lawyer columns as "name + own-status badge" cells.
    this.columnTemplates = {
      assignedConsultantName: this.consultantCell,
      assignedLawyerName: this.lawyerCell,
      caseDegreeLabel: this.degreeCell,
      isClosed: this.closedCell,
    };
  }

  /**
   * Runs after every list load/refresh. The summary cards and pending banner are
   * computed server-side over the whole (filtered) set — not just the current page —
   * and delivered in the pagination `meta`. On the first load we chime once if the
   * current user still has pending assignments.
   */
  onCasesMeta(meta: PageMeta | null) {
    if (!meta) return;

    const dc: Record<string, number> = meta['degreeCounts'] ?? {};
    this.degreeCounts.set([
      ...CASE_DEGREE_OPTIONS.map((o) => ({ ...o, count: dc[o.value] ?? 0 })),
      { ...ClientCases.UNASSIGNED_DEGREE, count: dc['UNASSIGNED'] ?? 0 },
    ]);
    this.closedCount.set(meta['closedCount'] ?? 0);

    const pending: number = meta['pendingCount'] ?? 0;
    this.pendingCount.set(pending);

    if (this.firstLoad) {
      this.firstLoad = false;
      if (pending > 0) this.sound.playChime();
    }
  }

  private degreeLabelFor(value: string): string {
    if (value === ClientCases.UNASSIGNED_DEGREE.value) return ClientCases.UNASSIGNED_DEGREE.label;
    return CASE_DEGREE_OPTIONS.find((o) => o.value === value)?.label ?? '';
  }

  /**
   * Clicking a degree summary card filters the table to that litigation degree.
   * Clicking the already-active card toggles the degree filter back off. Any
   * user (lawyerId) filter already in effect is preserved.
   */
  toggleDegreeFilter(value: string) {
    const next = { ...this.casesFilter() };
    if (next['caseDegree'] === value) {
      delete next['caseDegree'];
      this.filterDegreeLabel.set('');
    } else {
      next['caseDegree'] = value;
      this.filterDegreeLabel.set(this.degreeLabelFor(value));
      // Clear closed filter when switching to a degree filter.
      delete next['onlyClosed'];
    }
    this.casesFilter.set(next);
  }

  /** Whether a given degree card is the one currently filtering the table. */
  isDegreeActive(value: string): boolean {
    return this.casesFilter()['caseDegree'] === value;
  }

  /** Toggle filter to show only closed (completed) cases. */
  toggleClosedFilter() {
    const next = { ...this.casesFilter() };
    if (next['onlyClosed']) {
      delete next['onlyClosed'];
    } else {
      next['onlyClosed'] = 'true';
      // Clear degree filter when switching to closed view.
      delete next['caseDegree'];
      this.filterDegreeLabel.set('');
    }
    this.casesFilter.set(next);
  }

  get isClosedFilterActive(): boolean {
    return !!this.casesFilter()['onlyClosed'];
  }

  /** Return to the Users page we were filtered from (the banner only shows when
   *  we arrived there via a user badge). */
  goBackToUsers() {
    this.router.navigate(['/dashboard/content/users']);
  }

  /** Drop the user/degree filters and reload — but keep the route's fixed
   *  split filter (isRealCustomer) so the list stays on its own view. */
  clearUserFilter() {
    const fixedFilter: { [key: string]: any } = this.route.snapshot.data['fixedFilter'] ?? {};
    this.casesFilter.set({ ...fixedFilter });
    this.filterAssigneeName.set('');
    this.filterDegreeLabel.set('');
    // (onlyClosed is inside casesFilter, cleared by the reset above)
    // Strip the query params from the URL so a refresh/back doesn't re-apply the filter.
    this.router.navigate([], { relativeTo: this.route, queryParams: {} });
  }

  onEditCase(item: IDataCase) {
    this.router.navigate(['/dashboard/content/client-cases', item.id, 'edit']);
  }

  onCreateSessionReport(item: IDataCase) {
    this.router.navigate(['/dashboard/content/session-reports', item.id]);
  }

  onCreateFieldVisitReport(item: IDataCase) {
    this.router.navigate(['/dashboard/content/field-visit-report', item.id]);
  }

  onCreateLawyerFeesContract(item: IDataCase) {
    this.router.navigate(['/dashboard/content/lawyer-fees-contract/case', item.id]);
  }

  onManageReminders(item: IDataCase) {
    this.selectedCase.set(item);
    this.visibelReminders.set(true);
  }

  /** The reminders dialog changed the case (e.g. degree saved) — refresh the table. */
  onCaseUpdated() {
    this.crudPage?.refresh();
  }

  onCreated(newCase: IDataCase) {
    this.visibelform.set(false);
    this.router.navigate(['/dashboard/content/client-cases', newCase.id, 'edit']);
  }

  acceptAssignment(item: IDataCase, event: Event) {
    event.stopPropagation();
    this.data.patch<{ data: IDataCase }>(`cases/${item.id}/assignment/accept`, {}).subscribe({
      next: () => this.crudPage?.refresh(),
    });
  }

  rejectAssignment(item: IDataCase, event: Event) {
    event.stopPropagation();
    this.rejectTarget.set(item);
    this.visibelReject.set(true);
  }

  onRejectConfirmed(reason: string) {
    const item = this.rejectTarget();
    if (!item || !reason) return;
    this.data.patch<{ data: IDataCase }>(`cases/${item.id}/assignment/reject`, { reason }).subscribe({
      next: () => this.crudPage?.refresh(),
    });
  }
}
