import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutDashbordRoutingModule } from './layout-dashbord-routing-module';
import { Menue } from './menue/menue';
import { Content } from './content/content';
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
import { Reservations } from './reservations/reservations';
import { Moderators } from './moderators/moderators';
import { Form } from './moderators/form/form';
import { Admins } from './admins/admins';
import { DashboardCrudPage } from './dashboard-crud-page/dashboard-crud-page';
import { DilogBooking } from './reservations/dilog-booking/dilog-booking';
import { ManualBookingForm } from './reservations/manual-booking-form/manual-booking-form';
import { Customers } from './customers/customers';
import { FormCustomer } from './customers/form-customer/form-customer';
import { ShowCustomerData } from './customers/show-customer-data/show-customer-data';
import { Organizers } from './organizers/organizers';
import { OrganizerForm } from './organizers/form/form';
import { SelectModule } from 'primeng/select';
import { ClientCases } from './client-cases/client-cases';
import { FormCreateCase } from './client-cases/form-create-case/form-create-case';
import { EditCase } from './client-cases/edit-case/edit-case';
import { CaseReportTemplate } from './client-cases/case-report-template/case-report-template';
import { SessionReport } from './session-report/session-report';
import { SessionReportTemplate } from './session-report/session-report-template/session-report-template';
import { SessionReportsList } from './session-reports-list/session-reports-list';
@NgModule({
  declarations: [
    Menue,
    Content,
    Holidays,
    AddServies,
    Formservies,
    FormHoldays,
    TopGrid,
    FormWorkDays,
    ShowDataInDilog,
    Reservations,
    Moderators,
    Form,
    Admins,
    DashboardCrudPage,
    DilogBooking,
    ManualBookingForm,
    Customers,
    FormCustomer,
    ShowCustomerData,
    Organizers,
    OrganizerForm,
    ClientCases,
    FormCreateCase,
    EditCase,
    CaseReportTemplate,
    SessionReport,
    SessionReportTemplate,
    SessionReportsList,
  ],
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
    FormsModule,
    SelectModule
  ],
})
export class LayoutDashbordModule {}
