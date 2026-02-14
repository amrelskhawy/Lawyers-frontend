import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';

@Component({
  selector: 'app-show-data-in-dilog',
  standalone: false,
  templateUrl: './show-data-in-dilog.html',
  styleUrl: './show-data-in-dilog.scss',
})
export class ShowDataInDilog implements OnInit {
  ngOnInit(): void {
    this.getcuurentLangauage();
  }

  objItem = signal<any>({});
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Input()
  set objdata(value: any) {
    this.objItem.set(value);
  }
  onClose() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  closeDialog() {
    this.visible = false;
  }

  getcuurentLangauage() {
    let lang = localStorage.getItem('Language');
    return lang;
  }
}
