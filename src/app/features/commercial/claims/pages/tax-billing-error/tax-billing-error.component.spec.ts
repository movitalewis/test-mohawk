import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxBillingErrorComponent } from './tax-billing-error.component';

describe('TaxBillingErrorComponent', () => {
  let component: TaxBillingErrorComponent;
  let fixture: ComponentFixture<TaxBillingErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaxBillingErrorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaxBillingErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
