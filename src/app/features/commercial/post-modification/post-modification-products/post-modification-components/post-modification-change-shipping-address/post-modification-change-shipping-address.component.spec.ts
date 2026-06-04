import { ComponentFixture, TestBed } from "@angular/core/testing";
import { PostModificationChangeShippingAddressComponent } from "./post-modification-change-shipping-address.component";


describe("ChangeShippingAddressComponent", () => {
  let component: PostModificationChangeShippingAddressComponent;
  let fixture: ComponentFixture<PostModificationChangeShippingAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PostModificationChangeShippingAddressComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PostModificationChangeShippingAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
