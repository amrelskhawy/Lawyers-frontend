/**
 * Bridge between the shared <app-hijri-datepicker>, which emits Hijri dates as
 * "DD / MM / YYYY", and the backend's canonical "YYYY-MM-DD" (iYYYY-iMM-iDD)
 * form used by the /cases/:id/session endpoint.
 */

/** "15 / 12 / 1447" → "1447-12-15". Returns '' for empty input. */
export function pickerToCanonicalHijri(value: string | null | undefined): string {
  if (!value) return '';
  const m = value.match(/^(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{3,4})$/);
  if (!m) return value.trim();
  const [, day, month, year] = m;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/** "1447-12-15" → "15 / 12 / 1447" (the picker's display/value format). */
export function canonicalToPickerHijri(value: string | null | undefined): string {
  if (!value) return '';
  const m = value.match(/^(\d{3,4})-(\d{1,2})-(\d{1,2})$/);
  if (!m) return value;
  const [, year, month, day] = m;
  return `${day.padStart(2, '0')} / ${month.padStart(2, '0')} / ${year}`;
}

const HIJRI_FMT = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
});

/**
 * Gregorian instant → the picker's "DD / MM / YYYY" Hijri string. Used when
 * editing a reminder whose `scheduledAt` comes back from the backend as a
 * Gregorian `Date`, so the Hijri datepicker can show the right day.
 */
export function gregorianToPickerHijri(value: Date | string | null | undefined): string {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const parts = HIJRI_FMT.formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return `${get('day').padStart(2, '0')} / ${get('month').padStart(2, '0')} / ${get('year')}`;
}

/**
 * The picker's "DD / MM / YYYY" Hijri string → Gregorian "YYYY-MM-DD".
 * Uses a linear search anchored near the approximate Gregorian equivalent
 * so the backend receives the date format it expects (YYYY-MM-DD).
 */
export function pickerHijriToGregorian(value: string | null | undefined): string {
  if (!value) return '';
  const m = value.match(/^(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{3,4})$/);
  if (!m) return '';
  const hDay = parseInt(m[1], 10);
  const hMonth = parseInt(m[2], 10);
  const hYear = parseInt(m[3], 10);
  // Approximate Gregorian start: Hijri year × (354.367/365.25) + 621.5, minus 60-day buffer
  const approxYear = Math.round((hYear - 1) * (354.367 / 365.25) + 622);
  const start = new Date(approxYear, 0, 1);
  start.setDate(start.getDate() - 60);
  for (let i = 0; i < 450; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const parts = HIJRI_FMT.formatToParts(d);
    const get = (t: string) => parseInt(parts.find((p) => p.type === t)?.value ?? '0', 10);
    if (get('day') === hDay && get('month') === hMonth && get('year') === hYear) {
      const y = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, '0');
      const da = String(d.getDate()).padStart(2, '0');
      return `${y}-${mo}-${da}`;
    }
  }
  return '';
}
