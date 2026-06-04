import { TestBed } from '@angular/core/testing';

import { MenuConfigService } from './menu-config.service';

describe('MenuConfigService', () => {
  let service: MenuConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MenuConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
