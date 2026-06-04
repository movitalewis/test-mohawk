import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XchangeViewAllColorsComponent } from './xchange-view-all-colors.component';

describe('XchangeViewAllColorsComponent', () => {
  let component: XchangeViewAllColorsComponent;
  let fixture: ComponentFixture<XchangeViewAllColorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ XchangeViewAllColorsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XchangeViewAllColorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
