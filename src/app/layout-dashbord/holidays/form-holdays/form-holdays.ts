import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Data } from '../../../core/Servies/data';

@Component({
  selector: 'app-form-holdays',
  standalone: false,
  templateUrl: './form-holdays.html',
  styleUrl: './form-holdays.scss',
})
export class FormHoldays implements OnInit {
  constructor(
    private FB: FormBuilder,
    private Data: Data,
  ) {}

  ngOnInit(): void {
    this.createForm();
  }

  //************************************Varibels***************************************//
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() ResponseSuccess = new EventEmitter<boolean>();
  Form = signal<FormGroup>(new FormGroup({}));
  //************************************Varibels***************************************//

  //************************************Implemantion Methods***************************************//
  onClose() {
    this.visible = false;
    this.Form().reset();
    this.visibleChange.emit(false);
  }

  closeDialog() {
    this.visible = false;
  }

  createForm() {
    this.Form.set(
      this.FB.group({
        date: ['', Validators.required],
        name: ['', Validators.required],
        startTime: ['', Validators.required],
        endTime: ['', Validators.required],
      }),
    );
  }

  onSubmitData() {
    if (this.Form().invalid) {
      this.Form().markAllAsTouched();
      return;
    }
    const rawData = this.Form().value;
    const formatTime = (date: any) => {
      if (!date || !(date instanceof Date)) return date;

      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    };

    const dataToSend = {
      ...rawData,
      startTime: formatTime(rawData.startTime),
      endTime: formatTime(rawData.endTime),
    };

    this.Data.post('holidays', dataToSend).subscribe((res) => {
      this.HandelResponseSuccess()
    });
  }

  HandelResponseSuccess() {
    this.Form().reset();
    this.onClose();
    this.ResponseSuccess.emit(true);
  }

  getControlName(controlName: string) {
    return this.Form().get(controlName);
  }
  //************************************Implemantion Methods***************************************//
}
