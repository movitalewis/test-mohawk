import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceSearchComponent } from './invoice-search.component';

describe('InvoiceSearchComponent', () => {
  let component: InvoiceSearchComponent;
  let fixture: ComponentFixture<InvoiceSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoiceSearchComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
