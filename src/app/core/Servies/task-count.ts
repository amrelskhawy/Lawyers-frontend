import { inject, Injectable, signal } from '@angular/core';
import { Data } from './data';

/**
 * Open-task counter behind the sidebar badge. It lives in a service rather than
 * in the menu component so the tasks page can refresh it the moment a task is
 * created, closed or deleted — the badge would otherwise lag a whole poll
 * interval behind what the user just did.
 */
@Injectable({ providedIn: 'root' })
export class TaskCount {
  private readonly data = inject(Data);

  /** Tasks visible to me that are not DONE yet. */
  readonly openCount = signal<number>(0);

  private timer: any = null;

  /** Poll cadence — slow on purpose: this is a badge, not a live feed. */
  private static readonly REFRESH_MS = 60_000;

  refresh() {
    if (!sessionStorage.getItem('token')) return;
    this.data.get<any>('tasks/open-count').subscribe({
      next: (res) => this.openCount.set(res?.data?.count ?? 0),
      // A failing badge must never surface as an error to the user.
      error: () => {},
    });
  }

  /** Idempotent: repeated calls (e.g. a re-created menu) keep one timer. */
  startPolling() {
    this.refresh();
    if (this.timer) return;
    this.timer = setInterval(() => this.refresh(), TaskCount.REFRESH_MS);
  }

  stopPolling() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
}
