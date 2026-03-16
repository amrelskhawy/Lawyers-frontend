import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Core } from '../Servies/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(
    private core: Core,
    private translate: TranslateService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let apiMessage = 'Something went wrong';
        if (error.error && error.error.message) {
          const mainCode = error.error.message;
          apiMessage = this.translate.instant(`API_MESSAGES.${mainCode}`);
        }
        this.core._Error.next(apiMessage);
        return throwError(() => error);
      })
    );
  }
}
