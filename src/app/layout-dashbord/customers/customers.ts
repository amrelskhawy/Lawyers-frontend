import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IDataCustomer } from '../../core/Models/customers.model';
import { DashboardCrudPage } from '../dashboard-crud-page/dashboard-crud-page';

@Component({
  selector: 'app-customers',
  standalone: false,
  templateUrl: './customers.html',
  styleUrl: './customers.scss',
})
export class Customers implements OnInit {
  @ViewChild(DashboardCrudPage) crudPage!: DashboardCrudPage;

  constructor(private translate: TranslateService) {}

  columns: { key: string; value: string }[] = [];
  searchFields = ['fullName', 'email', 'phone', 'location'];
  objdata = signal<IDataCustomer | null>(null);
  visibelform = signal<boolean>(false);
  visibelAllData = signal<boolean>(false);

  ngOnInit() {
    this.columns = [
      { key: '#', value: 'index' },
      { key: this.translate.instant('full_name'), value: 'fullName' },
      { key: this.translate.instant('email'), value: 'email' },
      { key: this.translate.instant('phone'), value: 'phone' },
      { key: this.translate.instant('location'), value: 'location' },
      { key: 'created_At', value: 'createdAt' },
    ];
  }

  onEditData(item: IDataCustomer) {
    this.visibelform.set(true);
    this.objdata.set(item);
  }

  onViewData(item: IDataCustomer) {
    this.objdata.set(item);
    this.visibelAllData.set(true);
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
