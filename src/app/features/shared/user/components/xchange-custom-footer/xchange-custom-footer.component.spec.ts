import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XchangeCustomFooterComponent } from './xchange-custom-footer.component';

describe('XchangeCustomFooterComponent', () => {
  let component: XchangeCustomFooterComponent;
  let fixture: ComponentFixture<XchangeCustomFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ XchangeCustomFooterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XchangeCustomFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
