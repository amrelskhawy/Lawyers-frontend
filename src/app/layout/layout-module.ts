import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LayoutRoutingModule } from './layout-routing-module';
import { MainPage } from './Components/main-page/main-page';
import { HeroSection } from './Components/hero-section/hero-section';
import { SharedModule } from '../shared/shared-module';


@NgModule({
  declarations: [
    MainPage,
    HeroSection
  ],
  imports: [
    CommonModule,
    LayoutRoutingModule,
    SharedModule
  ]
})
export class LayoutModule { }
