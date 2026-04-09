import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IDataServies } from '../../core/Models/servies.model';
import { DashboardCrudPage } from '../dashboard-crud-page/dashboard-crud-page';

@Component({
  selector: 'app-add-servies',
  standalone: false,
  templateUrl: './add-servies.html',
  styleUrl: './add-servies.scss',
})
export class AddServies implements OnInit {
  @ViewChild(DashboardCrudPage) crudPage!: DashboardCrudPage;

  constructor(private translate: TranslateService) {}

  columns: { key: string; value: string }[] = [];
  searchFields = [
    'name_ar',
    'name_en',
    'description_ar',
    'description_en',
    'priceFormatted',
  ];
  objdata = signal<IDataServies | null>(null);
  visibelform = signal<boolean>(false);
  visibelAllData = signal<boolean>(false);

  dataMapper = (item: any, index: number) => ({
    ...item,
    index: index + 1,
    priceFormatted: item.price + ' ﷼',
  });

  ngOnInit() {
    this.columns = [
      { key: '#', value: 'index' },
      { key: this.translate.instant('name_ar'), value: 'name_ar' },
      { key: this.translate.instant('name_en'), value: 'name_en' },
      { key: this.translate.instant('description_ar'), value: 'description_ar' },
      { key: this.translate.instant('description_en'), value: 'description_en' },
      { key: 'created_At', value: 'createdAt' },
      { key: this.translate.instant('price'), value: 'priceFormatted' },
    ];
  }

  onEditData(item: IDataServies) {
    this.visibelform.set(true);
    this.objdata.set(item);
  }

  onViewData(item: IDataServies) {
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
