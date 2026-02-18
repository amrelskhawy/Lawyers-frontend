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
import { TranslateModule } from '@ngx-translate/core';
import { DeatailsDescrption } from './Components/slider-serves/deatails-descrption/deatails-descrption';
import { DialogModule } from 'primeng/dialog';
import { Reservations } from './Components/reservations/reservations';

@NgModule({
  declarations: [
    MainPage,
    HeroSection,
    About,
    Servies,
    SliderServes,
    HowItWork,
    DeatailsDescrption,
    Reservations
  ],
  imports: [
    TranslateModule,
    CommonModule,
    LayoutRoutingModule,
    SharedModule,
    CarouselModule,
    ButtonModule,
    TagModule,
    AnimateOnScrollModule,
    DialogModule
  ]
})
export class LayoutModule { }
