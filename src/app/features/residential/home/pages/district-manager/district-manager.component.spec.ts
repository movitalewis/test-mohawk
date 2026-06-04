import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DistrictManagerComponent } from './district-manager.component';

describe('DistrictManagerComponent', () => {
  let component: DistrictManagerComponent;
  let fixture: ComponentFixture<DistrictManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DistrictManagerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DistrictManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
