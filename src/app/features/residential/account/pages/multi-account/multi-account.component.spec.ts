import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiAccountComponent } from './multi-account.component';

describe('MultiAccountComponent', () => {
  let component: MultiAccountComponent;
  let fixture: ComponentFixture<MultiAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultiAccountComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultiAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
