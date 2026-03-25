import { Injectable, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  currentStep = signal<number>(1);
  dataservies = signal<any[]>([]);
  disabledDates = signal<any[]>([]);
  workdays = signal<any[]>([]);
  detailsservies = signal<any>({});
  bookingForm = signal<FormGroup>(new FormGroup({}));

  constructor(private fb: FormBuilder) {
    this.initForm();
  }

  private initForm() {
    this.bookingForm.set(
      this.fb.group({
        serviceId: ['', Validators.required],
        date: ['', Validators.required],
        startTime: ['', Validators.required],
        clientEmail: ['', [Validators.required, Validators.email]],
        name: ['', Validators.required],
        phone_number: ['', Validators.required],
        provider: ['Stripe', Validators.required],
      }),
    );
  }

  getCurrentLanguage() {
    return localStorage.getItem('Language') || 'en';
  }

  getControl(name: string) {
    return this.bookingForm().get(name);
  }

  resetBooking() {
    this.bookingForm().reset();
    this.detailsservies.set({});
    this.currentStep.set(1);
  }
}
