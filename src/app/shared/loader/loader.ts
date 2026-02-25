import { Component, ChangeDetectorRef, effect } from '@angular/core';
import { Core } from '../../core/Servies/core';
import { Data } from '../../core/Servies/data';
import { Router } from '@angular/router';

@Component({
  selector: 'app-loader',
  standalone: false,
  templateUrl: './loader.html',
  styleUrl: './loader.scss',
})
export class Loader {
  loading = false;
  currentLang = 'en';

  constructor(
    private core: Core,
    private data: Data,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    // Effect to react to publicData signal changes
    effect(() => {
      this.updateLoadingStatus();
    });

    // Subscribe to core loading changes
    this.core._loading.subscribe(() => {
      this.updateLoadingStatus();
    });
  }

  ngOnInit() {
    this.currentLang = localStorage.getItem('Language') || 'en';
  }

  private updateLoadingStatus() {
    const isInterceptorLoading = this.core._loading.value;
    const isPublicRoute = !this.router.url.includes('dashboard');
    const isPublicDataMissing = isPublicRoute && !this.data.publicData();

    this.loading = isInterceptorLoading || isPublicDataMissing;
    this.cdr.detectChanges();
  }

  ngOnDestroy() { }
}
