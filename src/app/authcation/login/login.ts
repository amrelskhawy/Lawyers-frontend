import { Component, ElementRef, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Data } from '../../core/Servies/data';
import { Router } from '@angular/router';

/** localStorage key for the "remember me" email convenience feature. */
const REMEMBERED_EMAIL_KEY = 'login_remembered_email';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  //************************************Varibels***************************************//
  Form = signal<FormGroup>(
    new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required),
      rememberMe: new FormControl(false),
    }),
  );
  showPassword = signal<boolean>(false);
  //************************************Varibels***************************************//

  constructor(
    private FB: FormBuilder,
    private Data: Data,
    private router: Router,
    private host: ElementRef<HTMLElement>,
  ) {}

  ngOnInit(): void {
    // Pre-fill the email if it was remembered on a previous visit.
    const remembered = localStorage.getItem(REMEMBERED_EMAIL_KEY);
    if (remembered) {
      this.Form().patchValue({ email: remembered, rememberMe: true });
    }
  }

  //************************************Implemantion Methods***************************************//

  togglePasswordVisibility() {
    this.showPassword.update((val) => !val);
  }

  onSubmit() {
    if (this.Form().invalid) {
      this.Form().markAllAsTouched();
      this.focusFirstInvalid();
      return;
    }

    const { email, password, rememberMe } = this.Form().value;

    // Persist only the email (never the credentials) for convenience.
    if (rememberMe) {
      localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
    } else {
      localStorage.removeItem(REMEMBERED_EMAIL_KEY);
    }

    this.Data.post('auth/login', { email, password }).subscribe((res: any) => {
      this.Form().reset();
      sessionStorage.setItem('token', res.data.token);
      sessionStorage.setItem('user', JSON.stringify(res.data.user));

      if (res.data.user.role === 'LAWYER' || res.data.user.role === 'CONSULTANT') {
        this.router.navigate(['/dashboard/content/client-cases']);
      } else {
        this.router.navigate(['/dashboard/content']);
      }
    });
  }

  getControlName(controlName: string) {
    return this.Form().get(controlName);
  }

  /** Move keyboard/screen-reader focus to the first invalid field after a failed submit. */
  private focusFirstInvalid() {
    const first = this.host.nativeElement.querySelector<HTMLElement>(
      'input.ng-invalid, [formControlName].ng-invalid input, [formControlName].ng-invalid',
    );
    first?.focus();
  }
  //************************************Implemantion Methods***************************************//
}
