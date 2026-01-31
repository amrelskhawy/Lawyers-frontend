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
  private sub!: Subscription;

  constructor(private core: Core) {
    this.sub = this.core._loading.subscribe((load) => (this.loading = load));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
