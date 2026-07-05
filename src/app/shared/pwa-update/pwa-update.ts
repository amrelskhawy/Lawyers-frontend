import { Component, inject, OnInit, signal } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { interval } from 'rxjs';
import { filter } from 'rxjs/operators';

/**
 * Watches the service worker for a newly deployed app version and shows an
 * actionable banner ("a new version is available — reload"). Kept out of the
 * lazy dashboard so it works on every page. No-op when the SW is disabled
 * (dev builds / unsupported browsers).
 */
@Component({
  selector: 'app-pwa-update',
  standalone: false,
  templateUrl: './pwa-update.html',
  styleUrl: './pwa-update.scss',
})
export class PwaUpdate implements OnInit {
  private swUpdate = inject(SwUpdate);

  /** True once a new version has been downloaded and is ready to activate. */
  updateAvailable = signal<boolean>(false);
  /** Guards the button while the new version activates + the page reloads. */
  reloading = signal<boolean>(false);

  ngOnInit(): void {
    if (!this.swUpdate.isEnabled) return;

    // A new version finished downloading in the background — offer the reload.
    this.swUpdate.versionUpdates
      .pipe(filter((e): e is VersionReadyEvent => e.type === 'VERSION_READY'))
      .subscribe(() => this.updateAvailable.set(true));

    // The SW is wedged (cache references a file the server no longer has) —
    // a hard reload is the only recovery.
    this.swUpdate.unrecoverable.subscribe(() => document.location.reload());

    // Poll for a new deployment: once on startup, then every 6 hours. This is
    // what surfaces updates for a long-lived installed (standalone) session
    // that never gets a fresh page load on its own.
    const check = () =>
      this.swUpdate.checkForUpdate().catch(() => { /* offline / transient — ignore */ });
    check();
    interval(6 * 60 * 60 * 1000).subscribe(check);
  }

  /** Activate the downloaded version and reload into it. */
  reload(): void {
    this.reloading.set(true);
    this.swUpdate
      .activateUpdate()
      .then(() => document.location.reload())
      .catch(() => document.location.reload());
  }

  dismiss(): void {
    this.updateAvailable.set(false);
  }
}
