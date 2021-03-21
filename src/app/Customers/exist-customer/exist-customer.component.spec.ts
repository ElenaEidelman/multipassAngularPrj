import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExistCustomerComponent } from './exist-customer.component';

describe('ExistCustomerComponent', () => {
  let component: ExistCustomerComponent;
  let fixture: ComponentFixture<ExistCustomerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExistCustomerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExistCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
