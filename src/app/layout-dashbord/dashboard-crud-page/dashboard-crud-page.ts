import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  signal,
  TemplateRef,
} from '@angular/core';
import { Data } from '../../core/Servies/data';

@Component({
  selector: 'app-dashboard-crud-page',
  standalone: false,
  templateUrl: './dashboard-crud-page.html',
  styleUrl: './dashboard-crud-page.scss',
})
export class DashboardCrudPage implements OnInit {
  @Input() endpoint!: string;
  @Input() deleteEndpoint!: string;
  @Input() bulkDeleteEndpoint?: string;
  @Input() columns!: { key: string; value: string }[];
  @Input() searchFields!: string[];
  @Input() selectable = false;
  @Input() page: string = '';
  @Input() dataMapper?: (item: any, index: number) => any;
  @Input() actionsTemplate!: TemplateRef<any>;

  @Output() addNew = new EventEmitter<void>();

  data = signal<any[]>([]);
  originalData: any[] = [];
  dataStatus = signal<string>('loading');
  selectedItems = signal<any[]>([]);
  visibelConfirme = signal<boolean>(false);
  visibelConfirmeBulk = signal<boolean>(false);

  private deleteTarget: any = null;

  constructor(private dataService: Data) {}

  ngOnInit() {
    this.loadData();
  }

  deleteHandler = (item: any) => {
    this.deleteTarget = item;
    this.visibelConfirme.set(true);
  };

  loadData() {
    this.dataService.get(this.endpoint).subscribe((res: any) => {
      const mapper =
        this.dataMapper ||
        ((item: any, index: number) => ({ ...item, index: index + 1 }));
      const formattedData = res.data.map(mapper);
      this.data.set(formattedData);
      this.originalData = formattedData;
      this.dataStatus.set(
        formattedData.length === 0 ? 'no-data' : 'has-data',
      );
    });
  }

  onSearch(query: string) {
    if (!query) {
      this.data.set(this.originalData);
      return;
    }
    const lowerQuery = query.toLowerCase();
    const filtered = this.originalData.filter((item: any) =>
      this.searchFields.some((field) => {
        const val = item[field];
        return val && val.toString().toLowerCase().includes(lowerQuery);
      }),
    );
    this.data.set(filtered);
  }

  onHandelStatusConfirmation(event: string) {
    this.visibelConfirme.set(false);
    if (event === 'delete') {
      this.dataService
        .delete(`${this.deleteEndpoint}/${this.deleteTarget?.id}`)
        .subscribe(() => this.loadData());
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
    if (event === 'delete' && this.bulkDeleteEndpoint) {
      const ids = this.selectedItems().map((item: any) => item.id);
      this.dataService
        .deleteMany(this.bulkDeleteEndpoint, ids)
        .subscribe(() => this.loadData());
    }
  }
}
