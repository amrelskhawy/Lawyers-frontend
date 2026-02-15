import { Component, OnInit, signal } from '@angular/core';
import { Data } from '../../core/Servies/data';
import { TranslateService } from '@ngx-translate/core';
import { IDataServies } from '../../core/Models/servies.model';
@Component({
  selector: 'app-add-servies',
  standalone: false,
  templateUrl: './add-servies.html',
  styleUrl: './add-servies.scss',
})
export class AddServies implements OnInit {
  ngOnInit(): void {
    this.GetAllData();
    this.getDataTabel();
  }

  constructor(
    private Data: Data,
    private translate: TranslateService,
  ) { }

  data = signal<any[]>([]);
  allData = signal<any[]>([]);
  objdata = signal<IDataServies|null>(null);
  visibelform = signal<boolean>(false);
  visibelConfirme = signal<boolean>(false);
  visibelAllData = signal<boolean>(false);
  bodytabel = signal<any>({});

  GetAllData() {
    this.Data.get('services').subscribe((res: any) => {
      const formattedData = res.data.map((item: any, index: number) => ({
        ...item,
        index: index + 1,
        priceFormatted: item.price + ' ﷼',
      }));
      this.data.set(formattedData);
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
      return [
        item.name_ar,
        item.name_en,
        item.description_ar,
        item.description_en,
        item.priceFormatted
      ].some(val => val && val.toString().toLowerCase().includes(lowerQuery));
    });
    this.data.set(filtered);
  }

  onEditData(item: IDataServies) {
    this.visibelform.set(true);
    this.objdata.set(item);
  }

  onpatchData(item:IDataServies){
     this.objdata.set(item);
     this.visibelAllData.set(true)
  }

  onHandelRespnseProccing() {
    this.visibelform.set(false);
    this.objdata.set(null);
    this.GetAllData();
  }

  onDelete(item: IDataServies) {
    this.objdata.set(item);
    this.visibelConfirme.set(true);
  }

  onHandelStatusConfirmation(event: string) {
    this.visibelConfirme.set(false);
    if (event == 'delete') {
      this.Data.delete(`services/${this.objdata()?.id}`).subscribe((res) => {
        this.GetAllData();
      });
    }
  }

  ResetForm(){
    this.objdata.set(null);
  }

  getDataTabel() {
    let apiData = [
      { key: '#', value: 'index' },
      { key: this.translate.instant('name_ar'), value: 'name_ar' },
      { key: this.translate.instant('name_en'), value: 'name_en' },
      { key: this.translate.instant('description_ar'), value: 'description_ar' },
      { key: this.translate.instant('description_en'), value: 'description_en' },
      { key: 'created_At', value: 'createdAt' },
      { key: this.translate.instant('price'), value: 'priceFormatted' },
    ];
    this.bodytabel.set(apiData);
  }
}
