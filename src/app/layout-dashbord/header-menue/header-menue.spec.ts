import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderMenue } from './header-menue';

describe('HeaderMenue', () => {
  let component: HeaderMenue;
  let fixture: ComponentFixture<HeaderMenue>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HeaderMenue]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderMenue);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
