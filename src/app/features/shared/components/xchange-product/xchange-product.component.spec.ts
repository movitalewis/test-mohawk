import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XchangeProductComponent } from './xchange-product.component';

describe('XchangeProductComponent', () => {
  let component: XchangeProductComponent;
  let fixture: ComponentFixture<XchangeProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ XchangeProductComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XchangeProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
