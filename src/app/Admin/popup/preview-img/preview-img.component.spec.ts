import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewIMGComponent } from './preview-img.component';

describe('PreviewIMGComponent', () => {
  let component: PreviewIMGComponent;
  let fixture: ComponentFixture<PreviewIMGComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreviewIMGComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewIMGComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
