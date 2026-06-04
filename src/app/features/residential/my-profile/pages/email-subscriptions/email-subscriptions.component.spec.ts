import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailSubscriptionsComponent } from './email-subscriptions.component';

describe('EmailSubscriptionsComponent', () => {
  let component: EmailSubscriptionsComponent;
  let fixture: ComponentFixture<EmailSubscriptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmailSubscriptionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailSubscriptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
