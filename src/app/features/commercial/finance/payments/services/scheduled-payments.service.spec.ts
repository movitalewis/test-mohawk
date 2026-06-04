import { TestBed } from '@angular/core/testing';

import { ScheduledPaymentsService } from './scheduled-payments.service';

describe('ScheduledPaymentsService', () => {
  let service: ScheduledPaymentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScheduledPaymentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
