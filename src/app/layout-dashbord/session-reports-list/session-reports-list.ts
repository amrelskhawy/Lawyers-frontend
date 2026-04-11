import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DashboardCrudPage } from '../dashboard-crud-page/dashboard-crud-page';
import { IDataSessionReport } from '../../core/Models/session-report.model';

@Component({
  selector: 'app-session-reports-list',
  standalone: false,
  templateUrl: './session-reports-list.html',
  styleUrl: './session-reports-list.scss',
})
export class SessionReportsList implements OnInit {
  @ViewChild(DashboardCrudPage) crudPage!: DashboardCrudPage;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
  ) {}

  caseId = signal<string>('');
  endpoint = signal<string>('');
  columns: { key: string; value: string }[] = [];
  searchFields = ['reportNumber', 'courtName', 'caseNumber', 'sessionDateFormatted'];

  dataMapper = (item: IDataSessionReport, index: number) => ({
    ...item,
    index: index + 1,
    reportNumberDisplay:
      item.reportNumber ?? (item.id ? item.id.slice(0, 4).toUpperCase() : ''),
    sessionDateFormatted: item.sessionDate
      ? new Date(item.sessionDate).toLocaleDateString()
      : '—',
    createdAtFormatted: item.createdAt
      ? new Date(item.createdAt).toLocaleDateString()
      : '',
    statusLabel: item.sentToClientAt
      ? this.translate.instant('sent')
      : this.translate.instant('draft'),
  });

  ngOnInit() {
    const caseId = this.route.snapshot.paramMap.get('caseId') ?? '';
    this.caseId.set(caseId);
    this.endpoint.set(`session-reports/by-case/${caseId}`);

    this.columns = [
      { key: '#', value: 'index' },
      { key: this.translate.instant('report_number'), value: 'reportNumberDisplay' },
      { key: this.translate.instant('court_name'), value: 'courtName' },
      { key: this.translate.instant('case_number'), value: 'caseNumber' },
      { key: this.translate.instant('session_date'), value: 'sessionDateFormatted' },
      { key: this.translate.instant('status'), value: 'statusLabel' },
      { key: this.translate.instant('created_at'), value: 'createdAtFormatted' },
    ];
  }

  onEdit(item: IDataSessionReport) {
    this.router.navigate([
      '/dashboard/content/session-report',
      this.caseId(),
      item.id,
    ]);
  }

  onAddNew() {
    this.router.navigate([
      '/dashboard/content/session-report',
      this.caseId(),
      'new',
    ]);
  }

  back() {
    this.router.navigate(['/dashboard/content/client-cases']);
  }

  onHandelResponseSuccess() {
    this.crudPage?.loadData();
  }
}
