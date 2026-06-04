import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XchangePlaceReservePopupComponent } from './xchange-place-reserve-popup.component';

describe('XchangePlaceReservePopupComponent', () => {
  let component: XchangePlaceReservePopupComponent;
  let fixture: ComponentFixture<XchangePlaceReservePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ XchangePlaceReservePopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XchangePlaceReservePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
