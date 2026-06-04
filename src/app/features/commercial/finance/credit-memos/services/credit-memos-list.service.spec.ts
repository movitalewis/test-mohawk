import { TestBed } from '@angular/core/testing';

import { CreditMemoListService } from './credit-memos-list.service';

describe('CreditMemoListService', () => {
  let service: CreditMemoListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreditMemoListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});