import { Component, EventEmitter, OnInit, Output, signal } from '@angular/core';
import { Data } from '../../core/Servies/data';
import { elementAt } from 'rxjs';

@Component({
  selector: 'app-footer',
  standalone: false,
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss'],
})
export class Footer implements OnInit {
  ngOnInit(): void {
    this.getData();
  }
  constructor(private Data: Data) {}
  @Output() EventRoute = new EventEmitter<string>();
  data = signal<any[]>([]);
  onClickListActive(route: string) {
    this.EventRoute.emit(route);
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getData() {
    this.Data.get('public').subscribe((res: any) => {
      const formattedData = res.data.workingDays.map((item: any) => {
        const isClosed = !item.startTime || item.startTime === '' || item.endTime === '';
        return {
          ...item,
          startTime: isClosed ? '00' : item.startTime,
          endTime: isClosed ? '00' : item.endTime,
          status: isClosed ? 'Closed' : 'Open',
        };
      });
      this.data.set(formattedData);
    });
  }
}
