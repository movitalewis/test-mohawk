import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XchangeCompareBottomSheetComponent } from './xchange-compare-bottom-sheet.component';

describe('XchangeCompareBottomSheetComponent', () => {
  let component: XchangeCompareBottomSheetComponent;
  let fixture: ComponentFixture<XchangeCompareBottomSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ XchangeCompareBottomSheetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XchangeCompareBottomSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
