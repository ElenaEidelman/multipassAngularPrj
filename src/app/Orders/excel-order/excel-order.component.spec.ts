import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ExcelOrderComponent } from './excel-order.component';

describe('ExcelOrderComponent', () => {
  let component: ExcelOrderComponent;
  let fixture: ComponentFixture<ExcelOrderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ExcelOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExcelOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
