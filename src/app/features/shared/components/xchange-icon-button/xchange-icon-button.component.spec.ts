import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XchangeIconButtonComponent } from './xchange-icon-button.component';

describe('XchangeIconButtonComponent', () => {
  let component: XchangeIconButtonComponent;
  let fixture: ComponentFixture<XchangeIconButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ XchangeIconButtonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XchangeIconButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
