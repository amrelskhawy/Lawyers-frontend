import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignContract } from './sign-contract';

const routes: Routes = [{ path: '', component: SignContract }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SignContractRoutingModule {}
