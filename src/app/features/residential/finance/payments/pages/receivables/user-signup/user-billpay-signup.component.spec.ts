import { ComponentFixture, TestBed } from '@angular/core/testing';

import {  UserBillpaySignUpComponent } from './user-billpay-signup';

describe('UserBillpaySignUp', () => {
  let component: UserBillpaySignUpComponent;
  let fixture: ComponentFixture<UserBillpaySignUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserBillpaySignUpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserBillpaySignUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
