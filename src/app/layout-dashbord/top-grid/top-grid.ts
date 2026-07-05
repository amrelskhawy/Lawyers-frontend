import { Component, EventEmitter, Input, Output, signal, Signal } from '@angular/core';
import { Auth } from './../../core/Servies/auth';

@Component({
  selector: 'app-top-grid',
  standalone: false,
  templateUrl: './top-grid.html',
  styleUrl: './top-grid.scss',
})
export class TopGrid {
  /** Reactive signed-in user — updates live when /me refreshes it. */
  userData: Signal<any>;

  constructor(private auth: Auth) {
    this.userData = this.auth.currentUser;
  }

  @Input() showAddButton = true;
  @Output() visibelformadd = new EventEmitter<boolean>();
  @Output() search = new EventEmitter<string>();

  pages = signal<string>('');
  @Input()
  set page(value: string) {
    this.pages.set(value);
  }

  private static readonly FALLBACK_AVATAR = '/assets/Img/2a.webp';

  /** If the user's profile picture fails to load, fall back to the default. */
  onAvatarError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (!img.src.endsWith(TopGrid.FALLBACK_AVATAR)) {
      img.src = TopGrid.FALLBACK_AVATAR;
    }
  }

  visibelform() {
    this.visibelformadd.emit(true);
  }

  /** Emits only on an explicit search (icon click or Enter), not on each keystroke. */
  onSearch(value: string) {
    this.search.emit(value ?? '');
  }
}
