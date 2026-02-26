import { Component, computed, OnInit, signal } from '@angular/core';
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

  constructor(private Data: Data) { }

  displayDate: Date = new Date();
  daysInMonth: number[] = [];
  emptyCells: any[] = [];
  visibelDilogBooking: boolean = false;
  visibleBooksPopup: boolean = false;
  selectedDayBooks = signal<any[]>([]);
  selectedDay = signal<number>(0);
  bookings = signal<any[]>([]);
  obj = signal<any[]>([]);
  selectedStatus = signal<string>('All');
  filteredBookings = signal<any[]>([]);
  months = [
    { name: 'يناير', value: 0 },
    { name: 'فبراير', value: 1 },
    { name: 'مارس', value: 2 },
    { name: 'أبريل', value: 3 },
    { name: 'مايو', value: 4 },
    { name: 'يونيو', value: 5 },
    { name: 'يوليو', value: 6 },
    { name: 'أغسطس', value: 7 },
    { name: 'سبتمبر', value: 8 },
    { name: 'أكتوبر', value: 9 },
    { name: 'نوفمبر', value: 10 },
    { name: 'ديسمبر', value: 11 },
  ];

  selectedMonth: any = this.months[new Date().getMonth()];

  onMonthChange(event: any) {
    const selectedMonthValue = event.value.value;
    const currentYear = this.displayDate.getFullYear();
    this.displayDate = new Date(currentYear, selectedMonthValue, 1);
    this.generateCalendar();
  }

  getAllBooking() {
    this.Data.get('bookings').subscribe((res: any) => {
      this.bookings.set(res.data);
      this.filteredBookings.set(res.data);
    });
  }

  GetAllBookingByStatus(status: string) {
    this.selectedStatus.set(status);

    if (status === 'All') {
      this.filteredBookings.set(this.bookings());
    } else {
      const filtered = this.bookings().filter((b) => b.status === status);
      this.filteredBookings.set(filtered);
    }
  }

  generateCalendar() {
    const year = this.displayDate.getFullYear();
    const month = this.displayDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();
    this.emptyCells = Array(firstDayIndex).fill(null);
    this.daysInMonth = Array.from({ length: lastDay }, (_, i) => i + 1);
  }

  // getBookingsForDay(day: number) {
  //   const year = this.displayDate.getFullYear();
  //   const month = this.displayDate.getMonth();
  //   return this.bookings().filter((b) => {
  //     if (!b.date) return false;
  //     const bookingDate = new Date(b.date);
  //     return (
  //       bookingDate.getFullYear() === year &&
  //       bookingDate.getMonth() === month &&
  //       bookingDate.getDate() === day
  //     );
  //   });
  // }

  // changeMonth(offset: number) {
  //   this.displayDate = new Date(this.displayDate.setMonth(this.displayDate.getMonth() + offset));
  //   this.generateCalendar();
  // }

  getBookingsForDay(day: number) {
    const year = this.displayDate.getFullYear();
    const month = this.displayDate.getMonth();

    return this.filteredBookings().filter((b) => {
      if (!b.date) return false;

      const bookingDate = new Date(b.date);

      return (
        bookingDate.getFullYear() === year &&
        bookingDate.getMonth() === month &&
        bookingDate.getDate() === day
      );
    });
  }

  onShowDilogBooking(book: any) {
    this.visibelDilogBooking = true;
    this.obj.set(book);
  }
  getnameServies(book: any) {
    let lang = localStorage.getItem('Language');
    const name = book[`name_${lang}`];
    return name && name.length > 5 ? name.substring(0, 5) + '...' : name;
  }

  onchangeStatusBooking() {
    this.visibelDilogBooking = false;
    this.getAllBooking();
  }

  onViewMore(day: number, books: any[]) {
    this.selectedDay.set(day);
    this.selectedDayBooks.set(books);
    this.visibleBooksPopup = true;
  }
}
