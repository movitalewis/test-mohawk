import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtendItemsPupupComponent } from './extend-items-pupup.component';

describe('ExtendItemsPupupComponent', () => {
  let component: ExtendItemsPupupComponent;
  let fixture: ComponentFixture<ExtendItemsPupupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExtendItemsPupupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExtendItemsPupupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
