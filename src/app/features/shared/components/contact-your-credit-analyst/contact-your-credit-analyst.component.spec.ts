import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactYourCreditAnalystComponent } from './contact-your-credit-analyst.component';

describe('ContactYourCreditAnalystComponent', () => {
  let component: ContactYourCreditAnalystComponent;
  let fixture: ComponentFixture<ContactYourCreditAnalystComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContactYourCreditAnalystComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactYourCreditAnalystComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
