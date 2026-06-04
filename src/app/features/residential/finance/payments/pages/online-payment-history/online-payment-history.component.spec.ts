import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlinePaymentHistoryComponent } from './online-payment-history.component';

describe('OnlinePaymentHistoryComponent', () => {
  let component: OnlinePaymentHistoryComponent;
  let fixture: ComponentFixture<OnlinePaymentHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OnlinePaymentHistoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnlinePaymentHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
