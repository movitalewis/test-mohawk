import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesAccountSearchComponent } from './sales-account-search.component';

describe('SalesAccountSearchComponent', () => {
  let component: SalesAccountSearchComponent;
  let fixture: ComponentFixture<SalesAccountSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SalesAccountSearchComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesAccountSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
