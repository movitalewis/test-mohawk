import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartAccessoriesComponent } from './cart-accessories.component';

describe('CartAccessoriesComponent', () => {
  let component: CartAccessoriesComponent;
  let fixture: ComponentFixture<CartAccessoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CartAccessoriesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CartAccessoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
