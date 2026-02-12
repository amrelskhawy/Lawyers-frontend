import { Data } from './../../../core/Servies/data';
import { Component, EventEmitter, Input, model, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-formservies',
  standalone: false,
  templateUrl: './formservies.html',
  styleUrl: './formservies.scss',
})
export class Formservies {
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
  @Output() ResSuccess = new EventEmitter<boolean>();
  Form = signal<FormGroup>(new FormGroup({}));
  objData = signal<any>({});

  @Input()
  set objdata(value: any) {
    this.objData.set(value);
    this.Form().patchValue({
      name_ar: value.name_ar,
      name_en: value.name_en,
      description_ar: value.description_ar,
      description_en: value.description_en,
      price: +value.price,
    });
  }
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
        name_ar: ['', Validators.required],
        name_en: ['', Validators.required],
        description_ar: ['', Validators.required],
        description_en: ['', Validators.required],
        price: [0, Validators.required],
      }),
    );
  }

  onSubmitData() {
    if (this.Form().invalid) {
      this.Form().markAllAsTouched();
      return;
    }
    if (!this.objData().id) {
      this.Data.post('services', this.Form().value).subscribe((res) => {
        this.HandelResponseSuccess();
      });
    } else {
      this.Data.put(`services/${this.objData().id}`, this.Form().value).subscribe((res) => {
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
  //************************************Implemantion Methods***************************************//
}
