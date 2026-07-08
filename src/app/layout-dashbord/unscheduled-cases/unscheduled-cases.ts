import { Component, OnInit, signal, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CASE_DEGREE_OPTIONS, CASE_TYPE_OPTIONS, IDataCase } from '../../core/Models/case.model';
import { gregorianToPickerHijri } from '../../core/utils/hijri-format';
import { DashboardCrudPage, PageMeta } from '../dashboard-crud-page/dashboard-crud-page';

/**
 * Unscheduled cases — cases that have no session date/time set yet
 * (`sessionDate` is null on the backend). Backed by GET /cases/unscheduled.
 * ADMIN/MODERATOR see all; LAWYER/CONSULTANT see only their own (server-side).
 *
 * A trimmed sibling of {@link ClientCases}: no degree cards, closed filter or
 * pending banner — just the list plus edit / schedule / delete actions.
 * Delete is hidden for lawyers/consultants (DELETE /cases is admin/moderator-only).
 */
@Component({
  selector: 'app-unscheduled-cases',
  standalone: false,
  templateUrl: './unscheduled-cases.html',
  styleUrl: './unscheduled-cases.scss',
})
export class UnscheduledCases implements OnInit {
  @ViewChild(DashboardCrudPage) crudPage!: DashboardCrudPage;
  @ViewChild('consultantCell', { static: true }) consultantCell!: TemplateRef<any>;
  @ViewChild('lawyerCell', { static: true }) lawyerCell!: TemplateRef<any>;
  @ViewChild('degreeCell', { static: true }) degreeCell!: TemplateRef<any>;

  columnTemplates: { [columnValue: string]: TemplateRef<any> } = {};

  constructor(
    private translate: TranslateService,
    private router: Router,
  ) { }

  columns: { key: string; value: string; frozen?: boolean }[] = [];
  searchFields = [
    'customerName',
    'assignedConsultantName',
    'assignedLawyerName',
    'caseTypeLabel',
    'caseDegreeLabel',
    'caseDateFormatted',
    'otherCaseType',
  ];

  visibelReminders = signal<boolean>(false);
  selectedCase = signal<IDataCase | null>(null);

  /** Server-side filters merged into every unscheduled-cases request (e.g. ?caseDegree=…). */
  casesFilter = signal<{ [key: string]: any }>({});

  /** Neutral "card" for cases that have no degree set yet. */
  private static readonly UNASSIGNED_DEGREE = {
    value: 'UNASSIGNED',
    label: 'غير محدد',
    color: '#64748b',
    colorLight: '#94a3b8',
  };

  /** Per-degree counts for the summary/filter cards above the table (+ unassigned). */
  degreeCounts = signal<
    { value: string; label: string; color: string; colorLight: string; count: number }[]
  >([
    ...CASE_DEGREE_OPTIONS.map((o) => ({ ...o, count: 0 })),
    { ...UnscheduledCases.UNASSIGNED_DEGREE, count: 0 },
  ]);

  /** LAWYER/CONSULTANT: no delete action (DELETE /cases is admin/moderator-only). */
  get isLawyer(): boolean {
    const raw = sessionStorage.getItem('user');
    const role = raw ? JSON.parse(raw).role : '';
    return role === 'LAWYER' || role === 'CONSULTANT';
  }

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
    caseDateFormatted: item.caseDate ? gregorianToPickerHijri(item.caseDate) : '',
    assignedLawyerName: item.preferredLawyerName ?? item.preferredLawyer?.name ?? '',
    assignedConsultantName: item.consultantName ?? item.consultant?.name ?? '',
  });

  ngOnInit() {
    this.columns = [
      { key: '#', value: 'index' },
      { key: this.translate.instant('case_customer'), value: 'customerName', frozen: true },
      { key: this.translate.instant('case_type'), value: 'caseTypeLabel' },
      { key: this.translate.instant('other_case_type'), value: 'otherCaseType' },
      { key: this.translate.instant('case_degree'), value: 'caseDegreeLabel' },
      { key: this.translate.instant('case_date'), value: 'caseDateFormatted' },
      { key: this.translate.instant('assigned_consultant'), value: 'assignedConsultantName' },
      { key: this.translate.instant('assigned_lawyer'), value: 'assignedLawyerName' },
      { key: this.translate.instant('created_by'), value: 'createdBy.name' },
    ];
    this.columnTemplates = {
      assignedConsultantName: this.consultantCell,
      assignedLawyerName: this.lawyerCell,
      caseDegreeLabel: this.degreeCell,
    };
  }

  /** Edit takes the user to the case editor, where a session can be scheduled. */
  onEditCase(item: IDataCase) {
    this.router.navigate(['/dashboard/content/client-cases', item.id, 'edit']);
  }

  /** Open the reminders dialog to schedule a session for this case. */
  onManageReminders(item: IDataCase) {
    this.selectedCase.set(item);
    this.visibelReminders.set(true);
  }

  /** A session/degree was saved from the dialog — reload so the case drops off
   *  the unscheduled list once it has a session date. */
  onCaseUpdated() {
    this.crudPage?.refresh();
  }

  /** Refresh the per-degree card counts after every list load. */
  onCasesMeta(meta: PageMeta | null) {
    if (!meta) return;
    const dc: Record<string, number> = meta['degreeCounts'] ?? {};
    this.degreeCounts.set([
      ...CASE_DEGREE_OPTIONS.map((o) => ({ ...o, count: dc[o.value] ?? 0 })),
      { ...UnscheduledCases.UNASSIGNED_DEGREE, count: dc['UNASSIGNED'] ?? 0 },
    ]);
  }

  /**
   * Clicking a degree card filters the table to that litigation degree; clicking
   * the already-active card toggles the filter back off.
   */
  toggleDegreeFilter(value: string) {
    const next = { ...this.casesFilter() };
    if (next['caseDegree'] === value) {
      delete next['caseDegree'];
    } else {
      next['caseDegree'] = value;
    }
    this.casesFilter.set(next);
  }

  /** Whether a given degree card is the one currently filtering the table. */
  isDegreeActive(value: string): boolean {
    return this.casesFilter()['caseDegree'] === value;
  }
}
