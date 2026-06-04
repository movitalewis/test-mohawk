import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseAddressLightboxComponent } from './choose-address-lightbox.component';

describe('ChooseAddressLightboxComponent', () => {
  let component: ChooseAddressLightboxComponent;
  let fixture: ComponentFixture<ChooseAddressLightboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChooseAddressLightboxComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChooseAddressLightboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
