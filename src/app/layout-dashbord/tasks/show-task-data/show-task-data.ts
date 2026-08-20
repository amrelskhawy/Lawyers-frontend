import { Component, EventEmitter, Input, Output } from '@angular/core';

/** Read-only detail dialog for a single task. */
@Component({
  selector: 'app-show-task-data',
  standalone: false,
  templateUrl: './show-task-data.html',
  styleUrl: './show-task-data.scss',
})
export class ShowTaskData {
  @Input() visible: boolean = false;
  @Input() objdata: any = null;
  @Output() visibleChange = new EventEmitter<boolean>();

  closeDialog() {
    this.visible = false;
    this.visibleChange.emit(false);
  }
}
