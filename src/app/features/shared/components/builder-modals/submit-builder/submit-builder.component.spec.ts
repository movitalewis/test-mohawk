import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitBuilderComponent } from './submit-builder.component';

describe('SubmitBuilderComponent', () => {
  let component: SubmitBuilderComponent;
  let fixture: ComponentFixture<SubmitBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubmitBuilderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmitBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
