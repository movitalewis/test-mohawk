import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XchangeProductFiltersComponent } from './xchange-product-filters.component';

describe('XchangeProductFiltersComponent', () => {
  let component: XchangeProductFiltersComponent;
  let fixture: ComponentFixture<XchangeProductFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ XchangeProductFiltersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XchangeProductFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
