import { Component, EventEmitter, Input, Output, signal } from '@angular/core';

@Component({
  selector: 'app-show-customer-data',
  standalone: false,
  templateUrl: './show-customer-data.html',
  styleUrl: './show-customer-data.scss',
})
export class ShowCustomerData {
  objItem = signal<any>({});
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  @Input()
  set objdata(value: any) {
    this.objItem.set(value);
  }

  onClose() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  closeDialog() {
    this.visible = false;
    this.visibleChange.emit(false);
  }
}
