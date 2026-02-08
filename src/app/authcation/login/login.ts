import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Data } from '../../core/Servies/data';

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
  ) { }

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
    this.Data.post('auth/login', this.Form().value).subscribe((res) => {
      // Handle success appropriately, e.g., navigation or storing token
      this.Form().reset();
    });
  }


  getControlName(controlName: string) {
    return this.Form().get(controlName);
  }
  //************************************Implemantion Methods***************************************//
}
