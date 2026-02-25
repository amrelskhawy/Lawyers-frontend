import { Component, EventEmitter, OnInit, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-data-booking',
  standalone: false,
  templateUrl: './data-booking.html',
  styleUrl: './data-booking.scss',
})
export class DataBooking implements OnInit {
  ngOnInit(): void {
    this.createForm();
  }

  constructor(private FB: FormBuilder) {}
  Form = signal<FormGroup>(new FormGroup({}));
  @Output() dataClient = new EventEmitter<any>();


  createForm() {
    this.Form.set(
      this.FB.group({
        clientEmail: ['', [Validators.required,Validators.email]],
        name: ['', Validators.required],
        phone_number: ['', Validators.required],
      }),
    );
  }

  onNextSteap() {
    if(this.Form().invalid){
      this.Form().markAllAsTouched()
      return
    }
    this.dataClient.emit(this.Form().value)
  }


  getControlName(controlName: string) {
    return this.Form().get(controlName);
  }


}
