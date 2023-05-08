import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingVouchersComponent } from './loading-vouchers.component';

describe('LoadingVouchersComponent', () => {
  let component: LoadingVouchersComponent;
  let fixture: ComponentFixture<LoadingVouchersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoadingVouchersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadingVouchersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
