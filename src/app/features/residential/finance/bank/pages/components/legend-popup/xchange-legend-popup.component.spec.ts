import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegendPopupComponent } from './xchange-legend-popup.component';

describe('LegendPopupComponent', () => {
  let component: LegendPopupComponent;
  let fixture: ComponentFixture<LegendPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LegendPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LegendPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
