import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DashboardCrudPage } from '../dashboard-crud-page/dashboard-crud-page';

@Component({
  selector: 'app-admins',
  standalone: false,
  templateUrl: './admins.html',
  styleUrl: './admins.scss',
})
export class Admins implements OnInit {
  @ViewChild(DashboardCrudPage) crudPage!: DashboardCrudPage;

  constructor(private translate: TranslateService) {}

  columns: { key: string; value: string }[] = [];
  searchFields = ['name', 'email', 'role', 'created_At', 'updated_At'];

  ngOnInit() {
    this.columns = [
      { key: '#', value: 'index' },
      { key: this.translate.instant('name'), value: 'name' },
      { key: this.translate.instant('email'), value: 'email' },
      { key: this.translate.instant('created_At'), value: 'createdAt' },
      { key: this.translate.instant('updated_At'), value: 'updatedAt' },
      { key: this.translate.instant('role'), value: 'role' },
    ];
  }
}
