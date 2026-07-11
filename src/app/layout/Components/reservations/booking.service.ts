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
  /** Live snapshot of the form value — drives the reactive Booking Summary sidebar in a zoneless app. */
  formValue = signal<any>({});

  constructor(private fb: FormBuilder) {
    this.initForm();
  }

  private initForm() {
    const form = this.fb.group({
      serviceId: ['', Validators.required],
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      clientEmail: ['', [Validators.required, Validators.email]],
      name: ['', Validators.required],
      phoneCountryCode: ['+966'],
      phone_number: ['', [Validators.required, Validators.pattern(/^\d{7,15}$/)]],
      provider: ['PAYMOB', Validators.required],
    });
    this.bookingForm.set(form);
    this.formValue.set(form.getRawValue());
    form.valueChanges.subscribe((v) => this.formValue.set(v));
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
