import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceSearchPopupComponent } from './invoice-search-popup.component';

describe('InvoiceSearchPopupComponent', () => {
  let component: InvoiceSearchPopupComponent;
  let fixture: ComponentFixture<InvoiceSearchPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoiceSearchPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceSearchPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
