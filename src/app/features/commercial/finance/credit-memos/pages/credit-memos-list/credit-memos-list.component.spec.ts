import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditMemoListComponent } from './credit-memos-list.component';

describe('CreditMemoListComponent', () => {
  let component: CreditMemoListComponent;
  let fixture: ComponentFixture<CreditMemoListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreditMemoListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreditMemoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
