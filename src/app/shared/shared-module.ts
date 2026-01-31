import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing-module';
import { Header } from './header/header';
import { Loader } from './loader/loader';


@NgModule({
  declarations: [
    Header,
    Loader
  ],
  imports: [
    CommonModule,
    SharedRoutingModule
  ],
  exports:[
    Header,
    Loader
  ]
})
export class SharedModule { }
