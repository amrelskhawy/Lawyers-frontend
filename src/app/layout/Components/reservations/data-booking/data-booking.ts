
import { Component, EventEmitter, OnInit, Output, signal, Input } from '@angular/core';
import { BookingService } from '../booking.service';

@Component({
  selector: 'app-data-booking',
  standalone: false,
  templateUrl: './data-booking.html',
  styleUrl: './data-booking.scss',
})
export class DataBooking implements OnInit {
  constructor(public bookingService: BookingService) { }

  ngOnInit(): void {
    if (this.initialData) {
      this.bookingService.bookingForm().patchValue(this.initialData);
    }
  }

  @Output() dataClient = new EventEmitter<any>();
  @Input() initialData: any;

  onNextStep() {
    const controls = ['clientEmail', 'name', 'phone_number'];
    let isValid = true;

    controls.forEach(control => {
      const c = this.bookingService.getControl(control);
      if (c?.invalid) {
        c.markAsTouched();
        isValid = false;
      }
    });

    if (isValid) {
      this.dataClient.emit(this.bookingService.bookingForm().value);
    }
  }

  getControlName(controlName: string) {
    return this.bookingService.getControl(controlName);
  }
}
