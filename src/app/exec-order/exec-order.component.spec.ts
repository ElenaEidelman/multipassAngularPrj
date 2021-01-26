import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ExecOrderComponent } from './exec-order.component';

describe('ExecOrderComponent', () => {
  let component: ExecOrderComponent;
  let fixture: ComponentFixture<ExecOrderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ExecOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExecOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
