import { Component, OnInit, signal } from '@angular/core';
import { Data } from '../../core/Servies/data';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-moderators',
  standalone: false,
  templateUrl: './moderators.html',
  styleUrl: './moderators.scss',
})
export class Moderators implements OnInit {
  ngOnInit(): void {
    this.getData();
    this.getDataTabel();
  }

  constructor(
    private Data: Data,
    private translate: TranslateService,
  ) {}
  data = signal<any[]>([]);
  bodytabel = signal<any>({});
  visibelform = signal<boolean>(false);

  getData() {
    this.Data.get('moderators').subscribe((res: any) => {
      console.log(res);
      const formattedData = res.map((item: any, index: number) => ({
        ...item,
        index: index + 1,
      }));
      this.data.set(formattedData);
    });
  }

  getDataTabel() {
    let apiData = [
      { key: '#', value: 'index' },
      { key: this.translate.instant('name'), value: 'name' },
      { key: this.translate.instant('email'), value: 'email' },
      { key: this.translate.instant('role'), value: 'role' },
      { key: this.translate.instant('created_At'), value: 'createdAt' },
    ];
    this.bodytabel.set(apiData);
  }

  onDelete(item: any) {}
}
