import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyPaymentReportComponent } from './daily-payment-report.component';

describe('DailyPaymentReportComponent', () => {
  let component: DailyPaymentReportComponent;
  let fixture: ComponentFixture<DailyPaymentReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DailyPaymentReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DailyPaymentReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
