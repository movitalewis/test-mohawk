import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewReserveNameComponent } from './new-reserve-name.component';

describe('NewReserveNameComponent', () => {
  let component: NewReserveNameComponent;
  let fixture: ComponentFixture<NewReserveNameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewReserveNameComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewReserveNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
