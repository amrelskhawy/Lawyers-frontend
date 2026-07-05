import { Component, OnInit, signal, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CASE_DEGREE_OPTIONS, CASE_TYPE_OPTIONS, IDataCase } from '../../core/Models/case.model';
import { gregorianToPickerHijri } from '../../core/utils/hijri-format';
import { DashboardCrudPage } from '../dashboard-crud-page/dashboard-crud-page';

/**
 * Unscheduled cases — cases that have no session date/time set yet
 * (`sessionDate` is null on the backend). Backed by GET /cases/unscheduled,
 * restricted to ADMIN + MODERATOR, so staff can find them and schedule a session.
 *
 * A trimmed sibling of {@link ClientCases}: no degree cards, closed filter or
 * pending banner — just the list plus edit / schedule / delete actions.
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
}
