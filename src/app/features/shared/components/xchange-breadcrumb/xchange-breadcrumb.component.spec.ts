import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XchangeBreadcrumbComponent } from './xchange-breadcrumb.component';

describe('XchangeBreadcrumbComponent', () => {
  let component: XchangeBreadcrumbComponent;
  let fixture: ComponentFixture<XchangeBreadcrumbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ XchangeBreadcrumbComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XchangeBreadcrumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
