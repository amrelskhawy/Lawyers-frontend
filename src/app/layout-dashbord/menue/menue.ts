import { Component, EventEmitter, HostListener, Input, Output, signal } from '@angular/core';

@Component({
  selector: 'app-menue',
  standalone: false,
  templateUrl: './menue.html',
  styleUrl: './menue.scss',
})
export class Menue {
  @Output() toggelMenue = new EventEmitter<boolean>();
  isOpen = signal<boolean>(true);
  statusMenue = signal<boolean>(true);
  widthScreen = signal<boolean>(false);


  @Input()
  set toggel(event: boolean) {
    this.statusMenue.set(event);
  }

  onToggelMenue() {
    this.isOpen.set(!this.isOpen());
    this.toggelMenue.emit(!this.isOpen());
  }

  onCloselMenue() {
    this.toggelMenue.emit(false);
    this.isOpen.set(!this.isOpen());
  }


   @HostListener('window:resize', ['$event'])
onResize(event: any) {
  // نعتبر الشاشة صغيرة (موبايل) فقط إذا كانت أقل من 768 بكسل
  const isMobile = window.innerWidth < 768;
  this.widthScreen.set(isMobile);
}
}
