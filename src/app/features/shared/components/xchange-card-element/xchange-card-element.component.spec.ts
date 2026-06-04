import { ComponentFixture, TestBed } from "@angular/core/testing";

import { XchangeCardElementComponent } from "./xchange-card-element.component";

describe("XchangeCardElementComponent", () => {
  let component: XchangeCardElementComponent;
  let fixture: ComponentFixture<XchangeCardElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [XchangeCardElementComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(XchangeCardElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
