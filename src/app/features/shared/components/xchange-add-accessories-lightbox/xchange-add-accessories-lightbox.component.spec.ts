import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XchangeAddAccessoriesLightboxComponent } from './xchange-add-accessories-lightbox.component';

describe('XchangeAddAccessoriesLightboxComponent', () => {
  let component: XchangeAddAccessoriesLightboxComponent;
  let fixture: ComponentFixture<XchangeAddAccessoriesLightboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ XchangeAddAccessoriesLightboxComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XchangeAddAccessoriesLightboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
