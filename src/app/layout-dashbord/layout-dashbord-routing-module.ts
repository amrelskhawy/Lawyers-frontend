import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Users } from './users/users';
import { Content } from './content/content';
import { WorkDays } from './work-days/work-days';
import { Holidays } from './holidays/holidays';

const routes: Routes = [
  { path: 'content', component:Content, children: [
    { path: '', component: Users },
    { path: 'workdays', component: WorkDays },
    { path: 'Holidays', component: Holidays },

  ] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LayoutDashbordRoutingModule {}
