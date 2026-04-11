import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Data } from '../../core/Servies/data';
import { IDataCase } from '../../core/Models/case.model';
import { IDataSessionReport } from '../../core/Models/session-report.model';
import { SessionReportPreviewData } from './session-report-template/session-report-template';

type SaveStatus = 'idle' | 'unsaved' | 'saving' | 'saved' | 'error';

@Component({
  selector: 'app-session-report',
  standalone: false,
  templateUrl: './session-report.html',
  styleUrl: './session-report.scss',
})
export class SessionReport implements OnInit, OnDestroy {
  constructor(
    private fb: FormBuilder,
    private data: Data,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  caseId = signal<string>('');
  reportId = signal<string>('');
  loading = signal<boolean>(true);
  saveStatus = signal<SaveStatus>('idle');
  generating = signal<boolean>(false);
  sending = signal<boolean>(false);
  loadedCase = signal<IDataCase | null>(null);
  loadedReport = signal<IDataSessionReport | null>(null);

  Form!: FormGroup;
  formTick = signal<number>(0);
  private destroy$ = new Subject<void>();
  private skipNextDirty = false;

  ngOnInit() {
    const caseId = this.route.snapshot.paramMap.get('caseId') ?? '';
    this.caseId.set(caseId);
    this.buildForm();
    this.bootstrap(caseId);
    this.wireDirtyTracking();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildForm() {
    // Only fields that actually render on the report preview — keep this
    // list in sync with session-report-template.html overlays.
    this.Form = this.fb.group({
      reportNumber: [''],
      courtName: [''],
      courtCircuit: [''],
      caseCharge: [''],
      opponentName: [''],
      caseNumber: [''],
      caseData: [''],
      sessionOrdinal: [''],
      sessionDate: [null],
      sessionTime: [''],
      hijriDate: [''],
      sessionSummary: [''],
    });
  }

  /**
   * Creates a fresh draft session report for this case, then loads the case
   * for pre-fill and starts the preview pipeline.
   * Per product: each visit opens a new draft (no existing-report picker).
   */
  private bootstrap(caseId: string) {
    this.loading.set(true);
    this.data.get<{ data: IDataCase }>(`cases/${caseId}`).subscribe({
      next: (caseRes) => {
        this.loadedCase.set(caseRes.data);
        this.data
          .post<{ data: IDataSessionReport }>('session-reports', { caseId })
          .subscribe({
            next: (reportRes) => {
              this.loadedReport.set(reportRes.data);
              this.reportId.set(reportRes.data.id);
              this.skipNextDirty = true;
              // Nothing to pre-fill on the form (draft starts empty) — case
              // fields render from loadedCase() directly into the preview.
              this.loading.set(false);
              this.saveStatus.set('idle');
            },
            error: () => this.loading.set(false),
          });
      },
      error: () => this.loading.set(false),
    });
  }

  private wireDirtyTracking() {
    this.Form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.formTick.update((n) => n + 1);
      if (this.skipNextDirty) {
        this.skipNextDirty = false;
        return;
      }
      if (this.loading()) return;
      this.saveStatus.set('unsaved');
    });
  }

  previewData = computed<SessionReportPreviewData>(() => {
    void this.formTick();
    const v = this.Form?.value ?? {};
    const c = this.loadedCase();
    return {
      id: this.reportId(),
      reportNumber: v.reportNumber,
      customerName: c?.customer?.fullName ?? '',
      customerPhone: c?.customer?.phone ?? '',
      caseType: c?.caseType ?? null,
      preferredLawyerName: c?.preferredLawyer?.name ?? '',

      courtName: v.courtName,
      courtCircuit: v.courtCircuit,
      caseCharge: v.caseCharge,
      opponentName: v.opponentName,
      caseNumber: v.caseNumber,
      caseData: v.caseData,
      sessionOrdinal: v.sessionOrdinal,
      sessionDate: v.sessionDate,
      sessionTime: v.sessionTime,
      hijriDate: v.hijriDate,
      sessionSummary: v.sessionSummary,
    };
  });

  save() {
    if (!this.reportId() || this.saveStatus() === 'saving') return;
    this.saveStatus.set('saving');
    this.data
      .patch<{ data: IDataSessionReport }>(
        `session-reports/${this.reportId()}`,
        this.toPayload(this.Form.value),
      )
      .subscribe({
        next: (res) => {
          this.loadedReport.set(res.data);
          this.saveStatus.set('saved');
        },
        error: () => this.saveStatus.set('error'),
      });
  }

  private toIsoOrNull(v: any): string | null {
    if (!v) return null;
    const d = v instanceof Date ? v : new Date(v);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }

  private toPayload(v: any) {
    return {
      reportNumber: v.reportNumber || null,
      sessionDate: this.toIsoOrNull(v.sessionDate),
      sessionSummary: v.sessionSummary || null,
      courtName: v.courtName || null,
      courtCircuit: v.courtCircuit || null,
      caseCharge: v.caseCharge || null,
      opponentName: v.opponentName || null,
      caseNumber: v.caseNumber || null,
      caseData: v.caseData || null,
      sessionOrdinal: v.sessionOrdinal || null,
      sessionTime: v.sessionTime || null,
      hijriDate: v.hijriDate || null,
    };
  }

  generatePdf() {
    if (!this.reportId()) return;
    this.generating.set(true);
    this.data
      .post<{ data: IDataSessionReport }>(
        `session-reports/${this.reportId()}/generate-pdf`,
        {},
      )
      .subscribe({
        next: (res) => {
          this.loadedReport.set(res.data);
          this.generating.set(false);
          if (res.data.reportUrl) window.open(res.data.reportUrl, '_blank');
        },
        error: () => this.generating.set(false),
      });
  }

  sendToClient() {
    if (!this.reportId()) return;
    this.sending.set(true);
    this.data
      .post<{ data: IDataSessionReport }>(
        `session-reports/${this.reportId()}/send-to-client`,
        {},
      )
      .subscribe({
        next: (res) => {
          this.loadedReport.set(res.data);
          this.sending.set(false);
        },
        error: () => this.sending.set(false),
      });
  }

  back() {
    this.router.navigate(['/dashboard/content/client-cases']);
  }
}
