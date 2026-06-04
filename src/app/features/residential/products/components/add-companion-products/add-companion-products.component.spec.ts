import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AddCompanionProductsComponent } from "./add-companion-products.component";

describe("AddCompanionProductsComponent", () => {
  let component: AddCompanionProductsComponent;
  let fixture: ComponentFixture<AddCompanionProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddCompanionProductsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddCompanionProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
