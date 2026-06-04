import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtendPopupComponent } from './extend-popup.component';

describe('ExtendPopupComponent', () => {
  let component: ExtendPopupComponent;
  let fixture: ComponentFixture<ExtendPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExtendPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExtendPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
