import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PotentialMatchesQuotesComponent } from './potential-matches-quotes.component';

describe('PotentialMatchesQuotesComponent', () => {
  let component: PotentialMatchesQuotesComponent;
  let fixture: ComponentFixture<PotentialMatchesQuotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PotentialMatchesQuotesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PotentialMatchesQuotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
