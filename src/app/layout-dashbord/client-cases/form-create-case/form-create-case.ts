import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Data } from '../../../core/Servies/data';
import { CASE_TYPE_OPTIONS, IDataCase } from '../../../core/Models/case.model';
import { IDataCustomer } from '../../../core/Models/customers.model';

@Component({
  selector: 'app-form-create-case',
  standalone: false,
  templateUrl: './form-create-case.html',
  styleUrl: './form-create-case.scss',
})
export class FormCreateCase implements OnInit {
  constructor(private fb: FormBuilder, private data: Data) {}

  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() created = new EventEmitter<IDataCase>();

  Form = signal<FormGroup>(new FormGroup({}));
  customers = signal<IDataCustomer[]>([]);
  readonly caseTypes = CASE_TYPE_OPTIONS;
  submitting = signal<boolean>(false);

  ngOnInit() {
    this.createForm();
    this.loadCustomers();
  }

  createForm() {
    this.Form.set(
      this.fb.group({
        customerId: ['', Validators.required],
        caseType: ['LABOR', Validators.required],
        otherCaseType: [''],
        caseDate: [new Date(), Validators.required],
        hijriDate: [null],
        agencyNumber: [''],
      }),
    );
  }

  loadCustomers() {
    this.data.get<{ data: IDataCustomer[] }>('customers').subscribe((res) => {
      this.customers.set(res.data ?? []);
    });
  }

  closeDialog() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.Form().reset({ caseType: 'LABOR', otherCaseType: '', caseDate: new Date(), agencyNumber: '' });
  }

  onSubmit() {
    if (this.Form().invalid) {
      this.Form().markAllAsTouched();
      return;
    }
    const v = this.Form().value;
    const payload: any = {
      customerId: v.customerId,
      caseType: v.caseType,
      caseDate: (v.caseDate instanceof Date ? v.caseDate : new Date(v.caseDate)).toISOString(),
    };
    if (v.caseType === 'OTHER' && v.otherCaseType) {
      payload.otherCaseType = v.otherCaseType;
    }
    if (v.hijriDate) {
      payload.hijriDate = v.hijriDate;
    }
    if (v.agencyNumber) {
      payload.agencyNumber = v.agencyNumber;
    }
    this.submitting.set(true);
    this.data.post<{ data: IDataCase }>('cases', payload).subscribe({
      next: (res) => {
        this.submitting.set(false);
        this.created.emit(res.data);
        this.closeDialog();
      },
      error: () => this.submitting.set(false),
    });
  }

  getControlName(name: string) {
    return this.Form().get(name);
  }

}
