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
import { RemindersDialog } from './client-cases/reminders-dialog/reminders-dialog';
import { RejectAssignmentDialog } from './client-cases/reject-assignment-dialog/reject-assignment-dialog';
import { EditCase } from './client-cases/edit-case/edit-case';
import { CaseReportTemplate } from './client-cases/case-report-template/case-report-template';
import { SessionReport } from './session-report/session-report';
import { SessionReportTemplate } from './session-report/session-report-template/session-report-template';
import { SessionReportsList } from './session-reports-list/session-reports-list';
import { FieldVisitReport } from './field-visit-report/field-visit-report';
import { FieldVisitReportTemplate } from './field-visit-report/field-visit-report-template/field-visit-report-template';
import { LawyerFeesContractsList } from './lawyer-fees-contracts-list/lawyer-fees-contracts-list';
import { LawyerFeesContract } from './lawyer-fees-contract/lawyer-fees-contract';
import { LawyerFeesContractPreviewModule } from '../shared/lawyer-fees-contract-preview/lawyer-fees-contract-preview-module';
import { EditorModule } from 'primeng/editor';
import { ActivityLogs } from './activity-logs/activity-logs';
import { Users } from './users/users';
import { FormUser } from './users/form-user/form-user';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { CasesCalendar } from './cases-calendar/cases-calendar';
import { ConsultantReminders } from './consultant-reminders/consultant-reminders';
import { UnscheduledCases } from './unscheduled-cases/unscheduled-cases';
import { DocumentSigner } from './document-signer/document-signer';
import { Financials } from './financials/financials';
import { ContractPaymentsDialog } from './contract-payments-dialog/contract-payments-dialog';
import { ConsultingList } from './financials/consulting-list/consulting-list';
import { FormConsulting } from './financials/consulting-list/form-consulting/form-consulting';

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
    RemindersDialog,
    RejectAssignmentDialog,
    EditCase,
    CaseReportTemplate,
    SessionReport,
    SessionReportTemplate,
    SessionReportsList,
    FieldVisitReport,
    FieldVisitReportTemplate,
    LawyerFeesContractsList,
    LawyerFeesContract,
    ActivityLogs,
    Users,
    FormUser,
    CasesCalendar,
    ConsultantReminders,
    UnscheduledCases,
    DocumentSigner,
    Financials,
    ContractPaymentsDialog,
    ConsultingList,
    FormConsulting,
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
    SelectModule,
    PasswordModule,
    InputTextModule,
    LawyerFeesContractPreviewModule,
    EditorModule,
    PaginatorModule,
  ],
})
export class LayoutDashbordModule { }
