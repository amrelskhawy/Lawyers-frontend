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
