import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminNewCardComponent } from './admin-new-card.component';

describe('AdminNewCardComponent', () => {
  let component: AdminNewCardComponent;
  let fixture: ComponentFixture<AdminNewCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminNewCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminNewCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
