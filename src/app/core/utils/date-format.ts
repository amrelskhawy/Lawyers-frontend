/**
 * PrimeNG's p-datepicker (no time picker) returns a JS `Date` at *local*
 * midnight for the day the user picked. Calling `.toISOString()` on that
 * directly shifts it by the browser's UTC offset — in UTC+ zones this can
 * push the stored instant back into the previous day, and near month
 * boundaries into the previous month, silently corrupting which day/month
 * the record is filed and reported under. This rebuilds the same local
 * Y/M/D at UTC midnight instead, so the stored calendar date always matches
 * what the user picked regardless of timezone.
 */
export function toIsoCalendarDate(v: unknown): string | null {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v as string);
  if (isNaN(d.getTime())) return null;
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString();
}
