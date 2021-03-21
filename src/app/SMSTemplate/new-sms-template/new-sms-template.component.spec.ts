import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewSmsTemplateComponent } from './new-sms-template.component';

describe('NewSmsTemplateComponent', () => {
  let component: NewSmsTemplateComponent;
  let fixture: ComponentFixture<NewSmsTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewSmsTemplateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewSmsTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
