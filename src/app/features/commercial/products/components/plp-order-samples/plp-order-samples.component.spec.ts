import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlpOrderSamplesComponent } from './plp-order-samples.component';

describe('PlpOrderSamplesComponent', () => {
  let component: PlpOrderSamplesComponent;
  let fixture: ComponentFixture<PlpOrderSamplesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlpOrderSamplesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlpOrderSamplesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
