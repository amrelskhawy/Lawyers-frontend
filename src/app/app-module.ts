import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import Aura from '@primeuix/themes/aura';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { RouterModule } from '@angular/router';
import { CoreModule } from './core/core-module';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { SharedModule } from './shared/shared-module';
import { providePrimeNG } from 'primeng/config';

@NgModule({
  declarations: [App],
  imports: [BrowserModule, AppRoutingModule, RouterModule.forRoot([]), CoreModule, SharedModule],
  providers: [
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
