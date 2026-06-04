import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchedulePaymentConfirmationComponent } from './schedule-payment-confirmation.component';

describe('SchedulePaymentConfirmationComponent', () => {
  let component: SchedulePaymentConfirmationComponent;
  let fixture: ComponentFixture<SchedulePaymentConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SchedulePaymentConfirmationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchedulePaymentConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
