import { Component, ContentChild, Input, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-tabel',
  standalone: false,
  templateUrl: './tabel.html',
  styleUrl: './tabel.scss',
})
export class Tabel<T extends object> {
  tableData: T[] = [];
   @Input() hiddenColumns: string[] = [];

  @Input()
  set data(value: T[]) {
    this.tableData = value ?? [];
  }

  isHidden(key: unknown): boolean {
   return this.hiddenColumns.includes(String(key));
  }

  @ContentChild(TemplateRef) actionsTpl!: TemplateRef<any>;
}
