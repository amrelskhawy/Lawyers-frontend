import { Component, signal, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Seo } from './core/Servies/seo';
import { GoogleTagManagerService } from 'angular-google-tag-manager';
@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly title = signal('LawyeringFrelancer');
  constructor(
    private router: Router,
    private seo: Seo,
    private translate: TranslateService,
    private gtmService: GoogleTagManagerService,
  ) {
    this.router.events.forEach(item => {
      if (item instanceof NavigationEnd) {
        const gtmTag = {
          event: 'page',
          pageName: item.url
        };

        this.gtmService.pushTag(gtmTag);
      }
    });
  }

  ngOnInit(): void {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      // Clear the previous route's claim first: without this the article page's
      // og:image and published date would follow the visitor onto whatever page
      // they open next, and get shared from there.
      this.seo.beginNavigation();
      setTimeout(() => {
        this.scrollToTop();
        this.IntialContentPage();
      }, 0);
    });
    this.IntialContentPage();
  }

  scrollToTop() {
    // window.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  /**
   * Site-wide fallback metadata. `applySiteDefaults` stands down on routes that
   * set their own — the articles pages do — so this only ever fills the gap.
   */
  IntialContentPage() {
    this.translate
      .get('HOME_META_DESCRIPTION')
      .subscribe((translatedText: string) => this.seo.applySiteDefaults(translatedText));
  }
}
