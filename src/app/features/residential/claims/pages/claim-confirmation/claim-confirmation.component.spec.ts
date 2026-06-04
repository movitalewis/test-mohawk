import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimConfirmationComponent } from './claim-confirmation.component';

describe('ClaimConfirmationComponent', () => {
  let component: ClaimConfirmationComponent;
  let fixture: ComponentFixture<ClaimConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClaimConfirmationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
