import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SvpComponent } from './svp.component';

describe('SvpComponent', () => {
  let component: SvpComponent;
  let fixture: ComponentFixture<SvpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SvpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SvpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
