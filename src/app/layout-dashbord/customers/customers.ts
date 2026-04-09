import { Component, OnInit, signal } from '@angular/core';
import { Data } from '../../core/Servies/data';
import { TranslateService } from '@ngx-translate/core';
import { IDataCustomer } from '../../core/Models/customers.model';

@Component({
  selector: 'app-customers',
  standalone: false,
  templateUrl: './customers.html',
  styleUrl: './customers.scss',
})
export class Customers implements OnInit {
  ngOnInit(): void {
    this.GetAllData();
    this.getDataTabel();
  }

  constructor(
    private Data: Data,
    private translate: TranslateService,
  ) {}

  data = signal<any[]>([]);
  allData = signal<any[]>([]);
  objdata = signal<IDataCustomer | null>(null);
  visibelform = signal<boolean>(false);
  visibelConfirme = signal<boolean>(false);
  visibelAllData = signal<boolean>(false);
  bodytabel = signal<any>({});
  dataStatus = signal<string>('loading');

  GetAllData() {
    this.Data.get('customers').subscribe((res: any) => {
      const formattedData = res.data.map((item: any, index: number) => ({
        ...item,
        index: index + 1,
      }));
      this.data.set(formattedData);
      if (formattedData.length === 0) {
        this.dataStatus.set('no-data');
      } else {
        this.dataStatus.set('has-data');
      }
      this.allData.set(formattedData);
    });
  }

  onSearch(query: string) {
    if (!query) {
      this.data.set(this.allData());
      return;
    }
    const lowerQuery = query.toLowerCase();
    const filtered = this.allData().filter((item) => {
      return [item.fullName, item.email, item.phone, item.location].some(
        (val) => val && val.toString().toLowerCase().includes(lowerQuery),
      );
    });
    this.data.set(filtered);
  }

  onEditData(item: IDataCustomer) {
    this.visibelform.set(true);
    this.objdata.set(item);
  }

  onpatchData(item: IDataCustomer) {
    this.objdata.set(item);
    this.visibelAllData.set(true);
  }

  onHandelRespnseProccing() {
    this.visibelform.set(false);
    this.objdata.set(null);
    this.GetAllData();
  }

  onDelete(item: IDataCustomer) {
    this.objdata.set(item);
    this.visibelConfirme.set(true);
  }

  onHandelStatusConfirmation(event: string) {
    this.visibelConfirme.set(false);
    if (event == 'delete') {
      this.Data.delete(`customers/${this.objdata()?.id}`).subscribe((res) => {
        this.GetAllData();
      });
    }
  }

  ResetForm() {
    this.objdata.set(null);
  }

  getDataTabel() {
    let apiData = [
      { key: '#', value: 'index' },
      { key: this.translate.instant('full_name'), value: 'fullName' },
      { key: this.translate.instant('email'), value: 'email' },
      { key: this.translate.instant('phone'), value: 'phone' },
      { key: this.translate.instant('location'), value: 'location' },
      { key: 'created_At', value: 'createdAt' },
    ];
    this.bodytabel.set(apiData);
  }
}
