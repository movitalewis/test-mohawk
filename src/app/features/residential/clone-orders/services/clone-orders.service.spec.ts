import { TestBed } from '@angular/core/testing';

import { CloneOrdersService } from './clone-orders.service';

describe('CloneOrdersService', () => {
  let service: CloneOrdersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CloneOrdersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
