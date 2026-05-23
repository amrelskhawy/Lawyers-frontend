import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Data } from '../../../core/Servies/data';
import { CASE_TYPE_OPTIONS, IDataCase, ILawyerOption } from '../../../core/Models/case.model';
import { TEAM_MEMBERS } from '../../../core/Models/team-members';
import { IDataCustomer } from '../../../core/Models/customers.model';
import { IUser } from '../../users/users';
import { CaseReportData } from '../case-report-template/case-report-template';

type SaveStatus = 'idle' | 'unsaved' | 'saving' | 'saved' | 'error';

@Component({
  selector: 'app-edit-case',
  standalone: false,
  templateUrl: './edit-case.html',
  styleUrl: './edit-case.scss',
})
export class EditCase implements OnInit, OnDestroy {
  constructor(
    private fb: FormBuilder,
    private data: Data,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  readonly caseTypes = CASE_TYPE_OPTIONS;

  caseId = signal<string>('');
  loading = signal<boolean>(true);
  saveStatus = signal<SaveStatus>('idle');
  generating = signal<boolean>(false);
  sending = signal<boolean>(false);
  assigning = signal<boolean>(false);
  assignmentActioning = signal<boolean>(false);
  loadedCase = signal<IDataCase | null>(null);

  customers = signal<IDataCustomer[]>([]);
  lawyers = signal<ILawyerOption[]>([]);

  Form!: FormGroup;
  assignForm!: FormGroup;
  private destroy$ = new Subject<void>();
  private skipNextDirty = false;

  // Role helpers
  get currentUser(): any {
    const raw = sessionStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }
  get role(): string { return this.currentUser?.role ?? ''; }
  get isLawyer(): boolean { return this.role === 'LAWYER'; }
  get isStaff(): boolean { return ['ADMIN', 'MODERATOR', 'RECEPTIONIST'].includes(this.role); }
  get canAssign(): boolean { return ['ADMIN', 'MODERATOR', 'RECEPTIONIST'].includes(this.role); }

  get assignmentStatus() { return this.loadedCase()?.assignmentStatus ?? 'UNASSIGNED'; }
  get isPendingForMe(): boolean {
    const c = this.loadedCase();
    return this.isLawyer && c?.assignmentStatus === 'PENDING' && c?.preferredLawyerId === this.currentUser?.id;
  }
  get isAcceptedByMe(): boolean {
    const c = this.loadedCase();
    return this.isLawyer && c?.assignmentStatus === 'ACCEPTED' && c?.preferredLawyerId === this.currentUser?.id;
  }
  get previewShowPage1(): boolean { return !this.isLawyer; }
  get previewShowPage2(): boolean { return !['RECEPTIONIST'].includes(this.role); }

  // RECEPTIONIST can only assign a lawyer — cannot edit case data or notes
  get canEdit(): boolean {
    if (this.isLawyer) return this.isAcceptedByMe;
    if (this.role === 'RECEPTIONIST') return false;
    return ['ADMIN', 'MODERATOR'].includes(this.role);
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.caseId.set(id);
    this.buildForm();
    this.buildAssignForm();
    this.loadDropdowns();
    this.loadCase(id);
    this.wireDirtyTracking();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildForm() {
    this.Form = this.fb.group({
      customerId: ['', Validators.required],
      caseType: ['LABOR', Validators.required],
      otherCaseType: [''],
      caseDate: [new Date(), Validators.required],
      hijriDate: [null],
      agencyNumber: [''],

      sessionReceiverId: [null],
      sessionDate: [null],

      hasStructuredNotes: [false],
      weaknesses: this.fb.array([] as FormControl<string>[]),
      strengths: this.fb.array([] as FormControl<string>[]),
      gaps: this.fb.array([] as FormControl<string>[]),
      freeNotes: [''],
    });
  }

  private buildAssignForm() {
    this.assignForm = this.fb.group({
      lawyerId: [null, Validators.required],
    });
  }

  get weaknesses() { return this.Form.get('weaknesses') as FormArray; }
  get strengths() { return this.Form.get('strengths') as FormArray; }
  get gaps() { return this.Form.get('gaps') as FormArray; }

  addLine(group: 'weaknesses' | 'strengths' | 'gaps') {
    (this.Form.get(group) as FormArray).push(new FormControl<string>('', { nonNullable: true }));
  }
  removeLine(group: 'weaknesses' | 'strengths' | 'gaps', i: number) {
    (this.Form.get(group) as FormArray).removeAt(i);
  }

  private loadDropdowns() {
    this.data.get<{ data: IDataCustomer[] }>('customers').subscribe((res) => {
      this.customers.set(res.data ?? []);
    });
    this.data.get<{ data: IUser[] }>('admin/users?role=LAWYER').subscribe((res) => {
      this.lawyers.set(
        (res.data ?? []).map((u) => ({ id: u.id, name: u.nameAr || u.name, email: u.email })),
      );
    });
  }

  private loadCase(id: string) {
    this.loading.set(true);
    this.data.get<{ data: IDataCase }>(`cases/${id}`).subscribe({
      next: (res) => {
        const c = res.data;
        this.loadedCase.set(c);
        this.skipNextDirty = true;

        this.weaknesses.clear();
        (c.weaknesses ?? []).forEach((v) =>
          this.weaknesses.push(new FormControl(v, { nonNullable: true })),
        );
        this.strengths.clear();
        (c.strengths ?? []).forEach((v) =>
          this.strengths.push(new FormControl(v, { nonNullable: true })),
        );
        this.gaps.clear();
        (c.gaps ?? []).forEach((v) =>
          this.gaps.push(new FormControl(v, { nonNullable: true })),
        );

        let sessionReceiverFormId: string | null = c.sessionReceiverId;
        if (!sessionReceiverFormId && c.sessionReceiverName) {
          const match = TEAM_MEMBERS.find((m) => m.name_ar === c.sessionReceiverName);
          if (match) sessionReceiverFormId = `team:${match.name_en}`;
        }

        this.Form.patchValue({
          customerId: c.customerId,
          caseType: c.caseType,
          otherCaseType: c.otherCaseType ?? '',
          caseDate: c.caseDate ? new Date(c.caseDate) : null,
          hijriDate: c.hijriDate ?? null,
          agencyNumber: c.agencyNumber ?? '',
          sessionReceiverId: sessionReceiverFormId,
          sessionDate: c.sessionDate ? new Date(c.sessionDate) : null,
          hasStructuredNotes: c.hasStructuredNotes,
          freeNotes: c.freeNotes ?? '',
        });

        if (c.preferredLawyerId) {
          this.assignForm.patchValue({ lawyerId: c.preferredLawyerId });
        }

        this.loading.set(false);
        this.saveStatus.set('idle');
      },
      error: () => this.loading.set(false),
    });
  }

  private wireDirtyTracking() {
    this.Form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (this.skipNextDirty) {
        this.skipNextDirty = false;
        return;
      }
      if (this.loading()) return;
      this.saveStatus.set('unsaved');
    });
  }

  save() {
    if (!this.canEdit || this.saveStatus() === 'saving') return;
    this.saveStatus.set('saving');
    this.data
      .patch<{ data: IDataCase }>(`cases/${this.caseId()}`, this.toPayload(this.Form.value))
      .subscribe({
        next: (res) => {
          this.loadedCase.set(res.data);
          this.saveStatus.set('saved');
        },
        error: () => this.saveStatus.set('error'),
      });
  }

  private toPayload(value: any) {
    const rawSessionId: string | null = value.sessionReceiverId || null;
    const isSessionTeamMember = rawSessionId?.startsWith('team:') ?? false;
    const sessionReceiverId = isSessionTeamMember ? null : rawSessionId;
    const sessionReceiverName = isSessionTeamMember
      ? (TEAM_MEMBERS.find((m) => `team:${m.name_en}` === rawSessionId)?.name_ar ?? null)
      : null;

    return {
      customerId: value.customerId,
      caseType: value.caseType,
      otherCaseType: value.caseType === 'OTHER' ? (value.otherCaseType || null) : null,
      caseDate: value.caseDate
        ? (value.caseDate instanceof Date ? value.caseDate : new Date(value.caseDate)).toISOString()
        : undefined,
      sessionReceiverId,
      sessionReceiverName,
      sessionDate: value.sessionDate
        ? (value.sessionDate instanceof Date ? value.sessionDate : new Date(value.sessionDate)).toISOString()
        : null,
      hasStructuredNotes: false,
      weaknesses: (value.weaknesses ?? []).filter((s: string) => s && s.trim().length),
      strengths: (value.strengths ?? []).filter((s: string) => s && s.trim().length),
      gaps: (value.gaps ?? []).filter((s: string) => s && s.trim().length),
      freeNotes: value.freeNotes ?? null,
      hijriDate: value.hijriDate || null,
      agencyNumber: value.agencyNumber || null,
    };
  }

  assignLawyer() {
    if (!this.canAssign || this.assigning() || this.assignForm.invalid) return;
    const rawId: string | null = this.assignForm.value.lawyerId || null;
    if (!rawId || rawId.startsWith('team:')) return;

    this.assigning.set(true);
    this.data
      .patch<{ data: IDataCase }>(`cases/${this.caseId()}/assign`, { lawyerId: rawId })
      .subscribe({
        next: (res) => {
          this.loadedCase.set(res.data);
          this.assigning.set(false);
        },
        error: () => this.assigning.set(false),
      });
  }

  acceptAssignment() {
    if (!this.isPendingForMe || this.assignmentActioning()) return;
    this.assignmentActioning.set(true);
    this.data
      .patch<{ data: IDataCase }>(`cases/${this.caseId()}/assignment/accept`, {})
      .subscribe({
        next: (res) => {
          this.loadedCase.set(res.data);
          this.assignmentActioning.set(false);
        },
        error: () => this.assignmentActioning.set(false),
      });
  }

  rejectAssignment() {
    if (!this.isPendingForMe || this.assignmentActioning()) return;
    this.assignmentActioning.set(true);
    this.data
      .patch<{ data: IDataCase }>(`cases/${this.caseId()}/assignment/reject`, {})
      .subscribe({
        next: (res) => {
          this.loadedCase.set(res.data);
          this.assignmentActioning.set(false);
          this.router.navigate(['/dashboard/content/client-cases']);
        },
        error: () => this.assignmentActioning.set(false),
      });
  }

  // Live preview data
  previewData = computed<CaseReportData>(() => {
    void this.formTick();
    const v = this.Form?.value ?? {};
    const customer = this.customers().find((c) => c.id === v.customerId);
    const sessionReceiver = this.lawyers().find((l) => l.id === v.sessionReceiverId);
    const c = this.loadedCase();
    return {
      customerName: customer?.fullName ?? '',
      customerPhone: customer?.phone ?? '',
      caseType: v.caseType,
      otherCaseType: v.caseType === 'OTHER' ? v.otherCaseType : null,
      caseDate: v.caseDate ?? null,
      hijriDate: v.hijriDate ?? null,
      agencyNumber: v.agencyNumber ?? null,
      wantsSpecificLawyer: c?.wantsSpecificLawyer ?? false,
      preferredLawyerName: c?.preferredLawyerName ?? c?.preferredLawyer?.name ?? '',
      sessionReceiverName: sessionReceiver?.name ?? '',
      sessionDate: v.sessionDate ?? null,
      hasStructuredNotes: false,
      weaknesses: (v.weaknesses ?? []).filter((s: string) => !!s),
      strengths: (v.strengths ?? []).filter((s: string) => !!s),
      gaps: (v.gaps ?? []).filter((s: string) => !!s),
      freeNotes: v.freeNotes ?? '',
    };
  });

  formTick = signal<number>(0);

  ngAfterViewInit() {
    this.Form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.formTick.update((n) => n + 1);
    });
  }

  generatePdf() {
    this.generating.set(true);
    this.data
      .post<{ data: IDataCase }>(`cases/${this.caseId()}/generate-pdf`, {})
      .subscribe({
        next: (res) => {
          this.loadedCase.set(res.data);
          this.generating.set(false);
          if (res.data.reportUrl) window.open(res.data.reportUrl, '_blank');
        },
        error: () => this.generating.set(false),
      });
  }

  sendToClient() {
    this.sending.set(true);
    this.data
      .post<{ data: IDataCase }>(`cases/${this.caseId()}/send-to-client`, {})
      .subscribe({
        next: (res) => {
          this.loadedCase.set(res.data);
          this.sending.set(false);
        },
        error: () => this.sending.set(false),
      });
  }

  back() {
    this.router.navigate(['/dashboard/content/client-cases']);
  }
}
