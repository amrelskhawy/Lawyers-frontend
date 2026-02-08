import { Component, EventEmitter, Output, signal } from '@angular/core';

@Component({
  selector: 'app-menue',
  standalone: false,
  templateUrl: './menue.html',
  styleUrl: './menue.scss',
})
export class Menue {
  @Output() toggelMenue = new EventEmitter<boolean>();
  isOpen = signal<boolean>(true);

  onToggelMenue() {
    this.isOpen.set(!this.isOpen());
    this.toggelMenue.emit(!this.isOpen());
  }

  onCloselMenue(){
    this.toggelMenue.emit(false);
    this.isOpen.set(!this.isOpen());
  }
}
