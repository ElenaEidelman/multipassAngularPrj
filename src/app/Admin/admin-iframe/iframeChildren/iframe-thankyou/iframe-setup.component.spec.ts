import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IframeSetupComponent } from './iframe-setup.component';

describe('IframeSetupComponent', () => {
  let component: IframeSetupComponent;
  let fixture: ComponentFixture<IframeSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IframeSetupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IframeSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
