import { TestBed } from '@angular/core/testing';

import { UrlSharingService } from './url-sharing.service';

describe('UrlSharingService', () => {
  let service: UrlSharingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UrlSharingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
