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
    this.Data.patch(`bookings/${this.dataobj().id}/${action}`,{}).subscribe((rse) => {
      this.changeStatusBooking.emit(true)
    });
  }

  getcuurentLangauage() {
    let lang = localStorage.getItem('Language');
    return lang;
  }
}
