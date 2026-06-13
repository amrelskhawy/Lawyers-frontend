/**
 * Format a 24-hour "HH:mm" (or "H:mm[:ss]") time-of-day string into 12-hour
 * "h:mm AM/PM". Returns '' for empty input and passes through anything that
 * isn't a recognisable time so it never blanks out unexpected data.
 */
export function format12h(value: string | null | undefined): string {
  if (!value) return '';
  const m = String(value).match(/^(\d{1,2}):(\d{2})/);
  if (!m) return String(value);
  let h = parseInt(m[1], 10);
  if (Number.isNaN(h)) return String(value);
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m[2]} ${period}`;
}
