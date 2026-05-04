import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { PasscodeDialog } from '../../shared/passcode-dialog/passcode-dialog';

/**
 * Lightweight gate for restricted dashboard sections.
 *
 * Routes can declare a `securityGroup` in their route data. Once the
 * passcode is entered for a group, all routes sharing that group are
 * unlocked for `GROUP_TTL_MS`. Routes without a group fall back to the
 * legacy behavior of prompting on every navigation.
 */
const PASSCODE = '666666';
const GROUP_TTL_MS = 15 * 60 * 1000; // 15 minutes
const STORAGE_KEY = 'passcode_unlocked_groups';

@Injectable({ providedIn: 'root' })
export class Passcode {
  private dialog: PasscodeDialog | null = null;
  private dialogReady: Promise<void>;
  private resolveDialogReady!: () => void;
  private unlockedUntil = new Map<string, number>();
  private pending: Promise<boolean> | null = null;
  private pendingGroup: string | null = null;

  constructor(router: Router) {
    this.dialogReady = new Promise((res) => (this.resolveDialogReady = res));
    this.loadFromStorage();
    // Lock any group the user has navigated out of so re-entering re-prompts.
    router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        const activeGroup = this.findActiveGroup(router.routerState.snapshot.root);
        let changed = false;
        for (const group of Array.from(this.unlockedUntil.keys())) {
          if (group !== activeGroup) {
            this.unlockedUntil.delete(group);
            changed = true;
          }
        }
        if (changed) this.saveToStorage();
      });
  }

  private findActiveGroup(node: ActivatedRouteSnapshot): string | undefined {
    let current: ActivatedRouteSnapshot | undefined = node;
    let group: string | undefined;
    while (current) {
      const g = current.data?.['securityGroup'] as string | undefined;
      if (g) group = g;
      current = current.firstChild ?? undefined;
    }
    return group;
  }

  registerDialog(d: PasscodeDialog) {
    this.dialog = d;
    d.submit$ = (value: string) => this.handleSubmit(value);
    this.resolveDialogReady();
  }

  /**
   * Resolves true if the given group is already unlocked, otherwise opens
   * the dialog. When `group` is omitted, always prompts (legacy behavior).
   */
  async requireAccess(group?: string): Promise<boolean> {
    if (group && this.isUnlocked(group)) return true;

    // On a hard reload the dialog is registered by the dashboard shell
    // component, which mounts after the route guard runs. Wait for it
    // instead of bailing out (which would cancel navigation and bounce
    // the user to the wildcard fallback at `/`).
    if (!this.dialog) {
      await this.dialogReady;
    }

    // Coalesce concurrent requests for the same group so rapid double
    // navigations don't stack dialogs.
    if (this.pending && this.pendingGroup === (group ?? null)) {
      return this.pending;
    }

    this.pendingGroup = group ?? null;
    this.pending = this.dialog!.open().then((ok) => {
      if (ok && group) {
        this.unlockedUntil.set(group, Date.now() + GROUP_TTL_MS);
        this.saveToStorage();
      }
      this.pending = null;
      this.pendingGroup = null;
      return ok;
    });
    return this.pending;
  }

  /** Lock a single group (e.g., on sensitive action completion). */
  lockGroup(group: string) {
    this.unlockedUntil.delete(group);
    this.saveToStorage();
  }

  /** Lock everything (call on logout). */
  lockAll() {
    this.unlockedUntil.clear();
    this.saveToStorage();
  }

  private isUnlocked(group: string): boolean {
    const expiry = this.unlockedUntil.get(group);
    if (!expiry) return false;
    if (Date.now() >= expiry) {
      this.unlockedUntil.delete(group);
      this.saveToStorage();
      return false;
    }
    return true;
  }

  private loadFromStorage() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const entries = JSON.parse(raw) as [string, number][];
      const now = Date.now();
      for (const [group, expiry] of entries) {
        if (expiry > now) this.unlockedUntil.set(group, expiry);
      }
    } catch {
      // Ignore corrupted storage; user will just be re-prompted.
    }
  }

  private saveToStorage() {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(Array.from(this.unlockedUntil.entries())),
      );
    } catch {
      // Storage may be unavailable (e.g., private mode); fall back to memory only.
    }
  }

  private handleSubmit(value: string) {
    if (value === PASSCODE) {
      this.dialog?.resolveOk();
    } else {
      this.dialog?.submitInvalid();
    }
  }
}
