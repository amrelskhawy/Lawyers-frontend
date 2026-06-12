import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  signal,
  SimpleChanges,
  TemplateRef,
} from '@angular/core';
import { Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { Data } from '../../core/Servies/data';

/** Pagination metadata returned by paginated list endpoints. */
export interface PageMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  // Endpoints may attach extra summary data (e.g. cases degreeCounts).
  [key: string]: any;
}

@Component({
  selector: 'app-dashboard-crud-page',
  standalone: false,
  templateUrl: './dashboard-crud-page.html',
  styleUrl: './dashboard-crud-page.scss',
})
export class DashboardCrudPage implements OnInit, OnChanges {
  @Input() endpoint!: string;
  @Input() deleteEndpoint!: string;
  @Input() bulkDeleteEndpoint?: string;
  @Input() columns!: { key: string; value: string }[];
  @Input() searchFields!: string[];
  @Input() selectable = false;
  @Input() page: string = '';
  @Input() dataMapper?: (item: any, index: number) => any;
  @Input() actionsTemplate!: TemplateRef<any>;
  @Input() columnTemplates: { [columnValue: string]: TemplateRef<any> } = {};
  @Input() showAddButton = true;
  /** Default rows per page. */
  @Input() pageSize = 10;
  /** Extra query params (server-side filters) merged into every request. */
  @Input() extraParams: { [key: string]: any } = {};

  @Output() addNew = new EventEmitter<void>();
  /** Emits the freshly loaded (and mapped) rows after every load/refresh. */
  @Output() loaded = new EventEmitter<any[]>();
  /** Emits the pagination metadata (incl. any endpoint extras) after each load. */
  @Output() metaLoaded = new EventEmitter<PageMeta | null>();

  data = signal<any[]>([]);
  originalData: any[] = [];
  dataStatus = signal<string>('loading');
  selectedItems = signal<any[]>([]);
  visibelConfirme = signal<boolean>(false);
  visibelConfirmeBulk = signal<boolean>(false);

  // ── Pagination state ───────────────────────────────────────────────────
  pageIndex = signal<number>(1); // 1-based
  rows = signal<number>(10);
  total = signal<number>(0);
  readonly rowsPerPageOptions = [10, 25, 50];
  /** True once an endpoint responds with `meta` (server-side paging). */
  private serverMode: boolean | null = null;
  private searchValue = '';
  private search$ = new Subject<string>();

  private deleteTarget: any = null;

  constructor(private dataService: Data) {}

  ngOnInit() {
    this.rows.set(this.pageSize);
    this.search$.pipe(distinctUntilChanged()).subscribe((q) => {
      this.searchValue = q;
      this.pageIndex.set(1);
      if (this.serverMode === false) this.applyClientView();
      else this.fetch();
    });
    this.fetch();
  }

  ngOnChanges(changes: SimpleChanges) {
    // A parent changing the server-side filters reloads from page 1.
    if (changes['extraParams'] && !changes['extraParams'].firstChange) {
      this.pageIndex.set(1);
      this.fetch();
    }
  }

  refresh() {
    this.fetch();
  }

  /** Public reload (kept for callers that refresh after create/edit). */
  loadData() {
    this.fetch();
  }

  deleteHandler = (item: any) => {
    this.deleteTarget = item;
    this.visibelConfirme.set(true);
  };

  // ── Loading ────────────────────────────────────────────────────────────
  /** Fetch a page from the server (used in server mode and on first load). */
  private fetch() {
    this.dataStatus.set('loading');
    const params: { [key: string]: any } = {
      page: this.pageIndex(),
      limit: this.rows(),
    };
    if (this.searchValue) params['search'] = this.searchValue;
    Object.assign(params, this.extraParams);

    this.dataService.get(this.endpoint, params).subscribe({
      next: (res: any) => {
        const mapper =
          this.dataMapper || ((item: any, index: number) => ({ ...item, index: index + 1 }));
        const rows = (res?.data ?? []).map(mapper);

        if (res?.meta) {
          // Server-side pagination: rows are already the page slice.
          this.serverMode = true;
          this.total.set(res.meta.total ?? rows.length);
          if (res.meta.limit) this.rows.set(res.meta.limit);
          if (res.meta.page) this.pageIndex.set(res.meta.page);
          this.setRows(rows, this.indexOffset());
          this.metaLoaded.emit(res.meta);
        } else {
          // Legacy endpoint: got the full list — paginate/search on the client.
          this.serverMode = false;
          this.originalData = rows;
          this.applyClientView();
          this.metaLoaded.emit(null);
        }
      },
      error: () => {
        this.setRows([], 0);
        this.total.set(0);
        this.metaLoaded.emit(null);
      },
    });
  }

  /** Client-side search + slice over the full list (legacy endpoints only). */
  private applyClientView() {
    const q = this.searchValue.toLowerCase();
    const filtered = q
      ? this.originalData.filter((item: any) =>
          this.searchFields?.some((field) => {
            const val = item[field];
            return val && val.toString().toLowerCase().includes(q);
          }),
        )
      : this.originalData;

    this.total.set(filtered.length);
    const start = (this.pageIndex() - 1) * this.rows();
    this.setRows(filtered.slice(start, start + this.rows()), start);
  }

  /** Row-number offset that continues across pages. */
  private indexOffset(): number {
    return (this.pageIndex() - 1) * this.rows();
  }

  private setRows(rows: any[], indexStart: number) {
    const numbered = rows.map((r, i) => ({ ...r, index: indexStart + i + 1 }));
    this.data.set(numbered);
    this.originalData = this.serverMode === false ? this.originalData : numbered;
    this.dataStatus.set(numbered.length === 0 ? 'no-data' : 'has-data');
    this.loaded.emit(numbered);
  }

  // ── Events ─────────────────────────────────────────────────────────────
  onSearch(query: string) {
    this.search$.next(query ?? '');
  }

  onPageChange(event: { first?: number; rows?: number; page?: number }) {
    this.pageIndex.set((event.page ?? 0) + 1);
    this.rows.set(event.rows ?? this.rows());
    if (this.serverMode === false) this.applyClientView();
    else this.fetch();
  }

  onHandelStatusConfirmation(event: string) {
    this.visibelConfirme.set(false);
    if (event === 'delete') {
      this.dataService
        .delete(`${this.deleteEndpoint}/${this.deleteTarget?.id}`)
        .subscribe(() => this.fetch());
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
      this.dataService.deleteMany(this.bulkDeleteEndpoint, ids).subscribe(() => this.fetch());
    }
  }
}
