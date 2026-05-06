import { Component, signal, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { Meta } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
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
    private meta: Meta,
    private translate: TranslateService,
    private gtmService: GoogleTagManagerService
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

  IntialContentPage() {
    this.translate.get('HOME_META_DESCRIPTION').subscribe((translatedText: string) => {
      this.meta.removeTag("name='description'");
      this.meta.updateTag({
        name: 'description',
        content: translatedText,
      });
    });
  }
}
