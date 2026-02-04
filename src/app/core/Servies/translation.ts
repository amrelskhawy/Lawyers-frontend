import { Injectable } from '@angular/core';
import { languages } from '../languages';

@Injectable({
  providedIn: 'root',
})
export class Translation {
  public currentLang: string = 'ar';

  setLanguage(lang: string) {
    this.currentLang = lang;
  }

  translate(key: string): string {
    const langData = (languages as any)[this.currentLang];   
    return langData ? langData[key] : key;
  }

}
