import { Data } from './../../../core/Servies/data';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-form-customer',
  standalone: false,
  templateUrl: './form-customer.html',
  styleUrl: './form-customer.scss',
})
export class FormCustomer {
  constructor(
    private FB: FormBuilder,
    private Data: Data,
  ) {}

  ngOnInit(): void {
    this.createForm();
  }

  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() ResSuccess = new EventEmitter<boolean>();
  Form = signal<FormGroup>(new FormGroup({}));
  objData = signal<any>(null);

  @Input()
  set objdata(value: any) {
    if (!value) {
      this.Form().reset();
      return;
    }
    this.objData.set(value);
    const phone = value.phone?.startsWith('966') ? value.phone.slice(3) : value.phone;
    this.Form().patchValue({
      fullName: value.fullName,
      email: value.email,
      phone: phone,
      location: value.location,
    });
  }

  onClose() {
    this.visible = false;
    this.Form().reset();
    this.objData.set(null);
    this.visibleChange.emit(false);
  }

  closeDialog() {
    this.visible = false;
    this.objData.set(null);
    this.Form().reset();
  }

  createForm() {
    this.Form.set(
      this.FB.group({
        fullName: ['', Validators.required],
        email: ['', [Validators.email]],
        phone: ['', Validators.required],
        location: [''],
      }),
    );
  }

  onSubmitData() {
    if (this.Form().invalid) {
      this.Form().markAllAsTouched();
      return;
    }
    const formValue = { ...this.Form().value };
    formValue.phone = '966' + formValue.phone;
    if (!formValue.email) {
      delete formValue.email;
    }
    if (!this.objData()?.id) {
      this.Data.post('customers', formValue).subscribe((res) => {
        this.HandelResponseSuccess();
      });
    } else {
      this.Data.put(`customers/${this.objData().id}`, formValue).subscribe((res) => {
        this.HandelResponseSuccess();
      });
    }
  }

  HandelResponseSuccess() {
    this.Form().reset();
    this.ResSuccess.emit(true);
  }

  getControlName(controlName: string) {
    return this.Form().get(controlName);
  }
}
