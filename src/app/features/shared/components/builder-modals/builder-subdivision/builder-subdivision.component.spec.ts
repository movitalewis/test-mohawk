import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuilderSubdivisionComponent } from './builder-subdivision.component';

describe('BuilderSubdivisionComponent', () => {
  let component: BuilderSubdivisionComponent;
  let fixture: ComponentFixture<BuilderSubdivisionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BuilderSubdivisionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuilderSubdivisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
