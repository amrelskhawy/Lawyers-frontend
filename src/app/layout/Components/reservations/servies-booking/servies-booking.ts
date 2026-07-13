import { Component, computed, EventEmitter, Input, Output, signal } from '@angular/core';
import { BookingService } from '../booking.service';

@Component({
  selector: 'app-servies-booking',
  standalone: false,
  templateUrl: './servies-booking.html',
  styleUrl: './servies-booking.scss',
})
export class ServiesBooking {
  constructor(private bookingService: BookingService) {}
  servise = signal<any[]>([]);
  selectServies = signal<any>({});
  /** Active filter tab: normal services vs. installment plans. */
  activeTab = signal<'normal' | 'installment'>('normal');

  filteredServices = computed(() => {
    const installment = this.activeTab() === 'installment';
    return this.servise().filter((s: any) => !!s.isInstallmentPlans === installment);
  });
  @Input()
  set dataservies(value: any) {
    this.servise.set(value);
  }

  @Input()
  set selectedService(value: any) {
    if (value) {
      this.selectServies.set(value);
      // Show the tab that contains the pre-selected service (e.g. deep-linked
      // from the home page's Installment Plans tab).
      this.activeTab.set(value.isInstallmentPlans ? 'installment' : 'normal');
    }
  }

  @Output() serviesid = new EventEmitter<any>();

  getCurrentLanguage() {
    return this.bookingService.getCurrentLanguage();
  }
  onSelctServies(item: any) {
    this.selectServies.set(item);
    // Reflect the selection in the shared booking state immediately so the
    // summary sidebar (service name + total) updates live, before Next.
    this.bookingService.detailsservies.set(item);
    this.bookingService.getControl('serviceId')?.patchValue(item.id);
    this.bookingService.applyDateTimeRequirement(!!item.isInstallmentPlans);
  }

  onNextStep() {
    if (!this.selectServies().id) {
      this.bookingService.getControl('serviceId')?.markAsTouched();
      return;
    }
    this.serviesid.emit(this.selectServies());
  }
}
