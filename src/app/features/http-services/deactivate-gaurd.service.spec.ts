import { TestBed } from '@angular/core/testing';

import { DeactivateGaurdService } from './deactivate-gaurd.service';

describe('DeactivateGaurdService', () => {
  let service: DeactivateGaurdService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeactivateGaurdService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
