import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntitlementManagerComponent } from './entitlement-manager.component';

describe('EntitlementManagerComponent', () => {
  let component: EntitlementManagerComponent;
  let fixture: ComponentFixture<EntitlementManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EntitlementManagerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntitlementManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
