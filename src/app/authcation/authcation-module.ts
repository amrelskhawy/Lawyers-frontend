import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthcationRoutingModule } from './authcation-routing-module';
import { Register } from './register/register';
import { Login } from './login/login';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '../core/Pipes/translate-pipe';

@NgModule({
  declarations: [Register, Login,TranslatePipe],
  imports: [CommonModule, AuthcationRoutingModule, ReactiveFormsModule],
})
export class AuthcationModule {}
