import { DatePipe } from '@angular/common';
import { Component, ContentChild, Input, signal, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-tabel',
  standalone: false,
  templateUrl: './tabel.html',
  styleUrl: './tabel.scss',
})
export class Tabel<T extends object> {
  constructor(private datePipe: DatePipe) {}
  loadingData = [1, 2, 3, 4, 5,6,7,8,9,10];
  tableData: T[] = [];
  @Input() bodytabel: any[] = [];
  @Input()
  set data(value: T[]) {
    this.tableData = value ?? [];
  }



  formatCell(key: string, value: any): string {
    let ArraDate = ['createdAt', 'updatedAt'];
    let timeFields = ['startTime', 'endTime'];
    if (ArraDate.includes(key)) {
      return this.datePipe.transform(value, 'shortDate') || '';
    }
    if (timeFields.includes(key)) {
    }
    return value;
  }

  @ContentChild(TemplateRef) actionsTpl!: TemplateRef<any>;
}
