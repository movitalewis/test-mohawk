import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterOptionsPageComponent } from './register-options-page.component';

describe('RegisterOptionsPageComponent', () => {
  let component: RegisterOptionsPageComponent;
  let fixture: ComponentFixture<RegisterOptionsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegisterOptionsPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterOptionsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
