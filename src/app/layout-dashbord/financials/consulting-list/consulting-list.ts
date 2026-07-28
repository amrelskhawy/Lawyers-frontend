import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DashboardCrudPage } from '../../dashboard-crud-page/dashboard-crud-page';
import { IColumn } from '../../types/shared';
import { IConsultingRecord } from '../../../core/Models/consulting.model';

@Component({
  selector: 'app-consulting-list',
  standalone: false,
  templateUrl: './consulting-list.html',
  styleUrl: './consulting-list.scss',
})
export class ConsultingList implements OnInit {
  @ViewChild(DashboardCrudPage) crudPage!: DashboardCrudPage;

  constructor(private translate: TranslateService) {}

  columns: IColumn[] = [];
  searchFields = ['clientName', 'type'];

  objdata = signal<IConsultingRecord | null>(null);
  visibelform = signal<boolean>(false);

  dateFrom = signal<string | null>(null);
  dateTo = signal<string | null>(null);
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
  }

  onDateFromChange(value: string) {
    this.dateFrom.set(value || null);
    this.applyDateFilter();
  }

  onDateToChange(value: string) {
    this.dateTo.set(value || null);
    this.applyDateFilter();
  }

  private applyDateFilter() {
    this.extraParams.set({
      dateFrom: this.dateFrom() ?? undefined,
      dateTo: this.dateTo() ?? undefined,
    });
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
