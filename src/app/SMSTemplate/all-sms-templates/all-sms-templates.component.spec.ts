import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllSmsTemplatesComponent } from './all-sms-templates.component';

describe('AllSmsTemplatesComponent', () => {
  let component: AllSmsTemplatesComponent;
  let fixture: ComponentFixture<AllSmsTemplatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllSmsTemplatesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AllSmsTemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
