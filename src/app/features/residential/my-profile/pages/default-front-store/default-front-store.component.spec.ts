import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultFrontStoreComponent } from './default-front-store.component';

describe('DefaultFrontStoreComponent', () => {
  let component: DefaultFrontStoreComponent;
  let fixture: ComponentFixture<DefaultFrontStoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DefaultFrontStoreComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DefaultFrontStoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
