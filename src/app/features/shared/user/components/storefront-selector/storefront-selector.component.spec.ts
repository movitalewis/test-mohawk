import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StorefrontSelectorComponent } from './storefront-selector.component';

describe('StorefrontSelectorComponent', () => {
  let component: StorefrontSelectorComponent;
  let fixture: ComponentFixture<StorefrontSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StorefrontSelectorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StorefrontSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
