import { Component, EventEmitter, inject, OnInit, Output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PwaInstallService } from '../pwa-install/pwa-install.service';

@Component({
  selector: 'app-drawer-left',
  standalone: false,
  templateUrl: './drawer-left.html',
  styleUrl: './drawer-left.scss',
})
export class DrawerLeft implements OnInit {
  /** Backs the "install app" entry in the mobile drawer. */
  readonly pwa = inject(PwaInstallService);

  constructor(private router: Router) {}

  /** Trigger install from the drawer, then close it. On iOS this reveals the
   *  add-to-home-screen banner, so the drawer must get out of the way. */
  onInstall() {
    this.visible = false;
    this.pwa.install();
  }
  ngOnInit(): void {
this.getTokenInsession()
  }
  visible: boolean = false;
  isOpen = signal<boolean>(true);
  @Output() EventRoute = new EventEmitter<string>();
  @Output() toggelMenue = new EventEmitter<boolean>();

  //***************Main Page**********************/
  onClickListActive(route: string) {
    this.EventRoute.emit(route);
    this.visible = false;
    if (this.router.url === '/' || this.router.url.startsWith('/?')) {
      const el = document.getElementById(route);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      this.router.navigate(['/'], { fragment: route });
    }
  }

  //***************Panel Page**********************/
  onToggelMenue() {
    if (this.isOpen()) {
      this.toggelMenue.emit(true);
    } else {
      this.toggelMenue.emit(false);
    }
  }

  getTokenInsession(){
  return sessionStorage.getItem('token');
}
}
