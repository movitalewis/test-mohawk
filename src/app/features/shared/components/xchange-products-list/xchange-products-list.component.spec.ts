import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XchangeProductsListComponent } from './xchange-products-list.component';

describe('XchangeProductsListComponent', () => {
  let component: XchangeProductsListComponent;
  let fixture: ComponentFixture<XchangeProductsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ XchangeProductsListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XchangeProductsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
