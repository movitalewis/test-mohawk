import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloneOrdersComponent } from './clone-orders.component';

describe('CloneOrdersComponent', () => {
  let component: CloneOrdersComponent;
  let fixture: ComponentFixture<CloneOrdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CloneOrdersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CloneOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
