import { TestBed } from '@angular/core/testing';

import { RecentPaymentsService } from './recent-payments.service';

describe('RecentPaymentsService', () => {
  let service: RecentPaymentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecentPaymentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
