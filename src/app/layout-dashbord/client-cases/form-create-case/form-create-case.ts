import { Component, EventEmitter, Input, OnInit, Output, computed, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Data } from '../../../core/Servies/data';
import { CASE_TYPE_OPTIONS, IDataCase, ILawyerOption } from '../../../core/Models/case.model';
import { IDataCustomer } from '../../../core/Models/customers.model';
import { IUser } from '../../users/users';

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
  private assignees = signal<ILawyerOption[]>([]);
  // Only lawyers can be the source of a client — consultants are never a case source.
  lawyerOptions = computed(() => this.assignees().filter((l) => l.role === 'LAWYER'));
  readonly caseTypes = CASE_TYPE_OPTIONS;
  submitting = signal<boolean>(false);

  ngOnInit() {
    this.createForm();
    this.loadCustomers();
    this.loadLawyers();
    this.wireSourceLawyer();
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
        isRealCustomer: [false],
        isCompany: [true],
        sourceLawyerId: [null],
      }),
    );
  }

  /**
   * The source lawyer only applies to lawyer-sourced clients: required while
   * `isCompany` is off, cleared the moment it goes back on.
   */
  private wireSourceLawyer() {
    this.Form()
      .get('isCompany')!
      .valueChanges.subscribe((isCompany: boolean) => {
        const ctrl = this.Form().get('sourceLawyerId')!;
        if (isCompany) {
          ctrl.clearValidators();
          ctrl.setValue(null);
        } else {
          ctrl.setValidators(Validators.required);
        }
        ctrl.updateValueAndValidity();
      });
  }

  loadCustomers() {
    this.data.get<{ data: IDataCustomer[] }>('customers').subscribe((res) => {
      this.customers.set(res.data ?? []);
    });
  }

  loadLawyers() {
    this.data.get<{ data: IUser[] }>('public/lawyers').subscribe((res) => {
      this.assignees.set(
        (res.data ?? []).map((u) => ({
          id: u.id,
          name: u.nameAr || u.name,
          email: u.email,
          role: u.role,
        })),
      );
    });
  }

  closeDialog() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.Form().reset({ caseType: 'LABOR', otherCaseType: '', caseDate: new Date(), agencyNumber: '', isRealCustomer: false, isCompany: true, sourceLawyerId: null });
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
      isRealCustomer: !!v.isRealCustomer,
      isCompany: !!v.isCompany,
      sourceLawyerId: v.isCompany ? null : v.sourceLawyerId,
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
