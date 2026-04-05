import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
    public bookingService: BookingService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.data.getPublicData().subscribe((res: any) => {
      this.bookingService.dataservies.set(res.data.services);
      this.bookingService.workdays.set(res.data.workingDays);

      const holidayDates = res.data.holidays.map((item: any) => new Date(item.date));
      const closedDayDates = this.getClosedDayDates(res.data.workingDays);

      this.bookingService.disabledDates.set([...holidayDates, ...closedDayDates]);

      // Auto-select service if serviceId is passed via query param
      this.route.queryParams.subscribe(params => {
        const serviceId = params['serviceId'];
        if (serviceId) {
          const service = res.data.services.find((s: any) => s.id === serviceId);
          if (service) {
            this.onselectServies(service);
          }
        }
      });
    });
  }

  private getClosedDayDates(workingDays: any[]): Date[] {
    const dayNameToIndex: { [key: string]: number } = {
      'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
      'Thursday': 4, 'Friday': 5, 'Saturday': 6,
    };

    const closedDayIndices = workingDays
      .filter((d: any) => !d.isOpen)
      .map((d: any) => dayNameToIndex[d.day])
      .filter((i: number) => i !== undefined);

    if (closedDayIndices.length === 0) return [];

    const dates: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Generate closed dates for the next 6 months
    const end = new Date(today);
    end.setMonth(end.getMonth() + 6);

    const current = new Date(today);
    while (current <= end) {
      if (closedDayIndices.includes(current.getDay())) {
        dates.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }

  onselectServies(event: any) {
    if (!event || !event.id) return;
    this.bookingService.detailsservies.set(event);
    this.bookingService.getControl('serviceId')?.patchValue(event.id);
    this.bookingService.currentStep.set(2);
    setTimeout(() => this.scrollToSection(), 0);
  }

  onPayment(valuepayment: string) {
    this.bookingService.getControl('provider')?.patchValue(valuepayment);
    this.bookingService.currentStep.set(5);
    setTimeout(() => this.scrollToSection(), 0);
  }

  EventDataClient(event: any) {
    this.bookingService.currentStep.set(3);
    setTimeout(() => this.scrollToSection(), 0);
    this.bookingService.getControl('phone_number')?.patchValue(event.phone_number);
    this.bookingService.getControl('name')?.patchValue(event.name);
    this.bookingService.getControl('clientEmail')?.patchValue(event.clientEmail);
  }

  EventDateClient(event: any) {
    this.bookingService.currentStep.set(4);
    setTimeout(() => this.scrollToSection(), 0);
    this.bookingService.getControl('date')?.patchValue(event.date);
    this.bookingService.getControl('startTime')?.patchValue(event.startTime);
  }
  @ViewChild('bookingSection') bookingSection!: ElementRef;

  scrollToSection() {
    if (this.bookingSection) {
      this.bookingSection.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }
}
