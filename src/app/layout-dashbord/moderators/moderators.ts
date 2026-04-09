import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DashboardCrudPage } from '../dashboard-crud-page/dashboard-crud-page';

@Component({
  selector: 'app-moderators',
  standalone: false,
  templateUrl: './moderators.html',
  styleUrl: './moderators.scss',
})
export class Moderators implements OnInit {
  @ViewChild(DashboardCrudPage) crudPage!: DashboardCrudPage;

  constructor(private translate: TranslateService) {}

  columns: { key: string; value: string }[] = [];
  searchFields = ['name', 'email', 'createdAt', 'role'];
  visibelform = signal<boolean>(false);

  ngOnInit() {
    this.columns = [
      { key: '#', value: 'index' },
      { key: this.translate.instant('name'), value: 'name' },
      { key: this.translate.instant('email'), value: 'email' },
      { key: this.translate.instant('created_At'), value: 'createdAt' },
      { key: this.translate.instant('role'), value: 'role' },
    ];
  }

  HandelResponseSuccess() {
    this.crudPage.loadData();
    this.visibelform.set(false);
  }
}
