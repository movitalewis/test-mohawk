import { TestBed } from '@angular/core/testing';

import { DocsMenuService } from './docs-menu.service';

describe('DocsMenuService', () => {
  let service: DocsMenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocsMenuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
