import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EarningStatementsComponent } from './earning-statements.component';

describe('EarningStatementsComponent', () => {
  let component: EarningStatementsComponent;
  let fixture: ComponentFixture<EarningStatementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EarningStatementsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EarningStatementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
