import { TestBed } from '@angular/core/testing';

import { EntitlementManagerService } from './entitlement-manager.service';

describe('EntitlementManagerService', () => {
  let service: EntitlementManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EntitlementManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
