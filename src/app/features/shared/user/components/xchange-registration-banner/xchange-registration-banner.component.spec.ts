import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XchangeRegistrationBannerComponent } from './xchange-registration-banner.component';

describe('XchangeRegistrationBannerComponent', () => {
  let component: XchangeRegistrationBannerComponent;
  let fixture: ComponentFixture<XchangeRegistrationBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ XchangeRegistrationBannerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XchangeRegistrationBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
