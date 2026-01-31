import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LayoutRoutingModule } from './layout-routing-module';
import { MainPage } from './Components/main-page/main-page';
import { HeroSection } from './Components/hero-section/hero-section';
import { SharedModule } from '../shared/shared-module';
import { About } from './Components/about/about';
import { Servies } from './Components/servies/servies';
import { SliderServes } from './Components/slider-serves/slider-serves';


@NgModule({
  declarations: [
    MainPage,
    HeroSection,
    About,
    Servies,
    SliderServes
  ],
  imports: [
    CommonModule,
    LayoutRoutingModule,
    SharedModule
  ]
})
export class LayoutModule { }
