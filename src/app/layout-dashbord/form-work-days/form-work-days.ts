import { Core } from './../../core/Servies/core';
import { debounceTime, Subject } from 'rxjs';
import { Data } from './../../core/Servies/data';
import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';

@Component({
  selector: 'app-form-work-days',
  standalone: false,
  templateUrl: './form-work-days.html',
  styleUrl: './form-work-days.scss',
})
export class FormWorkDays implements OnInit {
  ngOnInit(): void {
    this.getAllWorkDay();
  }

  constructor(
    private Data: Data,
    private Core:Core
  ) {
    this.debounceSubmitTime();
  }

  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  data = signal<any>([]);
  updateData = signal<any>([]);
  private debounceSubmit = new Subject<void>();

  debounceSubmitTime() {
    this.debounceSubmit.pipe(debounceTime(1500)).subscribe(() => {
      this.onSubmitData();
    });
  }

  onClose() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  closeDialog() {
    this.visible = false;
  }

  getAllWorkDay() {
    this.Data.get('workdays').subscribe((res: any) => {
      this.data.set(res.data);
    });
  }

  onTimeChange(day: any) {
    this.data.update((prevDays: any[]) => {
      return prevDays.map((item) =>
        item.id === day.id ? { ...item, startTime: day.startTime, endTime: day.endTime } : item,
      );
    });
    if (day.startTime && day.endTime) {
      this.debounceSubmit.next();
    }
  }

  onToggleChange(event: any, day: any) {
    const isChecked = event.checked;
    this.data.update((prevDays: any[]) => {
      return prevDays.map((item) => {
        if (item.id === day.id) {
          return {
            ...item,
            isOpen: isChecked,
            startTime: isChecked ? item.startTime || '09:00' : '',
            endTime: isChecked ? item.endTime || '17:00' : '',
          };
        }
        return item;
      });
    });
    this.onSubmitData();
  }

  onSubmitData() {
    const payload = {
      data: this.data(),
    };
    this.Data.patch('workdays', payload).subscribe({
      next: (res) => {
        this.Core._Sussess.next(false)
      },
    });
  }
}
