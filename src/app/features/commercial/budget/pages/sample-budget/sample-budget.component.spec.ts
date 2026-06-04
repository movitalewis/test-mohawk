import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SampleBudgetComponent } from './sample-budget.component';

describe('SampleBudgetComponent', () => {
  let component: SampleBudgetComponent;
  let fixture: ComponentFixture<SampleBudgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SampleBudgetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SampleBudgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
