import { securityAuthGuard, roleGuard, passcodeGuard } from './../core/guards/auth-guard';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Content } from './content/content';
import { Holidays } from './holidays/holidays';
import { AddServies } from './add-servies/add-servies';
import { Reservations } from './reservations/reservations';
import { Users } from './users/users';
import { Customers } from './customers/customers';
import { ClientCases } from './client-cases/client-cases';
import { EditCase } from './client-cases/edit-case/edit-case';
import { SessionReport } from './session-report/session-report';
import { SessionReportsList } from './session-reports-list/session-reports-list';
import { FieldVisitReport } from './field-visit-report/field-visit-report';
import { LawyerFeesContractsList } from './lawyer-fees-contracts-list/lawyer-fees-contracts-list';
import { LawyerFeesContract } from './lawyer-fees-contract/lawyer-fees-contract';
import { ActivityLogs } from './activity-logs/activity-logs';
import { CasesCalendar } from './cases-calendar/cases-calendar';
import { ConsultantReminders } from './consultant-reminders/consultant-reminders';
import { UnscheduledCases } from './unscheduled-cases/unscheduled-cases';
import { Financials } from './financials/financials';
import { DocumentSigner } from './document-signer/document-signer';
import { Tasks } from './tasks/tasks';
import { Articles } from './articles/articles';

const routes: Routes = [
  {
    path: 'content',
    component: Content,
    canActivate: [securityAuthGuard],
    children: [
      // ── Home / Reservations ──────────────────────────────────────────────
      // LAWYER is redirected to client-cases in content.ts (ngOnInit redirect)
      {
        path: '',
        component: Reservations,
        canActivate: [roleGuard('ADMIN', 'MODERATOR', 'RECEPTIONIST')],
      },

      // ── Admin-only: user management ──────────────────────────────────────
      {
        path: 'users',
        component: Users,
        canActivate: [roleGuard('ADMIN')],
      },

      // ── Admin-only: activity logs & insights ─────────────────────────────
      {
        path: 'activity-logs',
        component: ActivityLogs,
        canActivate: [roleGuard('ADMIN')],
      },

      // ── Admin + Moderator: services, holidays ────────────────────────────
      {
        path: 'addservies',
        component: AddServies,
        canActivate: [roleGuard('ADMIN', 'MODERATOR')],
      },
      {
        path: 'Holidays',
        component: Holidays,
        canActivate: [roleGuard('ADMIN', 'MODERATOR')],
      },

      // ── Admin + Moderator: client-side document signer ───────────────────
      {
        path: 'document-signer',
        component: DocumentSigner,
        canActivate: [roleGuard('ADMIN', 'MODERATOR')],
      },

      // ── Admin + Moderator + Receptionist: customers ──────────────────────
      {
        path: 'customers',
        component: Customers,
        canActivate: [roleGuard('ADMIN', 'MODERATOR', 'RECEPTIONIST')],
      },

      // ── All roles: cases ─────────────────────────────────────────────────
      // (Lawyers see only assigned cases — enforced server-side)
      {
        path: 'client-cases',
        component: ClientCases,
        data: { fixedFilter: { isRealCustomer: 'true' } },
        canActivate: [roleGuard('ADMIN', 'MODERATOR', 'RECEPTIONIST', 'LAWYER', 'CONSULTANT')],
      },
      // ── Customer Meetings: cases not (yet) flagged as real customers ──────
      // Same Client-Cases table/component, filtered to isRealCustomer = false.
      {
        path: 'customer-meetings',
        component: ClientCases,
        data: { fixedFilter: { isRealCustomer: 'false' } },
        canActivate: [roleGuard('ADMIN', 'MODERATOR', 'RECEPTIONIST', 'LAWYER', 'CONSULTANT')],
      },
      {
        path: 'client-cases/:id/edit',
        component: EditCase,
        canActivate: [roleGuard('ADMIN', 'MODERATOR', 'RECEPTIONIST', 'LAWYER', 'CONSULTANT')],
      },

      // ── Unscheduled cases (no session date set) — admin, moderator, lawyer, consultant ──
      // Receptionist excluded. Lawyers/consultants see only their own (server-side).
      {
        path: 'unscheduled-cases',
        component: UnscheduledCases,
        canActivate: [roleGuard('ADMIN', 'MODERATOR', 'LAWYER', 'CONSULTANT')],
      },

      // ── Cases calendar (Hijri) — admin, moderator, lawyer, consultant ────
      // Receptionist excluded. Lawyers/consultants see only their own (server-side).
      {
        path: 'cases-calendar',
        component: CasesCalendar,
        canActivate: [roleGuard('ADMIN', 'MODERATOR', 'LAWYER', 'CONSULTANT')],
      },

      // ── Consultant reminders — memo requests sent to consultants ─────────
      {
        path: 'consultant-reminders',
        component: ConsultantReminders,
        canActivate: [roleGuard('ADMIN', 'MODERATOR', 'CONSULTANT')],
      },

      // ── Admin + Moderator + Lawyer: reports ──────────────────────────────
      // Receptionist excluded — they only see the first page of the case
      {
        path: 'session-reports/:caseId',
        component: SessionReportsList,
        canActivate: [roleGuard('ADMIN', 'MODERATOR', 'LAWYER', 'CONSULTANT')],
      },
      {
        path: 'session-report/:caseId',
        component: SessionReport,
        canActivate: [roleGuard('ADMIN', 'MODERATOR', 'LAWYER', 'CONSULTANT')],
      },
      {
        path: 'session-report/:caseId/:reportId',
        component: SessionReport,
        canActivate: [roleGuard('ADMIN', 'MODERATOR', 'LAWYER', 'CONSULTANT')],
      },
      {
        path: 'field-visit-report/:caseId',
        component: FieldVisitReport,
        canActivate: [roleGuard('ADMIN', 'MODERATOR', 'LAWYER', 'CONSULTANT')],
      },
      {
        path: 'field-visit-report/:caseId/:reportId',
        component: FieldVisitReport,
        canActivate: [roleGuard('ADMIN', 'MODERATOR', 'LAWYER', 'CONSULTANT')],
      },
      {
        path: 'lawyer-fees-contracts',
        component: LawyerFeesContractsList,
        canActivate: [roleGuard('ADMIN', 'MODERATOR', 'LAWYER', 'CONSULTANT')],
      },
      {
        path: 'lawyer-fees-contract/case/:caseId',
        component: LawyerFeesContract,
        canActivate: [roleGuard('ADMIN', 'MODERATOR', 'LAWYER', 'CONSULTANT')],
      },
      {
        path: 'lawyer-fees-contract/case/:caseId/:id',
        component: LawyerFeesContract,
        canActivate: [roleGuard('ADMIN', 'MODERATOR', 'LAWYER', 'CONSULTANT')],
      },
      {
        path: 'lawyer-fees-contract/:id',
        component: LawyerFeesContract,
        canActivate: [roleGuard('ADMIN', 'MODERATOR', 'LAWYER', 'CONSULTANT')],
      },

      {
        path: 'financials',
        component: Financials,
        // Any staff role reaches the same page, but the backend narrows non
        // ADMIN/MODERATOR viewers to the clients they sourced — they never see
        // company or peer money. Temporary shared passcode on top of the role check.
        canActivate: [
          roleGuard('ADMIN', 'MODERATOR', 'RECEPTIONIST', 'LAWYER', 'CONSULTANT'),
          passcodeGuard,
        ],
      },

      // ── Tasks — every role. Deliberately no roleGuard: a task is visible
      // only to its creator and assignees, so there is no role to gate on.
      {
        path: 'tasks',
        component: Tasks,
      },

      // ── Admin + Moderator: blog articles ─────────────────────────────────
      {
        path: 'articles',
        component: Articles,
        canActivate: [roleGuard('ADMIN', 'MODERATOR')],
      },

      { path: '**', redirectTo: '', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LayoutDashbordRoutingModule { }
