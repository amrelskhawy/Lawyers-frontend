import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

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

  constructor(private FB: FormBuilder) {}


  //************************************Varibels***************************************//
  Form = signal<FormGroup>(new FormGroup({}));
  //************************************Varibels***************************************//





    //************************************Implemantion Methods***************************************//
  OnCreateForm() {
    this.Form.set(
      this.FB.group({
        email: [''],
        password: [''],
      }),
    );
  }
  getControl(controlName: string) {
    return this.Form().get(controlName);
  }
    //************************************Implemantion Methods***************************************//

}
