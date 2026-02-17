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
  tableData: T[] = [];
  @Input() bodytabel: any[] = [];
  @Input() rows: number = 10;

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
