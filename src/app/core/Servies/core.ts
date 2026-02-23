import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Core {
  _loading = new BehaviorSubject<boolean>(false);
  _Sussess = new BehaviorSubject<string>("");
  _Error = new BehaviorSubject<string>("");
}
