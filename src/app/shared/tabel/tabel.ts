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
  exsistData = signal<string>('');
  loadingData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

  @Input() bodytabel: any[] = [];
  @Input()
  set data(value: T[]) {
    this.tableData = value ?? [];
  }

  @Input()
  set no_data(value: string) {
    this.exsistData.set(value);
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









  getCellClass(col: any, row: any): string {
  const value = row[col.value];
  if (col.value === 'role') {
    switch (value) {
      case 'ADMIN': return 'admin-badge';
      case 'MODERATOR': return 'moderator-badge ';
      default: return '';
    }
  }
  return '';
}
}
