import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestExpandingTableComponent } from './test-expanding-table.component';

describe('TestExpandingTableComponent', () => {
  let component: TestExpandingTableComponent;
  let fixture: ComponentFixture<TestExpandingTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestExpandingTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestExpandingTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
