import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdersHistoryDetailsComponent } from './orders-history-details.component';

describe('OrdersHistoryDetailsComponent', () => {
  let component: OrdersHistoryDetailsComponent;
  let fixture: ComponentFixture<OrdersHistoryDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrdersHistoryDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrdersHistoryDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
