import { TestBed } from '@angular/core/testing';
import { CustomURLSerializer } from './custom-url-serializer';


describe('UrlSerializerService', () => {
  let service: CustomURLSerializer;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomURLSerializer);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
