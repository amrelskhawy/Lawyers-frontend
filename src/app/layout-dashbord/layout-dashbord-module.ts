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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { TopGrid } from './top-grid/top-grid';
import { FormWorkDays } from './form-work-days/form-work-days';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ShowDataInDilog } from './add-servies/show-data-in-dilog/show-data-in-dilog';

@NgModule({
  declarations: [Menue, Content, Users, WorkDays, Holidays, AddServies, Formservies, FormHoldays, TopGrid, FormWorkDays, ShowDataInDilog],
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
    TooltipModule,
    ToggleSwitchModule,
    FormsModule

  ],
})
export class LayoutDashbordModule {}
