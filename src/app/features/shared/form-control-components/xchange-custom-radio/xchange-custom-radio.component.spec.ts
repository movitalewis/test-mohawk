import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XchangeCustomRadioComponent } from './xchange-custom-radio.component';

describe('XchangeCustomRadioComponent', () => {
  let component: XchangeCustomRadioComponent;
  let fixture: ComponentFixture<XchangeCustomRadioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ XchangeCustomRadioComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XchangeCustomRadioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
