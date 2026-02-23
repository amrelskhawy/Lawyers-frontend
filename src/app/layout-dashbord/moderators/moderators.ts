import { Component, OnInit, signal } from '@angular/core';
import { Data } from '../../core/Servies/data';
import { TranslateService } from '@ngx-translate/core';
import { IModerators } from '../../core/Models/Moderators.model';

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

  data = signal<IModerators[]>([]);
  bodytabel = signal<
    {
      key: string;
      value: string;
    }[]
  >([]);
  visibelform = signal<boolean>(false);
  visibelConfirme = signal<boolean>(false);
  objdata = signal<IModerators | null>(null);

  getData() {
    this.Data.get<IModerators[]>('moderators').subscribe((res) => {
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

  onSearch(query: string) {
    if (!query) {
      this.data.set(this.data());
      return;
    }
    const lowerQuery = query.toLowerCase();
    const filtered = this.data().filter((item: any) => {
      return [item.name, item.email, item.role, item.created_At].some(
        (val) => val && val.toString().toLowerCase().includes(lowerQuery),
      );
    });
    this.data.set(filtered);
  }

  HandelResponseSuccess() {
    this.getData();
    this.visibelform.set(false);
  }

  onDelete(item: IModerators) {
    this.visibelConfirme.set(true);
    this.objdata.set(item);
  }

  onHandelStatusConfirmation(event: string) {
    this.visibelConfirme.set(false);
    if (event == 'delete') {
      this.Data.delete(`moderators/${this.objdata()?.id}`).subscribe((res) => {
        this.getData();
      });
    }
  }
}
