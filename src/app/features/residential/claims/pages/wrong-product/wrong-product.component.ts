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
import { STATES } from "src/app/features/shared/constants/States";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { ProductService } from "../../../products/pages/services/product.service";
import { API_CONSTANTS } from "src/app/features/shared/constants/API-CONSTANTS";
import { ConfirmationDialogComponent } from "src/app/features/shared/components/confirmation-dialog/confirmation-dialog.component";
import { Observable } from "rxjs";
import { DatePipe } from "@angular/common";
import { CLAIM_TYPES } from "src/app/features/shared/constants/CLAIMS-CONSTANTS";

@Component({
    selector: "app-wrong-product",
    templateUrl: "./wrong-product.component.html",
    styleUrls: ["./wrong-product.component.scss"],
    standalone: false
})
export class WrongProductComponent implements OnInit, OnDestroy {
  @ViewChild("scrollLaborTarget") scrollTarget!: ElementRef;
  @ViewChild(XchangeCustomCheckboxComponent)
  child!: XchangeCustomCheckboxComponent;
  @ViewChild(InvoiceSearchComponent) newchild!: InvoiceSearchComponent;
  @ViewChild("setstate") setstate!: ElementRef;
  @ViewChild('upload') fileInput!: ElementRef;
  alertData: any = {
    message: "success",
  };
  claimTypes = CLAIM_TYPES;
  alertType: any = "success";
  alertTrigger: any = false;
  minDate = new Date();
  columns = [
    { key: "invoiceSeq", title: " Invoice Line Number" },
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
    { key: "claimQuantity", title: "Claim Quantity" },
    {
      key: "subTotal",
      title: `Sub Total (USD)`,
    },
  ];
  STATE_LIST: any = [];
  STATE_LIST_RETURN: any = [];
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
      name: "Wrong Product Claim",
      path: "/",
      active: true,
    },
  ];
  additionalInfo = "";
  selectedInvoiceData: any = [];
  modalRef?: BsModalRef;
  useAccountInformation = false;
  useAccInfoFlag = false;

  newClaimForm!: FormGroup ;
  laborDetailsExpand: boolean = false;
  laborLineAccordionFlag: boolean = true;
  laborFlag: boolean = false;
  showLaborDetails: boolean = false;

  selectValueChange(event: any) {
    let control = this.newClaimForm.controls;

    if (event === "Other") {
      control["otherLabelValue"].addValidators(Validators.required);
      control["otherLabelValue"].updateValueAndValidity();
    } else {
      control["otherLabelValue"].removeValidators(Validators.required);
      control["otherLabelValue"].updateValueAndValidity();
    }
  }

  productInstalled(event: any, clearReturnInfo: boolean) {
    let control = this.newClaimForm.controls;
    this.updateValidatorsForReturn(event, clearReturnInfo);
    control["wrongProductDesc"].addValidators(Validators.required);
    control["wrongProductDesc"].updateValueAndValidity();
    if (event) {
      control["projectSiteName"].addValidators(Validators.required);
      control["consumerName"].addValidators(Validators.required);
      control["consumerPhone"].addValidators(Validators.required);
      control["consumeraddressOne"].addValidators(Validators.required);
      control["consumerCity"].addValidators(Validators.required);
      control["consumerCountry"].addValidators(Validators.required);
      control["consumerState"].addValidators(Validators.required);
      control["consumerZip"].addValidators(Validators.required);
      control["projectSiteName"].updateValueAndValidity();
      control["consumerName"].updateValueAndValidity();
      control["consumerPhone"].updateValueAndValidity();
      control["consumeraddressOne"].updateValueAndValidity();
      control["consumerCity"].updateValueAndValidity();
      control["consumerCountry"].updateValueAndValidity();
      control["consumerState"].updateValueAndValidity();
      control["consumerZip"].updateValueAndValidity();
    } else {
      control["projectSiteName"].removeValidators(Validators.required);
      control["consumerName"].removeValidators(Validators.required);
      control["consumerPhone"].removeValidators(Validators.required);
      control["consumeraddressOne"].removeValidators(Validators.required);
      control["consumerCity"].removeValidators(Validators.required);
      control["consumerCountry"].removeValidators(Validators.required);
      control["consumerState"].removeValidators(Validators.required);
      control["consumerZip"].removeValidators(Validators.required);
      control["projectSiteName"].updateValueAndValidity();
      control["consumerName"].updateValueAndValidity();
      control["consumerPhone"].updateValueAndValidity();
      control["consumeraddressOne"].updateValueAndValidity();
      control["consumerCity"].updateValueAndValidity();
      control["consumerCountry"].updateValueAndValidity();
      control["consumerState"].updateValueAndValidity();
      control["consumerZip"].updateValueAndValidity();
    }
  }
  zipAlertType = "";
  constructor(
    private modalService: BsModalService,
    private fb: FormBuilder,
    public claimsService: ClaimsService,
    public bsModalRef: BsModalRef,
    public storageService: StorageService,
    private router: Router,
    private userService: UserService,
    private productService: ProductService,
    private datePipe: DatePipe
  ) {}
  accountData: any = {};
  userInfoData: any = {};
  disabledMyAcc: boolean = false;
  disableLaborFields = false;
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
      dealerClaimNumber: [""],
      dealerRole: [null, [Validators.required]],
      claimQuantity: ["", [Validators.pattern(/^[0-9]*$/)]],
      otherLabelValue: [""],
      projectSiteName: [
        "",
      ],
      consumerName: [
        "",
      ],
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
        [Validators.pattern(/^[0-9]*$/), Validators.max(Number("9".repeat(10)))],
      ],
      consumerEmail: [
        "",
        [
          Validators.pattern(
            /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          ),
        ],
      ],
      productInstalled: [null, [Validators.required]],
      allowanceToKeep: [null, [Validators.required]],
      consumeraddressOne: [
        "",
      ],
      consumeraddressTwo: [""],
      consumerCity: [
        "",
      ],
      consumerCountry: [
        null,
      ],
      consumerState: [
        null,
      ],
      consumerZip: [
        "",
        [
          Validators.pattern(/^[0-9a-zA-Z ]+$/),
        ],
      ],
      reasonForClaimNotes: ["", [Validators.required]],
      additionalInfoNotes: [null],
      wrongProductDesc: [
        null, [Validators.required]
      ],
      readyForReturn: [null],
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
      returnDate: [""],
      returnZip: ["", [Validators.required, Validators.pattern(/^[0-9a-zA-Z ]+$/)]],
      totalSqFtReplaced: [""],
      totalLaborRequested: [""],
      mohawkReplacementOrder: [""],
      replacedWithMohawkMaterial: [null],
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
      this.getcountry(newObj.consumerCountry, "consumer");
      this.getcountry(newObj.returnCountry, "return");
      newObj.consumeraddressOne =
        this.claimsService.selectedInvoiceLines?.claimData?.consumerStreet;
      newObj.productInstalled = this.claimsService.selectedInvoiceLines
        ?.claimData?.productInstalled
        ? true
        : false;
      newObj.allowanceToKeep =
        this.claimsService.selectedInvoiceLines?.claimData?.allowanceToKeep == undefined
          ? null : this.claimsService.selectedInvoiceLines?.claimData?.allowanceToKeep;
      newObj.returnaddressOne =
        this.claimsService.selectedInvoiceLines?.claimData?.returnStreet;
      if (
        newObj["wrongProductDesc"] == "Label wrong, wrong material received" ||
        newObj["wrongProductDesc"] ==
          "Label correct, wrong material received" ||
        newObj["wrongProductDesc"] ==
          "Product is correct but does not match sample"
      ) {
        newObj.wrongProductDesc =
          this.claimsService.selectedInvoiceLines?.claimData
            ?.wrongProductDesc == undefined
            ? ""
            : this.claimsService.selectedInvoiceLines?.claimData
                ?.wrongProductDesc;
        newObj.otherLabelValue = "";
      } else {
        newObj.wrongProductDesc = "Other";
        newObj.otherLabelValue =
          this.claimsService.selectedInvoiceLines?.claimData
            ?.wrongProductDesc == undefined
            ? ""
            : this.claimsService.selectedInvoiceLines?.claimData
                ?.wrongProductDesc;
      }

      this.newClaimForm.setValue(newObj);
      this.newClaimForm.patchValue({
        dealerPhone: this.convertToUsPhoneFormat(newObj?.dealerPhone),
      });
      this.productInstalled(newObj?.productInstalled == true, false);
      this.selectValueChange(newObj.wrongProductDesc)
      this.checkPhoneValidation({ target: { value: newObj?.consumerPhone } }, 'consumerPhone');
      this.checkPhoneValidation({ target: { value: newObj?.returnContactPhone } }, 'returnContactPhone'); 
      this.claimsService.selectedInvoiceLines?.claimData?.claimDocs?.entry?.filter(
        (file: any) => {
          this.filesArray.push({ key: file.key, name: file.value });
        }
      );
      this.completeConsumerInfo();
      if (
        this.claimsService.selectedInvoiceLines?.claimData?.claimStatus.toUpperCase() !==
        "DRAFT"
      ) {
        this.disabledMyAcc = true;
        this.disableLaborFields = this.claimsService.selectedInvoiceLines?.claimData?.claimStatus.toUpperCase() == 'IN PROCESS' ? false : true;
        // this.useAccountInformation = true;
        const skipKeys = ["additionalInfoNotes", "totalSqFtReplaced",
          "totalLaborRequested",
          "replacedWithMohawkMaterial", "mohawkReplacementOrder"];
        for (let key in this.newClaimForm.controls) {
          if (!skipKeys.includes(key)) {
            this.newClaimForm.controls[key].disable();
          }
        }
      }
    } else {
      // this.useAccountInformation = true;
    }

    this.claimsService.selectedProductLines.subscribe((res: any) => {
      this.showLaborDetails = false;
      if (res.length > 0) {
        this.newClaimForm.setControl('invoiceLines', this.fb.array([]));
        this.completeConsumerInfo();
        this.claimsService.selectedInvoiceLines?.line?.forEach(
          (ln: any, index: number) => {
            if (ln.selectedLines.length > 0) {
              ln.selectedLines.filter((inv: any) => {
                // if (inv.component === "PRODUCT") {
                //   inv.isOpen = true;
                // }
                if (inv.component === "LABOR") {
                  this.setValidatorsForLabor(true);
                  this.showLaborDetails = true;
                  this.setLaborValues(inv);
                  this.completeLaborInfo();
                }
              });
            }
          }
        );
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
    claimType: this.claimTypes.WRONG_PRODUCT,
    productDefective: true,
    wrongProduct: true,
    line: [],
  };
  saveClaim(requestStatus: boolean, btnRef: any = null) {
    if(requestStatus === false){    
      if (
        this.newClaimForm.invalid || this.claimsService.selectedInvoiceLines?.line?.length === 0
      ) {
        this.newClaimForm.markAllAsTouched();
        let invalidFields = [];
        for (let control in this.newClaimForm.controls) {
          if (this.newClaimForm.controls[control].invalid && control !== 'invoiceLines') {
            invalidFields.push(control);
          }
        }

        // First check dealer section if incomplete and collapsed
        if(!this.dealerBtn && document.querySelectorAll('.status-incomplete').length > 0){
          const elementRef = document.querySelectorAll('.status-incomplete')[0] as HTMLElement;
          if (elementRef !== null) {
            elementRef.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
          }
        }

        // Then check consumer section if incomplete and collapsed
        if(!this.consumerBtn && document.querySelectorAll('.status-incomplete').length > 0){
          const elementRef = document.querySelectorAll('.status-incomplete')[0] as HTMLElement;
          if (elementRef !== null) {
            elementRef.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
          }
        }

        // Then check return section if incomplete and collapsed
        if(!this.returnAccordion && document.querySelectorAll('.status-incomplete').length > 0){
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
        if (invalidFields.length > 0) {
          if (
            invalidFields[0] == "totalSqFtReplaced" ||
            invalidFields[0] == "totalLaborRequested" ||
            invalidFields[0] == "mohawkReplacementOrder" ||
            invalidFields[0] == "replacedWithMohawkMaterial"
          ) {
            this.laborDetailsExpand = true;
          }
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
          },(err) => {
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
    payload.draft = requestStatus;
    payload.create = requestStatus ? false : true;
    payload.productInstalled = payload.productInstalled ? true : false;
    payload.allowanceToKeep = payload.allowanceToKeep;
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
    payload.consumerStreet =
      payload.consumeraddressOne + " " + payload.consumeraddressTwo;
    payload.consumerAddressOne = payload.consumeraddressOne?.trim() ? payload.consumeraddressOne : "";
    payload.consumerAddressTwo = payload.consumeraddressTwo?.trim() ? payload.consumeraddressTwo : "";
    payload.consumerStreet = payload.consumerStreet?.trim() ? payload.consumerStreet : "";
    payload.consumerCountry = (payload?.consumerCountry != null) ? payload?.consumerCountry : "";
    payload.consumerState = (payload?.consumerState != null) ? payload?.consumerState : "";
    payload.wrongProductDesc =
      payload.wrongProductDesc == "Other"
        ? payload.otherLabelValue
        : payload.wrongProductDesc;
    payload.returnDate = this.newClaimForm.value.returnDate == ""
      ? ""
      : this.datePipe.transform(
        this.newClaimForm.value.returnDate,
        "MM/dd/yyyy"
      );
    payload.consumerPhone = this.getPhoneNumber(payload?.consumerPhone);
    payload.returnContactPhone = this.getPhoneNumber(payload?.returnContactPhone);
    payload.returnStreet = `${this.newClaimForm.value.returnaddressOne} ${this.newClaimForm.value.returnaddressTwo}`;
    payload.returnStreet = payload.returnStreet?.trim() ? payload.returnStreet : "";
    payload.returnCountry = (payload?.returnCountry != null) ? payload?.returnCountry : "";
    payload.returnState = (payload?.returnState != null) ? payload?.returnState : "";
    payload.suggestedResolution = this.setsuggestedResolutionValue(payload.suggestedResolution);
    payload.laborLineExists = this.isLaborAdded() ? true : false;
    payload.line = [];
    payload.replacementOrderNo = this.newClaimForm.value?.mohawkReplacementOrder || "";
    this.claimsService.selectedInvoiceLines?.line?.forEach((element: any) => {
      element.selectedLines.forEach((el: any) => {
        if(!(el.component === 'PRODUCT' && el?.standaloneLine == true)){
        if(el.component !==  "LABOR"){
        payload.line.push({
          invoiceNumber: this.claimsService.selectedInvoiceLines.invoiceNumber,
          invoiceLineNumber: element?.invoiceSeq,
          invoicePrice: "",
          invoiceSource: el?.source || "",
          component: el?.component,
          uom: el?.uom ? el?.uom : "",
          disputeCurrency: el?.currency,
          additionalInfoNotes: el?.additionalInfoNotes,
          isSales: this.storageService.userInfo?.isSalesPerson || this.storageService.userInfo?.isSalesOps || false,
          reasonForClaimNotes: this.newClaimForm.value.reasonForClaimNotes,
          claimQuantity: el?.claimQuantity,
          claimType: this.claimTypes.WRONG_PRODUCT,
          productInstalled: payload.productInstalled ? true : false,
          disputeCaseId: (el?.disputeCaseId && el?.disputeCaseId != "NA") ? el?.disputeCaseId : "",
        });
        }else{
        const productLine = element.selectedLines.find((item: any) => item.component === 'PRODUCT');
        payload.line.push({
            invoiceNumber: this.claimsService.selectedInvoiceLines.invoiceNumber,
            invoiceLineNumber: element?.invoiceSeq,
            invoicePrice: "",
            component: el?.component,
            invoiceSource: productLine?.source || "",
            disputeAmount: this.newClaimForm?.value?.totalLaborRequested || "",
            disputeCurrency: productLine?.currency || "",
            additionalInfoNotes: el?.additionalInfoNotes,
            isSales: this.storageService.userInfo?.isSalesPerson || this.storageService.userInfo?.isSalesOps || false,
            replacedWithMhk :this.newClaimForm.value.replacedWithMohawkMaterial, //New question 
			      replacementOrderNo :this.newClaimForm.value.mohawkReplacementOrder, // New question
            reasonForClaimNotes: this.newClaimForm.value.reasonForClaimNotes,
            uom: productLine.uom,
            claimQuantity: this.newClaimForm.value.totalSqFtReplaced,
            claimType: this.claimTypes.WRONG_PRODUCT,
            productInstalled: payload.productInstalled ? true : false,
            disputeCaseId: (el?.disputeCaseId && el?.disputeCaseId != "NA") ? el?.disputeCaseId : "",

      });
      }
      }
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
    payload.claimType = this.claimTypes.WRONG_PRODUCT;
    delete payload?.invoiceLines;
    delete payload?.totalSqFtReplaced;
    delete payload?.totalLaborRequested;
    delete payload?.mohawkReplacementOrder;
    delete payload?.replacedWithMohawkMaterial;
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
          if(btnRef !== null){
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
  getcountry(country: any, type: any) {
    STATES.filter((c: any) => {
      if (c.abbreviation == country && type == "return") {
        this.newClaimForm.patchValue({
          returnState: null,
        });
        this.STATE_LIST_RETURN = c.states;
      } else if (c.abbreviation == country && type == "consumer") {
        this.newClaimForm.patchValue({
          consumerState: null,
        });
        this.STATE_LIST = c.states;
      }
    });
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
    this.router.navigate([`/residential/claims/wrong-product-claim/confirmation`], {
      queryParams: {
        isNewClaim: isNewClaim,
      },
    });
    this.newClaimForm.reset();
    this.claimsService.selectedInvoiceLines = [];
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

  disputeAmount(el: any) {
    if (el?.component == "PRODUCT") {
      return el?.productPrice;
    } else if (el?.component == "FREIGHT") {
      return el?.freightCharge;
    } else if (el?.component == "MISC") {
      return el?.miscCharge;
    } else if (el?.component == "TAX") {
      return el?.taxAmount;
    }
  }

  spinnerLoading = false;
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
      let streetLine = this.newClaimForm.value.consumeraddressOne;
      if(this.newClaimForm.value.consumeraddressTwo){
        streetLine += " " + this.newClaimForm.value.consumeraddressTwo;
      }
      const payload = `(IvVstel='',` +
      `IvCity='${this.newClaimForm.value.consumerCity}',` +
      `IvCountry='${this.newClaimForm.value.consumerCountry}',` +
      `IvPostalCode='${this.newClaimForm.value.consumerZip}',` +
      `IvProvideAlt=1,` +
      `IvRegion='${this.newClaimForm.value.consumerState}',` +
      `IvStreetLine='${encodeURIComponent(streetLine)}')?$format=json`;

      this.spinnerLoading = true;
      this.errorMessage = "";
      this.errorMessage = "";
      this.zipAlertType = "";
      this.productService.validateAddress(payload).subscribe({
        next: (res: any) => {
          this.spinnerLoading = false;
          const EvStatus = res?.d?.EvStatus;
          const EvMessage = res?.d?.EvMessage;
          if(EvStatus == "S"){
            this.validateAddressModal("Address is valid");
            this.errorMessage = "Address is valid";
            this.zipAlertType = "success";
          }else {
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
  keyPressForZip(e: any) {}

  completeDealerInfo() {
    let dealerFlag = false;

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
      dealerFlag =
        this.newClaimForm.controls["dealerName"].valid &&
        this.newClaimForm.controls["dealerPhone"].valid &&
        this.newClaimForm.controls["dealerEmail"].valid &&
        this.newClaimForm.controls["dealerRole"].valid;
    } else {
      dealerFlag =
        this.newClaimForm.getRawValue().dealerName &&
        this.newClaimForm.getRawValue().dealerPhone &&
        this.newClaimForm.getRawValue().dealerEmail &&
        this.newClaimForm.getRawValue().dealerRole;
    }
    // Always update useAccountInformation so checkbox stays in sync
    this.useAccountInformation = this.compareDealerInfoData(this.userInfoData, this.newClaimForm.getRawValue());
    return dealerFlag;
  }

  completeConsumerInfo() {
    let consumerFlag: boolean = false;
    if (
      this.claimsService.selectedInvoiceLines?.claimData?.claimStatus.toUpperCase() ==
      "DRAFT" ||
      this.claimsService.selectedInvoiceLines?.claimData?.claimStatus ==
      undefined
    ) {
      if (this.newClaimForm.getRawValue().productInstalled == true) {
        consumerFlag =
          this.newClaimForm.controls["projectSiteName"].valid &&
          this.newClaimForm.controls["consumerName"].valid &&
          this.newClaimForm.controls["consumerPhone"].valid &&
          this.newClaimForm.controls["consumeraddressOne"].valid &&
          this.newClaimForm.controls["consumerCity"].valid &&
          this.newClaimForm.controls["consumerCountry"].valid &&
          this.newClaimForm.controls["consumerState"].valid &&
          this.newClaimForm.controls["consumerZip"].valid &&
          this.newClaimForm.controls["productInstalled"].valid &&
          this.newClaimForm.controls["allowanceToKeep"].valid &&
          this.newClaimForm.controls["wrongProductDesc"].valid;
        if (this.newClaimForm.getRawValue().wrongProductDesc == "Other") {
          consumerFlag = consumerFlag && this.newClaimForm.controls["otherLabelValue"].valid;
        }
      } else {
        consumerFlag = this.newClaimForm.controls["productInstalled"].valid &&
          this.newClaimForm.controls["wrongProductDesc"].valid &&
          this.newClaimForm.controls["consumerPhone"].valid;
        if (this.newClaimForm.getRawValue().wrongProductDesc == "Other") {
          consumerFlag = consumerFlag && this.newClaimForm.controls["otherLabelValue"].valid;
        }
      }
    } else {
      if (this.newClaimForm.getRawValue().productInstalled == true) {
        consumerFlag =
          this.newClaimForm.getRawValue().projectSiteName &&
          this.newClaimForm.getRawValue().consumerName &&
          this.newClaimForm.getRawValue().consumerPhone &&
          this.newClaimForm.getRawValue().consumeraddressOne &&
          this.newClaimForm.getRawValue().consumerCity &&
          this.newClaimForm.getRawValue().consumerCountry &&
          this.newClaimForm.getRawValue().consumerState &&
          this.newClaimForm.getRawValue().consumerZip &&
          this.newClaimForm.getRawValue().productInstalled == true &&
          this.newClaimForm.getRawValue().wrongProductDesc;
        if (this.newClaimForm.getRawValue().wrongProductDesc == "Other") {
          consumerFlag = consumerFlag && this.newClaimForm.getRawValue().otherLabelValue;
        }
      } else {
        consumerFlag = this.newClaimForm.getRawValue().productInstalled == false &&
          this.newClaimForm.getRawValue().wrongProductDesc;
        if (this.newClaimForm.getRawValue().wrongProductDesc == "Other") {
          consumerFlag = consumerFlag && this.newClaimForm.getRawValue().otherLabelValue;
        }
      }
    }
    return consumerFlag &&
      (this.newClaimForm.getRawValue().allowanceToKeep == true ||
      this.newClaimForm.getRawValue().allowanceToKeep == false);
  }

  dealerBtn = true;
  consumerBtn = false;
  returnAccordion = false;
  openAccordion(c: any) {
    if (c == "dealer") {
      if (this.dealerBtn == true) {
        this.dealerBtn = false;
      } else {
        this.dealerBtn = true;
        this.consumerBtn = false;
        this.returnAccordion = false;
        this.laborDetailsExpand = false;
      }
    } else if (c == "consumer") {
      if (this.consumerBtn == true) {
        this.consumerBtn = false;
      } else {
        this.dealerBtn = false;
        this.consumerBtn = true;
        this.returnAccordion = false;
        this.laborDetailsExpand = false;
      }
    } else if (c === "return") {
      if (this.returnAccordion == true) {
        this.returnAccordion = false;
      } else {
        this.dealerBtn = false;
        this.consumerBtn = false;
        this.returnAccordion = true;
        this.laborDetailsExpand = false;
      }
    } else if (c === "labor") {
      if (this.laborDetailsExpand == true) {
        this.laborDetailsExpand = false;
      } else {
        this.laborDetailsExpand = true;
        this.dealerBtn = false;
        this.consumerBtn = false;
        this.returnAccordion = false;
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
  changeReadyPickUpEntry() {
    if (this.newClaimForm?.get("readyForReturn")?.value == false &&
      this.newClaimForm?.get("productInstalled")?.value == false) {
      this.newClaimForm.controls["returnDate"].addValidators(
        Validators.required
      );
    } else {
      this.newClaimForm?.controls["returnDate"].reset();
      this.newClaimForm.controls["returnDate"].removeValidators(
        Validators.required
      );
    }
    this.newClaimForm.controls["returnDate"].updateValueAndValidity();
  }
  acknowledgeFee(e: any) {
    this.newClaimForm.controls["feesAcknowledge"].setValue(e.state);
  }
  updateValidatorsForReturn(productInstalled: any, clearReturnInfo: boolean = false) {
    const controls = this.newClaimForm.controls;
    if (clearReturnInfo) {
      controls["returnContactName"].setValue("");
      controls["returnContactPhone"].setValue("");
      controls["returnContactEmail"].setValue("");
      controls["returnaddressOne"].setValue("");
      controls["returnCity"].setValue("");
      controls["returnCountry"].setValue(null);
      controls["returnState"].setValue(null);
      controls["returnZip"].setValue("");
      controls["readyForReturn"].setValue(null);
      controls["returnDate"].setValue("");
    }
    if (productInstalled == false) {
      controls["returnContactName"].addValidators(Validators.required);
      controls["returnContactPhone"].addValidators(Validators.required);
      controls["returnContactEmail"].addValidators(Validators.required);
      controls["returnaddressOne"].addValidators(Validators.required);
      controls["returnCity"].addValidators(Validators.required);
      controls["returnCountry"].addValidators(Validators.required);
      controls["returnState"].addValidators(Validators.required);
      controls["returnZip"].addValidators(Validators.required);
      controls["readyForReturn"].addValidators(Validators.required);
    } else {
      controls["returnContactName"].removeValidators(Validators.required);
      controls["returnContactPhone"].removeValidators(Validators.required);
      controls["returnContactEmail"].removeValidators(Validators.required);
      controls["returnaddressOne"].removeValidators(Validators.required);
      controls["returnCity"].removeValidators(Validators.required);
      controls["returnCountry"].removeValidators(Validators.required);
      controls["returnState"].removeValidators(Validators.required);
      controls["returnZip"].removeValidators(Validators.required);
      controls["readyForReturn"].removeValidators(Validators.required);
    }
    controls["returnContactName"].updateValueAndValidity();
    controls["returnContactPhone"].updateValueAndValidity();
    controls["returnContactEmail"].updateValueAndValidity();
    controls["returnaddressOne"].updateValueAndValidity();
    controls["returnCity"].updateValueAndValidity();
    controls["returnCountry"].updateValueAndValidity();
    controls["returnState"].updateValueAndValidity();
    controls["returnZip"].updateValueAndValidity();
    controls["readyForReturn"].updateValueAndValidity();
    controls["returnDate"].updateValueAndValidity();
    this.changeReadyPickUpEntry();
    this.completeReturnInfo();
  }
  returnFlag = false;
  completeReturnInfo() {
    const controls = this.newClaimForm.controls;
    const controlNames = [
      "returnContactName",
      "returnContactPhone",
      "returnContactEmail",
      "returnaddressOne",
      "returnCity",
      "returnCountry",
      "returnState",
      "returnZip",
      "readyForReturn",
      "returnDate",
    ];
    for (let item of controlNames) {
      this.returnFlag = true;
      if (controls[item].invalid) {
        this.returnFlag = false;
        break;
      }
    }
  }
  errorMessageForReturn = "";
  validateAddressForReturnForm() {
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
      this.errorMessageForReturn = "";
      this.zipAlertType = "";
      this.productService.validateAddress(payload).subscribe({
        next: (res: any) => {
          this.spinnerLoading = false;
          const EvStatus = res?.d?.EvStatus;
          const EvMessage = res?.d?.EvMessage;
          if(EvStatus == "S"){
            this.validateAddressModal("Address is valid");
            this.errorMessageForReturn = "Address is valid";
            this.zipAlertType = "success";
          }  else {
            let EsAddress = res?.d?.EsAddress;
            let suggestedAddress = `Suggested Address: ${EsAddress?.Addressline || ""}, 
                                    ${EsAddress?.Politicaldivision2 || ""}, ${EsAddress?.Politicaldivision1 || ""}, 
                                    ${EsAddress?.Postcodeprimarylow || ""}`;
            this.errorMessageForReturn = EvMessage == "Suggested Address" ? suggestedAddress : EvMessage;
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
  
  checkPhoneValidation(e: any, field: any) {
    const phoneCharLength = 10;
    let val = e?.target?.value;
    if (field == 'returnContactPhone') {      
      if (
        val?.length == phoneCharLength &&
        this.newClaimForm.controls["returnContactPhone"].valid
      ) {
        this.newClaimForm.controls["returnContactPhone"].clearValidators();
        this.newClaimForm.controls["returnContactPhone"].updateValueAndValidity();
        this.newClaimForm.patchValue({
          returnContactPhone: this.convertToUsPhoneFormat(val),
        });
      } else {
        let onlyNumbers = this.clearSpeacialCharsFromPhoneNumber(val);
        if (onlyNumbers?.length == phoneCharLength) {
          this.newClaimForm.patchValue({
            returnContactPhone: this.convertToUsPhoneFormat(onlyNumbers),
          });
        } else {
          this.newClaimForm.patchValue({
            returnContactPhone: onlyNumbers,
          });
        }
      }
      this.newClaimForm.controls["returnContactPhone"].setValidators([
        Validators.min(Number("9".repeat(10))),
        Validators.max(Number("9".repeat(10))),
        Validators.maxLength(14),
      ]);
      if (this.newClaimForm.controls['productInstalled'].value == false) {
        this.newClaimForm.controls["returnContactPhone"].addValidators([Validators.required])
      }
      this.newClaimForm.controls["returnContactPhone"].updateValueAndValidity();
      this.completeReturnInfo();
    } else if (field == 'consumerPhone') {
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
      if (this.newClaimForm.controls['productInstalled'].value == true) {
        this.newClaimForm.controls["consumerPhone"].addValidators([Validators.required])
      }
      this.newClaimForm.controls["consumerPhone"].updateValueAndValidity();
      this.completeConsumerInfo();
    }
  }
  onDealerNameInput(event: any): void {
    const rawValue = event.target.value || '';
    const cleanedValue = rawValue
      .replace(/[^a-zA-Z\s]/g, '') // only letters and spaces
      .replace(/\s+/g, ' ')        // collapse multiple spaces
      .trimStart();                // prevent leading spaces
  
    this.newClaimForm.controls['dealerName'].setValue(cleanedValue, { emitEvent: false });
  }
  setsuggestedResolutionValue(value: any) {
    if(value == 'FULL_REPLACEMENT' || value == 'Full replacement') {
      return "FULL_REPLACEMENT";
    } else if (value == 'PARTIAL_REPLACEMENT' || value == 'Partial replacement') {
      return "PARTIAL_REPLACEMENT";
    } else if (value == 'ATK' || value == 'ATK (Allowance to keep)') {
      return "ATK";
    } else if (value == 'STK' || value == 'STK (Service to keep)') {
      return "STK";
    } else {
      return "";
    }
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

  scrollToLaborDetails() {
    this.scrollTarget.nativeElement.scrollIntoView({ behavior: "smooth" });
    this.laborDetailsExpand = true;
    this.consumerBtn = false;
    this.dealerBtn = false;
    this.returnAccordion = false;
  }
  showLaborAccordion() {
    this.laborLineAccordionFlag = !this.laborLineAccordionFlag;
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

  setLaborValues(data: any) {
    const control = this.newClaimForm.controls;
    control["replacedWithMohawkMaterial"].setValue(data?.replacedWithMhk);
    control["mohawkReplacementOrder"].setValue(this.claimsService.selectedInvoiceLines?.claimData?.replacementOrderNo || data?.replacementOrderNo || "");
    control["totalSqFtReplaced"].setValue(data?.claimQuantity);
    control["totalLaborRequested"].setValue(data?.claimAmount);
  }
  setValidatorsForLabor(addValidators: boolean) {
    const control = this.newClaimForm.controls;
    const obj = [
      "totalSqFtReplaced",
      "totalLaborRequested",
      "replacedWithMohawkMaterial",
    ];
    obj.forEach((key) => {
      if (addValidators) {
        control[key].setValidators([Validators.required]);
      } else {
        control[key].setValidators([]);
      }
      control[key].updateValueAndValidity();
    });
    this.newClaimForm.updateValueAndValidity();
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
  laborIsAvailable(line: any): boolean {
    let laborAvailable = false;
    if (line && line.length > 0) {
      laborAvailable = line.some((item: any) => item.component === "LABOR");
    }
    return laborAvailable;
  }  
  isLaborAdded(): boolean { 
    const laborAdded = this.claimsService.selectedInvoiceLines?.line?.some((line: any) => 
      line?.selectedLines?.some((item: any) => item?.component === "LABOR")
    );
    if(!laborAdded) {
      this.newClaimForm.controls["totalSqFtReplaced"].setValidators([]);
      this.newClaimForm.controls["totalLaborRequested"].setValidators([]);
      this.newClaimForm.controls["replacedWithMohawkMaterial"].setValidators([]);
      this.newClaimForm.controls["totalSqFtReplaced"].updateValueAndValidity();
      this.newClaimForm.controls["totalLaborRequested"].updateValueAndValidity();
      this.newClaimForm.controls["replacedWithMohawkMaterial"].updateValueAndValidity();
    }
    return laborAdded;
  }
  
  removeLineItem(obj: any) {
    if (obj?.component === "LABOR") {
      this.laborDetailsExpand = false;
      let control = this.newClaimForm.controls;
      let fields: any = [
        "mohawkReplacementOrder",
        "replacedWithMohawkMaterial",
        "totalSqFtReplaced",
        "totalLaborRequested"
      ];
      fields.forEach((key: any) => {
        control[key].setValue("");
        control[key].clearValidators();
        control[key].updateValueAndValidity();
      });
    }
  }

  navigateToBack() {
    if (this.claimsService.selectedInvoiceLines?.isFromClaimHistory) {
      this.claimsService.navigateBack();
    } else {
      this.router.navigate(['/residential/claims/createclaim']);
    }
  }
}
