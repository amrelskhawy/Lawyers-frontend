import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Data } from '../../../core/Servies/data';
import { DashboardCrudPage } from '../../dashboard-crud-page/dashboard-crud-page';
import { IColumn } from '../../types/shared';
import { IConsultingRecord, IConsultingSummary } from '../../../core/Models/consulting.model';

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

@Component({
  selector: 'app-consulting-list',
  standalone: false,
  templateUrl: './consulting-list.html',
  styleUrl: './consulting-list.scss',
})
export class ConsultingList implements OnInit {
  @ViewChild(DashboardCrudPage) crudPage!: DashboardCrudPage;

  constructor(
    private translate: TranslateService,
    private data: Data,
  ) {}

  readonly months = MONTHS;

  columns: IColumn[] = [];
  searchFields = ['clientName', 'type'];

  objdata = signal<IConsultingRecord | null>(null);
  visibelform = signal<boolean>(false);

  /** null = every year / the whole year, matching the Financials period picker. */
  years = signal<number[]>([]);
  year = signal<number | null>(null);
  month = signal<number | null>(null);
  summary = signal<IConsultingSummary | null>(null);

  extraParams = signal<Record<string, unknown>>({});

  dataMapper = (item: IConsultingRecord, index: number) => ({
    ...item,
    index: index + 1,
    valueFormatted: item.value + ' ﷼',
    dateFormatted: item.date ? item.date.slice(0, 10) : '—',
  });

  ngOnInit() {
    this.columns = [
      { key: '#', value: 'index' },
      { key: this.translate.instant('client_name'), value: 'clientName', frozen: true },
      { key: this.translate.instant('consulting_date'), value: 'dateFormatted' },
      { key: this.translate.instant('consulting_value'), value: 'valueFormatted' },
      { key: this.translate.instant('consulting_type'), value: 'type' },
    ];

    this.loadYears();
    this.loadSummary();
  }

  private loadYears() {
    this.data.get<{ data: number[] }>('consulting/years').subscribe({
      next: (res) => this.years.set(res.data ?? []),
    });
  }

  loadSummary() {
    this.data
      .get<{ data: IConsultingSummary }>('consulting/summary', {
        year: this.year() ?? undefined,
        month: this.month() ?? undefined,
      })
      .subscribe({
        next: (res) => this.summary.set(res.data),
        error: () => this.summary.set(null),
      });
  }

  /** The table's own (loaded) event re-fetches the summary once the period change lands. */
  private applyPeriodFilter() {
    this.extraParams.set({
      year: this.year() ?? undefined,
      month: this.month() ?? undefined,
    });
  }

  setYear(year: number | null) {
    this.year.set(year);
    this.month.set(null);
    this.applyPeriodFilter();
  }

  setMonth(month: number | null) {
    this.month.set(this.month() === month ? null : month);
    this.applyPeriodFilter();
  }

  onAddNew() {
    this.objdata.set(null);
    this.visibelform.set(true);
  }

  onEditData(item: IConsultingRecord) {
    this.objdata.set(item);
    this.visibelform.set(true);
  }

  onHandelRespnseProccing() {
    this.visibelform.set(false);
    this.objdata.set(null);
    this.crudPage.loadData();
  }

  ResetForm() {
    this.objdata.set(null);
  }
}
