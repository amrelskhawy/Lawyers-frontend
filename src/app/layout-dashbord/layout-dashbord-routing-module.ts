import { isAdminGuard, securityAuthGuard } from './../core/guards/auth-guard';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Content } from './content/content';
import { Holidays } from './holidays/holidays';
import { AddServies } from './add-servies/add-servies';
import { Reservations } from './reservations/reservations';
import { Moderators } from './moderators/moderators';
import { Admins } from './admins/admins';

const routes: Routes = [
  {
    path: 'content',
    component: Content,
     canActivate: [securityAuthGuard],
    children: [
      { path: '', component: Reservations },
      { path: 'Moderators', component: Moderators, canActivate: [isAdminGuard] },
      { path: 'admin', component: Admins, canActivate: [isAdminGuard] },
      { path: 'addservies', component: AddServies },
      { path: 'Holidays', component: Holidays },
      { path: '**', redirectTo: '', pathMatch: 'full' }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LayoutDashbordRoutingModule { }
