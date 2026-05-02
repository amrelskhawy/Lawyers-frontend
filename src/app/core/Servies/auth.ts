import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { Passcode } from './passcode';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  constructor( private Router: Router, private passcode: Passcode) {}

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



  handelLogOut() {
    this.Router.navigate(['']);
    sessionStorage.removeItem('token');
    this.passcode.lockAll();
  }
}
