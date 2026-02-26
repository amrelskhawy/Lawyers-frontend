import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { BookingService } from '../booking.service';

@Component({
  selector: 'app-servies-booking',
  standalone: false,
  templateUrl: './servies-booking.html',
  styleUrl: './servies-booking.scss',
})
export class ServiesBooking {
  constructor(private bookingService: BookingService) { }
  servise = signal<any[]>([]);
  selectServies = signal<any>({});
  @Input()
  set dataservies(value: any) {
    this.servise.set(value);
  }

  @Input()
  set selectedService(value: any) {
    if (value) {
      this.selectServies.set(value);
    }
  }

  @Output() serviesid = new EventEmitter<any>();

  getCurrentLanguage() {
    return this.bookingService.getCurrentLanguage();
  }
  onSelctServies(item: any) {
    this.selectServies.set(item);
  }

  onNextStep() {
    if (!this.selectServies().id) {
      this.bookingService.getControl('serviceId')?.markAsTouched();
      return;
    }
    this.serviesid.emit(this.selectServies());
  }
}
