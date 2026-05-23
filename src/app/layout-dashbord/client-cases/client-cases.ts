import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CASE_TYPE_OPTIONS, IDataCase } from '../../core/Models/case.model';
import { DashboardCrudPage } from '../dashboard-crud-page/dashboard-crud-page';
import { Data } from '../../core/Servies/data';

@Component({
  selector: 'app-client-cases',
  standalone: false,
  templateUrl: './client-cases.html',
  styleUrl: './client-cases.scss',
})
export class ClientCases implements OnInit {
  @ViewChild(DashboardCrudPage) crudPage!: DashboardCrudPage;

  constructor(
    private translate: TranslateService,
    private router: Router,
    private data: Data,
  ) {}

  columns: { key: string; value: string }[] = [];
  searchFields = ['customerName', 'caseTypeLabel', 'caseDate'];
  visibelform = signal<boolean>(false);

  get currentUser(): any {
    const raw = sessionStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }
  get role(): string { return this.currentUser?.role ?? ''; }
  get isLawyer(): boolean { return this.role === 'LAWYER'; }
  get isReceptionist(): boolean { return this.role === 'RECEPTIONIST'; }
  get canAssign(): boolean { return ['ADMIN', 'MODERATOR', 'RECEPTIONIST'].includes(this.role); }
  get canViewReports(): boolean { return ['ADMIN', 'MODERATOR', 'LAWYER'].includes(this.role); }

  dataMapper = (item: IDataCase, index: number) => ({
    ...item,
    index: index + 1,
    customerName: item.customer?.fullName ?? '',
    caseTypeLabel:
      CASE_TYPE_OPTIONS.find((o) => o.value === item.caseType)?.label ?? item.caseType,
    caseDateFormatted: item.caseDate ? new Date(item.caseDate).toLocaleDateString() : '',
    assignedLawyerName: item.preferredLawyerName ?? item.preferredLawyer?.name ?? '',
  });

  ngOnInit() {
    this.columns = [
      { key: '#', value: 'index' },
      { key: this.translate.instant('case_customer'), value: 'customerName' },
      { key: this.translate.instant('case_type'), value: 'caseTypeLabel' },
      { key: this.translate.instant('case_date'), value: 'caseDateFormatted' },
      { key: this.translate.instant('assigned_lawyer'), value: 'assignedLawyerName' },
      { key: this.translate.instant('assignment_status'), value: 'assignmentStatus' },
      { key: this.translate.instant('created_by'), value: 'createdBy.name' },
    ];
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
    this.data.patch<{ data: IDataCase }>(`cases/${item.id}/assignment/reject`, {}).subscribe({
      next: () => this.crudPage?.refresh(),
    });
  }
}
