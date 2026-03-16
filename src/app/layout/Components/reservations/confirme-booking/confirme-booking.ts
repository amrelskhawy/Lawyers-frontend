import { Component, Input, signal } from '@angular/core';
import { Data } from '../../../../core/Servies/data';
import { Router } from '@angular/router';
import { BookingService } from '../booking.service';

@Component({
  selector: 'app-confirme-booking',
  standalone: false,
  templateUrl: './confirme-booking.html',
  styleUrl: './confirme-booking.scss',
})
export class ConfirmeBooking {
  constructor(
    private dataService: Data,
    private router: Router,
    public bookingService: BookingService,
  ) {}

  name = signal<any>({});
  @Input()
  set nameServies(name: any) {
    this.name.set(name);
  }

  getCurrentLanguage() {
    return this.bookingService.getCurrentLanguage();
  }

  onSubmit() {
    const formValue = this.bookingService.bookingForm().value;
    const date = new Date(formValue.date);
    const formattedDate = date.toLocaleDateString('en-CA');

    const payload = {
      ...formValue,
      date: formattedDate,
    };

    this.dataService.post('bookings', payload).subscribe((res: any) => {
      this.bookingService.resetBooking();
      const paymentUrl = res.data.payment_link;
        window.open(paymentUrl, '_self');
    });
  }
}
