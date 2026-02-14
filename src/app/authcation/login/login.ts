import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Data } from '../../core/Servies/data';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  //************************************Varibels***************************************//
  Form = signal<FormGroup>(new FormGroup({}));
  showPassword = signal<boolean>(false);
  //************************************Varibels***************************************//

  constructor(
    private FB: FormBuilder,
    private Data: Data,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.OnCreateForm();
  }

  //************************************Implemantion Methods***************************************//
  OnCreateForm() {
    this.Form.set(
      this.FB.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
      }),
    );
  }

  togglePasswordVisibility() {
    this.showPassword.update((val) => !val);
  }

  onSubmit() {
    if (this.Form().invalid) {
      this.Form().markAllAsTouched();
      return;
    }
    this.Data.post('auth/login', this.Form().value).subscribe((res: any) => {
      this.Form().reset();
      sessionStorage.setItem('token', res.data);
      this.router.navigate(['/dashboard/content']);
    });
  }

  getControlName(controlName: string) {
    return this.Form().get(controlName);
  }
  //************************************Implemantion Methods***************************************//
}
