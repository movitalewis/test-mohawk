import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XchangeCustomCheckboxComponent } from './xchange-custom-checkbox.component';

describe('XchangeCustomCheckboxComponent', () => {
  let component: XchangeCustomCheckboxComponent;
  let fixture: ComponentFixture<XchangeCustomCheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ XchangeCustomCheckboxComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XchangeCustomCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
