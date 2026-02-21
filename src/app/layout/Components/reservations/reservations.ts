import { Component, OnInit, signal } from '@angular/core';
import { IDataServies } from '../../../core/Models/servies.model';
import { Data } from '../../../core/Servies/data';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-reservations',
  standalone: false,
  templateUrl: './reservations.html',
  styleUrl: './reservations.scss',
})
export class Reservations implements OnInit {
  ngOnInit(): void {
    this.getData();
     this.createForm();
  }

  constructor(
    private Data: Data,
     private Fb: FormBuilder,
  ) {}
  currentStep = 1;

  dataservies = signal<IDataServies[]>([]);
  disabledDates = signal<any[]>([]);
  workdays = signal<any[]>([]);
  detailsservies = signal<any>({});
  Form = signal<FormGroup>(new FormGroup({}));


      createForm() {
      this.Form.set(
        this.Fb.group({
          serviceId: ['', Validators.required],
          date: ['', Validators.required],
          startTime: ['', Validators.required],
          clientEmail: ['', Validators.required],
          name:['', Validators.required],
          phone_number:['', Validators.required]
        }),
      );
    }

  getData() {
    this.Data.get('public').subscribe((res: any) => {
      this.dataservies.set(res.data.services);
      this.workdays.set(res.data.workingDays);
      const holidaysApi = res.data.holidays;
      const formattedDates = holidaysApi.map((item: any) => new Date(item.date));
      this.disabledDates.set(formattedDates);
    });
  }

  onselectServies(event: any) {
    if (!event || !event.id) {
      return;
    }
    this.detailsservies.set(event)
    this.Form().get('serviceId')?.patchValue(event.id)
    this.currentStep = 2;
  }

  EventDataClient(event: any) {
    this.currentStep = 3;
   this.Form().get('phone_number')?.patchValue(event.phone_number)
   this.Form().get('name')?.patchValue(event.name)
   this.Form().get('clientEmail')?.patchValue(event.clientEmail)
  }

  EventDateClient(event: any) {
    this.currentStep = 4;
     this.Form().get('date')?.patchValue(event.date)
   this.Form().get('startTime')?.patchValue(event.startTime)
  }



}
