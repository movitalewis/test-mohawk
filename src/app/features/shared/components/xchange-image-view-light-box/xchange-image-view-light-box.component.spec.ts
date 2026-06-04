import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XchangeImageViewLightBoxComponent } from './xchange-image-view-light-box.component';

describe('XchangeImageViewLightBoxComponent', () => {
  let component: XchangeImageViewLightBoxComponent;
  let fixture: ComponentFixture<XchangeImageViewLightBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ XchangeImageViewLightBoxComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XchangeImageViewLightBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
