import { Component } from '@angular/core';

@Component({
  selector: 'app-main-page',
  standalone: false,
  templateUrl: './main-page.html',
  styleUrl: './main-page.scss',
})
export class MainPage {
  navigation: string = '';

  onEventRoute(event: string) {
    this.navigation = event;
    const el = document.getElementById(this.navigation);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

}
