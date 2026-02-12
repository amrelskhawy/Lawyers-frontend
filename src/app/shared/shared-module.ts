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
import { Success } from './success/success';
import { Tabel } from './tabel/tabel';
import { Footer } from './footer/footer';
import { Translation } from './translation/translation';
import { TranslateModule } from '@ngx-translate/core'; 

@NgModule({
  declarations: [
    Header,
    Loader,
    TopHeader,
    ChatBoot,
    DrawerLeft,
    ChangeLangauage,
    Success,
    Tabel,
    Footer,
    Translation
  ],
  imports: [
    CommonModule,
    SharedRoutingModule,
    DrawerModule,
    TableModule,
    TranslateModule
  ],
  exports:[
    Header,
    Loader,
    TopHeader,
    ChatBoot,
    DrawerLeft,
    Success,
    Tabel,
    Translation,
    Footer
  ]
})
export class SharedModule { }
