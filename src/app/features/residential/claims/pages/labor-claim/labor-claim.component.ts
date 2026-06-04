import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
} from "@angular/core";
import { BreadcrumbItems } from "src/app/features/shared/interfaces/breadcrumb-items";
import { ClaimsService } from "../../services/claims.service";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { SelectInvoicePopupComponent } from "../select-invoice-popup/select-invoice-popup.component";
import {
  CLAIM_COLUMNS,
  CLAIM_PATH_NAMES,
  LABOR_ELIGIBLE_CLAIMS,
} from "src/app/features/shared/constants/CLAIMS-CONSTANTS";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { STATES } from "src/app/features/shared/constants/States";
import { Observable } from "rxjs";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { API_CONSTANTS } from "src/app/features/shared/constants/API-CONSTANTS";
import { StorageService } from "src/app/features/http-services/storage.service";
import { InvoiceSearchComponent } from "../invoice-search/invoice-search.component";
import { XchangeCustomCheckboxComponent } from "src/app/features/shared/form-control-components/xchange-custom-checkbox/xchange-custom-checkbox.component";
import { ActivatedRoute, Router } from "@angular/router";
import { DatePipe, DOCUMENT } from "@angular/common";
import { ProductService } from "../../../products/pages/services/product.service";
import { ConfirmationDialogComponent } from "src/app/features/shared/components/confirmation-dialog/confirmation-dialog.component";
import { set } from "idb-keyval";

@Component({
    selector: "xchange-labor-claim",
    templateUrl: "./labor-claim.component.html",
    styleUrl: "./labor-claim.component.scss",
    standalone: false
})
export class LaborClaimComponent implements OnInit {
  @ViewChild("scrollLaborTarget") scrollTarget!: ElementRef;
  @ViewChild(XchangeCustomCheckboxComponent)
  child!: XchangeCustomCheckboxComponent;
  @ViewChild(InvoiceSearchComponent) newchild!: InvoiceSearchComponent;
  @ViewChild('upload') fileInput!: ElementRef;
  laborEligibleClaims = LABOR_ELIGIBLE_CLAIMS;
  constructor(
    public claimsService: ClaimsService,
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private fb: FormBuilder,
    private userService: UserService,
    public storageService: StorageService,
    private router: Router,
    private productService: ProductService,
    private datePipe: DatePipe,
    @Inject(DOCUMENT) private document: Document,
    private cdr: ChangeDetectorRef,
    private activeRoute: ActivatedRoute,
  ) {}

  scrollToInvalidControl(controlName: string) {
    if (!controlName) return;
    this.laborDetailsExpand = true;
    this.cdr.detectChanges();
    const selector = `[formControlName="${controlName}"]`;
    const tryScroll = (): boolean => {
      // Try document-wide first
      let el = this.document.querySelector(selector) as HTMLElement | null;
      if (!el && this.scrollTarget && this.scrollTarget.nativeElement) {
        el = this.scrollTarget.nativeElement.querySelector(
          selector
        ) as HTMLElement | null;
      }

      if (el) {
        try {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          // If the element can be focused, focus it so screen readers receive context
          (el as any).focus?.();
        } catch (e) {
          // ignore
        }
        return true;
      }
      return false;
    };

    if (!tryScroll()) {
      let attempts = 0;
      const maxAttempts = 6;
      const handle = setInterval(() => {
        attempts++;
        if (tryScroll() || attempts >= maxAttempts) {
          clearInterval(handle);
        }
      }, 50);
    }
  }
  breadcrumbItems: BreadcrumbItems = [
    {
      name: "Home",
      path: "/residential",
      active: false,
    },
    {
      name: "Claims",
      path: "/residential/claims/createclaim",
      active: false,
    },
    {
      name: "New Labor Line",
      path: "/",
      active: true,
    },
  ];
  searchText = "";
  claimData = [];
  bindLabels = ["claimNumber"];
  claimDetails: any;
  claimTypes = CLAIM_PATH_NAMES;
  claimType = "";
  nonProductLinesFlag: boolean = false;
  columns = [];
  claimColumns: any = CLAIM_COLUMNS;
  claimNumberSelcted: boolean = false;
  laborFlag: boolean = false;
  laborDetailsExpand = false;
  showSpinner = false;
  selectedSuggestion: any;
  spinnerLoading = false;
  consumerBtn: boolean = false;
  consumerFlag: boolean = false;
  newClaimForm!: FormGroup;
  STATE_LIST: any = [];
  useAccountInformation: any;
  alertData: any = {
    message: "success",
  };
  alertType: any = "success";
  alertTrigger: any = false;
  zipAlertType = "";
  modalRef?: BsModalRef;
  ngOnInit(): void {
    this.claimsService.claimNumber = "";
     this.activeRoute.queryParams.subscribe((params) => {
      if(params['claim']){
        this.selectedSuggestion = { claimNumber: params['claim'] };
        this.claimsService.claimNumber = params['claim'];
        this.continue();
      }
     })
    this.newClaimForm = this.fb.group({
      totalSqFtReplaced: ["", [Validators.required]],
      totalLaborRequested: ["", [Validators.required]],
      mohawkReplacementOrder: [""],
      replacedWithMohawkMaterial: [null, [Validators.required]],
      projectSiteName: [""],
      consumerName: [""],
      consumerPhone: [
        "",
        [
          Validators.pattern(/^[0-9]*$/),
          Validators.min(Number("9".repeat(9))),
          Validators.max(Number("9".repeat(10))),
        ],
      ],
      consumerPhoneExtn: [
        "",
        [
          Validators.pattern(/^[0-9]*$/),
          Validators.max(Number("9".repeat(10))),
        ],
      ],
      consumerEmail: [
        "",
        [
          Validators.pattern(
            /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          ),
        ],
      ],
      consumeraddressOne: [""],
      consumeraddressTwo: [""],
      consumerCity: [""],
      consumerCountry: [null],
      consumerState: [null],
      consumerZip: ["", [Validators.pattern(/^[0-9a-zA-Z ]+$/)]],
      productInstalled: [false],
    });
    this.claimsService.selectedProductLines.subscribe(async (res: any) => {
      await res?.forEach((d: any) => {
        d?.selectedLines?.forEach((line: any) => {
          if (line.component === "LABOR") {
            this.setLaborValues(line);
            this.completeLaborInfo();
          }
        });
      });
      const data: any = this.claimDetails || {};
      data.consumeraddressOne = data?.consumerStreet || "";
      if (Object.keys(data).length > 0) {
        this.setConsumerValues(data);
        this.completeConsumerInfo();
      }
    });
  }
  onSearch(value: any) {
    if (typeof value === "string") {
      value = value.trim();
      this.searchText = value;
      this.claimData = [];
      if (value.length > 0) this.getClaimsHistory();
    }
  }
  getClaimsHistory() {
    let payload: any = {
      claimNumber: this.searchText,
      salesHierarchyCode: "",
      colorName: "",
      colorNumber: "",
      consumerName: "",
      dateRange: "",
      dealerClaimDebit: "",
      invoiceNumber: "",
      poNumber: "",
      searchText: "",
      sidemark: "",
      status: "",
      styleName: "",
      styleNumber: "",
      type: "",
      orderBy: "",
      sort: "",
      currentPage: "0",
      salesHierarchyRole: "",
    };
    this.showSpinner = true;
    this.claimData = [];
    this.claimsService.getClaimsHistory(payload, 0, 200).subscribe(
      (res) => {
        // this.spinnerLoading = false;
        this.claimData = res?.body?.claimsData || [];
        setTimeout(() => {
          this.showSpinner = false;
        }, 1000);
      },
      (err) => {
        this.showSpinner = false;
      }
    );
  }

  suggestionClick(suggestion: any) {
    this.selectedSuggestion = suggestion;
  }

  checkClaimType() {
    const claimType = this.claimDetails?.claimType.toLowerCase();
    switch (claimType) {
      case "freight billing error":
        this.claimType = this.claimTypes.FREIGHT;
        break;
      case "pricing billing error":
        this.claimType = this.claimTypes.PRICING;
        break;
      case "tax billing error":
        this.claimType = this.claimTypes.TAX;
        break;
      case "accommodation return":
        this.claimType = this.claimTypes.ACCOMMODATION_RETURN;
        break;
      case "assurance warranty claim":
        this.claimType = this.claimTypes.CUSTOMER_SATISFACTION;
        break;
      case "order error claim":
        this.claimType = this.claimTypes.MOHAWK_ORDER_ERROR;
        break;
      case "defective product claim":
        this.claimType = this.claimTypes.DEFECTIVE_PRODUCT;
        break;
      case "wrong product claim":
        this.claimType = this.claimTypes.WRONG_PRODUCT;
        break;
      case "damage claim":
        this.claimType = this.claimTypes.DAMAGED;
        break;
      case "quantity claim":
        this.claimType = this.claimTypes.WRONG_QUANTITY_SHORTAGE;
        break;
      case "cancellation fees":
        this.claimType = this.claimTypes.CANCELLATION_FEE;
        break;
    }
    this.claimDetails.claimType = this.claimType;
    this.columns = this.claimColumns["columns"];
    this.claimNumberSelcted = true;
  }
  selectInvoiceModal() {
    const initialState: ModalOptions = {
      initialState: {
        isLaborClaim: true,
        claimData: this.claimDetails,
        claimType: this.claimType,
        selectedInvoiceData: {
          invoiceNumber: this.claimDetails?.invoiceNumber,
        },
        selectedRecords: [],
        onCancel: () => { 
          this.claimNumberSelcted = false;
          this.selectedSuggestion = null;
        }
      },
    };
    this.bsModalRef = this.modalService.show(
      SelectInvoicePopupComponent,
      Object.assign(initialState, {
        id: "SelectInvoicePopupComponent",
        class: "modal-xl modal-dialog-centered select-invoice-popup ",
        backdrop: "static",
        keyboard: false,
      })
        
    );
  }

  laborLineAccordionFlag: boolean = true;
  showAccordion(i: any) {
    this.laborLineAccordionFlag = !this.laborLineAccordionFlag;
    // this.claimsService.selectedInvoiceLines?.line?.forEach((ln: any) => {
    //   if (ln.selectedLines.length > 0) {
    //     ln.selectedLines.filter((inv: any) => {
    //       if (
    //         inv.component === i.component &&
    //         inv.invoiceSeq === i.invoiceSeq
    //       ) {
    //         inv.isOpen = !inv.isOpen;
    //       }
    //     });
    //   }
    // });
  }
  continue() {
    this.userService.progressShow("claimDetails");
    this.claimsService
      .getClaimsDetails(
        "?claimNumber=" + this.selectedSuggestion.claimNumber,
        {}
      )
      .subscribe(
        (res) => {
          this.userService.progressHide('claimDetails');
          this.claimDetails = res?.body || {};
          this.claimDetails.claimNumber = this.selectedSuggestion.claimNumber;
          this.nonProductLinesFlag = this.claimDetails?.invoice?.every(
            (item: any) => item?.component != "PRODUCT"
          );
          this.checkClaimType();
          this.selectInvoiceModal();
        },
        (err) => {
          this.userService.progressHide('claimDetails');
        }
      );
  }
  onClearBtnClick() {
    this.selectedSuggestion = null;
    this.claimNumberSelcted = false;
  }

  changeEventClaim(event: any, fieldName: any) {
    this.newClaimForm.patchValue({
      replacedWithMohawkMaterial: fieldName == "yes" ? true : false,
    });

    if (this.newClaimForm.value.replacedWithMohawkMaterial == true) {
      // this.newClaimForm.controls["mohawkReplacementOrder"].setValidators(
      //   Validators.required
      // );
      this.newClaimForm.controls[
        "mohawkReplacementOrder"
      ].updateValueAndValidity();
      this.newClaimForm.controls["mohawkReplacementOrder"].markAsPristine();

      this.newClaimForm.controls["mohawkReplacementOrder"].markAsUntouched();
    } else {
      this.newClaimForm.controls["mohawkReplacementOrder"].clearValidators();
      this.newClaimForm.controls[
        "mohawkReplacementOrder"
      ].updateValueAndValidity();
    }
    this.completeLaborInfo();
  }

  completeLaborInfo() {
    const control = this.newClaimForm.controls;
    this.laborFlag =
      control["mohawkReplacementOrder"].valid &&
      control["replacedWithMohawkMaterial"].valid &&
      control["totalSqFtReplaced"].valid &&
      control["totalLaborRequested"].valid;
  }

  completeConsumerInfo() {
    const control = this.newClaimForm.controls;
    if (this.claimDetails?.productInstalled == true) {
      this.consumerFlag =
        control["projectSiteName"].value &&
        control["consumerName"].value &&
        control["consumerPhone"].value &&
        control["consumeraddressOne"].value &&
        control["consumerCity"].value &&
        control["consumerCountry"].value &&
        control["consumerState"].value &&
        control["consumerZip"].value;
    } else {
      this.consumerFlag = true;
    }
  }
  setLaborValues(data: any) {
    const control = this.newClaimForm.controls;
    control["replacedWithMohawkMaterial"].setValue(data?.replacedWithMhk);
    control["mohawkReplacementOrder"].setValue(this.claimsService.selectedInvoiceLines?.claimData?.replacementOrderNo || data?.replacementOrderNo || "");
    control["totalSqFtReplaced"].setValue(data?.claimQuantity);
    control["totalLaborRequested"].setValue(data?.claimAmount);
  }
  setConsumerValues(data: any) {
    const obj = [
      "productInstalled",
      "projectSiteName",
      "consumerName",
      "consumerPhone",
      "consumerPhoneExtn",
      "consumerEmail",
      "consumeraddressOne",
      "consumeraddressTwo",
      "consumerCity",
      "consumerCountry",
      "consumerState",
      "consumerZip",
    ];
    const control = this.newClaimForm.controls;
    obj.forEach((key: any) => {
      control[key].setValue(data[key]);
      control[key].disable();
    });
  }

  openAccordion(c: any) {
    if (c == "consumer") {
      if (this.consumerBtn == true) {
        this.consumerBtn = false;
      } else {
        this.consumerBtn = true;
        this.laborDetailsExpand = false;
      }
    } else {
      this.laborDetailsExpand = !this.laborDetailsExpand;
    }
  }
  scrollToLaborDetails() {
    this.scrollTarget.nativeElement.scrollIntoView({ behavior: "smooth" });
    this.laborDetailsExpand = true;
    this.consumerBtn = false;
  }

  getcountry(country: any) {
    STATES.filter((c: any) => {
      if (c.abbreviation == country) {
        this.newClaimForm.patchValue({
          consumerState: null,
        });
        this.STATE_LIST = c.states;
      }
    });
  }
  getUserDetails() {
    this.userService.getCurrentUserDetail().subscribe(
      (res: any) => {
        // this.newClaimForm.patchValue({ dealerRole: res.body?.primaryRole });
      },
      (err) => {
        this.userService.progressHide();
      }
    );
  }

  goToConfirmation(isNewClaim: boolean) {
    this.router.navigate(
      [`/residential/claims/${this.claimType}/confirmation`],
      {
        queryParams: {
          isNewClaim: isNewClaim,
        },
      }
    );
    this.newClaimForm.reset();
    this.claimsService.selectedInvoiceLines = [];
  }
  onlyNumberKey(event: KeyboardEvent) {
    const allowedKeys = [
      "Backspace",
      "Tab",
      "ArrowLeft",
      "ArrowRight",
      "Delete",
    ];
    const input = event.key;
    const target = event.target as HTMLInputElement;
    // Allow control keys
    if (allowedKeys.includes(input)) return;
    // Allow digits
    if (/^[0-9]$/.test(input)) return;
    // Allow ONE dot
    if (input === ".") {
      // If the value is empty, allow but we convert it to 0. in input handler
      if (!target.value.includes(".")) return;
    }
    // Block everything else
    event.preventDefault();
  }

  formatDecimal(event: any) {
    let value = event.target.value;
    // CASE: user types only "." → convert to "0."
    if (value === ".") {
      event.target.value = "0.";
      return;
    }
    // Remove invalid characters
    value = value.replace(/[^0-9.]/g, "");
    // Allow only one dot
    value = value.replace(/(\..*)\./g, "$1");
    // Limit to 2 decimals
    value = value.replace(/^(\d+\.?\d{0,2}).*$/, "$1");
    event.target.value = value;
  }
  filesArray: any = [];
  uploadFile(event: any) {
    this.claimsService.uploadFile(event, this);
  }
  removeFile(index: any) {
    this.filesArray.splice(index, 1);
  }
  public onDeactivate(): Observable<any> | Promise<any> | boolean {
    if (
      this.newClaimForm.dirty ||
      this.filesArray.length > 0
      // ||
      // this.newchild?.expectedUnitForm?.dirty ||
      // this.newchild?.invoiceSelectedLineForm?.dirty
    ) {
      return true;
    } else {
      return false;
    }
  }

  saveClaim(requestStatus: boolean, btnRef: any = null) {
    if (requestStatus === false) {
      if (
        this.newClaimForm.invalid ||
        this.claimsService.selectedInvoiceLines?.line?.length === 0
      ) {
        this.newClaimForm.markAllAsTouched();
        let invalidFields = [];
        for (let control in this.newClaimForm.controls) {
          if (this.newClaimForm.controls[control].invalid) {
            invalidFields.push(control);
          }
        }
        // Finally check other invalid fields — expand and scroll to first invalid control
        if (invalidFields.length > 0) {
          this.newClaimForm.markAllAsTouched();
          this.scrollToInvalidControl(invalidFields[0]);
        }
        return;
      }
    }
    btnRef.disabled = true;
    const claimNumber = this.claimDetails.claimNumber || this.claimsService.claimNumber;
    this.filesArray = this.filesArray.filter((f: any) => !f.key);
    if (claimNumber) {
      if (this.filesArray.length > 0) {
        this.userService.progressShow("addDocument");
        this.claimsService
          .postImage(
            this.filesArray,
            `${API_CONSTANTS.addDocument}?claimNumber=${claimNumber}`
          )
          .subscribe(
            (res) => {
              this.userService.progressHide("addDocument");
              if (res.claimNumber) {
                this.saveForm(requestStatus, res.claimNumber, btnRef);
              } else {
                // this.openModal(res.message);
                if (btnRef !== null) btnRef["disabled"] = false;
              }
            },
            (err) => {
              if (btnRef !== null) {
                btnRef["disabled"] = false;
              }
              this.userService.progressHide('addDocument');
            }
          );
      } else {
        this.saveForm(requestStatus, claimNumber, btnRef);
      }
    } else {
      if (this.filesArray.length > 0) {
        this.userService.progressShow("addDocument");
        this.claimsService
          .postImage(this.filesArray, `${API_CONSTANTS.addDocument}`)
          .subscribe(
            (res) => {
              this.userService.progressHide('addDocument');
              if (res.claimNumber) {
                this.saveForm(requestStatus, res.claimNumber, btnRef);
              } else {
                // this.openModal(res.message);
                if (btnRef !== null) btnRef["disabled"] = false;
              }
            },
            (err) => {
              if (btnRef !== null) {
                btnRef["disabled"] = false;
              }
              this.userService.progressHide('addDocument');
            }
          );
      } else {
        this.saveForm(requestStatus, undefined, btnRef);
      }
    }
  }

  saveForm(requestStatus: boolean, claimNumber: any, btnRef: any = null) {
    // Initialize payload from claimDetails (guard against undefined)
    let payload: any = this.claimDetails ? { ...this.claimDetails } : {};
    if (this.claimDetails) {
      for (let key in this.claimDetails) {
        if (key != "invoice") {
          payload[key] = this.claimDetails[key];
        }
      }
    }
    payload.totalSqFtReplaced = this.newClaimForm?.value?.totalSqFtReplaced;
    payload.totalLaborRequested = this.newClaimForm?.value?.totalLaborRequested;
    payload.replacedWithMohawkMaterial =
      this.newClaimForm?.value?.replacedWithMohawkMaterial;
    payload.mohawkReplacementOrder =
      this.newClaimForm?.value?.mohawkReplacementOrder;

    const loadingFor = requestStatus ? "draft" : "submit";
    this.userService.progressShow(loadingFor);
    // payload.dealerPhone = this.getPhoneNumber(payload?.dealerPhone);
    // payload.claimNumber = claimNumber;
    // payload.draft = requestStatus;
    // payload.create = requestStatus ? false : true;
    // payload.productInstalled = payload.productInstalled ? true : false;
    // payload.businessArea =
    //   this.claimsService.selectedInvoiceLines.businessArea == undefined
    //     ? ""
    //     : this.claimsService.selectedInvoiceLines.businessArea;
    // payload.erpCompanyCode =
    //   this.claimsService.selectedInvoiceLines.salesOrg == undefined
    //     ? ""
    //     : this.claimsService.selectedInvoiceLines.salesOrg;
    // payload.invoiceNumber =
    //   this.claimsService.selectedInvoiceLines.invoiceNumber === undefined
    //     ? ""
    //     : this.claimsService.selectedInvoiceLines.invoiceNumber;
    // payload.invoiceYear =
    //   this.claimsService.selectedInvoiceLines.invoiceDate == undefined
    //     ? ""
    //     : this.claimsService.selectedInvoiceLines.invoiceDate.split("/").pop();
    // payload.invoiceDate =
    //   this.claimsService.selectedInvoiceLines.invoiceDate == undefined
    //     ? ""
    //     : this.claimsService.selectedInvoiceLines.invoiceDate;
    // payload.consumerStreet =
    //   payload.consumeraddressOne + " " + payload.consumeraddressTwo;
    // payload.consumerAddressOne = payload.consumeraddressOne?.trim()
    //   ? payload.consumeraddressOne
    //   : "";
    // payload.consumerAddressTwo = payload.consumeraddressTwo?.trim()
    //   ? payload.consumeraddressTwo
    //   : "";
    // payload.consumerStreet = payload.consumerStreet?.trim()
    //   ? payload.consumerStreet
    //   : "";
    // payload.wrongProductDesc =
    //   payload.wrongProductDesc == "Other"
    //     ? payload.otherLabelValue
    //     : payload.wrongProductDesc;
    // payload.returnDate =
    //   this.newClaimForm.value.returnDate == ""
    //     ? ""
    //     : this.datePipe.transform(
    //         this.newClaimForm.value.returnDate,
    //         "MM/dd/yyyy"
    //       );
    // payload.consumerPhone = this.getPhoneNumber(payload?.consumerPhone);
    // payload.returnContactPhone = this.getPhoneNumber(
    //   payload?.returnContactPhone
    // );
    // payload.returnStreet = `${this.newClaimForm.value.returnaddressOne} ${this.newClaimForm.value.returnaddressTwo}`;
    // payload.returnStreet = payload.returnStreet?.trim()
    //   ? payload.returnStreet
    //   : "";
    // payload.suggestedResolution = this.setsuggestedResolutionValue(payload.suggestedResolution);
    payload.line = [];
    payload.laborLineExists = true;
    payload.replacementOrderNo =
      this.newClaimForm?.value?.mohawkReplacementOrder || "";
    this.claimsService.selectedInvoiceLines?.line?.forEach((element: any) => {
      const productLine = element.selectedLines.find((item: any) => item.component === 'PRODUCT');
      element.selectedLines.forEach((el: any) => {
        if (!(el.component === "PRODUCT" && el?.standaloneLine == true)) {
          payload.line.push({
            invoiceNumber:
              this.claimsService.selectedInvoiceLines.invoiceNumber,
            invoiceLineNumber: element?.invoiceSeq,
            invoicePrice: "",
            invoiceSource: el?.component == "LABOR" ? productLine?.source || "" : el?.source || "",
            component: el?.component,
            uom: el?.component == "LABOR" ? productLine?.uom || "" : el?.uom || "",
            disputeCurrency: el?.component == "LABOR" ? productLine?.currency : el?.currency,
            additionalInfoNotes: el?.additionalInfoNotes,
            isSales: this.storageService.userInfo?.isSalesPerson || this.storageService.userInfo?.isSalesOps || false,
            reasonForClaimNotes: this.claimDetails?.reasonForClaimNotes,
            claimQuantity: 
              el?.component == "LABOR"
                ? this.newClaimForm?.value?.totalSqFtReplaced
                : el?.claimQuantity,
            claimType: this.claimType,
            productInstalled: payload.productInstalled ? true : false,
            disputeCaseId:
              el?.disputeCaseId && el?.disputeCaseId != "NA"
                ? el?.disputeCaseId
                : "",
            disputeAmount:
              el?.component == "LABOR"
                ? this.newClaimForm?.value?.totalLaborRequested
                : undefined,
            amountProductAffected:
              el?.component == "LABOR"
                ? this.newClaimForm?.value?.totalSqFtReplaced
                : undefined,
            replacedWithMhk:
              el?.component == "LABOR"
                ? this.newClaimForm?.value?.replacedWithMohawkMaterial
                : undefined, //New question 
            replacementOrderNo:
              el?.component == "LABOR"
                ? (this.newClaimForm?.value?.mohawkReplacementOrder || "")
                : undefined, // New question
          });
        }
      });
    });
    delete payload.invoice;
    delete payload.totalSqFtReplaced;
    delete payload.totalLaborRequested;
    delete payload.mohawkReplacementOrder;
    delete payload.replacedWithMohawkMaterial;
    this.spinnerLoading = true;
    let patchFlag =
      (this.claimsService.selectedInvoiceLines?.claimData?.claimStatus.toUpperCase() ==
        "DRAFT" &&
        requestStatus) ||
      (this.claimsService.selectedInvoiceLines?.claimData?.claimStatus.toUpperCase() !==
        "DRAFT" &&
        this.claimsService.selectedInvoiceLines?.claimData?.claimStatus !==
          undefined &&
        !requestStatus);
    payload.claimType = this.claimType;
    if (claimNumber && patchFlag && !requestStatus) {
      this.claimsService.updateClaim(payload).subscribe(
        (res) => {
          this.spinnerLoading = false;
          this.userService.progressHide(loadingFor);
          if (res) {
            if (res?.error) {
              this.errorCase(res?.error);
            } else {
              if (requestStatus) {
                this.alertData = {
                  message: "Claim drafted Successfully",
                };
                this.alertType = "success";
                this.alertTrigger = true;
                this.storageService.setItem(
                  "claimNumber",
                  res.body?.claimNumber
                );
                this.claimsService.claimNumber = res.body?.claimNumber;
                this.resetAllForms();
                this.stopAlert(false);
              } else {
                this.alertData = {
                  message: "Claim Submitted Successfully",
                };
                this.alertType = "success";
                this.alertTrigger = true;
                this.storageService.setItem(
                  "claimNumber",
                  res.body?.claimNumber
                );
                this.claimsService.claimNumber = res.body?.claimNumber;
                this.resetAllForms();
                this.claimsService.expectedUnitPriceQuotedBy = "";
                this.child.onControlChange(false);
                this.newchild.claimsService.selectedInvoiceLines.line = [];
                this.newchild.claimsService.selectedInvoiceLines.invoiceNumber =
                  false;
                this.gotoTop();
                this.removeInvoice(0);
                this.stopAlert(false);
              }
            }
          }
        },
        (err) => {
          this.spinnerLoading = false;
          this.userService.progressHide(loadingFor);
          this.alertData = {
            message: err.name,
          };
          this.alertType = "danger";
          this.alertTrigger = true;
          this.spinnerLoading = false;
          if (btnRef !== null) {
            btnRef["disabled"] = false;
          }
          this.userService.scrollToTop();
        }
      );
    } else {
      this.claimsService.createLaborClaim(payload).subscribe(
        (res) => {
          this.spinnerLoading = false;
          this.userService.progressHide(loadingFor);
          if (res) {
            if (res?.error) {
              this.errorCase(res?.error);
            } else {
              if (requestStatus) {
                this.alertData = {
                  message: "Claim drafted Successfully",
                };
                this.alertType = "success";
                this.alertTrigger = true;
                this.storageService.setItem(
                  "claimNumber",
                  res.body?.claimNumber
                );
                this.claimsService.claimNumber = res.body?.claimNumber;
                this.resetAllForms();
                this.stopAlert(true);
              } else {
                this.alertData = {
                  message: "Claim Submitted Successfully",
                };
                this.alertType = "success";
                this.alertTrigger = true;
                this.storageService.setItem(
                  "claimNumber",
                  res.body?.claimNumber
                );
                this.claimsService.claimNumber = res.body?.claimNumber;
                this.resetAllForms();
                this.claimsService.expectedUnitPriceQuotedBy = "";
                this.child?.onControlChange(false);
                this.newchild.claimsService.selectedInvoiceLines.line = [];
                this.newchild.claimsService.selectedInvoiceLines.invoiceNumber =
                  false;
                this.gotoTop();
                this.removeInvoice(0);
                this.stopAlert(true);
              }
            }
          }
        },
        (err) => {
          this.userService.progressHide(loadingFor);

          this.alertData = {
            message: err.name,
          };
          this.alertType = "danger";
          this.alertTrigger = true;
          this.spinnerLoading = false;
          if (btnRef !== null) {
            btnRef["disabled"] = false;
          }
          this.userService.scrollToTop();
        }
      );
    }
  }
  resetAllForms() {
    this.newClaimForm.reset();
    this.filesArray = [];
    // this.newchild?.expectedUnitForm?.reset();
    // this.newchild?.invoiceSelectedLineForm?.reset();
  }
  stopAlert(isNewClaim: boolean) {
    this.goToConfirmation(isNewClaim);
  }
  getPhoneNumber(value: any) {
    if (value?.length) {
      value = value?.replace(/[^0-9]+/gi, "");
      value = value?.length > 10 ? value.slice(-10) : value;
      return value;
    } else {
      return "";
    }
  }

  phonePattern = "[0-9]{10}";
  checkMobilePhoneValidation(e: any) {
    const phoneCharLength = 10;
    let val = e?.target?.value;
    if (
      val?.length == phoneCharLength &&
      this.newClaimForm.controls["dealerPhone"].valid
    ) {
      this.newClaimForm.controls["dealerPhone"].clearValidators();
      this.newClaimForm.controls["dealerPhone"].updateValueAndValidity();
      this.newClaimForm.patchValue({
        dealerPhone: this.convertToUsPhoneFormat(val),
      });
    } else {
      let onlyNumbers = this.clearSpeacialCharsFromPhoneNumber(val);
      if (onlyNumbers?.length == phoneCharLength) {
        this.newClaimForm.patchValue({
          dealerPhone: this.convertToUsPhoneFormat(onlyNumbers),
        });
      } else {
        this.newClaimForm.patchValue({
          dealerPhone: onlyNumbers,
        });
      }
    }
    this.newClaimForm.controls["dealerPhone"].setValidators([
      Validators.required,
      Validators.min(Number("9".repeat(10))),
      Validators.max(Number("9".repeat(10))),
      Validators.maxLength(14),
    ]);
    this.newClaimForm.controls["dealerPhone"].updateValueAndValidity();
    // this.completeDealerInfo();
  }

  convertToUsPhoneFormat(val: any) {
    if (val?.length) {
      let formatedValue = "(";
      formatedValue += val?.substring(0, 3) + ") ";
      formatedValue += val?.substring(3, 6) + " ";
      formatedValue += val?.substring(6, 10);
      return formatedValue;
    } else {
      return "";
    }
  }

  clearSpeacialCharsFromPhoneNumber(val: any) {
    val = this.removeChar(val, " ");
    val = this.removeChar(val, " ");
    val = this.removeChar(val, "(");
    val = this.removeChar(val, ")");
    return val;
  }

  removeChar(val: any, char: any) {
    let index = val?.indexOf(char);
    return index >= 0 ? val?.slice(0, index) + val?.slice(index + 1) : val;
  }

  errorCase(err: any) {
    this.alertData = {
      message: err,
    };
    this.alertType = "danger";
    this.alertTrigger = true;
    this.userService.scrollToTop();
    setTimeout(() => {
      this.alertData = {};
      this.alertType = "danger";
      this.alertTrigger = false;
    }, 8000);
  }

  gotoTop() {
    let top = document.getElementById("scrollTop");
    if (top !== null) {
      top.scrollIntoView();
      top = null;
    }
  }

  removeInvoice(ind: Number) {
    this.claimsService.selectedInvoiceLines.line = [];
  }
  errorMessage = "";
  validateAddressOnFormChange() {
    if (
      this.newClaimForm.controls["consumeraddressOne"].valid &&
      this.newClaimForm.controls["consumerCity"].valid &&
      this.newClaimForm.controls["consumerState"].valid &&
      this.newClaimForm.controls["consumerCountry"].valid &&
      this.newClaimForm.controls["consumerZip"].valid
    ) {
      /* let payload = {
        address1: this.newClaimForm.value.consumeraddressOne,
        address2: this.newClaimForm.value.consumeraddressTwo,
        buID: this.claimsService.selectedInvoiceLines.businessArea,
        city: this.newClaimForm.value.consumerCity,
        country: this.newClaimForm.value.consumerCountry,
        erpId: this.claimsService.selectedInvoiceLines.salesOrg,
        postalcode: this.newClaimForm.value.consumerZip,
        state: this.newClaimForm.value.consumerState,
      }; */

      const payload =
        `(IvVstel='',` +
        `IvCity='${this.newClaimForm.value.consumerCity}',` +
        `IvCountry='${this.newClaimForm.value.consumerCountry}',` +
        `IvPostalCode='${this.newClaimForm.value.consumerZip}',` +
        `IvProvideAlt=1,` +
        `IvRegion='${this.newClaimForm.value.consumerState}',` +
        `IvStreetLine='${encodeURIComponent(
          this.newClaimForm.value.consumeraddressOne
        )}')?$format=json`;

      this.spinnerLoading = true;
      this.errorMessage = "";
      this.errorMessage = "";
      this.zipAlertType = "";
      this.productService.validateAddress(payload).subscribe({
        next: (res: any) => {
          this.spinnerLoading = false;
          const EvStatus = res?.d?.EvStatus;
          const EvMessage = res?.d?.EvMessage;
          if (EvStatus == "S") {
            this.validateAddressModal("Address is valid");
            this.errorMessage = "Address is valid";
            this.zipAlertType = "success";
          } else {
            let EsAddress = res?.d?.EsAddress;
            let suggestedAddress = `Suggested Address: ${
              EsAddress?.Addressline || ""
            }, 
                                    ${EsAddress?.Politicaldivision2 || ""}, ${
              EsAddress?.Politicaldivision1 || ""
            }, 
                                    ${EsAddress?.Postcodeprimarylow || ""}`;
            this.errorMessage =
              EvMessage == "Suggested Address" ? suggestedAddress : EvMessage;
            this.zipAlertType = "warning";
          }
        },
        error: (err: any) => {
          this.userService.progressHide();
          this.spinnerLoading = false;
        },
      });
    }
  }

  validateAddressModal(errMsg: string) {
    this.openConfirmationModal({
      title: "Information",
      content: errMsg,
      primaryActionLabel: "Ok",
      secondaryActionLabel: "",
      onPrimaryAction: () => {},
      onSecondaryAction: () => {},
    });
  }
  openConfirmationModal(data = {}) {
    const initialState: ModalOptions = {
      backdrop: true,
      ignoreBackdropClick: true,
      initialState: {
        ...data,
      },
    };
    this.modalRef = this.modalService.show(
      ConfirmationDialogComponent,
      Object.assign(initialState, {
        id: "confirmation",
        class: "modal-md modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }

  disableDraftBtn() {
    const myFormControls = this.newClaimForm.controls;
    let disable = false;
    for (let key in myFormControls) {
      const ctrl = myFormControls[key];
      if (!ctrl) continue;
      // ignore disabled controls
      if (ctrl.disabled) continue;
      if (ctrl.invalid) {
        const errors = ctrl.errors;
        if (errors) {
          const errorKeys = Object.keys(errors);
          // If the only error is 'required', do NOT disable the draft button.
          // Any other validation error should disable the draft button.
          if (!(errorKeys.length === 1 && errorKeys[0] === "required")) {
            disable = true;
            break;
          }
        }
      }
    }
    return disable;
  }

  avoidSpace(event: any) {
    if (event.keyCode === 32) {
      return false;
    } else {
      return undefined;
    }
  }

  checkPhoneValidation(e: any, field: any) {
    const phoneCharLength = 10;
    let val = e?.target?.value;
    if (field == "consumerPhone") {
      if (
        val?.length == phoneCharLength &&
        this.newClaimForm.controls["consumerPhone"].valid
      ) {
        this.newClaimForm.controls["consumerPhone"].clearValidators();
        this.newClaimForm.controls["consumerPhone"].updateValueAndValidity();
        this.newClaimForm.patchValue({
          consumerPhone: this.convertToUsPhoneFormat(val),
        });
      } else {
        let onlyNumbers = this.clearSpeacialCharsFromPhoneNumber(val);
        if (onlyNumbers?.length == phoneCharLength) {
          this.newClaimForm.patchValue({
            consumerPhone: this.convertToUsPhoneFormat(onlyNumbers),
          });
        } else {
          this.newClaimForm.patchValue({
            consumerPhone: onlyNumbers,
          });
        }
      }
      this.newClaimForm.controls["consumerPhone"].setValidators([
        Validators.min(Number("9".repeat(10))),
        Validators.max(Number("9".repeat(10))),
        Validators.maxLength(14),
      ]);
      // if (this.newClaimForm.controls['productInstalled'].value == true) {
      //   this.newClaimForm.controls["consumerPhone"].addValidators([Validators.required])
      // }
      this.newClaimForm.controls["consumerPhone"].updateValueAndValidity();
      this.completeConsumerInfo();
    }
  }
  
  productInstalled(event: any) {
    const obj = [
      "projectSiteName",
      "consumerName",
      "consumerPhone",
      "consumeraddressOne",
      "consumerCity",
      "consumerCountry",
      "consumerState",
      "consumerZip",
    ];
    let control = this.newClaimForm.controls;
    if (event == true) {
      obj.forEach((key) => {
        control[key].addValidators(Validators.required);
        control[key].updateValueAndValidity();
      });
      this.completeConsumerInfo();
    } else {
      obj.forEach((key) => {
        control[key].removeValidators(Validators.required);
        control[key].updateValueAndValidity();
      });
      this.completeConsumerInfo();
    }
    this.completeConsumerInfo();
  }
  navigateToCreateClaims() {
    if (this.claimsService?.claimNumber) {
      this.claimsService.navigateBack()
    } else {
      this.router.navigate(["/residential/claims/createclaim"]);
    }
  }
  isLaborAdded(): boolean {
    let laborLines: any = [];
    this.claimsService.selectedInvoiceLines.line?.forEach((ln: any) => {
      ln.selectedLines.filter((item: any) => {
        if (item.component === "LABOR") {
          laborLines.push(item);
        }
      });
    });
    return laborLines.length > 0;
  }
  onDiscardCta() {
    if (this.claimsService?.claimNumber) {
      this.claimsService.navigateBack()
    } else {
      this.claimNumberSelcted = false;
      this.selectedSuggestion = null;
      this.newClaimForm.reset();
      this.claimsService.selectedInvoiceLines = [];
    }
  }
  confirmation() {
    this.openConfirmationModal({
      title: "Unsaved changes",
      content: "Are you certain you wish to navigate away from this page?",
      primaryActionLabel: "YES",
      secondaryActionLabel: "NO",
      onPrimaryAction: () => {
        this.onDiscardCta();
        this.modalService.hide();
      },
      onSecondaryAction: () => {
        this.modalService.hide();
      },
    });
  }
}
