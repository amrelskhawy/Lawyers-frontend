import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
  HttpResponse,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Core } from '../Servies/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class SuccessInterceptor implements HttpInterceptor {
  constructor(
    private core: Core,
    private translate: TranslateService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          // make sure that the request is not for chat and not GET requests
          if (req.method !== 'GET' && !req.url.includes('/chat')) {
            this.core._Sussess.next(this.translate.instant(`API_MESSAGES.${event.body.message}`));
          }
        }
      }),
    );
  }
}
