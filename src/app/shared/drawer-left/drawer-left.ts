import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-drawer-left',
  standalone: false,
  templateUrl: './drawer-left.html',
  styleUrl: './drawer-left.scss',
})
export class DrawerLeft {
    visible: boolean = false;
 @Output()EventRoute=new EventEmitter<string>();

  onClickListActive(route:string){
    this.EventRoute.emit(route)
    this.visible=false;
  }
}
