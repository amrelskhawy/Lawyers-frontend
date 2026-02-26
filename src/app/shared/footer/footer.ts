import { Component, EventEmitter, OnInit, Output, signal, effect } from '@angular/core';
import { Data } from '../../core/Servies/data';

@Component({
  selector: 'app-footer',
  standalone: false,
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss'],
})
export class Footer implements OnInit {
  constructor(private Data: Data) {
    effect(() => {
      const publicData = this.Data.publicData();
      if (publicData && publicData.workingDays) {
        this.formatWorkingDays(publicData.workingDays);
      }
    });
  }

  ngOnInit(): void {
  }

  @Output() EventRoute = new EventEmitter<string>();
  data = signal<any[]>([]);
  onClickListActive(route: string) {
    this.EventRoute.emit(route);
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private formatWorkingDays(workingDays: any[]) {
    const dayTranslationKeys: { [key: string]: string } = {
      'Saturday': 'Sat',
      'Sunday': 'SUn',
      'Monday': 'Mon',
      'Tuesday': 'Tue',
      'Wednesday': 'Wed',
      'Thursday': 'Thu',
      'Friday': 'Fri',
      'السبت': 'Sat',
      'الأحد': 'SUn',
      'الإثنين': 'Mon',
      'الثلاثاء': 'Tue',
      'الأربعاء': 'Wed',
      'الخميس': 'Thu',
      'الجمعة': 'Fri'
    };

    const formattedData = workingDays.map((item: any) => {
      const isClosed = !item.startTime || item.startTime === '' || item.endTime === '';
      return {
        ...item,
        translationKey: dayTranslationKeys[item.day] || item.day,
        startTime: isClosed ? '00' : item.startTime,
        endTime: isClosed ? '00' : item.endTime,
        status: isClosed ? 'Closed' : 'Open',
      };
    });

    const keyOrder = ['Sat', 'SUn', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    formattedData.sort((a: any, b: any) => {
      return keyOrder.indexOf(a.translationKey) - keyOrder.indexOf(b.translationKey);
    });

    this.data.set(formattedData);
  }
}
