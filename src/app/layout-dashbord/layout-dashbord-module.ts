import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutDashbordRoutingModule } from './layout-dashbord-routing-module';
import { Menue } from './menue/menue';
import { Content } from './content/content';
import { Users } from './users/users';
import { WorkDays } from './work-days/work-days';
import { Holidays } from './holidays/holidays';
import { SharedModule } from '../shared/shared-module';
import { TranslateModule } from '@ngx-translate/core';
import { AddServies } from './add-servies/add-servies';
import { Formservies } from './add-servies/formservies/formservies';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { FormHoldays } from './holidays/form-holdays/form-holdays';
import { DatePickerModule } from 'primeng/datepicker';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { TopGrid } from './top-grid/top-grid';

@NgModule({
  declarations: [Menue, Content, Users, WorkDays, Holidays, AddServies, Formservies, FormHoldays, TopGrid],
  imports: [
    CommonModule,
    LayoutDashbordRoutingModule,
    SharedModule,
    TranslateModule,
    DialogModule,
    ButtonModule,
    FloatLabelModule,
    DatePickerModule,
    ReactiveFormsModule,
    TooltipModule
  ],
})
export class LayoutDashbordModule {}
