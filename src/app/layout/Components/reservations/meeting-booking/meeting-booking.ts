
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

  private dateSub: any;

  ngOnInit(): void {
    if (this.initialData) {
      this.bookingService.bookingForm().patchValue(this.initialData);
      if (this.initialData.startTime) {
        this.selectedTime.set(this.initialData.startTime);
      }
    }
    this.watchDateChange();
  }

  ngOnDestroy(): void {
    if (this.dateSub) {
      this.dateSub.unsubscribe();
    }
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
    if (!slot.available) return;
    this.bookingService.getControl('startTime')?.patchValue(slot.startTime);
    this.selectedTime.set(slot.startTime);
  }

  watchDateChange() {
    if (this.dateSub) this.dateSub.unsubscribe();
    
    this.dateSub = this.bookingService.getControl('date')?.valueChanges.subscribe((selectedDate: Date) => {
      if (!selectedDate) return;
      
      // Ensure we only trigger when the date string actually changes
      const finalDate = new Date(selectedDate).toLocaleDateString('en-CA');
      
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
