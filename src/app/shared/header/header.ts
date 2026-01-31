import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  StatusMenue = signal(false);
  OnToggelMenue(){
    this.StatusMenue.update(value => !value);
  }
}
