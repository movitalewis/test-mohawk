import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShippingPreferencesComponent } from './shipping-preferences.component';

describe('ShippingPreferencesComponent', () => {
  let component: ShippingPreferencesComponent;
  let fixture: ComponentFixture<ShippingPreferencesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShippingPreferencesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShippingPreferencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
