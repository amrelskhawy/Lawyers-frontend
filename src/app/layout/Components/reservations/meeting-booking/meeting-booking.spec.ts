import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingBooking } from './meeting-booking';

describe('MeetingBooking', () => {
  let component: MeetingBooking;
  let fixture: ComponentFixture<MeetingBooking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MeetingBooking]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeetingBooking);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
