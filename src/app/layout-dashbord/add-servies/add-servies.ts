import { Component, OnInit, signal } from '@angular/core';
import { Data } from '../../core/Servies/data';
import { TranslateService } from '@ngx-translate/core';
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
  ) {}

  data = signal<any[]>([]);
  objdata = signal<any>({});
  visibelform = signal<boolean>(false);
  visibelConfirme = signal<boolean>(false);
  bodytabel = signal<any>({});

  GetAllData() {
    this.Data.get('services').subscribe((res: any) => {
      this.data.set(res.data);
    });
  }

  onEditData(item: any) {
    this.visibelform.set(true);
    this.objdata.set(item);
  }

  onHandelRespnseProccing() {
    this.visibelform.set(false);
    this.objdata.set({});
    this.GetAllData();
  }

  onDelete(item: any) {
    this.objdata.set(item);
    this.visibelConfirme.set(true);
  }

  onHandelStatusConfirmation(event: string) {
    this.visibelConfirme.set(false);
    if (event == 'delete') {
      this.Data.delete(`services/${this.objdata().id}`).subscribe((res) => {
        this.GetAllData();
      });
    }
  }

  getDataTabel() {
    let apiData = [
      { key: this.translate.instant('name_ar'), value: 'name_ar' },
      { key: this.translate.instant('name_en'), value: 'name_en' },
      // { key: 'description Ar', value: 'description_ar' },
      // { key: 'description En', value: 'description_en' },
      { key: 'created_At', value: 'createdAt' },
      { key: 'updated_At', value: 'updatedAt' },
      { key: 'price', value: 'price' },
    ];
    this.bodytabel.set(apiData);
  }
}
