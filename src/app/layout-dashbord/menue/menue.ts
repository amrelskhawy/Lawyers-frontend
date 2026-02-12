import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  signal,
} from '@angular/core';

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
    this.ListMenue.set([
      {
        name: 'users',
        icon: 'fa-solid fa-user',
        route: '/dashboard/content',
      },
      {
        name: 'services',
        icon: 'fa-solid fa-gear',
        route: '/dashboard/content/addservies',
      },
      {
        name: 'work_days',
        icon: 'fa-solid fa-calendar',
        route: '',
      },
      {
        name: 'holidays_Day',
        icon: 'fa-solid fa-holly-berry',
        route: '/dashboard/content/Holidays',
      },
    ]);
  }
}
