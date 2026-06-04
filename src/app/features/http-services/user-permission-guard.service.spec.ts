import { TestBed } from '@angular/core/testing';

import { UserPermissionGuardService } from './user-permission-guard.service';

describe('UserPermissionGuardService', () => {
  let service: UserPermissionGuardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserPermissionGuardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
