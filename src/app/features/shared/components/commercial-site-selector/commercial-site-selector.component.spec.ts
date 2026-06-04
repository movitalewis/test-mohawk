import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommercialSiteSelectorComponent } from './commercial-site-selector.component';

describe('CommercialSiteSelectorComponent', () => {
  let component: CommercialSiteSelectorComponent;
  let fixture: ComponentFixture<CommercialSiteSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommercialSiteSelectorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommercialSiteSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
