import moment from 'moment-hijri';
import { HijriCalendar } from './hijri-calendar';

describe('HijriCalendar', () => {
  let svc: HijriCalendar;

  beforeEach(() => {
    svc = new HijriCalendar();
  });

  describe('addMonths', () => {
    it('steps forward within a year', () => {
      expect(svc.addMonths(1447, 3, 2)).toEqual({ iYear: 1447, iMonth: 5 });
    });

    it('rolls over into the next year', () => {
      expect(svc.addMonths(1447, 12, 1)).toEqual({ iYear: 1448, iMonth: 1 });
    });

    it('rolls back into the previous year', () => {
      expect(svc.addMonths(1448, 1, -1)).toEqual({ iYear: 1447, iMonth: 12 });
    });

    it('handles multi-year jumps', () => {
      expect(svc.addMonths(1447, 6, 24)).toEqual({ iYear: 1449, iMonth: 6 });
    });
  });

  describe('monthLabel', () => {
    it('renders the Arabic month name with the year', () => {
      expect(svc.monthLabel(1447, 12)).toBe('ذو الحجة 1447');
      expect(svc.monthLabel(1447, 1)).toBe('محرم 1447');
    });
  });

  describe('buildMonthGrid', () => {
    const grid = () => svc.buildMonthGrid(1447, 12);

    it('always returns 6 rows of 7 cells', () => {
      const g = grid();
      expect(g.length).toBe(6);
      g.forEach((row) => expect(row.length).toBe(7));
    });

    it('starts the grid on a Sunday', () => {
      const first = grid()[0][0];
      const m = moment(first.hijri, 'iYYYY-iMM-iDD');
      expect(m.day()).toBe(0); // 0 = Sunday
    });

    it('contains day 1 of the target month flagged inMonth', () => {
      const flat = grid().flat();
      const dayOne = flat.find((c) => c.hijri === '1447-12-01');
      expect(dayOne).toBeTruthy();
      expect(dayOne!.inMonth).toBeTrue();
    });

    it('flags exactly the days that belong to the month', () => {
      const inMonth = grid()
        .flat()
        .filter((c) => c.inMonth);
      // Days in the Hijri month = difference between the 1st of this month and the next.
      const monthStart = moment('1447-12-01', 'iYYYY-iMM-iDD');
      const nextStart = moment('1448-01-01', 'iYYYY-iMM-iDD');
      const daysInMonth = nextStart.diff(monthStart, 'days');
      expect(inMonth.length).toBe(daysInMonth);
      // all in-month cells share the same iMonth
      inMonth.forEach((c) => expect(c.hijri.startsWith('1447-12-')).toBeTrue());
    });

    it('lays out 42 contiguous calendar days', () => {
      const flat = grid().flat();
      const start = moment(flat[0].hijri, 'iYYYY-iMM-iDD');
      const end = moment(flat[41].hijri, 'iYYYY-iMM-iDD');
      expect(end.diff(start, 'days')).toBe(41);
    });

    it('zero-pads the canonical hijri keys', () => {
      const dayOne = grid()
        .flat()
        .find((c) => c.day === 1 && c.inMonth);
      expect(dayOne!.hijri).toBe('1447-12-01');
    });
  });

  describe('normalizeSessionHijri', () => {
    it('pads loose dates to canonical form', () => {
      expect(svc.normalizeSessionHijri('1447-1-5')).toBe('1447-01-05');
    });

    it('passes through already-canonical dates', () => {
      expect(svc.normalizeSessionHijri('1447-12-15')).toBe('1447-12-15');
    });

    it('returns null for empty or malformed input', () => {
      expect(svc.normalizeSessionHijri(null)).toBeNull();
      expect(svc.normalizeSessionHijri('')).toBeNull();
      expect(svc.normalizeSessionHijri('not-a-date')).toBeNull();
      expect(svc.normalizeSessionHijri('15 / 12 / 1447')).toBeNull();
    });
  });

  describe('bucketBySession', () => {
    it('groups items by canonical session date and skips null dates', () => {
      const items = [
        { id: 'a', s: '1447-12-15' },
        { id: 'b', s: '1447-12-15' },
        { id: 'c', s: '1447-1-5' }, // loose form → normalized to 1447-01-05
        { id: 'd', s: null },
        { id: 'e', s: '' },
      ];
      const map = svc.bucketBySession(items, (i) => i.s);

      expect(map.get('1447-12-15')!.map((i) => i.id)).toEqual(['a', 'b']);
      expect(map.get('1447-01-05')!.map((i) => i.id)).toEqual(['c']);
      expect(map.has('1447-1-5')).toBeFalse(); // stored under normalized key only
      // d and e contribute nothing
      const total = [...map.values()].reduce((n, arr) => n + arr.length, 0);
      expect(total).toBe(3);
    });
  });
});
