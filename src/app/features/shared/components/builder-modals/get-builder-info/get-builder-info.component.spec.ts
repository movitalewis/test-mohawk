import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetBuilderInfoComponent } from './get-builder-info.component';

describe('GetBuilderInfoComponent', () => {
  let component: GetBuilderInfoComponent;
  let fixture: ComponentFixture<GetBuilderInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GetBuilderInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GetBuilderInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
