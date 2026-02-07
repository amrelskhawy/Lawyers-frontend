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
  ngOnInit(): void {
    this.OnCreateForm();
  }

  constructor(
    private FB: FormBuilder,
    private Data: Data,
  ) {}

  //************************************Varibels***************************************//
  Form = signal<FormGroup>(new FormGroup({}));
  //************************************Varibels***************************************//

  //************************************Implemantion Methods***************************************//
  OnCreateForm() {
    this.Form.set(
      this.FB.group({
        email: ['', Validators.required],
        password: ['', Validators.required],
      }),
    );
  }


  onSubmit() {
    if (this.Form().invalid) {
      this.Form().markAllAsTouched();
      return;
    }
    this.Data.post('auth/login', this.Form().value).subscribe((res) => {
      this.Form().reset();
    });
  }
  

  getControlName(controlName: string) {
    return this.Form().get(controlName);
  }
  //************************************Implemantion Methods***************************************//
}
