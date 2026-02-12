import { Component, EventEmitter, OnInit, Output, signal } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {
  @Output()EventRoute=new EventEmitter<string>();

  ngOnInit(): void {
    this.getTokenInsession()
  }

  onClickListActive(route:string){
    this.EventRoute.emit(route)
  }

getTokenInsession(){
  return sessionStorage.getItem('token');
}

}
