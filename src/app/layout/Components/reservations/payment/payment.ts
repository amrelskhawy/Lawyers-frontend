import { Component, EventEmitter, Output, signal } from '@angular/core';

@Component({
  selector: 'app-payment',
  standalone: false,
  templateUrl: './payment.html',
  styleUrl: './payment.scss',
})
export class Payment {
typepayment=signal<string>("Stripe")
  @Output() payment = new EventEmitter<string>();

OnSelectPayment(providePayment:string){
  this.typepayment.set(providePayment)
}


onNextStep(){
this.payment.emit(this.typepayment())
}
}
