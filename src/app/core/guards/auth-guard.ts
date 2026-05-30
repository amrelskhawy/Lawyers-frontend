
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
    // Safe redirect for non-admin roles to avoid loops
    if (user.role === 'LAWYER') {
      router.navigate(['/dashboard/content/client-cases']);
    } else {
      router.navigate(['/dashboard/content']);
    }
    return false;
  }
  router.navigate(['/auth/login']);
  return false;
};

export const roleGuard = (...roles: string[]): CanActivateFn => (route, state) => {
  const router = inject(Router);
  const token = sessionStorage.getItem('token');
  const userData = sessionStorage.getItem('user');

  if (!token || !userData) {
    router.navigate(['/auth/login']);
    return false;
  }

  const user = JSON.parse(userData);
  if (roles.includes(user.role)) {
    return true;
  }

  // If role check fails, redirect to a safe default for that role to avoid loops
  if (user.role === 'LAWYER') {
    router.navigate(['/dashboard/content/client-cases']);
  } else {
    router.navigate(['/dashboard/content']);
  }
  return false;
};
