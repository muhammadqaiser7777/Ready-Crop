import { TestBed } from '@angular/core/testing';

import { BackEndServiceService } from './back-end-service.service';

describe('BackEndServiceService', () => {
  let service: BackEndServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BackEndServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
