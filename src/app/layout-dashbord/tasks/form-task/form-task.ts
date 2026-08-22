import { Component, computed, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Data } from '../../../core/Servies/data';
import { Auth } from '../../../core/Servies/auth';

/** Create/edit dialog. Any staff member may create a task and assign it to anyone. */
@Component({
  selector: 'app-form-task',
  standalone: false,
  templateUrl: './form-task.html',
  styleUrl: './form-task.scss',
})
export class FormTask implements OnInit {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() success = new EventEmitter<boolean>();

  @Input() set objdata(value: any) {
    this.editing.set(value ?? null);
    if (this.Form().controls['title']) this.patchForm(value);
  }

  Form = signal<FormGroup>(new FormGroup({}));
  editing = signal<any>(null);
  users = signal<{ label: string; value: string }[]>([]);

  /** Mirrors the two roster controls so the stand-in section can react to them. */
  ownerIds = signal<string[]>([]);
  hasTempAssignee = signal<boolean>(false);

  /** Nobody can stand in for themselves — owners drop out of the stand-in list. */
  tempUserOptions = computed(() =>
    this.users().filter((u) => !this.ownerIds().includes(u.value)),
  );

  statusOptions = [
    { label: 'task_status_TODO', value: 'TODO' },
    { label: 'task_status_IN_PROGRESS', value: 'IN_PROGRESS' },
    { label: 'task_status_DONE', value: 'DONE' },
  ];

  priorityOptions = [
    { label: 'task_priority_LOW', value: 'LOW' },
    { label: 'task_priority_MEDIUM', value: 'MEDIUM' },
    { label: 'task_priority_HIGH', value: 'HIGH' },
  ];

  constructor(
    private FB: FormBuilder,
    private Data: Data,
    private auth: Auth,
  ) {}

  /** Only an ADMIN/MODERATOR may share a task with other managers. */
  get canShareWithManagers(): boolean {
    const role = this.auth.currentUser()?.role;
    return role === 'ADMIN' || role === 'MODERATOR';
  }

  ngOnInit(): void {
    this.createForm();
    this.patchForm(this.editing());
    this.loadUsers();
  }

  createForm() {
    this.Form.set(
      this.FB.group({
        title: ['', [Validators.required, Validators.maxLength(200)]],
        description: [''],
        status: ['TODO', Validators.required],
        priority: ['MEDIUM', Validators.required],
        dueDate: [null],
        assigneeIds: [[]],
        hasTempAssignee: [false],
        tempAssigneeIds: [[]],
        isVisibleForOtherAdmins: [false],
      }),
    );
  }

  private patchForm(task: any) {
    if (!task) {
      this.resetForm();
      return;
    }
    const owners = (task.assignees ?? []).filter((a: any) => !a.isTemp).map((a: any) => a.userId);
    this.ownerIds.set(owners);
    this.hasTempAssignee.set(task.hasTempAssignee ?? false);
    this.Form().patchValue({
      title: task.title ?? '',
      description: task.description ?? '',
      status: task.status ?? 'TODO',
      priority: task.priority ?? 'MEDIUM',
      dueDate: task.dueDate ? new Date(task.dueDate) : null,
      assigneeIds: owners,
      hasTempAssignee: task.hasTempAssignee ?? false,
      tempAssigneeIds: (task.assignees ?? []).filter((a: any) => a.isTemp).map((a: any) => a.userId),
      isVisibleForOtherAdmins: task.isVisibleForOtherAdmins ?? false,
    });
  }

  /** The blank state, shared by "add" and by a successful save. */
  private resetForm() {
    this.ownerIds.set([]);
    this.hasTempAssignee.set(false);
    this.Form().reset({
      status: 'TODO',
      priority: 'MEDIUM',
      assigneeIds: [],
      hasTempAssignee: false,
      tempAssigneeIds: [],
      isVisibleForOtherAdmins: false,
    });
  }

  /** Someone promoted to owner cannot also stand in for the task. */
  onOwnersChange(ids: string[]) {
    this.ownerIds.set(ids ?? []);
    const temps: string[] = this.Form().get('tempAssigneeIds')?.value ?? [];
    const kept = temps.filter((id) => !this.ownerIds().includes(id));
    if (kept.length !== temps.length) this.Form().patchValue({ tempAssigneeIds: kept });
  }

  onHasTempAssigneeChange(value: boolean) {
    this.hasTempAssignee.set(value);
  }

  loadUsers() {
    this.Data.get<any>('tasks/assignable-users').subscribe((res) => {
      this.users.set(
        (res.data as any[]).map((u) => ({ label: `${u.name} (${u.role})`, value: u.id })),
      );
    });
  }

  onSubmit() {
    if (this.Form().invalid) {
      this.Form().markAllAsTouched();
      return;
    }

    const raw = this.Form().value;
    const body = {
      ...raw,
      description: raw.description?.trim() ? raw.description.trim() : null,
      // The API takes an ISO instant; the picker hands back a Date.
      dueDate: raw.dueDate ? new Date(raw.dueDate).toISOString() : null,
      assigneeIds: raw.assigneeIds ?? [],
      hasTempAssignee: raw.hasTempAssignee ?? false,
      // The server ignores these while the switch is off; sending [] keeps the
      // stored roster and the form in step either way.
      tempAssigneeIds: raw.hasTempAssignee ? raw.tempAssigneeIds ?? [] : [],
    };

    const task = this.editing();
    const request = task?.id ? this.Data.put(`tasks/${task.id}`, body) : this.Data.post('tasks', body);
    request.subscribe(() => this.handelResponseSuccess());
  }

  handelResponseSuccess() {
    this.resetForm();
    this.editing.set(null);
    this.success.emit(true);
  }

  closeDialog() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  onClose() {
    this.closeDialog();
  }

  getControlName(controlName: string) {
    return this.Form().get(controlName);
  }
}
