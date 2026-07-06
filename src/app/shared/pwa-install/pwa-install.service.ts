import { computed, inject, Injectable, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

/** The `beforeinstallprompt` event isn't in the TS DOM lib yet. */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/** localStorage key + how long a banner dismissal is honored. */
const DISMISS_KEY = 'pwa-install-dismissed-at';
const DISMISS_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

/**
 * Single source of truth for the app's installability, shared by the auto
 * banner (`PwaInstall`) and any always-available trigger (e.g. the header
 * "install app" button). Dismissing the banner only hides the banner — the
 * header entry keeps working, so a user who dismissed can still install later.
 */
@Injectable({ providedIn: 'root' })
export class PwaInstallService {
  private document = inject(DOCUMENT);
  private deferredPrompt: BeforeInstallPromptEvent | null = null;

  /** Native install prompt captured (Android / desktop Chromium). */
  readonly canInstall = signal<boolean>(false);
  /** iOS/iPadOS Safari — needs manual "Add to Home Screen" instructions. */
  readonly isIosSafari = signal<boolean>(false);
  /** App is already installed (running standalone). */
  readonly installed = signal<boolean>(false);
  /** The auto banner is currently visible. */
  readonly bannerVisible = signal<boolean>(false);
  /** Native dialog is open — guards buttons. */
  readonly installing = signal<boolean>(false);

  /** Can the user install at all (either path), and not already installed. */
  readonly installable = computed(
    () => !this.installed() && (this.canInstall() || this.isIosSafari()),
  );

  constructor() {
    const win = this.document.defaultView;
    if (!win) return;

    if (this.isStandalone()) {
      this.installed.set(true);
      return;
    }

    // Android / desktop Chromium: the browser reports the app is installable.
    win.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault(); // suppress the mini-infobar; we drive it ourselves
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      this.canInstall.set(true);
      if (!this.recentlyDismissed()) this.bannerVisible.set(true);
    });

    win.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.canInstall.set(false);
      this.isIosSafari.set(false);
      this.bannerVisible.set(false);
      this.installed.set(true);
    });

    // iOS/iPadOS Safari never fires `beforeinstallprompt`.
    if (this.detectIosSafari()) {
      this.isIosSafari.set(true);
      if (!this.recentlyDismissed()) this.bannerVisible.set(true);
    }
  }

  /**
   * Trigger installation. On Android/desktop this opens the native dialog; on
   * iOS there's no API, so we reveal the banner that carries the manual steps.
   * Returns which path was taken.
   */
  async install(): Promise<'native' | 'ios' | 'unavailable'> {
    if (this.deferredPrompt) {
      this.installing.set(true);
      try {
        await this.deferredPrompt.prompt();
        await this.deferredPrompt.userChoice; // 'accepted' | 'dismissed'
      } finally {
        this.deferredPrompt = null;
        this.canInstall.set(false);
        this.bannerVisible.set(false);
        this.installing.set(false);
      }
      return 'native';
    }
    if (this.isIosSafari()) {
      this.reveal(); // show the Add-to-Home-Screen instructions
      return 'ios';
    }
    return 'unavailable';
  }

  /** Re-show the banner (used by the header button, ignores prior dismissal). */
  reveal(): void {
    if (this.installable()) this.bannerVisible.set(true);
  }

  /** Hide the auto banner and remember it for a while. Header entry still works. */
  dismissBanner(): void {
    this.bannerVisible.set(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch { /* private mode / storage disabled — nothing to persist */ }
  }

  private isStandalone(): boolean {
    const w = this.document.defaultView;
    return (
      !!w?.matchMedia?.('(display-mode: standalone)').matches ||
      (w?.navigator as unknown as { standalone?: boolean })?.standalone === true
    );
  }

  private recentlyDismissed(): boolean {
    try {
      const at = Number(localStorage.getItem(DISMISS_KEY));
      return !!at && Date.now() - at < DISMISS_MS;
    } catch {
      return false;
    }
  }

  private detectIosSafari(): boolean {
    const nav = this.document.defaultView?.navigator;
    if (!nav) return false;
    const ua = nav.userAgent;
    // iPadOS 13+ masquerades as Mac — detect it via the touch point count.
    const isIpadOs = nav.platform === 'MacIntel' && nav.maxTouchPoints > 1;
    const isIos = /iphone|ipad|ipod/i.test(ua) || isIpadOs;
    if (!isIos) return false;
    // Exclude in-app WebViews / non-Safari iOS browsers that can't install.
    return !/crios|fxios|edgios|opios/i.test(ua);
  }
}
