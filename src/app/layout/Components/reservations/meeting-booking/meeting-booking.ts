
import { Component, EventEmitter, OnInit, Output, signal, Input } from '@angular/core';
import { Data } from '../../../../core/Servies/data';
import { BookingService } from '../booking.service';

@Component({
  selector: 'app-meeting-booking',
  standalone: false,
  templateUrl: './meeting-booking.html',
  styleUrl: './meeting-booking.scss',
})
export class MeetingBooking implements OnInit {
  constructor(
    private dataService: Data,
    public bookingService: BookingService
  ) { }

  ngOnInit(): void {
    if (this.initialData) {
      this.bookingService.bookingForm().patchValue(this.initialData);
      if (this.initialData.startTime) {
        this.selectedTime.set(this.initialData.startTime);
      }
    }
    this.watchDateChange();
  }

  timeSlots = signal<any[]>([]);
  selectedTime = signal<string | null>(null);
  disibledDays = signal<any | null>(null);
  minDate = new Date();
  @Output() DateClient = new EventEmitter<any>();

  @Input()
  set disabledDates(value: any) {
    this.disibledDays.set(value);
  }
  @Input() initialData: any;

  PathTime(slot: any) {
    this.bookingService.getControl('startTime')?.patchValue(slot);
    this.selectedTime.set(slot);
  }

  watchDateChange() {
    this.bookingService.getControl('date')?.valueChanges.subscribe((selectedDate: Date) => {
      if (!selectedDate) return;
      const finalDate = selectedDate.toLocaleDateString('en-CA');
      this.dataService.get(`bookings/availability`, { date: finalDate })
        .subscribe((res: any) => {
          if (res.data) {
            this.timeSlots.set(res.data);
          }
        });
    });
  }

  onNextStep() {
    if (this.bookingService.bookingForm().get('date')?.invalid || this.bookingService.bookingForm().get('startTime')?.invalid) {
      this.bookingService.getControl('date')?.markAsTouched();
      this.bookingService.getControl('startTime')?.markAsTouched();
      return;
    }
    this.DateClient.emit(this.bookingService.bookingForm().value);
  }

  getControlName(controlName: string) {
    return this.bookingService.getControl(controlName);
  }
}
