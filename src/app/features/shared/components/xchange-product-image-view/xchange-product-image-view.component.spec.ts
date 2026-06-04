import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XchangeProductImageViewComponent } from './xchange-product-image-view.component';

describe('XchangeProductImageViewComponent', () => {
  let component: XchangeProductImageViewComponent;
  let fixture: ComponentFixture<XchangeProductImageViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ XchangeProductImageViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XchangeProductImageViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
