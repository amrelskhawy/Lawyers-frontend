import { Component, EventEmitter, OnInit, Output, signal } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-drawer-left',
  standalone: false,
  templateUrl: './drawer-left.html',
  styleUrl: './drawer-left.scss',
})
export class DrawerLeft implements OnInit {
  constructor(private router: Router) {}
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
