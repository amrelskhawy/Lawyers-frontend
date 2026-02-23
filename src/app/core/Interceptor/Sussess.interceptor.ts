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
          if (req.method !== 'GET') {
             this.core._Sussess.next(this.translate.instant(`API_MESSAGES.${event.body.message}`));
          }
        }
      }),
    );
  }
}
