import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { finalize, Observable } from 'rxjs';
import { Core } from '../Servies/core';
@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
  constructor(private Core: Core) { }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.includes('chat')) {
      return next.handle(req);
    }

    this.Core.showLoader();
    return next.handle(req).pipe(
      finalize(() => {
        this.Core.hideLoader();
      }),
    );
  }
}
