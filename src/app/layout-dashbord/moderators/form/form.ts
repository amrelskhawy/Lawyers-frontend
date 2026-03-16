import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Data } from '../../../core/Servies/data';

@Component({
  selector: 'app-form',
  standalone: false,
  templateUrl: './form.html',
  styleUrl: './form.scss',
})
export class Form implements OnInit {
  ngOnInit(): void {
    this.CreateForm();
  }
  constructor(
    private FB: FormBuilder,
    private Data: Data,
  ) { }

  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() success = new EventEmitter<boolean>();
  Form = signal<FormGroup>(new FormGroup({}));
  showPassword = signal<boolean>(false);



  CreateForm() {
    this.Form.set(
      this.FB.group({
        name: ['', Validators.required],
        email: ['', Validators.required],
        password: ['', Validators.required],
      }),
    );
  }

  onSubmit() {
    if (this.Form().invalid) {
      this.Form().markAllAsTouched()
      return
    }
    this.Data.post('moderators', this.Form().value).subscribe((res) => {
      this.handelResponseSuccess();
    });
  }

  handelResponseSuccess() {
    this.Form().reset();
    this.success.emit(true)
  }
  onClose() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  closeDialog() {
    this.visible = false;
  }


  togglePasswordVisibility() {
    this.showPassword.update((val) => !val);
  }

  getControlName(controlName: string) {
    return this.Form().get(controlName);
  }
}
