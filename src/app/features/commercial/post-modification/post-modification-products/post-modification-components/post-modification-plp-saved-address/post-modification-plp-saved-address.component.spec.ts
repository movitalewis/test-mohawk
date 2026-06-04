import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { ProductsRoutingModule } from '../../products-routing.module';

import { PlpSavedAddressComponent } from './plp-saved-address.component';

describe('PlpSavedAddressComponent', () => {
  let component: PlpSavedAddressComponent;
  let fixture: ComponentFixture<PlpSavedAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [PlpSavedAddressComponent],
    imports: [CommonModule,
        FormsModule,
        ProductsRoutingModule,
        SharedModule,
        ModalModule,
        CarouselModule,
        ReactiveFormsModule,
        RouterTestingModule],
    providers: [{ provide: BsModalService, useValue: BsModalService }, provideHttpClient(withInterceptorsFromDi())]
})
    .compileComponents();

    fixture = TestBed.createComponent(PlpSavedAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should consist of a heading four tag', () => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const headingElems = fixture.nativeElement.css('h4');
      expect((headingElems.textContent as string).trim()).toBe(
        'Saved Addresses'
      );
    });
  });
  it('should consist of a heading four tag', () => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const headingElems = fixture.nativeElement.css('h4');
      expect((headingElems.textContent as string).trim()).toBe(
        'Saved Addresses'
      );
    });
  });
  it('should consist of a button', () => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const headingElems = fixture.nativeElement.querySelector('button');
      expect((headingElems.textContent as string).trim()).toBe('');
    });
  });

  it('should', async(() => {
    spyOn(component, 'onHideModal');

    let button = fixture.debugElement.nativeElement.querySelector('button');
    button.click();

    fixture.whenStable().then(() => {
      expect(component.onHideModal).toHaveBeenCalled();
    });
  }));
});
