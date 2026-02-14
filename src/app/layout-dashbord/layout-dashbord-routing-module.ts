import { securityAuthGuard } from './../core/guards/auth-guard';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Users } from './users/users';
import { Content } from './content/content';
import { WorkDays } from './work-days/work-days';
import { Holidays } from './holidays/holidays';
import { AddServies } from './add-servies/add-servies';

const routes: Routes = [
  {
    path: 'content',
    component: Content,
    canActivate:[securityAuthGuard],
    children: [
      { path: '', component: Users },
      { path: 'addservies', component: AddServies },
      { path: 'workdays', component: WorkDays },
      { path: 'Holidays', component: Holidays },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LayoutDashbordRoutingModule {}
