import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesOpsComponent } from './sales-ops.component';

describe('SalesOpsComponent', () => {
  let component: SalesOpsComponent;
  let fixture: ComponentFixture<SalesOpsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SalesOpsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesOpsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
