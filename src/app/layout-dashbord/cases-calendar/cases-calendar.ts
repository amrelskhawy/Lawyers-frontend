import { Component, OnInit, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  CaseType,
  CASE_DEGREE_OPTIONS,
  CASE_TYPE_OPTIONS,
  IDataCase,
  ILawyerOption,
} from '../../core/Models/case.model';
import { Data } from '../../core/Servies/data';
import {
  CalendarView,
  HijriCalendar,
  HijriDayCell,
  HijriParts,
  WEEKDAY_NAMES_AR,
} from './hijri-calendar';

/** A case as it sits inside a calendar day cell, pre-decorated for display. */
interface CalendarCase {
  case: IDataCase;
  customerName: string;
  time: string;
  degreeLabel: string;
  caseTypeLabel: string;
  /** The lawyer/consultant assigned to this case (display only). */
  assigneeName: string;
  /** Background color for the chip — the litigation-degree color, or neutral grey. */
  color: string;
}

/** One month tile in the year overview. */
interface YearMonth {
  iYear: number;
  iMonth: number;
  name: string;
  weeks: HijriDayCell[][];
  count: number;
}

const NEUTRAL_DEGREE_COLOR = '#64748b';
/** Max chips rendered inline in a month-grid day cell before collapsing into "+N more". */
const MAX_CHIPS_PER_DAY = 3;

@Component({
  selector: 'app-cases-calendar',
  standalone: false,
  templateUrl: './cases-calendar.html',
  styleUrl: './cases-calendar.scss',
})
export class CasesCalendar implements OnInit {
  readonly weekdays = WEEKDAY_NAMES_AR;
  readonly maxChips = MAX_CHIPS_PER_DAY;
  /** Degree colors shown in the legend. */
  readonly degreeOptions = CASE_DEGREE_OPTIONS;
  readonly views: CalendarView[] = ['day', 'week', 'month', 'year'];

  // ── Current user / role ──────────────────────────────────────────────────
  private get currentUser(): { role: string } | null {
    const raw = sessionStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }
  get role(): string {
    return this.currentUser?.role ?? '';
  }
  get canFilterByLawyer(): boolean {
    return this.role === 'ADMIN' || this.role === 'MODERATOR';
  }

  // ── State ────────────────────────────────────────────────────────────────
  /** All cases returned for the current range (already role-scoped by the backend). */
  private allCases = signal<IDataCase[]>([]);
  lawyerOptions = signal<ILawyerOption[]>([]);
  selectedLawyerId = signal<string>('');

  /** Active zoom level. */
  view = signal<CalendarView>('month');
  /** The Hijri date the current view is centred on. */
  anchor = signal<HijriParts>({ iYear: 0, iMonth: 0, iDay: 0 });

  selectedCase = signal<CalendarCase | null>(null);
  showCaseDialog = signal<boolean>(false);
  loading = signal<boolean>(false);

  constructor(
    private data: Data,
    private router: Router,
    private hijri: HijriCalendar,
  ) {}

  ngOnInit(): void {
    this.anchor.set(this.hijri.todayParts());
    this.loadCases();
    if (this.canFilterByLawyer) this.loadLawyers();
  }

  // ── Data loading ─────────────────────────────────────────────────────────
  /** Fetch the cases whose session falls in the current view's Hijri range. */
  private loadCases(): void {
    const { from, to } = this.hijri.rangeFor(this.view(), this.anchor());
    this.loading.set(true);
    this.data.get<{ data: IDataCase[] }>('cases', { from, to }).subscribe({
      next: (res) => {
        this.allCases.set(res?.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.allCases.set([]);
        this.loading.set(false);
      },
    });
  }

  private loadLawyers(): void {
    this.data.get<{ data: ILawyerOption[] }>('cases/lawyers').subscribe((res) => {
      this.lawyerOptions.set(res?.data ?? []);
    });
  }

  // ── Derived data ─────────────────────────────────────────────────────────
  private filteredCases = computed<IDataCase[]>(() => {
    const id = this.selectedLawyerId();
    if (!id) return this.allCases();
    return this.allCases().filter((c) => c.preferredLawyerId === id || c.consultantId === id);
  });

  /** Cases bucketed by canonical Hijri session date. */
  private buckets = computed(() =>
    this.hijri.bucketBySession(this.filteredCases(), (c) => c.sessionHijriDate),
  );

  /** Month-grid (6×7) for the month view. */
  weeks = computed<HijriDayCell[][]>(() => {
    const a = this.anchor();
    return a.iYear ? this.hijri.buildMonthGrid(a.iYear, a.iMonth) : [];
  });

  /** Week strip (7 cells) for the week view. */
  weekCells = computed<HijriDayCell[]>(() => {
    const a = this.anchor();
    return a.iYear ? this.hijri.buildWeek(a) : [];
  });

  /** Sessions on the anchored day (day view). */
  dayCases = computed<CalendarCase[]>(() => {
    const a = this.anchor();
    return a.iYear ? this.casesForDay(this.hijri.canonical(a)) : [];
  });

  /** 12 month tiles for the year view, each with its grid + case count. */
  yearMonths = computed<YearMonth[]>(() => {
    const a = this.anchor();
    if (!a.iYear) return [];
    const counts = new Map<number, number>();
    for (const c of this.filteredCases()) {
      const key = this.hijri.normalizeSessionHijri(c.sessionHijriDate);
      if (!key) continue;
      const m = Number(key.slice(5, 7));
      counts.set(m, (counts.get(m) ?? 0) + 1);
    }
    return this.hijri.monthsOfYear(a.iYear).map((mo) => ({
      ...mo,
      weeks: this.hijri.buildMonthGrid(mo.iYear, mo.iMonth),
      count: counts.get(mo.iMonth) ?? 0,
    }));
  });

  /** Header label for the active view. */
  title = computed<string>(() => {
    const a = this.anchor();
    if (!a.iYear) return '';
    switch (this.view()) {
      case 'day':
        return this.hijri.dayLabel(a);
      case 'week':
        return this.hijri.weekLabel(a);
      case 'year':
        return `${a.iYear}`;
      default:
        return this.hijri.monthLabel(a.iYear, a.iMonth);
    }
  });

  /** True when a (year-grid) day cell carries at least one session. */
  hasCases(hijri: string): boolean {
    return (this.buckets().get(hijri)?.length ?? 0) > 0;
  }

  /** Decorated, time-sorted cases for a day key. */
  casesForDay(hijri: string): CalendarCase[] {
    const raw = this.buckets().get(hijri) ?? [];
    return raw.map((c) => this.decorate(c)).sort((a, b) => a.time.localeCompare(b.time));
  }

  private decorate(c: IDataCase): CalendarCase {
    const degree = CASE_DEGREE_OPTIONS.find((o) => o.value === c.caseDegree);
    const type = CASE_TYPE_OPTIONS.find((o) => o.value === (c.caseType as CaseType));
    const assignee =
      c.preferredLawyer?.name ?? c.preferredLawyerName ?? c.consultant?.name ?? c.consultantName ?? '';
    return {
      case: c,
      customerName: c.customer?.fullName ?? '',
      time: c.sessionTime ?? '',
      degreeLabel: degree?.label ?? '',
      caseTypeLabel: type?.label ?? '',
      assigneeName: assignee,
      color: degree?.color ?? NEUTRAL_DEGREE_COLOR,
    };
  }

  // ── View + navigation ────────────────────────────────────────────────────
  setView(v: CalendarView): void {
    if (this.view() === v) return;
    this.view.set(v);
    this.loadCases();
  }

  /** Step backward/forward by one unit of the active view. */
  private step(delta: number): void {
    const a = this.anchor();
    switch (this.view()) {
      case 'day':
        this.anchor.set(this.hijri.addDays(a, delta));
        break;
      case 'week':
        this.anchor.set(this.hijri.addDays(a, delta * 7));
        break;
      case 'year':
        this.anchor.set(this.hijri.addYears(a, delta));
        break;
      default: {
        const { iYear, iMonth } = this.hijri.addMonths(a.iYear, a.iMonth, delta);
        this.anchor.set({ iYear, iMonth, iDay: 1 });
      }
    }
    this.loadCases();
  }

  prev(): void {
    this.step(-1);
  }
  next(): void {
    this.step(1);
  }

  goToday(): void {
    this.anchor.set(this.hijri.todayParts());
    this.loadCases();
  }

  /** Drill from the year overview into a month. */
  openMonth(m: YearMonth): void {
    this.anchor.set({ iYear: m.iYear, iMonth: m.iMonth, iDay: 1 });
    this.view.set('month');
    this.loadCases();
  }

  /** Drill into a single day (from month/week/year grids). */
  openDay(hijri: string): void {
    const m = hijri.match(/^(\d{3,4})-(\d{1,2})-(\d{1,2})$/);
    if (!m) return;
    this.anchor.set({ iYear: +m[1], iMonth: +m[2], iDay: +m[3] });
    this.view.set('day');
    this.loadCases();
  }

  // ── Dialog ───────────────────────────────────────────────────────────────
  openCase(item: CalendarCase, event?: Event): void {
    event?.stopPropagation();
    this.selectedCase.set(item);
    this.showCaseDialog.set(true);
  }

  viewDetails(): void {
    const sel = this.selectedCase();
    if (!sel) return;
    this.showCaseDialog.set(false);
    this.router.navigate(['/dashboard/content/client-cases', sel.case.id, 'edit']);
  }
}
