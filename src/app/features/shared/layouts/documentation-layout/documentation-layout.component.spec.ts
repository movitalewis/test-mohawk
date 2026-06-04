import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentationLayoutComponent } from './documentation-layout.component';

describe('DocumentationLayoutComponent', () => {
  let component: DocumentationLayoutComponent;
  let fixture: ComponentFixture<DocumentationLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocumentationLayoutComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentationLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
