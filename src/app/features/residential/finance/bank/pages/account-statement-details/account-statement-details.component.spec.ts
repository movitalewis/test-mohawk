import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountStatementDetailsComponent } from './account-statement-details.component';

describe('AccountStatementDetailsComponent', () => {
  let component: AccountStatementDetailsComponent;
  let fixture: ComponentFixture<AccountStatementDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountStatementDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountStatementDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
