import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDeductionsComponent } from './view-deductions.component';

describe('ViewDeductionsComponent', () => {
  let component: ViewDeductionsComponent;
  let fixture: ComponentFixture<ViewDeductionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewDeductionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewDeductionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
