import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XchangeSpecificationsWidgetComponent } from './xchange-specifications-widget.component';

describe('XchangeSpecificationsWidgetComponent', () => {
  let component: XchangeSpecificationsWidgetComponent;
  let fixture: ComponentFixture<XchangeSpecificationsWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ XchangeSpecificationsWidgetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XchangeSpecificationsWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
