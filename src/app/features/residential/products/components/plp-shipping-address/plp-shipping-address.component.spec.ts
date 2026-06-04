import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { DebugElement } from '@angular/core';
import {
  async,
  ComponentFixture,
  inject,
  TestBed,
} from '@angular/core/testing';
import { FormsModule, NgModel, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { of } from 'rxjs';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { ProductsRoutingModule } from '../../products-routing.module';
import { ProductAddressService } from '../services/product-address.service';

import { PlpShippingAddressComponent } from './plp-shipping-address.component';

describe('PlpShippingAddressComponent', () => {
  let component: PlpShippingAddressComponent;
  let fixture: ComponentFixture<PlpShippingAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [PlpShippingAddressComponent],
    imports: [CommonModule,
        FormsModule,
        ProductsRoutingModule,
        SharedModule,
        ModalModule,
        CarouselModule,
        ReactiveFormsModule,
        RouterTestingModule],
    providers: [{ provide: BsModalService, useValue: BsModalService }, provideHttpClient(withInterceptorsFromDi())]
}).compileComponents();

    fixture = TestBed.createComponent(PlpShippingAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should consist of a heading four tag', () => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const headingElems = fixture.nativeElement.css('h4');
      expect((headingElems.textContent as string).trim()).toBe(
        'Shipping Address'
      );
    });
  });
  it('should consist of a heading four tag', () => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const headingElems = fixture.nativeElement.querySelector('h4');
      expect((headingElems.textContent as string).trim()).toBe(
        'Default Shipping Address'
      );
    });
  });
  it('should consist of a paragraph tag', () => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const headingElems = fixture.nativeElement.querySelector('p');
      expect((headingElems.textContent as string).trim()).toBe(
        'About All Floors'
      );
    });
  });
  it('should consist of a button', () => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const headingElems = fixture.nativeElement.querySelector('button');
      expect((headingElems.textContent as string).trim()).toBe(
        'CHOOSE A SAVED ADDRESS'
      );
    });
  });
  it('should consist of button', () => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const headingElems = fixture.nativeElement.querySelector('button');
      expect((headingElems.textContent as string).trim()).toBe('Cancel');
    });
  });
  it('should consist of a button', () => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const headingElems = fixture.nativeElement.querySelector('button');
      expect((headingElems.textContent as string).trim()).toBe('Order Samples');
    });
  });

  it('should consist of a button', () => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const headingElems = fixture.nativeElement.querySelector('button');
      expect((headingElems.textContent as string).trim()).toBe('Order Samples');
    });
  });

  it('should', async(() => {
    spyOn(component, 'openOrderSamplesModal');

    let button = fixture.debugElement.nativeElement.querySelector('button');
    button.click();

    fixture.whenStable().then(() => {
      expect(component.openOrderSamplesModal).toHaveBeenCalled();
    });
  }));

  it('should', async(() => {
    spyOn(component, 'onHideModal');

    let button = fixture.debugElement.nativeElement.querySelector('button');
    button.click();

    fixture.whenStable().then(() => {
      expect(component.onHideModal).toHaveBeenCalled();
    });
  }));
  
});
