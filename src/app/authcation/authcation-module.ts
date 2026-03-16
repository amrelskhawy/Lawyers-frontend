import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AuthcationRoutingModule } from './authcation-routing-module';
import { Register } from './register/register';
import { Login } from './login/login';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared-module';

@NgModule({
  declarations: [Register, Login],
  imports: [CommonModule, AuthcationRoutingModule, ReactiveFormsModule,TranslateModule,SharedModule],
})
export class AuthcationModule {}
