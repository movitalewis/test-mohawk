import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderDetailsCancelHoldModalComponent } from './order-details-cancel-hold-modal.component';

describe('OrderDetailsCancelHoldModalComponent', () => {
  let component: OrderDetailsCancelHoldModalComponent;
  let fixture: ComponentFixture<OrderDetailsCancelHoldModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderDetailsCancelHoldModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderDetailsCancelHoldModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
