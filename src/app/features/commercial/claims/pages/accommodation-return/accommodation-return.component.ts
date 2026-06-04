import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import { BsModalService, BsModalRef, ModalOptions } from "ngx-bootstrap/modal";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { StorageService } from "src/app/features/http-services/storage.service";
import { XchangeCustomCheckboxComponent } from "src/app/features/shared/form-control-components/xchange-custom-checkbox/xchange-custom-checkbox.component";
import { InvoiceSearchComponent } from "../invoice-search/invoice-search.component";
import { ErrorModalComponent } from "src/app/features/shared/components/error-modal/error-modal.component";
import { Router } from "@angular/router";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { STATES } from "src/app/features/shared/constants/States";
import { ClaimsService } from "../../services/claims.service";
import { ConfirmationDialogComponent } from "src/app/features/shared/components/confirmation-dialog/confirmation-dialog.component";
import { API_CONSTANTS } from "src/app/features/shared/constants/API-CONSTANTS";
import { ProductService } from "../../../products/pages/services/product.service";
import { DatePipe } from "@angular/common";
import { Observable } from "rxjs";
import { CLAIM_TYPES } from "src/app/features/shared/constants/CLAIMS-CONSTANTS";

@Component({
    selector: "app-accommodation-return",
    templateUrl: "./accommodation-return.component.html",
    styleUrls: ["./accommodation-return.component.scss"],
    standalone: false
})
export class AccommodationReturnComponent implements OnInit, OnDestroy {
  @ViewChild(XchangeCustomCheckboxComponent)
  child!: XchangeCustomCheckboxComponent;
  @ViewChild(InvoiceSearchComponent) newchild!: InvoiceSearchComponent;
  @ViewChild('upload') fileInput!: ElementRef;
  alertData: any = {
    message: "success",
  };
  claimTypes = CLAIM_TYPES;
  minDate = new Date();
  alertType: any = "success";
  alertTrigger: any = false;
  breadcrumbItems: BreadcrumbItems = [
    {
      name: "Home",
      path: "/commercial",
      active: false,
    },
    {
      name: "Create A New Claim",
      path: "/commercial/claims/createclaim",
      active: false,
    },
    {
      name: "Accommodation Return",
      path: "/",
      active: true,
    },
  ];
  columns = [
    { key: "invoiceSeq", title: "Invoice Line Number" },
    { key: "disputeCaseId", title: "Claim Line Number" },
    { key: "claimStatusDetail", title: "Line Status" },
    { key: "component", title: "Type" },
    { key: "styleName", title: "Style #/Desc" },
    { key: "colorName", title: "Color #/Desc" },
    { key: "dyeLot", title: "Dye Lot" },
    { key: "rollNumber", title: "Roll #" },
    { key: "partNumber", title: "Part #" },
    { key: "shipQuantity", title: "Invoice Qty" },
    { key: "pricePerUnit", title: "Invoice Unit Price" },
    {
      key: "productPrice",
      title: `Invoice Amount (USD)`,
    },
    { key: "claimQuanity", title: "Claim Quantity" },
    {
      key: "subTotal",
      title: `Sub Total (USD)`,
    },
  ];
  additionalInfo = "";
  selectedInvoiceData: any = [];
  modalRef?: BsModalRef;
  newClaimForm!: FormGroup;
  
  useAccountInformation = false;
  useAccInfoFlag = false;
  zipAlertType = "";
  dealerBtn = true;
  consumerBtn = false;

  constructor(
    private modalService: BsModalService,
    private fb: FormBuilder,
    public claimsService: ClaimsService,
    private storageService: StorageService,
    private router: Router,
    private userService: UserService,
    private productService: ProductService,
    private datePipe: DatePipe
  ) { }

  accountData: any = {};
  userInfoData: any = {};
  disabledMyAcc: boolean = false;
  ngOnDestroy() {
    this.claimsService.formMarkAsDirty.next(false);
    this.claimsService.selectedInvoiceLines = {};
  }
  ngOnInit(): void {
    this.newClaimForm = this.fb.group({
    dealerName: ["", [Validators.required, Validators.pattern("^[a-zA-Z ]*$")]],
    dealerPhone: [
      "",
      [
        Validators.required,
        Validators.min(Number("9".repeat(10))),
        Validators.max(Number("9".repeat(10))),
        Validators.maxLength(14),
      ],
    ],
    dealerPhoneExtn: [
      "",
      [
        Validators.pattern(/^[0-9]*$/),
        Validators.max(Number("9".repeat(10))),
      ],
    ],
    customerAccountNumber: [""],
    dealerEmail: [
      "",
      [
        Validators.required,
        Validators.pattern(
          /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        ),
      ],
    ],
    dealerRole: [null, [Validators.required]],
    mhkPreferredCarrier: [null, [Validators.required]],
    readyForReturn: [null],
    returnDate: [""],
    feesAcknowledge: [true],
    dealerClaimNumber: [""],
    returnContactName: [""],
    returnContactPhone: [""],
    returnContactEmail: [
      "",
      [
        Validators.pattern(
          /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        ),
      ],
    ],
    returnaddressTwo: [""],
    returnaddressOne: [""],
    returnCity: [""],
    returnState: [null],
    returnCountry: [null],
    returnZip: ["", [Validators.pattern(/^[0-9a-zA-Z ]+$/)]],
    reasonForClaimNotes: ["", [Validators.required]],
    additionalInfoNotes: [""],
  });
    this.storageService.getItem("accountData").subscribe((accountData: any) => {
      this.accountData = accountData;
      this.newClaimForm.controls["customerAccountNumber"].setValue(
        accountData?.customerNumber
      );
    });
    this.storageService.getItem("userInfo").subscribe((accountData: any) => {
      this.userInfoData = accountData;
      if (accountData?.isCustomer == true) {
        this.useAccountInformation = true;
        this.useAccInfoFlag = true;
        if (!this.claimsService.selectedInvoiceLines?.isFromClaimHistory) {
          this.newClaimForm.patchValue({ dealerRole: accountData?.primaryRole });
          this.useMyAccountInfo({ state: true });
        }
        this.useAccountInformation = this.compareDealerInfoData(this.userInfoData, this.newClaimForm.getRawValue());
      } else if (this.claimsService?.selectedInvoiceLines?.claimData?.dealerRole) {
        this.userInfoData.assignedRole = this.claimsService.determineAssignedRole(accountData);
        this.useAccountInformation = this.compareDealerInfoData(this.userInfoData, this.newClaimForm.getRawValue());
      }
    });
    this.getUserDetails();

    this.claimsService.claimNumber = "";
    if (this.claimsService.selectedInvoiceLines?.isFromClaimHistory) {
      const obj = this.newClaimForm.value;
      let newObj: any = {};
      for (let key in obj) {
        newObj[key] =
          this.claimsService.selectedInvoiceLines?.claimData[key] != undefined
            ? this.claimsService.selectedInvoiceLines?.claimData[key]
            : "";
      }
      newObj.returnaddressOne =
        this.claimsService.selectedInvoiceLines?.claimData?.returnStreet;
      this.rturnMhkPreferred(newObj.mhkPreferredCarrier);
      this.getcountry(newObj.returnCountry);
      this.newClaimForm.setValue(newObj);
      this.newClaimForm.patchValue({
        dealerPhone: this.convertToUsPhoneFormat(newObj?.dealerPhone),
      });
      this.changeReadyPickUpEntry();

      this.claimsService.selectedInvoiceLines?.claimData?.claimDocs?.entry?.filter(
        (file: any) => {
          this.filesArray.push({ key: file.key, name: file.value });
        }
      );

      this.completeDealerInfo();
      this.completeConsumerInfo();

      if (
        this.claimsService.selectedInvoiceLines?.claimData?.claimStatus.toUpperCase() !==
        "DRAFT"
      ) {
        this.disabledMyAcc = true;
        // this.useAccountInformation = true;
        for (let key in this.newClaimForm.controls) {
          if (key !== "additionalInfoNotes") {
            this.newClaimForm.controls[key].disable();
          }
        }
      }
    } else {
      // this.useAccountInformation = true;
    }
    this.claimsService.selectedProductLines.subscribe((res: any) => {
      if (res.length > 0) {
        this.completeDealerInfo();
        this.completeConsumerInfo();
      }
    },(err)=>{
      this.userService.progressHide()
    });
    if (
      !this.claimsService?.selectedInvoiceLines?.claimNumber &&
      this.columns[1].key === "disputeCaseId"
    ) {
      this.columns.splice(1, 1);
    }
    this.newClaimForm.markAsPristine();
    this.claimsService.formMarkAsDirty.subscribe((res) => {
      if (res) this.newClaimForm.markAsDirty();
    });
  }

  defaultPayload: Object = {
    claimType: this.claimTypes.ACCOMMODATION_RETURN,
    line: [],
  };
  saveClaim(requestStatus: boolean, btnRef: any = null) {
    if (requestStatus === false) {
      if (
        this.newClaimForm.invalid || this.claimsService.selectedInvoiceLines?.line?.length === 0
      ) {
        this.newClaimForm.markAllAsTouched();
        let invalidFields = [];
        for (let control in this.newClaimForm.controls) {
          if (this.newClaimForm.controls[control].invalid) {
            invalidFields.push(control);
          }
        }

        // First check consumer section if incomplete and collapsed
        if (!this.consumerBtn && document.querySelectorAll('.status-incomplete').length > 0) {
          const elementRef = document.querySelectorAll('.status-incomplete')[0] as HTMLElement;
          if (elementRef !== null) {
            elementRef.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
          }
        }

        // Then check dealer section if incomplete and collapsed
        if (!this.dealerBtn && document.querySelectorAll('.status-incomplete').length > 0) {
          const elementRef = document.querySelectorAll('.status-incomplete')[0] as HTMLElement;
          if (elementRef !== null) {
            elementRef.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
          }
        }

        // Then check for reason for claim if it's invalid
        if (this.newClaimForm.get('reasonForClaimNotes')?.invalid) {
          const reasonElement = document.querySelector('[formControlName="reasonForClaimNotes"]') as HTMLElement;
          if (reasonElement !== null) {
            reasonElement.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
          }
        }

        // Finally check other invalid fields
        else if (invalidFields.length > 0) {
          const elementRef = document.querySelector(
            `[formControlName="${invalidFields[0]}"]`
          ) as HTMLElement;
          if (elementRef !== null) {
            elementRef.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
        return;
      }

      if (this.claimsService.selectedInvoiceLines?.line?.length > 0) {
        let invaliditems = document.querySelectorAll(".sticky-col");
        if (invaliditems.length > 0) {
          const elementRef = document.querySelector(
            `[class="table-data"]`
          ) as HTMLElement;
          if (elementRef !== null) {
            elementRef.scrollIntoView({ behavior: "smooth", block: "center" });
          }
          return;
        }
      }
    }
    btnRef.disabled = true;
    const claimNumber = this.claimsService.selectedInvoiceLines.claimNumber;

    this.filesArray = this.filesArray.filter((f: any) => !f.key);
    if (claimNumber) {
      if (this.filesArray.length > 0) {
        this.userService.progressShow('addDocument')
        this.claimsService
          .postImage(
            this.filesArray,
            `${API_CONSTANTS.addDocument}?claimNumber=${claimNumber}`
          )
          .subscribe((res) => {
            this.userService.progressHide('addDocument')
            if (res.claimNumber) {
              this.saveForm(requestStatus, res.claimNumber, btnRef);
            } else {
              this.openModal(res.message);
              if (btnRef !== null) btnRef['disabled'] = false;
            }
          },(err) => {
            if (btnRef !== null) {
              btnRef['disabled'] = false;
            } this.userService.progressHide('addDocument')
          });
      } else {
        this.saveForm(requestStatus, claimNumber, btnRef);
      }
    } else {
      if (this.filesArray.length > 0) {
        this.userService.progressShow('addDocument')
        this.claimsService
          .postImage(this.filesArray, `${API_CONSTANTS.addDocument}`)
          .subscribe((res) => {
            this.userService.progressHide('addDocument')
            if (res.claimNumber) {
              this.saveForm(requestStatus, res.claimNumber, btnRef);
            } else {
              this.openModal(res.message);
              if (btnRef !== null) btnRef['disabled'] = false;
            }
          }, (err) => {
            if (btnRef !== null) {
              btnRef['disabled'] = false;
            } this.userService.progressHide('addDocument')
          });
      } else {
        this.saveForm(requestStatus, undefined, btnRef);
      }
    }
  }

  saveForm(requestStatus: boolean, claimNumber: any, btnRef: any = null) {
    let payload = {
      ...this.newClaimForm.getRawValue(),
      ...this.defaultPayload,
    };
    const loadingFor = requestStatus ? 'draft' : 'submit';
    this.userService.progressShow(loadingFor)
    payload.dealerPhone = this.getPhoneNumber(payload?.dealerPhone);
    payload.claimNumber = claimNumber;
    payload.customerAccountNumber =
      this.newClaimForm.value.customerAccountNumber;
    payload.returnStreet = `${this.newClaimForm.value.returnaddressOne} ${this.newClaimForm.value.returnaddressTwo}`;
    payload.returnStreet = payload.returnStreet?.trim() ? payload.returnStreet : "";
    payload.returnCountry = (payload?.returnCountry != null) ? payload?.returnCountry : "";
    payload.returnState = (payload?.returnState != null) ? payload?.returnState : "";
    payload.feesAcknowledge = this.newClaimForm.value.feesAcknowledge;
    payload.returnDate = this.datePipe.transform(
      this.newClaimForm.value.returnDate,
      "MM/dd/yyyy"
    );
    payload.draft = requestStatus;
    payload.create = requestStatus ? false : true;
    payload.businessArea =
      this.claimsService.selectedInvoiceLines.businessArea == undefined
        ? ""
        : this.claimsService.selectedInvoiceLines.businessArea;
    payload.erpCompanyCode =
      this.claimsService.selectedInvoiceLines.salesOrg == undefined
        ? ""
        : this.claimsService.selectedInvoiceLines.salesOrg;
    payload.invoiceNumber =
      this.claimsService.selectedInvoiceLines.invoiceNumber === undefined
        ? ""
        : this.claimsService.selectedInvoiceLines.invoiceNumber;
    payload.invoiceYear =
      this.claimsService.selectedInvoiceLines.invoiceDate == undefined
        ? ""
        : this.claimsService.selectedInvoiceLines.invoiceDate.split("/").pop();
    payload.invoiceDate =
      this.claimsService.selectedInvoiceLines.invoiceDate == undefined
        ? ""
        : this.claimsService.selectedInvoiceLines.invoiceDate;
    payload.line = [];
    (payload.reasonForClaimNotes = this.newClaimForm.value.reasonForClaimNotes),
      this.claimsService.selectedInvoiceLines?.line?.forEach((element: any) => {
        element.selectedLines.forEach((el: any) => {
          payload.line.push({
            invoiceNumber:
              this.claimsService.selectedInvoiceLines.invoiceNumber,
            invoiceLineNumber: element?.invoiceSeq,
            invoicePrice: "",
            invoiceSource: el?.source || "",
            claimQuantity: el?.claimQuantity,
            component: el?.component,
            uom: el?.uom ? el?.uom : "",
            disputeCurrency: el?.currency,
            additionalInfoNotes: el?.additionalInfoNotes,
            isSales: this.storageService.userInfo?.isSalesPerson || this.storageService.userInfo?.isSalesOps || false,
            reasonForClaimNotes: this.newClaimForm.value.reasonForClaimNotes,
            claimType: this.claimTypes.ACCOMMODATION_RETURN,
            productInstalled: false,
            disputeCaseId: (el?.disputeCaseId && el?.disputeCaseId != "NA") ? el?.disputeCaseId : "",
          });
        });
      });
    delete payload.returnaddressOne;
    delete payload.returnaddressTwo;
    if (payload.readyForReturn) {
      delete payload.returnDate;
    }
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
    payload.claimType = this.claimTypes.ACCOMMODATION_RETURN;
    if (claimNumber && patchFlag && !requestStatus) {
      this.claimsService.updateClaim(payload).subscribe(
        (res) => {
          this.userService.progressHide(loadingFor)

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
                this.storageService.setItem("claimNumber", res.body?.claimNumber);
                this.claimsService.claimNumber = res.body?.claimNumber;
                this.resetAllForms();
                this.stopAlert(false);
              } else {
                this.alertData = {
                  message: "Claim Submitted Successfully",
                };
                this.alertType = "success";
                this.alertTrigger = true;
                this.storageService.setItem("claimNumber", res.body?.claimNumber);
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
          this.userService.progressHide(loadingFor);
          this.alertData = {
            message: err.name,
          };
          this.alertType = "danger";
          this.alertTrigger = true;
          this.spinnerLoading = false;
          if (btnRef !== null) {
            btnRef['disabled'] = false;
          }
          this.userService.scrollToTop()
        }
      );
    } else {
      this.claimsService.createClaim(payload).subscribe(
        (res) => {
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
                this.storageService.setItem("claimNumber", res.body?.claimNumber);
                this.claimsService.claimNumber = res.body?.claimNumber;
                this.resetAllForms();
                this.stopAlert(true);
              } else {
                this.alertData = {
                  message: "Claim Submitted Successfully",
                };
                this.alertType = "success";
                this.alertTrigger = true;
                this.storageService.setItem("claimNumber", res.body?.claimNumber);
                this.claimsService.claimNumber = res.body?.claimNumber;
                this.resetAllForms();
                this.claimsService.expectedUnitPriceQuotedBy = "";
                this.child.onControlChange(false);
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
            btnRef['disabled'] = false;
          }
          this.userService.scrollToTop()
        }
      );
    }
  }

  rturnMhkPreferred(event: any) {
    if (event == true) {
      let control = this.newClaimForm.controls;
      control["returnContactEmail"].addValidators([
        Validators.required,
        Validators.pattern(
          /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        ),
      ]);
      control["returnContactName"].addValidators(Validators.required);
      control["returnContactPhone"].addValidators([
        Validators.required,
        Validators.pattern(/^[0-9]*$/),
        Validators.min(Number("9".repeat(9))),
        Validators.max(Number("9".repeat(10))),
      ]);
      control["returnaddressOne"].addValidators(Validators.required);
      control["returnCity"].addValidators(Validators.required);
      control["feesAcknowledge"].addValidators(Validators.required);
      control["returnZip"].addValidators(Validators.required);
      control["returnState"].addValidators(Validators.required);
      control["returnCountry"].addValidators(Validators.required);
      control["returnDate"].addValidators(Validators.required);
      control["readyForReturn"].addValidators(Validators.required);

      control["returnContactEmail"].updateValueAndValidity();
      control["returnContactName"].updateValueAndValidity();
      control["returnContactPhone"].updateValueAndValidity();
      control["returnaddressOne"].updateValueAndValidity();
      control["returnCity"].updateValueAndValidity();
      control["returnState"].updateValueAndValidity();
      control["returnCountry"].updateValueAndValidity();
      control["returnZip"].updateValueAndValidity();
      control["feesAcknowledge"].updateValueAndValidity();
      control["returnDate"].updateValueAndValidity();
      control["readyForReturn"].updateValueAndValidity();
    } else {
      let control = this.newClaimForm.controls;
      control["returnContactEmail"].removeValidators(Validators.required);
      control["returnContactName"].removeValidators(Validators.required);
      control["returnContactPhone"].removeValidators(Validators.required);
      control["returnaddressOne"].removeValidators(Validators.required);
      control["returnCity"].removeValidators(Validators.required);
      control["returnState"].removeValidators(Validators.required);
      control["returnZip"].removeValidators(Validators.required);
      control["returnCountry"].removeValidators(Validators.required);
      control["feesAcknowledge"].removeValidators(Validators.required);
      control["returnDate"].removeValidators(Validators.required);
      control["readyForReturn"].removeValidators(Validators.required);

      control["returnContactEmail"].updateValueAndValidity();
      control["returnContactName"].updateValueAndValidity();
      control["returnContactPhone"].updateValueAndValidity();
      control["returnaddressOne"].updateValueAndValidity();
      control["returnCity"].updateValueAndValidity();
      control["returnState"].updateValueAndValidity();
      control["returnCountry"].updateValueAndValidity();
      control["returnZip"].updateValueAndValidity();
      control["feesAcknowledge"].updateValueAndValidity();
      control["returnDate"].updateValueAndValidity();
      control["readyForReturn"].updateValueAndValidity();
    }
    this.newClaimForm.updateValueAndValidity();
    this.completeDealerInfo();
    this.completeConsumerInfo();
  }
  changeReadyPickUpEntry() {
    if (
      this.newClaimForm?.get("readyForReturn")?.value == false &&
      this.newClaimForm?.get("mhkPreferredCarrier")?.value == true
    ) {
      this.newClaimForm.controls["returnDate"].addValidators(
        Validators.required
      );
    } else {
      this.newClaimForm.controls["returnDate"].reset();
      this.newClaimForm.controls["returnDate"].removeValidators(
        Validators.required
      );
    }
    this.newClaimForm.controls["returnDate"].updateValueAndValidity();
  }
  resetAllForms() {
    this.newClaimForm.reset();
    this.filesArray = [];
    this.newchild?.expectedUnitForm?.reset();
    this.newchild?.invoiceSelectedLineForm?.reset();
  }
  stopAlert(isNewClaim: boolean) {
    this.goToConfirmation(isNewClaim);
  }

  avoidSpace(event: any) {
    if (event.keyCode === 32) {
      return false;
    } else {
      return undefined;
    }
  }

  invoiceRecords(data: any) {
    this.selectedInvoiceData = data;
  }
  removeInvoice(ind: Number) {
    this.claimsService.selectedInvoiceLines.line = [];
  }
  useMyAccountInfo(checked: any) {
    this.useAccountInformation = checked?.state;
    this.useAccInfoFlag = checked?.state;
    if (checked.state) {
      this.newClaimForm.controls["dealerName"].setValue(
        this.userInfoData?.name
      );
      this.newClaimForm.controls["dealerPhone"].setValue(
        this.claimsService.setPhoneNumber(this.userInfoData?.workPhone, this.userInfoData?.mobilePhone)
      );
      this.newClaimForm.controls["dealerPhoneExtn"].setValue(
        this.userInfoData?.extension
      );
      this.newClaimForm.controls["dealerClaimNumber"].setValue("");
      this.newClaimForm.controls["dealerEmail"].setValue(
        this.userInfoData?.uid
      );
      this.userInfoData.assignedRole = this.claimsService.determineAssignedRole(this.userInfoData);
      this.newClaimForm.controls["dealerRole"].setValue(this.userInfoData?.assignedRole);
      this.checkMobilePhoneValidation({
        target: { value: this.claimsService.setPhoneNumber(this.userInfoData?.workPhone, this.userInfoData?.mobilePhone) },
      });
    } else {
      if (this.claimsService.selectedInvoiceLines?.isFromClaimHistory && !this.compareDealerInfoData(this.userInfoData, this.claimsService?.selectedInvoiceLines?.claimData)) {
        let d = this.claimsService.selectedInvoiceLines?.claimData;
        this.newClaimForm.controls["dealerName"].setValue(d.dealerName);
        this.newClaimForm.controls["dealerPhone"].setValue(
          this.convertToUsPhoneFormat(d.dealerPhone)
        );
        this.newClaimForm.controls["dealerPhoneExtn"].setValue(
          d.dealerPhoneExtn
        );
        this.newClaimForm.controls["dealerClaimNumber"].setValue(
          d.dealerClaimNumber
        );
        this.newClaimForm.controls["dealerEmail"].setValue(d.dealerEmail);
        this.newClaimForm.controls["dealerRole"].setValue(d.dealerRole);
        this.checkMobilePhoneValidation({ target: { value: d?.dealerPhone } });
        this.newClaimForm.controls["dealerName"].markAsTouched();
        this.newClaimForm.controls["dealerPhone"].markAsTouched();
        this.newClaimForm.controls["dealerEmail"].markAsTouched();
        this.newClaimForm.controls["dealerRole"].markAsTouched();
      } else {
        this.newClaimForm.controls["dealerName"].setValue("");
        this.newClaimForm.controls["dealerPhone"].setValue("");
        this.newClaimForm.controls["dealerPhoneExtn"].setValue("");
        this.newClaimForm.controls["dealerClaimNumber"].setValue("");
        this.newClaimForm.controls["dealerEmail"].setValue("");
        this.newClaimForm.controls["dealerRole"].setValue("");
        this.checkMobilePhoneValidation({ target: { value: "" } });
      }
    }
  }
  gotoTop() {
    let top = document.getElementById("scrollTop");
    if (top !== null) {
      top.scrollIntoView();
      top = null;
    }
  }
  filesArray: any = [];
  uploadFile(event: any) {
    this.claimsService.uploadFile(event, this);
  }
  removeFile(index: any) {
    this.filesArray.splice(index, 1);
  }
  openModal(title: any) {
    const initialState: ModalOptions = {
      initialState: {
        title: title,
      },
    };
    this.modalRef = this.modalService.show(
      ErrorModalComponent,
      Object.assign(initialState, {
        id: "InvoiceSearchPopupComponent",
        class: "modal-lg modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }
  getUserDetails() {
    this.userService.getCurrentUserDetail().subscribe((res: any) => {
      // this.newClaimForm.patchValue({ dealerRole: res.body?.primaryRole });
    },(err)=>{
      this.userService.progressHide()
    });
  }

  goToConfirmation(isNewClaim: boolean) {
    this.newClaimForm.markAsPristine();
    this.router.navigate(
      [`/commercial/claims/accommodation-return/confirmation`],
      {
        queryParams: {
          isNewClaim: isNewClaim,
        },
      }
    );
  }
  disableDraftBtn() {
    const myFormControls = this.newClaimForm.controls;
    let disable = false;
    for (let key in myFormControls) {
      if (
        myFormControls[key].valid === false &&
        myFormControls[key].value != "" &&
        myFormControls[key].value != null
      ) {
        disable = true;
      }
    }

    return disable;
  }
  STATE_LIST: any = [];
  getcountry(country: any) {
    this.newClaimForm.patchValue({
      returnState: null,
    });

    STATES.filter((c: any) => {
      if (c.abbreviation === country) {
        this.STATE_LIST = c.states;
      }
    });
  }

  spinnerLoading = false;
  errorMessage = "";
  validateAddressOnFormChange() {
    if (
      this.newClaimForm.controls["returnaddressOne"].valid &&
      this.newClaimForm.controls["returnCity"].valid &&
      this.newClaimForm.controls["returnState"].valid &&
      this.newClaimForm.controls["returnCountry"].valid &&
      this.newClaimForm.controls["returnZip"].valid
    ) {
      /* let payload = {
        address1: this.newClaimForm.value.returnaddressOne,
        address2: this.newClaimForm.value.returnaddressTwo,
        buID: this.claimsService.selectedInvoiceLines.businessArea,
        city: this.newClaimForm.value.returnCity,
        country: this.newClaimForm.value.returnCountry,
        erpId: this.claimsService.selectedInvoiceLines.salesOrg,
        postalcode: this.newClaimForm.value.returnZip,
        state: this.newClaimForm.value.returnState,
      }; */
      let streetLine = this.newClaimForm.value.returnaddressOne;
      if(this.newClaimForm.value.returnaddressTwo){
        streetLine += " " + this.newClaimForm.value.returnaddressTwo;
      }
      const payload = `(IvVstel='',` +
        `IvCity='${this.newClaimForm.value.returnCity}',` +
        `IvCountry='${this.newClaimForm.value.returnCountry}',` +
        `IvPostalCode='${this.newClaimForm.value.returnZip}',` +
        `IvProvideAlt=1,` +
        `IvRegion='${this.newClaimForm.value.returnState}',` +
        `IvStreetLine='${encodeURIComponent(streetLine)}')?$format=json`;

      this.spinnerLoading = true;
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
            let suggestedAddress = `Suggested Address: ${EsAddress?.Addressline || ""}, 
                                    ${EsAddress?.Politicaldivision2 || ""}, ${EsAddress?.Politicaldivision1 || ""}, 
                                    ${EsAddress?.Postcodeprimarylow || ""}`;
            this.errorMessage = EvMessage == "Suggested Address" ? suggestedAddress : EvMessage;
            this.zipAlertType = "warning";
          }
        },
        error: (err: any) => {
            this.userService.progressHide()
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
      onPrimaryAction: () => { },
      onSecondaryAction: () => { },
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
  keyPressForZip(e: any) {
    let value: any = e?.target?.value + e?.key;
    return value.split(" ").length < 3 && value !== " ";
  }

  dealerFlag: boolean = false;
  completeDealerInfo() {
    if (
      this.claimsService.selectedInvoiceLines?.claimData?.claimStatus.toUpperCase() ==
      "DRAFT" ||
      this.claimsService.selectedInvoiceLines?.claimData?.claimStatus ==
      undefined
    ) {
      this.newClaimForm.controls["dealerName"].markAsTouched();
      this.newClaimForm.controls["dealerPhone"].markAsTouched();
      this.newClaimForm.controls["dealerEmail"].markAsTouched();
      this.newClaimForm.controls["dealerRole"].markAsTouched();
      this.newClaimForm.controls["mhkPreferredCarrier"].markAsTouched();
      this.dealerFlag =
        this.newClaimForm.controls["dealerName"].valid &&
        this.newClaimForm.controls["dealerPhone"].valid &&
        this.newClaimForm.controls["dealerEmail"].valid &&
        this.newClaimForm.controls["dealerRole"].valid &&
        this.newClaimForm.controls["mhkPreferredCarrier"].valid;
    } else {
      this.dealerFlag =
        this.newClaimForm.getRawValue().dealerName &&
        this.newClaimForm.getRawValue().dealerPhone &&
        this.newClaimForm.getRawValue().dealerEmail &&
        this.newClaimForm.getRawValue().dealerRole &&
        (this.newClaimForm.getRawValue().mhkPreferredCarrier == true ||
          this.newClaimForm.getRawValue().mhkPreferredCarrier == false);
    }
    // Always update useAccountInformation so checkbox stays in sync
    this.useAccountInformation = this.compareDealerInfoData(this.userInfoData, this.newClaimForm.getRawValue());
  }

  consumerFlag: boolean = false;
  completeConsumerInfo() {
    if (
      this.claimsService.selectedInvoiceLines?.claimData?.claimStatus.toUpperCase() ==
      "DRAFT" ||
      this.claimsService.selectedInvoiceLines?.claimData?.claimStatus ==
      undefined
    ) {
      if (this.newClaimForm.value.mhkPreferredCarrier == true) {
        this.consumerFlag =
          this.newClaimForm.controls["returnContactEmail"].valid &&
          this.newClaimForm.controls["returnContactName"].valid &&
          this.newClaimForm.controls["returnContactPhone"].valid &&
          this.newClaimForm.controls["returnaddressOne"].valid &&
          this.newClaimForm.controls["returnCity"].valid &&
          this.newClaimForm.controls["returnCountry"].valid &&
          this.newClaimForm.controls["returnState"].valid &&
          this.newClaimForm.controls["returnZip"].valid &&
          this.newClaimForm.controls["readyForReturn"].valid &&
          this.newClaimForm.controls["feesAcknowledge"].value;
      } else {
        this.consumerFlag =
          this.newClaimForm.controls["returnContactEmail"].valid &&
          this.newClaimForm.controls["returnContactName"].valid &&
          this.newClaimForm.controls["returnContactPhone"].valid &&
          this.newClaimForm.controls["returnaddressOne"].valid &&
          this.newClaimForm.controls["returnCity"].valid &&
          this.newClaimForm.controls["returnCountry"].valid &&
          this.newClaimForm.controls["returnState"].valid &&
          this.newClaimForm.controls["returnZip"].valid &&
          this.newClaimForm.controls["readyForReturn"].valid &&
          this.newClaimForm.controls["returnDate"].valid &&
          this.newClaimForm.controls["feesAcknowledge"].value;
      }
    } else {
      if (this.newClaimForm.getRawValue().mhkPreferredCarrier == true) {
        this.consumerFlag =
          this.newClaimForm.getRawValue().returnContactEmail &&
          this.newClaimForm.getRawValue().returnContactName &&
          this.newClaimForm.getRawValue().returnContactPhone &&
          this.newClaimForm.getRawValue().returnaddressOne &&
          this.newClaimForm.getRawValue().returnCity &&
          this.newClaimForm.getRawValue().returnCountry &&
          this.newClaimForm.getRawValue().returnState &&
          this.newClaimForm.getRawValue().returnZip &&
          this.newClaimForm.getRawValue().readyForReturn &&
          this.newClaimForm.getRawValue().feesAcknowledge;
      } else {
        this.consumerFlag =
          this.newClaimForm.getRawValue().returnContactEmail &&
          this.newClaimForm.getRawValue().returnContactName &&
          this.newClaimForm.getRawValue().returnContactPhone &&
          this.newClaimForm.getRawValue().returnaddressOne &&
          this.newClaimForm.getRawValue().returnCity &&
          this.newClaimForm.getRawValue().returnCountry &&
          this.newClaimForm.getRawValue().returnState &&
          this.newClaimForm.getRawValue().returnZip &&
          (this.newClaimForm.getRawValue().readyForReturn == true ||
            this.newClaimForm.getRawValue().readyForReturn == false) &&
          this.newClaimForm.getRawValue().returnDate &&
          (this.newClaimForm.getRawValue().feesAcknowledge == true ||
            this.newClaimForm.getRawValue().feesAcknowledge == false);
      }
    }
  }

  openAccordion(c: any) {
    if (c == "dealer") {
      if (this.dealerBtn == true) {
        this.dealerBtn = false;
      } else {
        this.dealerBtn = true;
        this.consumerBtn = false;
      }
    } else if (c == "consumer") {
      if (this.consumerBtn == true) {
        this.consumerBtn = false;
      } else {
        this.dealerBtn = false;
        this.consumerBtn = true;
      }
    }
  }
  public onDeactivate(): Observable<any> | Promise<any> | boolean {
    if (
      this.newClaimForm.dirty ||
      this.filesArray.length > 0 ||
      this.newchild?.expectedUnitForm?.dirty ||
      this.newchild?.invoiceSelectedLineForm?.dirty
    ) {
      return true;
    } else {
      return false;
    }
  }
  acknowledgeFee(e: any) {
    this.newClaimForm.controls["feesAcknowledge"].setValue(e.state);
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
    this.completeDealerInfo();
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
  compareDealerInfoData(profileInfo: any, form: any): boolean {
    if (!profileInfo) return false;
    const phone = this.claimsService.extractPhoneNumber(form?.dealerPhone);
    profileInfo.workPhone = this.claimsService.extractPhoneNumber(profileInfo?.workPhone);
    profileInfo.mobilePhone = this.claimsService.extractPhoneNumber(profileInfo?.mobilePhone);
    return (
      form?.dealerName == profileInfo?.name &&
      phone == this.claimsService.setPhoneNumber(profileInfo?.workPhone, profileInfo?.mobilePhone) &&
      form?.dealerEmail == profileInfo?.uid &&
      (form?.dealerRole == profileInfo?.primaryRole || form?.dealerRole == profileInfo?.assignedRole));
  }
  navigateToBack() {
    if (this.claimsService.selectedInvoiceLines?.isFromClaimHistory) {
      this.claimsService.navigateBack();
    } else {
      this.router.navigate(['/commercial/claims/createclaim']);
    }
  }
}
