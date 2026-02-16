import { Component, OnInit, signal } from '@angular/core';
import { Data } from '../../core/Servies/data';
import { IAdmin } from '../../core/Models/Addmin.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-admins',
  standalone: false,
  templateUrl: './admins.html',
  styleUrl: './admins.scss',
})
export class Admins implements OnInit {
  ngOnInit(): void {
    this.getData();
    this.getDataTabel()
  }

 constructor(
    private Data: Data,
    private translate: TranslateService,
  ) {}

  visibelConfirme = signal<boolean>(false);
  objdata = signal<IAdmin | null>(null);
  data = signal<IAdmin[]>([]);
  bodytabel = signal<
    {
      key: string;
      value: string;
    }[]
  >([]);
  visibelform = signal<boolean>(false);

  getData() {
    this.Data.get<IAdmin[]>('admin/users').subscribe((res)=>{
          const formattedData = res.map((item: any, index: number) => ({
        ...item,
        index: index + 1,
      }));
      this.data.set(formattedData);
    })
  }


    getDataTabel() {
    let apiData = [
      { key: '#', value: 'index' },
      { key: this.translate.instant('name'), value: 'name' },
      { key: this.translate.instant('email'), value: 'email' },
      { key: this.translate.instant('role'), value: 'role' },
      { key: this.translate.instant('created_At'), value: 'createdAt' },
      { key: this.translate.instant('updated_At'), value: 'updatedAt' },
    ];
    this.bodytabel.set(apiData);
  }

  onDelete(item: any) {
    this.objdata.set(item)
          this.visibelConfirme.set(true);
  }

    onHandelStatusConfirmation(event: string) {
      this.visibelConfirme.set(false);
      if (event == 'delete') {
        this.Data.delete(`admin/users/${this.objdata()?.id}`).subscribe((res) => {
          this.getData();
        });
      }
    }
}
