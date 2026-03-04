import { Component, signal, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly title = signal('LawyeringFrelancer');

  ngOnInit(): void {
   this.scrollToTop();

  }

  scrollToTop() {
     window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
