import { Component, Input, computed, signal } from '@angular/core';
import { CASE_TYPE_OPTIONS, CaseType } from '../../../core/Models/case.model';

export interface SessionReportPreviewData {
  id?: string | null;
  reportNumber?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  caseType?: CaseType | null;
  preferredLawyerName?: string | null;

  courtName?: string | null;
  courtCircuit?: string | null;
  caseCharge?: string | null;
  opponentName?: string | null;
  caseNumber?: string | null;
  caseData?: string | null;
  sessionOrdinal?: string | null;
  attendanceOrdinal?: string | null;
  sessionTime?: string | null;
  hijriDate?: string | null;

  sessionTitle?: string | null;
  sessionDate?: string | Date | null;
  nextSessionDate?: string | Date | null;
  sessionSummary?: string | null;
  courtDecision?: string | null;
  lawyerNotes?: string | null;
  closingNote?: string | null;
}

const DEFAULT_CLOSING_NOTE = 'وسنوافيكم بأي مستجدات خلال الفترة القادمة إن شاء الله .';

@Component({
  selector: 'app-session-report-template',
  standalone: false,
  templateUrl: './session-report-template.html',
  styleUrl: './session-report-template.scss',
})
export class SessionReportTemplate {
  data = signal<SessionReportPreviewData>({});

  @Input() set value(v: SessionReportPreviewData | null | undefined) {
    this.data.set(v ?? {});
  }

  caseTypeLabel = computed(() => {
    const t = this.data().caseType;
    return t ? (CASE_TYPE_OPTIONS.find((o) => o.value === t)?.label ?? t) : '';
  });

  formattedSessionDate = computed(() => this.formatDate(this.data().sessionDate));
  closingText = computed(() => this.data().closingNote?.trim() || DEFAULT_CLOSING_NOTE);
  reportNumber = computed(() => {
    const manual = (this.data().reportNumber ?? '').toString().trim();
    if (manual) return manual;
    return (this.data().id ?? '').toString().slice(0, 4).toUpperCase();
  });

  private formatDate(value: string | Date | null | undefined): string {
    if (!value) return '';
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day} / ${month} / ${d.getFullYear()}`;
  }
}
