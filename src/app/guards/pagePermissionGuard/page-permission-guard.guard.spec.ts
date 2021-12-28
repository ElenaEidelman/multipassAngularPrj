import { TestBed } from '@angular/core/testing';

import { PagePermissionGuardGuard } from './page-permission-guard.guard';

describe('PagePermissionGuardGuard', () => {
  let guard: PagePermissionGuardGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(PagePermissionGuardGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
