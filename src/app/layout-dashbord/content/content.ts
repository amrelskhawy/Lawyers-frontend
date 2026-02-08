import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-content',
  standalone: false,
  templateUrl: './content.html',
  styleUrl: './content.scss',
})
export class Content {
  toggel = signal<boolean>(false);

  onToggelMenue(event: boolean) {
    this.toggel.set(event);
  }
}
