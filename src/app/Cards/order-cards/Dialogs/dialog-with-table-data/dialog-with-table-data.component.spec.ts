import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogWithTableDataComponent } from './dialog-with-table-data.component';

describe('DialogWithTableDataComponent', () => {
  let component: DialogWithTableDataComponent;
  let fixture: ComponentFixture<DialogWithTableDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogWithTableDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogWithTableDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
