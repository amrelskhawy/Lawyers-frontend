import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopGrid } from './top-grid';

describe('TopGrid', () => {
  let component: TopGrid;
  let fixture: ComponentFixture<TopGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TopGrid]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopGrid);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
