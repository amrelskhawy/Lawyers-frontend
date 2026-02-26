
import { Component, OnInit } from '@angular/core';
import { Data } from '../../../core/Servies/data';
import { BookingService } from './booking.service';

@Component({
  selector: 'app-reservations',
  standalone: false,
  templateUrl: './reservations.html',
  styleUrl: './reservations.scss',
})
export class Reservations implements OnInit {
  constructor(
    private data: Data,
    public bookingService: BookingService
  ) { }

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.data.getPublicData().subscribe((res: any) => {
      this.bookingService.dataservies.set(res.data.services);
      this.bookingService.workdays.set(res.data.workingDays);
      const holidaysApi = res.data.holidays;
      const formattedDates = holidaysApi.map((item: any) => new Date(item.date));
      this.bookingService.disabledDates.set(formattedDates);
    });
  }

  onselectServies(event: any) {
    if (!event || !event.id) return;
    this.bookingService.detailsservies.set(event);
    this.bookingService.getControl('serviceId')?.patchValue(event.id);
    this.bookingService.currentStep.set(2);
  }

  EventDataClient(event: any) {
    this.bookingService.currentStep.set(3);
    this.bookingService.getControl('phone_number')?.patchValue(event.phone_number);
    this.bookingService.getControl('name')?.patchValue(event.name);
    this.bookingService.getControl('clientEmail')?.patchValue(event.clientEmail);
  }

  EventDateClient(event: any) {
    this.bookingService.currentStep.set(4);
    this.bookingService.getControl('date')?.patchValue(event.date);
    this.bookingService.getControl('startTime')?.patchValue(event.startTime);
  }
}
