import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XchangeAddQuoteAccessoriesLightboxComponent } from './xchange-add-quote-accessories-lightbox.component';

describe('XchangeAddQuoteAccessoriesLightboxComponent', () => {
  let component: XchangeAddQuoteAccessoriesLightboxComponent;
  let fixture: ComponentFixture<XchangeAddQuoteAccessoriesLightboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ XchangeAddQuoteAccessoriesLightboxComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XchangeAddQuoteAccessoriesLightboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
