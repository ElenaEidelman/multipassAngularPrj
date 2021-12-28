import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PurchasingGiftComponent } from './purchasing-gift.component';

describe('PurchasingGiftComponent', () => {
  let component: PurchasingGiftComponent;
  let fixture: ComponentFixture<PurchasingGiftComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchasingGiftComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchasingGiftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
