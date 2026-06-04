import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ShareViaEmailLightboxComponent } from "./share-via-email-lightbox.component";

describe("ShareViaEmailLightboxComponent", () => {
  let component: ShareViaEmailLightboxComponent;
  let fixture: ComponentFixture<ShareViaEmailLightboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ShareViaEmailLightboxComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ShareViaEmailLightboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
