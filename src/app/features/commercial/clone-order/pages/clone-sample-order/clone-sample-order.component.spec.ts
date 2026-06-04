import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloneSampleOrderComponent } from './clone-sample-order.component';

describe('CloneSampleOrderComponent', () => {
  let component: CloneSampleOrderComponent;
  let fixture: ComponentFixture<CloneSampleOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CloneSampleOrderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CloneSampleOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
