import { Component, computed, Input, signal } from '@angular/core';
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
export class CaseReportTemplate {
  readonly caseTypes = CASE_TYPE_OPTIONS;
  readonly requirements = REPORT_REQUIREMENTS;

  data = signal<CaseReportData>({});

  @Input() set value(v: CaseReportData | null | undefined) {
    this.data.set(v ?? {});
  }

  formattedCaseDate = computed(() => this.formatDate(this.data().caseDate));
  formattedHijriDate = computed(() => this.data().hijriDate ?? '');
  formattedSessionDate = computed(() => this.formatDate(this.data().sessionDate));

  freeLines = computed(() => {
    const raw = (this.data().freeNotes ?? '').split('\n');
    return Array.from({ length: 15 }, (_, i) => raw[i] ?? '');
  });

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
}
