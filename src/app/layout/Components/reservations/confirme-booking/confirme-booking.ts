import { Component, Input, signal } from '@angular/core';
import { Data } from '../../../../core/Servies/data';

@Component({
  selector: 'app-confirme-booking',
  standalone: false,
  templateUrl: './confirme-booking.html',
  styleUrl: './confirme-booking.scss',
})
export class ConfirmeBooking {
  constructor(private Data: Data) {}
  Form = signal<any>({});
  name = signal<any>({});
  @Input()
  set form(form: any) {
    this.Form.set(form);
  }

  @Input()
  set nameServies(name: any) {
    this.name.set(name);
  }

  getcuurentLangauage() {
    let lang = localStorage.getItem('Language');
    return lang;
  }

  onSunmit() {
    const formValue = this.Form().value;
    const formattedDate = formValue.date.toLocaleDateString('en-CA');
    const payload = {
      ...formValue,
      date: formattedDate,
    };
    this.Data.post('bookings', payload).subscribe(() => {
      this.Form().reset();
      this.name.set('')
    });
  }
}
