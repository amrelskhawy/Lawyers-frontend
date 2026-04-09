import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-deatails-descrption',
  standalone: false,
  templateUrl: './deatails-descrption.html',
  styleUrl: './deatails-descrption.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeatailsDescrption {
  dataobj = signal<any>({});
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Input()
  set objData(value: any) {
    this.dataobj.set(value);
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
