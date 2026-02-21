import { Component, EventEmitter, Input, Output, signal } from '@angular/core';

@Component({
  selector: 'app-servies-booking',
  standalone: false,
  templateUrl: './servies-booking.html',
  styleUrl: './servies-booking.scss',
})
export class ServiesBooking {
  servise = signal<any[]>([]);
  selectServies = signal<any>({});
  @Output() serviesid = new EventEmitter<boolean>();

  @Input()
  set dataservies(value: any) {
    this.servise.set(value);
  }

  getcuurentLangauage() {
    let lang = localStorage.getItem('Language');
    return lang;
  }
  onSelctServies(item: any) {
    this.selectServies.set(item);
  }

  onNextSteap() {
    this.serviesid.emit(this.selectServies());
  }
}
