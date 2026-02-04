import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing-module';
import { Header } from './header/header';
import { Loader } from './loader/loader';
import { TopHeader } from './top-header/top-header';


@NgModule({
  declarations: [
    Header,
    Loader,
    TopHeader
  ],
  imports: [
    CommonModule,
    SharedRoutingModule
  ],
  exports:[
    Header,
    Loader,
    TopHeader
  ]
})
export class SharedModule { }
