import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XchangeBrowserAlertComponent } from './xchange-browser-alert.component';

describe('XchangeBrowserAlertComponent', () => {
  let component: XchangeBrowserAlertComponent;
  let fixture: ComponentFixture<XchangeBrowserAlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ XchangeBrowserAlertComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XchangeBrowserAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
