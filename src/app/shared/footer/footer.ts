import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: false,
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss'],
})
export class Footer {
  @Output() EventRoute = new EventEmitter<string>();

  onClickListActive(route: string) {
    this.EventRoute.emit(route)
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
