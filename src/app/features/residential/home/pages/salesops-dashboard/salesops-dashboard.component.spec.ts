import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesopsDashboardComponent } from './salesops-dashboard.component';

describe('SalesopsDashboardComponent', () => {
  let component: SalesopsDashboardComponent;
  let fixture: ComponentFixture<SalesopsDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SalesopsDashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesopsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
