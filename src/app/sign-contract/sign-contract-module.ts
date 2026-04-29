import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { SignContractRoutingModule } from './sign-contract-routing-module';
import { SignContract } from './sign-contract';
import { LawyerFeesContractPreviewModule } from '../shared/lawyer-fees-contract-preview/lawyer-fees-contract-preview-module';

@NgModule({
  declarations: [SignContract],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonModule,
    SignContractRoutingModule,
    LawyerFeesContractPreviewModule,
  ],
})
export class SignContractModule {}
