import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FreightClaimComponent } from './freight-claim.component';

describe('FreightClaimComponent', () => {
  let component: FreightClaimComponent;
  let fixture: ComponentFixture<FreightClaimComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FreightClaimComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FreightClaimComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
