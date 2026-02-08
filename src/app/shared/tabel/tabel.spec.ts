import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tabel } from './tabel';

describe('Tabel', () => {
  let component: Tabel;
  let fixture: ComponentFixture<Tabel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Tabel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tabel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
