import { ActivatedRoute } from '@angular/router';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Data } from '../../../core/Servies/data';
import { Seo } from '../../../core/Servies/seo';

@Component({
  selector: 'app-main-page',
  standalone: false,
  templateUrl: './main-page.html',
  styleUrl: './main-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainPage implements OnInit {
  constructor(
    private dataService: Data,
    private route: ActivatedRoute,
    private seo: Seo,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.dataService.getPublicData().subscribe();
    this.applyMetadata();

    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        setTimeout(() => {
          const el = document.getElementById(fragment);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 300);
      }
    });
  }

  /**
   * Claims the home route's own metadata (title/description already match the
   * site defaults, but this adds the firm's practice-area keywords) so it wins
   * over `applySiteDefaults` regardless of load order.
   */
  private applyMetadata() {
    this.translate.get('HOME_META_DESCRIPTION').subscribe((description: string) => {
      this.seo.apply({
        title: this.seo.siteName,
        description,
        canonical: this.seo.url(''),
        type: 'website',
        keywords: this.seo.siteKeywords,
        language: this.seo.uiLanguage,
      });
    });
  }

  navigation: string = '';

  onEventRoute(event: string) {
    this.navigation = event;
    const el = document.getElementById(this.navigation);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

}
