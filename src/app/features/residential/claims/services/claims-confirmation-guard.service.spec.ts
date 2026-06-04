import { TestBed } from '@angular/core/testing';

import { ClaimsConfirmationGuardService } from './claims-confirmation-guard.service';

describe('ClaimsConfirmationGuardService', () => {
  let service: ClaimsConfirmationGuardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClaimsConfirmationGuardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
