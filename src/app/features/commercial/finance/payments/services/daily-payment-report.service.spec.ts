import { TestBed } from '@angular/core/testing';

import { DailyPaymentReportService } from './daily-payment-report.service';

describe('DailyPaymentReportService', () => {
  let service: DailyPaymentReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DailyPaymentReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
