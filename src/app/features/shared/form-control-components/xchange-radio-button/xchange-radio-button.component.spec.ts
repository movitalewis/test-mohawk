import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XchangeRadioButtonComponent } from './xchange-radio-button.component';

describe('XchangeRadioButtonComponent', () => {
  let component: XchangeRadioButtonComponent;
  let fixture: ComponentFixture<XchangeRadioButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ XchangeRadioButtonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XchangeRadioButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
