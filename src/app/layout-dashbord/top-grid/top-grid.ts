import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-top-grid',
  standalone: false,
  templateUrl: './top-grid.html',
  styleUrl: './top-grid.scss',
})
export class TopGrid {
    @Output() visibelformadd = new EventEmitter<boolean>();

visibelform(){
this.visibelformadd.emit(true)
}
}
