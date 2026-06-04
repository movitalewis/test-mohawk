import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectInvoiceLineComponent } from './select-invoice-line.component';

describe('SelectInvoiceLineComponent', () => {
  let component: SelectInvoiceLineComponent;
  let fixture: ComponentFixture<SelectInvoiceLineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectInvoiceLineComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectInvoiceLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
