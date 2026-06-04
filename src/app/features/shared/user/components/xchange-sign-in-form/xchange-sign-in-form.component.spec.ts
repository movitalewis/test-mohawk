import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XchangeSignInFormComponent } from './xchange-sign-in-form.component';

describe('XchangeSignInFormComponent', () => {
  let component: XchangeSignInFormComponent;
  let fixture: ComponentFixture<XchangeSignInFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ XchangeSignInFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XchangeSignInFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
