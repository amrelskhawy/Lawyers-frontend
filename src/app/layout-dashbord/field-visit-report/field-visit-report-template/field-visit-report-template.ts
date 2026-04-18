import { Component, Input, signal } from '@angular/core';

export interface FieldVisitReportPreviewData {
  reviewLawyer?:  string | null;
  reviewPlace?:   string | null;
  agencyNumber?:  string | null;
  clientName?:    string | null;
  caseNumber?:    string | null;
  reviewDate?:    string | Date | null;
  reportSummary?: string | null;
}

@Component({
  selector: 'app-field-visit-report-template',
  standalone: false,
  templateUrl: './field-visit-report-template.html',
  styleUrl: './field-visit-report-template.scss',
})
export class FieldVisitReportTemplate {
  data = signal<FieldVisitReportPreviewData>({});

  @Input() set value(v: FieldVisitReportPreviewData | null | undefined) {
    this.data.set(v ?? {});
  }

  formattedDate(value: string | Date | null | undefined): string {
    if (!value) return '';
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day} / ${month} / ${d.getFullYear()}`;
  }
}
