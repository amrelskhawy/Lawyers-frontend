import { Data } from './../../../core/Servies/data';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Country, COUNTRIES } from '../../../core/Models/countries.model';


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

  countries = COUNTRIES;
  selectedCountry: Country = COUNTRIES[0];

  @Input()
  set objdata(value: any) {
    if (!value) {
      this.Form().reset();
      this.selectedCountry = COUNTRIES[0];
      return;
    }
    this.objData.set(value);
    const detected = this.detectCountry(value.phone);
    this.selectedCountry = detected.country;
    this.Form().patchValue({
      fullName: value.fullName,
      email: value.email,
      phone: detected.localNumber,
      location: value.location,
    });
  }

  private detectCountry(phone: string): { country: Country; localNumber: string } {
    if (!phone) return { country: COUNTRIES[0], localNumber: phone };
    const sorted = [...COUNTRIES].sort((a, b) => b.code.length - a.code.length);
    for (const c of sorted) {
      if (phone.startsWith(c.code)) {
        return { country: c, localNumber: phone.slice(c.code.length) };
      }
    }
    return { country: COUNTRIES[0], localNumber: phone };
  }

  onClose() {
    this.visible = false;
    this.Form().reset();
    this.objData.set(null);
    this.selectedCountry = COUNTRIES[0];
    this.visibleChange.emit(false);
  }

  closeDialog() {
    this.visible = false;
    this.objData.set(null);
    this.Form().reset();
    this.selectedCountry = COUNTRIES[0];
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
    formValue.phone = this.selectedCountry.code + formValue.phone;
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
    this.selectedCountry = COUNTRIES[0];
    this.ResSuccess.emit(true);
  }

  getControlName(controlName: string) {
    return this.Form().get(controlName);
  }
}
