import { TestBed } from '@angular/core/testing';

import { CommercialSiteSelectorService } from './commercial-site-selector.service';

describe('CommercialSiteSelectorService', () => {
  let service: CommercialSiteSelectorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommercialSiteSelectorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
