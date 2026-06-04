import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from "@angular/core/testing";
import { LaborClaimComponent } from "./labor-claim.component";
import { of, throwError } from "rxjs";
import { FormBuilder } from "@angular/forms";
import { DatePipe, DOCUMENT } from "@angular/common";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ClaimsService } from "../../services/claims.service";
import { CLAIM_PATH_NAMES } from "src/app/features/shared/constants/CLAIMS-CONSTANTS";
import { BsModalService } from "ngx-bootstrap/modal";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { StorageService } from "src/app/features/http-services/storage.service";
import { ProductService } from "../../../products/pages/services/product.service";
import { ActivatedRoute } from "@angular/router";
class MockClaimsService {
  selectedProductLines = of([]);
  selectedInvoiceLines: any = {
    line: [],
    claimNumber: undefined,
    claimData: { claimStatus: "DRAFT" },
    invoiceNumber: false,
  };
  getClaimsHistory(_payload: any, _a: any, _b: any) {
    return of({ body: { claimsData: [{ claimNumber: "C1" }] } });
  }
  getClaimsDetails(_q: any, _o: any) {
    return of({ body: {} });
  }
  uploadFile(event: any, ctx: any) {
    ctx.filesArray.push({ name: "file" });
  }
  postImage(_files: any, _url: string) {
    return of({ claimNumber: "123" });
  }
  updateClaim(_payload: any) {
    return of({ body: { claimNumber: "123" } });
  }
  createLaborClaim(_payload: any) {
    return of({ body: { claimNumber: "123" } });
  }
}

class MockModalService {
  show() {
    return {} as any;
  }
}
class MockUserService {
  progressShow(_s?: any) {}
  progressHide() {}
  scrollToTop() {}
  getCurrentUserDetail() {
    return of({});
  }
}
class MockStorageService {
  setItem() {}
}
class MockProductService {
  validateAddress(_p: any) {
    return of({ d: { EvStatus: "S", EvMessage: "ok" } });
  }
}
describe("LaborClaimComponent", () => {
  let component: LaborClaimComponent;
  let fixture: ComponentFixture<LaborClaimComponent>;
  let mockClaims: MockClaimsService;

  beforeEach(async () => {
    mockClaims = new MockClaimsService();

    await TestBed.configureTestingModule({
      declarations: [LaborClaimComponent],
      providers: [
        { provide: ClaimsService, useValue: mockClaims },
        { provide: BsModalService, useValue: new MockModalService() },
        { provide: UserService, useValue: new MockUserService() },
        { provide: StorageService, useValue: new MockStorageService() },
        { provide: ProductService, useValue: new MockProductService() },
        FormBuilder,
        DatePipe,
        { provide: DOCUMENT, useValue: document },
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(LaborClaimComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it("should create", () => {
    expect(component).toBeTruthy();
  });
  it("onSearch should set searchText and call getClaimsHistory", () => {
    spyOn(component, "getClaimsHistory");
    component.onSearch("  abc  ");
    expect(component.searchText).toBe("abc");
    expect(component.getClaimsHistory).toHaveBeenCalled();
  });
  it("getClaimsHistory should populate claimData and hide spinner", fakeAsync(() => {
    spyOn(mockClaims, "getClaimsHistory").and.callThrough();
    component.searchText = "C1";
    component.getClaimsHistory();
    expect(component.showSpinner).toBeTrue();
    tick(1000);
    expect(mockClaims.getClaimsHistory).toHaveBeenCalled();
    expect(component.claimData.length).toBeGreaterThan(0);
    expect(component.showSpinner).toBeFalse();
  }));

  it("suggestionClick should set selectedSuggestion", () => {
    component.suggestionClick({ claimNumber: "X" });
    expect(component.selectedSuggestion.claimNumber).toBe("X");
  });

  it("changeEventClaim should update replacedWithMohawkMaterial and validators", () => {
    component.ngOnInit();
    component.newClaimForm.controls["mohawkReplacementOrder"].setValue("");
    component.changeEventClaim(null, "yes");
    expect(component.newClaimForm.value.replacedWithMohawkMaterial).toBeTrue();
    expect(
      component.newClaimForm.controls["mohawkReplacementOrder"].invalid
    ).toBeTrue();
  });

  it("completeLaborInfo sets laborFlag when required fields valid", () => {
    component.ngOnInit();
    component.newClaimForm.controls["mohawkReplacementOrder"].setValue("ORD1");
    component.newClaimForm.controls["replacedWithMohawkMaterial"].setValue(
      true
    );
    component.newClaimForm.controls["totalSqFtReplaced"].setValue(10);
    component.newClaimForm.controls["totalLaborRequested"].setValue(100);
    component.completeLaborInfo();
    expect(component.laborFlag).toBeTrue();
  });

  it("setLaborValues sets values on form", () => {
    component.ngOnInit();
    component.setLaborValues({
      replacedWithMhk: true,
      replacementOrderNumber: "R1",
      amountProductAffected: 5,
      claimAmount: 50,
    });
    expect(component.newClaimForm.value.mohawkReplacementOrder).toBe("R1");
    expect(component.newClaimForm.value.totalSqFtReplaced).toBe(5);
  });

  it("setConsumerValues sets and disables controls", () => {
    component.ngOnInit();
    const data: any = {
      projectSiteName: "Site",
      consumerName: "John",
      consumerPhone: "123",
      consumerPhoneExtn: "1",
      consumerEmail: "a@b.com",
      consumeraddressOne: "Addr1",
      consumeraddressTwo: "Addr2",
      consumerCity: "C",
      consumerCountry: "US",
      consumerState: "NY",
      consumerZip: "10001",
    };
    component.setConsumerValues(data);
    expect(component.newClaimForm.controls["consumerName"].disabled).toBeTrue();
    expect(component.newClaimForm.getRawValue().consumerName).toBe("John");
  });

  it("onlyNumberKey allows digits and blocks letters", () => {
    const evAllow: any = {
      key: "1",
      target: { value: "" },
      preventDefault: jasmine.createSpy("pd"),
    };
    component.onlyNumberKey(evAllow);
    expect(evAllow.preventDefault).not.toHaveBeenCalled();

    const evBlock: any = {
      key: "a",
      target: { value: "" },
      preventDefault: jasmine.createSpy("pd"),
    };
    component.onlyNumberKey(evBlock);
    expect(evBlock.preventDefault).toHaveBeenCalled();
  });
  it("formatDecimal formats values correctly", () => {
    const ev: any = { target: { value: "." } };
    component.formatDecimal(ev);
    expect(ev.target.value).toBe("0.");

    const ev2: any = { target: { value: "12.3456abc" } };
    component.formatDecimal(ev2);
    expect(ev2.target.value).toBe("12.34");
  });

  it("removeFile removes file from filesArray", () => {
    component.filesArray = ["a", "b", "c"];
    component.removeFile(1);
    expect(component.filesArray.length).toBe(2);
  });

  it("uploadFile should set inputUpload and call claimsService.uploadFile", () => {
    const inputEl: any = document.createElement("input");
    const event = { files: [{ name: "f1" }] } as any;

    spyOn(mockClaims, "uploadFile").and.callThrough();

    component.uploadFile(event, inputEl);

    expect(component.inputUpload).toBe(inputEl);
    expect(mockClaims.uploadFile).toHaveBeenCalledWith(event, component);
    // MockClaimsService.uploadFile pushes into filesArray
    expect(component.filesArray.length).toBeGreaterThan(0);
  });

  it("uploadFile forwards event to claimsService without throwing when no files", () => {
    const inputEl: any = document.createElement("input");
    const event = {} as any;
    spyOn(mockClaims, "uploadFile").and.callThrough();

    expect(() => component.uploadFile(event, inputEl)).not.toThrow();
    expect(component.inputUpload).toBe(inputEl);
    expect(mockClaims.uploadFile).toHaveBeenCalledWith(event, component);
  });
  it("onDeactivate returns true when form dirty or files exist", () => {
    component.newClaimForm.markAsDirty();
    expect(component.onDeactivate()).toBeTrue();
    component.newClaimForm.markAsPristine();
    component.filesArray = [1];
    expect(component.onDeactivate()).toBeTrue();
    component.filesArray = [];
    expect(component.onDeactivate()).toBeFalse();
  });
  it("getPhoneNumber returns last 10 digits or empty", () => {
    expect(component.getPhoneNumber("abc1234567890123")).toBe(
      "34567890123".slice(-10)
    );
    expect(component.getPhoneNumber("")).toBe("");
  });

  it("convertToUsPhoneFormat formats correctly", () => {
    expect(component.convertToUsPhoneFormat("1234567890")).toBe(
      "(123) 456 7890"
    );
    expect(component.convertToUsPhoneFormat("")).toBe("");
  });

  it("removeChar removes first occurrence", () => {
    expect(component.removeChar("a b c", " ")).toBe("ab c");
    expect(component.removeChar("abc", "x")).toBe("abc");
  });

  it("disableDraftBtn returns true when non-required validation errors exist", () => {
    component.ngOnInit();
    component.newClaimForm.controls["consumerEmail"].setValue("invalid-email");
    component.newClaimForm.controls["consumerEmail"].markAsTouched();
    expect(component.disableDraftBtn()).toBeTrue();
  });

  it("avoidSpace returns false for space key", () => {
    expect(component.avoidSpace({ keyCode: 32 })).toBeFalse();
    expect(component.avoidSpace({ keyCode: 65 })).toBeUndefined();
  });

  it("checkClaimType maps claimDetails.claimType to internal path and sets flags", () => {
    const cases: Array<{ input: string; expected: string }> = [
      { input: "Freight Billing Error", expected: CLAIM_PATH_NAMES.FREIGHT },
      { input: "Pricing Billing Error", expected: CLAIM_PATH_NAMES.PRICING },
      {
        input: "Assurance Warranty Claim",
        expected: CLAIM_PATH_NAMES.CUSTOMER_SATISFACTION,
      },
      {
        input: "Order Error Claim",
        expected: CLAIM_PATH_NAMES.MOHAWK_ORDER_ERROR,
      },
    ];

    cases.forEach((c) => {
      component.claimDetails = { claimType: c.input } as any;
      component.claimNumberSelcted = false;
      component.columns = [];
      component.checkClaimType();
      expect(component.claimType).toBe(c.expected);
      expect(component.claimNumberSelcted).toBeTrue();
      expect(component.columns.length).toBeGreaterThan(0);
    });
  });

  it("checkClaimType covers additional mappings (tax, defective, wrong, damage, quantity, cancellation)", () => {
    const more: Array<{ input: string; expected: string }> = [
      { input: "Tax Billing Error", expected: CLAIM_PATH_NAMES.TAX },
      {
        input: "Accommodation Return",
        expected: CLAIM_PATH_NAMES.ACCOMMODATION_RETURN,
      },
      {
        input: "Defective Product Claim",
        expected: CLAIM_PATH_NAMES.DEFECTIVE_PRODUCT,
      },
      {
        input: "Wrong Product Claim",
        expected: CLAIM_PATH_NAMES.WRONG_PRODUCT,
      },
      { input: "Damage Claim", expected: CLAIM_PATH_NAMES.DAMAGED },
      {
        input: "Quantity Claim",
        expected: CLAIM_PATH_NAMES.WRONG_QUANTITY_SHORTAGE,
      },
      {
        input: "Cancellation Fees",
        expected: CLAIM_PATH_NAMES.CANCELLATION_FEE,
      },
    ];

    more.forEach((m) => {
      component.claimDetails = { claimType: m.input } as any;
      component.claimNumberSelcted = false;
      component.columns = [];
      component.checkClaimType();
      expect(component.claimType).toBe(m.expected);
      expect(component.claimNumberSelcted).toBeTrue();
      expect(component.columns.length).toBeGreaterThan(0);
    });
  });

  it("goToConfirmation should navigate, reset form and clear selectedInvoiceLines when isNewClaim true", () => {
    // Arrange
    mockClaims.selectedInvoiceLines = { line: [1], foo: "bar" } as any;
    spyOn(component.newClaimForm, "reset");
    (component as any).router = {
      navigate: jasmine.createSpy("navigate"),
    } as any;

    // Act
    component.goToConfirmation(true);

    // Assert
    expect((component as any).router.navigate).toHaveBeenCalledWith(
      [`/commercial/claims/wrong-product-claim/confirmation`],
      { queryParams: { isNewClaim: true } }
    );
    expect(component.newClaimForm.reset).toHaveBeenCalled();
    expect(mockClaims.selectedInvoiceLines).toEqual([]);
  });

  it("goToConfirmation should navigate with isNewClaim false and clear state", () => {
    mockClaims.selectedInvoiceLines = { line: [2], foo: "baz" } as any;
    spyOn(component.newClaimForm, "reset");
    (component as any).router = {
      navigate: jasmine.createSpy("navigate"),
    } as any;

    component.goToConfirmation(false);

    expect((component as any).router.navigate).toHaveBeenCalledWith(
      [`/commercial/claims/wrong-product-claim/confirmation`],
      { queryParams: { isNewClaim: false } }
    );
    expect(component.newClaimForm.reset).toHaveBeenCalled();
    expect(mockClaims.selectedInvoiceLines).toEqual([]);
  });

  it("continue should set claimDetails and call checkClaimType and selectInvoiceModal on success", fakeAsync(() => {
    component.selectedSuggestion = { claimNumber: "C100" } as any;
    const resp = { body: { invoice: [{ component: "LABOR" }], foo: "bar" } };
    spyOn(mockClaims, "getClaimsDetails").and.returnValue(of(resp));
    spyOn(component, "checkClaimType");
    spyOn(component, "selectInvoiceModal");

    component.continue();
    tick();

    expect(component.claimDetails).toEqual(resp.body);
    expect(component.claimDetails.claimNumber).toBe("C100");
    expect(component.nonProductLinesFlag).toBeTrue();
    expect(component.checkClaimType).toHaveBeenCalled();
    expect(component.selectInvoiceModal).toHaveBeenCalled();
    expect(component.spinnerLoading).toBeFalse();
  }));

  it("continue should set spinnerLoading false on error", fakeAsync(() => {
    component.selectedSuggestion = { claimNumber: "C200" } as any;
    spyOn(mockClaims, "getClaimsDetails").and.returnValue(
      throwError(() => new Error("fail"))
    );

    component.spinnerLoading = false;
    component.continue();
    tick();

    expect(component.spinnerLoading).toBeFalse();
  }));

  it("scrollToInvalidControl should scroll and focus when element found on document", () => {
    const el = document.createElement("div");
    (el as any).focus = jasmine.createSpy("focus");
    spyOn((component as any).document, "querySelector").and.returnValue(el);

    component.laborDetailsExpand = false;
    component.scrollToInvalidControl("someControl");

    expect(component.laborDetailsExpand).toBeTrue();
    expect((el as any).scrollIntoView).toBeDefined();
    // Replace scrollIntoView with spy to confirm call
    const spyScroll = spyOn(el, "scrollIntoView");
    component.scrollToInvalidControl("someControl");
    expect(spyScroll).toHaveBeenCalled();
    expect((el as any).focus).toHaveBeenCalled();
  });

  it("scrollToInvalidControl should search inside scrollTarget when not on document", () => {
    const el = document.createElement("div");
    (el as any).focus = jasmine.createSpy("focus");
    spyOn((component as any).document, "querySelector").and.returnValue(null);
    component.scrollTarget = {
      nativeElement: {
        querySelector: jasmine.createSpy("q").and.returnValue(el),
      },
    } as any;

    const spyScroll = spyOn(el, "scrollIntoView");
    component.scrollToInvalidControl("ctrl");
    expect(
      component.scrollTarget.nativeElement.querySelector as jasmine.Spy
    ).toHaveBeenCalled();
    expect(spyScroll).toHaveBeenCalled();
    expect((el as any).focus).toHaveBeenCalled();
  });

  it("scrollToInvalidControl retries until element appears", fakeAsync(() => {
    const el = document.createElement("div");
    (el as any).focus = jasmine.createSpy("focus");
    let callCount = 0;
    spyOn((component as any).document, "querySelector").and.callFake(() => {
      callCount++;
      // Return element on 3rd attempt
      return callCount >= 3 ? el : null;
    });
    // Ensure scrollTarget doesn't find it
    component.scrollTarget = {
      nativeElement: {
        querySelector: jasmine.createSpy("q").and.returnValue(null),
      },
    } as any;

    const spyScroll = spyOn(el, "scrollIntoView");
    component.scrollToInvalidControl("retryCtrl");
    // initial try fails, interval runs every 50ms; after 3 attempts element should be found
    tick(200);
    expect(callCount).toBeGreaterThanOrEqual(3);
    expect(spyScroll).toHaveBeenCalled();
    expect((el as any).focus).toHaveBeenCalled();
  }));

  it("should set labor values when selectedProductLines emits LABOR lines", fakeAsync(() => {
    // Arrange: make the mock service emit a LABOR selected line
    (mockClaims as any).selectedProductLines = of([
      {
        selectedLines: [
          {
            component: "LABOR",
            replacedWithMhk: true,
            replacementOrderNumber: "R2",
            amountProductAffected: 12,
            claimAmount: 120,
          },
        ],
      },
    ]);

    // Act: re-run ngOnInit to subscribe to the new observable
    component.ngOnInit();
    tick();

    // Assert: form values should be populated and laborFlag set
    const raw = component.newClaimForm.getRawValue();
    expect(raw.mohawkReplacementOrder).toBe("R2");
    expect(raw.totalSqFtReplaced).toBe(12);
    expect(raw.totalLaborRequested).toBe(120);
    expect(component.laborFlag).toBeTrue();
  }));

  it("removeInvoice should clear selectedInvoiceLines.line", () => {
    mockClaims.selectedInvoiceLines = {
      line: [1, 2, 3],
      invoiceNumber: "INV1",
    } as any;
    component.removeInvoice(0);
    expect(mockClaims.selectedInvoiceLines.line.length).toBe(0);
  });

  it("showAccordion should toggle laborLineAccordionFlag", () => {
    // ensure initial known state
    component.laborLineAccordionFlag = true;

    component.showAccordion({});
    expect(component.laborLineAccordionFlag).toBeFalse();

    component.showAccordion({});
    expect(component.laborLineAccordionFlag).toBeTrue();
  });

  it("openAccordion toggles consumerBtn and collapses laborDetailsExpand when opening consumer", () => {
    component.consumerBtn = false;
    component.laborDetailsExpand = true;

    component.openAccordion("consumer");
    expect(component.consumerBtn).toBeTrue();
    expect(component.laborDetailsExpand).toBeFalse();

    // calling again should close consumer section
    component.openAccordion("consumer");
    expect(component.consumerBtn).toBeFalse();
  });

  it("openAccordion toggles laborDetailsExpand for non-consumer", () => {
    component.laborDetailsExpand = false;
    component.openAccordion("other");
    expect(component.laborDetailsExpand).toBeTrue();

    component.openAccordion("other");
    expect(component.laborDetailsExpand).toBeFalse();
  });

  it("getcountry should set STATE_LIST and clear consumerState when country found", () => {
    // Precondition: set consumerState to a value so we can verify it gets cleared
    component.newClaimForm.controls["consumerState"].setValue("NY");
    component.STATE_LIST = [];

    component.getcountry("US");

    expect(component.STATE_LIST.length).toBeGreaterThan(0);
    expect(component.newClaimForm.getRawValue().consumerState).toBeNull();
  });

  it("getcountry should not change STATE_LIST when country not found", () => {
    component.STATE_LIST = [];
    component.getcountry("ZZ");
    expect(component.STATE_LIST.length).toBe(0);
  });

  it("getUserDetails should call getCurrentUserDetail and not call progressHide on success", () => {
    const userService = TestBed.inject(UserService) as any;
    spyOn(userService, "getCurrentUserDetail").and.returnValue(
      of({ body: { name: "u" } })
    );
    spyOn(userService, "progressHide");

    component.getUserDetails();

    expect(userService.getCurrentUserDetail).toHaveBeenCalled();
    expect(userService.progressHide).not.toHaveBeenCalled();
  });

  it("getUserDetails should call progressHide on error", () => {
    const userService = TestBed.inject(UserService) as any;
    spyOn(userService, "getCurrentUserDetail").and.returnValue(
      throwError(() => new Error("fail"))
    );
    spyOn(userService, "progressHide");

    component.getUserDetails();

    expect(userService.getCurrentUserDetail).toHaveBeenCalled();
    expect(userService.progressHide).toHaveBeenCalled();
  });

  it("scrollToLaborDetails should scroll target and set flags", () => {
    const el: any = { scrollIntoView: jasmine.createSpy("scrollIntoView") };
    component.scrollTarget = { nativeElement: el } as any;
    component.laborDetailsExpand = false;
    component.consumerBtn = true;

    component.scrollToLaborDetails();

    expect(el.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" });
    expect(component.laborDetailsExpand).toBeTrue();
    expect(component.consumerBtn).toBeFalse();
  });

  it("onClearBtnClick should clear selectedSuggestion and claimNumberSelcted", () => {
    component.selectedSuggestion = { claimNumber: "X" } as any;
    component.claimNumberSelcted = true;
    component.onClearBtnClick();
    expect(component.selectedSuggestion).toBeNull();
    expect(component.claimNumberSelcted).toBeFalse();
  });

  it("onClearBtnClick should be safe when selectedSuggestion is already null", () => {
    component.selectedSuggestion = null;
    component.claimNumberSelcted = true;
    expect(() => component.onClearBtnClick()).not.toThrow();
    expect(component.claimNumberSelcted).toBeFalse();
  });

  it("selectInvoiceModal should open modal with correct initialState", () => {
    const modal = TestBed.inject(BsModalService) as any;
    let captured: any = {};
    spyOn(modal, "show").and.callFake((cmp: any, opts: any) => {
      captured.cmp = cmp;
      captured.opts = opts;
      return {} as any;
    });

    component.claimDetails = { invoiceNumber: "INV123", foo: "bar" } as any;
    component.claimType = "MY_TYPE";

    component.selectInvoiceModal();

    expect(modal.show).toHaveBeenCalled();
    expect(captured.opts).toBeDefined();
    const initialState = captured.opts.initialState;
    expect(initialState).toBeDefined();
    expect(initialState.isLaborClaim).toBeTrue();
    expect(initialState.claimData).toBe(component.claimDetails);
    expect(initialState.claimType).toBe(component.claimType);
    expect(initialState.selectedInvoiceData).toBeDefined();
    expect(initialState.selectedInvoiceData.invoiceNumber).toBe(
      component.claimDetails.invoiceNumber
    );
    expect(Array.isArray(initialState.selectedRecords)).toBeTrue();
  });

  it("saveForm should call updateClaim and stopAlert(false) on successful update", fakeAsync(() => {
    // Prepare component state
    component.ngOnInit();
    component.newClaimForm.controls["replacedWithMohawkMaterial"].setValue(
      true
    );
    component.newClaimForm.controls["mohawkReplacementOrder"].setValue("UORD");
    component.newClaimForm.controls["totalSqFtReplaced"].setValue(2);
    component.newClaimForm.controls["totalLaborRequested"].setValue(20);

    // Mock selectedInvoiceLines to force updateClaim branch (claimNumber present and patchFlag true)
    (mockClaims as any).selectedInvoiceLines = {
      claimNumber: "CN1",
      claimData: { claimStatus: "FINAL" },
      line: [{ selectedLines: [{ component: "LABOR" }] }],
      invoiceNumber: "INV1",
    };

    // Provide child and newchild to avoid undefined errors
    component.child = {
      onControlChange: jasmine.createSpy("onControlChange"),
    } as any;
    component.newchild = {
      claimsService: {
        selectedInvoiceLines: { line: [], invoiceNumber: false },
      },
    } as any;

    const storage = TestBed.inject(StorageService) as any;
    spyOn(storage, "setItem");
    spyOn(component, "resetAllForms");
    spyOn(component, "stopAlert");

    spyOn(mockClaims, "updateClaim").and.returnValue(
      of({ body: { claimNumber: "CN1" } })
    );

    component.saveForm(false, "CN1", null as any);
    tick();

    expect(mockClaims.updateClaim).toHaveBeenCalled();
    expect(storage.setItem).toHaveBeenCalled();
    expect(component.resetAllForms).toHaveBeenCalled();
    expect(component.stopAlert).toHaveBeenCalledWith(false);
  }));

  it("saveForm should call createLaborClaim and stopAlert(true) on successful create", fakeAsync(() => {
    component.ngOnInit();
    component.newClaimForm.controls["replacedWithMohawkMaterial"].setValue(
      true
    );
    component.newClaimForm.controls["mohawkReplacementOrder"].setValue("CORD");
    component.newClaimForm.controls["totalSqFtReplaced"].setValue(3);
    component.newClaimForm.controls["totalLaborRequested"].setValue(30);

    (mockClaims as any).selectedInvoiceLines = {
      claimNumber: undefined,
      claimData: { claimStatus: "DRAFT" },
      line: [{ selectedLines: [{ component: "LABOR" }] }],
      invoiceNumber: false,
    };

    component.child = {
      onControlChange: jasmine.createSpy("onControlChange"),
    } as any;
    component.newchild = {
      claimsService: {
        selectedInvoiceLines: { line: [], invoiceNumber: false },
      },
    } as any;

    const storage = TestBed.inject(StorageService) as any;
    spyOn(storage, "setItem");
    spyOn(component, "resetAllForms");
    spyOn(component, "stopAlert");

    spyOn(mockClaims, "createLaborClaim").and.returnValue(
      of({ body: { claimNumber: "NEW1" } })
    );

    component.saveForm(false, undefined, null as any);
    tick();

    expect(mockClaims.createLaborClaim).toHaveBeenCalled();
    expect(storage.setItem).toHaveBeenCalled();
    expect(component.resetAllForms).toHaveBeenCalled();
    expect(component.stopAlert).toHaveBeenCalledWith(true);
  }));

  it("saveForm should handle updateClaim error and call progressHide", fakeAsync(() => {
    component.ngOnInit();
    component.newClaimForm.controls["replacedWithMohawkMaterial"].setValue(
      true
    );
    component.newClaimForm.controls["mohawkReplacementOrder"].setValue("ERR");
    component.newClaimForm.controls["totalSqFtReplaced"].setValue(4);
    component.newClaimForm.controls["totalLaborRequested"].setValue(40);

    (mockClaims as any).selectedInvoiceLines = {
      claimNumber: "CNERR",
      claimData: { claimStatus: "FINAL" },
      line: [{ selectedLines: [{ component: "LABOR" }] }],
      invoiceNumber: "INVX",
    };

    spyOn(mockClaims, "updateClaim").and.returnValue(
      throwError(() => new Error("fail"))
    );
    const userService = TestBed.inject(UserService) as any;
    spyOn(userService, "progressHide");

    component.saveForm(false, "CNERR", null as any);
    tick();

    expect(userService.progressHide).toHaveBeenCalled();
    expect(component.alertTrigger).toBeTrue();
  }));

  it("resetAllForms should call reset on form and clear filesArray", () => {
    component.filesArray = [1, 2, 3];
    spyOn(component.newClaimForm, "reset");

    component.resetAllForms();

    expect(component.newClaimForm.reset).toHaveBeenCalled();
    expect(component.filesArray.length).toBe(0);
  });

  it("resetAllForms should make the form pristine/untouched after reset", () => {
    // Mark as dirty then reset
    component.newClaimForm.markAsDirty();
    component.newClaimForm.markAsTouched();

    component.resetAllForms();

    expect(component.newClaimForm.pristine).toBeTrue();
  });

  it("saveClaim should markAllAsTouched and call scrollToInvalidControl when form invalid", () => {
    spyOn(component, "scrollToInvalidControl");
    // Ensure form invalid by leaving required fields empty
    component.newClaimForm.markAsPristine();
    component.saveClaim(false, null as any);
    expect(component.scrollToInvalidControl).toHaveBeenCalled();
  });

  it("saveClaim should call postImage and then saveForm when claimNumber exists and files present", fakeAsync(() => {
    // Prepare valid form values
    component.ngOnInit();
    component.newClaimForm.controls["replacedWithMohawkMaterial"].setValue(
      true
    );
    component.newClaimForm.controls["mohawkReplacementOrder"].setValue(
      "ORD123"
    );
    component.newClaimForm.controls["totalSqFtReplaced"].setValue(10);
    component.newClaimForm.controls["totalLaborRequested"].setValue(100);

    // Prepare claims service selected invoice lines with a claimNumber and non-empty lines
    (mockClaims as any).selectedInvoiceLines = {
      claimNumber: "CN123",
      claimData: { claimStatus: "DRAFT" },
      line: [{ selectedLines: [{ component: "LABOR" }] }],
      invoiceNumber: "INV1",
    };

    component.filesArray = [{ name: "f1" }];
    const btnRef: any = { disabled: false };

    const userService = TestBed.inject(UserService) as any;
    spyOn(userService, "progressShow");
    spyOn(userService, "progressHide");

    spyOn(component, "saveForm").and.callFake(() => {});
    spyOn(mockClaims, "postImage").and.callThrough();

    component.saveClaim(false, btnRef);
    tick();

    expect(userService.progressShow).toHaveBeenCalledWith("addDocument");
    expect(mockClaims.postImage).toHaveBeenCalled();
    expect(component.saveForm).toHaveBeenCalled();
  }));

  it("saveClaim should call saveForm when no claimNumber and no files present", fakeAsync(() => {
    // Prepare valid form values
    component.ngOnInit();
    component.newClaimForm.controls["replacedWithMohawkMaterial"].setValue(
      true
    );
    component.newClaimForm.controls["mohawkReplacementOrder"].setValue(
      "ORD456"
    );
    component.newClaimForm.controls["totalSqFtReplaced"].setValue(5);
    component.newClaimForm.controls["totalLaborRequested"].setValue(50);

    (mockClaims as any).selectedInvoiceLines = {
      claimNumber: undefined,
      claimData: { claimStatus: "DRAFT" },
      line: [{ selectedLines: [{ component: "LABOR" }] }],
      invoiceNumber: false,
    };

    component.filesArray = [];
    const btnRef: any = { disabled: false };

    spyOn(component, "saveForm").and.callFake(() => {});

    component.saveClaim(false, btnRef);
    tick();

    expect(component.saveForm).toHaveBeenCalledWith(false, undefined, btnRef);
  }));

  it("checkMobilePhoneValidation formats dealerPhone when value is 10 digits", () => {
    component.ngOnInit();
    const fb = TestBed.inject(FormBuilder) as FormBuilder;
    component.newClaimForm.addControl("dealerPhone", fb.control(""));

    const ev: any = { target: { value: "1234567890" } };
    component.checkMobilePhoneValidation(ev);

    expect(component.newClaimForm.value.dealerPhone).toBe("(123) 456 7890");
  });

  it("checkMobilePhoneValidation removes special chars and formats when onlyNumbers length == 10", () => {
    component.ngOnInit();
    const fb = TestBed.inject(FormBuilder) as FormBuilder;
    component.newClaimForm.addControl("dealerPhone", fb.control(""));

    const ev: any = { target: { value: "(123) 456 7890" } };
    component.checkMobilePhoneValidation(ev);

    expect(component.newClaimForm.value.dealerPhone).toBe("(123) 456 7890");
  });

  it("checkMobilePhoneValidation patches onlyNumbers when not 10 digits", () => {
    component.ngOnInit();
    const fb = TestBed.inject(FormBuilder) as FormBuilder;
    component.newClaimForm.addControl("dealerPhone", fb.control(""));

    const ev: any = { target: { value: "12-34" } };
    component.checkMobilePhoneValidation(ev);

    expect(component.newClaimForm.value.dealerPhone).toBe("12-34");
  });

  it("checkPhoneValidation formats consumerPhone when value is 10 digits and control valid", () => {
    component.ngOnInit();
    // ensure consumerPhone control is enabled and exists
    const ctrl = component.newClaimForm.controls["consumerPhone"];
    ctrl.enable();

    const ev: any = { target: { value: "1234567890" } };
    spyOn(component, "completeConsumerInfo");

    component.checkPhoneValidation(ev, "consumerPhone");

    expect(component.newClaimForm.value.consumerPhone).toBe("(123) 456 7890");
    expect(component.completeConsumerInfo).toHaveBeenCalled();
  });

  it("checkPhoneValidation handles formatted input by removing special chars and formatting when 10 digits", () => {
    component.ngOnInit();
    component.newClaimForm.controls["consumerPhone"].enable();

    const ev: any = { target: { value: "(123) 456 7890" } };
    component.checkPhoneValidation(ev, "consumerPhone");

    expect(component.newClaimForm.value.consumerPhone).toBe("(123) 456 7890");
  });

  it("checkPhoneValidation patches onlyNumbers when not 10 digits for consumerPhone", () => {
    component.ngOnInit();
    component.newClaimForm.controls["consumerPhone"].enable();

    const ev: any = { target: { value: "12-34" } };
    component.checkPhoneValidation(ev, "consumerPhone");

    expect(component.newClaimForm.value.consumerPhone).toBe("12-34");
  });

  it("errorCase should set alertData, alertType, alertTrigger and call scrollToTop", () => {
    const userService = TestBed.inject(UserService) as any;
    spyOn(userService, "scrollToTop");

    component.alertTrigger = false;
    component.alertData = {} as any;

    component.errorCase("SOME_ERROR");

    expect(component.alertData.message).toBe("SOME_ERROR");
    expect(component.alertType).toBe("danger");
    expect(component.alertTrigger).toBeTrue();
    expect(userService.scrollToTop).toHaveBeenCalled();
  });

  it("errorCase should clear alertData and alertTrigger after timeout", fakeAsync(() => {
    component.errorCase("TIMEOUT_ERR");
    expect(component.alertTrigger).toBeTrue();
    tick(8000);
    expect(component.alertData).toEqual({});
    expect(component.alertTrigger).toBeFalse();
  }));

  it("clearSpeacialCharsFromPhoneNumber removes parentheses and spaces", () => {
    const input = "(123) 456 7890";
    const out = component.clearSpeacialCharsFromPhoneNumber(input as any);
    expect(out).toBe("1234567890");
  });

  it("clearSpeacialCharsFromPhoneNumber leaves string unchanged when no special chars", () => {
    const input = "1234567";
    const out = component.clearSpeacialCharsFromPhoneNumber(input as any);
    expect(out).toBe("1234567");
  });

  it("clearSpeacialCharsFromPhoneNumber removes only first two spaces (idempotent for typical inputs)", () => {
    const input = "12 34 56 78";
    const out = component.clearSpeacialCharsFromPhoneNumber(input as any);
    // removeChar is called twice for space so the first two spaces are removed
    expect(out).toBe("123456 78");
  });

  it("validateAddressOnFormChange should call productService.validateAddress and set success state when address is valid", fakeAsync(() => {
    // ensure form controls are enabled and valid
    component.newClaimForm.controls["consumeraddressOne"].enable();
    component.newClaimForm.controls["consumerCity"].enable();
    component.newClaimForm.controls["consumerState"].enable();
    component.newClaimForm.controls["consumerCountry"].enable();
    component.newClaimForm.controls["consumerZip"].enable();
    component.newClaimForm.controls["consumeraddressOne"].setValue(
      "123 Main St"
    );
    component.newClaimForm.controls["consumerCity"].setValue("SomeCity");
    component.newClaimForm.controls["consumerState"].setValue("NY");
    component.newClaimForm.controls["consumerCountry"].setValue("US");
    component.newClaimForm.controls["consumerZip"].setValue("10001");

    const prod = TestBed.inject(ProductService) as any;
    spyOn(prod, "validateAddress").and.returnValue(
      of({ d: { EvStatus: "S", EvMessage: "ok", EsAddress: {} } })
    );
    spyOn(component, "validateAddressModal");

    component.validateAddressOnFormChange();
    tick();

    expect(prod.validateAddress).toHaveBeenCalled();
    expect(component.zipAlertType).toBe("success");
    expect(component.errorMessage).toBe("Address is valid");
    expect(component.validateAddressModal).toHaveBeenCalledWith(
      "Address is valid"
    );
    expect(component.spinnerLoading).toBeFalse();
  }));

  it("validateAddressOnFormChange should handle service error and call userService.progressHide", fakeAsync(() => {
    component.newClaimForm.controls["consumeraddressOne"].enable();
    component.newClaimForm.controls["consumerCity"].enable();
    component.newClaimForm.controls["consumerState"].enable();
    component.newClaimForm.controls["consumerCountry"].enable();
    component.newClaimForm.controls["consumerZip"].enable();
    component.newClaimForm.controls["consumeraddressOne"].setValue(
      "123 Main St"
    );
    component.newClaimForm.controls["consumerCity"].setValue("SomeCity");
    component.newClaimForm.controls["consumerState"].setValue("NY");
    component.newClaimForm.controls["consumerCountry"].setValue("US");
    component.newClaimForm.controls["consumerZip"].setValue("10001");

    const prod = TestBed.inject(ProductService) as any;
    spyOn(prod, "validateAddress").and.returnValue(
      throwError(() => new Error("boom"))
    );

    const userService = TestBed.inject(UserService) as any;
    spyOn(userService, "progressHide");

    component.validateAddressOnFormChange();
    tick();

    expect(prod.validateAddress).toHaveBeenCalled();
    expect(userService.progressHide).toHaveBeenCalled();
    expect(component.spinnerLoading).toBeFalse();
  }));

  it("validateAddressModal should open confirmation modal with provided message", () => {
    spyOn(component, "openConfirmationModal");

    component.validateAddressModal("Show me");

    expect(component.openConfirmationModal).toHaveBeenCalledWith(
      jasmine.objectContaining({
        title: "Information",
        content: "Show me",
        primaryActionLabel: "Ok",
      })
    );
  });

  it("validateAddressModal passes empty secondaryActionLabel and action callbacks", () => {
    spyOn(component, "openConfirmationModal");

    component.validateAddressModal("Another msg");

    expect(component.openConfirmationModal).toHaveBeenCalled();
    const arg = (
      component.openConfirmationModal as jasmine.Spy
    ).calls.mostRecent().args[0];
    expect(arg.primaryActionLabel).toBe("Ok");
    expect(arg.secondaryActionLabel).toBe("");
    expect(typeof arg.onPrimaryAction).toBe("function");
    expect(typeof arg.onSecondaryAction).toBe("function");
  });
});
