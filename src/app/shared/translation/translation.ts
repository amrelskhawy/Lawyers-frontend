import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/**
 * Arabic is the default for a first-time visitor: most clients read Arabic, and
 * index.html ships `lang="ar" dir="rtl"` for the crawlers — booting into
 * English would render English text inside an Arabic document and flip the
 * layout on load. A returning visitor's own choice always wins.
 */
const DEFAULT_LANG = 'ar';

@Component({
  selector: 'app-translation',
  standalone: false,
  templateUrl: './translation.html',
  styleUrl: './translation.scss',
})
export class Translation implements OnInit {
  currentLang: string = DEFAULT_LANG;

  constructor(private translate: TranslateService) {
    // setDefaultLang (deprecated) is intentional — setFallbackLang triggers an
    // eager HttpClient load that causes an NG0200 cycle with HTTP interceptors.
    this.translate.setDefaultLang(DEFAULT_LANG);
  }

  ngOnInit() {
    const savedLang = localStorage.getItem('Language');
    if (savedLang && (savedLang === 'ar' || savedLang === 'en')) {
      this.currentLang = savedLang;
      this.translate.use(savedLang);
    } else {
      this.currentLang = DEFAULT_LANG;
      this.translate.use(DEFAULT_LANG);
      localStorage.setItem('Language', DEFAULT_LANG);
    }
    this.updateDirection(this.currentLang);
  }

  switchLanguage(lang: string) {
    localStorage.setItem('Language', lang);
    this.currentLang = lang;
    this.translate.use(lang);

    this.updateDirection(lang);
  }

  private updateDirection(lang: string) {
    const htmlTag = document.documentElement;
    htmlTag.dir = lang === 'ar' ? 'rtl' : 'ltr';
    htmlTag.lang = lang;
  }
}
