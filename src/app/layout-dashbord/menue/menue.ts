import {
  Component,
  EventEmitter,
  HostListener,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { PwaInstallService } from '../../shared/pwa-install/pwa-install.service';
import { TaskCount } from '../../core/Servies/task-count';

@Component({
  selector: 'app-menue',
  standalone: false,
  templateUrl: './menue.html',
  styleUrl: './menue.scss',
})
export class Menue implements OnInit, OnDestroy {
  ngOnInit(): void {
    // Seed the mobile flag from the current viewport. Without this it stays
    // `false` until a resize event fires, so a fresh mobile load renders the
    // open drawer as a squeezed icon-only rail with no labels.
    this.widthScreen.set(window.innerWidth < 768);
    this.GetDataMenue();
    this.taskCount.startPolling();
  }

  ngOnDestroy(): void {
    this.taskCount.stopPolling();
  }

  constructor(private router: Router) { }

  /** Backs the "install app" button in the sidebar footer. */
  readonly pwa = inject(PwaInstallService);

  /** Unfinished-task count shown as a badge next to the Tasks entry. */
  readonly taskCount = inject(TaskCount);

  openWorkDay() {
    this.visibelform.set(true);
  }

  /** Install from the sidebar; collapses the menu on mobile so any iOS
   *  instruction banner isn't hidden behind the drawer. */
  onInstall() {
    this.onCloselMenue();
    this.pwa.install();
  }

  @Output() toggelMenue = new EventEmitter<boolean>();
  isOpen = signal<boolean>(true);
  statusMenue = signal<boolean>(true);
  widthScreen = signal<boolean>(false);
  ListMenue = signal<
    {
      name: string;
      icon: string;
      route: string;
      /** Show the open-task badge on this entry. */
      badge?: boolean;
    }[]
  >([]);
  visibelform = signal<boolean>(false);
  canManageWorkDay = signal<boolean>(false);

  @Input()
  set toggel(event: boolean) {
    this.statusMenue.set(event);
  }

  onToggelMenue() {
    this.isOpen.set(!this.isOpen());
    this.toggelMenue.emit(!this.isOpen());
  }

  onCloselMenue() {
    this.toggelMenue.emit(false);
    this.isOpen.set(!this.isOpen());
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    const isMobile = window.innerWidth < 768;
    this.widthScreen.set(isMobile);
  }

  GetDataMenue() {
    const raw = sessionStorage.getItem('user');
    if (!raw) return;
    const user = JSON.parse(raw);
    const role: string = user.role;

    const isAdmin = role === 'ADMIN';
    const isModerator = role === 'MODERATOR';
    const isReceptionist = role === 'RECEPTIONIST';
    const isLawyer = role === 'LAWYER' || role === 'CONSULTANT';

    this.canManageWorkDay.set(isAdmin || isModerator);

    // Order below is the agreed sidebar order — day-to-day case work first,
    // configuration and administration last. Keep it when adding entries.
    this.ListMenue.set([

      // ── Admin-only: activity logs & insights ─────────────────
      ...(isAdmin ? [{
        name: 'activity_logs',
        icon: 'fa-solid fa-timeline',
        route: '/dashboard/content/activity-logs',
      }] : []),

      // ── Customers (not for lawyers) ─────────────────────────
      ...(isAdmin || isModerator || isReceptionist ? [{
        name: 'customers',
        icon: 'fa-solid fa-users',
        route: '/dashboard/content/customers',
      }] : []),

      // ── Prospective clients — cases not flagged as real customers ─
      {
        name: 'customer_meetings',
        icon: 'fa-solid fa-handshake',
        route: '/dashboard/content/customer-meetings',
      },

      // ── Tasks — every role, no gating: the list is already narrowed to
      //    tasks the user created or was assigned to. ─────────────
      {
        name: 'tasks',
        icon: 'fa-solid fa-list-check',
        route: '/dashboard/content/tasks',
        badge: true,
      },

      // ── Cases — all roles ────────────────────────────────────
      {
        name: 'client_cases',
        icon: 'fa-solid fa-folder-open',
        route: '/dashboard/content/client-cases',
      },

      // ── Reports — admin, moderator, lawyer (not receptionist) ─
      ...(isAdmin || isModerator ? [{
        name: 'lawyer_fees_contracts',
        icon: 'fa-solid fa-file-signature',
        route: '/dashboard/content/lawyer-fees-contracts',
      }] : []),

      // ── Financials — all contracts for admin/moderator; a lawyer or
      //    consultant gets the same entry narrowed to their own clients ─
      ...(isAdmin || isModerator || isLawyer ? [{
        name: isLawyer ? 'my_financials' : 'financials',
        icon: 'fa-solid fa-sack-dollar',
        route: '/dashboard/content/financials',
      }] : []),

      // ── Cases calendar — admin, moderator, lawyer/consultant ─
      ...(isAdmin || isModerator || isLawyer ? [{
        name: 'cases_calendar',
        icon: 'fa-solid fa-calendar-days',
        route: '/dashboard/content/cases-calendar',
      }] : []),

      // ── Consultant reminders — admin, moderator, consultant ─
      ...(isAdmin || isModerator || role === 'CONSULTANT' ? [{
        name: 'consultant_reminders',
        icon: 'fa-solid fa-file-pen',
        route: '/dashboard/content/consultant-reminders',
      }] : []),

      // ── Unscheduled cases (no session date) — admin, moderator, lawyer, consultant ─
      ...(isAdmin || isModerator || isLawyer ? [{
        name: 'unscheduled_cases',
        icon: 'fa-solid fa-calendar-xmark',
        route: '/dashboard/content/unscheduled-cases',
      }] : []),

      // ── Admin + Moderator: client-side document signer ───────
      ...(isAdmin || isModerator ? [{
        name: 'document_signer',
        icon: 'fa-solid fa-file-signature',
        route: '/dashboard/content/document-signer',
      }] : []),

      // ── Admin + Moderator: services management ───────────────
      ...(isAdmin || isModerator ? [{
        name: 'services',
        icon: 'fa-solid fa-gear',
        route: '/dashboard/content/addservies',
      }] : []),

      // ── Admin + Moderator: holidays ──────────────────────────
      ...(isAdmin || isModerator ? [{
        name: 'holidays_Day',
        icon: 'fa-solid fa-holly-berry',
        route: '/dashboard/content/Holidays',
      }] : []),

      // ── Bookings dashboard (not for lawyers) ────────────────
      ...(isAdmin || isModerator || isReceptionist ? [{
        name: 'Reservations',
        icon: 'fa-solid fa-business-time',
        route: '/dashboard/content',
      }] : []),

      // ── Admin-only: user management ─────────────────────────
      ...(isAdmin ? [{
        name: 'users',
        icon: 'fa-solid fa-users-gear',
        route: '/dashboard/content/users',
      }] : []),

    ]);
  }

  onLogout() {
    sessionStorage.removeItem('token');
    this.router.navigate(['/']);
  }
}
