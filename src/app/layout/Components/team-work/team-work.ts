import { TranslateService } from '@ngx-translate/core';
import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { TEAM_MEMBERS } from '../../../core/Models/team-members';

@Component({
  selector: 'app-team-work',
  standalone: false,
  templateUrl: './team-work.html',
  styleUrl: './team-work.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamWork implements OnInit {
  currentLang: string = 'en';

  constructor(private translate: TranslateService) {}

  ngOnInit() {
    this.currentLang = this.translate.currentLang || this.translate.defaultLang || 'en';
    this.translate.onLangChange.subscribe((event) => {
      this.currentLang = event.lang;
    });
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
}
