import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing-module';
import { Header } from './header/header';
import { Loader } from './loader/loader';
import { TopHeader } from './top-header/top-header';
import { ChatBoot } from './chat-boot/chat-boot';
import { DrawerLeft } from './drawer-left/drawer-left';
import { DrawerModule } from 'primeng/drawer';
import { ChangeLangauage } from './change-langauage/change-langauage';
import { TranslatePipe } from '../core/Pipes/translate-pipe';
import { Success } from './success/success';


@NgModule({
  declarations: [
    TranslatePipe,
    Header,
    Loader,
    TopHeader,
    ChatBoot,
    DrawerLeft,
    ChangeLangauage,
    Success
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
    DrawerLeft,
    Success
  ]
})
export class SharedModule { }
