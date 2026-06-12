import { Injectable } from '@angular/core';
import moment from 'moment-hijri';

/** The four calendar zoom levels. */
export type CalendarView = 'day' | 'week' | 'month' | 'year';

/** A Hijri date as separate parts (month is 1-12). */
export interface HijriParts {
  iYear: number;
  iMonth: number;
  iDay: number;
}

/** A single day cell in the Hijri month grid. */
export interface HijriDayCell {
  /** Hijri day-of-month, 1-30. */
  day: number;
  /** Canonical Hijri date "iYYYY-iMM-iDD" (zero-padded) for this cell. */
  hijri: string;
  /** True when the cell belongs to the month being displayed (vs. padding days). */
  inMonth: boolean;
  /** True when this cell is the current Hijri day. */
  isToday: boolean;
}

/** Arabic names of the 12 Hijri months, indexed 0-11 (Muharram → Dhul-Hijjah). */
export const HIJRI_MONTH_NAMES_AR = [
  'محرم',
  'صفر',
  'ربيع الأول',
  'ربيع الآخر',
  'جمادى الأولى',
  'جمادى الآخرة',
  'رجب',
  'شعبان',
  'رمضان',
  'شوال',
  'ذو القعدة',
  'ذو الحجة',
];

/** Arabic weekday headers, ordered Sunday → Saturday (moment day() 0-6). */
export const WEEKDAY_NAMES_AR = [
  'الأحد',
  'الإثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت',
];

/** Zero-pad a Hijri y/m/d (1-indexed month) into canonical "iYYYY-iMM-iDD". */
function canonical(iYear: number, iMonth1: number, iDay: number): string {
  return `${iYear}-${String(iMonth1).padStart(2, '0')}-${String(iDay).padStart(2, '0')}`;
}

/**
 * Pure helpers for laying out an Umm al-Qura (Hijri) month as a 6×7 grid and
 * mapping case session dates onto it. No DOM, no HTTP — unit-testable in isolation.
 */
@Injectable({ providedIn: 'root' })
export class HijriCalendar {
  /** Current Hijri year/month (month 1-12) for "today". */
  todayParts(): HijriParts {
    const m = moment();
    return { iYear: m.iYear(), iMonth: m.iMonth() + 1, iDay: m.iDate() };
  }

  /** Canonical "iYYYY-iMM-iDD" for a parts triple (month 1-12). */
  canonical(p: HijriParts): string {
    return canonical(p.iYear, p.iMonth, p.iDay);
  }

  /** Parse a canonical "iYYYY-iMM-iDD" back into parts (month 1-12). */
  private parts(hijri: string): HijriParts {
    const m = moment(hijri, 'iYYYY-iMM-iDD');
    return { iYear: m.iYear(), iMonth: m.iMonth() + 1, iDay: m.iDate() };
  }

  /** Shift a date by whole days, normalizing across month/year boundaries. */
  addDays(p: HijriParts, delta: number): HijriParts {
    const m = moment(this.canonical(p), 'iYYYY-iMM-iDD').add(delta, 'days');
    return { iYear: m.iYear(), iMonth: m.iMonth() + 1, iDay: m.iDate() };
  }

  /** Shift by whole Hijri years (clamping the day to the new month's length). */
  addYears(p: HijriParts, delta: number): HijriParts {
    const { iYear, iMonth } = this.addMonths(p.iYear, p.iMonth, delta * 12);
    return { iYear, iMonth, iDay: p.iDay };
  }

  /** The Sunday that starts the week containing the given date. */
  weekStart(p: HijriParts): HijriParts {
    const m = moment(this.canonical(p), 'iYYYY-iMM-iDD');
    return this.addDays(p, -m.day()); // day(): 0 = Sunday
  }

  /** The 7 day cells (Sunday→Saturday) for the week containing the date. */
  buildWeek(p: HijriParts): HijriDayCell[] {
    const start = this.weekStart(p);
    const today = this.todayParts();
    const todayHijri = this.canonical(today);
    const cells: HijriDayCell[] = [];
    let cur = start;
    for (let i = 0; i < 7; i++) {
      const hijri = this.canonical(cur);
      cells.push({ day: cur.iDay, hijri, inMonth: true, isToday: hijri === todayHijri });
      cur = this.addDays(cur, 1);
    }
    return cells;
  }

  /** Long Arabic label for a single day, e.g. "الجمعة 15 ذو الحجة 1447". */
  dayLabel(p: HijriParts): string {
    const weekday = WEEKDAY_NAMES_AR[moment(this.canonical(p), 'iYYYY-iMM-iDD').day()];
    return `${weekday} ${p.iDay} ${HIJRI_MONTH_NAMES_AR[p.iMonth - 1]} ${p.iYear}`;
  }

  /** Label for a week, e.g. "1 - 7 ذو الحجة 1447" (spans month names when needed). */
  weekLabel(p: HijriParts): string {
    const start = this.weekStart(p);
    const end = this.addDays(start, 6);
    const startMonth = HIJRI_MONTH_NAMES_AR[start.iMonth - 1];
    const endMonth = HIJRI_MONTH_NAMES_AR[end.iMonth - 1];
    if (start.iMonth === end.iMonth && start.iYear === end.iYear) {
      return `${start.iDay} - ${end.iDay} ${startMonth} ${start.iYear}`;
    }
    return `${start.iDay} ${startMonth} - ${end.iDay} ${endMonth} ${end.iYear}`;
  }

  /** The 12 months of a Hijri year as {iMonth, name} (month 1-12). */
  monthsOfYear(iYear: number): { iYear: number; iMonth: number; name: string }[] {
    return HIJRI_MONTH_NAMES_AR.map((name, i) => ({ iYear, iMonth: i + 1, name }));
  }

  /**
   * Canonical Hijri range `[from, to)` to fetch for a given view + anchor date.
   * `to` is exclusive. Day = 1 day, week = 7, month = whole month, year = whole year.
   */
  rangeFor(view: CalendarView, p: HijriParts): { from: string; to: string } {
    switch (view) {
      case 'day':
        return { from: this.canonical(p), to: this.canonical(this.addDays(p, 1)) };
      case 'week': {
        const start = this.weekStart(p);
        return { from: this.canonical(start), to: this.canonical(this.addDays(start, 7)) };
      }
      case 'year':
        return {
          from: canonical(p.iYear, 1, 1),
          to: canonical(p.iYear + 1, 1, 1),
        };
      case 'month':
      default: {
        const next = this.addMonths(p.iYear, p.iMonth, 1);
        return {
          from: canonical(p.iYear, p.iMonth, 1),
          to: canonical(next.iYear, next.iMonth, 1),
        };
      }
    }
  }

  /** Arabic header label, e.g. "ذو الحجة 1447". Month is 1-12. */
  monthLabel(iYear: number, iMonth: number): string {
    return `${HIJRI_MONTH_NAMES_AR[iMonth - 1]} ${iYear}`;
  }

  /**
   * Step a (year, month) pair by `delta` months, normalizing across year
   * boundaries. Month is 1-12 in and out.
   */
  addMonths(iYear: number, iMonth: number, delta: number): { iYear: number; iMonth: number } {
    // Convert to a 0-based absolute month count, shift, then split back.
    const abs = iYear * 12 + (iMonth - 1) + delta;
    return { iYear: Math.floor(abs / 12), iMonth: (abs % 12) + 1 };
  }

  /**
   * Build the 6-row × 7-column grid (always 42 cells) for the given Hijri month.
   * The first row is padded with the tail of the previous month so column 0 is
   * always Sunday; trailing cells spill into the next month. Month is 1-12.
   */
  buildMonthGrid(iYear: number, iMonth: number): HijriDayCell[][] {
    const first = moment(`${canonical(iYear, iMonth, 1)}`, 'iYYYY-iMM-iDD');
    // moment.day(): 0 = Sunday … 6 = Saturday — how many padding cells lead the month.
    const lead = first.day();
    const today = this.todayParts();
    const todayHijri = canonical(today.iYear, today.iMonth, today.iDay);

    const cells: HijriDayCell[] = [];
    // Start `lead` days before the 1st so the grid begins on a Sunday.
    const cursor = first.clone().subtract(lead, 'days');
    for (let i = 0; i < 42; i++) {
      const hijri = canonical(cursor.iYear(), cursor.iMonth() + 1, cursor.iDate());
      cells.push({
        day: cursor.iDate(),
        hijri,
        inMonth: cursor.iMonth() + 1 === iMonth && cursor.iYear() === iYear,
        isToday: hijri === todayHijri,
      });
      cursor.add(1, 'days');
    }

    // Chunk the flat 42 into 6 weeks of 7.
    const weeks: HijriDayCell[][] = [];
    for (let r = 0; r < 6; r++) {
      weeks.push(cells.slice(r * 7, r * 7 + 7));
    }
    return weeks;
  }

  /**
   * Normalize a stored Hijri session date into canonical "iYYYY-iMM-iDD" so it
   * matches the keys produced by {@link buildMonthGrid}. Accepts already-canonical
   * input or loose "iYYYY-iM-iD"; returns null for empty/malformed values.
   */
  normalizeSessionHijri(value: string | null | undefined): string | null {
    if (!value) return null;
    const m = value.trim().match(/^(\d{3,4})-(\d{1,2})-(\d{1,2})$/);
    if (!m) return null;
    const [, y, mo, d] = m;
    return canonical(Number(y), Number(mo), Number(d));
  }

  /**
   * Bucket items by their canonical Hijri session date.
   * @returns a Map keyed by "iYYYY-iMM-iDD" → items on that day.
   */
  bucketBySession<T>(items: T[], getHijri: (item: T) => string | null | undefined): Map<string, T[]> {
    const map = new Map<string, T[]>();
    for (const item of items) {
      const key = this.normalizeSessionHijri(getHijri(item));
      if (!key) continue;
      const bucket = map.get(key);
      if (bucket) bucket.push(item);
      else map.set(key, [item]);
    }
    return map;
  }
}
