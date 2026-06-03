import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Data } from '../../../core/Servies/data';
import { IDataCase } from '../../../core/Models/case.model';
import { IReminder, IReminderTypeOption } from '../../../core/Models/reminder.model';

@Component({
  selector: 'app-reminders-dialog',
  standalone: false,
  templateUrl: './reminders-dialog.html',
  styleUrl: './reminders-dialog.scss',
})
export class RemindersDialog {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  caseItem = signal<IDataCase | null>(null);
  reminders = signal<IReminder[]>([]);
  types = signal<IReminderTypeOption[]>([]);
  editingId = signal<string | null>(null);
  sessionSaved = signal<boolean>(false);
  form: FormGroup;
  sessionForm: FormGroup;

  constructor(private fb: FormBuilder, private data: Data) {
    this.form = this.fb.group({
      type: ['SESSION_DETAILS_REVIEW', Validators.required],
      content: [''],
      date: ['', Validators.required],
      time: ['', Validators.required],
      repeat: [false],
      repeatEveryHours: [{ value: null, disabled: true }],
    });

    // Separate form for editing the case's next-session date inline.
    this.sessionForm = this.fb.group({
      date: ['', Validators.required],
      time: [''],
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
    this.prefillSessionForm(value?.sessionDate ?? null);
    if (value?.id) {
      this.loadTypes();
      this.loadReminders(value.id);
    }
  }

  private pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  private prefillSessionForm(sessionDate: string | null) {
    if (!sessionDate) {
      this.sessionForm.reset({ date: '', time: '' });
      return;
    }
    const d = new Date(sessionDate);
    this.sessionForm.patchValue({
      date: `${d.getFullYear()}-${this.pad(d.getMonth() + 1)}-${this.pad(d.getDate())}`,
      time: `${this.pad(d.getHours())}:${this.pad(d.getMinutes())}`,
    });
  }

  get hasSessionDate(): boolean {
    return !!this.caseItem()?.sessionDate;
  }

  /** Persist the next-session date to the case (single source of truth) and
   *  reflect it locally so reminder validation uses it immediately. */
  saveSessionDate() {
    if (this.sessionForm.invalid) {
      this.sessionForm.markAllAsTouched();
      return;
    }
    const caseId = this.caseItem()?.id;
    if (!caseId) return;

    const { date, time } = this.sessionForm.value;
    const iso = new Date(`${date}T${time || '09:00'}`).toISOString();

    this.data.patch(`cases/${caseId}`, { sessionDate: iso }).subscribe(() => {
      const c = this.caseItem();
      if (c) this.caseItem.set({ ...c, sessionDate: iso });
      this.prefillSessionForm(iso);
      this.sessionSaved.set(true);
    });
  }

  get selectedTypeDescription(): string {
    const t = this.form.get('type')!.value;
    return this.types().find((x) => x.value === t)?.description ?? '';
  }

  get sessionDate(): string {
    const d = this.caseItem()?.sessionDate;
    return d ? new Date(d).toLocaleString() : '';
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

  /** Combine the date + time inputs into an ISO string. */
  private toIso(): string {
    const { date, time } = this.form.value;
    return new Date(`${date}T${time}`).toISOString();
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const caseId = this.caseItem()?.id;
    if (!caseId) return;

    const v = this.form.getRawValue();
    const body: any = {
      type: v.type,
      content: v.content || undefined,
      scheduledAt: this.toIso(),
      repeat: v.repeat,
      repeatEveryHours: v.repeat ? Number(v.repeatEveryHours) : undefined,
    };

    const editingId = this.editingId();
    const req = editingId
      ? this.data.patch(`reminders/${editingId}`, body)
      : this.data.post('reminders', { caseId, ...body });

    req.subscribe(() => {
      this.resetForm();
      this.loadReminders(caseId);
    });
  }

  onEdit(r: IReminder) {
    this.editingId.set(r.id);
    const d = new Date(r.scheduledAt);
    const pad = (n: number) => String(n).padStart(2, '0');
    this.form.patchValue({
      type: r.type,
      content: r.content ?? '',
      date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
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

  close() {
    this.resetForm();
    this.visible = false;
    this.visibleChange.emit(false);
  }
}
