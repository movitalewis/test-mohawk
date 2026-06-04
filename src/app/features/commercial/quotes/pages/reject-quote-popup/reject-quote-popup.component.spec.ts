import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectQuotePopupComponent } from './reject-quote-popup.component';

describe('RejectQuotePopupComponent', () => {
  let component: RejectQuotePopupComponent;
  let fixture: ComponentFixture<RejectQuotePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RejectQuotePopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RejectQuotePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
