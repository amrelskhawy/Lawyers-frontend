import { Router } from '@angular/router';
import { Injectable, signal } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  /** The signed-in user, kept in sync with sessionStorage. Components read this
   *  reactively (e.g. the top-bar avatar) so a fresh /me updates the UI live. */
  currentUser = signal<any>(this.readStoredUser());

  constructor(private Router: Router) {}

  private readStoredUser(): any | null {
    const raw = sessionStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }

  /** Replace the current user everywhere (signal + sessionStorage). */
  setCurrentUser(user: any) {
    this.currentUser.set(user);
    sessionStorage.setItem('user', JSON.stringify(user));
  }

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
    this.currentUser.set(null);
  }

  /** Session ended (expired token / 401) — clear it and go to the login page. */
  forceLogout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    this.currentUser.set(null);
    this.Router.navigate(['/auth/login']);
  }
}
