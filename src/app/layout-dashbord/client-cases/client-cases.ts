import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CASE_TYPE_OPTIONS, IDataCase } from '../../core/Models/case.model';
import { DashboardCrudPage } from '../dashboard-crud-page/dashboard-crud-page';

@Component({
  selector: 'app-client-cases',
  standalone: false,
  templateUrl: './client-cases.html',
  styleUrl: './client-cases.scss',
})
export class ClientCases implements OnInit {
  @ViewChild(DashboardCrudPage) crudPage!: DashboardCrudPage;

  constructor(private translate: TranslateService, private router: Router) {}

  columns: { key: string; value: string }[] = [];
  searchFields = ['customerName', 'caseTypeLabel', 'caseDate'];
  visibelform = signal<boolean>(false);

  // Map raw API row → table-friendly row (flattens customer + translates enum)
  dataMapper = (item: IDataCase, index: number) => ({
    ...item,
    index: index + 1,
    customerName: item.customer?.fullName ?? '',
    caseTypeLabel:
      CASE_TYPE_OPTIONS.find((o) => o.value === item.caseType)?.label ?? item.caseType,
    caseDateFormatted: item.caseDate ? new Date(item.caseDate).toLocaleDateString() : '',
  });

  ngOnInit() {
    this.columns = [
      { key: '#', value: 'index' },
      { key: this.translate.instant('case_customer'), value: 'customerName' },
      { key: this.translate.instant('case_type'), value: 'caseTypeLabel' },
      { key: this.translate.instant('case_date'), value: 'caseDateFormatted' },
      { key: this.translate.instant('created_by'), value: 'createdBy.name' },
      { key: 'created_At', value: 'createdAt' },
    ];
  }

  onEditCase(item: IDataCase) {
    this.router.navigate(['/dashboard/content/client-cases', item.id, 'edit']);
  }

  onCreateSessionReport(item: IDataCase) {
    this.router.navigate(['/dashboard/content/session-report', item.id]);
  }

  onCreated(newCase: IDataCase) {
    this.visibelform.set(false);
    this.router.navigate(['/dashboard/content/client-cases', newCase.id, 'edit']);
  }
}
