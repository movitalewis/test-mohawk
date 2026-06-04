import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XchangeSpecialGoodsFiltersComponent } from './xchange-special-goods-filters.component';

describe('XchangeSpecialGoodsFiltersComponent', () => {
  let component: XchangeSpecialGoodsFiltersComponent;
  let fixture: ComponentFixture<XchangeSpecialGoodsFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ XchangeSpecialGoodsFiltersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XchangeSpecialGoodsFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
