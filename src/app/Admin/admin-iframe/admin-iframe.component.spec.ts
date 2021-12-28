import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminIframeComponent } from './admin-iframe.component';

describe('AdminIframeComponent', () => {
  let component: AdminIframeComponent;
  let fixture: ComponentFixture<AdminIframeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminIframeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminIframeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
