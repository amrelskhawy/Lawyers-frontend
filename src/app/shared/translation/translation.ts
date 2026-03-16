import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-translation',
  standalone: false,
  templateUrl: './translation.html',
  styleUrl: './translation.scss',
})
export class Translation implements OnInit {
  currentLang: string = 'en';

  constructor(private translate: TranslateService) {
    this.translate.setDefaultLang('en');
  }

  ngOnInit() {
    const savedLang = localStorage.getItem('Language');
    if (savedLang && (savedLang === 'ar' || savedLang === 'en')) {
      this.currentLang = savedLang;
      this.translate.use(savedLang);
    } else {
      this.currentLang = 'en';
      this.translate.use('en');
      localStorage.setItem('Language', 'en');
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
