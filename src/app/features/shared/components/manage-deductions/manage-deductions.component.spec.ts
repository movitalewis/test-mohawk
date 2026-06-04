import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XchangeManageDeductionsComponent } from './manage-deductions.component';

describe('XchangeManageDeductionsComponent', () => {
  let component: XchangeManageDeductionsComponent;
  let fixture: ComponentFixture<XchangeManageDeductionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [XchangeManageDeductionsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(XchangeManageDeductionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
