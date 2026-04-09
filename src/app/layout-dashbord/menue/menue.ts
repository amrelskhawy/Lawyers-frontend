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

  constructor(private router: Router) {}

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
    let get_usre = sessionStorage.getItem('user');
    let parseUser: any = null;

    if (get_usre) {
      parseUser = JSON.parse(get_usre);
    }

    if (parseUser) {
      this.ListMenue.set([
        {
          name: 'Reservations',
          icon: 'fa-solid fa-business-time',
          route: '/dashboard/content',
        },
        ...(parseUser.role === 'ADMIN'
          ? [
              {
                name: 'Admins',
                icon: 'fa-solid fa-user',
                route: '/dashboard/content/admin',
              },
              {
                name: 'Moderators',
                icon: 'fa-solid fa-user-tie',
                route: '/dashboard/content/Moderators',
              },
            ]
          : []),
        {
          name: 'services',
          icon: 'fa-solid fa-gear',
          route: '/dashboard/content/addservies',
        },
        {
          name: 'customers',
          icon: 'fa-solid fa-users',
          route: '/dashboard/content/customers',
        },
        {
          name: 'holidays_Day',
          icon: 'fa-solid fa-holly-berry',
          route: '/dashboard/content/Holidays',
        },
      ]);
    }
  }

  onLogout() {
    sessionStorage.removeItem('token');
    this.router.navigate(['/']);
  }
}
