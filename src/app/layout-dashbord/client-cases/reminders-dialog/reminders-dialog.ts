import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Data } from '../../../core/Servies/data';
import { CASE_DEGREE_OPTIONS, CaseDegree, IDataCase } from '../../../core/Models/case.model';
import { IAttachment, IReminder, IReminderTypeOption } from '../../../core/Models/reminder.model';
import {
  canonicalToPickerHijri,
  gregorianToPickerHijri,
  pickerHijriToGregorian,
  pickerToCanonicalHijri,
} from '../../../core/utils/hijri-format';
import { format12h } from '../../../core/utils/time-format';

@Component({
  selector: 'app-reminders-dialog',
  standalone: false,
  templateUrl: './reminders-dialog.html',
  styleUrl: './reminders-dialog.scss',
})
export class RemindersDialog {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  /** Emitted when the case itself changes (e.g. degree saved) so the parent table can refresh. */
  @Output() caseUpdated = new EventEmitter<IDataCase>();

  activeTab = signal<'session' | 'reminders' | 'docs'>('session');
  isExpanded = signal<boolean>(false);
  showAddForm = signal<boolean>(false);

  caseItem = signal<IDataCase | null>(null);
  // Court + case number editor (bound to the inputs; persisted state lives on caseItem).
  courtName = signal<string>('');
  caseNumber = signal<string>('');
  courtInfoSaving = signal<boolean>(false);
  courtInfoSaved = signal<boolean>(false);
  reminders = signal<IReminder[]>([]);
  types = signal<IReminderTypeOption[]>([]);
  editingId = signal<string | null>(null);
  sessionSaved = signal<boolean>(false);
  attachments = signal<IAttachment[]>([]);
  selectedFiles = signal<File[]>([]);
  uploading = signal<boolean>(false);
  // Id of the attachment whose WhatsApp message input is open, plus its text.
  sendingId = signal<string | null>(null);
  sendMessage = signal<string>('');
  sendInFlight = signal<boolean>(false);
  // Litigation degree (الدرجة) — fixed color per degree, shown in the cases table.
  degreeOptions = CASE_DEGREE_OPTIONS;
  selectedDegree = signal<CaseDegree | ''>('');
  otherDegreeText = signal<string>('');
  degreeSaving = signal<boolean>(false);
  degreeSaved = signal<boolean>(false);
  // Memo-request section (LAWYER / ADMIN / MODERATOR send to assigned consultant).
  needsMemo = signal<boolean>(false);
  memoDeadline = signal<string>('');
  memoType = signal<string>('');
  memoSending = signal<boolean>(false);
  memoSent = signal<boolean>(false);
  memoError = signal<string>('');
  form: FormGroup;
  sessionForm: FormGroup;

  get currentUser(): { id: string; role: string } | null {
    const raw = sessionStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }

  get role(): string {
    return this.currentUser?.role ?? '';
  }

  get isStaff(): boolean {
    return ['ADMIN', 'MODERATOR'].includes(this.role);
  }

  get isCaseHandler(): boolean {
    return this.role === 'LAWYER' || this.role === 'CONSULTANT';
  }

  /** Lawyers/consultants may only edit or delete reminders they created manually. */
  canManageReminder(r: IReminder): boolean {
    if (this.isStaff) return true;
    if (this.isCaseHandler) {
      return !r.autoScheduled && r.createdById === this.currentUser?.id;
    }
    return false;
  }

  get isConsultant(): boolean {
    return this.role === 'CONSULTANT';
  }

  /** Only LAWYER, ADMIN, MODERATOR can trigger memo requests (consultant is the recipient). */
  get canSendMemoRequest(): boolean {
    return ['ADMIN', 'MODERATOR', 'LAWYER'].includes(this.role);
  }

  constructor(private fb: FormBuilder, private data: Data) {
    this.form = this.fb.group({
      type: ['SESSION_DETAILS_REVIEW', Validators.required],
      content: [''],
      date: ['', Validators.required],
      time: ['', Validators.required],
      repeat: [false],
      repeatEveryHours: [{ value: null, disabled: true }],


    });

    // Separate form for editing the case's next-session (Hijri) date inline.
    // `date` holds the picker's "DD / MM / YYYY" Hijri string; saving it
    // (re)schedules the 3 session reminders on the backend.
    this.sessionForm = this.fb.group({
      date: ['', Validators.required],
      time: ['', [Validators.required, Validators.pattern(/^\d{1,2}:\d{2}$/)]],
    });

    this.form.get('repeat')!.valueChanges.subscribe((on: boolean) => {
      const ctrl = this.form.get('repeatEveryHours')!;
      if (on) {
        ctrl.enable();
        ctrl.addValidators([Validators.required, Validators.min(1)]);
      } else {
        ctrl.clearValidators();
        ctrl.setValue(null);
        ctrl.disable();
      }
      ctrl.updateValueAndValidity();
    });
  }

  // Two-way binding setter: parent passes the case to manage reminders for.
  @Input() set objCase(value: IDataCase | null) {
    this.caseItem.set(value ?? null);
    this.sessionSaved.set(false);
    this.selectedDegree.set(value?.caseDegree ?? '');
    this.otherDegreeText.set(value?.otherDegreeText ?? '');
    this.degreeSaved.set(false);
    this.courtName.set(value?.courtName ?? '');
    this.caseNumber.set(value?.caseNumber ?? '');
    this.courtInfoSaved.set(false);
    this.prefillSessionForm(value);
    // Initialise memo section from the case's persisted state.
    this.needsMemo.set(value?.needsMemo ?? false);
    this.memoDeadline.set(
      value?.memoDeadline ? gregorianToPickerHijri(value.memoDeadline) : '',
    );
    this.memoType.set(value?.memoType ?? '');
    this.memoSent.set(false);
    this.memoError.set('');
    if (value?.id) {
      this.loadTypes();
      this.loadReminders(value.id);
      this.loadAttachments(value.id);
    }
    this.applyCompletionState();
  }

  /** A completed case is read-only for reminder actions. */
  get isCompleted(): boolean {
    return !!this.caseItem()?.completedAt;
  }

  /** Disable the reminder form while the case is completed; re-enable on reopen. */
  private applyCompletionState() {
    if (this.isCompleted) {
      this.form.disable({ emitEvent: false });
    } else {
      this.form.enable({ emitEvent: false });
      // `repeatEveryHours` is only enabled when `repeat` is on.
      if (!this.form.get('repeat')!.value) {
        this.form.get('repeatEveryHours')!.disable({ emitEvent: false });
      }
    }
  }

  private prefillSessionForm(c: IDataCase | null) {
    this.sessionForm.reset({
      date: canonicalToPickerHijri(c?.sessionHijriDate),
      time: c?.sessionTime ?? '',
    });
  }

  get hasSessionDate(): boolean {
    return !!this.caseItem()?.sessionDate;
  }

  /** Persist the next-session (Hijri) date to the case via the dedicated
   *  endpoint — this also (re)schedules the 3 session reminders. Reflect the
   *  result locally so reminder validation uses it immediately. */
  saveSessionDate() {
    if (this.sessionForm.invalid) {
      this.sessionForm.markAllAsTouched();
      return;
    }
    const caseId = this.caseItem()?.id;
    if (!caseId) return;

    const { date, time } = this.sessionForm.value;
    this.data
      .patch<{ data: IDataCase }>(`cases/${caseId}/session`, {
        sessionHijriDate: pickerToCanonicalHijri(date),
        sessionTime: time,
      })
      .subscribe((res) => {
        this.caseItem.set(res.data);
        this.prefillSessionForm(res.data);
        this.sessionSaved.set(true);
        this.loadReminders(caseId);
      });
  }

  /** Remove the next-session date/time (e.g. entered by mistake). Clears both
   *  fields via the same endpoint with `null`s — the backend also cancels the
   *  auto-scheduled session reminders. */
  clearSessionDate() {
    const caseId = this.caseItem()?.id;
    if (!caseId || this.isConsultant || !this.hasSessionDate) return;

    this.data
      .patch<{ data: IDataCase }>(`cases/${caseId}/session`, {
        sessionHijriDate: null,
        sessionTime: null,
      })
      .subscribe((res) => {
        this.caseItem.set(res.data);
        this.prefillSessionForm(res.data);
        this.sessionSaved.set(false);
        this.loadReminders(caseId);
      });
  }

  /** True once the case has both a court and a case number persisted — the
   *  precondition for creating any reminder (enforced again on the backend). */
  get hasCaseInfo(): boolean {
    const c = this.caseItem();
    return !!c?.courtName?.trim() && !!c?.caseNumber?.trim();
  }

  /** Persist the court + case number entered inline in the reminders dialog. */
  saveCourtInfo() {
    const caseId = this.caseItem()?.id;
    if (!caseId || this.isConsultant) return;

    this.courtInfoSaving.set(true);
    this.data
      .patch<{ data: IDataCase }>(`cases/${caseId}/court-info`, {
        courtName: this.courtName().trim() || null,
        caseNumber: this.caseNumber().trim() || null,
      })
      .subscribe({
        next: (res) => {
          this.caseItem.set(res.data);
          this.courtName.set(res.data.courtName ?? '');
          this.caseNumber.set(res.data.caseNumber ?? '');
          this.courtInfoSaving.set(false);
          this.courtInfoSaved.set(true);
        },
        error: () => this.courtInfoSaving.set(false),
      });
  }

  get selectedDegreeColor(): string {
    const d = this.selectedDegree();
    return this.degreeOptions.find((o) => o.value === d)?.color ?? '#cbd5e1';
  }

  onDegreeChange(value: CaseDegree | '') {
    this.selectedDegree.set(value);
    this.degreeSaved.set(false);
    if (value !== 'OTHER') this.otherDegreeText.set('');
  }

  /** Persist the litigation degree to the case and notify the parent table. */
  saveDegree() {
    const caseId = this.caseItem()?.id;
    const caseDegree = this.selectedDegree();
    if (!caseId || !caseDegree) return;

    const body: any = { caseDegree };
    if (caseDegree === 'OTHER') body.otherDegreeText = this.otherDegreeText();
    this.degreeSaving.set(true);
    this.data.patch<{ data: IDataCase }>(`cases/${caseId}/degree`, body).subscribe({
      next: (res) => {
        this.caseItem.set(res.data);
        this.degreeSaving.set(false);
        this.degreeSaved.set(true);
        this.caseUpdated.emit(res.data);
      },
      error: () => this.degreeSaving.set(false),
    });
  }

  get selectedTypeDescription(): string {
    const t = this.form.get('type')!.value;
    return this.types().find((x) => x.value === t)?.description ?? '';
  }

  get sessionDate(): string {
    const c = this.caseItem();
    if (!c?.sessionHijriDate) return '';
    const date = canonicalToPickerHijri(c.sessionHijriDate);
    return c.sessionTime ? `${date} - ${format12h(c.sessionTime)}` : date;
  }

  private loadTypes() {
    this.data.get<{ data: IReminderTypeOption[] }>('reminders/types').subscribe((res) => {
      this.types.set(res.data);
    });
  }

  private loadReminders(caseId: string) {
    this.data.get<{ data: IReminder[] }>(`reminders/case/${caseId}`).subscribe((res) => {
      this.reminders.set(res.data);
    });
  }

  private loadAttachments(caseId: string) {
    this.data.get<{ data: IAttachment[] }>(`attachments/case/${caseId}`).subscribe((res) => {
      this.attachments.set(res.data);
    });
  }

  // --- Attachments ---------------------------------------------------------

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFiles.set(input.files ? Array.from(input.files) : []);
    // Reset so re-selecting the same file(s) still triggers (change).
    input.value = '';
  }

  removeSelectedFile(index: number) {
    this.selectedFiles.update((files) => files.filter((_, i) => i !== index));
  }

  /** Upload each picked file to the customer's Drive folder. */
  uploadAttachment() {
    const caseId = this.caseItem()?.id;
    const files = this.selectedFiles();
    if (!caseId || !files.length) return;

    const uploads = files.map((file) => {
      const formData = new FormData();
      formData.append('file', file);
      return this.data.post(`attachments/case/${caseId}`, formData);
    });

    this.uploading.set(true);
    // TODO: make multi uploads by backend
    forkJoin(uploads).subscribe({
      next: () => {
        this.selectedFiles.set([]);
        this.uploading.set(false);
        this.loadAttachments(caseId);
      },
      error: () => this.uploading.set(false),
    });
  }

  /** Default WhatsApp message prefilled when sending an attachment.
   *  The textarea stays editable so the user can adjust it before sending. */
  private defaultSendMessage(): string {
    const name = this.caseItem()?.customer?.fullName ?? '';
    return `السلام عليكم ورحمة الله وبركاته
الأستاذ/ة ${name}

تهديكم شركة سعد البقمي للمحاماة والاستشارات القانونية أطيب التحايا.

ونفيدكم بأنه تم الانتهاء من إعداد المذكرة الخاصة بكم، ونأمل التكرم بمراجعتها واعتمادها قبل التقديم الرسمي.

كما نرجو تزويدنا بأي ملاحظات أو تعديلات -إن وجدت- خلال أقرب وقت ممكن قبل إرفاقها في النظام.

شاكرين لكم ثقتكم،
مع خالص التحية والتقدير.`;
  }

  /** Open the inline WhatsApp message input for an attachment. */
  openSend(a: IAttachment) {
    this.sendingId.set(a.id);
    this.sendMessage.set(this.defaultSendMessage());
  }

  /** Close the inline message input without sending. */
  cancelSend() {
    this.sendingId.set(null);
    this.sendMessage.set('');
  }

  /** Send an uploaded attachment to the client via WhatsApp with a message. */
  sendAttachment(a: IAttachment) {
    const caseId = this.caseItem()?.id;
    this.sendInFlight.set(true);
    this.data
      .post(`attachments/${a.id}/send`, { message: this.sendMessage().trim() })
      .subscribe({
        next: () => {
          this.sendInFlight.set(false);
          this.cancelSend();
          if (caseId) this.loadAttachments(caseId);
        },
        error: () => this.sendInFlight.set(false),
      });
  }

  deleteAttachment(a: IAttachment) {
    const caseId = this.caseItem()?.id;
    this.data.delete(`attachments/${a.id}`).subscribe(() => {
      if (caseId) this.loadAttachments(caseId);
    });
  }

  // --- Case completion -----------------------------------------------------

  /** Toggle the case's "fully completed" state (cancels pending reminders). */
  toggleCompletion(completed: boolean) {
    const caseId = this.caseItem()?.id;
    if (!caseId) return;
    this.data
      .patch<{ data: IDataCase }>(`cases/${caseId}/completion`, { completed })
      .subscribe((res) => {
        this.caseItem.set(res.data);
        this.applyCompletionState();
        this.loadReminders(caseId);
      });
  }

  onSubmit() {
    if (this.isCompleted) return;
    // Court + case number must exist before any reminder can be created.
    if (!this.hasCaseInfo) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const caseId = this.caseItem()?.id;
    if (!caseId) return;

    const v = this.form.getRawValue();
    // `v.date` is the Hijri picker's "DD / MM / YYYY"; the backend converts the
    // canonical Hijri date + time into the Gregorian `scheduledAt` it fires off.
    const body: any = {
      type: v.type,
      content: v.content || undefined,
      hijriDate: pickerToCanonicalHijri(v.date),
      time: v.time,
      repeat: v.repeat,
      repeatEveryHours: v.repeat ? Number(v.repeatEveryHours) : undefined,
    };

    const editingId = this.editingId();
    const req = editingId
      ? this.data.patch(`reminders/${editingId}`, body)
      : this.data.post('reminders', { caseId, ...body });

    req.subscribe(() => {
      this.resetForm();
      this.showAddForm.set(false);
      this.loadReminders(caseId);
    });
  }

  onEdit(r: IReminder) {
    // Only pending reminders are editable.
    if (r.status !== 'PENDING') return;
    this.editingId.set(r.id);
    const d = new Date(r.scheduledAt);
    const pad = (n: number) => String(n).padStart(2, '0');
    this.form.patchValue({
      type: r.type,
      content: r.content ?? '',
      date: gregorianToPickerHijri(d),
      time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
      repeat: r.repeat,
      repeatEveryHours: r.repeatEveryHours ?? null,
    });
  }

  onDelete(r: IReminder) {
    const caseId = this.caseItem()?.id;
    this.data.delete(`reminders/${r.id}`).subscribe(() => {
      if (caseId) this.loadReminders(caseId);
    });
  }

  private resetForm() {
    this.editingId.set(null);
    this.form.reset({ type: 'SESSION_DETAILS_REVIEW', content: '', date: '', time: '', repeat: false });
  }

  // --- Memo request ---------------------------------------------------------

  onNeedsMemoChange(value: boolean) {
    this.needsMemo.set(value);
    this.memoSent.set(false);
    this.memoError.set('');
    if (!value) {
      this.memoDeadline.set('');
      this.memoType.set('');
    }
  }

  sendMemoReminder() {
    const caseId = this.caseItem()?.id;
    const deadline = pickerHijriToGregorian(this.memoDeadline());
    if (!caseId || !deadline) return;

    this.memoSending.set(true);
    this.memoSent.set(false);
    this.memoError.set('');

    this.data.post<{ data: any }>('reminders/memo-request', { caseId, memoDeadline: deadline, memoType: this.memoType() || undefined }).subscribe({
      next: () => {
        this.memoSending.set(false);
        this.memoSent.set(true);
        this.loadReminders(caseId);
      },
      error: (err: any) => {
        this.memoSending.set(false);
        this.memoError.set(err?.error?.message ?? 'error');
      },
    });
  }

  setActiveTab(tab: 'session' | 'reminders' | 'docs') {
    this.activeTab.set(tab);
  }

  toggleExpand() {
    const expanding = !this.isExpanded();
    this.isExpanded.set(expanding);
    if (expanding && this.activeTab() === 'session') {
      this.activeTab.set('reminders');
    }
  }

  toggleAddForm() {
    const next = !this.showAddForm();
    this.showAddForm.set(next);
    if (!next) this.resetForm();
  }

  cancelAdd() {
    this.showAddForm.set(false);
    this.resetForm();
  }

  editAndOpen(r: IReminder) {
    this.onEdit(r);
    this.showAddForm.set(true);
    this.activeTab.set('reminders');
  }

  close() {
    this.resetForm();
    this.showAddForm.set(false);
    this.isExpanded.set(false);
    this.activeTab.set('session');
    this.visible = false;
    this.visibleChange.emit(false);
  }
}
