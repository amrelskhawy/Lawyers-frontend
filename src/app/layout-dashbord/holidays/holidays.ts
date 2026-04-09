import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DashboardCrudPage } from '../dashboard-crud-page/dashboard-crud-page';

@Component({
  selector: 'app-holidays',
  standalone: false,
  templateUrl: './holidays.html',
  styleUrl: './holidays.scss',
})
export class Holidays implements OnInit {
  @ViewChild(DashboardCrudPage) crudPage!: DashboardCrudPage;

  constructor(private translate: TranslateService) {}

  columns: { key: string; value: string }[] = [];
  searchFields = ['date', 'endTime', 'startTime', 'name'];
  visibelform = signal<boolean>(false);

  ngOnInit() {
    this.columns = [
      { key: '#', value: 'index' },
      { key: this.translate.instant('name'), value: 'name' },
      { key: this.translate.instant('date'), value: 'date' },
      { key: this.translate.instant('startTime'), value: 'startTime' },
      { key: this.translate.instant('endTime'), value: 'endTime' },
    ];
  }

  onHandelResponseSuccess() {
    this.crudPage.loadData();
  }
}
