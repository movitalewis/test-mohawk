import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuilderDivisionComponent } from './builder-division.component';

describe('BuilderDivisionComponent', () => {
  let component: BuilderDivisionComponent;
  let fixture: ComponentFixture<BuilderDivisionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BuilderDivisionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuilderDivisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
