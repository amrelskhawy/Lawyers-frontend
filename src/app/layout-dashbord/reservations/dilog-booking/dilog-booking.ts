import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { Data } from '../../../core/Servies/data';

@Component({
  selector: 'app-dilog-booking',
  standalone: false,
  templateUrl: './dilog-booking.html',
  styleUrl: './dilog-booking.scss',
})
export class DilogBooking {
  constructor(private Data: Data) {}
  //************************************Varibels***************************************//
  dataobj = signal<any>([]);
  isCapturing = signal<boolean>(false);
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() changeStatusBooking = new EventEmitter<boolean>();
  @Input()
  set obj(value: any) {
    this.dataobj.set(value);
  }
  //************************************Varibels***************************************//

  onClose() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  closeDialog() {
    this.visible = false;
  }

  HandelActionBooking(action: string) {
    this.Data.patch(`bookings/${this.dataobj().id}/${action}`, {}).subscribe(() => {
      this.changeStatusBooking.emit(true);
    });
  }

  capturePayment() {
    this.isCapturing.set(true);
    this.Data.post(`bookings/${this.dataobj().id}/capture-payment`, {}).subscribe({
      next: (res: any) => {
        this.isCapturing.set(false);
        this.dataobj.update((prev) => ({ ...prev, paymentStatus: res.data?.paymentStatus ?? 'PAID' }));
        this.changeStatusBooking.emit(true);
      },
      error: () => {
        this.isCapturing.set(false);
      },
    });
  }

  isManualAuthorized(): boolean {
    const obj = this.dataobj();
    return obj?.createdByRole && obj?.paymentStatus === 'AUTHORIZED';
  }

  getcuurentLangauage() {
    return localStorage.getItem('Language');
  }
}
