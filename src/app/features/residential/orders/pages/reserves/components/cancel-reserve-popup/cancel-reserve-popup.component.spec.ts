import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelReservePopupComponent } from './cancel-reserve-popup.component';

describe('CancelReservePopupComponent', () => {
  let component: CancelReservePopupComponent;
  let fixture: ComponentFixture<CancelReservePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CancelReservePopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CancelReservePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
