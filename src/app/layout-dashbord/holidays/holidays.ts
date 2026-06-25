import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DashboardCrudPage } from '../dashboard-crud-page/dashboard-crud-page';
import { IColumn } from '../types/shared';

@Component({
  selector: 'app-holidays',
  standalone: false,
  templateUrl: './holidays.html',
  styleUrl: './holidays.scss',
})
export class Holidays implements OnInit {
  @ViewChild(DashboardCrudPage) crudPage!: DashboardCrudPage;

  constructor(private translate: TranslateService) { }

  columns: IColumn[] = [];
  searchFields = ['date', 'endTime', 'startTime', 'name'];
  visibelform = signal<boolean>(false);

  ngOnInit() {
    this.columns = [
      { key: '#', value: 'index' },
      { key: this.translate.instant('name'), value: 'name', frozen: true },
      { key: this.translate.instant('date'), value: 'date' },
      { key: this.translate.instant('startTime'), value: 'startTime' },
      { key: this.translate.instant('endTime'), value: 'endTime' },
    ];
  }

  onHandelResponseSuccess() {
    this.crudPage.loadData();
  }
}
