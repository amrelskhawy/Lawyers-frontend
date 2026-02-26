import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { Core } from '../../core/Servies/core';

@Component({
  selector: 'app-loader',
  standalone: false,
  templateUrl: './loader.html',
  styleUrl: './loader.scss',
})
export class Loader implements OnInit, OnDestroy {
  loading = false;
  currentLang = 'en';

  constructor(
    private core: Core,
    private cdr: ChangeDetectorRef
  ) {
    // Subscribe to core loading changes from API interceptor
    this.core._loading.subscribe((isLoading) => {
      this.loading = isLoading;
      this.cdr.detectChanges();
    });
  }

  ngOnInit() {
    this.currentLang = localStorage.getItem('Language') || 'en';
  }

  ngOnDestroy() { }
}
