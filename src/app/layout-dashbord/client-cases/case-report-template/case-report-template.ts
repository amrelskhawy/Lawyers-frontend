import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  ViewChild,
  computed,
  effect,
  signal,
} from '@angular/core';
import {
  CASE_TYPE_OPTIONS,
  CaseType,
  REPORT_REQUIREMENTS,
} from '../../../core/Models/case.model';

export interface CaseReportData {
  customerName?: string | null;
  customerPhone?: string | null;
  caseType?: CaseType | null;
  otherCaseType?: string | null;
  caseDate?: string | Date | null;
  hijriDate?: string | null;
  agencyNumber?: string | null;

  wantsSpecificLawyer?: boolean | null;
  preferredLawyerName?: string | null;

  sessionReceiverName?: string | null;
  sessionDate?: string | Date | null;

  hasStructuredNotes?: boolean | null;
  weaknesses?: string[] | null;
  strengths?: string[] | null;
  gaps?: string[] | null;
  freeNotes?: string | null;
}

@Component({
  selector: 'app-case-report-template',
  standalone: false,
  templateUrl: './case-report-template.html',
  styleUrl: './case-report-template.scss',
})
export class CaseReportTemplate implements AfterViewInit, OnDestroy {
  readonly caseTypes = CASE_TYPE_OPTIONS;
  readonly requirements = REPORT_REQUIREMENTS;

  data = signal<CaseReportData>({});

  /** Flowing-text pages produced by measurement-based pagination. */
  pages = signal<string[]>(['']);

  @ViewChild('measureFirst') measureFirst?: ElementRef<HTMLElement>;
  @ViewChild('measureAdd')   measureAdd?:   ElementRef<HTMLElement>;

  private viewReady = false;
  private scheduled = false;
  private resizeObs?: ResizeObserver;

  constructor(private zone: NgZone) {
    effect(() => {
      // re-paginate whenever the input data changes
      this.data();
      this.schedulePaginate();
    });
  }

  @Input() set value(v: CaseReportData | null | undefined) {
    this.data.set(v ?? {});
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.resizeObs = new ResizeObserver(() => this.schedulePaginate());
    if (this.measureFirst) this.resizeObs.observe(this.measureFirst.nativeElement);
    this.schedulePaginate();
  }

  ngOnDestroy(): void {
    this.resizeObs?.disconnect();
  }

  formattedCaseDate = computed(() => this.formatDate(this.data().caseDate));
  formattedHijriDate = computed(() => this.data().hijriDate ?? '');
  formattedSessionDate = computed(() => this.formatDate(this.data().sessionDate));

  isChecked(t: CaseType): boolean {
    return this.data().caseType === t;
  }

  getLabel(t: { value: CaseType; label: string }): string {
    if (t.value === 'OTHER' && this.data().otherCaseType) {
      return `أخرى: ${this.data().otherCaseType}`;
    }
    return t.label;
  }

  private formatDate(value: string | Date | null | undefined): string {
    if (!value) return '';
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day} / ${month} / ${d.getFullYear()}`;
  }

  private schedulePaginate(): void {
    if (!this.viewReady || this.scheduled) return;
    this.scheduled = true;
    this.zone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        this.scheduled = false;
        this.zone.run(() => this.paginate());
      });
    });
  }

  private paginate(): void {
    const first = this.measureFirst?.nativeElement;
    const add   = this.measureAdd?.nativeElement;
    const text  = (this.data().freeNotes ?? '').toString();
    if (!first || !add) {
      this.pages.set([text]);
      return;
    }
    const next = splitTextToPages(text, first, add);
    const cur = this.pages();
    if (next.length === cur.length && next.every((p, i) => p === cur[i])) return;
    this.pages.set(next);
  }
}

function splitTextToPages(text: string, measureFirst: HTMLElement, measureAdd: HTMLElement): string[] {
  if (!text) return [''];

  const fits = (el: HTMLElement, s: string): boolean => {
    el.textContent = s;
    return el.scrollHeight <= el.clientHeight + 1;
  };

  const splitOne = (el: HTMLElement, str: string): [string, string] => {
    if (fits(el, str)) return [str, ''];
    const tokens = str.split(/(\s+)/);
    let lo = 0, hi = tokens.length;
    while (lo < hi) {
      const mid = Math.floor((lo + hi + 1) / 2);
      if (fits(el, tokens.slice(0, mid).join(''))) lo = mid;
      else hi = mid - 1;
    }
    if (lo <= 0) {
      // Single token too long — fall back to char-level binary search
      let cLo = 0, cHi = str.length;
      while (cLo < cHi) {
        const m = Math.floor((cLo + cHi + 1) / 2);
        if (fits(el, str.slice(0, m))) cLo = m;
        else cHi = m - 1;
      }
      if (cLo === 0) cLo = 1;
      return [str.slice(0, cLo), str.slice(cLo)];
    }
    const head = tokens.slice(0, lo).join('');
    const tail = tokens.slice(lo).join('').replace(/^\s+/, '');
    return [head, tail];
  };

  const out: string[] = [];
  let remaining = text;
  const [first, afterFirst] = splitOne(measureFirst, remaining);
  out.push(first);
  remaining = afterFirst;
  let safety = 200;
  while (remaining && safety-- > 0) {
    const [page, rest] = splitOne(measureAdd, remaining);
    if (!page) break;
    out.push(page);
    remaining = rest;
  }
  return out;
}
