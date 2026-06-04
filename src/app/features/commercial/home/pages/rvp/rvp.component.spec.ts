import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RvpComponent } from './rvp.component';

describe('RvpComponent', () => {
  let component: RvpComponent;
  let fixture: ComponentFixture<RvpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RvpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RvpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
