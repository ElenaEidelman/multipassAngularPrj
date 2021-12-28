import { TestBed } from '@angular/core/testing';

import { IframeSeviceService } from './iframe-sevice.service';

describe('IframeSeviceService', () => {
  let service: IframeSeviceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IframeSeviceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
