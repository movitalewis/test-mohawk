import { ComponentFixture, TestBed } from "@angular/core/testing";
import { PostModificationAddCompanionProductsComponent } from "./post-modification-add-companion-products.component";


describe("AddCompanionProductsComponent", () => {
  let component: PostModificationAddCompanionProductsComponent;
  let fixture: ComponentFixture<PostModificationAddCompanionProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PostModificationAddCompanionProductsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PostModificationAddCompanionProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
