import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XchangeSignUpFormComponent } from './xchange-sign-up-form.component';

describe('XchangeSignUpFormComponent', () => {
  let component: XchangeSignUpFormComponent;
  let fixture: ComponentFixture<XchangeSignUpFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ XchangeSignUpFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XchangeSignUpFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
