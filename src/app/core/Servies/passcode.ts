import { Injectable, signal } from '@angular/core';
import { PasscodeDialog } from '../../shared/passcode-dialog/passcode-dialog';

/**
 * Lightweight gate for restricted dashboard sections.
 *
 * For now the passcode is hard-coded ("000000"). Replace with a backend
 * verification call when the real passcode flow ships.
 */
const PASSCODE = '000000';
const STORAGE_KEY = 'dashboard-passcode-unlocked';

@Injectable({ providedIn: 'root' })
export class Passcode {
  private dialog: PasscodeDialog | null = null;

  // Components in the app shell call this once on init to register their
  // passcode dialog instance with the service.
  registerDialog(d: PasscodeDialog) {
    this.dialog = d;
    d.submit$ = (value: string) => this.handleSubmit(value);
  }

  isUnlocked(): boolean {
    return sessionStorage.getItem(STORAGE_KEY) === '1';
  }

  /** Resolves true if the user is unlocked (or successfully unlocks now). */
  async requireAccess(): Promise<boolean> {
    if (this.isUnlocked()) return true;
    if (!this.dialog) {
      console.warn('Passcode dialog is not registered yet');
      return false;
    }
    return this.dialog.open();
  }

  private handleSubmit(value: string) {
    if (value === PASSCODE) {
      sessionStorage.setItem(STORAGE_KEY, '1');
      this.dialog?.resolveOk();
    } else {
      this.dialog?.submitInvalid();
    }
  }

  /** For dev/testing — clears the unlock so the next gated nav re-prompts. */
  reset() {
    sessionStorage.removeItem(STORAGE_KEY);
  }
}
