import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutRoutingModule } from './layout-routing-module';
import { MainPage } from './Components/main-page/main-page';
import { HeroSection } from './Components/hero-section/hero-section';
import { SharedModule } from '../shared/shared-module';
import { About } from './Components/about/about';
import { Servies } from './Components/servies/servies';
import { SliderServes } from './Components/slider-serves/slider-serves';
import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { AnimateOnScrollModule } from 'primeng/animateonscroll';
import { HowItWork } from './Components/how-it-work/how-it-work';

@NgModule({
  declarations: [
    MainPage,
    HeroSection,
    About,
    Servies,
    SliderServes,
    HowItWork
  ],
  imports: [
    CommonModule,
    LayoutRoutingModule,
    SharedModule,
    CarouselModule,
    ButtonModule,
    TagModule,
    AnimateOnScrollModule,
  ]
})
export class LayoutModule { }
