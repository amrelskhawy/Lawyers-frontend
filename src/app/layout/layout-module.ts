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
import { StepperModule } from 'primeng/stepper';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { ServiesBooking } from './Components/reservations/servies-booking/servies-booking';
import { DataBooking } from './Components/reservations/data-booking/data-booking';
import { MeetingBooking } from './Components/reservations/meeting-booking/meeting-booking';
import { ConfirmeBooking } from './Components/reservations/confirme-booking/confirme-booking';

@NgModule({
  declarations: [
    MainPage,
    HeroSection,
    About,
    Servies,
    SliderServes,
    HowItWork,
    DeatailsDescrption,
    Reservations,
    ServiesBooking,
    DataBooking,
    MeetingBooking,
    ConfirmeBooking,
  ],
  imports: [
    TranslateModule,
    CommonModule,
    FormsModule,
    LayoutRoutingModule,
    SharedModule,
    CarouselModule,
    ButtonModule,
    TagModule,
    AnimateOnScrollModule,
    DialogModule,
    StepperModule,
    CheckboxModule,
    DatePickerModule,
    SelectModule,
    ReactiveFormsModule,
    ReactiveFormsModule,
]
})
export class LayoutModule { }
