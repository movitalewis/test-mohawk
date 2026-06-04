import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimUninstalled } from './claim-uninstalled';

describe('ClaimUninstalled', () => {
  let component: ClaimUninstalled;
  let fixture: ComponentFixture<ClaimUninstalled>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClaimUninstalled]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimUninstalled);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
