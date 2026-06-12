import { Component, OnInit, signal, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  CaseAssignmentStatus,
  CASE_DEGREE_OPTIONS,
  CASE_TYPE_OPTIONS,
  IDataCase,
} from '../../core/Models/case.model';
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

  columnTemplates: { [columnValue: string]: TemplateRef<any> } = {};

  constructor(
    private translate: TranslateService,
    private router: Router,
    private data: Data,
    private sound: SoundService,
  ) {}

  /** Guards the pending-assignment chime so it fires only on the first page load,
   *  not on the silent refreshes that follow an accept/reject. */
  private firstLoad = true;
  /** How many cases in the current user's slot are still awaiting accept/reject.
   *  Drives the always-visible banner (the chime can be blocked by the browser). */
  pendingCount = signal<number>(0);

  /** Neutral "card" for cases that have no degree set yet. */
  private static readonly UNASSIGNED_DEGREE = {
    label: 'غير محدد',
    color: '#64748b',
    colorLight: '#94a3b8',
  };

  /** Per-degree case counts for the summary cards above the table (+ unassigned). */
  degreeCounts = signal<{ label: string; color: string; colorLight: string; count: number }[]>([
    ...CASE_DEGREE_OPTIONS.map((o) => ({ ...o, count: 0 })),
    { ...ClientCases.UNASSIGNED_DEGREE, count: 0 },
  ]);

  columns: { key: string; value: string }[] = [];
  searchFields = [
    'customerName',
    'assignedConsultantName',
    'assignedLawyerName',
    'caseTypeLabel',
    'caseDegreeLabel',
    'caseDate',
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
    caseDegreeLabel:
      CASE_DEGREE_OPTIONS.find((o) => o.value === item.caseDegree)?.label ?? '',
    caseDegreeColor:
      CASE_DEGREE_OPTIONS.find((o) => o.value === item.caseDegree)?.color ?? '',
    caseDateFormatted: item.caseDate ? new Date(item.caseDate).toLocaleDateString() : '',
    assignedLawyerName: item.preferredLawyerName ?? item.preferredLawyer?.name ?? '',
    assignedConsultantName: item.consultantName ?? item.consultant?.name ?? '',
  });

  ngOnInit() {
    this.columns = [
      { key: '#', value: 'index' },
      { key: this.translate.instant('case_customer'), value: 'customerName' },
      { key: this.translate.instant('case_type'), value: 'caseTypeLabel' },
      { key: this.translate.instant('case_degree'), value: 'caseDegreeLabel' },
      { key: this.translate.instant('case_date'), value: 'caseDateFormatted' },
      { key: this.translate.instant('assigned_consultant'), value: 'assignedConsultantName' },
      { key: this.translate.instant('assigned_lawyer'), value: 'assignedLawyerName' },
      { key: this.translate.instant('created_by'), value: 'createdBy.name' },
    ];
    // Render the consultant/lawyer columns as "name + own-status badge" cells.
    this.columnTemplates = {
      assignedConsultantName: this.consultantCell,
      assignedLawyerName: this.lawyerCell,
      caseDegreeLabel: this.degreeCell,
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

    const pending: number = meta['pendingCount'] ?? 0;
    this.pendingCount.set(pending);

    if (this.firstLoad) {
      this.firstLoad = false;
      if (pending > 0) this.sound.playChime();
    }
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
