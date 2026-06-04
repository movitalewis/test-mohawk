import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewLineComponent } from './add-new-line.component';

describe('AddNewLineComponent', () => {
  let component: AddNewLineComponent;
  let fixture: ComponentFixture<AddNewLineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddNewLineComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddNewLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
