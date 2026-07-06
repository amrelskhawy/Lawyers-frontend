import { Component, EventEmitter, inject, Output } from '@angular/core';
import { Router } from '@angular/router';
import { PwaInstallService } from '../pwa-install/pwa-install.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  @Output() EventRoute = new EventEmitter<string>();

  /** Backs the always-available "install app" button in the header. */
  readonly pwa = inject(PwaInstallService);

  constructor(private router: Router) {}

  onClickListActive(route: string) {
    this.EventRoute.emit(route);
    this.navigateToSection(route);
  }

  private navigateToSection(sectionId: string) {
    if (this.router.url === '/' || this.router.url.startsWith('/?')) {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      this.router.navigate(['/'], { fragment: sectionId });
    }
  }
}
