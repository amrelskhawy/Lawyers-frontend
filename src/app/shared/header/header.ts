import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  @Output() EventRoute = new EventEmitter<string>();

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
