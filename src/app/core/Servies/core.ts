import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Core {
  _loading = new BehaviorSubject<boolean>(false);
  _Sussess = new BehaviorSubject<string>("");
  _Error = new BehaviorSubject<string>("");

  private requestCount = 0;

  showLoader() {
    this.requestCount++;
    this._loading.next(true);
  }

  hideLoader() {
    this.requestCount = Math.max(0, this.requestCount - 1);
    if (this.requestCount === 0) {
      this._loading.next(false);
    }
  }
}
