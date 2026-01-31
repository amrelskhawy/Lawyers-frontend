import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Data } from '../../core/Servies/data';

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

  constructor(
    private FB: FormBuilder,
    private Data:Data
  ) {}

  //************************************Varibels***************************************//
  Form = signal<FormGroup>(new FormGroup({}));
  //************************************Varibels***************************************//

  //************************************Implemantion Methods***************************************//
  OnCreateForm() {
    this.Form.set(
      this.FB.group({
        name: ['', Validators.required],
        email: ['', Validators.email],
        password: ['', Validators.minLength(6)],
      }),
    );
  }

  onSubmit() {

    if(this.Form().invalid){
      return;
    }

    this.Data.post('auth/register',this.Form().value).subscribe((res)=>{
      console.log(res)
    })

  }

  getControlName(controlName: string) {
    return this.Form().get(controlName);
  }
  //************************************Implemantion Methods***************************************//
}
