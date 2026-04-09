import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DashboardCrudPage } from '../dashboard-crud-page/dashboard-crud-page';

@Component({
  selector: 'app-organizers',
  standalone: false,
  templateUrl: './organizers.html',
  styleUrl: './organizers.scss',
})
export class Organizers implements OnInit {
  @ViewChild(DashboardCrudPage) crudPage!: DashboardCrudPage;

  constructor(private translate: TranslateService) {}

  columns: { key: string; value: string }[] = [];
  searchFields = ['userName', 'userEmail', 'userRole', 'isActiveLabel'];
  visibelform = signal<boolean>(false);

  ngOnInit() {
    this.columns = [
      { key: '#', value: 'index' },
      { key: this.translate.instant('name'), value: 'userName' },
      { key: this.translate.instant('email'), value: 'userEmail' },
      { key: this.translate.instant('role'), value: 'userRole' },
      { key: this.translate.instant('status'), value: 'isActiveLabel' },
      { key: this.translate.instant('created_At'), value: 'createdAt' },
    ];
  }

  dataMapper = (item: any, index: number) => ({
    ...item,
    index: index + 1,
    userName: item.user?.name || '',
    userEmail: item.user?.email || '',
    userRole: item.user?.role || '',
    isActiveLabel: item.isActive
      ? this.translate.instant('active')
      : this.translate.instant('inactive'),
  });

  HandelResponseSuccess() {
    this.crudPage.loadData();
    this.visibelform.set(false);
  }
}
