import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Data } from '../../../core/Servies/data';

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
  ) {}

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
      }),
    );
  }

  private patchForm(task: any) {
    if (!task) {
      this.Form().reset({ status: 'TODO', priority: 'MEDIUM', assigneeIds: [] });
      return;
    }
    this.Form().patchValue({
      title: task.title ?? '',
      description: task.description ?? '',
      status: task.status ?? 'TODO',
      priority: task.priority ?? 'MEDIUM',
      dueDate: task.dueDate ? new Date(task.dueDate) : null,
      assigneeIds: (task.assignees ?? []).map((a: any) => a.userId),
    });
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
    };

    const task = this.editing();
    const request = task?.id ? this.Data.put(`tasks/${task.id}`, body) : this.Data.post('tasks', body);
    request.subscribe(() => this.handelResponseSuccess());
  }

  handelResponseSuccess() {
    this.Form().reset({ status: 'TODO', priority: 'MEDIUM', assigneeIds: [] });
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
