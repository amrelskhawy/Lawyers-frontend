import { isAdminGuard, securityAuthGuard } from './../core/guards/auth-guard';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Content } from './content/content';
import { Holidays } from './holidays/holidays';
import { AddServies } from './add-servies/add-servies';
import { Reservations } from './reservations/reservations';
import { Moderators } from './moderators/moderators';
import { Admins } from './admins/admins';
import { Customers } from './customers/customers';
import { Organizers } from './organizers/organizers';
import { ClientCases } from './client-cases/client-cases';
import { EditCase } from './client-cases/edit-case/edit-case';
import { SessionReport } from './session-report/session-report';

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
      { path: 'customers', component: Customers },
      { path: 'organizers', component: Organizers, canActivate: [isAdminGuard] },
      { path: 'client-cases', component: ClientCases },
      { path: 'client-cases/:id/edit', component: EditCase },
      { path: 'session-report/:caseId', component: SessionReport },
      { path: '**', redirectTo: '', pathMatch: 'full' }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LayoutDashbordRoutingModule { }
