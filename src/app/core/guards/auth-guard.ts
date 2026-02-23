
import { inject, Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })

export class AuthGurade {
  constructor(private router: Router) { }
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


export const isAdminGuard: CanActivateFn = (route, state) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    return user.role === 'ADMIN';
  } else {
    return false;
  }
};