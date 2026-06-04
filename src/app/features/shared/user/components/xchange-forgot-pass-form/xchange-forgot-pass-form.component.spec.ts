import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XchangeForgotPassFormComponent } from './xchange-forgot-pass-form.component';

describe('XchangeForgotPassFormComponent', () => {
  let component: XchangeForgotPassFormComponent;
  let fixture: ComponentFixture<XchangeForgotPassFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ XchangeForgotPassFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XchangeForgotPassFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
