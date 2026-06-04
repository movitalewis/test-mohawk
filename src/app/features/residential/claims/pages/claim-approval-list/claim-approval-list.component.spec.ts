import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimApprovalListComponent } from './claim-approval-list.component';

describe('ClaimApprovalListComponent', () => {
  let component: ClaimApprovalListComponent;
  let fixture: ComponentFixture<ClaimApprovalListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClaimApprovalListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimApprovalListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
