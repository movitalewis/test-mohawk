import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XchangeHomeSearchComponent } from './xchange-home-search.component';

describe('XchangeHomeSearchComponent', () => {
  let component: XchangeHomeSearchComponent;
  let fixture: ComponentFixture<XchangeHomeSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ XchangeHomeSearchComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XchangeHomeSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
