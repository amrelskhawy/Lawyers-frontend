import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LayoutDashbordRoutingModule } from './layout-dashbord-routing-module';
import { Menue } from './menue/menue';
import { Content } from './content/content';
import { Users } from './users/users';
import { WorkDays } from './work-days/work-days';
import { Holidays } from './holidays/holidays';
import { SharedModule } from '../shared/shared-module';


@NgModule({
  declarations: [
    Menue,
    Content,
    Users,
    WorkDays,
    Holidays,
  ],
  imports: [
    CommonModule,
    LayoutDashbordRoutingModule,
    SharedModule
  ]
})
export class LayoutDashbordModule { }
