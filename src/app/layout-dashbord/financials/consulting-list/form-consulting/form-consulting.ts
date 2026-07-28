import { Data } from '../../../../core/Servies/data';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-form-consulting',
  standalone: false,
  templateUrl: './form-consulting.html',
  styleUrl: './form-consulting.scss',
})
export class FormConsulting {
  constructor(
    private FB: FormBuilder,
    private Data: Data,
  ) {}

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
    this.Form().patchValue({
      clientName: value.clientName,
      date: value.date ? value.date.slice(0, 10) : '',
      value: +value.value,
      type: value.type,
    });
  }

  ngOnInit(): void {
    this.createForm();
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
        clientName: ['', Validators.required],
        date: ['', Validators.required],
        value: [0, [Validators.required, Validators.min(0)]],
        type: ['', Validators.required],
      }),
    );
  }

  onSubmitData() {
    if (this.Form().invalid) {
      this.Form().markAllAsTouched();
      return;
    }
    if (!this.objData()?.id) {
      this.Data.post('consulting', this.Form().value).subscribe(() => {
        this.HandelResponseSuccess();
      });
    } else {
      this.Data.put(`consulting/${this.objData().id}`, this.Form().value).subscribe(() => {
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
