import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationPageMTComponent } from './registration-page-MT.component';

describe('RegistrationPageMTComponent', () => {
  let component: RegistrationPageMTComponent;
  let fixture: ComponentFixture<RegistrationPageMTComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegistrationPageMTComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrationPageMTComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
