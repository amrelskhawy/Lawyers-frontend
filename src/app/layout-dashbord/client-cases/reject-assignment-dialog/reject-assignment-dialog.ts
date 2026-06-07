import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

/**
 * Branded replacement for the native window.prompt used to collect a reason
 * when a lawyer rejects a case assignment. Emits the trimmed reason on confirm;
 * the parent owns the API call.
 */
@Component({
  selector: 'app-reject-assignment-dialog',
  standalone: false,
  templateUrl: './reject-assignment-dialog.html',
  styleUrl: './reject-assignment-dialog.scss',
})
export class RejectAssignmentDialog {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() confirmReason = new EventEmitter<string>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      reason: ['', [Validators.required, Validators.maxLength(500)]],
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.confirmReason.emit((this.form.value.reason ?? '').trim());
    this.close();
  }

  close() {
    this.form.reset({ reason: '' });
    this.visible = false;
    this.visibleChange.emit(false);
  }
}
