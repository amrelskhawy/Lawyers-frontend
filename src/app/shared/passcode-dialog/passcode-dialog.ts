import { Component, ElementRef, ViewChild, signal } from '@angular/core';

@Component({
  selector: 'app-passcode-dialog',
  standalone: false,
  templateUrl: './passcode-dialog.html',
  styleUrl: './passcode-dialog.scss',
})
export class PasscodeDialog {
  @ViewChild('input') inputRef?: ElementRef<HTMLInputElement>;

  visible = signal<boolean>(false);
  value   = signal<string>('');
  error   = signal<string>('');
  expectedLength = 6;

  private resolveFn: ((ok: boolean) => void) | null = null;

  open(): Promise<boolean> {
    this.value.set('');
    this.error.set('');
    this.visible.set(true);
    setTimeout(() => this.inputRef?.nativeElement.focus(), 50);
    return new Promise<boolean>((resolve) => { this.resolveFn = resolve; });
  }

  cancel() {
    this.visible.set(false);
    this.resolveFn?.(false);
    this.resolveFn = null;
  }

  // The actual validation lives in the service — this just emits what the user typed.
  submitInvalid() { this.error.set('PASSCODE_INVALID'); }

  resolveOk() {
    this.visible.set(false);
    this.resolveFn?.(true);
    this.resolveFn = null;
  }

  onInput(v: string) {
    // Numeric only, capped at expectedLength
    const cleaned = (v || '').replace(/\D/g, '').slice(0, this.expectedLength);
    this.value.set(cleaned);
    if (this.error()) this.error.set('');
  }

  onSubmit() {
    if (this.value().length !== this.expectedLength) {
      this.error.set('PASSCODE_TOO_SHORT');
      return;
    }
    // The Passcode service watches `value` via getValue() right before validating.
    // Use the public `submitRequest` signal pattern to let the service hook in.
    this.submit$?.(this.value());
  }

  /** Bound by the service so it can read submissions. */
  submit$: ((v: string) => void) | null = null;
}
