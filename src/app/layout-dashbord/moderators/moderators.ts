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
  ) { }

  data = signal<IModerators[]>([]);
  bodytabel = signal<
    {
      key: string;
      value: string;
    }[]
  >([]);
  visibelform = signal<boolean>(false);
  visibelConfirme = signal<boolean>(false);
  visibelConfirmeBulk = signal<boolean>(false);
  objdata = signal<IModerators | null>(null);
  dataStatus = signal<string>('loading');
  selectedItems = signal<any[]>([]);
  originalData: any[] = [];
  getData() {
    this.Data.get<{ data: IModerators[] }>('admin/users?role=moderator').subscribe((res) => {
      const formattedData = res.data.map((item: any, index: number) => ({
        ...item,
        index: index + 1,
      }));
      this.data.set(formattedData);
      this.originalData = formattedData;
      if (formattedData.length === 0) {
        this.dataStatus.set('no-data');
      } else {
        this.dataStatus.set('has-data');
      }
    });
  }

  getDataTabel() {
    let apiData = [
      { key: '#', value: 'index' },
      { key: this.translate.instant('name'), value: 'name' },
      { key: this.translate.instant('email'), value: 'email' },
      { key: this.translate.instant('created_At'), value: 'createdAt' },
      { key: this.translate.instant('role'), value: 'role' },
    ];
    this.bodytabel.set(apiData);
  }

  onSearch(query: string) {
    if (!query) {
      this.data.set(this.originalData);
      return;
    }
    const lowerQuery = query.toLowerCase();
    const filtered = this.data().filter((item: any) => {
      return [item.name, item.email, item.createdAt, item.role].some(
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
      this.Data.delete<any>(`moderators/${this.objdata()?.id}`).subscribe((res) => {
        this.getData();
      });
    }
  }

  onSelectionChange(items: any[]) {
    this.selectedItems.set(items);
  }

  onBulkDelete() {
    if (this.selectedItems().length === 0) return;
    this.visibelConfirmeBulk.set(true);
  }

  onHandelBulkDeleteConfirmation(event: string) {
    this.visibelConfirmeBulk.set(false);
    if (event == 'delete') {
      const ids = this.selectedItems().map((item: any) => item.id);
      this.Data.deleteMany('moderators/many', ids).subscribe(() => {
        this.getData();
      });
    }
  }
}
