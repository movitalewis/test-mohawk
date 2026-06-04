import { TestBed } from '@angular/core/testing';

import { MakeAPaymentGaurdService } from './make-a-payment-gaurd.service';

describe('MakeAPaymentGaurdService', () => {
  let service: MakeAPaymentGaurdService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MakeAPaymentGaurdService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
