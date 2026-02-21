import { Component, OnInit, signal } from '@angular/core';
import { Data } from '../../core/Servies/data';

@Component({
  selector: 'app-reservations',
  standalone: false,
  templateUrl: './reservations.html',
  styleUrl: './reservations.scss',
})
export class Reservations implements OnInit {
  ngOnInit() {
    this.generateCalendar();
    this.getAllBooking();
  }

  constructor(private Data: Data) {}

  displayDate: Date = new Date();
  daysInMonth: number[] = [];
  emptyCells: any[] = [];
  visibelDilogBooking:boolean=false

  bookings = signal<any[]>([]);
  obj = signal<any[]>([]);

  getAllBooking() {
    this.Data.get('bookings').subscribe((res: any) => {
      this.bookings.set(res.data);
    });
  }

  generateCalendar() {
    const year = this.displayDate.getFullYear();
    const month = this.displayDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();
    this.emptyCells = Array(firstDayIndex).fill(null);
    this.daysInMonth = Array.from({ length: lastDay }, (_, i) => i + 1);
  }



  getBookingsForDay(day: number) {
    const year = this.displayDate.getFullYear();
    const month = this.displayDate.getMonth();
    return this.bookings().filter((b) => {
      if (!b.date) return false;
      const bookingDate = new Date(b.date);
      return (
        bookingDate.getFullYear() === year &&
        bookingDate.getMonth() === month &&
        bookingDate.getDate() === day
      );
    });
  }



  changeMonth(offset: number) {
    this.displayDate = new Date(this.displayDate.setMonth(this.displayDate.getMonth() + offset));
    this.generateCalendar();
  }




  onShowDilogBooking(book:any){
    this.visibelDilogBooking=true
    this.obj.set(book)
  }
  getnameServies(book: any) {
    let lang = localStorage.getItem('Language');
    const name = book[`name_${lang}`];
    return name && name.length > 5 ? name.substring(0, 5) + '...' : name;
  }
}
