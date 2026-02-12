import { Component, EventEmitter, OnInit, Output, signal } from '@angular/core';

@Component({
  selector: 'app-drawer-left',
  standalone: false,
  templateUrl: './drawer-left.html',
  styleUrl: './drawer-left.scss',
})
export class DrawerLeft implements OnInit {
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
