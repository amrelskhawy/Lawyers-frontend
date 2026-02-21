import { Component, EventEmitter, OnInit, Output, signal, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Data } from '../../../../core/Servies/data';

@Component({
  selector: 'app-meeting-booking',
  standalone: false,
  templateUrl: './meeting-booking.html',
  styleUrl: './meeting-booking.scss',
})
export class MeetingBooking implements OnInit {
  constructor(
    private FB: FormBuilder,
    private Data:Data
  ) {}
    ngOnInit(): void {
    this.createForm();
    this.watchDateChange()
  }


  Form = signal<FormGroup>(new FormGroup({}));
   timeSlots = signal<any[]>([]);
    selectedTime = signal<string | null>(null);
    disibledDays = signal<any | null>(null);
  @Output() DateClient = new EventEmitter<any>();
@Input()
set disabledDates(value:any){
this.disibledDays.set(value)
}


  createForm() {
    this.Form.set(
      this.FB.group({
        date: ['', Validators.required],
        startTime: ['', Validators.required],
      }),
    );
  }

  PathTime(slot: any) {
    this.Form().get('startTime')?.patchValue(slot);
    this.selectedTime.set(slot);
  }

  watchDateChange() {
  this.Form().get('date')?.valueChanges.subscribe((selectedDate: Date) => {
    if (!selectedDate) return;
    const finalDate = selectedDate.toLocaleDateString('en-CA');
    this.Data.get(`bookings/availability`, { date: finalDate })
      .subscribe((res: any) => {
        if (res.data) {
          this.timeSlots.set(res.data);
        }
      });
  });
}

  onNextSteap() {
    if (this.Form().invalid) {
      this.Form().markAllAsTouched();
      return;
    }
    this.DateClient.emit(this.Form().value)
  }

  getControlName(controlName: string) {
    return this.Form().get(controlName);
  }
}
