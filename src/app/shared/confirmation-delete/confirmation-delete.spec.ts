import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationDelete } from './confirmation-delete';

describe('ConfirmationDelete', () => {
  let component: ConfirmationDelete;
  let fixture: ComponentFixture<ConfirmationDelete>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConfirmationDelete]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmationDelete);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
