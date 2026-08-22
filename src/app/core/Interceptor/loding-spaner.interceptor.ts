import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { finalize, Observable } from 'rxjs';
import { Core } from '../Servies/core';
@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
  constructor(private Core: Core) { }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // The chat poll and the sidebar task badge both run in the background —
    // showing the blocking loader for them would flash over whatever the user
    // is actually doing.
    if (req.url.includes('chat') || req.url.includes('tasks/open-count')) {
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
