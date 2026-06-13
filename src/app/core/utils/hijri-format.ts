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
