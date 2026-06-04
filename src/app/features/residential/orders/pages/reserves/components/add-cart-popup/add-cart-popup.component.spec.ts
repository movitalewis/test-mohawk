import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCartPopupComponent } from './add-cart-popup.component';

describe('AddCartPopupComponent', () => {
  let component: AddCartPopupComponent;
  let fixture: ComponentFixture<AddCartPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddCartPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddCartPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
