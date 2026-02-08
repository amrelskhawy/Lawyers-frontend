import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
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
import { Tabel } from './tabel/tabel';
import { Footer } from './footer/footer';


@NgModule({
  declarations: [
    TranslatePipe,
    Header,
    Loader,
    TopHeader,
    ChatBoot,
    DrawerLeft,
    ChangeLangauage,
    Success,
    Tabel,
    Footer
  ],
  imports: [
    CommonModule,
    SharedRoutingModule,
    DrawerModule,
    TableModule
  ],
  exports:[
    Header,
    Loader,
    TopHeader,
    ChatBoot,
    DrawerLeft,
    Success,
    Tabel,
    Footer
  ]
})
export class SharedModule { }
