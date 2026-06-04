import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimApprovalDetailsComponent } from './claim-approval-details.component';

describe('ClaimApprovalDetailsComponent', () => {
  let component: ClaimApprovalDetailsComponent;
  let fixture: ComponentFixture<ClaimApprovalDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClaimApprovalDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimApprovalDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
