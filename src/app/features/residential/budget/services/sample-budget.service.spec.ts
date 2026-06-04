import { TestBed } from '@angular/core/testing';

import { SampleBudgetService } from './sample-budget.service';

describe('SampleBudgetService', () => {
  let service: SampleBudgetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SampleBudgetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
