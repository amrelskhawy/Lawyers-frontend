import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Data } from '../../../core/Servies/data';

@Component({
  selector: 'app-manual-booking-form',
  standalone: false,
  templateUrl: './manual-booking-form.html',
  styleUrl: './manual-booking-form.scss',
})
export class ManualBookingForm implements OnInit, OnDestroy {
  constructor(
    private FB: FormBuilder,
    private Data: Data,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.watchDateChange();
    this.loadServices();
    this.loadCustomers();

    // Apply a date that was set before the form was ready
    if (this._pendingDate) {
      this.Form().patchValue({ date: this._parseDateString(this._pendingDate) });
    }
  }

  ngOnDestroy(): void {
    this.dateSub?.unsubscribe();
  }

  //************************************Variables***************************************//
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() bookingCreated = new EventEmitter<boolean>();

  /** Pre-fill the date when opening from a calendar day click (YYYY-MM-DD) */
  @Input()
  set selectedDate(value: string | null) {
    this._pendingDate = value;
    // If form already exists (re-open after first use), patch immediately
    if (value && this.Form().controls['date']) {
      this.Form().patchValue({ date: this._parseDateString(value) });
    }
  }

  Form = signal<FormGroup>(new FormGroup({}));
  services = signal<{ label: string; value: string }[]>([]);
  customers = signal<{ label: string; value: string }[]>([]);
  timeSlots = signal<any[]>([]);
  selectedSlot = signal<any>(null);
  isLoading = signal<boolean>(false);
  minDate = new Date();

  private dateSub?: Subscription;
  private _pendingDate: string | null = null;
  //************************************Variables***************************************//

  //************************************Methods***************************************//
  private _parseDateString(dateStr: string): Date {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  createForm() {
    this.Form.set(
      this.FB.group({
        customerId: ['', Validators.required],
        serviceId: ['', Validators.required],
        date: [null, Validators.required],
        startTime: ['', Validators.required],
        endTime: [''],
      }),
    );
  }

  watchDateChange() {
    this.dateSub?.unsubscribe();
    this.dateSub = this.Form()
      .get('date')
      ?.valueChanges.subscribe((selectedDate: Date) => {
        if (!selectedDate) return;
        const dateStr = new Date(selectedDate).toLocaleDateString('en-CA');

        // Reset slots and time selection when date changes
        this.timeSlots.set([]);
        this.selectedSlot.set(null);
        this.Form().patchValue({ startTime: '', endTime: '' }, { emitEvent: false });

        this.Data.get<any>('bookings/availability', { date: dateStr }).subscribe((res) => {
          if (res.data) this.timeSlots.set(res.data);
        });
      });
  }

  loadServices() {
    this.Data.get<any>('services').subscribe((res) => {
      this.services.set(
        (res.data as any[]).map((s) => ({
          label: s.name_ar || s.name_en,
          value: s.id,
        })),
      );
    });
  }

  loadCustomers() {
    this.Data.get<any>('customers').subscribe((res) => {
      this.customers.set(
        (res.data as any[]).map((c) => ({
          label: `${c.fullName} — ${c.phone}`,
          value: c.id,
        })),
      );
    });
  }

  selectSlot(slot: any) {
    if (!slot.available) return;
    this.selectedSlot.set(slot);
    this.Form().patchValue(
      { startTime: slot.startTime, endTime: slot.endTime },
      { emitEvent: false },
    );
  }

  formatTime(time: string): string {
    const [h, m] = time.split(':').map(Number);
    const period = this.translate.instant(h >= 12 ? 'PM' : 'AM');
    const hour = h % 12 || 12;
    return `${hour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
  }

  onSubmit() {
    if (this.Form().invalid) {
      this.Form().markAllAsTouched();
      return;
    }

    const formValue = { ...this.Form().value };
    // Convert Date object to YYYY-MM-DD string for the backend
    if (formValue.date instanceof Date) {
      formValue.date = formValue.date.toLocaleDateString('en-CA');
    }

    this.isLoading.set(true);
    this.Data.post('bookings/manual', formValue).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.bookingCreated.emit(true);
        this._reset();
        this.closeDialog();
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  onClose() {
    this._reset();
    this.visible = false;
    this.visibleChange.emit(false);
  }

  closeDialog() {
    this._reset();
    this.visible = false;
  }

  getControl(name: string) {
    return this.Form().get(name);
  }

  private _reset() {
    this.Form().reset();
    this.timeSlots.set([]);
    this.selectedSlot.set(null);
  }
  //************************************Methods***************************************//
}
