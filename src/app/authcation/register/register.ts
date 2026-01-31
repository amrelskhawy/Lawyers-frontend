import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register implements OnInit {


  ngOnInit(): void {
    this.OnCreateForm();
  }

  constructor(private FB:FormBuilder) {}

  //************************************Varibels***************************************//
    Form = signal<FormGroup>(new FormGroup({}));
  //************************************Varibels***************************************//





    //************************************Implemantion Methods***************************************//
    OnCreateForm() {
      this.Form.set(
        this.FB.group({
          name: [''],
          email: [''],
          password: [''],
        })
      )
    }

    GetControl(controlName:string) {
      return this.Form().get(controlName);
    }
    //************************************Implemantion Methods***************************************//


}
