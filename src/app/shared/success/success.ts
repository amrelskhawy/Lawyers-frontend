import { Component } from '@angular/core';
import { Core } from '../../core/Servies/core';

@Component({
  selector: 'app-success',
  standalone: false,
  templateUrl: './success.html',
  styleUrl: './success.scss',
})
export class Success {
constructor(private core:Core){}
get ResultSuccess(){
  return this.core._Sussess.asObservable()
}
}
