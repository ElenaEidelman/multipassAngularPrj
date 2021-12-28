import { TestBed } from '@angular/core/testing';

import { IframeSharingServiceService } from './iframe-sharing-service.service';

describe('IframeSharingServiceService', () => {
  let service: IframeSharingServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IframeSharingServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
