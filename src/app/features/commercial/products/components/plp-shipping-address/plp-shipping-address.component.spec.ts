import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BsModalService } from 'ngx-bootstrap/modal/bs-modal.service';

import { PlpShippingAddressComponent } from './plp-shipping-address.component';

describe('PlpShippingAddressComponent', () => {
  let component: PlpShippingAddressComponent;
  let fixture: ComponentFixture<PlpShippingAddressComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlpShippingAddressComponent ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlpShippingAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
 
  });

 
});
