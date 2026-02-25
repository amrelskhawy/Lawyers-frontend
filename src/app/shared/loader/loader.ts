import { Component } from '@angular/core';
import { Core } from '../../core/Servies/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-loader',
  standalone: false,
  templateUrl: './loader.html',
  styleUrl: './loader.scss',
})
export class Loader {
  loading = false;
  currentLang = 'en';
  private sub!: Subscription;

  constructor(private core: Core) {
    this.sub = this.core._loading.subscribe((load) => (this.loading = load));
  }

  ngOnInit() {
    this.currentLang = localStorage.getItem('Language') || 'en';
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
