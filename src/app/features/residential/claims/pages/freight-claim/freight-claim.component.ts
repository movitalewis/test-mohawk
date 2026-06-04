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
import { ClaimsService } from "src/app/features/residential/claims/services/claims.service";
import { StorageService } from "src/app/features/http-services/storage.service";
import { XchangeCustomCheckboxComponent } from "src/app/features/shared/form-control-components/xchange-custom-checkbox/xchange-custom-checkbox.component";
import { InvoiceSearchComponent } from "../invoice-search/invoice-search.component";
import { ErrorModalComponent } from "src/app/features/shared/components/error-modal/error-modal.component";
import { Router } from "@angular/router";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { API_CONSTANTS } from "src/app/features/shared/constants/API-CONSTANTS";
import { Observable } from "rxjs";
import { CLAIM_TYPES } from "src/app/features/shared/constants/CLAIMS-CONSTANTS";
import { MESSAGE_CONSTANTS } from "src/app/features/shared/constants/MESSAGE-CONSTANTS";
import { ProgressModalComponent } from "src/app/features/shared/components/progress-modal/progress-modal.component";
@Component({
    selector: "app-freight-claim",
    templateUrl: "./freight-claim.component.html",
    styleUrls: ["./freight-claim.component.scss"],
    standalone: false
})
export class FreightClaimComponent implements OnInit, OnDestroy {
  @ViewChild(XchangeCustomCheckboxComponent)
  child!: XchangeCustomCheckboxComponent;
  @ViewChild(InvoiceSearchComponent) newchild!: InvoiceSearchComponent;
  @ViewChild('upload') fileInput!: ElementRef;
  alertData: any = {
    message: "success",
  };
  claimTypes = CLAIM_TYPES;
  alertType: any = "success";
  alertTrigger: any = false;
  columns = [
    { key: "invoiceSeq", title: "Invoice Line Number" },
    { key: "disputeCaseId", title: "Claim Line Number" },
    { key: "claimStatusDetail", title: "Line Status" },
    { key: "component", title: "Type" },
    { key: "styleName", title: "Style #/Desc" },
    { key: "colorName", title: "Color #/Desc" },
    { key: "shipQuantity", title: "Invoice Quantity" },
    {
      key: "freightCharge",
      title: `Charge (USD)`,
    },
    {
      key: "claimAmount",
      title: `Claim Amount (USD)*`,
    },
  ];

  breadcrumbItems: BreadcrumbItems = [
    {
      name: "Home",
      path: "/residential",
      active: false,
    },
    {
      name: "Create A New Claim",
      path: "/residential/claims/createclaim",
      active: false,
    },
    {
      name: "Freight Billing Error",
      path: "/",
      active: true,
    },
  ];
  additionalInfo = "";
  selectedInvoiceData: any = [];
  modalRef?: BsModalRef;
  newClaimForm!: FormGroup ;
  dealerBtn = true;
  reasonsBtn = false;
  loadingFor: any;

  constructor(
    private modalService: BsModalService,
    private fb: FormBuilder,
    public claimsService: ClaimsService,
    public bsModalRef: BsModalRef,
    private storageService: StorageService,
    private router: Router,
    private userService: UserService
  ) {}

  openModal(title: any) {
    const initialState: ModalOptions = {
      initialState: {
        title: title,
      },
    };
    this.bsModalRef = this.modalService.show(
      ErrorModalComponent,
      Object.assign(initialState, {
        id: "InvoiceSearchPopupComponent",
        class: "modal-lg modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }
  accountData: any = {};
  userInfoData: any = {};
  isDraftClaim = true;
  useAccountInformation = false;
  useAccInfoFlag = false;
  disabledMyAcc: boolean = false;
  spinnerLoading: boolean = false;
  uploadFileFlag: boolean = false;
  ngOnDestroy() {
    this.claimsService.formMarkAsDirty.next(false);
    this.claimsService.selectedInvoiceLines = {};
  }
  ngOnInit(): void {
    this.newClaimForm = this.fb.group({
    dealerName: ["", [Validators.required]],
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
    dealerEmail: [
      "",
      [
        Validators.required,
        Validators.pattern(
          /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        ),
      ],
    ],
    customerAccountNumber: ["216650"],

    dealerClaimNumber: [""],
    dealerRole: [null, [Validators.required]],
    additionalInfoNotes: [""],
    reasonForClaimNotes: ["", [Validators.required]],
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
      this.newClaimForm.setValue(newObj);
      this.newClaimForm.patchValue({
        dealerPhone: this.convertToUsPhoneFormat(newObj?.dealerPhone),
      });
      this.claimsService.selectedInvoiceLines?.claimData?.claimDocs?.entry?.filter(
        (file: any) => {
          this.filesArray.push({ key: file.key, name: file.value });
        }
      );
      this.completeDealerInfo();
      this.completeReasonsInfo();
      if (
        this.claimsService.selectedInvoiceLines?.claimData?.claimStatus.toUpperCase() !==
        "DRAFT"
      ) {
        this.disabledMyAcc = true;
        // this.useAccountInformation = true;
        this.isDraftClaim = false;
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
        this.completeReasonsInfo();
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
    // this.newClaimForm.markAsPristine();
    this.claimsService.formMarkAsDirty.subscribe((res) => {
      if (res) this.newClaimForm.markAsDirty();
    });
  }

  defaultPayload: Object = {
    claimType: this.claimTypes.FREIGHT,
    line: [],
  };
  saveClaim(requestStatus: boolean, invoiceSearchRef: any, btnRef: any = null) {
    if(requestStatus === false){    
    if (
      this.newClaimForm.invalid || this.claimsService.selectedInvoiceLines?.line?.length === 0) {
      this.newClaimForm.markAllAsTouched();
      let invalidFields = [];
      for (let control in this.newClaimForm.controls) {
        if (this.newClaimForm.controls[control].invalid) {
          invalidFields.push(control);
        }
      }
      if(!this.dealerBtn){
        const elementRef = document.querySelectorAll('.status-incomplete').length > 0 ? document.querySelectorAll('.status-incomplete')[0] as HTMLElement : null;
        if (elementRef !== null) {
          elementRef.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      } 
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
    if(this.claimsService.selectedInvoiceLines?.line?.length > 0){
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
              this.saveForm(requestStatus, res.claimNumber,btnRef);
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
        this.saveForm(requestStatus, claimNumber,btnRef);
      }
    } else {
      if (this.filesArray.length > 0) {
        this.userService.progressShow('addDocument')
        this.claimsService
          .postImage(this.filesArray, `${API_CONSTANTS.addDocument}`)
          .subscribe((res) => {
            this.userService.progressHide('addDocument')
            if (res.claimNumber) {
              this.saveForm(requestStatus, res.claimNumber,btnRef);
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
        this.saveForm(requestStatus, undefined,btnRef);
      }
    }
  }

  saveForm(requestStatus: boolean, claimNumber: any,btnRef:any=null) {
    let payload = {
      ...this.newClaimForm.getRawValue(),
      ...this.defaultPayload,
    };
    this.loadingFor = requestStatus ? 'draft' : 'submit';
      this.userService.progressShow(this.loadingFor)
    payload.dealerPhone = this.getPhoneNumber(payload?.dealerPhone);
    payload.claimNumber = claimNumber;
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
    this.claimsService.selectedInvoiceLines?.line.forEach((element: any) => {
      element.selectedLines.forEach((el: any) => {
        payload.line.push({
          invoiceNumber: this.claimsService.selectedInvoiceLines.invoiceNumber,
          invoiceLineNumber: element?.invoiceSeq,
          invoicePrice: "",
          invoiceSource: el?.source || "",
          component: el?.component,
          disputeAmount: el?.claimAmount?.replace(",", "").replace("$", ""),
          disputeCurrency: el?.currency,
          additionalInfoNotes: el?.additionalInfoNotes,
          isSales: this.storageService.userInfo?.isSalesPerson || this.storageService.userInfo?.isSalesOps || false,
          reasonForClaimNotes: this.newClaimForm.value.reasonForClaimNotes,
          uom: el?.uom ? el?.uom : "",
          amountProductAffected: 1,
          claimType: this.claimTypes.FREIGHT,
          productInstalled: false,
          disputeCaseId: (el?.disputeCaseId && el?.disputeCaseId != "NA") ? el?.disputeCaseId : "",
        });
      });
    });
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
     

    payload.claimType = this.claimTypes.FREIGHT;
    if (claimNumber && patchFlag && !requestStatus) {
      this.claimsService.updateClaim(payload).subscribe(
        (res) => {
          this.userService.progressHide(this.loadingFor)
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
                this.userService.scrollToTop()
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
                this.userService.scrollToTop()
                this.removeInvoice(0);
                this.stopAlert(false);
              }
            }
          }
        },
        (err) => {
          this.userService.progressHide(this.loadingFor)
       
          this.alertData = {
            message: err.name,
          };
          this.alertType = "danger";
          this.alertTrigger = true;
          this.spinnerLoading = false;
          if(btnRef !== null){
            btnRef['disabled'] = false;
          }
          this.userService.scrollToTop()
        }
      );
    } else {
      this.claimsService.createClaim(payload).subscribe(
        (res) => {
          this.userService.progressHide(this.loadingFor);
       
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
                this.userService.scrollToTop()
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
                this.userService.scrollToTop()
                this.removeInvoice(0);
                this.stopAlert(true);
              }
            }
          }
        },
        (err) => {
          this.userService.progressHide(this.loadingFor)
          this.alertData = {
            message: err.name,
          };
          this.alertType = "danger";
          this.alertTrigger = true;
          this.spinnerLoading = false;
          if(btnRef !== null){
            btnRef['disabled'] = false;
          }
          this.userService.scrollToTop()
        }
      );
    }
  }
  resetAllForms() {
    this.newClaimForm.reset();
    this.filesArray = [];
    this.newchild?.expectedUnitForm?.reset();
    this.newchild?.invoiceSelectedLineForm?.reset();
    this.newchild?.nonProductlineForm?.reset();
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
        this.convertToUsPhoneFormat(this.claimsService.setPhoneNumber(this.userInfoData?.workPhone, this.userInfoData?.mobilePhone))
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

  alphaNumericOnly(event: any) {
    if (
      (event.keyCode >= 48 && event.keyCode <= 57) ||
      (event.keyCode >= 65 && event.keyCode <= 90) ||
      (event.keyCode >= 97 && event.keyCode <= 122)
    ) {
      return true;
    } else {
      return false;
    }
  }

  getUserDetails() {
    this.userService.getCurrentUserDetail().subscribe((res: any) => {
      // this.newClaimForm.patchValue({ dealerRole: res.body?.primaryRole });
    },(err)=>{
      this.userService.progressHide()
    });
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

  goToConfirmation(isNewClaim: boolean) {
    this.newClaimForm.markAsPristine();
    this.router.navigate([`/residential/claims/freight-billing-error/confirmation`], {
      queryParams: {
        isNewClaim: isNewClaim,
      },
    });
    this.newClaimForm.reset();
    this.claimsService.selectedInvoiceLines = [];
  }

  isMyAccDetailsUsed() {}

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
      this.dealerFlag =
        this.newClaimForm.controls["dealerName"].valid &&
        this.newClaimForm.controls["dealerPhone"].valid &&
        this.newClaimForm.controls["dealerEmail"].valid &&
        this.newClaimForm.controls["dealerRole"].valid;
    } else {
      this.dealerFlag =
        this.newClaimForm.getRawValue().dealerName &&
        this.newClaimForm.getRawValue().dealerPhone &&
        this.newClaimForm.getRawValue().dealerEmail &&
        this.newClaimForm.getRawValue().dealerRole;
    }
    // Always update useAccountInformation so checkbox stays in sync
    this.useAccountInformation = this.compareDealerInfoData(this.userInfoData, this.newClaimForm.getRawValue());
  }

  reasonsFlag: boolean = false;
  completeReasonsInfo() {
    this.reasonsFlag = this.newClaimForm.controls["reasonForClaimNotes"].valid;
  }

  openAccordion(c: any) {
    if (c == "dealer") {
      if (this.dealerBtn == true) {
        this.dealerBtn = false;
      } else {
        this.dealerBtn = true;
        this.reasonsBtn = false;
      }
    } else if (c == "reasons") {
      if (this.reasonsBtn == true) {
        this.reasonsBtn = false;
      } else {
        this.dealerBtn = false;
        this.reasonsBtn = true;
      }
    }
  }
  public onDeactivate(): Observable<any> | Promise<any> | boolean {
    if (
      this.newClaimForm.dirty ||
      this.filesArray.length > 0 ||
      this.newchild?.expectedUnitForm?.dirty ||
      this.newchild?.invoiceSelectedLineForm?.dirty ||
      this.newchild?.nonProductlineForm?.dirty
    ) {
      return true;
    } else {
      return false;
    }
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
      this.router.navigate(['/residential/claims/createclaim']);
    }
  }
}
