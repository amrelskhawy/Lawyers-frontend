import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing-module';
import { Header } from './header/header';


@NgModule({
  declarations: [
    Header
  ],
  imports: [
    CommonModule,
    SharedRoutingModule
  ],
  exports:[
    Header
  ]
})
export class SharedModule { }
