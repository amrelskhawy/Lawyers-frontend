import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menue',
  standalone: false,
  templateUrl: './menue.html',
  styleUrl: './menue.scss',
})
export class Menue implements OnInit {
  ngOnInit(): void {
    this.GetDataMenue();
  }

  constructor(private router: Router) { }

  openWorkDay() {
    this.visibelform.set(true);
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

    this.ListMenue.set([


      // ── Admin-only: activity logs & insights ─────────────────
      ...(isAdmin ? [{
        name: 'activity_logs',
        icon: 'fa-solid fa-timeline',
        route: '/dashboard/content/activity-logs',
      }] : []),

      // ── Bookings dashboard (not for lawyers) ────────────────
      ...(isAdmin || isModerator || isReceptionist ? [{
        name: 'Reservations',
        icon: 'fa-solid fa-business-time',
        route: '/dashboard/content',
      }] : []),

      // ── Customers (not for lawyers) ─────────────────────────
      ...(isAdmin || isModerator || isReceptionist ? [{
        name: 'customers',
        icon: 'fa-solid fa-users',
        route: '/dashboard/content/customers',
      }] : []),

      // ── Admin-only: user management ─────────────────────────
      ...(isAdmin ? [{
        name: 'users',
        icon: 'fa-solid fa-users-gear',
        route: '/dashboard/content/users',
      }] : []),

      // ── Admin + Moderator: services management ───────────────
      ...(isAdmin || isModerator ? [{
        name: 'services',
        icon: 'fa-solid fa-gear',
        route: '/dashboard/content/addservies',
      }] : []),

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

      // ── Admin + Moderator: holidays ──────────────────────────
      ...(isAdmin || isModerator ? [{
        name: 'holidays_Day',
        icon: 'fa-solid fa-holly-berry',
        route: '/dashboard/content/Holidays',
      }] : []),

    ]);
  }

  onLogout() {
    sessionStorage.removeItem('token');
    this.router.navigate(['/']);
  }
}
