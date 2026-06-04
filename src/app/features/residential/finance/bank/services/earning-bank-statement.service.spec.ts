import { TestBed } from '@angular/core/testing';

import { EarningBankStatementService } from './earning-bank-statement.service';

describe('EarningBankStatementService', () => {
  let service: EarningBankStatementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EarningBankStatementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
