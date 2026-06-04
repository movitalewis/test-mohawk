import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesPersonDashboardComponent } from './sales-person-dashboard.component';

describe('SalesPersonDashboardComponent', () => {
  let component: SalesPersonDashboardComponent;
  let fixture: ComponentFixture<SalesPersonDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SalesPersonDashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesPersonDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
