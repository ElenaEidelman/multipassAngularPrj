import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DigitalFilesListComponent } from './digital-files-list.component';

describe('DigitalFilesListComponent', () => {
  let component: DigitalFilesListComponent;
  let fixture: ComponentFixture<DigitalFilesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DigitalFilesListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DigitalFilesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
