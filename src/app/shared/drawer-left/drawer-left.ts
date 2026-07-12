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
  /** Give up waiting for the drawer mask to clear and navigate anyway after this
   *  many poll attempts (~30ms each), removing any orphan as a safety net. */
  private static readonly MASK_WAIT_MAX_ATTEMPTS = 25;

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

  /** Navigate to a route in a *different* lazy module (e.g. /auth/login).
   *  Those routes destroy the layout module that hosts this drawer. The drawer's
   *  overlay mask is appended to <body> and only removed once its close animation
   *  ends; navigating while it is still there tears down this component mid-close
   *  and orphans the mask over the whole page (blocking taps, most visibly on
   *  mobile). So close the drawer, wait until its mask has actually cleared, then
   *  navigate — falling back to a hard removal if the animation is interrupted. */
  closeThenNavigate(route: string) {
    this.visible = false;
    this.navigateWhenMaskCleared(route, 0);
  }

  private navigateWhenMaskCleared(route: string, attempt: number) {
    const maskPresent = !!document.querySelector('.p-drawer-mask');
    if (!maskPresent) {
      this.router.navigateByUrl(route);
      return;
    }
    if (attempt >= DrawerLeft.MASK_WAIT_MAX_ATTEMPTS) {
      // Animation was interrupted (e.g. tapped mid-open); remove the orphan
      // ourselves and restore scrolling before leaving.
      document.querySelectorAll('.p-drawer-mask').forEach((m) => m.remove());
      document.body.classList.remove('p-overflow-hidden');
      this.router.navigateByUrl(route);
      return;
    }
    setTimeout(() => this.navigateWhenMaskCleared(route, attempt + 1), 30);
  }
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
