import { Component, OnInit, signal, computed } from '@angular/core';
import { Data } from '../../core/Servies/data';

interface ActivityLog {
  id: string;
  action: string;
  resource: string;
  resourceId: string | null;
  details: Record<string, any> | null;
  ipAddress: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string; role: string };
}

interface Stats {
  bookings: number;
  cases: number;
  customers: number;
  users: number;
}

@Component({
  selector: 'app-activity-logs',
  standalone: false,
  templateUrl: './activity-logs.html',
  styleUrl: './activity-logs.scss',
})
export class ActivityLogs implements OnInit {
  constructor(private data: Data) {}

  logs = signal<ActivityLog[]>([]);
  stats = signal<Stats>({ bookings: 0, cases: 0, customers: 0, users: 0 });
  loading = signal<boolean>(true);
  total = signal<number>(0);
  page = signal<number>(1);
  limit = 30;

  filterAction = signal<string>('');
  filterResource = signal<string>('');
  expandedId = signal<string | null>(null);

  readonly actionOptions = [
    'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'LIST',
    'ASSIGN', 'ACCEPT_ASSIGNMENT', 'REJECT_ASSIGNMENT',
    'GENERATE_PDF', 'SEND_TO_CLIENT', 'CONFIRM', 'COMPLETE', 'CANCEL',
  ];
  readonly resourceOptions = ['Case', 'Booking', 'Customer', 'User', 'SessionReport', 'FieldVisitReport', 'LawyerFeesContract'];

  ngOnInit() {
    this.loadLogs();
    this.loadStats();
  }

  loadLogs(reset = false) {
    if (reset) this.page.set(1);
    this.loading.set(true);
    const params: any = { page: this.page(), limit: this.limit };
    if (this.filterAction()) params.action = this.filterAction();
    if (this.filterResource()) params.resource = this.filterResource();

    this.data.get<any>('activity-logs', params).subscribe({
      next: (res) => {
        const incoming: ActivityLog[] = res.data?.logs ?? [];
        if (this.page() === 1) {
          this.logs.set(incoming);
        } else {
          this.logs.update((prev) => [...prev, ...incoming]);
        }
        this.total.set(res.data?.total ?? 0);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  loadStats() {
    Promise.all([
      this.data.get<any>('bookings').toPromise(),
      this.data.get<any>('cases').toPromise(),
      this.data.get<any>('customers').toPromise(),
      this.data.get<any>('admin/users').toPromise(),
    ]).then(([b, c, cu, u]) => {
      this.stats.set({
        bookings: b?.data?.length ?? 0,
        cases: c?.data?.length ?? 0,
        customers: cu?.data?.length ?? 0,
        users: u?.data?.length ?? 0,
      });
    });
  }

  applyFilters() {
    this.loadLogs(true);
  }

  clearFilters() {
    this.filterAction.set('');
    this.filterResource.set('');
    this.loadLogs(true);
  }

  loadMore() {
    this.page.update((p) => p + 1);
    this.loadLogs();
  }

  toggleExpand(id: string) {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  get hasMore(): boolean {
    return this.logs().length < this.total();
  }

  detailEntries(details: Record<string, any> | null): { key: string; value: string }[] {
    if (!details) return [];
    return Object.entries(details)
      .filter(([, v]) => v !== null && v !== undefined && v !== '')
      .map(([k, v]) => ({ key: k, value: String(v) }));
  }

  resourceLabel(log: ActivityLog): string {
    const d = log.details;
    if (!d) return log.resourceId ? `#${log.resourceId.slice(0, 8)}` : '';
    const name = d['customer'] ?? d['name'] ?? d['case'] ?? null;
    if (name) return name;
    if (log.resourceId) return `#${log.resourceId.slice(0, 8)}`;
    return '';
  }

  actionLabel(action: string): string {
    const map: Record<string, string> = {
      CREATE: 'إنشاء',
      UPDATE: 'تعديل',
      DELETE: 'حذف',
      LIST: 'عرض القائمة',
      VIEW: 'عرض',
      ASSIGN: 'تعيين محامي',
      ACCEPT_ASSIGNMENT: 'قبول التعيين',
      REJECT_ASSIGNMENT: 'رفض التعيين',
      CONFIRM: 'تأكيد',
      COMPLETE: 'إتمام',
      CANCEL: 'إلغاء',
      GENERATE_PDF: 'توليد PDF',
      SEND_TO_CLIENT: 'إرسال للعميل',
    };
    return map[action] ?? action;
  }

  resourceTypeLabel(resource: string): string {
    const map: Record<string, string> = {
      Case: 'قضية',
      Booking: 'حجز',
      Customer: 'عميل',
      User: 'مستخدم',
      SessionReport: 'تقرير جلسة',
      FieldVisitReport: 'تقرير زيارة',
      LawyerFeesContract: 'عقد أتعاب',
    };
    return map[resource] ?? resource;
  }

  actionIcon(action: string): string {
    const map: Record<string, string> = {
      CREATE: 'fa-solid fa-plus',
      UPDATE: 'fa-solid fa-pen',
      DELETE: 'fa-solid fa-trash',
      LIST: 'fa-solid fa-list',
      VIEW: 'fa-solid fa-eye',
      ASSIGN: 'fa-solid fa-user-plus',
      ACCEPT_ASSIGNMENT: 'fa-solid fa-check',
      REJECT_ASSIGNMENT: 'fa-solid fa-xmark',
      CONFIRM: 'fa-solid fa-circle-check',
      COMPLETE: 'fa-solid fa-flag-checkered',
      CANCEL: 'fa-solid fa-ban',
      GENERATE_PDF: 'fa-solid fa-file-pdf',
      SEND_TO_CLIENT: 'fa-solid fa-paper-plane',
    };
    return map[action] ?? 'fa-solid fa-circle-dot';
  }

  actionClass(action: string): string {
    if (['CREATE', 'CONFIRM', 'ACCEPT_ASSIGNMENT'].includes(action)) return 'action-create';
    if (['DELETE', 'CANCEL', 'REJECT_ASSIGNMENT'].includes(action)) return 'action-delete';
    if (['UPDATE', 'ASSIGN'].includes(action)) return 'action-update';
    if (['SEND_TO_CLIENT', 'GENERATE_PDF'].includes(action)) return 'action-send';
    return 'action-default';
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString('ar-SA', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }
}
