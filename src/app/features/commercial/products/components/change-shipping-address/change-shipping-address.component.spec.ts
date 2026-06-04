import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeShippingAddressComponent } from './change-shipping-address.component';

describe('ChangeShippingAddressComponent', () => {
  let component: ChangeShippingAddressComponent;
  let fixture: ComponentFixture<ChangeShippingAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChangeShippingAddressComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangeShippingAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
