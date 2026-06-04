import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CsrListAccountsComponent } from './csr-list-accounts.component';

describe('CsrListAccountsComponent', () => {
  let component: CsrListAccountsComponent;
  let fixture: ComponentFixture<CsrListAccountsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CsrListAccountsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CsrListAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
