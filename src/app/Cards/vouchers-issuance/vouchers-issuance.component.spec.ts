import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VouchersIssuanceComponent } from './vouchers-issuance.component';

describe('VouchersIssuanceComponent', () => {
  let component: VouchersIssuanceComponent;
  let fixture: ComponentFixture<VouchersIssuanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VouchersIssuanceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VouchersIssuanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
