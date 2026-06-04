import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialGoodsListComponent } from './special-goods-list.component';

describe('SpecialGoodsListComponent', () => {
  let component: SpecialGoodsListComponent;
  let fixture: ComponentFixture<SpecialGoodsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpecialGoodsListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpecialGoodsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
