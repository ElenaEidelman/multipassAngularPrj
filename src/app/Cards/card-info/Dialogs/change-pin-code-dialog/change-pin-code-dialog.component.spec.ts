import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangePinCodeDialogComponent } from './change-pin-code-dialog.component';

describe('ChangePinCodeDialogComponent', () => {
  let component: ChangePinCodeDialogComponent;
  let fixture: ComponentFixture<ChangePinCodeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChangePinCodeDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangePinCodeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
