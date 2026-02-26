import { Component, EventEmitter, Input, OnInit, Output, signal, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Data } from '../../../core/Servies/data';

@Component({
  selector: 'app-form-holdays',
  standalone: false,
  templateUrl: './form-holdays.html',
  styleUrl: './form-holdays.scss',
})
export class FormHoldays implements OnInit, OnDestroy {
  isFullDaySubscription?: Subscription;
  constructor(
    private FB: FormBuilder,
    private Data: Data,
  ) { }

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
        isFullDay: [false],
        startTime: ['', Validators.required],
        endTime: ['', Validators.required],
      }),
    );

    this.isFullDaySubscription = this.Form().get('isFullDay')?.valueChanges.subscribe(isFullDay => {
      const startTimeControl = this.Form().get('startTime');
      const endTimeControl = this.Form().get('endTime');

      if (isFullDay) {
        startTimeControl?.clearValidators();
        endTimeControl?.clearValidators();
        startTimeControl?.setValue('');
        endTimeControl?.setValue('');
      } else {
        startTimeControl?.setValidators([Validators.required]);
        endTimeControl?.setValidators([Validators.required]);
      }
      startTimeControl?.updateValueAndValidity();
      endTimeControl?.updateValueAndValidity();
    });
  }

  ngOnDestroy() {
    if (this.isFullDaySubscription) {
      this.isFullDaySubscription.unsubscribe();
    }
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
      startTime: rawData.isFullDay ? null : formatTime(rawData.startTime),
      endTime: rawData.isFullDay ? null : formatTime(rawData.endTime),
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
