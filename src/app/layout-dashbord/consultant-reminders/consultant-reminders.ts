import { Component, OnInit, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import moment from 'moment-hijri';
import { Data } from '../../core/Servies/data';
import { IConsultantReminder } from '../../core/Models/reminder.model';
import {
  CalendarView,
  HijriCalendar,
  HijriDayCell,
  HijriParts,
  WEEKDAY_NAMES_AR,
} from '../cases-calendar/hijri-calendar';

/** A memo reminder decorated for display inside a calendar cell. */
interface CalendarMemo {
  reminder: IConsultantReminder;
  caseNumber: string;
  clientName: string;
  courtName: string;
  consultantName: string;
  deadlineFormatted: string;
  /** Hijri canonical key "iYYYY-iMM-iDD" derived from the Gregorian memoDeadline. */
  hijriKey: string;
  /** Chip background colour keyed on reminder status. */
  color: string;
}

interface YearMonth {
  iYear: number;
  iMonth: number;
  name: string;
  weeks: HijriDayCell[][];
  count: number;
}

const STATUS_COLORS: Record<string, string> = {
  SENT: '#0f766e',
  FAILED: '#dc2626',
  PENDING: '#d97706',
  CANCELLED: '#64748b',
};
const MAX_CHIPS = 3;

@Component({
  selector: 'app-consultant-reminders',
  standalone: false,
  templateUrl: './consultant-reminders.html',
  styleUrl: './consultant-reminders.scss',
})
export class ConsultantReminders implements OnInit {
  readonly weekdays = WEEKDAY_NAMES_AR;
  readonly maxChips = MAX_CHIPS;
  readonly views: CalendarView[] = ['day', 'week', 'month', 'year'];

  private allReminders = signal<IConsultantReminder[]>([]);
  view = signal<CalendarView>('month');
  anchor = signal<HijriParts>({ iYear: 0, iMonth: 0, iDay: 0 });
  loading = signal<boolean>(false);
  selectedMemo = signal<CalendarMemo | null>(null);
  showDialog = signal<boolean>(false);

  constructor(
    private data: Data,
    private router: Router,
    private hijri: HijriCalendar,
  ) {}

  ngOnInit(): void {
    this.anchor.set(this.hijri.todayParts());
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.data.get<{ data: IConsultantReminder[] }>('reminders/consultant').subscribe({
      next: (res) => {
        this.allReminders.set(res?.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.allReminders.set([]);
        this.loading.set(false);
      },
    });
  }

  // ── Conversion: Gregorian ISO → Hijri canonical "iYYYY-iMM-iDD" ──────────
  private toHijriKey(isoDate: string | null | undefined): string | null {
    if (!isoDate) return null;
    const m = moment(isoDate);
    if (!m.isValid()) return null;
    const y = m.iYear();
    const mo = String(m.iMonth() + 1).padStart(2, '0');
    const d = String(m.iDate()).padStart(2, '0');
    return `${y}-${mo}-${d}`;
  }

  private formatDeadline(isoDate: string | null | undefined): string {
    if (!isoDate) return '—';
    const d = new Date(isoDate);
    return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`;
  }

  // ── Decoration ────────────────────────────────────────────────────────────
  private decorate(r: IConsultantReminder): CalendarMemo {
    const report = r.case?.sessionReports?.[0];
    return {
      reminder: r,
      caseNumber: report?.caseNumber ?? r.case?.agencyNumber ?? '—',
      clientName: r.case?.customer?.fullName ?? '—',
      courtName: report?.courtName ?? '—',
      consultantName: r.case?.consultant?.nameAr ?? r.case?.consultant?.name ?? '—',
      deadlineFormatted: this.formatDeadline(r.memoDeadline ?? r.case?.memoDeadline),
      hijriKey: this.toHijriKey(r.memoDeadline ?? r.case?.memoDeadline) ?? '',
      color: STATUS_COLORS[r.status] ?? '#64748b',
    };
  }

  // ── Bucketing ─────────────────────────────────────────────────────────────
  private buckets = computed(() =>
    this.hijri.bucketBySession(
      this.allReminders(),
      (r) => this.toHijriKey(r.memoDeadline ?? r.case?.memoDeadline),
    ),
  );

  memosForDay(hijri: string): CalendarMemo[] {
    return (this.buckets().get(hijri) ?? []).map((r) => this.decorate(r));
  }

  hasMemos(hijri: string): boolean {
    return (this.buckets().get(hijri)?.length ?? 0) > 0;
  }

  // ── Computed views ────────────────────────────────────────────────────────
  weeks = computed<HijriDayCell[][]>(() => {
    const a = this.anchor();
    return a.iYear ? this.hijri.buildMonthGrid(a.iYear, a.iMonth) : [];
  });

  weekCells = computed<HijriDayCell[]>(() => {
    const a = this.anchor();
    return a.iYear ? this.hijri.buildWeek(a) : [];
  });

  dayCells = computed<CalendarMemo[]>(() => {
    const a = this.anchor();
    return a.iYear ? this.memosForDay(this.hijri.canonical(a)) : [];
  });

  yearMonths = computed<YearMonth[]>(() => {
    const a = this.anchor();
    if (!a.iYear) return [];
    const counts = new Map<number, number>();
    for (const r of this.allReminders()) {
      const key = this.toHijriKey(r.memoDeadline ?? r.case?.memoDeadline);
      if (!key) continue;
      const mo = Number(key.slice(5, 7));
      counts.set(mo, (counts.get(mo) ?? 0) + 1);
    }
    return this.hijri.monthsOfYear(a.iYear).map((mo) => ({
      ...mo,
      weeks: this.hijri.buildMonthGrid(mo.iYear, mo.iMonth),
      count: counts.get(mo.iMonth) ?? 0,
    }));
  });

  title = computed<string>(() => {
    const a = this.anchor();
    if (!a.iYear) return '';
    switch (this.view()) {
      case 'day': return this.hijri.dayLabel(a);
      case 'week': return this.hijri.weekLabel(a);
      case 'year': return `${a.iYear}`;
      default: return this.hijri.monthLabel(a.iYear, a.iMonth);
    }
  });

  // ── Navigation ────────────────────────────────────────────────────────────
  setView(v: CalendarView): void {
    this.view.set(v);
  }

  private step(delta: number): void {
    const a = this.anchor();
    switch (this.view()) {
      case 'day':
        this.anchor.set(this.hijri.addDays(a, delta)); break;
      case 'week':
        this.anchor.set(this.hijri.addDays(a, delta * 7)); break;
      case 'year':
        this.anchor.set(this.hijri.addYears(a, delta)); break;
      default: {
        const { iYear, iMonth } = this.hijri.addMonths(a.iYear, a.iMonth, delta);
        this.anchor.set({ iYear, iMonth, iDay: 1 });
      }
    }
  }

  prev(): void { this.step(-1); }
  next(): void { this.step(1); }
  goToday(): void { this.anchor.set(this.hijri.todayParts()); }

  openMonth(m: YearMonth): void {
    this.anchor.set({ iYear: m.iYear, iMonth: m.iMonth, iDay: 1 });
    this.view.set('month');
  }

  openDay(hijri: string): void {
    const parts = hijri.match(/^(\d{3,4})-(\d{1,2})-(\d{1,2})$/);
    if (!parts) return;
    this.anchor.set({ iYear: +parts[1], iMonth: +parts[2], iDay: +parts[3] });
    this.view.set('day');
  }

  // ── Dialog ────────────────────────────────────────────────────────────────
  openMemo(item: CalendarMemo, event?: Event): void {
    event?.stopPropagation();
    this.selectedMemo.set(item);
    this.showDialog.set(true);
  }

  viewCase(): void {
    const sel = this.selectedMemo();
    if (!sel) return;
    this.showDialog.set(false);
    this.router.navigate(['/dashboard/content/client-cases', sel.reminder.caseId, 'edit']);
  }
}
