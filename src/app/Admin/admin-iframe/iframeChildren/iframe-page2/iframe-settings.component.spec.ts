import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IframeSettingsComponent } from './iframe-settings.component';

describe('IframeSettingsComponent', () => {
  let component: IframeSettingsComponent;
  let fixture: ComponentFixture<IframeSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IframeSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IframeSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
