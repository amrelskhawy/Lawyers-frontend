import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  constructor(private Router: Router) {}

  getDecodedToken(): any | null {
    const token = sessionStorage.getItem('token');
    if (!token) {
      return null;
    }
    try {
      return jwtDecode(token);
    } catch (error) {
      return null;
    }
  }



  /** True when there is no token or its `exp` has passed (1-hour sessions). */
  isTokenExpired(): boolean {
    const decoded = this.getDecodedToken();
    return !decoded?.exp || decoded.exp * 1000 <= Date.now();
  }

  handelLogOut() {
    this.Router.navigate(['']);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  }

  /** Session ended (expired token / 401) — clear it and go to the login page. */
  forceLogout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    this.Router.navigate(['/auth/login']);
  }
}
