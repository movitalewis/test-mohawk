import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyProfileLayoutComponent } from './my-profile-layout.component';

describe('MyProfileLayoutComponent', () => {
  let component: MyProfileLayoutComponent;
  let fixture: ComponentFixture<MyProfileLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyProfileLayoutComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyProfileLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
