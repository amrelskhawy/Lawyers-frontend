
import { inject, Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

/** True when a token exists and its `exp` is still in the future.
 *  Sessions last 1 hour — an expired token is cleared so stale tabs
 *  land back on the login page instead of a broken dashboard. */
function hasValidSession(): boolean {
  const token = sessionStorage.getItem('token');
  if (!token) return false;
  try {
    const decoded: { exp?: number } = jwtDecode(token);
    if (decoded.exp && decoded.exp * 1000 > Date.now()) {
      return true;
    }
  } catch {
    // fall through — malformed token is treated as no session
  }
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
  return false;
}

@Injectable({ providedIn: 'root' })

export class AuthGurade {
  constructor(private router: Router) { }
  canActivate(): boolean {
    if (hasValidSession()) {
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
  const userData = sessionStorage.getItem('user');

  if (hasValidSession() && userData) {
    const user = JSON.parse(userData);
    if (user.role === 'ADMIN') {
      return true;
    }
    // Safe redirect for non-admin roles to avoid loops
    if (user.role === 'LAWYER' || user.role === 'CONSULTANT') {
      router.navigate(['/dashboard/content/client-cases']);
    } else {
      router.navigate(['/dashboard/content']);
    }
    return false;
  }
  router.navigate(['/auth/login']);
  return false;
};

/** Temporary extra lock on the money pages: everyone allowed in by role must
 *  still type a shared passcode once per browser session. Remove this guard
 *  (and its route usages) when the client asks for it to go away. */
const FINANCIALS_PASSCODE = '334455';
const FINANCIALS_PASSCODE_KEY = 'financialsPasscodeOk';

export const passcodeGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  if (sessionStorage.getItem(FINANCIALS_PASSCODE_KEY) === 'true') {
    return true;
  }

  const entered = window.prompt('الرجاء إدخال رمز الدخول للشؤون المالية');
  if (entered === FINANCIALS_PASSCODE) {
    sessionStorage.setItem(FINANCIALS_PASSCODE_KEY, 'true');
    return true;
  }

  if (entered !== null) {
    window.alert('رمز الدخول غير صحيح');
  }

  // Cancelled or wrong code — bounce back to a page the user can actually use.
  const userData = sessionStorage.getItem('user');
  const role = userData ? JSON.parse(userData).role : null;
  if (role === 'LAWYER' || role === 'CONSULTANT') {
    router.navigate(['/dashboard/content/client-cases']);
  } else {
    router.navigate(['/dashboard/content']);
  }
  return false;
};

export const roleGuard = (...roles: string[]): CanActivateFn => (route, state) => {
  const router = inject(Router);
  const userData = sessionStorage.getItem('user');

  if (!hasValidSession() || !userData) {
    router.navigate(['/auth/login']);
    return false;
  }

  const user = JSON.parse(userData);
  if (roles.includes(user.role)) {
    return true;
  }

  // If role check fails, redirect to a safe default for that role to avoid loops
  if (user.role === 'LAWYER' || user.role === 'CONSULTANT') {
    router.navigate(['/dashboard/content/client-cases']);
  } else {
    router.navigate(['/dashboard/content']);
  }
  return false;
};
