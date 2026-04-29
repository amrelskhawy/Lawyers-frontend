import { isAdminGuard, securityAuthGuard, passcodeGuard } from './../core/guards/auth-guard';
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
import { SessionReportsList } from './session-reports-list/session-reports-list';
import { FieldVisitReport } from './field-visit-report/field-visit-report';
import { LawyerFeesContractsList } from './lawyer-fees-contracts-list/lawyer-fees-contracts-list';
import { LawyerFeesContract } from './lawyer-fees-contract/lawyer-fees-contract';

const routes: Routes = [
  {
    path: 'content',
    component: Content,
    canActivate: [securityAuthGuard],
    children: [
      { path: '', component: Reservations },
      { path: 'Moderators', component: Moderators, canActivate: [isAdminGuard, passcodeGuard] },
      { path: 'admin', component: Admins, canActivate: [isAdminGuard, passcodeGuard] },
      { path: 'addservies', component: AddServies, canActivate: [passcodeGuard] },
      { path: 'customers', component: Customers },
      { path: 'Holidays', component: Holidays, canActivate: [passcodeGuard] },
      { path: 'organizers', component: Organizers, canActivate: [isAdminGuard, passcodeGuard] },
      { path: 'client-cases', component: ClientCases, canActivate: [passcodeGuard] },
      { path: 'client-cases/:id/edit', component: EditCase, canActivate: [passcodeGuard] },
      { path: 'session-reports/:caseId', component: SessionReportsList, canActivate: [passcodeGuard] },
      { path: 'session-report/:caseId', component: SessionReport, canActivate: [passcodeGuard] },
      { path: 'session-report/:caseId/:reportId', component: SessionReport, canActivate: [passcodeGuard] },
      { path: 'field-visit-report/:caseId', component: FieldVisitReport, canActivate: [passcodeGuard] },
      { path: 'field-visit-report/:caseId/:reportId', component: FieldVisitReport, canActivate: [passcodeGuard] },
      { path: 'lawyer-fees-contracts', component: LawyerFeesContractsList, canActivate: [passcodeGuard] },
      { path: 'lawyer-fees-contract/case/:caseId', component: LawyerFeesContract, canActivate: [passcodeGuard] },
      { path: 'lawyer-fees-contract/case/:caseId/:id', component: LawyerFeesContract, canActivate: [passcodeGuard] },
      { path: 'lawyer-fees-contract/:id', component: LawyerFeesContract, canActivate: [passcodeGuard] },
      { path: '**', redirectTo: '', pathMatch: 'full' }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LayoutDashbordRoutingModule { }
