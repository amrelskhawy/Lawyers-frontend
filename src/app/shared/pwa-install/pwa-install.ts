import { Component, inject, OnInit, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

/** The `beforeinstallprompt` event isn't in the TS DOM lib yet. */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/** localStorage key + how long a dismissal silences the banner. */
const DISMISS_KEY = 'pwa-install-dismissed-at';
const DISMISS_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

/**
 * Surfaces an "install app" affordance on every mobile/tablet platform, since
 * browsers no longer auto-prompt:
 *  - Android / desktop Chromium: captures `beforeinstallprompt` and drives the
 *    native install dialog from our own button.
 *  - iOS / iPadOS Safari: no such event exists, so we show manual
 *    "Share → Add to Home Screen" instructions instead.
 * Renders nothing when already running standalone (installed) or recently
 * dismissed. Lives outside the lazy dashboard so it works on every page.
 */
@Component({
  selector: 'app-pwa-install',
  standalone: false,
  templateUrl: './pwa-install.html',
  styleUrl: './pwa-install.scss',
})
export class PwaInstall implements OnInit {
  private document = inject(DOCUMENT);

  /** Android/desktop: install button ready (native prompt captured). */
  canInstall = signal<boolean>(false);
  /** iOS/iPadOS Safari: show the manual add-to-home-screen instructions. */
  showIosHint = signal<boolean>(false);
  /** Guards the button while the native dialog is open. */
  installing = signal<boolean>(false);

  private deferredPrompt: BeforeInstallPromptEvent | null = null;

  ngOnInit(): void {
    if (this.isStandalone() || this.recentlyDismissed()) return;

    // Android / desktop Chromium: the browser tells us it's installable.
    this.document.defaultView?.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault(); // stop the (rare) mini-infobar; we drive it ourselves
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      this.canInstall.set(true);
    });

    // Chrome fires this after a successful install — clean up immediately.
    this.document.defaultView?.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.canInstall.set(false);
      this.showIosHint.set(false);
    });

    // iOS/iPadOS Safari never fires `beforeinstallprompt`; detect it and fall
    // back to manual instructions. Only Safari can install on iOS — Chrome
    // (CriOS) / Firefox (FxiOS) / Edge (EdgiOS) cannot, so we don't nag them.
    if (this.isIosSafari()) this.showIosHint.set(true);
  }

  /** Fire the native install dialog (Android/desktop). */
  async install(): Promise<void> {
    if (!this.deferredPrompt) return;
    this.installing.set(true);
    try {
      await this.deferredPrompt.prompt();
      await this.deferredPrompt.userChoice; // 'accepted' | 'dismissed'
    } finally {
      this.deferredPrompt = null;
      this.canInstall.set(false);
      this.installing.set(false);
    }
  }

  dismiss(): void {
    this.canInstall.set(false);
    this.showIosHint.set(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch { /* private mode / storage disabled — nothing to persist */ }
  }

  /** Already installed → the app runs in a standalone window. */
  private isStandalone(): boolean {
    const w = this.document.defaultView;
    return (
      !!w?.matchMedia?.('(display-mode: standalone)').matches ||
      // iOS Safari's non-standard flag
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

  private isIosSafari(): boolean {
    const nav = this.document.defaultView?.navigator;
    if (!nav) return false;
    const ua = nav.userAgent;
    // iPadOS 13+ masquerades as Mac — detect it via the touch point count.
    const isIpadOs = nav.platform === 'MacIntel' && nav.maxTouchPoints > 1;
    const isIos = /iphone|ipad|ipod/i.test(ua) || isIpadOs;
    if (!isIos) return false;
    // Exclude in-app WebViews and non-Safari iOS browsers that can't install.
    const isOtherBrowser = /crios|fxios|edgios|opios/i.test(ua);
    return !isOtherBrowser;
  }
}
