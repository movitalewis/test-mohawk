import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuanityChangePopupComponent } from './quanity-change-popup.component';

describe('QuanityChangePopupComponent', () => {
  let component: QuanityChangePopupComponent;
  let fixture: ComponentFixture<QuanityChangePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuanityChangePopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuanityChangePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
