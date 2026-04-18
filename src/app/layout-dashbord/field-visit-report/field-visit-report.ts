import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { Data } from '../../core/Servies/data';
import { IDataCase, ILawyerOption } from '../../core/Models/case.model';
import { IDataCustomer } from '../../core/Models/customers.model';
import { TEAM_MEMBERS } from '../../core/Models/team-members';
import { IFieldVisitReport } from '../../core/Models/field-visit-report.model';
import { FieldVisitReportPreviewData } from './field-visit-report-template/field-visit-report-template';

type SaveStatus = 'idle' | 'unsaved' | 'saving' | 'saved' | 'error';

@Component({
  selector: 'app-field-visit-report',
  standalone: false,
  templateUrl: './field-visit-report.html',
  styleUrl: './field-visit-report.scss',
})
export class FieldVisitReport implements OnInit, OnDestroy {
  constructor(
    private fb: FormBuilder,
    private data: Data,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  caseId    = signal<string>('');
  reportId  = signal<string>('');
  loading   = signal<boolean>(true);
  saveStatus = signal<SaveStatus>('idle');
  generating = signal<boolean>(false);
  sending    = signal<boolean>(false);
  loadedCase   = signal<IDataCase | null>(null);
  loadedReport = signal<IFieldVisitReport | null>(null);
  customers    = signal<IDataCustomer[]>([]);
  lawyers      = signal<ILawyerOption[]>([]);

  Form!: FormGroup;
  formTick = signal<number>(0);
  private destroy$ = new Subject<void>();
  private skipNextDirty = false;

  ngOnInit() {
    const caseId     = this.route.snapshot.paramMap.get('caseId') ?? '';
    const rawReportId = this.route.snapshot.paramMap.get('reportId') ?? '';
    const reportId   = rawReportId === 'new' ? '' : rawReportId;
    this.caseId.set(caseId);
    this.buildForm();
    this.wireDirtyTracking();
    this.bootstrap(caseId, reportId);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildForm() {
    this.Form = this.fb.group({
      reviewLawyer:  [''],
      reviewPlace:   [''],
      agencyNumber:  [''],
      clientName:    [''],
      caseNumber:    [''],
      reviewDate:    [null],
      reportSummary: [''],
    });
  }

  private bootstrap(caseId: string, reportId: string) {
    this.loading.set(true);
    forkJoin({
      caseRes:   this.data.get<{ data: IDataCase }>(`cases/${caseId}`),
      customers: this.data.get<{ data: IDataCustomer[] }>('customers'),
      lawyers:   this.data.get<{ data: ILawyerOption[] }>('cases/lawyers'),
    }).subscribe({
      next: ({ caseRes, customers, lawyers }) => {
        this.loadedCase.set(caseRes.data);
        this.customers.set(customers.data ?? []);
        const teamOptions: ILawyerOption[] = TEAM_MEMBERS
          .filter((m) => m.isLawyer)
          .map((m) => ({ id: `team:${m.name_en}`, name: m.name_ar, email: m.role_ar }));
        this.lawyers.set([...(lawyers.data ?? []), ...teamOptions]);
        if (reportId) {
          this.loadExisting(reportId);
        } else {
          this.findOrCreateDraft(caseId);
        }
      },
      error: () => this.loading.set(false),
    });
  }

  private findOrCreateDraft(caseId: string) {
    this.data
      .get<{ data: IFieldVisitReport[] }>(`field-visit-reports/by-case/${caseId}`)
      .subscribe({
        next: (res) => {
          const existing = (res.data ?? [])[0];
          if (existing) {
            this.patchReport(existing);
            this.router.navigate(
              ['/dashboard/content/field-visit-report', caseId, existing.id],
              { replaceUrl: true },
            );
          } else {
            this.createDraft(caseId);
          }
        },
        error: () => this.createDraft(caseId),
      });
  }

  private patchReport(r: IFieldVisitReport) {
    this.loadedReport.set(r);
    this.reportId.set(r.id);
    this.skipNextDirty = true;
    this.Form.patchValue({
      reviewLawyer:  r.reviewLawyer  ?? '',
      reviewPlace:   r.reviewPlace   ?? '',
      agencyNumber:  r.agencyNumber  ?? '',
      clientName:    r.clientName    ?? '',
      caseNumber:    r.caseNumber    ?? '',
      reviewDate:    r.reviewDate ? new Date(r.reviewDate) : null,
      reportSummary: r.reportSummary ?? '',
    }, { emitEvent: true });
    this.loading.set(false);
    this.saveStatus.set('saved');
  }

  private createDraft(caseId: string) {
    this.data
      .post<{ data: IFieldVisitReport }>('field-visit-reports', { caseId })
      .subscribe({
        next: (res) => {
          const report = res.data;
          this.loadedReport.set(report);
          this.reportId.set(report.id);

          // Pre-fill client name and agency number from the linked case
          const c = this.loadedCase();
          this.skipNextDirty = true;
          this.Form.patchValue({
            clientName:   c?.customer?.fullName ?? '',
            agencyNumber: c?.agencyNumber ?? '',
          });

          this.loading.set(false);
          this.saveStatus.set('idle');
          this.router.navigate(
            ['/dashboard/content/field-visit-report', caseId, report.id],
            { replaceUrl: true },
          );
        },
        error: () => this.loading.set(false),
      });
  }

  private loadExisting(reportId: string) {
    this.data
      .get<{ data: IFieldVisitReport }>(`field-visit-reports/${reportId}`)
      .subscribe({
        next: (res) => this.patchReport(res.data),
        error: () => this.loading.set(false),
      });
  }

  private wireDirtyTracking() {
    this.Form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.formTick.update((n) => n + 1);
      if (this.skipNextDirty) { this.skipNextDirty = false; return; }
      if (this.loading()) return;
      this.saveStatus.set('unsaved');
    });
  }

  previewData = computed<FieldVisitReportPreviewData>(() => {
    void this.formTick();
    const v = this.Form?.value ?? {};
    return {
      reviewLawyer:  v.reviewLawyer,
      reviewPlace:   v.reviewPlace,
      agencyNumber:  v.agencyNumber,
      clientName:    v.clientName,
      caseNumber:    v.caseNumber,
      reviewDate:    v.reviewDate,
      reportSummary: v.reportSummary,
    };
  });

  save() {
    if (!this.reportId() || this.saveStatus() === 'saving') return;
    this.saveStatus.set('saving');
    this.data
      .patch<{ data: IFieldVisitReport }>(
        `field-visit-reports/${this.reportId()}`,
        this.toPayload(this.Form.value),
      )
      .subscribe({
        next: (res) => { this.loadedReport.set(res.data); this.saveStatus.set('saved'); },
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
      reviewLawyer:  v.reviewLawyer  || null,
      reviewPlace:   v.reviewPlace   || null,
      agencyNumber:  v.agencyNumber  || null,
      clientName:    v.clientName    || null,
      caseNumber:    v.caseNumber    || null,
      reviewDate:    this.toIsoOrNull(v.reviewDate),
      reportSummary: v.reportSummary || null,
    };
  }

  generatePdf() {
    if (!this.reportId()) return;
    this.generating.set(true);
    this.data
      .post<{ data: IFieldVisitReport }>(`field-visit-reports/${this.reportId()}/generate-pdf`, {})
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
      .post<{ data: IFieldVisitReport }>(`field-visit-reports/${this.reportId()}/send-to-client`, {})
      .subscribe({
        next: (res) => { this.loadedReport.set(res.data); this.sending.set(false); },
        error: () => this.sending.set(false),
      });
  }

  back() {
    const caseId = this.caseId();
    if (caseId) {
      this.router.navigate(['/dashboard/content/client-cases', caseId, 'edit']);
    } else {
      this.router.navigate(['/dashboard/content/client-cases']);
    }
  }
}
