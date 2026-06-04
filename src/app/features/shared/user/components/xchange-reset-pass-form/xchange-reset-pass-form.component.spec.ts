import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XchangeResetPassFormComponent } from './xchange-reset-pass-form.component';

describe('XchangeResetPassFormComponent', () => {
  let component: XchangeResetPassFormComponent;
  let fixture: ComponentFixture<XchangeResetPassFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ XchangeResetPassFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XchangeResetPassFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
