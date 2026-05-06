import { NgModule, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import Aura from '@primeuix/themes/aura';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { RouterModule } from '@angular/router';
import { CoreModule } from './core/core-module';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { SharedModule } from './shared/shared-module';
import { providePrimeNG } from 'primeng/config';
import { Observable } from 'rxjs';
import { GoogleTagManagerModule } from 'angular-google-tag-manager';
import { environment } from './environments/environment';

//===========================Translatetion=======================================//
export class CustomTranslateLoader implements TranslateLoader {
  constructor(
    private http: HttpClient,
    private prefix: string = './assets/i18n/',
    private suffix: string = '.json',
  ) {}

  getTranslation(lang: string): Observable<any> {
    return this.http.get(`${this.prefix}${lang}${this.suffix}`);
  }
}

export function createTranslateLoader(http: HttpClient): TranslateLoader {
  return new CustomTranslateLoader(http, './assets/i18n/', '.json');
}
//===========================Translatetion=======================================//

@NgModule({
  declarations: [App],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule.forRoot([]),
    CoreModule,
    SharedModule,
    TranslateModule.forRoot({
      defaultLanguage: 'ar',
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
    GoogleTagManagerModule.forRoot({ id: environment.gtmId }),
  ],
  providers: [
    provideZonelessChangeDetection(),
    
    provideBrowserGlobalErrorListeners(),
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: 'none',
        },
      },
    }),
  ],
  bootstrap: [App],
})
export class AppModule {}
