import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeDyelotModalComponent } from './change-dyelot-modal.component';

describe('ChangeDyelotModalComponent', () => {
  let component: ChangeDyelotModalComponent;
  let fixture: ComponentFixture<ChangeDyelotModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChangeDyelotModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangeDyelotModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
