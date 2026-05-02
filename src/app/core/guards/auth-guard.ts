
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
  const router = inject(Router);
  const token = sessionStorage.getItem('token');
  const userData = sessionStorage.getItem('user');

  if (token && userData) {
    const user = JSON.parse(userData);
    if (user.role === 'ADMIN') {
      return true;
    }
  }
  router.navigate(['/dashboard/content']);
  return false;
}

import { Passcode } from '../Servies/passcode';

/**
 * Prompts for the dashboard passcode unless the route's `securityGroup`
 * has already been unlocked in this session. Set the group via route
 * data: `{ data: { securityGroup: 'client-cases' } }`.
 */
export const passcodeGuard: CanActivateFn = async (route, _state) => {
  const passcode = inject(Passcode);
  const group = route.data?.['securityGroup'] as string | undefined;
  return passcode.requireAccess(group);
};
