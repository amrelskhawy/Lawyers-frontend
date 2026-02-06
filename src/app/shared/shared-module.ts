import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing-module';
import { Header } from './header/header';
import { Loader } from './loader/loader';
import { TopHeader } from './top-header/top-header';
import { ChatBoot } from './chat-boot/chat-boot';


@NgModule({
  declarations: [
    Header,
    Loader,
    TopHeader,
    ChatBoot
  ],
  imports: [
    CommonModule,
    SharedRoutingModule
  ],
  exports:[
    Header,
    Loader,
    TopHeader,
    ChatBoot
  ]
})
export class SharedModule { }
