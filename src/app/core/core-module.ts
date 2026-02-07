import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoreRoutingModule } from './core-routing-module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './Interceptor/authcathion.interceptor';
import { LoaderInterceptor } from './Interceptor/loding-spaner.interceptor';
import { SuccessInterceptor } from './Interceptor/Sussess.interceptor';

@NgModule({
  declarations: [],
  imports: [CommonModule, CoreRoutingModule],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },

    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoaderInterceptor,
      multi: true,
    },

    {
      provide: HTTP_INTERCEPTORS,
      useClass: SuccessInterceptor,
      multi: true,
    },
  ],
})
export class CoreModule {}
