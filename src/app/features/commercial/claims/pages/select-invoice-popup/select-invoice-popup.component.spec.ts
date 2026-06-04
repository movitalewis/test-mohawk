import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectInvoicePopupComponent } from './select-invoice-popup.component';

describe('SelectInvoicePopupComponent', () => {
  let component: SelectInvoicePopupComponent;
  let fixture: ComponentFixture<SelectInvoicePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectInvoicePopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectInvoicePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
