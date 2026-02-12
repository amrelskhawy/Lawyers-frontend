
import { inject, Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })

export class AuthGurade {
  constructor(private router: Router) {}
 canActivate(): boolean {
    const token = sessionStorage.getItem('token');
    if (token) {
      return true;
    } else {
      this.router.navigate(['/auth/login']);
      return false;
    }
  }

}
export const securityAuthGuard: CanActivateFn = (route, state) => {
  return inject(AuthGurade).canActivate();
};
