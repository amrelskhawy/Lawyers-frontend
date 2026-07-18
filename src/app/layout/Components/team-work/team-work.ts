import { TranslateService } from '@ngx-translate/core';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, signal } from '@angular/core';
import { TEAM_MEMBERS } from '../../../core/Models/team-members';

@Component({
  selector: 'app-team-work',
  standalone: false,
  templateUrl: './team-work.html',
  styleUrl: './team-work.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamWork implements OnInit, OnDestroy {
  currentLang: string = 'en';

  constructor(private translate: TranslateService) { }

  ngOnInit() {
    this.currentLang = this.translate.currentLang || this.translate.defaultLang || 'en';
    this.translate.onLangChange.subscribe((event) => {
      this.currentLang = event.lang;
    });
    this.startAutoplay();
  }

  ngOnDestroy() {
    this.stopAutoplay();
  }

  /* --- Autoplay: rotates the coverflow forever until the user interacts --- */

  /** Dwell time on each member before advancing. */
  private readonly AUTOPLAY_MS = 1000;
  private timer: ReturnType<typeof setInterval> | null = null;

  private startAutoplay() {
    // Honour the OS "reduce motion" setting — an endlessly moving carousel is
    // exactly the kind of animation that setting exists to suppress.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    this.stopAutoplay();
    this.timer = setInterval(() => this.next(), this.AUTOPLAY_MS);
  }

  private stopAutoplay() {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /** Hovering/focusing the carousel holds the current card so it can be read. */
  pauseAutoplay() {
    this.stopAutoplay();
  }

  resumeAutoplay() {
    this.startAutoplay();
  }

  /** Restarts the dwell timer after a manual move, so the next auto-advance
      isn't a leftover partial tick firing immediately after the click. */
  private restartAutoplay() {
    if (this.timer !== null) this.startAutoplay();
  }

  teamMembers = TEAM_MEMBERS;

  /** Infinite coverflow state — the active card is centered and enlarged. */
  activeIndex = signal<number>(0);

  /** Distance between card centers (card width + gap). */
  private readonly SLOT = 262;
  /** How many cards are shown on each side of the active one. */
  private readonly WINDOW = 2;

  private get count() {
    return this.teamMembers.length;
  }

  /** Shortest signed distance from the active card, so index 0's neighbour on the
      empty side is the LAST member (true circular wrap in both directions). */
  offset(i: number): number {
    const n = this.count;
    let raw = ((i - this.activeIndex()) % n + n) % n; // 0..n-1
    if (raw > n / 2) raw -= n; // -> shortest signed distance
    return raw;
  }

  cardStyle(i: number): Record<string, string | number> {
    const o = this.offset(i);
    const abs = Math.abs(o);
    const visible = abs <= this.WINDOW;
    // graduated depth: active card is largest, each ring further out is smaller and dimmer
    const scale = abs === 0 ? 1.14 : abs === 1 ? 0.86 : 0.72;
    const opacity = abs === 0 ? 1 : abs === 1 ? 0.62 : 0.32;
    return {
      transform: `translate(-50%, -50%) translateX(${o * this.SLOT}px) scale(${scale})`,
      opacity: visible ? opacity : 0,
      'z-index': 20 - abs,
      visibility: visible ? 'visible' : 'hidden',
      'pointer-events': visible ? 'auto' : 'none',
    };
  }

  next() {
    this.activeIndex.update((i) => (i + 1) % this.count);
  }

  prev() {
    this.activeIndex.update((i) => (i - 1 + this.count) % this.count);
  }

  setActive(i: number) {
    this.activeIndex.set(i);
  }

  /** Arrow-button / card-click handlers: move, then reset the dwell timer. */
  onNext() {
    this.next();
    this.restartAutoplay();
  }

  onPrev() {
    this.prev();
    this.restartAutoplay();
  }

  onSetActive(i: number) {
    this.setActive(i);
    this.restartAutoplay();
  }
}
