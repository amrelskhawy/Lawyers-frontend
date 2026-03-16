import { MainPage } from './Components/main-page/main-page';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Reservations } from './Components/reservations/reservations';

const routes: Routes = [
  {path:"",component:MainPage},
  {path:"booking",component:Reservations},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule { }
