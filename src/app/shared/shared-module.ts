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
import { DatePipe } from '@angular/common';
import { ConfirmationDelete } from './confirmation-delete/confirmation-delete';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SkeletonModule } from 'primeng/skeleton';
import { Error } from './error/error';


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
    Translation,
    ConfirmationDelete,
    Error
  ],
  imports: [
    CommonModule,
    SharedRoutingModule,
    DrawerModule,
    TableModule,
    TranslateModule,
    ToastModule,
    SkeletonModule,
  ],
  exports: [
    Header,
    Loader,
    TopHeader,
    ChatBoot,
    DrawerLeft,
    Success,
    Tabel,
    Translation,
    ConfirmationDelete,
    Error,
    Footer,
  ],

  providers: [
    DatePipe,
    MessageService
  ]

})
export class SharedModule { }
