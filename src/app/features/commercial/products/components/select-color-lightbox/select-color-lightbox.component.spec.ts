import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectColorLightboxComponent } from './select-color-lightbox.component';

describe('SelectColorLightboxComponent', () => {
  let component: SelectColorLightboxComponent;
  let fixture: ComponentFixture<SelectColorLightboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectColorLightboxComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectColorLightboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
