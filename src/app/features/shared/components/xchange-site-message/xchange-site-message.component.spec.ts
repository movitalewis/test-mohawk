import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XchangeSiteMessageComponent } from './xchange-site-message.component';

describe('XchangeSiteMessageComponent', () => {
  let component: XchangeSiteMessageComponent;
  let fixture: ComponentFixture<XchangeSiteMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ XchangeSiteMessageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XchangeSiteMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
