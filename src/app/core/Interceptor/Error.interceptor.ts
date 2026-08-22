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
import { Auth } from '../Servies/auth';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(
    private core: Core,
    private translate: TranslateService,
    private auth: Auth
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // The sidebar task badge polls in the background — a failed poll must
        // not pop a toast over whatever the user is doing. A 401 still logs out
        // below, same as any other request.
        const isSilent = req.url.includes('tasks/open-count');
        let apiMessage = 'Something went wrong';
        if (error.error && error.error.message) {
          const mainCode = error.error.message;
          apiMessage = this.translate.instant(`API_MESSAGES.${mainCode}`);
        }
        if (!isSilent) this.core._Error.next(apiMessage);

        // Session expired or token invalid — force a logout, but not for a
        // failed login attempt (the user is already on the login page).
        if (error.status === 401 && sessionStorage.getItem('token')) {
          this.auth.forceLogout();
        }
        return throwError(() => error);
      })
    );
  }
}
