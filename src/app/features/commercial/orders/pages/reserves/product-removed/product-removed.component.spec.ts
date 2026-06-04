import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductRemovedComponent } from './product-removed.component';

describe('ProductRemovedComponent', () => {
  let component: ProductRemovedComponent;
  let fixture: ComponentFixture<ProductRemovedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductRemovedComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductRemovedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
