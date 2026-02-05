import { Component, EventEmitter, Output, signal } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  @Output()EventRoute=new EventEmitter<string>();

  onClickListActive(route:string){
    this.EventRoute.emit(route)
  }

}
