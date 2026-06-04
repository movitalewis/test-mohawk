import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XchangeSwitchButtonComponent } from './xchange-switch-button.component';

describe('XchangeSwitchButtonComponent', () => {
  let component: XchangeSwitchButtonComponent;
  let fixture: ComponentFixture<XchangeSwitchButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ XchangeSwitchButtonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XchangeSwitchButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
