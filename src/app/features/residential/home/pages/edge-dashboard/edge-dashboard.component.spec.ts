import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EdgeDashboardComponent } from './edge-dashboard.component';

describe('EdgeDashboardComponent', () => {
  let component: EdgeDashboardComponent;
  let fixture: ComponentFixture<EdgeDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EdgeDashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EdgeDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
