import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestPriceComponent } from './request-price.component';

describe('RequestPriceComponent', () => {
  let component: RequestPriceComponent;
  let fixture: ComponentFixture<RequestPriceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequestPriceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestPriceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
