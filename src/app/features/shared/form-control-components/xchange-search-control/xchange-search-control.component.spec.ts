import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XchangeSearchControlComponent } from './xchange-search-control.component';

describe('XchangeSearchControlComponent', () => {
  let component: XchangeSearchControlComponent;
  let fixture: ComponentFixture<XchangeSearchControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ XchangeSearchControlComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XchangeSearchControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
