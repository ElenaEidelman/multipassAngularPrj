import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExistUserComponent } from './exist-user.component';

describe('ExistUserComponent', () => {
  let component: ExistUserComponent;
  let fixture: ComponentFixture<ExistUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExistUserComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExistUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
