import { Component, OnInit, signal } from '@angular/core';
import { Data } from '../../core/Servies/data';
import { IHoliday, IresHoliday } from '../../core/Models/holiday.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-holidays',
  standalone: false,
  templateUrl: './holidays.html',
  styleUrl: './holidays.scss',
})
export class Holidays implements OnInit {
  ngOnInit(): void {
    this.getData();
    this.getDataTabel();
  }

  constructor(
    private Data: Data,
    private translate: TranslateService,
  ) {}

  visibelform = signal<boolean>(false);
  visibelConfirme = signal<boolean>(false);
  data = signal<IHoliday[]>([]);
  objdata = signal<IHoliday | null>(null);

  bodytabel = signal<
    {
      key: string;
      value: string;
    }[]
  >([]);

  getData() {
    this.Data.get<IresHoliday>('holidays').subscribe((res) => {
      const formattedData = res.data.map((item: any, index: number) => ({
        ...item,
        index: index + 1,
      }));
      this.data.set(formattedData);
    });
  }

  onHandelResponseSuccess(){
    this.getData()
  }
  onDelete(item: IHoliday) {
    this.visibelConfirme.set(true);
    this.objdata.set(item);
  }

  onHandelStatusConfirmation(event: string) {
    this.visibelConfirme.set(false);
    if (event == 'delete') {
      this.Data.delete(`holidays/${this.objdata()?.id}`).subscribe((res) => {
        this.getData();
      });
    }
  }

  getDataTabel() {
    let apiData = [
      { key: '#', value: 'index' },
      { key: this.translate.instant('date'), value: 'date' },
      { key: this.translate.instant('startTime'), value: 'startTime' },
      { key: this.translate.instant('endTime'), value: 'endTime' },
      { key: this.translate.instant('name'), value: 'name' },
    ];
    this.bodytabel.set(apiData);
  }



   onSearch(query: string) {
    if (!query) {
       this.getData()
      return;
    }
    const lowerQuery = query.toLowerCase();
    const filtered = this.data().filter((item) => {
      return [
        item.date,
        item.endTime,
        item.startTime,
        item.name,
      ].some(val => val && val.toString().toLowerCase().includes(lowerQuery));
    });
    this.data.set(filtered);
  }
}
