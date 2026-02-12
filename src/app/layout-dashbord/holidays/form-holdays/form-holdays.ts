import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-form-holdays',
  standalone: false,
  templateUrl: './form-holdays.html',
  styleUrl: './form-holdays.scss',
})
export class FormHoldays implements OnInit {
  constructor(private FB: FormBuilder) {}

  ngOnInit(): void {
    this.createForm();
  }

  //************************************Varibels***************************************//
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  Form = signal<FormGroup>(new FormGroup({}));
  //************************************Varibels***************************************//



    //************************************Implemantion Methods***************************************//
  onClose() {
    this.visible = false;
        this.Form().reset()
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
  }

    getControlName(controlName: string) {
    return this.Form().get(controlName);
  }
  //************************************Implemantion Methods***************************************//
}
