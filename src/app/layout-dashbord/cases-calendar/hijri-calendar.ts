import { Injectable } from '@angular/core';
import moment from 'moment-hijri';

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
  todayParts(): { iYear: number; iMonth: number; iDay: number } {
    const m = moment();
    return { iYear: m.iYear(), iMonth: m.iMonth() + 1, iDay: m.iDate() };
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
