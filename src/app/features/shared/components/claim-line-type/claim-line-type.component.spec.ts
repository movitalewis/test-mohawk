import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { BsModalService } from "ngx-bootstrap/modal";
import { ClaimLineTypeComponent } from "./claim-line-type.component";

class MockBsModalService {
  config: any = { initialState: undefined };
  hide = jasmine.createSpy("hide");
}

describe("ClaimLineTypeComponent", () => {
  let fixture: ComponentFixture<ClaimLineTypeComponent>;
  let component: ClaimLineTypeComponent;
  let modalService: MockBsModalService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClaimLineTypeComponent],
      providers: [{ provide: BsModalService, useClass: MockBsModalService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ClaimLineTypeComponent);
    component = fixture.componentInstance;
    modalService = TestBed.inject(BsModalService) as any;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should have correct default properties", () => {
    expect(component.addInvoiceLine).toBeFalse();
    expect(component.initialData).toBeUndefined();
    expect(component.claimLineTypes.length).toBe(2);
    expect(component.selectedSite).toBe("");
    expect(typeof component.onPrimaryAction).toBe("function");
  });

  it("ngOnInit sets initialData and addInvoiceLine when isAllSelected is true", () => {
    modalService.config.initialState = { isAllSelected: true, foo: "bar" };
    component.ngOnInit();
    expect(component.initialData).toBe(modalService.config.initialState);
    expect(component.addInvoiceLine).toBeTrue();
  });

  it("ngOnInit sets addInvoiceLine to false when initialState is falsy", () => {
    modalService.config.initialState = undefined;
    component.ngOnInit();
    expect(component.initialData).toBeUndefined();
    expect(component.addInvoiceLine).toBeFalse();
  });

  it("onHideModal calls modalService.hide with component id", () => {
    modalService.hide.calls.reset();
    component.onHideModal();
    expect(modalService.hide).toHaveBeenCalledWith("claimLineTypeComponent");
  });

  it("changeSite updates selectedSite", () => {
    component.changeSite(null, "2");
    expect(component.selectedSite).toBe("2");
    component.changeSite({ target: {} }, "1");
    expect(component.selectedSite).toBe("1");
  });

  it("handleAction calls onPrimaryAction with selectedSite and hides modal", () => {
    modalService.hide.calls.reset();
    const spyAction = jasmine.createSpy("onPrimaryAction");
    component.onPrimaryAction = spyAction;
    component.selectedSite = "42";
    component.handleAction();
    expect(spyAction).toHaveBeenCalledWith("42");
    expect(modalService.hide).toHaveBeenCalledWith("claimLineTypeComponent");
  });

  it("handleAction still hides modal when onPrimaryAction is default/no-op", () => {
    modalService.hide.calls.reset();
    component.selectedSite = "x";
    // use default onPrimaryAction (no-op)
    component.handleAction();
    expect(modalService.hide).toHaveBeenCalledWith("claimLineTypeComponent");
  });
});
