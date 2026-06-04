import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XchangeLegendPopupComponent } from './xchange-legend-popup.component';

describe('XchangeLegendPopupComponent', () => {
  let component: XchangeLegendPopupComponent;
  let fixture: ComponentFixture<XchangeLegendPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ XchangeLegendPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XchangeLegendPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
