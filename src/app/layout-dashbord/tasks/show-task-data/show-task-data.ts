import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { Data } from '../../../core/Servies/data';

/**
 * Read-only detail dialog, with one exception: progress notes. Notes are the
 * single field an assignee may write, so they are edited here rather than in
 * the creator-only form.
 */
@Component({
  selector: 'app-show-task-data',
  standalone: false,
  templateUrl: './show-task-data.html',
  styleUrl: './show-task-data.scss',
})
export class ShowTaskData {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() notesSaved = new EventEmitter<void>();

  @Input() set objdata(value: any) {
    this.task.set(value ?? null);
    this.notes.set(value?.notes ?? '');
    this.saving.set(false);
  }

  task = signal<any>(null);
  notes = signal<string>('');
  saving = signal<boolean>(false);

  constructor(private Data: Data) {}

  /** Only the people on the task may write notes — mirrored on the server. */
  get canEditNotes(): boolean {
    return !!this.task()?.canChangeStatus;
  }

  saveNotes() {
    const task = this.task();
    if (!task?.id || this.saving()) return;

    this.saving.set(true);
    this.Data.patch(`tasks/${task.id}/progress`, {
      notes: this.notes().trim() ? this.notes().trim() : null,
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.notesSaved.emit();
      },
      error: () => this.saving.set(false),
    });
  }

  closeDialog() {
    this.visible = false;
    this.visibleChange.emit(false);
  }
}
