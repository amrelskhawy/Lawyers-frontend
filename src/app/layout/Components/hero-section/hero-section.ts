import { ChangeDetectionStrategy, Component } from '@angular/core';


@Component({
  selector: 'app-hero-section',
  standalone: false,
  templateUrl: './hero-section.html',
  styleUrl: './hero-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class HeroSection {

  navigateToContactUs() {
    window.location.href = 'https://wa.me/966535041555';
  }

}
