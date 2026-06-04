import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XchangeSgItemImageComponent } from './xchange-sg-item-image.component';

describe('XchangeSgItemImageComponent', () => {
  let component: XchangeSgItemImageComponent;
  let fixture: ComponentFixture<XchangeSgItemImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ XchangeSgItemImageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XchangeSgItemImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
