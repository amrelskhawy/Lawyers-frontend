import { Component, EventEmitter, Input, Output, signal } from '@angular/core';

@Component({
  selector: 'app-confirmation-delete',
  standalone: false,
  templateUrl: './confirmation-delete.html',
  styleUrl: './confirmation-delete.scss',
})
export class ConfirmationDelete {
  visibel = signal<boolean>(false);
  @Output() handelstatusConfirmation = new EventEmitter<string>();

  @Input()
  set visibelConfirme(value: boolean) {
    this.visibel.set(value);
  }

  onControlStatusPopupConfirmation(status: string) {
    this.handelstatusConfirmation.emit(status);
  }
}
