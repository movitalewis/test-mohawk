import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import { BsModalService, BsModalRef, ModalOptions } from "ngx-bootstrap/modal";
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { ClaimsService } from "src/app/features/residential/claims/services/claims.service";
import { StorageService } from "src/app/features/http-services/storage.service";
import { XchangeCustomCheckboxComponent } from "src/app/features/shared/form-control-components/xchange-custom-checkbox/xchange-custom-checkbox.component";
import { InvoiceSearchComponent } from "../invoice-search/invoice-search.component";
import { ErrorModalComponent } from "src/app/features/shared/components/error-modal/error-modal.component";
import { Router } from "@angular/router";
import { STATES } from "src/app/features/shared/constants/States";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { ProductService } from "../../../products/pages/services/product.service";
import { DatePipe } from "@angular/common";
import { API_CONSTANTS } from "src/app/features/shared/constants/API-CONSTANTS";
import { ConfirmationDialogComponent } from "src/app/features/shared/components/confirmation-dialog/confirmation-dialog.component";
import { Observable } from "rxjs";
import { CLAIM_TYPES } from "src/app/features/shared/constants/CLAIMS-CONSTANTS";

@Component({
    selector: "app-defective-product",
    templateUrl: "./defective-product.component.html",
    styleUrls: ["./defective-product.component.scss"],
    standalone: false
})
export class DefectiveProductComponent implements OnInit, OnDestroy {
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
  STATE_LIST: any = [];
  STATE_LIST_RETURN: any = [];
  useAccountInformation = false;
  useAccInfoFlag = false;

  alertType: any = "success";
  alertTrigger: any = false;
  minDate = new Date();
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
      name: "Defective Product Claim",
      path: "/",
      active: true,
    },
  ];
  additionalInfo = "";
  selectedInvoiceData: any = [];
  modalRef?: BsModalRef;
  newClaimForm!: FormGroup;
 


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
    { key: "claimQuantity", title: "Claim Quantity" },
    {
      key: "subTotal",
      title: `Sub Total (USD)`,
    },
  ];

  installationTypeData = [
    { label: "Stretch In", value: "STRETCHIN" },
    { label: "Glue Down", value: "GLUEDOWN" },
    { label: "Loose Laid", value: "LOOSELAID" },
    { label: "Tackless", value: "TACKLESS" },
    { label: "Double Stick", value: "DOUBLESTICK" },
    { label: "Floating", value: "FLOATING" },
    { label: "Perimeter Glue Down", value: "PERIMETERGLUEDOWN" },
    { label: "Nail Down", value: "NAILDOWN" },
    { label: "I Don't Know", value: "I_DONT_KNOW" },
  ];
  sampleAvlData = [
    { value: true, label: "Yes" },
    { value: false, label: "No" },
  ];
  spaceOcData = [
    { value: true, label: "Yes" },
    { value: false, label: "No" },
  ];
  crrAttData = [
    { value: true, label: "Yes" },
    { value: false, label: "No" },
  ];
  zipAlertType = "";
  dealerBtn = true;
  consumerBtn = false;
  installBtn = false;
  maintainBtn = false;
  uninstallBtn = false;
  returnAccordion = false;
  firstNoticeMinDate!: Date;
  maxDate: Date = new Date();
  radioBtnData = [
    { id: "adhesive", label: "Adhesive", value: "adhesive", checked: false },
    { id: "primer", label: "Primer", value: "primer", checked: false },
    { id: "sealer", label: "Sealer", value: "sealer", checked: false },
  ];
  adhesiveFlag = false;
  laborDetailsExpand: boolean = false;
  laborLineAccordionFlag: boolean = true;
  laborFlag: boolean = false;
  showLaborDetails: boolean = false;
  productInstalledSub: any;

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
    if (this.productInstalledSub && this.productInstalledSub.unsubscribe) {
      this.productInstalledSub.unsubscribe();
    }
  }
  ngOnInit(): void {
    this.newClaimForm = this.fb.group({
      // ****************Dealers key***************
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

      customerAccountNumber: [""],

      // ******************Consumer Key*************************
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
      consumerCity: [
        "",
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
      consumeraddressOne: [
        "",
      ],
      consumeraddressTwo: [""],
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
      productInstalled: [null, [Validators.required]],
      allowanceToKeep:[null, [Validators.required]],
      // *********Consumer Ends********

      reasonForClaimNotes: [""],
      affectedArea: [null],
      visibleOrConcealed: [null],
      dateInstalled: [""],
      roomsInvolved: [""],
      floorsInvolved: [""],
      spaceOccupied: [null],
      adhesive: this.fb.array([]),
      subFloor: [null],
      subFloorInformationOthers: [""],
      previouslyInstalledFloorOthers: [""],
      perimeterCaulked: [null],
      permCaulkNotes: [""],
      methodOfApplication: [null],
      firstNoticedDate: [""],
      attemptNotes: [""],
      underlaymentType: [""],
      petsInHome: [null],
      humidifierExists: [null],
      rentalproperty: [null],
      consumerOriginalOwner: [null],
      floodingOrLeaks: [null],
      cleaningFrequency: [null],
      cleaningFrequencyOthers: [""],
      lastCleanedDate: [""],
      cleaningMethod: [""],
      suggestedResolution: [null, [Validators.required]],
      sampleAvailable: [null],
      installationType: [null],
      correctionAttempted: [null],
      previousFlooringNotes: [null],
      claimType: [this.claimTypes.DEFECTIVE_PRODUCT],
      additionalInfoNotes: [""],
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
      returnZip: ["", [Validators.pattern(/^[0-9a-zA-Z ]+$/)]],
      invoiceLines: this.fb.array([]),
      totalSqFtReplaced: [""],
      totalLaborRequested: [""],
      mohawkReplacementOrder: [""],
      replacedWithMohawkMaterial: [null],
    });
    this.productInstalledSub = this.newClaimForm.get('productInstalled')?.valueChanges.subscribe((val: any) => {
      try {
        if (this.invoiceLines.length === 0 && this.claimsService.selectedInvoiceLines?.line?.length > 0) {
          this.populateInvoiceLines();
        }
      } catch (e) {}
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
      newObj.consumeraddressOne =
        this.claimsService.selectedInvoiceLines?.claimData?.consumerStreet;
      newObj.returnaddressOne =
        this.claimsService.selectedInvoiceLines?.claimData?.returnStreet;
      this.changeValidators(newObj?.productInstalled == true, false);
      this.changeValdiatorsForReturn(newObj.suggestedResolution);
      this.getcountry(newObj.consumerCountry, "consumer");
      this.getcountry(newObj.returnCountry, "return");
      newObj.allowanceToKeep = 
        this.claimsService.selectedInvoiceLines?.claimData?.allowanceToKeep == undefined
          ? null : this.claimsService.selectedInvoiceLines?.claimData?.allowanceToKeep;
      if (newObj.adhesive?.length > 0) {
        newObj.adhesive = newObj.adhesive?.split(",");
      } else {
        newObj.adhesive = [];
      }
      newObj.adhesive.filter((item: any) => {
        this.adhesiveUsed({ state: true, value: item });
      });
      newObj.invoiceLines = [];
      this.newClaimForm.setControl('invoiceLines', this.fb.array([]));
      this.newClaimForm.patchValue(newObj);
      this.newClaimForm.patchValue({
        dealerPhone: this.convertToUsPhoneFormat(newObj?.dealerPhone),
      });
      this.checkPhoneValidation({ target: { value: newObj?.consumerPhone } }, 'consumerPhone');
      this.checkPhoneValidation({ target: { value: newObj?.returnContactPhone } }, 'returnContactPhone');
      this.claimsService.selectedInvoiceLines?.claimData?.claimDocs?.entry?.filter(
        (file: any) => {
          this.filesArray.push({ key: file.key, name: file.value });
        }
      );
      this.checkProductAffectedSelcted();
      this.completeDealerInfo();
      this.completeConsumerInfo();
      this.changeReadyPickUpEntry();
      if (this.newClaimForm.value.productInstalled) {
        this.checkProductAffectedSelcted();
        this.completeInstallInfo();
        this.completeMaintenanceInfo();
      } else {
        this.completeUninstallInfo();
      }
      if (
        this.claimsService.selectedInvoiceLines?.claimData?.claimStatus.toUpperCase() !==
        "DRAFT"
      ) {
        this.disabledMyAcc = true;
        this.disableLaborFields = this.claimsService.selectedInvoiceLines?.claimData?.claimStatus.toUpperCase() == 'IN PROCESS' ? false : true;
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
        // this.invoiceLines.clear();
        this.newClaimForm.setControl('invoiceLines', this.fb.array([]));
        
        this.populateInvoiceLines();
        this.completeDealerInfo();
        this.completeConsumerInfo();
        this.completeInstallInfo();
        this.completeUninstallInfo();
        if (this.newClaimForm.value.productInstalled) {
          this.checkProductAffectedSelcted();
          this.completeInstallInfo();
          this.completeMaintenanceInfo();
        } else {
          this.completeUninstallInfo();
        }
        this.claimsService.selectedInvoiceLines?.line?.forEach(
          (ln: any, index: number) => {
            if (ln.selectedLines.length > 0) {
              ln.selectedLines.filter((inv: any) => {
                if (inv.component === "PRODUCT") {
                  inv.isOpen = true;
                }
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
      if (
        !this.claimsService?.selectedInvoiceLines?.claimNumber &&
        this.columns[1].key === "disputeCaseId"
      ) {
        this.columns.splice(1, 1);
      }
    },(err)=>{
      this.userService.progressHide()
    });
      this.newClaimForm.markAsPristine();    
    this.claimsService.formMarkAsDirty.subscribe((res) => {
      if (res) this.newClaimForm.markAsDirty();
    });
  }

  //needs to remove 
  showAccordion(i: any) {
    this.claimsService.selectedInvoiceLines?.line?.forEach((ln: any) => {
      if (ln.selectedLines.length > 0) {
        ln.selectedLines.filter((inv: any) => {
          if (
            inv.component === i.component &&
            inv.invoiceSeq === i.invoiceSeq
          ) {
            inv.isOpen = !inv.isOpen;
          }
        });
      }
    });
  }

  defaultPayload: Object = {
    claimType: this.claimTypes.DEFECTIVE_PRODUCT,
    replacementOrderNo: "",
    line: [],
  };
  saveClaim(requestStatus: boolean, btnRef: any = null) {
    if(requestStatus === false){    
      if (
        this.newClaimForm.invalid || this.claimsService.selectedInvoiceLines?.line?.length === 0
      ) {
        this.newClaimForm.markAllAsTouched();
        this.invoiceLines.controls.forEach((control: any) => {
          control.markAllAsTouched();
        });
        let invalidFields = [];
        for (let control in this.newClaimForm.controls) {
          if (this.newClaimForm.controls[control].invalid) {
            invalidFields.push(control);
          }
        }

        // First check consumer section if incomplete and collapsed
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

        // Then check dealer section if incomplete and collapsed
        if(!this.dealerBtn && document.querySelectorAll('.status-incomplete').length > 0){
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
    let payload = JSON.parse(JSON.stringify(this.newClaimForm.getRawValue()));
    payload.claimNumber = claimNumber;
    payload.dealerPhone = this.getPhoneNumber(payload?.dealerPhone);
    const loadingFor = requestStatus ? 'draft' : 'submit';
      this.userService.progressShow(loadingFor)
    payload.draft = requestStatus;
    payload.create = requestStatus ? false : true;
    payload.businessArea =
      this.claimsService.selectedInvoiceLines.businessArea == undefined
        ? ""
        : this.claimsService.selectedInvoiceLines.businessArea;
    payload.allowanceToKeep = payload.allowanceToKeep;
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
    payload.dateInstalled =
      this.newClaimForm.value.dateInstalled == ""
        ? ""
        : this.datePipe.transform(
            this.newClaimForm.value.dateInstalled,
            "MM/dd/yyyy"
          );
    payload.firstNoticedDate =
      this.newClaimForm.value?.firstNoticedDate != ""
        ? this.datePipe.transform(
            this.newClaimForm.value?.firstNoticedDate,
            "MM/dd/yyyy"
          )
        : "";
    payload.lastCleanedDate = this.datePipe.transform(
      this.newClaimForm.value.lastCleanedDate,
      "MM/dd/yyyy"
    );
    payload.readyForReturn = payload.readyForReturn ? true : false;
    payload.consumerOriginalOwner = payload.consumerOriginalOwner
      ? true
      : false;
    payload.correctionAttempted = payload.correctionAttempted ? true : false;
    payload.floodingOrLeaks = payload.floodingOrLeaks ? true : false;
    payload.petsInHome = payload.petsInHome ? true : false;
    payload.productInstalled = payload.productInstalled ? true : false;
    payload.rentalproperty = payload.rentalproperty ? true : false;
    payload.sampleAvailable = payload.sampleAvailable ? true : false;
    payload.spaceOccupied = payload.spaceOccupied ? true : false;
    payload.visibleOrConcealed = payload.visibleOrConcealed;
    payload.adhesive = payload.adhesive?.toString();
    payload.returnDate = 
    this.newClaimForm.value.returnDate == ""
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
          claimQuantity: el?.claimQuantity,
          component: el?.component,
          invoicePrice: "",
          invoiceSource: el?.source || "",
          claimType: this.claimTypes.DEFECTIVE_PRODUCT,
          productInstalled: payload.productInstalled ? true : false,
          uom: el?.uom ? el?.uom : "",
          disputeCurrency: el?.currency,
          additionalInfoNotes: el?.additionalInfoNotes,
          isSales: this.storageService.userInfo?.isSalesPerson || this.storageService.userInfo?.isSalesOps || false,
          reasonForClaimNotes: this.newClaimForm.value.reasonForClaimNotes,
          amountProductAffected:
            el?.component == "PRODUCT" ? el?.amountProductAffected : undefined,
          affectedQuantity:
            el?.component == "PRODUCT" ? el?.affectedQuantity : undefined,
            disputeCaseId: (el?.disputeCaseId && el?.disputeCaseId != "NA") ? el?.disputeCaseId : "",
        });
        }else{
        const productLine = element.selectedLines.find((item: any) => item.component === 'PRODUCT');
        payload.line.push({
            invoiceNumber: this.claimsService.selectedInvoiceLines.invoiceNumber,
            invoiceLineNumber: element?.invoiceSeq,
            invoicePrice: "",
            invoiceSource: productLine?.source || "",
            component: el?.component,
            disputeAmount: this.newClaimForm?.value?.totalLaborRequested || "",
            disputeCurrency: productLine?.currency || "",
            additionalInfoNotes: el?.additionalInfoNotes,
            isSales: this.storageService.userInfo?.isSalesPerson || this.storageService.userInfo?.isSalesOps || false,
            replacedWithMhk :this.newClaimForm.value.replacedWithMohawkMaterial, //New question 
			      replacementOrderNo :this.newClaimForm.value.mohawkReplacementOrder, // New question
            reasonForClaimNotes: this.newClaimForm.value.reasonForClaimNotes,
            uom: productLine.uom,
            claimQuantity: this.newClaimForm.value.totalSqFtReplaced,
            claimType: this.claimTypes.DEFECTIVE_PRODUCT,
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
    payload.claimType = this.claimTypes.DEFECTIVE_PRODUCT;
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
          this.userService.progressHide(loadingFor)
          this.alertData = {
            message: err,
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
          this.userService.progressHide(loadingFor)
          this.alertData = {
            message: err,
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
//needs to remove after uninstall component as shared
  updateAmountofProduct(event: any, line: any) {
    this.claimsService.selectedInvoiceLines?.line?.forEach((inv: any) => {
      inv?.selectedLines?.filter((ln: any) => {
        if (
          ln?.component == line?.component &&
          ln?.invoiceSeq == line?.invoiceSeq &&
          event == "All"
        ) {
          ln.amountProductAffected = undefined;
          this.invoiceLines.controls.forEach((control: any) => {
            const line = control.get("affectedQuantity").value;
            if (line != "All") {
              control.get("amountProductAffected").addValidators(Validators.required);
              control.get("amountProductAffected").updateValueAndValidity();
            } else {
              control.get("amountProductAffected").removeValidators(Validators.required);
              control.get("amountProductAffected").updateValueAndValidity();
            }
          });
        }
      });
    });
  }
  updateAddressTwo(event: any) {
    let val = "";
    val = this.newClaimForm.value.consumerStreet + " " + event.target.value;
    this.newClaimForm.patchValue({
      consumerStreet: val,
    });
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
  subFloorChange(event: any) {
    if (event === "OTHER") {
      this.addValidators("subFloorInformationOthers");
    } else {
      this.removeValidators("subFloorInformationOthers");
    }
  }
  previousFlooringNotesChange(event: any) {
    if (event === "Other") {
      this.addValidators("previouslyInstalledFloorOthers");
    } else {
      this.removeValidators("previouslyInstalledFloorOthers");
    }
  }
  cleaningFrequencyChange(event: any) {
    if (event === "other") {
      this.addValidators("cleaningFrequencyOthers");
    } else {
      this.removeValidators("cleaningFrequencyOthers");
    }
  }

  changeValidators(event: any, clearReturnInfo: boolean) {
    this.updateValidatorsForReturn(event, clearReturnInfo);
    if (event == true) {
      this.removeValidators("affectedArea");
      this.addValidators("projectSiteName");
      this.addValidators("consumerName");
      this.addValidators("consumerPhone");
      this.addValidators("consumeraddressOne");
      this.addValidators("consumerCity");
      this.addValidators("consumerCountry");
      this.addValidators("consumerState");
      this.addValidators("consumerZip");
      this.addValidators("affectedArea");
      this.addValidators("visibleOrConcealed");
      this.addValidators("dateInstalled");
      this.addValidators("sampleAvailable");
      this.addValidators("installationType");
      this.addValidators("spaceOccupied");
      this.addValidators("subFloor");
      this.addValidators("previousFlooringNotes");
      if (this.showPerimeterCaulked()) {
        this.addValidators("perimeterCaulked");
      }
      this.addValidators("methodOfApplication");
      this.addValidators("firstNoticedDate");
      this.addValidators("correctionAttempted");
      this.addValidators("petsInHome");
      this.addValidators("humidifierExists");
      this.addValidators("rentalproperty");
      this.addValidators("consumerOriginalOwner");
      this.addValidators("floodingOrLeaks");
      this.addValidators("cleaningFrequency");
      this.addValidators("lastCleanedDate");
      this.addValidators("cleaningMethod");
      this.addValidators("reasonForClaimNotes");
    } else {
      this.removeValidators("projectSiteName");
      this.removeValidators("consumerName");
      this.removeValidators("consumerPhone");
      this.removeValidators("consumeraddressOne");
      this.removeValidators("consumerCity");
      this.removeValidators("consumerCountry");
      this.removeValidators("consumerState");
      this.removeValidators("consumerZip");
      this.removeValidators("affectedArea");
      this.removeValidators("visibleOrConcealed");
      this.removeValidators("dateInstalled");
      this.removeValidators("sampleAvailable");
      this.removeValidators("installationType");
      this.removeValidators("adhesive");
      this.removeValidators("spaceOccupied");
      this.removeValidators("subFloor");
      this.removeValidators("previousFlooringNotes");
      this.removeValidators("perimeterCaulked");
      this.removeValidators("methodOfApplication");
      this.removeValidators("firstNoticedDate");
      this.removeValidators("correctionAttempted");
      this.removeValidators("petsInHome");
      this.removeValidators("humidifierExists");
      this.removeValidators("rentalproperty");
      this.removeValidators("consumerOriginalOwner");
      this.removeValidators("floodingOrLeaks");
      this.removeValidators("cleaningFrequency");
      this.removeValidators("lastCleanedDate");
      this.removeValidators("cleaningMethod");
      this.addValidators("reasonForClaimNotes");
    }
    this.claimsService.selectedInvoiceLines.line.filter((e: any) => {
      e.selectedLines.filter((d: any) => {
        if (d.component == "PRODUCT") {
          d.affectedQuantity = d.affectedQuantity ? d.affectedQuantity : null;
          d.amountProductAffected = d.amountProductAffected
            ? d.amountProductAffected
            : null;
        }
      });
    });
    this.newClaimForm.controls["reasonForClaimNotes"].setValue(null);
    this.newClaimForm.controls["affectedArea"].setValue(null);
    this.newClaimForm.controls["suggestedResolution"].setValue(null);
    this.completeInstallInfo();
    this.completeMaintenanceInfo();
    this.completeUninstallInfo();
  }
  sampleAvailable(b: any, key: any) {
    this.newClaimForm.controls[key].setValue(b.value);
    if (key == "installationType") {
      if (
        b.value == "GLUEDOWN" ||
        b.value == "DOUBLESTICK" ||
        b.value == "PERIMETERGLUEDOWN"
      ) {
        this.adhesiveFlag = true;
        this.addValidators("adhesive");
      } else {
        this.adhesiveFlag = false;
        this.removeValidators("adhesive");
      }
    } else if (key == "correctionAttempted") {
      if (b.value) {
        this.addValidators("attemptNotes");
      } else {
        this.removeValidators("attemptNotes");
      }
    }
  }
  changeValdiatorsForReturn(event: any) {
  }
  changeValidatorsForReturnSelected(event: any) {
    if (event == true) {
      this.addValidators("returnContactName");
      this.addValidators("returnPhone");

      this.addValidators("returnCountry");
      this.addValidators("returnState");
      this.addValidators("returnZip");
      this.addValidators("returnCity");
      this.addValidators("returnStreet");
    } else {
      this.removeValidators("returnContactName");
      this.removeValidators("returnPhone");

      this.removeValidators("returnCountry");
      this.removeValidators("returnState");
      this.removeValidators("returnZip");
      this.removeValidators("returnCity");
      this.removeValidators("returnStreet");
    }
  }

  addValidators(key: any) {
    this.newClaimForm.controls[key].addValidators(Validators.required);
    this.newClaimForm.controls[key].updateValueAndValidity();
  }
  removeValidators(key: any) {
    let controls = this.newClaimForm.controls[key];
    controls.removeValidators(Validators.required);
    controls.updateValueAndValidity();
    if (key == "adhesive") {
      controls.setValue([]);
    } else if (
      key != "consumerZip" &&
      key != "consumerState" &&
      key != "consumerCountry" &&
      key != "consumerCity" &&
      key != "consumeraddressOne" &&
      key != "consumerPhone" &&
      key != "consumerName" &&
      key != "projectSiteName"
    ) {
      controls.setValue(null);
    }
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
  showPerimeterCaulked() {
    let newArr: any[] = [];
    this.claimsService.selectedInvoiceLines.line.filter((e: any) => {
      e.selectedLines.filter((d: any) => {
        if (d.component == "PRODUCT" && e.selectedLines.length > 0) {
          newArr.push(d);
        }
      });
    });
    return !newArr.every(
      (e: any) => e.productCategory == "B" && e.component == "PRODUCT"
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
    this.newClaimForm.markAsPristine();
    this.router.navigate(
      [`/residential/claims/defective-product-claim/confirmation`],
      {
        queryParams: {
          isNewClaim: isNewClaim,
        },
      }
    );
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
        myFormControls[key].value != null && key != "invoiceLines"
      ) {
        disable = true;
      }
    }
    return disable;
  }

  adhesiveUsed(el: any) {
    const adhesiveArray: FormArray = this.newClaimForm.get(
      "adhesive"
    ) as FormArray;
    this.radioBtnData.filter((item: any) => {
      if (item.value == el.value) {
        item.checked = el.state;
      }
    });
    if (el.state) {
      adhesiveArray.push(new FormControl(el.value));
    } else {
      adhesiveArray.controls.forEach((item: any, i: number) => {
        if (item.value == el.value) {
          adhesiveArray.removeAt(i);
          return;
        }
      });
    }
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

  keyPressForZip(e: any) {
    //avoiding first space and double space
    let value: any = e?.target?.value + e?.key;
    return value.split(" ").length < 3 && value !== " ";
  }

  productFlag1: boolean = false;
  checkProductAffectedSelcted() {
    let filterData: any = [];
    this.claimsService.selectedInvoiceLines.line.forEach((item: any) => {
      item.selectedLines.forEach((data: any) => {
        if (data?.component == "PRODUCT") {
          filterData.push(
            (data?.affectedQuantity == "Partial" &&
              data?.amountProductAffected) ||
              data?.affectedQuantity == "All"
          );
        }
      });
    });
    let productFlag =  true;
    productFlag = filterData.every((e: any) => e);
    this.productFlag1 = productFlag;
  }
  //nnedd to remove after uninstall component as shared
  quantityKey(keyEvent: any, maxVal: any, uom: any) {
    if (isNaN(keyEvent.target.value + keyEvent.key)) {
      return false;
    }
    let str = "";
    if (
      keyEvent.target.selectionStart == null ||
      keyEvent.target.selectionEnd == null
    ) {
      str = keyEvent.target.value + keyEvent.key;
    } else {
      str =
        keyEvent.target.value.slice(0, keyEvent.target.selectionStart) +
        keyEvent.key +
        keyEvent.target.value.slice(
          keyEvent.target.selectionEnd,
          keyEvent.target.value.length
        );
    }
    if (uom !== "ZCT") {
      if (
        str.indexOf(".") &&
        str.slice(str.indexOf("."), str.length).length > 3
      ) {
        return false;
      }
    } else {
      let patt = /^([0-9])$/;
      if (keyEvent.target.selectionStart != keyEvent.target.selectionEnd) {
      } else {
        str = keyEvent.target.value + keyEvent.key;
      }
      if (!patt.test(keyEvent.key) && str.indexOf(".")) {
        return false;
      }
    }
    if (Number(str) === 0 || Number(str) > maxVal) {
      return false;
    }
    return true;
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

  consumerFlag: boolean = false;
  completeConsumerInfo() {
    this.consumerFlag =
      (this.newClaimForm.controls["projectSiteName"].valid ||
        this.newClaimForm.controls["projectSiteName"].disabled) &&
      (this.newClaimForm.controls["consumerName"].valid ||
        this.newClaimForm.controls["consumerName"].disabled) &&
      (this.newClaimForm.controls["consumerPhone"].valid ||
        this.newClaimForm.controls["consumerPhone"].disabled) &&
      (this.newClaimForm.controls["consumeraddressOne"].valid ||
        this.newClaimForm.controls["consumeraddressOne"].disabled) &&
      (this.newClaimForm.controls["consumerCity"].valid ||
        this.newClaimForm.controls["consumerCity"].disabled) &&
      (this.newClaimForm.controls["consumerCountry"].valid ||
        this.newClaimForm.controls["consumerCountry"].disabled) &&
      (this.newClaimForm.controls["consumerState"].valid ||
        this.newClaimForm.controls["consumerState"].disabled) &&
      (this.newClaimForm.controls["consumerZip"].valid ||
        this.newClaimForm.controls["consumerZip"].disabled) &&
      (this.newClaimForm.controls["productInstalled"].valid ||
        this.newClaimForm.controls["productInstalled"].disabled) &&
      (this.newClaimForm.getRawValue().allowanceToKeep == true ||
      this.newClaimForm.getRawValue().allowanceToKeep == false);
  }

  installFlag: boolean = false;
  completeInstallInfo() {
    this.installFlag =
      (this.newClaimForm.controls["reasonForClaimNotes"].valid ||this.newClaimForm.controls["reasonForClaimNotes"].disabled )&&
      (this.newClaimForm.controls["affectedArea"].valid || this.newClaimForm.controls["affectedArea"].disabled) &&
      (this.newClaimForm.controls["visibleOrConcealed"].valid || this.newClaimForm.controls["visibleOrConcealed"].disabled) &&
      (this.newClaimForm.controls["dateInstalled"].valid || this.newClaimForm.controls["dateInstalled"].disabled) &&
      (this.newClaimForm.controls["sampleAvailable"].valid || this.newClaimForm.controls["sampleAvailable"].disabled) &&
      (this.newClaimForm.controls["installationType"].valid || this.newClaimForm.controls["installationType"].disabled) &&
      (this.newClaimForm.controls["spaceOccupied"].valid || this.newClaimForm.controls["spaceOccupied"].disabled) &&
      (this.newClaimForm.controls["adhesive"].valid || this.newClaimForm.controls["adhesive"].disabled) &&
      (this.newClaimForm.controls["subFloor"].valid || this.newClaimForm.controls["subFloor"].disabled) &&
      (this.newClaimForm.controls["previousFlooringNotes"].valid || this.newClaimForm.controls["previousFlooringNotes"].disabled) &&
      (this.showPerimeterCaulked()
        ? (this.newClaimForm.controls["perimeterCaulked"].valid || this.newClaimForm.controls["perimeterCaulked"].disabled)
        : true) &&
      (this.newClaimForm.controls["methodOfApplication"].valid || this.newClaimForm.controls["methodOfApplication"].disabled) &&
      (this.newClaimForm.controls["firstNoticedDate"].valid || this.newClaimForm.controls["firstNoticedDate"].disabled) &&
      (this.newClaimForm.controls["correctionAttempted"].valid || this.newClaimForm.controls["correctionAttempted"].disabled) &&
      (this.newClaimForm.controls["underlaymentType"].valid || this.newClaimForm.controls["underlaymentType"].disabled) &&
      (this.newClaimForm.controls["petsInHome"].valid || this.newClaimForm.controls["petsInHome"].disabled) &&
      (this.newClaimForm.controls["humidifierExists"].valid || this.newClaimForm.controls["humidifierExists"].disabled) &&
      (this.newClaimForm.controls["rentalproperty"].valid || this.newClaimForm.controls["rentalproperty"].disabled) &&
      (this.newClaimForm.controls["consumerOriginalOwner"].valid || this.newClaimForm.controls["consumerOriginalOwner"].disabled) &&
      (this.newClaimForm.controls["floodingOrLeaks"].valid || this.newClaimForm.controls["floodingOrLeaks"].disabled) &&
      (this.newClaimForm.controls["subFloorInformationOthers"].valid || this.newClaimForm.controls["subFloorInformationOthers"].disabled) &&
      (this.newClaimForm.controls["previouslyInstalledFloorOthers"].valid || this.newClaimForm.controls["previouslyInstalledFloorOthers"].disabled) &&
      (this.newClaimForm.controls["cleaningFrequencyOthers"].valid || this.newClaimForm.controls["cleaningFrequencyOthers"].disabled);
    this.productFlag1;
    if (this.newClaimForm.getRawValue().correctionAttempted == true) {
      this.installFlag =
        this.installFlag && (this.newClaimForm.controls["attemptNotes"].valid || this.newClaimForm.controls["attemptNotes"].disabled);
    }
    this.installFlag = this.installFlag && this.checkAffectedProAmount();
  }
  maintenanceFlag: boolean = false;
  completeMaintenanceInfo() {
    this.maintenanceFlag =
      this.newClaimForm.controls["cleaningFrequency"].valid &&
      this.newClaimForm.controls["lastCleanedDate"].valid &&
      this.newClaimForm.controls["cleaningMethod"].valid &&
      this.newClaimForm.controls["suggestedResolution"].valid;
  }

  uninstallFlag: boolean = false;
  completeUninstallInfo() {
    if (
      this.newClaimForm.controls["suggestedResolution"].value === "Return" &&
      this.newClaimForm.controls["readyForReturn"].value === true
    ) {
      this.uninstallFlag =
        (this.newClaimForm.controls["reasonForClaimNotes"].valid ||
          this.newClaimForm.controls["reasonForClaimNotes"].disabled) &&
        (this.newClaimForm.controls["suggestedResolution"].valid ||
          this.newClaimForm.controls["suggestedResolution"].disabled) &&
        (this.newClaimForm.controls["readyForReturn"].valid ||
          this.newClaimForm.controls["readyForReturn"]) &&
        (this.newClaimForm.controls["returnContactName"].valid ||
          this.newClaimForm.controls["returnContactName"].disabled) &&
        (this.newClaimForm.controls["returnPhone"].valid ||
          this.newClaimForm.controls["returnPhone"].disabled) &&
        (this.newClaimForm.controls["returnStreet"].valid ||
          this.newClaimForm.controls["returnStreet"].disabled) &&
        (this.newClaimForm.controls["returnCity"].valid ||
          this.newClaimForm.controls["returnCity"].disabled) &&
        (this.newClaimForm.controls["returnCountry"].valid ||
          this.newClaimForm.controls["returnCountry"].disabled) &&
        (this.newClaimForm.controls["returnState"].valid ||
          this.newClaimForm.controls["returnState"].disabled) &&
        (this.newClaimForm.controls["returnZip"].valid ||
          this.newClaimForm.controls["returnZip"].disabled);
    } else if (
      this.newClaimForm.controls["suggestedResolution"].value === "Return"
    ) {
      this.uninstallFlag =
        (this.newClaimForm.controls["reasonForClaimNotes"].valid ||
          this.newClaimForm.controls["reasonForClaimNotes"].disabled) &&
        (this.newClaimForm.controls["suggestedResolution"].valid ||
          this.newClaimForm.controls["suggestedResolution"].disabled) &&
        (this.newClaimForm.controls["readyForReturn"].valid ||
          this.newClaimForm.controls["readyForReturn"].disabled);
    } else {
      this.uninstallFlag =
        (this.newClaimForm.controls["reasonForClaimNotes"].valid ||
          this.newClaimForm.controls["reasonForClaimNotes"].disabled) &&
        (this.newClaimForm.controls["suggestedResolution"].valid ||
          this.newClaimForm.controls["suggestedResolution"].disabled);
    }
    this.uninstallFlag = this.uninstallFlag && this.checkAffectedProAmount();
  }

  openAccordion(c: any) {
    if (c == "dealer") {
      if (this.dealerBtn == true) {
        this.dealerBtn = false;
      } else {
        this.dealerBtn = true;
        this.consumerBtn = false;
        this.installBtn = false;
        this.maintainBtn = false;
        this.uninstallBtn = false;
        this.returnAccordion = false;
        this.laborDetailsExpand = false;
      }
    } else if (c == "consumer") {
      if (this.consumerBtn == true) {
        this.consumerBtn = false;
      } else {
        this.dealerBtn = false;
        this.consumerBtn = true;
        this.installBtn = false;
        this.maintainBtn = false;
        this.uninstallBtn = false;
        this.returnAccordion = false;
        this.laborDetailsExpand = false;
      }
    } else if (c == "installation") {
      if (this.installBtn == true) {
        this.installBtn = false;
      } else {
        this.dealerBtn = false;
        this.consumerBtn = false;
        this.installBtn = true;
        this.maintainBtn = false;
        this.uninstallBtn = false;
        this.returnAccordion = false;
        this.laborDetailsExpand = false;
      }
    } else if (c == "maintenance") {
      if (this.maintainBtn == true) {
        this.maintainBtn = false;
      } else {
        this.dealerBtn = false;
        this.consumerBtn = false;
        this.installBtn = false;
        this.maintainBtn = true;
        this.uninstallBtn = false;
        this.returnAccordion = false;
        this.laborDetailsExpand = false;
      }
    } else if (c == "uninstalled") {
      if (this.uninstallBtn == true) {
        this.uninstallBtn = false;
      } else {
        this.dealerBtn = false;
        this.consumerBtn = false;
        this.installBtn = false;
        this.maintainBtn = false;
        this.uninstallBtn = true;
        this.returnAccordion = false;
        this.laborDetailsExpand = false;
      }
    } else if (c === "return") {
      if (this.returnAccordion == true) {
        this.returnAccordion = false;
      } else {
        this.dealerBtn = false;
        this.consumerBtn = false;
        this.installBtn = false;
        this.maintainBtn = false;
        this.uninstallBtn = false;
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
        this.installBtn = false;
        this.maintainBtn = false;
        this.uninstallBtn = false;
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

  onDateInstalled(d: any) {
    this.firstNoticeMinDate = new Date(d);
  }

  charCode!: number;
  alphaNumericOnly(e: any) {
    if (
      (e.charCode == 32 && this.charCode == 32) ||
      (e.charCode == 32 && e.target.value == "")
    ) {
      e.preventDefault();
      return false;
    } else {
      var regex = new RegExp("^[a-zA-Z0-9 ]+$");
      var str = String.fromCharCode(!e.charCode ? e.which : e.charCode);
      if (regex.test(str)) {
        this.charCode = e.charCode;
        return true;
      }
      e.preventDefault();
      return false;
    }
  }

  checkAffectedProAmount() {
    let newArr: any[] = [];
    this.claimsService.selectedInvoiceLines.line.filter((e: any) => {
      e.selectedLines.filter((d: any) => {
        if (d.component == "PRODUCT") {
          newArr.push(d);
        }
      });
    });

    return newArr.every(
      (item: any) =>
        item.affectedQuantity == "All" ||
        (item.affectedQuantity == "Partial" && item.amountProductAffected)
    );
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

  numberOnly(event: any) {
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
    if (this.newClaimForm.controls['readyForReturn'].value == false &&
         this.newClaimForm.controls['productInstalled'].value == false) {
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
  updateValidatorsForReturn(productInstalled: any, clearReturnInfo: boolean) {
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
          } else {
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
  
  get invoiceLines(): FormArray {
    return this.newClaimForm.get('invoiceLines') as FormArray;
  }
  
  createInvoiceLine(line?: any): FormGroup {
    return this.fb.group({
      affectedQuantity: [line?.affectedQuantity || '', Validators.required],
      amountProductAffected: [line?.amountProductAffected || '', []],
      invoiceSeq: [line?.invoiceSeq || null],
      line:[line || null]
    });
  }
  
  populateInvoiceLines() {
    this.newClaimForm.setControl('invoiceLines', this.fb.array([]));
    this.claimsService.selectedInvoiceLines?.line?.forEach((line: any, lineIndex: number) => {
      line.selectedLines.forEach((item: any, itemIndex: number) => {
        if (item.component === 'PRODUCT') {
          const formGroup = this.createInvoiceLine(item);
          this.invoiceLines.push(formGroup);
          console.log(item, lineIndex, itemIndex, this.invoiceLines);
        }
      });
    });
    if (this.claimsService.selectedInvoiceLines?.isFromClaimHistory &&
      this.claimsService.selectedInvoiceLines?.claimData?.claimStatus.toUpperCase() !==
      "DRAFT") {
      this.invoiceLines.controls.forEach((control: any) => {
        control.disable();
      });
    }
    this.invoiceLines.controls.forEach((control: any) => {
      const line = control.get("affectedQuantity").value;
      if (line != "All") {
        control.get("amountProductAffected").addValidators(Validators.required);
        control.get("amountProductAffected").updateValueAndValidity();
      } else {
        control.get("amountProductAffected").removeValidators(Validators.required);
        control.get("amountProductAffected").updateValueAndValidity();
      }
    });
  }
  
  getInvoiceLineFormGroup(lineIndex: number): FormGroup | null {
    if (lineIndex >= 0 && lineIndex < this.invoiceLines.length) {
      return this.invoiceLines.at(lineIndex) as FormGroup;
    }
    return null;
  }
  
  getProductLineIndex(lineIndex: number, itemIndex: number): number {
    if (!this.claimsService.selectedInvoiceLines?.line) {
      return -1;
    }
    let productIndex = 0;
     if(this.claimsService.selectedInvoiceLines?.line[lineIndex]?.selectedLines.length > 0) {
      productIndex = this.invoiceLines.value.findIndex((item: any) => (item.invoiceSeq == this.claimsService.selectedInvoiceLines.line[lineIndex].selectedLines[itemIndex].invoiceSeq));
    }else{
      return -1;
    }
    // for (let i = 0; i < lineIndex; i++) {
    //   const line = this.claimsService.selectedInvoiceLines.line[i];
    //   if (line && line.selectedLines) {
    //     productIndex += line.selectedLines.filter((item: any) => item.component === 'PRODUCT').length;
    //   }
    // }
    // const currentLine = this.claimsService.selectedInvoiceLines.line[lineIndex];
    // if (currentLine && currentLine.selectedLines) {
    //   for (let j = 0; j <= itemIndex; j++) {
    //     if (currentLine.selectedLines[j]?.component === 'PRODUCT') {
    //       if (j === itemIndex) {
    //         return productIndex;
    //       }
    //       productIndex++;
    //     }
    //   }
    // }
    return productIndex;
  }
  
  //needs to remove after uninstall moved to shared component
  onAffectedQuantityChange(item: any, formIndex: number) {
    const formGroup = this.getInvoiceLineFormGroup(formIndex);
    if (!formGroup) return;
    const value = formGroup.get('affectedQuantity')?.value;
    item.affectedQuantity = value;
    const amtControl = formGroup.get('amountProductAffected');
    // Reset value
    amtControl?.setValue('');
    item.amountProductAffected = '';
    // Update validators: if 'All' then clear validators, if 'Partial' then require amount
    if (value === 'All') {
      amtControl?.clearValidators();
    } else {
      amtControl?.setValidators([Validators.required]);
    }
    amtControl?.updateValueAndValidity();
    this.checkProductAffectedSelcted();
  }
  //needs to remove after uninstall moved to shared component
  onQuantityChange(item: any, formIndex: number, fieldName: string, event: any) {
    const formGroup = this.getInvoiceLineFormGroup(formIndex);
    if (!formGroup) return;
    const value = event.target.value;
    if (fieldName === 'amountProductAffected') {
      item.amountProductAffected = value;
    }
    formGroup.get(fieldName)?.setValue(value);
    this.checkProductAffectedSelcted();
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
    const formArrayIndex = this.getProductLineIndex(obj?.lineIndex, obj?.itemIndex);
    if (formArrayIndex >= 0 && formArrayIndex < this.invoiceLines.length) {
      this.invoiceLines.removeAt(formArrayIndex);
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
  }
  navigateToBack() {
    if (this.claimsService.selectedInvoiceLines?.isFromClaimHistory) {
      this.claimsService.navigateBack();
    } else {
      this.router.navigate(['/residential/claims/createclaim']);
    }
  }
}
