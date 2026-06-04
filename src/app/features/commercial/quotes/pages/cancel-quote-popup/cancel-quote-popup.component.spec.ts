import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelQuotePopupComponent } from './cancel-quote-popup.component';

describe('CancelQuotePopupComponent', () => {
  let component: CancelQuotePopupComponent;
  let fixture: ComponentFixture<CancelQuotePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CancelQuotePopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CancelQuotePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
