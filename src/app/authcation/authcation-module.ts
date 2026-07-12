import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AuthcationRoutingModule } from './authcation-routing-module';
import { Register } from './register/register';
import { Login } from './login/login';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared-module';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';

@NgModule({
  declarations: [Register, Login],
  imports: [
    CommonModule,
    AuthcationRoutingModule,
    ReactiveFormsModule,
    TranslateModule,
    SharedModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CheckboxModule,
  ],
})
export class AuthcationModule {}
