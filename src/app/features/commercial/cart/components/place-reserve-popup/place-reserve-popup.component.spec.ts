import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaceReservePopupComponent } from './place-reserve-popup.component';

describe('PlaceReservePopupComponent', () => {
  let component: PlaceReservePopupComponent;
  let fixture: ComponentFixture<PlaceReservePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlaceReservePopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaceReservePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
