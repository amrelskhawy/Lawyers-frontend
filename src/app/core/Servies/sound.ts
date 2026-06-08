import { Injectable } from '@angular/core';

/**
 * Plays short UI notification sounds. Isolated here so audio concerns stay out
 * of components and so a blocked autoplay or a missing asset can never break a page.
 */
@Injectable({ providedIn: 'root' })
export class SoundService {
  private readonly chimeSrc = '/assets/sounds/new-assignment.wav';

  /**
   * Plays the "new pending assignment" chime.
   *
   * Browsers block audio that starts without a user gesture, so a chime fired
   * right after a fresh page load (e.g. straight after login) is often rejected.
   * When that happens we retry once on the next user interaction so the chime
   * still reaches the user instead of being silently dropped.
   */
  playChime(): void {
    this.play().catch(() => this.playOnNextInteraction());
  }

  private play(): Promise<void> {
    try {
      const audio = new Audio(this.chimeSrc);
      audio.volume = 0.6;
      const result = audio.play();
      return result ?? Promise.resolve();
    } catch {
      // Audio unsupported / asset missing — never let it break the page.
      return Promise.resolve();
    }
  }

  private playOnNextInteraction(): void {
    const handler = () => {
      document.removeEventListener('pointerdown', handler);
      document.removeEventListener('keydown', handler);
      this.play().catch(() => {});
    };
    document.addEventListener('pointerdown', handler, { once: true });
    document.addEventListener('keydown', handler, { once: true });
  }
}
