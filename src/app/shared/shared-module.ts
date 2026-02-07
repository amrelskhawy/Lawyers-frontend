import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing-module';
import { Header } from './header/header';
import { Loader } from './loader/loader';
import { TopHeader } from './top-header/top-header';
import { ChatBoot } from './chat-boot/chat-boot';
import { DrawerLeft } from './drawer-left/drawer-left';
import { DrawerModule } from 'primeng/drawer';


@NgModule({
  declarations: [
    Header,
    Loader,
    TopHeader,
    ChatBoot,
    DrawerLeft
  ],
  imports: [
    CommonModule,
    SharedRoutingModule,
    DrawerModule
  ],
  exports:[
    Header,
    Loader,
    TopHeader,
    ChatBoot,
    DrawerLeft
  ]
})
export class SharedModule { }
