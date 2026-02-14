import { DatePipe } from '@angular/common';
import { Component, ContentChild, Input, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-tabel',
  standalone: false,
  templateUrl: './tabel.html',
  styleUrl: './tabel.scss',
})
export class Tabel<T extends object> {
  constructor(private datePipe: DatePipe) {}
  tableData: T[] = [];
   @Input() bodytabel:any [] = [];

  @Input()
  set data(value: T[]) {
    this.tableData = value ?? [];
  }


formatCell(key: string, value: any): string {
  if (key === 'createdAt' || key === 'updatedAt') {
    return this.datePipe.transform(value, 'shortDate') || '';
  }
  return value;
}

  @ContentChild(TemplateRef) actionsTpl!: TemplateRef<any>;
}
