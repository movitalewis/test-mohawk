import { TestBed } from '@angular/core/testing';


import { InvoiceListService } from './invoice-list.service';


describe('InvoiceListService', () => {

  let service: InvoiceListService;


  beforeEach(() => {

    TestBed.configureTestingModule({});

    service = TestBed.inject(InvoiceListService);

  });


  it('should be created', () => {

    expect(service).toBeTruthy();

  });

});