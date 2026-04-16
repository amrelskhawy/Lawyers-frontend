import {
  Component,
  ElementRef,
  forwardRef,
  HostListener,
  Input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/* ── Hijri helper utilities using Intl (islamic-umalqura) ── */

interface HijriParts {
  day: number;
  month: number;
  year: number;
}

const HIJRI_FMT = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
});

function toHijri(d: Date): HijriParts {
  const parts = HIJRI_FMT.formatToParts(d);
  return {
    day: parseInt(parts.find((p) => p.type === 'day')!.value, 10),
    month: parseInt(parts.find((p) => p.type === 'month')!.value, 10),
    year: parseInt(parts.find((p) => p.type === 'year')!.value, 10),
  };
}

const HIJRI_MONTHS: string[] = [
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

const WEEK_DAYS: string[] = ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'];

interface DayCell {
  gregorian: Date;
  hijriDay: number;
  inMonth: boolean;
}

/**
 * Find the first Gregorian date whose Hijri representation falls in the
 * given Hijri month/year.
 */
function firstOfHijriMonth(refDate: Date, hMonth: number, hYear: number): Date {
  const d = new Date(refDate);
  // Walk backwards to start of current hijri month
  let p = toHijri(d);
  while (p.month === hMonth && p.year === hYear) {
    d.setDate(d.getDate() - 1);
    p = toHijri(d);
  }
  d.setDate(d.getDate() + 1); // step back into the month
  return d;
}

function buildMonthGrid(refDate: Date): {
  cells: DayCell[];
  hMonth: number;
  hYear: number;
} {
  const ref = toHijri(refDate);
  const first = firstOfHijriMonth(refDate, ref.month, ref.year);

  // Collect all days in the Hijri month
  const monthDays: DayCell[] = [];
  const d = new Date(first);
  let p = toHijri(d);
  while (p.month === ref.month && p.year === ref.year) {
    monthDays.push({ gregorian: new Date(d), hijriDay: p.day, inMonth: true });
    d.setDate(d.getDate() + 1);
    p = toHijri(d);
  }

  // Pad start to align with weekday (Sunday = 0)
  const startDow = first.getDay(); // 0-6
  const prefix: DayCell[] = [];
  for (let i = startDow - 1; i >= 0; i--) {
    const pd = new Date(first);
    pd.setDate(pd.getDate() - (startDow - i));
    const pp = toHijri(pd);
    prefix.push({ gregorian: pd, hijriDay: pp.day, inMonth: false });
  }

  const combined = [...prefix, ...monthDays];

  // Pad end to fill last week row
  const remainder = combined.length % 7;
  if (remainder > 0) {
    const lastDay = monthDays[monthDays.length - 1].gregorian;
    for (let i = 1; i <= 7 - remainder; i++) {
      const nd = new Date(lastDay);
      nd.setDate(nd.getDate() + i);
      const np = toHijri(nd);
      combined.push({ gregorian: nd, hijriDay: np.day, inMonth: false });
    }
  }

  return { cells: combined, hMonth: ref.month, hYear: ref.year };
}

@Component({
  selector: 'app-hijri-datepicker',
  standalone: false,
  templateUrl: './hijri-datepicker.html',
  styleUrl: './hijri-datepicker.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => HijriDatepicker),
      multi: true,
    },
  ],
})
export class HijriDatepicker implements ControlValueAccessor {
  @Input() placeholder = '';
  @Input() showClear = false;

  open = signal(false);
  disabled = signal(false);
  displayValue = signal('');

  // Calendar state
  viewRef = new Date(); // Gregorian reference for the viewed month
  cells = signal<DayCell[]>([]);
  headerMonth = signal('');
  headerYear = signal(0);
  selectedGregorian: Date | null = null;

  readonly weekDays = WEEK_DAYS;

  private onChange: (v: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private elRef: ElementRef) {
    this.buildGrid(new Date());
  }

  /* ── ControlValueAccessor ── */

  writeValue(val: string | null): void {
    if (!val) {
      this.displayValue.set('');
      this.selectedGregorian = null;
      return;
    }
    this.displayValue.set(val);
    // Parse "DD / MM / YYYY" hijri string → find a ref gregorian date
    // We store the string as-is; no reverse conversion needed for display
  }

  registerOnChange(fn: (v: string | null) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(d: boolean): void {
    this.disabled.set(d);
  }

  /* ── UI actions ── */

  toggle() {
    if (this.disabled()) return;
    this.onTouched();
    if (!this.open()) {
      // Reset view to selected date or today
      this.buildGrid(this.selectedGregorian ?? new Date());
    }
    this.open.set(!this.open());
  }

  prevMonth() {
    // Go to the day before the first cell of current grid
    const firstCell = this.cells()[0];
    if (!firstCell) return;
    const prev = new Date(firstCell.gregorian);
    prev.setDate(prev.getDate() - 1);
    this.buildGrid(prev);
  }

  nextMonth() {
    // Go to the day after the last cell of current grid
    const lastCell = this.cells()[this.cells().length - 1];
    if (!lastCell) return;
    const next = new Date(lastCell.gregorian);
    next.setDate(next.getDate() + 1);
    this.buildGrid(next);
  }

  selectDay(cell: DayCell) {
    if (!cell.inMonth) {
      // Clicked a day in a neighboring month — navigate to it
      this.buildGrid(cell.gregorian);
      // Don't select yet; let user click the in-month day
      return;
    }
    this.selectedGregorian = cell.gregorian;
    const h = toHijri(cell.gregorian);
    const str = `${String(h.day).padStart(2, '0')} / ${String(h.month).padStart(2, '0')} / ${h.year}`;
    this.displayValue.set(str);
    this.onChange(str);
    this.open.set(false);
  }

  clear(event: Event) {
    event.stopPropagation();
    this.selectedGregorian = null;
    this.displayValue.set('');
    this.onChange(null);
  }

  isSelected(cell: DayCell): boolean {
    if (!this.selectedGregorian) return false;
    return cell.gregorian.toDateString() === this.selectedGregorian.toDateString();
  }

  isToday(cell: DayCell): boolean {
    return cell.gregorian.toDateString() === new Date().toDateString();
  }

  /* ── Close on outside click ── */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (this.open() && !this.elRef.nativeElement.contains(event.target)) {
      this.open.set(false);
    }
  }

  /* ── Internal ── */

  private buildGrid(ref: Date) {
    this.viewRef = ref;
    const { cells, hMonth, hYear } = buildMonthGrid(ref);
    this.cells.set(cells);
    this.headerMonth.set(HIJRI_MONTHS[hMonth - 1]);
    this.headerYear.set(hYear);
  }
}
