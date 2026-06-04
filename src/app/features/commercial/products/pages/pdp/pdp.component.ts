import {
  Component,
  OnInit,
  ViewEncapsulation,
  Input,
  ViewChild,
  ElementRef,
  TemplateRef,
  Inject,
  NgZone,
  ChangeDetectorRef,
} from "@angular/core";
import { DatePipe, Location } from "@angular/common";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { ErrorModalComponent } from "src/app/features/shared/components/error-modal/error-modal.component";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import { SpecificationsWidget } from "src/app/features/shared/interfaces/specifications-widget";
import { ChooseAddressLightboxComponent } from "../../components/choose-address-lightbox/choose-address-lightbox.component";
import { ShareViaEmailLightboxComponent } from "../../components/share-via-email-lightbox/share-via-email-lightbox.component";
import { ProductService } from "../services/product.service";
import { StorageService } from "src/app/features/http-services/storage.service";
import { XchangeAddAccessoriesLightboxComponent } from "src/app/features/shared/components/xchange-add-accessories-lightbox/xchange-add-accessories-lightbox.component";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { AddCompanionProductsComponent } from "../../components/add-companion-products/add-companion-products.component";
import { CommercialPlpTypes } from "src/app/features/shared/constants/menu/commercial.config";
import { debounceTime, map, mergeMap, Subject, take } from "rxjs";
import { ConfirmationDialogComponent } from "src/app/features/shared/components/confirmation-dialog/confirmation-dialog.component";
import { PlpOrderSamplesComponent } from "../../components/plp-order-samples/plp-order-samples.component";
import { commercialFullSpecifications } from "src/app/features/shared/constants/pdp-full-specifications";
import { WINDOW } from "src/app/features/shared/utilities/window";
import { DOCUMENT } from "@angular/common";
import { environment } from "src/environments/environment";
import { OrderService } from "src/app/features/residential/orders/services/order.service";
import { MESSAGE_CONSTANTS } from "src/app/features/shared/constants/BANNER-MESSAGE-CONSTANTS";

@Component({
    selector: "app-pdp",
    templateUrl: "./pdp.component.html",
    styleUrls: ["./pdp.component.scss"],
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class PdpComponent implements OnInit {
  @Input() pdpDataOptions: any;
  @Input() colorVariant: any;
  breadcrumbItems: BreadcrumbItems = [
    {
      name: "Home",
      path: "/commercial",
      active: false,
    },
    {
      name: "Products",
      path: "/commercial/product-owner",
      active: false,
    },
    /*{
      name: "Carpet",
      path: " ",
      active: false,
    },
    {
      name: "commercial Broadloom",
      path: " ",
      active: false,
    },
    {
      name: "Neutral Shift",
      path: " ",
      active: true,
    },*/
  ];
  typeOfproduct: any = "";
  productType: any;
  subProductType: any;
  isAtpCheck: boolean = false;
  atpCheckProductTypes = JSON.parse(CommercialPlpTypes.atpCheckProductTypes);
  checkOrderRestriction = JSON.parse(
    CommercialPlpTypes.account_sample_order_restriction
  );

  feetyardForm!: FormGroup;
  feetyardSubmitButton = "Check Availability / Place Order";
  multiCutsForm!: FormGroup;
  productCode: any;
  pdbData: any;
  pdpInventoryUom: any = "";
  pdpPricingUOMValue: any = "";
  pdpPricingUOMCode: any = "";
  pdpInventoryUomValue: any = 0;
  pdpConvUnit: any;
  inputUOM: any;
  cartonToUOMConv: any;
  zcttouomconv: any;
  productImages: any = [];
  productPriceDetails: any = {};
  warrantyInfo: any = [];
  careAndMaintenance: any = [];
  installationInfo: any = [];
  mediaInfo: any = [];
  cartDataForShippingInfo:any;
  feetYardFormDataSubmit: any;
  atpFromCart: boolean = false;
  shippingOptions: any = {};
  erpProductCategory: any = "";
  rollsPlaceholder = 200;
  conversationZctToLf: any;
  pdpInvUOMCode: any = "";
  pdpInvUOMValue: any = "";
  requestedQty: any;
  convertPdpInvUOMValue: any = "";
  inventoryUomQty: any = 0;
  fullInventoryUomQty: any = 0;
  pricingUomQty: any = 0;
  checkAvailabilityCTA: boolean = false;
  spinnerLoading: boolean = false;
  recommendedImages: any = {
    Installation:
      "https://s7d4.scene7.com/is/image/MohawkResidential/adhesive_bucket_example?fmt=webp",
    Trim: "https://s7d4.scene7.com/is/image/MohawkResidential/t_molding_example?fmt=webp",
    Cushion:
    "https://s7d4.scene7.com/is/image/MohawkResidential/smartcushion_mhklockup_allpet_color_logo?fmt=webp&op_sharpen=1&wid=600&hei=600&scl=9",
  };
  isQuote: boolean = false;
  cartData: any = {};
  csrSuperAdmin: any = {};
  unitArray: any = [];
  detailedProductType: string = "";
  shippingAddress: any;
  feetYardFormData: any;
  uid: string = "";
  quoteCode: any;
  quoteCodeId: any;
  feetValue: any;
  inchesValue: any;
  isPermissions: boolean = false;
  sumValueMultiCut: any;
  multiCutFlag: boolean = false;
  pdpUomConversionRate: any = [];
  replacementOrderModalForm!: FormGroup;
  modalRef!: BsModalRef;
  fullSpecificationsConst: any = commercialFullSpecifications;
  fullSpecificationsConstWidgets: any = [];
  fullPerformanceSustainabilityConstWidgets: any = [];
  fullDesignConstWidgets: any = [];
  fullWeighsMeasureConstWidgets: any = [];
  orderRestictContent: any = "";
  isProductManager: boolean = false;
  @ViewChild("orderRestrictionModal")
  orderRestrictionModalRef!: TemplateRef<any>;
  crossOverCheck: any;
  crossoverData: any;
  completedata: any;
  crossoverProducts: any[] = [];
  alertType = "danger";
  @ViewChild("shippingOption", { static: true })
  shippingOption!: TemplateRef<any>;
  @ViewChild("changeDeliveryType", { static: true })
  changeDeliveryType!: TemplateRef<any>;
  lineShipComplete: boolean = true;
  rollsMinLength: boolean = false;
  rollsMaxLength: boolean = false;
  inventoryMinFeet: boolean = false;
  inventoryMaxFeet: boolean = false;
  inventoryMinInches: boolean = false;
  inventoryMaxInches: boolean = false;
  tabFeildsErrMsg: any = "";
  substituteProductFlag: boolean = false;
  isShipToUser:boolean = false;
  soldToAccount:any = "";
  viewInventoryHS:boolean = false;
  specChangeSKUs: any = ["CDL74", "CDL77", "CAD74", "CAD77", "SPL01"];
  BANNER_MESSAGES: any = MESSAGE_CONSTANTS;
  bundleProduct:boolean = false;
  constructor(
    public modalService: BsModalService,
    private service: ProductService,
    private router: Router,
    private fb: FormBuilder,
    private _location: Location,
    private activate: ActivatedRoute,
    public storageService: StorageService,
    public productService: ProductService,
    public userService: UserService,
    private orderService: OrderService,
    @Inject(DOCUMENT) private document: Document,
    @Inject(WINDOW) private windowRef: Window,
    private datePipe: DatePipe,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
    if (router.url.includes("cart")) {
      this.atpFromCart = true;
    }
  }

  ngAfterViewInit(): void {
    this.scrollPageToTop();
  }

  returnPreviousUrl() {
    const url: any = localStorage.getItem("plpUrl");
    if (url) {      
    this.router.navigateByUrl(url);
    } else {
      this._location.back()
    }
  }

  createFeetYardForm() {
    this.feetyardForm = this.fb.group({
      unit: ["", [Validators.required]],
      // unit: ["YDK", [Validators.required]],
      quantity: ["", [Validators.min(1)]],
      feet: ["", [Validators.required, Validators.min(0)]],
      inches: [""],
      dye: [""],
      targetLength: [""],
      minLength: [""],
      maxLength: [""],
      maxFeet: [""],
      maxInches: [""],
      minFeet: [""],
      minInches: [""],
    });
    this.multiCutsForm = this.fb.group({
      multicuts: this.fb.array([]),
      dye: [""],
    });
    this.addVariation();
  }
  
  // Simple method to check if feet and inches combination is valid for display purposes
  isFeetInchesValid(): boolean {
    const feet = this.feetyardForm?.get('feet')?.value;
    const inches = this.feetyardForm?.get('inches')?.value;
    
    // Convert to numbers, treating empty strings as 0
    const feetValue = feet === '' || feet === null || feet === undefined ? 0 : Number(feet);
    const inchesValue = inches === '' || inches === null || inches === undefined ? 0 : Number(inches);
    
    // Valid if either feet or inches has a value > 0
    return feetValue > 0 || inchesValue > 0;
  }

  // Show warning message when both feet and inches are 0
  showFeetInchesWarning(): boolean {
    if (this.feetyardForm?.get('unit')?.value !== 'LF') return false;
    return !this.isFeetInchesValid();
  }

  // Check if order meets 1.33 SY minimum requirement
  meetsMinimumOrderRequirement(): boolean {
    const unit = this.feetyardForm?.get('unit')?.value;
    
    // Apply minimum validation to Linear Feet and Square Foot units
    if (unit === 'LF') {
      const feet = this.feetyardForm?.get('feet')?.value;
      const inches = this.feetyardForm?.get('inches')?.value;
      
      const feetValue = feet === '' || feet === null || feet === undefined ? 0 : Number(feet);
      const inchesValue = inches === '' || inches === null || inches === undefined ? 0 : Number(inches);
      
      // Convert to total feet: feet + (inches/12)
      const totalFeet = feetValue + (inchesValue / 12);
      
      // Use 3.78 feet as minimum (equivalent to 1.33 SY based on conversion)
      return totalFeet > 0;
    } 
    else if (unit === 'FTK') { // Square Foot
      const quantity = this.feetyardForm?.get('feet')?.value; // For Square Foot, quantity is in feet field
      const quantityValue = quantity === '' || quantity === null || quantity === undefined ? 0 : Number(quantity);
      
      // From screenshot: 12 Square Feet = 1.33 Square Yard exactly
      // So minimum is 12 Square Feet (not 12.09)
      return quantityValue > 0;
    }
    
    return true; // Other units don't have minimum requirement
  }

  // Get minimum order requirement from UOM details
  getMinimumOrderText(): string {
    const unit = this.feetyardForm?.get('unit')?.value;
    
    // Try to get minimum from UOM details
    if (this.uomDetails?.overages && this.uomDetails.overages.length > 0) {
      const relevantOverage = this.uomDetails.overages.find((overage: any) => 
        overage.uom === unit || overage.uom === 'SF' || overage.uom === 'SY'
      );
      
      if (relevantOverage && relevantOverage.minOrderQuantity > 0) {
        return `Minimum order requirement is ${relevantOverage.minOrderQuantity} ${relevantOverage.uom}.`;
      }
    }
  //  return "";
    // Fallback to standard message
   return "Minimum order requirement is 1.33 square yards.";
  }

  // Show warning when order is below minimum
  showMinimumOrderWarning(): boolean {
    // Only show minimum order warning for SOFTSURFACE products
    if (this.productType !== 'SOFTSURFACE') return false;

    const unit = this.feetyardForm?.get('unit')?.value;

    // Show warning for Linear Feet and Square Foot units
    if (unit === 'LF') {
      return this.isFeetInchesValid() && !this.meetsMinimumOrderRequirement();
    }
    else if (unit === 'FTK') { // Square Foot
      const quantity = this.feetyardForm?.get('feet')?.value;
      const quantityValue = quantity === '' || quantity === null || quantity === undefined ? 0 : Number(quantity);
      const hasQuantity = quantity && Number(quantity) > 0;
      return hasQuantity && !this.meetsMinimumOrderRequirement();
    }

    return false;
  }
  keyPressNumbers(e: any) {
    this.inchesValue = e.currentTarget?.value ? e.currentTarget.value : 0;
    const currentValue = Number(this.inchesValue + e.key);
    const isTwoDigits = /^\d{0,2}$/.test(currentValue.toString());
    const isWithinRange = currentValue >= 0 && currentValue <= 11;

    if (isTwoDigits && isWithinRange) {
      return true;
    } else {
      e.preventDefault();
      return false;
    }
  }
  public isWalkOff: boolean = false;
  inHouseAccount: boolean = false;
  isCheckAvailabilityAllowed: boolean = false;
  isSalesPerson: boolean = false;
  userInfo: any;
  removeATP:any = false;
  ngOnInit(): void {
    this.activate.queryParams.subscribe((params) => {
      this.shippingAddress = this.productService.getDefaulAddress();
      if (params["name"] != "" && params["name"] !== undefined) {
        this.isWalkOff = true;
      } else this.isWalkOff = false;
    });

    this.activate.params.subscribe((params) => {
      this.shippingAddress = this.productService.getDefaulAddress();

      this.userService.getCurrentUserDetail().subscribe((res: any) => {
        this.uid = res.body?.orgUnit?.uid;
        this.userInfo = res?.body;
        this.soldToAccount = res.body?.orgUnit?.soldTo || "";
      },(err)=>{this.service.progressHide('pdpDetailsId');});
      this.storageService.getItem("miniCartCount").subscribe((res) => {
        this.cartData = res;
      });

      /* this.productService.getMiniCartData(this.uid).subscribe((res) => {
        this.cartData = res;

      });*/

      this.storageService.getItem("userInfo").subscribe((res) => {
        this.isPermissions = res?.isCSR
          ? true
          : res?.isCSRSuperAdmin
          ? true
          : res?.isCustomer
          ? true
          : false;
        // this.userInfo = res?.body;
        this.csrSuperAdmin = res;
        this.isShipToUser = res?.isShipToUser;
        if (res?.isSalesPerson || res?.isSalesOps) {
          this.isSalesPerson = true;
        }
        if (res?.isProductManager) {
          this.isProductManager = true;
        }
      },(err)=>{ this.service.progressHide('pdpDetailsId');});

      this.typeOfproduct =
        this.activate.snapshot.queryParamMap.get("type") || "hard";
      this.userService.getCurrentUserDetail().subscribe((res: any) => {
        this.uid = res.body?.orgUnit?.uid;
        this.inHouseAccount = res.body?.orgUnit?.inHouseAccount;
      },(err)=>{ this.service.progressHide('pdpDetailsId');});
      this.createFeetYardForm();
      this.getQueryParamFromUrl();
      this.loadAllPdpAPI();
      this.getAllAccessory();
      this.createReplacementMdlForm();
      this.productService.getMiniCartData(this.uid).pipe(take(1)).subscribe((res) => {
        this.cartData = res?.body || res;
        if (this.cartData && typeof this.cartData === 'object') {
            if ((!('totalItems' in this.cartData)) && (!('errorMessage' in this.cartData))) {
              this.removeATP = true;
              this.removeATPCart();
            }
        }
      },(err)=>{ this.service.progressHide('pdpDetailsId');});

    });
    // this.getCrossOver(this.productCode);
    let msg: any = localStorage.getItem("addToCartSuccessInfo");
    if (msg) {
      this.alertType = "warning";
      this.exceptionErrorMessage = msg;
      setTimeout(() => {
        this.alertType = "danger";
        this.exceptionErrorMessage = "";
        localStorage.removeItem("addToCartSuccessInfo");
      }, 10000);
    }
  }

  createReplacementMdlForm() {
    this.replacementOrderModalForm = this.fb.group({
      hasClaimSubmitted: [null],
      replacementOrder: [null],
      Claim: [""],
      replacementReason: [null],
      PO: [""],
      Order: [""],
      Invoice: [""],
      Roll: [""],
    });
  }
  subject = new Subject();
  getMinMaxValues(event: any) {
    this.subject.next(event.target.value);
  }
  getTargetLength(event: any) {
    this.getValues(event.target.value);
  }
  minRollLength: any;
  maxRollLength: any;
  getValues(value: any) {
    let shipToId = this.uid;
    this.productService.getMiniCartData(this.uid).subscribe((resp: any) => {
      if (resp.body.errorMessage) {
        shipToId = this.uid;
        this.fetchMinMaxRollLength(value, shipToId);
      } else {
        this.storageService.getItem("defaultAddres").pipe(take(1)).subscribe((res: any) => {
          if (res != null) {
            shipToId = res.shipTo;
          }
          this.fetchMinMaxRollLength(value, shipToId);
        });
      }
    },(err)=>{ this.service.progressHide('pdpDetailsId');});
  }
  fetchMinMaxRollLength(value: any, shipToId: any) {
    this.productService
      .getMinMaxRollLength(value, this.uid, shipToId, this.productCode)
      .pipe(debounceTime(1000))
      .subscribe({
        next: (res: any) => {
          if (res?.body && Object.keys(res?.body).length != 0) {
            this.minRollLength = res?.body?.minRoll;
            this.maxRollLength = res?.body?.maxRoll;
            localStorage.setItem("MinRollLength", this.minRollLength);
            localStorage.setItem("MaxRollLength", this.maxRollLength);
            let control = this.feetyardForm.controls;
            if (this.selectedTab && this.selectedTab != "feet") {
              control["feet"].setValue(value);
            }
            control["feet"].updateValueAndValidity();
            control["targetLength"].setValue(value);
            control["targetLength"].updateValueAndValidity();
            // control["minLength"].setValue(res?.body?.minRoll);
            //  control["maxLength"].setValue(res?.body?.maxRoll);
            control["minLength"].updateValueAndValidity();
            control["maxLength"].updateValueAndValidity();
          }
        },
        error: (err) => { this.service.progressHide('pdpDetailsId');},
      });
  }
  productValue: any;
  getQueryParamFromUrl() {
    let lastIndexOfUrl = this.router.url.split("/");
    this.productCode = lastIndexOfUrl[lastIndexOfUrl.length - 1];
    this.productValue = this.productCode.replace("?type=soft", "");
  }

  numberOnly(event: any, type: any = ""): boolean {
    const value = event?.currentTarget?.value;
    if (type === "inch" && parseInt(value + event.key) > 11) {
      return false;
    }
    const charCode = event.which ? event.which : event.keyCode;
    if (type === "YDK" || type === "FTK" || type == "rolls") {
      if (event?.key == "." && value.includes(".")) {
        return false;
      }
      return this.isDecimalNumberKey(event);
    } else if (type === "ZCT") {
      if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
      }
      if (event?.key === ".") {
        return false;
      }
      return true;
    } else {
      if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
      }
      return true;
    }
  }

  isDecimalNumberKey(event: any) {
    const value = event?.currentTarget?.value;

    var charCode = event.which ? event.which : event.keyCode;
    if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57))
      return false;
    if (value.includes(".")) {
      let val = value.split(".");
      val = val[val.length - 1].split("");
      if (val.length > 1) {
        return false;
      }
    }
    return true;
  }
  restrictUptoTwoDecimal(e: any) {
    var t = e.target.value;
    e.target.value =
      t.indexOf(".") >= 0
        ? t.substr(0, t.indexOf(".")) + t.substr(t.indexOf("."), 3)
        : t;
    // Allow single "0" but prevent leading zeros like "01", "02", etc.
    if ((e.target.value + "")[0] === "0" && e.target.value.length > 1 && (e.target.value + "")[1] !== ".") {
      e.target.value = e.target.value.substring(1);
    }
  }

  specsData: SpecificationsWidget = [
    {
      name: "Style Name",
      value: "Neutral Shift",
    },
    {
      name: "Color",
      value: "Crackled Glaze",
    },
    {
      name: "# of Colors",
      value: "12",
    },
    {
      name: "Brand",
      value: "Properties By Mohawk",
    },
    {
      name: "Product Type",
      value: "CARPETPRODUCT",
    },
    {
      name: "Sub Product Type",
      value: "commercial Broadloom",
    },
  ];

  performanceData: SpecificationsWidget = [
    {
      name: "FHA Compliance",
      value: "Texture: F",
    },
    {
      name: "Durability Rating",
      value: "3.50",
    },
    {
      name: "Indoor Air Quality",
      value: "GLP 1118",
    },
    {
      name: "Flammability",
      value: "16CFR-1630.4 (FF-1-70): Pass",
    },
    {
      name: "Recycled Content",
      value: " ",
    },
    {
      name: "Leed Certification",
      value: " ",
    },
    {
      name: "Country of Origin",
      value: "USA",
    },
  ];

  measuresData: SpecificationsWidget = [
    {
      name: "Standard Roll Size",
      value: "200",
    },
    {
      name: "Pattern Repeat",
      value: "None",
    },
    {
      name: "Roll Width",
      value: "12Ft 00In",
    },
  ];

  designSpecifications: SpecificationsWidget = [
    {
      name: "Construction",
      value: "Tufted",
    },
    {
      name: "Surface Appearance",
      value: "Texture",
    },
    {
      name: "Fiber Category",
      value: "Triexta",
    },
    {
      name: "Fiber Description",
      value: "SmartStrand Forever Clean",
    },
    {
      name: "Stain Resistance",
      value: "Inherent Built-in Stain Resistance",
    },
    {
      name: "Soil Resistance",
      value: "Inherent Built-in Soil Resistance",
    },
    {
      name: "Dye Method",
      value: "FLUIDYE",
    },
    {
      name: "Primary Backing",
      value: "WOVEN POLYPROPYLENE",
    },
    {
      name: "Secondary Backing",
      value: "Woven Polypropylene/Polyester Blend",
    },
  ];

  bsModalRef?: BsModalRef;
  minicartSubscription: any;
  selectedUnit: any;
  loadAPIs: any = ["pdpData", "uomData", "matrix", "productPrice", "media"];
  openChooseAddressModal(
    cartData: any,
    value: any  = null,
    type?: any,
    feetYardFormData?: any,
    isForAddAccessories?: any,
    showOrderSample?: any
  ) {
    this.isAtpCheck = this.atpCheckProductTypes.includes(this.subProductType);
    if(this.erpProductCategory === 'B'){
      this.isAtpCheck = true;
    }
    if ((this.pdbData?.classification == "Accessories" && !(this.pdbData.subProductType === 'CUSHION_PAD' && this.isAtpCheck))|| this.pdbData.productType ===  "MERCHANDISING") {
      this.isAtpCheck = false;
    }
    localStorage.setItem("selectedProductTab", this.selectedTab);
    if (type == "multiCut") {
      value = (value || []).filter((entry: any) => (entry?.feet || entry?.inches));
    }    
    const initialState: ModalOptions = {
      initialState: {
        // Data to  popup
        selectedProduct: this.selectedProduct,
        requestedQty:this.convertPdpInvUOMValue,
        erpProductCategory: this.erpProductCategory,
        cartData: cartData,
        // productType:
        //   this.pdbData?.productType?.includes("CARPET") ||
        //   this.pdbData?.productType?.includes("SOFTPRODUCT")
        //     ? "Soft_Surface"
        //     : "Hard_Surface",
        productType: this.pdbData?.productType,
        feetyardForm: feetYardFormData,
        multiCutIndication: type == "multiCut" ? true : false,
        viewInventory: type === "Inventory" ? true : false,
        pricedetails: this.productPriceDetails,
        requestedYdkQty: this.requestedYdkQty,
        aptCheckEntrie: value ? value : [],
        openAddAccessories: isForAddAccessories,
        selectedAccessories: this.selectedAccessories,
        showOrderSample: showOrderSample,
        productColorVariantOptions:
          showOrderSample == true
            ? this.pdbData?.productColorVariantOptions
            : undefined,
        inventoryUOM: this.pdpInvUOMCode,
        inventoryUOMConvValue: this.convertPdpInvUOMValue,
        minRollLength: this.minRollLength,
        maxRollLength: this.maxRollLength,
        standardRollLength: this.uomDetails.standardRollLength
          ? this.uomDetails.standardRollLength
          : 0,
        productCode: this.productCode,
        sameDyeLot:
          this.uomDetails?.displayDyeLot == false ? false : this.sameDyeLot,
        selectedPDPTab: this.selectedTab,
        viewInventoryHS: this.viewInventoryHS,
        preferredStock: this.variantData?.selected?.preferredStock,
        bundleProduct: this.bundleProduct,
      },
    };
    this.bsModalRef = this.modalService.show(
      ChooseAddressLightboxComponent,
      Object.assign(initialState, {
        id: "ChooseAddressModal",
        class: "modal-xl modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
    this.bsModalRef.content.pdpdata = this.entries;
    this.bsModalRef.content.isAtpCheck = isForAddAccessories || this.isAtpCheck;
  }
  selectedProduct: any = {};
  setSelectedProductItem(item: any) {
    // this.selectedProduct = { ...item, ...this.pdbData };
    if (this.productCode != item?.code) {
      this.productCode = item?.code;
      this.productValue = item?.code;
      // this.loadAllPdpAPI();
    }
  }
  loadAllPdpAPI() {
    this.service.progressShow('pdpDetails', 'pdpDetailsId');
    this.loadAPIs = [...[], ...[]];
    this.getPdpData();
    this.getProductMedias(this.productCode);
    this.getProductVariantMatrix();
    this.getCrossOver(this.productCode);
    this.getBundledReferences();
  }
  openShareViaEmailModal() {
    let mailSubject = `Product Sheet from MohawkXchange.com -${this.variantData?.selected?.sellingStyleName}`;
    this.showElementForPdf(true);
    let content: any = document.getElementById("print-area")?.innerHTML;

    let htmlContent = `
    <html>
        <head>
        <title>${window.location.href}</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
        <link rel="stylesheet" href="/styles.css" crossorigin="anonymous">
        </head>
        <body style="background-color:#fff; background:#fff;">
          ${content}
        </body>
      </html>`;
    const initialState: ModalOptions = {
      initialState: {
        // Data to  popup
        mailSubject: mailSubject,
        content: htmlContent,
        fromPDP: true,
      },
    };
    this.showElementForPdf(false);
    this.bsModalRef = this.modalService.show(
      ShareViaEmailLightboxComponent,
      Object.assign(initialState, {
        class: "modal-lg modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }

  showElementForPdf(bool: boolean) {
    this.document.querySelectorAll(".print-element").forEach((element: any) => {
      element.style.display = bool == true ? "block" : "none";
    });
  }

  openPDF() {
    let styleName = this.pdbData?.code.replaceAll(".", "_");
    let url =
      environment.pdfPath +
      `${this.pdbData?.productType}` +
      "/" +
      styleName +
      ".pdf";
    this.windowRef.open(url, "_blank");
  }
  setLoadAPI(apiName: any) {
    if (this.loadAPIs.indexOf(apiName) == -1) {
      this.loadAPIs.push(apiName);
      if (this.loadAPIs.length >= 8) {
        this.service.progressHide('pdpDetailsId');
      }
    }
  }
  exceptionErrorMessage: string = "";
  getPdpData() {
    let substituteProduct = localStorage.getItem("alternateProductData");
    if (substituteProduct) {
      this.substituteProductFlag = true;
    } else {
      this.substituteProductFlag = false;
    }
    this.productCode = this.activate.snapshot.paramMap.get("code");
    this.service.getPdpRecords(this.productCode, this.substituteProductFlag).subscribe(
      (res) => {
        this.setLoadAPI("pdpData");
        this.scrollPageToTop();
        if (res && res.status == 500) {
          this.exceptionErrorMessage = res.error;
          this.setLoadAPI("uomData");
        }
        if (res && res.status == 400) {
          this.exceptionErrorMessage = res.error.message
            ? res.error.message
            : res.message;

          this.setLoadAPI("uomData");
        }
        if (res.body) {
          this.pdbData = res.body;
          this.productType = this.pdbData.productType;
          this.subProductType = this.pdbData.subProductType;
          this.isAtpCheck = this.atpCheckProductTypes.includes(
            this.subProductType
          );

          this.isCheckAvailabilityAllowed = this.checkOrderRestriction.includes(
            this.subProductType
          );
          this.selectedProduct = { ...this.selectedProduct, ...this.pdbData };
          
          let path = "";
          if (this.productType == "SOFTSURFACE") {
            path =
              "commercial/products?name=Soft Surface&page=View All Soft Surface&type=SOFTSURFACE";
          }
          if (this.productType == "HARDSURFACE") {
            path =
              "commercial/products?name=Hard Surface&page=View All Hard Surface&type=HARDSURFACE";
          }
          if (this.productType == "TILE") {
            path =
              "commercial/products?name=Tile&page=View%20All%20Tile&type=tile";
          }
          if (this.productType == "ACCESSORIES") {
            this.getAccessoriesPricing(this.pdbData);
            path =
              "commercial/products?name=Accessories&page=View%20All%20Accessories&type=ACCESSORIES";
          }
          if (this.productType == "MERCHANDISING") {
            path =
              "commercial/products?name=Merchandising&page=View%20All%20Merchandising&type=MERCHANDISING";
          }
          if (this.productType == "SOFTSURFACE" && this.isWalkOff) {
            path =
              "commercial/products?name=Walk%20off&page=Carpet%20Tile&type=CARPET_TILE";
          }

          // if (
          //   this.pdbData.subProductType.includes("RESILIENT") ||
          //   this.pdbData.subProductType.includes("VINYL")
          // ) {
          //   path =
          //     "commercial/products?name=Resilient%2FVinyl&page=View%20All%20Resilient%2FVinyl&type=resilient_vinyl";
          // }
          if (this.isWalkOff) {
            this.breadcrumbItems[2] = {
              name: "Walk Off",
              path: path,
              active: false,
            };
          } else {
            this.breadcrumbItems[2] = {
              name: decodeURIComponent(
                this.convertTitleCase(this.pdbData.productType)
              ),
              path: path,
              active: false,
            };
          }
          this.breadcrumbItems[3] = {
            name: decodeURIComponent(
              this.convertTitleCase(this.pdbData.subProductType)
            ),
            path: "",
            active: true,
          };
          this.getUOMDetails();
          if (this.productType != "SAMPLE") {
            this.orderRestictContent = `	
            ${this.subProductType} cannot be ordered with the Salesperson’s Profile.`;
          }
          if (!this.inHouseAccount && this.isSalesPerson) {
            this.orderRestictContent = `	
            ${this.subProductType} cannot be ordered with the Commercial Salesperson’s Profile.`;
          }
          if (this.inHouseAccount && this.productType != "SAMPLE") {
            // this.modalRef = this.modalService.show(
            //   this.orderRestrictionModalRef,
            //   Object.assign("", {
            //     id: "orderrestriction",
            //     class: "modal-md modal-dialog-centered",
            //   })
            // );
          }
        }
        this.manageFullSpecificatons(
          this.productType,
          this.subProductType,
          this.pdbData
        );
        if (!res.body && res.status != 500 && res.status != 400) {
          this.setLoadAPI("uomData");
        }
      },
      (err: any) => {
        this.setLoadAPI("pdpData");
        this.setLoadAPI("uomData");
      }
    );
  }
  
  getBundledReferences(){
    this.service.getBundledReferences(this.productCode).subscribe(
      (res) => {
        this.setLoadAPI("bundledReferences");
        if(res?.body?.references && res?.body?.references.length > 0){
          this.bundleProduct = true;
        }
      },
      (err: any) => {
        this.setLoadAPI("bundledReferences");
      });
  }

  getAccessoriesPricing(item: any) {
    const payLoad = {
      collection: "",
      promoFlg: "0",
      sortBy: "",
      orderOfSort: "",
      isDownloadable: false,
      futurePrice: false,
      currentPage: "",
      recordsPerPage: "",
      startRow: "",
      endRow: "",
      styleDetails: [
        {
          styleNumber: item?.sellingStyleId,
          productCategory: "",
          sizeCode: item?.sellingSizeId,
          backingCode: item?.sellingBackingId,
          sellingGroup: "",
          styleName: item?.sellingStyleName,
          code: item?.code,
          colorNumber: item?.sellingColorId,
        },
      ],
    };
    return this.productService
      .getAccessoriesPricing(payLoad)
      .subscribe((resp: any) => {
        item.priceEach = resp?.body?.result?.length
          ? resp?.body?.result[0]?.priceEach
          : "NA";
      },(err)=>{
        this.service.progressHide('pdpDetailsId');
      });
  }
  variantData: any;
  convertTitleCase(str: any) {
    if (Number(str) > 0) {
      return str;
    }
    if (str === true || str === false) {
      let value = str == true ? "Yes" : "No";
      return value;
    } else if (str) {
      str = str.toString();
      str = str.replaceAll("_", " ");
      return str.toLowerCase().replace(/\b\w/g, (s: string) => s.toUpperCase());
    } else {
      return "";
    }
  }
  getProductVariantMatrix() {
    this.service.getPdpVariantRecords(this.productCode).subscribe(
      (res) => {
        this.setLoadAPI("matrix");

        if (res && res.status == 500) {
          this.exceptionErrorMessage = res.error;
        }
        if (res && res.status == 400) {
          this.exceptionErrorMessage = res.error.message
            ? res.error.message
            : res.message;
        }
        if (res.body) {
          this.zone.run(() => {
            this.variantData = res.body;
            this.cdr.detectChanges();
          })
        }
      },
      (err: any) => {
        this.setLoadAPI("matrix");
      }
    );
  }

  noProductsAvailable() {
    const initialState: ModalOptions = {
      initialState: {
        // Data to  popup
      },
    };
    this.bsModalRef = this.modalService.show(
      ErrorModalComponent,
      Object.assign(initialState, {
        class: "modal-md modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
    this.bsModalRef.content.title = "Product not Available";
  }

  defaultPayload: Object = {
    addressCity: "string",
    addressLine1: "string",
    addressLine2: "string",
    addressName: "Mohawk Flooring",
    addressPostalCode: "",
    addressState: "string",
    claimNumber: "",
    distributionChannel: "",
    division: "",
    entries: [
      {
        dyeLot: " ",
        feet: 30,
        inches: 6,
        multiCut: [
          {
            cut: "",
            itemNumber: 1,
          },
        ],
        productCode: "",
        requestUOM: "LF",
        requestedQty: 1,
      },
    ],
    hasClaimSubmitted: true,
    invoiceNumber: "612345",
    oneTimeShippingAddress: true,
    orderNumber: "0001120",
    purchaseOrderNumber: "POTest",
    replacementOrder: true,
    replacementReason: "string",
    salesOrganization: "0123",
    shipTo: "",
    shipVia: "truck",
    shippingAddressID: "",
    shippingInfo: {
      jobSite: true,
      loadingDock: true,
      location: "string",
      offloadEqptRequired: true,
      requireNotification: true,
      siteContactName: "string",
      siteContactPhone: "string",
      unLoadAssistance: true,
    },
    soldTo: "",
  };

  addToCartFailed = false;
  errorMessage = "";
  addToCartDirect(item: any, feetyardForm: any, type?: any, value = null) {
    this.feetYardFormData = feetyardForm;
    this.cartData = this.storageService.cartData;
    // this.productService.createCart().subscribe((res: any) => {
    let quantity = 0;
    if (
      this.feetYardFormData?.requestedQty &&
      this.feetYardFormData?.requestedQty != "" &&
      this.feetYardFormData?.requestedQty > 0
    ) {
      if (
        this.feetYardFormData?.unit != "EA" &&
        (this.productType === "HARDSURFACE" ||
          (this.productType === "SOFTSURFACE" &&
            this.subProductType === "CARPETPRODUCT_CARPET_TILE")) ||
            (this.productType === "ACCESSORIES" && this.feetYardFormData?.unit =='LF')
      ) {
        quantity = this.convertPdpInvUOMValue;
      } else {
        quantity = this.feetYardFormData?.requestedQty;
      }
    } else {
      quantity = this.feetYardFormData?.feet;
    }
    const payLoad: any = {
      addressCity:
        this.shippingAddress?.addressCity ||
        this.shippingAddress?.district ||
        this.shippingAddress?.town ||
        "",
      addressCountry:
        this.shippingAddress?.country || this.shippingAddress?.country || "",
      addressLine1:
        this.shippingAddress?.addressLine1 || this.shippingAddress?.line1 || "",
      addressLine2:
        this.shippingAddress?.addressLine2 || this.shippingAddress?.line2 || "",
      addressPostalCode:
        this.shippingAddress?.addressPostalCode ||
        this.shippingAddress?.postalCode ||
        "",
      addressState:
        this.shippingAddress?.addressState ||
        this.shippingAddress?.region ||
        "",
      reAtp: false,
      shippingInfo: ! this.shippingAddress?.isOneTimeShipTo
      ? ""
      : this.cartDataForShippingInfo.shippingInfo,
      shipToUnit: this.shippingAddress?.shippingAddressId
        ? this.shippingAddress?.shippingAddressId
        : this.shippingAddress.id || this.uid,
      soldTo: this.isShipToUser ? this.soldToAccount : this.uid,
      orderPlacedSite: "xchange",
      item: [
        {
          dyeLot: this.feetYardFormData?.dye,
          feet: Number(this.feetYardFormData?.feet),
          inches: Number(this.feetYardFormData?.inches),
          productCode: item.code,
          requestedUOM: value
            ? "LF"
            : this.productType === "HARDSURFACE" ||
              (this.productType === "SOFTSURFACE" &&
                this.subProductType === "CARPETPRODUCT_CARPET_TILE")||
                (this.productType === "ACCESSORIES" && this.feetYardFormData?.unit =='LF')
            ? this.pdpInvUOMCode
            : this.feetYardFormData?.unit,
          requestedQty: Number(quantity),
          // requestedQty: this.feetYardFormData?.requestedQty
          //   ? this.productType === "HARDSURFACE" ||
          //     (this.productType === "SOFTSURFACE" &&
          //       this.subProductType === "CARPETPRODUCT_CARPET_TILE")
          //     ? this.convertPdpInvUOMValue
          //     : this.feetYardFormData?.requestedQty
          //   : this.feetYardFormData?.feet,
          //  shipComplete: this.lineShipComplete,
          maxFeet: this.feetYardFormData?.maxFeet,
          maxInches: this.feetYardFormData?.maxInches,
          minFeet: this.feetYardFormData?.minFeet,
          minInches: this.feetYardFormData?.minInches,
          rollPrices: true,
          shippingWarehouse:
            this.atpFromCart === false
              ? this.defaultShippingWarehouse || this.shippingAddress?.defaultShippingWarehouse || ""
              : this.storageService.cartData?.shippingWarehouse ||
                this.defaultShippingWarehouse || this.shippingAddress?.defaultShippingWarehouse ||
                "",
          shipVia:
            this.atpFromCart === false
              ? this.defaultShipVia || this.shippingAddress?.defaultShipVia || ""
              : this.storageService.cartData?.shipVia ||
                this.defaultShipVia || this.shippingAddress?.defaultShipVia ||
                "",
          incoTerms:
            this.atpFromCart === false
              ? this.defaultIncoTerms || this.shippingAddress?.defaultIncoTerms || ""
              : this.storageService.cartData?.incoTerms ||
                this.defaultIncoTerms || this.shippingAddress?.defaultIncoTerms ||
                "",
          shippingCondition:
            this.atpFromCart === false
              ? this.userInfo?.isCustomer  || this.userInfo?.isSalesPerson || this.userInfo?.isSalesOps ? this.originalDefaultShippingMethod || this.defaultShippingMethod || this.shippingAddress?.defaultShippingMethod || "":
              this.defaultShippingMethod || this.shippingAddress?.defaultShippingMethod || ""
              : this.userInfo?.isCustomer || this.userInfo?.isSalesPerson || this.userInfo?.isSalesOps ? this.originalDefaultShippingMethod || this.storageService.cartData?.originalDefaultShippingMethod ||this.storageService.cartData?.shippingCondition ||
                this.defaultShippingMethod || this.shippingAddress?.defaultShippingMethod ||
                "":this.storageService.cartData?.shippingCondition ||
                this.defaultShippingMethod || this.shippingAddress?.defaultShippingMethod ||
                "",
          solution: [],
          productPriceData: this.productPriceDetails,
          sameDyeLot:
            this.uomDetails?.displayDyeLot == false ? false : this.sameDyeLot,
        },
      ],
      noPrice: true,
      oneTimeShippingAddress: this.shippingAddress?.isOneTimeShipTo || false,
      pdpProductCode: item.code,
      phoneNumber: this.shippingAddress?.phone || "",
      requestedDeliveryDate: this.shippingAddress?.requestedDeliveryDate,
      sampleProduct: false,
      sampleType: this.shippingAddress?.sampleType
      ? this.shippingAddress?.sampleType
      : "",
      shipComplete: this.lineShipComplete,
      shippingWarehouse:
            this.atpFromCart === false
              ? this.defaultShippingWarehouse || this.shippingAddress?.defaultShippingWarehouse || ""
              : this.storageService.cartData?.shippingWarehouse ||
                this.defaultShippingWarehouse || this.shippingAddress?.defaultShippingWarehouse ||
                "",
          shipVia:
            this.atpFromCart === false
              ? this.defaultShipVia || this.shippingAddress?.defaultShipVia || ""
              : this.storageService.cartData?.shipVia ||
                this.defaultShipVia || this.shippingAddress?.defaultShipVia ||
                "",
          incoTerms:
            this.atpFromCart === false
              ? this.defaultIncoTerms || this.shippingAddress?.defaultIncoTerms || ""
              : this.storageService.cartData?.incoTerms ||
                this.defaultIncoTerms || this.shippingAddress?.defaultIncoTerms ||
                "",
          shippingCondition:
            this.atpFromCart === false
              ? this.userInfo?.isCustomer  || this.userInfo?.isSalesPerson || this.userInfo?.isSalesOps ? this.originalDefaultShippingMethod || this.defaultShippingMethod || this.shippingAddress?.defaultShippingMethod || "":
              this.defaultShippingMethod || this.shippingAddress?.defaultShippingMethod || ""
              : this.userInfo?.isCustomer || this.userInfo?.isSalesPerson || this.userInfo?.isSalesOps ? this.originalDefaultShippingMethod || this.storageService.cartData?.originalDefaultShippingMethod ||this.storageService.cartData?.shippingCondition ||
                this.defaultShippingMethod || this.shippingAddress?.defaultShippingMethod ||
                "":this.storageService.cartData?.shippingCondition ||
                this.defaultShippingMethod || this.shippingAddress?.defaultShippingMethod ||
                "",
      replacementOrder:
        this.replacementOrderModalForm.value.replacementOrder == null
          ? this.productService.defaultAddress?.replacementOrder
          : this.replacementOrderModalForm.value.replacementOrder,
      replacementReason: this.replacementOrderModalForm.dirty
        ? this.replacementOrderModalForm.value.replacementReason
        : this.productService.defaultAddress?.replacementReason,
      replacementOrderNumber: this.replacementOrderModalForm.dirty
        ? this.replacementOrderModalForm.value.Order
        : this.productService.defaultAddress?.orderNumber,
      claimNumber: this.replacementOrderModalForm.dirty
        ? this.replacementOrderModalForm.value.Claim
        : this.productService.defaultAddress?.claimNumber,
      invoiceNumber: this.replacementOrderModalForm.dirty
        ? this.replacementOrderModalForm.value.Invoice
        : this.productService.defaultAddress?.invoiceNumber,
      purchaseOrderNumber: this.replacementOrderModalForm.dirty
        ? this.replacementOrderModalForm.value?.PO
        : this.productService.defaultAddress?.poNumber,
      hasClaimSubmitted:
        this.replacementOrderModalForm.dirty &&
        this.replacementOrderModalForm.value.hasClaimSubmitted !== null
          ? this.replacementOrderModalForm.value?.hasClaimSubmitted
          : this.productService.defaultAddress?.hasClaimSubmitted,
      orderSamples: [
      ],
      isAccessoryCart: this.pdbData?.classification == "Accessories" ? true : false
    };
    let cartNumber = this.cartData?.code || null;
    if(this.bundleProduct){
      payLoad.bundleProduct  = true;
    }

    if (this.cartData?.isQuote) {
      this.openConfirmationModal({
        title: "Information",
        content:
          "We could see a quote cart present already. Proceeding with this will delete the current quote cart. Do you still want to continue?",
        primaryActionLabel: "Continue",
        secondaryActionLabel: "Cancel",
        onPrimaryAction: () => {
          this.spinnerLoading = true;

          this.productService
            .cancelCart(this.cartData?.code || "123456")
            .subscribe(
              (res: any) => {
                this.spinnerLoading = false;

                // this.productService.getMiniCartData(this.uid).subscribe({
                //   next: (result: any) => {
                //     this.storageService.setItem("miniCartCount", result);
                //     this.checkForItemAddedinCart();
                //   },
                //   error: (error: any) => {
                //     this.storageService.setItem("miniCartCount", "");
                //   },
                // });
                this.checkForItemAddedinCart();
              },
              (err: any) => {
                this.spinnerLoading = false;
                this.errorMessage = err?.errorMessage;
                this.scrollToTop();
              }
            );
        },
      });
    } else {
      this.productService.getMiniCartData(this.uid).subscribe((res) => {
        if (
          res?.body?.sampleOrder == true &&
          this.storageService?.cartData.hasOwnProperty("code")
        ) {
          this.openConfirmationModal({
            title: "Headsup!",
            content:
              "Looks like a sample cart is active, adding this product to the cart will remove all the samples in your current cart. Are you sure want to continue?",
            primaryActionLabel: "Continue",
            secondaryActionLabel: "Cancel",
            onPrimaryAction: () => this.clearCartAndAdd(payLoad),
            onSecondaryAction: () => {
              this.modalService.hide("confirmationModal");
            },
          });
        } else if (
          this.productType === "ACCESSORIES" &&
          this.storageService.cartData?.sampleOrder == true &&
          this.storageService?.cartData.hasOwnProperty("code")
        ) {
          this.openConfirmationModal({
            title: "Headsup!",
            content:
              "Looks like a sample cart is active, adding this Accessory to the cart will remove all the products in your current cart. Are you sure want to continue?",
            primaryActionLabel: "Continue",
            secondaryActionLabel: "Cancel",
            onPrimaryAction: () => this.clearCartAndAdd(payLoad),
            onSecondaryAction: () => {
              this.modalService.hide("confirmationModal");
            },
          });
        } else {
          this.addToCartData(cartNumber, payLoad);
        }
      },(err)=>{ this.service.progressHide();});
    }
  }

  clearCartAndAdd(cartPayLoad: any) {
    this.modalService.hide("confirmationModal");
    this.spinnerLoading = true;
    this.productService
      .removeAllFromCart(
        this.storageService.cartData?.cartNumber ||
          this.storageService.cartData?.code
      )
      .subscribe((res: any) => {
        if (res.status == 200) {
          this.productService
            .getMiniCartData(this.uid)
            .subscribe((res: any) => {
              this.storageService.setItem("miniCartCount", res?.body || res);
              this.addToCartData(null, cartPayLoad);
            });
        } else {
          this.exceptionErrorMessage = res?.body || res?.error;
          this.spinnerLoading = false;
        }
      },(err)=>{ this.service.progressHide();});
  }
  addToCartData(cartNumber: any, payLoad: any) {
    // this.spinnerLoading = true;
    this.productService.progressShow('addToCart', 'addToCartId');
    this.productService
      .addToCart(this.userService.getUserEmail().toLowerCase(), cartNumber, payLoad)
      .subscribe((res) => {
        this.productService.progressHide('addToCartId');
        if (res?.body?.messages && res?.body?.messages[0]?.status === "Error") {
          this.spinnerLoading = false;
          this.addToCartFailed = true;
          this.scrollPageToTop();
          this.errorMessage = res?.body?.messages[0]?.message || "";
        } else {
          this.addToCartFailed = false;

          this.spinnerLoading = false;
          // if (cartNumber == null) {
          //   let cartData = {
          //     code: res.body?.cartNumber,
          //     entries: res.body?.entries,
          //   };
          //   this.cartData = cartData;
          //   this.storageService.setItem("miniCartCount", cartData);
          // }
          this.storageService.getItem("uid").subscribe((res) => {
            this.uid = res;
          });
          if (
            res?.body?.entries[0]?.hasOwnProperty("alternateProductCode") &&
            res?.body?.entries[0]?.alternateProductCode != ""
          ) {
            localStorage.setItem(
              "addToCartSuccessInfo",
              res?.body?.messages[0]?.message
            );
            localStorage.setItem(
              "alternateProductData",
              JSON.stringify(res?.body)
            );
            this.router
              .navigateByUrl("/", { skipLocationChange: true })
              .then(() => {
                this.router.navigateByUrl(
                  "commercial/products/details/" +
                    res?.body?.entries[0]?.alternateProductCode
                );
              });
          } else {
            localStorage.removeItem("alternateProductData");
            this.productService.getMiniCartData(this.uid).subscribe((res) => {
              this.storageService.setItem("miniCartCount", res?.body || res);
              this.cartData = res?.body || res;
              const data: any = this.modalService.config.initialState;
              const initialState: ModalOptions = {
                initialState: {
                  // Data to  popup
                  cartData: data?.cartData,
                  postOrder: false,
                  selectedAccessories: this.selectedAccessories,
                  sameDyeLot:this?.sameDyeLot || false,
                  onClose: () => {
                    this.modalService.hide('XchangeAddAccessoriesLightboxComponent');
                  }
                },
              };
              this.bsModalRef = this.modalService.show(
                XchangeAddAccessoriesLightboxComponent,
                Object.assign(initialState, {
                  id: "XchangeAddAccessoriesLightboxComponent",
                  class:
                    "modal-xl modal-dialog-centered xchangeaddaccessorieslightbox",
                  backdrop: "static",
                  keyboard: false,
                })
              );
              this.bsModalRef.content.type = 2;
            });
          }
        }
      },() => {
        this.productService.progressHide('addToCartId');
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
    this.bsModalRef = this.modalService.show(
      ConfirmationDialogComponent,
      Object.assign(initialState, {
        id: "confirmation",
        class: "modal-md modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }

  @ViewChild("scrollToTop", { read: ElementRef }) scrollToTop: any;
  scrollPageToTop() {
    // this.scrollToTop.nativeElement.scrollIntoView({
    //   behavior: "smooth",
    //   block: "start",
    //   inline: "nearest",
    // });
    let top = document.getElementById("top");
    if (top !== null) {
      top.scrollIntoView();
      top = null;
    }
  }
  checkForItemAddedinCartt(type?: any, values?: any) {
    this.getMiniCart$().subscribe((res) => {});
  }

  getMiniCartt$() {
    return this.storageService.getItem("uid").pipe(
      take(1),
      map((uid: any) => ({
        uid: uid,
      })),
      mergeMap((data: any) => this.productService.getMiniCartData(data))
    );
  }

  feetYardFormsubmit: any;
  typeSubmit: any;
  valuesSubmit: any;
  resSubmit: any;
  minicartSubscriptionForAddress: any;
  maxLengthErrorFlag:boolean = false;
  originalDefaultShippingMethod:any;
  originalShippingMethod:any='';
  checkAvailability(type?: any, values?: any) {
    this.typeSubmit = type;
    this.valuesSubmit = values;
    let payload = "productCode=" + this.productCode;
    if(this.erpProductCategory === 'B'){
      this.isAtpCheck = true;
    }
    this.shippingAddress = this.productService.getDefaulAddress();
    if (this.minicartSubscription) {
      this.minicartSubscription.unsubscribe();
    }
    let feetYardFormData = JSON.parse(JSON.stringify(this.feetyardForm.value));
    if(this.feetyardForm.value.maxLength ===''){
      this.feetyardForm.value.maxLength = this.maxRollLength;
    }
    if(this.feetyardForm.value.minLength ===''){
      this.feetyardForm.value.minLength = this.minRollLength;
    }
    if(+this.feetyardForm.value.maxLength < +this.feetyardForm.value.minLength){
      this.maxLengthErrorFlag = true;
      return;
     
    }else{
      this.maxLengthErrorFlag = false;
    }
    if (type && type == "Roll") {
      feetYardFormData.requestedQty = feetYardFormData?.quantity;
      feetYardFormData.requestedQuantity = feetYardFormData?.quantity;
      feetYardFormData.uom = "RO";
      feetYardFormData.unit = "RO";
    } else if (type && type == "Inventory") {
      feetYardFormData.unit = "RO";
      const inches =
        feetYardFormData?.inches != ""
          ? "." + feetYardFormData?.inches?.trim()
          : "";
      feetYardFormData.requestedQty = feetYardFormData?.feet?.trim() + inches;
      feetYardFormData.requestedQuantity = feetYardFormData?.feet?.trim() +inches;
    } else {
      const inches =
        feetYardFormData?.inches != ""
          ? feetYardFormData?.inches.length < 2
            ? ".0" + feetYardFormData?.inches?.trim()
            : "." + feetYardFormData?.inches?.trim()
          : "";
      if (
        this.subProductType === "CARPET_TILE" &&
        feetYardFormData.unit === "YDK" &&
        (this.pdpInvUOMCode === "Carton" || this.pdpInvUOMCode === "ZCT")
      ) {
        feetYardFormData.requestedQty = this.requestedQty;
        feetYardFormData.requestedQuantity = this.requestedQty;
        feetYardFormData.unit = "ZCT";
      } else  if (
        (this.erpProductCategory === 'S')  &&
        feetYardFormData.unit === "FTK" &&
        (this.pdpInvUOMCode === "Carton" || this.pdpInvUOMCode === "ZCT")
      ) {
        feetYardFormData.requestedQty = this.requestedQty;
        feetYardFormData.unit = "ZCT";
      }else  if ( this.subProductType === "HERO_RUBBER" &&
        (this.erpProductCategory === 'S')  &&
        feetYardFormData.unit === "FTK" &&
        (this.pdpInvUOMCode === "Pallet" || this.pdpInvUOMCode === "PF")
      ) {
        feetYardFormData.requestedQty = this.requestedQty;
        feetYardFormData.unit = "PF";
      }else {
        feetYardFormData.requestedQty = feetYardFormData?.feet?.trim() + inches;
        feetYardFormData.requestedQuantity = feetYardFormData?.feet?.trim() + inches;
      }
      if (
        this.subProductType != "CARPET_TILE" &&
        feetYardFormData.unit === "YDK" &&
        (this.pdpInvUOMCode === "Roll" || this.pdpInvUOMCode === "RO")
      ) {
        feetYardFormData.requestedQty = this.requestedQty;
        feetYardFormData.requestedQuantity = this.requestedQty;
        feetYardFormData.unit = "RO";
      }
      if (
        feetYardFormData.unit === "FTK" &&
        (this.pdpInvUOMCode === "Roll" || this.pdpInvUOMCode === "RO")
      ) {
        feetYardFormData.requestedQty = this.requestedQty;
        feetYardFormData.requestedQuantity = this.requestedQty;
        feetYardFormData.unit = "RO";
      }
    }
    if (feetYardFormData?.unit != "LF" && feetYardFormData?.unit != "RO") {
      feetYardFormData.feet = 0;
      feetYardFormData.inches = 0;
    }
    if (feetYardFormData?.unit == "RO" && type != "Inventory") {
      feetYardFormData.feet = "";
      let maxRoll = feetYardFormData.maxLength
        ? feetYardFormData.maxLength
        : this.maxRollLength != undefined
        ? this.maxRollLength
        : "";
      let minRoll = feetYardFormData.minLength
        ? feetYardFormData.minLength
        : this.minRollLength != undefined
        ? this.minRollLength
        : "";
      feetYardFormData.maxInches = maxRoll.includes(".")
        ? maxRoll.split(".")[1]
        : "00";
      feetYardFormData.minInches = minRoll.includes(".")
        ? minRoll.split(".")[1]
        : "00";
      feetYardFormData.maxFeet = maxRoll.includes(".")
        ? maxRoll.split(".")[0]
        : maxRoll;
      feetYardFormData.minFeet = minRoll.includes(".")
        ? minRoll.split(".")[0]
        : minRoll;
      localStorage.setItem("MinRollLength", minRoll);
      localStorage.setItem("MaxRollLength", maxRoll);
      feetYardFormData.targetLength = feetYardFormData.targetLength > +minRoll &&  feetYardFormData.targetLength < +maxRoll ?  feetYardFormData.targetLength : Math.ceil(minRoll);
    }
    this.feetYardFormDataSubmit = feetYardFormData;
    this.isAtpCheck = this.atpCheckProductTypes.includes(this.subProductType);
    if(this.erpProductCategory === 'B'){
      this.isAtpCheck = true;
    }
    if ((this.pdbData?.classification == "Accessories" && !(this.pdbData.subProductType === 'CUSHION_PAD' && this.isAtpCheck))|| this.pdbData.productType ===  "MERCHANDISING") {
      this.isAtpCheck = false;
    }

    this.minicartSubscription = this.storageService
      .getItem("miniCartCount")
      .subscribe((res: any) => {
        this.minicartSubscription.unsubscribe();
        this.resSubmit = res;
        if (
          res == undefined ||
          res == "" ||
          res.hasOwnProperty("errorMessage") ||
          res?.totalItems == 0
        ) {
          this.spinnerLoading = false;
          this.openChooseAddressModal(null, values, type, feetYardFormData);
        } else {
            this.spinnerLoading = false;
            this.getMiniCart$().subscribe((res) => {
              this.shippingAddress = res?.body?.deliveryAddress || this.shippingAddress;
              if(this.erpProductCategory == "S"){
                if(res?.body?.hardProductShippingData && 
                  Object.keys(res?.body?.hardProductShippingData).length > 1){
                    this.shippingAddress.defaultIncoTerms = res?.body?.hardProductShippingData?.incoTerms;
                    this.shippingAddress.defaultShipVia = res?.body?.hardProductShippingData?.shipVia;
                    this.shippingAddress.defaultShippingMethod = res?.body?.hardProductShippingData?.shippingCondition;
                    this.shippingAddress.defaultShippingWarehouse = res?.body?.hardProductShippingData?.shippingWarehouse;
                    this.shippingOptions.originalDefaultShippingMethod = this.userInfo.isCustomer  || this.userInfo.isSalesPerson || this.userInfo.isSalesOps ? res?.body?.hardProductShippingData?.originalShippingCondition  : res?.body?.hardProductShippingData?.shippingCondition;
                    this.originalDefaultShippingMethod = this.shippingOptions?.originalDefaultShippingMethod;
                } else if(res?.body?.softProductShippingData && 
                  Object.keys(res?.body?.softProductShippingData).length > 1){
                    this.shippingAddress.defaultIncoTerms = res?.body?.softProductShippingData?.incoTerms;
                    this.shippingAddress.defaultShipVia = res?.body?.softProductShippingData?.shipVia;
                    this.shippingAddress.defaultShippingMethod = res?.body?.softProductShippingData?.shippingCondition;
                    this.shippingAddress.defaultShippingWarehouse = res?.body?.softProductShippingData?.shippingWarehouse;
                    this.shippingOptions.originalDefaultShippingMethod = this.userInfo.isCustomer  || this.userInfo.isSalesPerson || this.userInfo.isSalesOps ? res?.body?.softProductShippingData?.originalShippingCondition  : res?.body?.softProductShippingData?.shippingCondition;
                    this.originalDefaultShippingMethod = this.shippingOptions?.originalDefaultShippingMethod;
                  }else{
                    this.shippingAddress.defaultIncoTerms = res?.body?.deliveryAddress?.defaultIncoTerms || this.shippingAddress?.defaultIncoTerms;
                    this.shippingAddress.defaultShipVia = res?.body?.deliveryAddress?.defaultShipVia || this.shippingAddress?.defaultShipVia;
                    this.shippingAddress.defaultShippingMethod = res?.body?.deliveryAddress?.defaultShippingMethod || this.shippingAddress?.defaultShippingMethod;
                    this.shippingAddress.defaultShippingWarehouse = res?.body?.deliveryAddress?.defaultShippingWarehouse || this.shippingAddress?.defaultShippingWarehouse;
                  }
              } else if(this.erpProductCategory == "B"){
                if(res?.body?.softProductShippingData && 
                  Object.keys(res?.body?.softProductShippingData).length > 1){
                    this.shippingAddress.defaultIncoTerms = res?.body?.softProductShippingData?.incoTerms;
                    this.shippingAddress.defaultShipVia = res?.body?.softProductShippingData?.shipVia;
                    this.shippingAddress.defaultShippingMethod = res?.body?.softProductShippingData?.shippingCondition;
                    this.shippingAddress.defaultShippingWarehouse = res?.body?.softProductShippingData?.shippingWarehouse;
                    this.shippingOptions.originalDefaultShippingMethod = this.userInfo.isCustomer  || this.userInfo.isSalesPerson || this.userInfo.isSalesOps ? res?.body?.softProductShippingData?.originalShippingCondition  : res?.body?.softProductShippingData?.shippingCondition;
                    this.originalDefaultShippingMethod = this.shippingOptions?.originalDefaultShippingMethod;
                } else if(res?.body?.hardProductShippingData && 
                  Object.keys(res?.body?.hardProductShippingData).length > 1){
                    this.shippingAddress.defaultIncoTerms = res?.body?.hardProductShippingData?.incoTerms;
                    this.shippingAddress.defaultShipVia = res?.body?.hardProductShippingData?.shipVia;
                    this.shippingAddress.defaultShippingMethod = res?.body?.hardProductShippingData?.shippingCondition;
                    this.shippingAddress.defaultShippingWarehouse = res?.body?.hardProductShippingData?.shippingWarehouse;
                    this.shippingOptions.originalDefaultShippingMethod = this.userInfo.isCustomer  || this.userInfo.isSalesPerson || this.userInfo.isSalesOps ? res?.body?.hardProductShippingData?.originalShippingCondition  : res?.body?.hardProductShippingData?.shippingCondition;
                    this.originalDefaultShippingMethod = this.shippingOptions?.originalDefaultShippingMethod;  
                  }else{
                    this.shippingAddress.defaultIncoTerms = res?.body?.deliveryAddress?.defaultIncoTerms || this.shippingAddress?.defaultIncoTerms;
                    this.shippingAddress.defaultShipVia = res?.body?.deliveryAddress?.defaultShipVia || this.shippingAddress?.defaultShipVia;
                    this.shippingAddress.defaultShippingMethod = res?.body?.deliveryAddress?.defaultShippingMethod || this.shippingAddress?.defaultShippingMethod;
                    this.shippingAddress.defaultShippingWarehouse = res?.body?.deliveryAddress?.defaultShippingWarehouse || this.shippingAddress?.defaultShippingWarehouse;
                  }
              }else{
                    this.shippingAddress.defaultIncoTerms = res?.body?.deliveryAddress?.defaultIncoTerms || this.shippingAddress?.defaultIncoTerms;
                    this.shippingAddress.defaultShipVia = res?.body?.deliveryAddress?.defaultShipVia || this.shippingAddress?.defaultShipVia;
                    this.shippingAddress.defaultShippingMethod = res?.body?.deliveryAddress?.defaultShippingMethod || this.shippingAddress?.defaultShippingMethod;
                    this.shippingAddress.defaultShippingWarehouse = res?.body?.deliveryAddress?.defaultShippingWarehouse || this.shippingAddress?.defaultShippingWarehouse;
                    this.shippingOptions.originalDefaultShippingMethod = this.userInfo.isCustomer  || this.userInfo.isSalesPerson || this.userInfo.isSalesOps ? res?.body?.deliveryAddress?.originalDefaultShippingMethod  : res?.body?.deliveryAddress?.defaultShippingMethod || this.shippingOptions?.defaultShippingMethod;
                    this.originalDefaultShippingMethod = this.shippingOptions?.originalDefaultShippingMethod;
              }
              this.onShippingOptionSubmit();
            // this.orderService
            //   .getShippingOptions(
            //     false,
            //     this.productCode,
            //     res?.body?.deliveryAddress?.id,
            //     this.userInfo.orgUnit?.soldTo
            //   )
            //   .subscribe({
            //     next: (res) => {
            //       this.spinnerLoading = false;
            //      // this.originalDefaultShippingMethod = res?.body?.originalDefaultShippingMethod;;
            //       this.originalDefaultSM = res?.body?.originalDefaultShippingMethod;
            //       this.originalShippingMethod = res?.body?.originalDefaultShippingMethod;
            //       this.defaultIncoTerms = res.body?.defaultIncoTerms;
            //       this.defaultIncoTermsDesc = res.body?.defaultIncoTermsDesc;
            //       this.defaultShipVia = res.body?.defaultShipVia;
            //       this.defaultShippingMethod = res.body?.defaultShippingMethod;
            //       this.defaultShippingWarehouse =
            //         res.body?.defaultShippingWarehouse;
            //       this.defaultShippingWarehouseDesc =
            //         res.body?.defaultShippingWarehouseDesc;
            //       this.defaultShippingConditionDesc =
            //         res.body?.defaultShippingConditionDesc;
            //       this.defaultShippingMethodDesc =
            //         res.body?.defaultShippingConditionDesc;
            //       this.modalRef = this.modalService.show(this.shippingOption, {
            //         id: "shippingOptionsModal",
            //         class: "modal-lg modal-dialog-centered",
            //         backdrop: "static",
            //         keyboard: false,
            //       });
            //     },
            //     error: (err) => {
            //       this.spinnerLoading = false;
            //     },
            //   });
            });
        //  }
          // this.openCrossModal(this.shippingOption)
        }
      },(err)=>{ this.service.progressHide();});
  }

  defaultIncoTerms: any;
  defaultIncoTermsDesc: any;
  defaultShipVia: any;
  defaultShippingMethod: any;
  defaultShippingMethodDesc: any;
  defaultShippingWarehouse: any;
  defaultShippingWarehouseDesc: any;
  defaultShippingConditionDesc: any;
  onShippingOptionSubmit() {
    this.isAtpCheck = this.atpCheckProductTypes.includes(this.subProductType);
    if(this.erpProductCategory === 'B'){
      this.isAtpCheck = true;
    }
    if ((this.pdbData?.classification == "Accessories" && !(this.pdbData.subProductType === 'CUSHION_PAD' && this.isAtpCheck))|| this.pdbData.productType ===  "MERCHANDISING") {
      this.isAtpCheck = false;
    }

    if (!this.isAtpCheck) {
      /* this.shippingAddress = {
        ...this.resSubmit?.deliveryAddress,
        ...this.resSubmit,
      }; */
      delete this.shippingAddress.deliveryAddress;
      this.cartData = this.storageService.cartData;
      if (this.cartData?.code) {
        this.productService.getCartData(this.cartData?.code).subscribe(
          (res: any) => {
            this.spinnerLoading = false;
            let rdd = res?.body?.requestedDeliveryDate ? res?.body?.requestedDeliveryDate : new Date();
            rdd = (rdd != "See line details." ? rdd : this.datePipe.transform(new Date(), "MM/dd/YYYY"));
            this.shippingAddress = { ...this.shippingAddress, rdd: rdd, requestedDeliveryDate: rdd };
            this.storageService.setItem("shipping-address", this.shippingAddress);
            this.storageService.setItem("shippingAddress", this.shippingAddress);            
            if (res?.body?.totalItems == 0 || res?.body?.totalItems == null) {
              this.lineShipComplete = true;
              this.addToCartDirect(
                this.selectedProduct,
                this.feetYardFormDataSubmit,
                this.typeSubmit,
                this.valuesSubmit
              );
            }
            if (res?.body?.totalItems != 0) {
              this.cartDataForShippingInfo = res?.body;
              if (res?.body?.shipComplete == false) {
                this.lineShipComplete = false;
              }
              if (res?.body?.shipComplete == true) {
                if (
                  res?.body?.shipVia === this.shippingAddress?.defaultShipVia &&
                  res?.body?.shippingConditions ===
                  this.shippingAddress?.defaultShippingMethod &&
                  res?.body?.shippingWarehouse ===
                  this.shippingAddress?.defaultShippingWarehouse &&
                  res?.body?.incoTerms === this.shippingAddress?.defaultIncoTerms
                ) {
                  this.lineShipComplete = true;
                } else {
                  this.lineShipComplete = false;
                }
              }
              this.addToCartDirect(
                this.selectedProduct,
                this.feetYardFormDataSubmit,
                this.typeSubmit,
                this.valuesSubmit
              );
            }
        
          },
          (error: any) => {
            this.service.progressHide();
            console.error("Error fetching cart data:", error);
          }
        );
      }
    } else {

      if (this.cartData?.isQuote) {
        this.openConfirmationModal({
          title: "Information",
          content:
            "We could see a quote cart present already. Proceeding with this will delete the current quote cart. Do you still want to continue?",
          primaryActionLabel: "Continue",
          secondaryActionLabel: "Cancel",
          onPrimaryAction: () => {
            // this.spinnerLoading = true;
            this.productService.progressShow('cancelQuote');
            this.productService
              .cancelCart(this.cartData?.code || "123456")
              .subscribe(
                (res: any) => {
                  this.productService.progressHide();
                  this.spinnerLoading = false;
                  this.checkForItemAddedinCart();
                },
                (err: any) => {
                  this.productService.progressHide();
                  this.spinnerLoading = false;
                  this.errorMessage = err?.errorMessage;
                  this.scrollToTop();
                }
              );
          },
        });
      } else if (this.storageService.cartData?.sampleOrder == true) {
        this.openConfirmationModal({
          title: "Headsup!",
          content:
            "Looks like a sample cart is active, adding this sample to the cart will remove all the products in your current cart. Are you sure want to continue?",
          primaryActionLabel: "Continue",
          secondaryActionLabel: "Cancel",
          onPrimaryAction: () => 
            {
              this.modalService.hide("confirmationModal");
              this.spinnerLoading = true;
              this.productService
                .removeAllFromCart(
                  this.storageService.cartData?.cartNumber ||
                    this.storageService.cartData?.code
                )
                .subscribe((res: any) => {
                  if (res.status == 200) {
                    this.productService
                      .getMiniCartData(this.uid)
                      .subscribe((res: any) => {
                        this.storageService.setItem("miniCartCount", res?.body || res);
                        this.checkForItemAddedinCart(this.typeSubmit);
                      });
                  } else {
                    this.exceptionErrorMessage = res?.body || res?.error;
                    this.spinnerLoading = false;
                    this.service.progressHide();
                  }
                });
            },
          onSecondaryAction: () => {
            this.modalService.hide("confirmationModal");
          },
        });
      } else {
          this.openSolutionModal();
      }
    }
  }

  openSolutionModal(){
    const initialState: ModalOptions = {
      initialState: {
        shippingAddress: this.resSubmit?.deliveryAddress,
        requestedQty:this.convertPdpInvUOMValue,
        shippingOptions: this.shippingAddress,
        fromViewInventory: this.typeSubmit === "Inventory",
        aptCheckEntrie: this.valuesSubmit ? this.valuesSubmit : [],
        solutions: [this.selectedProduct],
        feetyardForm: this.feetYardFormDataSubmit,
        multiCutIndication: this.typeSubmit == "multiCut" ? true : false,
        viewInventory: this.typeSubmit === "Inventory" ? true : false,
        rdd: this.resSubmit?.requestedDeliveryDate,
        priceDetails: this.productPriceDetails,
        requestedYdkQty: this.requestedYdkQty,
        productType: this.pdbData?.productType,
        sameDyeLot:
          this.uomDetails?.displayDyeLot == false ? false : this.sameDyeLot,
        selectedPDPTab: this.selectedTab,
        erpProductCategory: this.erpProductCategory,
        selectedAccessories: this.selectedAccessories,
        inventoryUOM: this.pdpInvUOMCode,
        inventoryUOMConvValue: this.convertPdpInvUOMValue,
        variantData: this.variantData,
        minRollLength: this.minRollLength,
        maxRollLength: this.maxRollLength,
        standardRollLength: this.uomDetails.standardRollLength
          ? this.uomDetails.standardRollLength
          : 0,
        productCode: this.productCode,
        viewInventoryHS: this.viewInventoryHS,
        preferredStock: this.variantData?.selected?.preferredStock,
        bundleProduct: this.bundleProduct,
      },
    };
    this.productService.defaultAddress.replacementOrder =
      this.replacementOrderModalForm.value.replacementOrder == null
        ? this.productService.defaultAddress.replacementOrder
        : this.replacementOrderModalForm.value.replacementOrder;
    this.productService.defaultAddress.replacementReason = this
      .replacementOrderModalForm.dirty
      ? this.replacementOrderModalForm.value.replacementReason
      : this.productService.defaultAddress.replacementReason;
    this.productService.defaultAddress.orderNumber = this
      .replacementOrderModalForm.dirty
      ? this.replacementOrderModalForm.value.Order
      : this.productService.defaultAddress.orderNumber;
    this.productService.defaultAddress.claimNumber = this
      .replacementOrderModalForm.dirty
      ? this.replacementOrderModalForm.value.Claim
      : this.productService.defaultAddress.claimNumber;
    this.productService.defaultAddress.invoiceNumber = this
      .replacementOrderModalForm.dirty
      ? this.replacementOrderModalForm.value.Invoice
      : this.productService.defaultAddress.invoiceNumber;
    this.productService.defaultAddress.purchaseOrderNumber = this
      .replacementOrderModalForm.dirty
      ? this.replacementOrderModalForm.value?.PO
      : this.productService.defaultAddress.poNumber;
    this.productService.defaultAddress.hasClaimSubmitted =
      this.replacementOrderModalForm.dirty &&
      this.replacementOrderModalForm.value.hasClaimSubmitted !== null
        ? this.replacementOrderModalForm.value?.hasClaimSubmitted
        : this.productService.defaultAddress.hasClaimSubmitted;

    this.bsModalRef = this.modalService.show(
      AddCompanionProductsComponent,
      Object.assign(initialState, {
        id: "AddCompanionProductsComponent",
        class: "modal-xl modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );

    this.bsModalRef.content.solutions = [this.selectedProduct];
  }

  onQuantityChange(elem: any) {
    elem.value = elem.value.replace(/[^0-9]/g, "").replace(/(\..*)\./g, "$1");
  }
  productImgInvalid: boolean = false;
  onProdImgInvalidate(invalid: boolean) {
    this.productImgInvalid = invalid;
  }
  quoteId: any;
  additionalData: any;
  gotoRequest() {
    let obj3 = {
      ...this.feetyardForm.value,
      ...this.additionalData,
    };
    this.storageService.setItem("item", obj3);
    this.router.navigateByUrl(
      "/commercial/quotes/request-quote/" + this.quoteCodeId
    );
  }
  createQuote(quantityType?: any, quantityValues?: any) {
    if(this.ColorSelected == true){
      this.colorSelect = true
      this.errorMessage = 'Please choose a color';
      this.scrollPageToTop()
      this.stopAlert()
      return
     }
     if(this.sizeSelected == true && this.productType!='MERCHANDISING'){
      this.sizeSelect = true
      this.errorMessage = 'Please choose a size';
      this.scrollPageToTop()
      this.stopAlert()
      return
     }
    this.feetYardFormData = this.feetyardForm;
    let feetYardFormData = JSON.parse(JSON.stringify(this.feetyardForm.value));
    quantityType = feetYardFormData?.unit;
    if (feetYardFormData?.unit == "RO") {
      feetYardFormData.maxInches = feetYardFormData.maxLength.includes(".")
        ? feetYardFormData.maxLength.split(".")[1]
        : "";
      feetYardFormData.minInches = feetYardFormData.minLength.includes(".")
        ? feetYardFormData.minLength.split(".")[1]
        : "";
      feetYardFormData.maxFeet = feetYardFormData.maxLength.includes(".")
        ? feetYardFormData.maxLength.split(".")[0]
        : feetYardFormData.maxLength;
      feetYardFormData.minFeet = feetYardFormData.minLength.includes(".")
        ? feetYardFormData.minLength.split(".")[0]
        : feetYardFormData.minLength;
      feetYardFormData.quantity =
        feetYardFormData.quantity === ""
          ? feetYardFormData.feet
          : feetYardFormData.quantity;
      feetYardFormData.feet = feetYardFormData.quantity
        ? feetYardFormData.quantity
        : feetYardFormData.feet;
    }

    let obj: any;
    // if (this.cartData?.code && this.cartData?.isQuote) {
    //   obj = {
    //     productCode: this.pdbData.code,
    //     requestedUOM: this.feetyardForm.value.unit,
    //     requestedQuantity: this.feetyardForm.value.feet,
    //     userCartID: this.cartData?.code,
    //     isQuoteRequestFromCart: false,
    //   };
    //   this.service.createQuote(obj).subscribe((res: any) => {

    //     this.quoteCodeId = res?.body.code;
    //     this.quoteId = res.body?.code;
    //     this.additionalData = {
    //       code: this.pdbData.code,
    //       quoteCode: this.quoteId,
    //     };

    //     this.checkForItemAddedinCart();
    //     this.gotoRequest();
    //   });
    // } else
    let quantity:any = 0;
    if (
      feetYardFormData?.feet &&
      feetYardFormData?.feet != "" &&
      feetYardFormData?.feet > 0
    ) {
      if (
        feetYardFormData?.unit != "EA" &&
        (this.productType === "HARDSURFACE" ||
          (this.productType === "SOFTSURFACE" &&
            this.subProductType === "CARPETPRODUCT_CARPET_TILE")) ||
            (this.productType === "ACCESSORIES" && feetYardFormData?.unit =='LF')
      ) {
        quantity = this.convertPdpInvUOMValue || feetYardFormData?.feet || feetYardFormData?.quantity;
      } else {
        if(feetYardFormData?.unit =='LF'){
          const inches =
            feetYardFormData?.inches != ""
              ? feetYardFormData?.inches.length < 2
                ? ".0" + feetYardFormData?.inches?.trim()
                : "." + feetYardFormData?.inches?.trim()
              : "";
          
          quantity = (feetYardFormData?.feet + inches) || feetYardFormData?.quantity;
        }else{
          quantity = feetYardFormData?.feet || feetYardFormData?.quantity;
        }
        
      }
    } else {
      quantity = feetYardFormData?.feet || feetYardFormData?.quantity;
    }

    let requestedUOM = quantityValues ? "LF" : this.productType === "HARDSURFACE" ||
                        (this.productType === "SOFTSURFACE" &&
                          this.subProductType === "CARPETPRODUCT_CARPET_TILE")||
                          (this.productType === "ACCESSORIES" && feetYardFormData?.unit =='LF')
                      ? this.pdpInvUOMCode || feetYardFormData?.unit
                      : feetYardFormData?.unit;
    if (this.cartData?.code && !this.cartData?.isQuote) {
      // alert("new will create");
      obj = {
        productCode: this.pdbData.code,
        requestedUOM: requestedUOM,
        requestedQuantity: quantity,
        userCartID: "",
        isQuoteRequestFromCart: false,
        requestedDyelot: feetYardFormData?.dye || null,
        sameDyeLot: this.sameDyeLot,   
      };
      if (this.feetyardForm.value.unit === "LF") {
        obj = this.modifyPayloadForLinearFeet(obj);
      }
      if (feetYardFormData.unit === "RO") {
        obj.targetLength = feetYardFormData.feet;
        obj.maxFeet = feetYardFormData.maxFeet || null;
        obj.maxInches = feetYardFormData.maxInches || null;
        obj.minFeet = feetYardFormData.minFeet || null;
        obj.minInches = feetYardFormData.minInches || null;
        obj.requestedDyelot = feetYardFormData.dye || null;
        obj.targetLength = feetYardFormData.targetLength;
      }
      this.openConfirmationModal({
        title: "Information",
        content:
          " We could see an active shopping cart present already. Proceeding to create quote will delete the current cart. Do you still want to continue?",
        primaryActionLabel: "Continue",
        secondaryActionLabel: "Cancel",
        onPrimaryAction: () => {
          // this.spinnerLoading = true;
          this.productService.progressShow('cancelCart')
          this.productService
            .cancelCart(this.cartData?.code || "123456")
            .subscribe({
              next: (res) => {
                this.productService.progressHide();
                this.productService.progressShow('addToQuote')
                this.service.createQuote(obj).subscribe((res: any) => {
                  //this.spinnerLoading = false;
                  // this.productService.getLatestMiniCart(this.uid);
                  this.productService
                    .getMiniCartData(this.uid)
                    .subscribe((result: any) => {
                      this.productService.progressHide();
                      this.spinnerLoading = false;
                      this.storageService.setItem("miniCartCount", result?.body)
                      this.quoteCodeId = res?.body?.code;
                      this.quoteId = res?.body?.code;
                      this.additionalData = {
                        code: this.pdbData.code,
                        quoteCode: this.quoteId,
                      };
                      this.gotoRequest();
                    }, () => { this.productService.progressHide(); });

                  // this.checkForItemAddedinCart();
                }, () => { this.productService.progressHide(); });
              },
              error: (error: any) => {
                this.productService.progressHide();
                this.spinnerLoading = false;
              },
            });
        },
        error: () => {          
          this.productService.progressHide();
        }
      });
    } else if (
      this.cartData?.isQuote &&
      this.cartData?.quoteStatus !== "BUYER_DRAFT"
    ) {
      obj = {
        productCode: this.pdbData.code,
        requestedUOM: requestedUOM,
        requestedQuantity: quantity,
        userCartID: "",
        isQuoteRequestFromCart: false,
        sameDyeLot: this.sameDyeLot,
        requestedDyelot: feetYardFormData?.dye || null,
      };
      if (this.feetyardForm.value.unit === "LF") {
        obj = this.modifyPayloadForLinearFeet(obj);
      }
      if (this.feetyardForm.value.unit === "RO") {
 
        obj.targetLength = feetYardFormData.feet;
        obj.maxFeet = feetYardFormData.maxFeet || null;
        obj.maxInches = feetYardFormData.maxInches || null;
        obj.minFeet = feetYardFormData.minFeet || null;
        obj.minInches = feetYardFormData.minInches || null;
        obj.requestedDyelot = feetYardFormData.dye || null;
        obj.targetLength = feetYardFormData.targetLength;
      }
      this.openConfirmationModal({
        title: "Information",
        content:
          " We could see an active shopping cart present already. Proceeding to create quote will delete the current quote checkout. Do you still want to continue?",
        primaryActionLabel: "Continue",
        secondaryActionLabel: "Cancel",
        onPrimaryAction: () => {
          // this.spinnerLoading = true;
          this.productService.progressShow('cancelCart')
          this.productService
            .cancelCart(this.cartData?.code || "123456")
            .subscribe({
              next: (res) => {
                this.productService.progressHide();
                this.productService.progressShow('addToQuote')
                this.service.createQuote(obj).subscribe((res: any) => {
                  // this.spinnerLoading = false;
                  // this.productService.getLatestMiniCart(this.uid);
                  this.productService
                    .getMiniCartData(this.uid)
                    .subscribe((result: any) => {
                      this.productService.progressHide();
                      this.spinnerLoading = false;
                      this.storageService.setItem("miniCartCount", result?.body)
                      this.quoteCodeId = res?.body?.code;
                      this.quoteId = res?.body?.code;
                      this.additionalData = {
                        code: this.pdbData.code,
                        quoteCode: this.quoteId,
                      };
                      this.gotoRequest();
                    }, () => { this.productService.progressHide(); });

                  // this.checkForItemAddedinCart();
                }, () => { this.productService.progressHide(); });
              },
              error: (error: any) => {
                this.productService.progressHide();
                this.spinnerLoading = false;
              },
            });
        },
      });
    } else if (
      this.cartData?.isQuote &&
      this.cartData?.quoteStatus === "BUYER_DRAFT" &&
      this.checkAvailabilityCTA === true
    ) {
  
      obj = {
        productCode: this.pdbData.code,
        requestedUOM: requestedUOM,
        requestedQuantity: quantity,
        userCartID: "",
        isQuoteRequestFromCart: false,
        sameDyeLot: this.sameDyeLot,
        requestedDyelot: feetYardFormData?.dye || null,
      };
      if (this.feetyardForm.value.unit === "LF") {
        obj = this.modifyPayloadForLinearFeet(obj);
      }
      if (this.feetyardForm.value.unit === "RO") {
     
        obj.targetLength = feetYardFormData.feet;
        obj.maxFeet = feetYardFormData.maxFeet || null;
        obj.maxInches = feetYardFormData.maxInches || null;
        obj.minFeet = feetYardFormData.minFeet || null;
        obj.minInches = feetYardFormData.minInches || null;
        obj.requestedDyelot = feetYardFormData.dye || null;
        obj.targetLength = feetYardFormData.targetLength;
      }
      this.openConfirmationModal({
        title: "Information",
        content:
          " We could see an active shopping cart present already. Proceeding to create quote will delete the current quote checkout. Do you still want to continue?",
        primaryActionLabel: "Continue",
        secondaryActionLabel: "Cancel",
        onPrimaryAction: () => {
          this.spinnerLoading = true;
          this.productService
            .cancelCart(this.cartData?.code || "123456")
            .subscribe({
              next: (res) => {
                this.getMiniCart$().subscribe((res) => {
                  if (res?.body?.errorMessage) {
                    this.storageService.setItem("miniCartCount", "");
                  } else {
                    this.storageService.setItem(
                      "miniCartCount",
                      res?.body || res
                    );
                    this.storageService.setItem(
                      "shippingAddress",
                      res?.body?.deliveryAddress
                    );
                  }
                  this.checkAvailability(quantityType, quantityValues);
                });
              },
              error: (error: any) => {
                this.service.progressHide();
                this.spinnerLoading = false;
              },
            });
        },
      });
    } else {
   

      let feetYardFormData = JSON.parse(
        JSON.stringify(this.feetyardForm.value)
      );
      if (quantityType && quantityType == "RO") {
        feetYardFormData.requestedQty = feetYardFormData?.quantity;
        feetYardFormData.requestedQuantity = quantity;
        feetYardFormData.uom = "RO";
        feetYardFormData.unit = "RO";
        if(this.subProductType === "HERO_RUBBER"){
          quantity = feetYardFormData?.feet;
        }
      } else if (quantityType && quantityType == "Inventory") {
        feetYardFormData.unit = "RO";
        const inches =
          feetYardFormData?.inches != ""
            ? "." + feetYardFormData?.inches?.trim()
            : "";
        feetYardFormData.requestedQty = feetYardFormData?.feet?.trim() + inches;
       feetYardFormData.requestedQuantity =  quantity;
      } else {
        const inches =
          feetYardFormData?.inches != ""
            ? feetYardFormData?.inches.length < 2
              ? ".0" + feetYardFormData?.inches?.trim()
              : "." + feetYardFormData?.inches?.trim()
            : "";
        if (
          this.erpProductCategory === "S" &&
          (feetYardFormData.unit === "YDK" ||
            feetYardFormData.unit === "FTK") &&
          (this.pdpInvUOMCode === "Carton" || this.pdpInvUOMCode === "ZCT")
        ) {
          feetYardFormData.requestedQty = this.requestedQty;
          feetYardFormData.requestedQuantity = this.requestedQty;
          feetYardFormData.unit = "ZCT";
          requestedUOM = "ZCT";
          quantity = this.requestedQty;
        } else  if ( this.subProductType === "HERO_RUBBER" &&
        (this.erpProductCategory === 'S')  &&
        feetYardFormData.unit === "PF" &&
        (this.pdpInvUOMCode === "Pallet" || this.pdpInvUOMCode === "PF")
      ) {
        feetYardFormData.requestedQty = feetYardFormData?.feet;
        feetYardFormData.requestedQuantity = feetYardFormData?.feet;
        feetYardFormData.unit = "PF";
        requestedUOM = "PF";
        quantity = feetYardFormData?.feet;
      }else {
          feetYardFormData.requestedQty =
            feetYardFormData?.feet?.trim() + inches;
            feetYardFormData.requestedQuantity =  quantity;
        }
      }
      if (feetYardFormData?.unit != "LF" && feetYardFormData?.unit != "RO") {
        feetYardFormData.feet = 0;
        feetYardFormData.inches = 0;
      }
      if (feetYardFormData?.unit == "RO" && quantityType != "Inventory") {
  
        feetYardFormData.feet = "";
        let maxRoll = feetYardFormData.maxLength
          ? feetYardFormData.maxLength
          : this.maxRollLength != undefined
          ? this.maxRollLength
          : "";
        let minRoll = feetYardFormData.minLength
          ? feetYardFormData.minLength
          : this.minRollLength != undefined
          ? this.minRollLength
          : "";
        feetYardFormData.requestedQuantity = quantity;
        feetYardFormData.requestedQty = this.feetYardFormData.value.feet;
        feetYardFormData.maxInches = maxRoll.includes(".")
          ? maxRoll.split(".")[1]
          : "00";
        feetYardFormData.minInches = minRoll.includes(".")
          ? minRoll.split(".")[1]
          : "00";
        feetYardFormData.maxFeet = maxRoll.includes(".")
          ? maxRoll.split(".")[0]
          : maxRoll;
        feetYardFormData.minFeet = minRoll.includes(".")
          ? minRoll.split(".")[0]
          : minRoll;
        localStorage.setItem("MinRollLength", minRoll);
        localStorage.setItem("MaxRollLength", maxRoll);
      }
      this.feetYardFormDataSubmit = feetYardFormData;

      obj = {
        productCode: this.pdbData.code,
        requestedUOM: requestedUOM,
        requestedQuantity: quantity,
        isQuoteRequestFromCart: false,
        userCartID: this.cartData?.isQuote ? this.cartData?.code : "",
        sameDyeLot: this.sameDyeLot,
        requestedDyelot: feetYardFormData?.dye || null,
      };
      if (this.feetyardForm.value.unit === "LF") {
        obj = this.modifyPayloadForLinearFeet(obj);
      }
      if (this.feetyardForm.value.unit === "RO") {
        obj.targetLength =
          feetYardFormData.feet || feetYardFormData.targetLength;
        obj.maxFeet = feetYardFormData.maxFeet || null;
        obj.maxInches = feetYardFormData.maxInches || null;
        obj.minFeet = feetYardFormData.minFeet || null;
        obj.minInches = feetYardFormData.minInches || null;
        obj.requestedDyelot = feetYardFormData.dye || null;
        obj.requestedQuantity = quantity
      }

      // this.spinnerLoading = true;
      this.productService.progressShow('addToQuote')
      this.service.createQuote(obj).subscribe({
        next: (res: any) => {
          // this.spinnerLoading = false;
          //this.productService.getLatestMiniCart(this.uid);
          this.productService
          .getMiniCartData(this.uid)
            .subscribe((result: any) => {
              this.productService.progressHide();
              this.spinnerLoading = false;
            this.storageService.setItem("miniCartCount", result?.body)
            this.quoteCodeId = res?.body?.code;
            this.quoteId = res?.body?.code;
            this.additionalData = {
              code: this.pdbData.code,
              quoteCode: this.quoteId,
            };
            this.gotoRequest();
            }, () => { this.productService.progressHide(); });

          // this.checkForItemAddedinCart();
        },
        error: (err) => {
          this.productService.progressHide();
          this.spinnerLoading = false;
          this.exceptionErrorMessage = err?.error;
          this.scrollPageToTop();
        },
      });
    }
  }

  modifyPayloadForLinearFeet(payload: any): any {
    let obj = payload;
    obj.feet = this.feetyardForm.value.feet;
    obj.inches = this.feetyardForm.value.inches || "00";
    //obj.requestedQuantity = obj.feet + "." + obj.inches;
    return obj;
  }
  isMultiCutValid: boolean = true;
  colorSelect: boolean = false;
  sizeSelect: boolean = false;
  checkForItemAddedinCart(type?: any, values?: any, template?: any) {
    if(this.ColorSelected == true){
      this.colorSelect = true
      this.errorMessage = 'Please choose a color';
      this.scrollPageToTop()
      this.stopAlert()
      return
     }
     if(this.sizeSelected == true && this.productType!='MERCHANDISING'){
      this.sizeSelect = true
      this.errorMessage = 'Please choose a size';
      this.scrollPageToTop()
      this.stopAlert()
      return
     }

    if (this?.cartData?.isQuote) {
      this.checkAvailabilityCTA = true;
      this.openConfirmationModal({
        title: "Information",
        content:
          " We could see an active shopping cart present already. Proceeding with this will delete the current quote cart. Do you still want to continue?",
        primaryActionLabel: "Continue",
        secondaryActionLabel: "Cancel",
        onPrimaryAction: () => {
          // this.spinnerLoading = true;
          this.productService.progressShow('cancelCart');
          this.productService
            .cancelCart(this.cartData?.code || "123456")
            .subscribe({
              next: (res) => {
                this.spinnerLoading = false;
                this.getMiniCart$().subscribe((res) => {
                  if (res?.body?.errorMessage) {
                    this.storageService.setItem("miniCartCount", "");
                  } else {
                    if (res?.status !== 500) {
                      this.storageService.setItem("miniCartCount", res?.body || res);
                      this.storageService.setItem(
                        "shippingAddress",
                        res?.body?.deliveryAddress
                      );
                    }
                    this.isQuote = res?.body?.isQuote;
                  }
                  this.checkAvailability(type, values);
                  setTimeout(() => {}, 10);
                });
              },
              error: (error: any) => {
                this.spinnerLoading = false;
              },
            });
        },
      });
    } else {
      this.productService.progressShow("checkAvailability", "checkAvailabilityId");
      this.getMiniCart$().subscribe((res) => {
        if (res?.body?.errorMessage) {
          this.storageService.setItem("miniCartCount", "");
        } else {
          if (res?.status !== 500) {
            this.storageService.setItem("miniCartCount", res?.body || res);
            this.storageService.setItem(
              "shippingAddress",
              res?.body?.deliveryAddress
            );
          }
          this.isQuote = res?.body?.isQuote;
        }

        // replacement Order modal   && res.body?.replacementOrder
        // if (template && res.body?.replacementOrder) {
        //   this.spinnerLoading = false;
        //   //this.modalService.hide("shipViaModal");
        //   this.resetReplacementOrderModalForm();
        //   this.modalRef = this.modalService.show(template, {
        //     id: "shipViaModal",
        //     class: "modal-md modal-dialog-centered",
        //   });
        // } else {
        this.checkAvailability(type, values);
        setTimeout(() => {this.productService.progressHide("checkAvailabilityId");}, 1000);
        // }
      },(err)=>{this.productService.progressHide("checkAvailabilityId");});
    }
  }

  inventoryStatusDetails:any = [];
  inventoryStock:any = 0;
  getInventoryStatus(template: TemplateRef<any>){
    this.spinnerLoading = true;
    this.productService.getXchangeInventoryStatus(this.productCode).subscribe({
      next: (res) => {
        this.spinnerLoading = false;
        this.inventoryStatusDetails = res || [];
        if(this.inventoryStatusDetails){
          this.inventoryStock = this.inventoryStatusDetails.reduce(function(prev:any, cur:any) {
            return prev + cur.uom_converted_sysf;
          }, 0);
          
        }
        this.modalRef = this.modalService.show(template, {
          id: "inventoryStatussModal",
          class: "modal-md modal-dialog-centered",
          backdrop: "static",
          keyboard: false,
        });
      },
      error: (err) => {
        this.spinnerLoading = false;
      }
    });
  }

  getMiniCart$() {
    return this.productService.getMiniCartData(
      this.storageService.userInfo?.orgUnit?.uid
    );
  }

  // getEntriesValueFeet(data?: any) {
  //   if (data?.unit === "LF") {
  //     this.resetVal();
  //     this.entries[0].productCode = this.productCode;
  //     this.entries[0].feet = data?.feet;
  //     this.entries[0].inches = data?.inches;
  //     this.entries[0].requestUOM = data?.unit;
  //     this.entries[0].dyeLot = data?.dye;
  //     this.entries[0].requestedQty = this.convertToInt(
  //       data?.feet + "." + data?.inches
  //     );
  //   } else if (data?.unit !== "LF") {
  //     this.resetVal();
  //     this.entries[0].productCode = this.productCode;
  //     this.entries[0].feet = "";
  //     this.entries[0].inches = "";
  //     this.entries[0].dyeLot = data?.dye;
  //     this.entries[0].requestUOM = data?.unit;
  //     this.entries[0].requestedQty = this.convertToInt(data?.feet);
  //   }

  //   this.entries[0].feet === ""
  //     ? (this.entries[0].requestUOM = "BOX")
  //     : this.entries[0].requestUOM == "LF";

  //   this.checkAvailability();
  // }
  getEntriesValueRolls(data?: any) {
    this.resetVal();
    this.entries[0].productCode = this.productCode;
    this.entries[0].dyeLot = data?.dye;
    this.entries[0].feet = data?.targetLength;
    this.entries[0].requestUOM = "RO";

    this.checkForItemAddedinCart();
  }
  getEntriesValueMultiCut(data?: any) {
    this.resetVal();
    this.entries[0].productCode = this.productCode;
    this.entries[0].dyeLot = data?.dye;

    let arr: any = [];
    data?.multicuts.forEach((element: any, i: number) => {
      // let val = {
      //   cut:
      //     element?.feet + "." + (element?.inches == "" ? "0" : element?.inches),
      //   itemNumber: i + 1,

      // };
      let val = {
        dyeLot: "",
        feet: Number(element?.feet),
        inches: Number(element?.inches),
        productCode: this.productCode,
        requestUOM: "LF",
        requestedQty: "",
        maxFeet: 0,
        maxInches: 0,
        minFeet: 0,
        minInches: 0,
      };
      if (data?.multicuts?.length != i ) arr.push(val);
    });

    this.entries[0].multiCut = arr;

    this.entries[0].requestUOM = "multicut";

    this.checkForItemAddedinCart("multiCut", arr);
  }

  addFormRow(e: any, i: number) {
    if (i + 1 == 25) {
      return;
    }
    this.feetValue = 0;
    this.inchesValue = 0;
    this.feetValue = e.currentTarget?.value ? e.currentTarget.value : 0;
    var keyCode = e.keyCode || e.which;

    var pattern = /^[a-z\d\-_\s]+$/i;

    var isValid = pattern.test(String.fromCharCode(keyCode));
    if (isValid) {
      if (
        this.multiCutsForm.value["multicuts"].length == i + 1 &&
        (this.multiCutsForm.value["multicuts"][i].feet != "" ||
          this.multiCutsForm.value["multicuts"][i].inches != "")
      ) {
        this.addVariation();
      } else {
      }
    } else {
      const remove = this.multiCutsForm.get("multicuts") as FormArray;

      if (remove.at(i).get("feet")!.value == "") {
        if (this.multiCutsForm.value["multicuts"].length > i + 1) {
          this.items.removeAt(i + 1);
        }
      }
    }
  }
  get formData() {
    return this.multiCutsForm.get("multicuts") as FormArray;
  }
  addVariation(): void {
    this.items = this.multiCutsForm.get("multicuts") as FormArray;
    if (this.multiCutsForm.value["multicuts"].length >= 1) {
      this.items.push(this.createForm());
    } else {
      this.items.push(this.createItem());
    }
  }
  checkAvailabilityPopup() {
    if (this.cartData?.code) {
      this.service.getCartData(this.storageService?.cartData?.code).subscribe(
        (res: any) => {
          // if (res.status == 200) {
          let rdd = res?.body?.requestedDeliveryDate ? res?.body?.requestedDeliveryDate : new Date();
          rdd = (rdd != "See line details." ? rdd : this.datePipe.transform(new Date(), "MM/dd/YYYY"));
          this.shippingAddress = { ...this.shippingAddress, rdd: rdd, requestedDeliveryDate: rdd };
          this.storageService.setItem("shipping-address", this.shippingAddress);
          this.storageService.setItem("shippingAddress", this.shippingAddress);
          if (res.body?.totalItems == 0) {
            this.openChooseAddressModal(res.body);
          }
          // }
        },
        (err: any) => {
          this.productService.progressHide();
          this.openChooseAddressModal(null);
        }
      );
    } else {
      this.openChooseAddressModal(null);
    }
  }
  createItem(): FormGroup {
    return this.fb.group({
      feet: ["", Validators.required],
      inches: [""],
    });
  }
  createForm(): FormGroup {
    return this.fb.group({
      feet: [""],
      inches: [""],
    });
  }
  items!: FormArray;
  // convertLinerFeet(val?: any, quantity?: any) {
  //   if (val == "SY") {
  //     let value = quantity * 9;
  //     let st = `${Math.trunc(value / 12)} ft. ${value % 12} in. Linear Feet`;

  //     return st;
  //   } else if (val == "SF") {
  //     let value = quantity * 1;
  //     let st = `${Math.trunc(value / 12)} ft. ${value % 12} in. Linear Feet`;

  //     return st;
  //   }
  //   return 0;
  // }

  entries: any = [
    {
      dyeLot: "",
      feet: "",
      inches: "",
      multiCut: [],
      productCode: "",
      requestUOM: "",
      requestedQty: "",
    },
  ];
  selectedTab: any;
  resetEntires(type?: any) {
    this.selectedTab = type;
    this.feetyardForm.setValue({
      unit: "",
      quantity: "",
      feet: "",
      inches: "",
      dye: "",
      targetLength: "",
      minLength: "",
      maxLength: "",
      maxFeet: "",
      maxInches: "",
      minFeet: "",
      minInches: "",
    });
    this.rollsMaxLength = false;
    this.rollsMinLength = false;
    this.inventoryMaxFeet = false;
    this.inventoryMinFeet = false;
    this.inventoryMaxInches = false;
    this.inventoryMinInches = false;
    this.tabFeildsErrMsg = "";

    if (type && type == "Roll") {
      this.feetyardForm.controls["unit"].setValue("RO");
      this.feetyardForm.controls["feet"].setValue(
        this.uomDetails.standardRollLength
          ? this.uomDetails.standardRollLength
          : 0
      );
      this.feetyardForm.controls["targetLength"].setValue(
        this.uomDetails.standardRollLength
          ? this.uomDetails.standardRollLength
          : 0
      );

      /* this.getMinMaxValues({
        target: {
          value: this.uomDetails.standardRollLength
            ? this.uomDetails.standardRollLength
            : 0,
        },
      }); */
      let targetLength = this.uomDetails.standardRollLength
        ? this.uomDetails.standardRollLength
        : 0;
      this.getValues(targetLength);
      this.rollsPlaceholder = this.uomDetails.standardRollLength
        ? this.uomDetails.standardRollLength
        : 0;
      this.feetyardForm.controls["feet"].setValidators(null);
      this.feetyardForm.controls["quantity"].setValidators([
        Validators.required,
        Validators.min(1),
      ]);
      this.feetyardForm.controls["feet"].updateValueAndValidity();
      this.feetyardForm.controls["quantity"].updateValueAndValidity();
      this.feetyardForm.controls["maxFeet"].setValidators(null);
      this.feetyardForm.controls["minFeet"].setValidators(null);
      this.feetyardForm.controls["maxFeet"].updateValueAndValidity();
      this.feetyardForm.controls["minFeet"].updateValueAndValidity();
    } else if (type && type === "Inventory") {
      this.feetyardForm.controls["maxFeet"].setValidators(Validators.required);
      this.feetyardForm.controls["minFeet"].setValidators(Validators.required);
      this.feetyardForm.controls["unit"].setValidators(null);
      this.feetyardForm.controls["quantity"].setValidators(null);
      this.feetyardForm.controls["quantity"].updateValueAndValidity();

      this.feetyardForm.controls["feet"].setValidators(null);
    } else {
      if (this.selectedTab && this.selectedTab == "Roll") {
        this.feetyardForm.controls["unit"].setValue("RO");
        this.feetyardForm.controls["feet"].setValue(
          this.uomDetails.standardRollLength
            ? this.uomDetails.standardRollLength
            : 0
        );
      } else {
        this.feetyardForm?.controls["unit"].setValue(this.unitArray[0]?.type);
      }
      this.feetyardForm.controls["maxFeet"].setValidators(null);
      this.feetyardForm.controls["minFeet"].setValidators(null);
      this.feetyardForm.controls["unit"].setValidators(Validators.required);

      this.feetyardForm.controls["feet"].setValidators([
        Validators.required,
        Validators.min(0),
      ]);
      this.feetyardForm.controls["quantity"].setValidators(null);
      this.feetyardForm.controls["quantity"].updateValueAndValidity();
    }

    this.feetyardForm.controls["unit"].updateValueAndValidity();
    this.feetyardForm.controls["maxFeet"].updateValueAndValidity();

    this.feetyardForm.controls["minFeet"].updateValueAndValidity();
    this.feetyardForm.controls["feet"].updateValueAndValidity();

    // this.resetVal();
  }
  resetVal() {
    this.entries = [
      {
        dyeLot: "",
        feet: "",
        inches: "",
        multiCut: [],
        productCode: "",
        requestUOM: "",
        requestedQty: "",
      },
    ];
  }
  enableCheckAvailability: any;
  enableOrderSample: any;
  enableRequestQuote: any;
  overAgesStringArray: any = [];
  conversionUnit: any;
  uomDetails: any;
  isQuantityValid: any;
  uomErrorMsg: any = "";
  showBlockedProductMsg: boolean = false;
  styleBlocked:boolean = false;
  getUOMDetails() {
    this.service.getUOMDetails(this.productCode).subscribe(
      (res) => {
        this.setLoadAPI("uomData");
        this.feetyardForm.enable();
        this.pdpPricingUOMCode = res?.body?.pricingUom.code;
        this.pdpPricingUOMValue = res?.body?.pricingUom.name;
        this.erpProductCategory = res?.body?.erpProductCategory;
        this.showBlockedProductMsg =
          res?.body?.enableCheckAvailability == false &&
          res?.body?.styleBlocked == true
            ? true
            : false;

        this.styleBlocked = res?.body?.styleBlocked;
        if (!(this.styleBlocked == true && this.userInfo?.isCustomer == true)) {
            this.getProductPriceDetails(this.productCode);
        }
        if(this.erpProductCategory === 'B'){
          this.isAtpCheck = true;
        }
        if (this.pdbData?.classification == "Accessories") {
          this.isAtpCheck = false;
        }
        this.enableCheckAvailability = res.body?.enableCheckAvailability;
        this.uomDetails = res?.body;
        this.conversionUnit = res?.body?.alternateUomData
          ? res?.body?.alternateUomData[0]?.alternateUomConversionUnit
          : "";
        let obj = {
          alternateUomData: [
            {
              alternateUom: "pieces",
              alternateUomConversionUnit: 12.0,
            },
          ],
          enableCheckAvailability: res?.body?.enableCheckAvailability
            ? res?.body?.enableCheckAvailability
            : false,
          enableOrderSample: res?.body?.enableOrderSample
            ? res?.body?.enableOrderSample
            : false,
          enableRequestQuote: res?.body?.enableRequestQuote
            ? res?.body?.enableRequestQuote
            : false,
          overages: [
            {
              maxOrderQuantity: 10,
              minOrderQuantity: 0,
              overagePercentage: 5.0,
              uom: "SF",
            },
            {
              maxOrderQuantity: 20,
              minOrderQuantity: 0,
              overagePercentage: 5.0,
              uom: "SF",
            },
          ],
        };
        // res?.body?.alternateUomData?.map((res: any) => {

        //   // this.unitArray.push({
        //   //   type: res.alternateUom,
        //   //   value: res.alternateUom,
        //   //   conversion: res.alternateUomConversionUnit
        //   // });
        //   // this.selectedUnit = this.unitArray[0].value
        // });

        this.enableOrderSample = obj.enableOrderSample;
        this.enableRequestQuote = obj.enableRequestQuote;
        obj.overages.map((obj) => {
          let overAgesString = `${
            obj.overagePercentage != null ? obj.overagePercentage + "%" : "N/A"
          } from ${
            obj.minOrderQuantity != null ? obj.minOrderQuantity : "N/A"
          } to ${obj.maxOrderQuantity != null ? obj.maxOrderQuantity : "N/A"} ${
            obj.uom ? obj.uom : "N/A"
          }`;
          this.overAgesStringArray.push(overAgesString);
        });
        // this.pdpInventoryUom = res?.body?.inventoryUom?.name;
        if (res?.body?.alternateUomData) {
          this.unitArray = res?.body?.alternateUomData.map((element: any) => {
            return {
              type: element?.alternateUom.code,
              value: element?.alternateUom.name,
              alternateUomConversionUnit: element?.alternateUomConversionUnit,
            };
          });

          if (
            res?.body?.inventoryUom.code === "ZCT" &&
            this.subProductType === "TRIM_AND_TRANSITION"
          ) {
            let lfRate = res?.body?.alternateUomData?.filter(
              (element: any) => element.alternateUom.code !== "ZCT"
            );
            this.conversationZctToLf = (
              1 / lfRate[0].alternateUomConversionUnit
            ).toFixed(2);
          }

          // this.unitArray = []
          // res?.body?.alternateUomData.map( async(element: any) => {
          //   let matchedData= this.uom.find(item => item.type === element?.alternateUom);
          //   if(matchedData==undefined){
          //     this.unitArray.push({ type: element?.alternateUom, value: element?.alternateUom });
          //   }
          //   else{
          //     this.unitArray.push(matchedData);
          //   }
          // });
          if (
            (this.selectedTab && this.selectedTab == "Roll") ||
            this.uomDetails?.rollOnly == "true"
          ) {
            this.resetEntires("Roll");
            localStorage.setItem("selectedProductTab", "Roll");
            this.feetyardForm.controls["unit"].setValue("RO");
            this.feetyardForm.controls["feet"].setValue(
              this.uomDetails.standardRollLength
                ? (this.feetyardForm?.value?.unit == 'LF' ? this.uomDetails.standardRollLength : "")
                : ""
            );
            let targetLength = this.uomDetails.standardRollLength
              ? this.uomDetails.standardRollLength
              : 0;
            this.rollsPlaceholder = this.uomDetails.standardRollLength
              ? this.uomDetails.standardRollLength
              : 0;
            this.getValues(targetLength);
          } else {
            this.feetyardForm?.controls["unit"].setValue(
              this.unitArray[0]?.type
            );
          }
          if (!this.selectedTab || this.selectedTab === "feet") {
            this.feetyardForm?.controls["unit"].setValue(
              this.unitArray[0]?.type
            );
          }
          let selectedUom = res.body?.alternateUomData.filter(
            (element: any) =>
              element.alternateUom.code != res?.body?.inventoryUom.code
          );
          this.zcttouomconv = selectedUom[0]?.alternateUom?.code;
          this.pdpInvUOMCode = res?.body?.inventoryUom.code;
          this.pdpInvUOMValue = res?.body?.inventoryUom.name;
          this.pdpPricingUOMCode = res?.body?.pricingUom.code;
          this.pdpPricingUOMValue = res?.body?.pricingUom.name;

          this.pdpUomConversionRate = res.body?.alternateUomData.filter(
            (element: any) =>
              element.alternateUom.code != res?.body?.alternateUomConversionUnit
          );

          if (selectedUom.length)
            this.pdpInventoryUomValue =
              selectedUom[0].alternateUomConversionUnit;

          this.unitChange(this.unitArray[0]?.type);
          // this.feetyardForm?.controls["feet"].setValue(this.unitArray[0]?.value);
          // this.pdpInventoryUomValue =
          //   this.unitArray[0]?.alternateUomConversionUnit;
          this.unitChange(this.unitArray[0]?.type);
        } else {
          // this.getCorrectProducType(
          //   this.pdbData.productType,
          //   this.pdbData.subProductType
          // );
        }
        this.manageFullUAMRecords(
          this.productType,
          this.subProductType,
          this.uomDetails
        );

        if (localStorage.getItem("alternateProductData")) {
          let productDataObj: any = localStorage.getItem(
            "alternateProductData"
          );
          let alternateProductData = JSON.parse(productDataObj);
          this.feetyardForm.controls["feet"].setValue(
            alternateProductData?.entries[0].requestedQty
          );
          this.feetyardForm.controls["unit"].setValue(
            alternateProductData?.entries[0].requestedUOM
          );
          localStorage.removeItem("alternateProductData");
        }

        // let overAgesString = `${obj.percent} from ${obj.min} to ${obj.max} ${obj.unit}`;
        // this.overAgesStringArray.push(overAgesString);
      },
      (err: any) => {
        if (err.error?.errorCode) {
          this.feetyardForm.disable();
          this.uomErrorMsg = err.error?.message;
        }
        this.setLoadAPI("uomData");
      }
    );
  }

  productCodeTerm: any;

  getAllAccessory() {
    this.service.getalldisplaytypes(this.productCode).subscribe((res) => {
      this.spinnerLoading = false;
      this.setLoadAPI("alldisplaytypes");
      if (res && res.status == 500) {
        this.exceptionErrorMessage = res.error;
      }
      if (res && res.status == 400) {
        this.exceptionErrorMessage = res.error.message
          ? res.error.message
          : res.message;
      }
      if (res.body) {
        this.productCodeTerm = res.body;
      }
    }, () => {
      this.setLoadAPI("alldisplaytypes")
    });
  }
  selectedAccessories: any;

  addToCart(data1: any) {
    const data: any = this.modalService.config.initialState;
    this.selectedAccessories = data1;
    // if (
    //   this.storageService.cartData == "" ||
    //   this.storageService.cartData?.errorMessage != "" ||
    //   this.storageService.cartData?.totalItems == 0
    // )
    if (
      this.storageService.cartData == undefined ||
      this.storageService.cartData == "" ||
      this.storageService.cartData.hasOwnProperty("errorMessage") ||
      this.storageService.cartData?.totalItems == 0
    ) {
      this.openChooseAddressModal({}, null, null, {}, true);
    } else {
      const initialState: ModalOptions = {
        initialState: {
          cartData: {},
          itemName: {},
          postOrder: false,
          showSuccessAlert: false,
          loadAllAccessoriesDetails: true,
          shippingAddress: this.productService.getDefaulAddress(),
          selectedAccessories: data1,
          // productCode="C.BC456.683.1300.AB",
          onClose: () => {
            this.modalService.hide('XchangeAddAccessoriesLightboxComponent');
          }
        },
      };
      this.bsModalRef = this.modalService.show(
        XchangeAddAccessoriesLightboxComponent,
        Object.assign(initialState, {
          id: "XchangeAddAccessoriesLightboxComponent",
          class: "modal-xl modal-dialog-centered xchangeaddaccessorieslightbox",
          backdrop: "static",
          keyboard: false,
        })
      );
      this.bsModalRef.content.type = 2;
    }

  }

  selectedUnitOfMeasure = "";
  getCorrectProducType(productType: string, subProductType: string) {
    if (productType === "CARPET") {
      if (subProductType === "CARPETPRODUCT_CARPET_TILE") {
        this.unitArray = [
          {
            type: "Carton(s)",
            value: "CAR",
          },
          {
            type: "Box",
            value: "BOX",
          },
        ];
      } else {
        this.unitArray = [
          {
            type: "LF",
            value: "LF",
          },
          {
            type: "Sq.Yds",
            value: "YD2",
          },
          {
            type: "Sq.Ft",
            value: "FT2",
          },
        ];
      }
    } else if (productType === "Cushion") {
      this.unitArray = [
        {
          type: "Sq.Yds",
          value: "YD2",
        },
      ];
    } else if (
      productType === "RESILIENT_VINYL" ||
      subProductType === "RESILIENT_VINYL"
    ) {
      this.unitArray = [
        {
          type: "Carton(s)",
          value: "CAR",
        },
        {
          type: "Sq.Yds",
          value: "YD2",
        },
        {
          type: "SqFeet",
          value: "FT2",
        },
      ];
    } else if (productType == "WOOD") {
      this.unitArray = [
        {
          type: "Carton(s)",
          value: "CAR",
        },
        {
          type: "Box",
          value: "BOX",
        },
      ];
    } else {
      this.unitArray = [];
    }
    const val = this.unitArray.length > 0 ? this.unitArray[0].value : "";
    if (
      (this.selectedTab && this.selectedTab == "Roll") ||
      this.uomDetails?.rollOnly == "true"
    ) {
      localStorage.setItem("selectedProductTab", "Roll");
      this.feetyardForm.controls["unit"].setValue("RO");
      this.feetyardForm.controls["feet"].setValue(
        this.uomDetails.standardRollLength
          ? this.uomDetails.standardRollLength
          : 0
      );
      let targetLength = this.uomDetails.standardRollLength
        ? this.uomDetails.standardRollLength
        : 0;
      this.getValues(targetLength);
    } else {
      this.feetyardForm?.controls["unit"].setValue(val);
    }
  }
  
  unitChange(ev: any) {
    if (ev == "YDK") {
      const selectedItem = this.unitArray.find(
        (item: any) => item.type === "LF" || item.type === "ZCT"
      );
      // this.pdpInventoryUomValue = selectedItem?.alternateUomConversionUnit;
      this.pdpInventoryUom = selectedItem?.value;
    }
    if (ev == "LF") {
      const selectedItem = this.unitArray.find(
        (item: any) => item.type === "YDK"
      );
      // this.pdpInventoryUomValue = selectedItem?.alternateUomConversionUnit;
      this.pdpInventoryUom = selectedItem?.value;
    }
    if (ev == "FTK") {
      const selectedItem = this.unitArray.find(
        (item: any) => item.type === "FTK"
      );
      // this.pdpInventoryUomValue = selectedItem?.alternateUomConversionUnit;
      this.pdpInventoryUom = "Carton";
    }
    if (ev == "ZCT") {
      const selectedItem = this.unitArray.find(
        (item: any) => item.type === "FTK" || item.type === "YDK"
      );
      // this.pdpInventoryUomValue = selectedItem?.alternateUomConversionUnit;
      this.pdpInventoryUom = selectedItem?.value;
    }
    // const selectedItem = this.unitArray.find((item: any) => item.type === ev);
    // this.pdpInventoryUomValue = selectedItem?.alternateUomConversionUnit;
    this.selectedUnitOfMeasure = this.feetyardForm.value.unit;


    this.feetyardForm.controls["inches"].patchValue("");
    this.feetyardForm.controls["feet"].patchValue("");
    this.excessQntyErrMsg = "";
  }

  convertToInt(item: any) {
    let conertedData = Number(item);

    return conertedData;
  }

  uom = [
    { value: "BAG", type: "BG" },
    { value: "BOX", type: "CT" },
    { value: "CARD", type: "ZCD" },
    { value: "CARTON", type: "ZCT" },
    { value: "CASE", type: "CS" },
    { value: "EACH", type: "EA" },
    { value: "LINEAR FEET", type: "LF" },
    { value: "LINEAR YARD", type: "LY" },
    { value: "PACK", type: "PK" },
    { value: "PIECE", type: "PCE" },
    { value: "POUND", type: "LBR" },
    { value: "ROLL", type: "RO" },
    { value: "SHEET(S)", type: "ZSH" },
    { value: "SQUARE FEET", type: "FTK" },
    { value: "SQUARE YARDS", type: "YDK" },
    { value: "TON", type: "TON" },
    { value: "TON GROSS LONG", type: "TG" },
    { value: "TUBE", type: "TU" },
    { value: "100 POUNDS", type: "CW" },
  ];

  //getProductPriceDetails
  getProductPriceDetails(productCode: any) {
    if (this.productCode.includes("#")) {
      this.productCode = this.productCode.replace(/#/g, "%23");
    }
    const setTimeoutRef = setTimeout(() => {
      this.spinnerLoading = false;
    }, 30000);
    this.productPriceDetails.isLoading = true;
     if(this.productType === "MERCHANDISING"){
      this.productPriceDetails.isLoading = true;
      this.productService.getMerchandisingPriceDetails(productCode).subscribe(
        (res: any) => {
          
          this.spinnerLoading = false;
          this.productPriceDetails.isLoading = false;
          clearTimeout(setTimeoutRef);
          this.productPriceDetails = res.body;
        },
        (err: any) => {
          
          this.spinnerLoading = false;
          this.productPriceDetails.isLoading = false;
          clearTimeout(setTimeoutRef);
          this.productPriceDetails = {};
        }
      );
    }else{
    this.productService.getProductPriceDetails(productCode).subscribe(
      (res: any) => {
        this.spinnerLoading = false;
        this.productPriceDetails.isLoading = false;
        clearTimeout(setTimeoutRef);
        this.productPriceDetails = res.body;
      },
      (err: any) => {
        this.spinnerLoading = false;
        this.productPriceDetails.isLoading = false;
        this.productPriceDetails = {};
        clearTimeout(setTimeoutRef);
        this.productService.progressHide();
      }
    );
  }
  }

  // Price conversion

  //getProductMedias
  getProductMedias(productCode: any) {
    this.warrantyInfo = [];
    this.installationInfo = [];
    this.careAndMaintenance = [];
    this.mediaInfo = [];
    // this.feetyardForm.controls["feet"].patchValue(this.selectedUnitOfMeasure);
    this.productService.getProductMedias(productCode).subscribe(
      (res: any) => {
        this.setLoadAPI("media");

        if (res && res.status == 500) {
          this.exceptionErrorMessage = res.error;
        }
        if (res && res.status == 400) {
          this.exceptionErrorMessage = res.error.message
            ? res.error.message
            : res.message;
        }

        let productAssets = res.body?.productAssets || [];
        productAssets.map((product: any) => {
          if (product.assetDescriptor == "Warranty") {
            this.warrantyInfo.push(product);
          }
          if (product.assetDescriptor == "Installation") {
            this.installationInfo.push(product);
          }
          if (product.assetDescriptor == "CareAndMaintenance") {
            this.careAndMaintenance.push(product);
          }
          if (product.assetDescriptor == "Graphic") {
            this.mediaInfo.push(product);
          }
        });

        this.productImages = [];
        for (let p in res.body) {
          if (p === "roomSceneImageURL") {
            res.body
              ? this.productImages.push({
                  roomImage: res.body[p],
                })
              : "";
          } else if (p === "productImageURL") {
            res.body
              ? this.productImages.push({
                  swatchImage: res.body[p],
                })
              : "";
          }
        }
      },
      (err: any) => {
        this.setLoadAPI("media");
      }
    );
  }
  feetInchCal() {
    let val: any = "";
    let rate = this.pdpUomConversionRate?.filter(
      (element: any) =>
        element.alternateUom.code === this.feetyardForm?.value?.unit
    );
    let lfRate = this.pdpUomConversionRate?.filter(
      (element: any) =>
        element.alternateUom.code !== this.feetyardForm?.value?.unit
    );

    if (this.feetyardForm?.value?.unit == "LF") {
      const feet =
        this.feetyardForm?.value.feet == "" ? 0 : this.feetyardForm?.value.feet;
      const inches: any =
        this.feetyardForm?.value.inches == ""
          ? 0
          : this.feetyardForm?.value.inches;
      const inchCal = inches / 12;
      let lfRateTemp;
      if (lfRate.length > 1) {
        lfRateTemp = lfRate?.filter(
          (element: any) => element.alternateUom.code == "LF"
        );
      } else {
        lfRateTemp = lfRate;
      }
      if (this.pdpInvUOMCode != "LF")
        val = (Number(feet) + inchCal) * rate[0]?.alternateUomConversionUnit;
      else
        val =
          ((Number(feet) + inchCal) * rate[0]?.alternateUomConversionUnit) /
          lfRateTemp[0]?.alternateUomConversionUnit;
      //  val = JSON.stringify(val);

      val = (Math.ceil(val * 1000) / 1000).toFixed(2);

      val = val + " " + this.pdpInvUOMValue;
    }
    //SQuare Yard
    if (
      this.feetyardForm?.value?.unit == "YDK" &&
      this.feetyardForm?.value.feet != ""
    ) {
      let lfRateTemp: any;
      if (lfRate.length > 1) {
        lfRateTemp = lfRate?.filter(
          (element: any) => element.alternateUom.code == "LF"
        );
      } else {
        lfRateTemp = lfRate;
      }

      if (this.pdpInvUOMCode !== "YDK")
        val =
          this.feetyardForm?.value.feet * rate[0]?.alternateUomConversionUnit;
      else {
        val =
          (this.feetyardForm?.value.feet *
            rate[0]?.alternateUomConversionUnit) /
          lfRateTemp[0]?.alternateUomConversionUnit;
      }

      if (
        this.productType === "SOFTSURFACE" &&
        this.subProductType != "CARPET_TILE" &&
        this.pdpInvUOMCode !== "RO"
      ) {
        val = this.sqYardsToLinear(val);
      }
      if (
        this.productType === "SOFTSURFACE" &&
        this.subProductType != "CARPET_TILE" &&
        this.pdpInvUOMCode == "RO"
      ) {
        val = JSON.stringify(val);
        if (JSON.stringify(val)?.includes(".")) {
          let k: any = val.split(".");
          if (k[1].substring(0, 1) > 0) {
            k[0] = parseInt(k[0]) + 1;
            k[1] = 0;
          }

          // if (k[1] != "") {
          //   let t = k[0];
          //   k[0] = parseInt(t) + 1;
          //   k[1] = 0;
          // }

          val = `${k[0]}`;
        }
        let result = Math.ceil(val * 100) / 100;
        val = result + " Roll(s)";
      }
      if (
        (this.productType === "SOFTSURFACE" &&
          this.subProductType === "CARPET_TILE") ||
        this.productType === "HARDSURFACE" ||
        this.productType === "TILE"
      ) {
        val = JSON.stringify(val);
        if (JSON.stringify(val)?.includes(".")) {
          let k: any = val.split(".");
          if (k[1].substring(0, 1) > 0) {
            k[0] = parseInt(k[0]) + 1;
            k[1] = 0;
          }

          // if (k[1] != "") {
          //   let t = k[0];
          //   k[0] = parseInt(t) + 1;
          //   k[1] = 0;
          // }

          val = `${k[0]}`;
        }
        let result = Math.ceil(val * 100) / 100;
        val = result + " Carton(s)";
      }
    }
    if (
      this.feetyardForm?.value?.unit == "ZCT" &&
      this.feetyardForm?.value.feet != ""
    ) {
      if (this.pdpInvUOMCode !== "ZCT")
        val =
          this.feetyardForm?.value.feet * rate[0]?.alternateUomConversionUnit;
      else {
        val = Math.round(
          (this.feetyardForm?.value.feet *
            rate[0]?.alternateUomConversionUnit) /
            lfRate[0]?.alternateUomConversionUnit
        );
      }

      val = JSON.stringify(val);
      let k: any;
      if (JSON.stringify(val)?.includes(".")) {
        k = val.split(".");
        if (k[1] != "") {
          let t = k[0];
          k[0] = parseInt(t) + 1;
          k[1] = 0;
        }
        val = `${k[0]}`;
      }

      this.convertPdpInvUOMValue = this.feetyardForm?.value.feet;
      val = val + " " + lfRate[0].alternateUom.name;
    }
    if (
      this.feetyardForm?.value?.unit == "FTK" &&
      this.feetyardForm?.value.feet != ""
    ) {
      let lfRateTemp;
      if (lfRate.length > 1) {
        lfRateTemp = lfRate?.filter(
          (element: any) => element.alternateUom.code == "LF"
        );
      } else {
        lfRateTemp = lfRate;
      }
      if (this.pdpInvUOMCode !== "FTK" && this.pdpInvUOMCode === "LF")
        val =
          this.feetyardForm?.value.feet * rate[0]?.alternateUomConversionUnit;
      else {
        val = Math.round(
          (this.feetyardForm?.value.feet *
            rate[0]?.alternateUomConversionUnit) /
            lfRateTemp[0]?.alternateUomConversionUnit
        );
      }

      if (
        this.productType === "SOFTSURFACE" &&
        this.subProductType != "CARPET_TILE"
      ) {
        val = this.sqYardsToLinear(val);
      }
      if (
        (this.productType === "SOFTSURFACE" &&
          this.subProductType === "CARPET_TILE") ||
        this.productType === "HARDSURFACE" ||
        this.productType === "TILE" ||
        this.productType === "ACCESSORIES"
      ) {
        val = JSON.stringify(val);
        if (JSON.stringify(val)?.includes(".")) {
          let k: any = val.split(".");
          if (k[1].substring(0, 1) > 0) {
            k[0] = parseInt(k[0]) + 1;
            k[1] = 0;
          }

          // if (k[1] != "") {
          //   let t = k[0];
          //   k[0] = parseInt(t) + 1;
          //   k[1] = 0;
          // }

          val = `${k[0]}`;
        }
        let result = Math.ceil(val * 100) / 100;
        if (result === 0) {
          result = 1;
        }
        val = result + " " + lfRateTemp[0].alternateUom.name;
        this.convertPdpInvUOMValue = result;
      }
    }
    if (
      this.feetyardForm?.value?.unit == "RO" &&
      this.feetyardForm?.value.feet != ""
    ) {
      if (this.pdpInvUOMCode !== "RO")
        val =
          this.feetyardForm?.value.feet * rate[0]?.alternateUomConversionUnit;
      else {
        val =
          (this.feetyardForm?.value.feet *
            rate[0]?.alternateUomConversionUnit) /
          lfRate[0]?.alternateUomConversionUnit;
      }
      this.convertPdpInvUOMValue = val;
      this.requestedQty = val;
      val = val + " " + lfRate[0].alternateUom.name;
    }


    this.requestedQty = val?.split(" ")[0];
  
   // this.conversionFunction1();
    this.conversionFunction2();


    return val;
  }
  

  requestedYdkQty: any;


  conversionFunction1() {
    this.pdpConvUnit = "";
    const feetValue = Number(this.feetyardForm?.value.feet) || 0;
    const inchesValue = Number(this.feetyardForm?.value.inches) || 0;
    if (feetValue > 0 || inchesValue > 0) {
      this.inputUOM = this.feetyardForm?.value?.unit;

      let outputQty: any = 0;
      let displayQtyUOM: any = "";
      let rate = this.pdpUomConversionRate?.filter(
        (element: any) =>
          element.alternateUom.code === this.feetyardForm?.value?.unit
      );
      let lfRate: any = this.pdpUomConversionRate?.filter(
        (element: any) =>
          element.alternateUom.code !== this.feetyardForm?.value?.unit
      );
      if (this.erpProductCategory === "B") {
        if (this.inputUOM === this.pdpInvUOMCode) {
          
          let decimalQty =
        this.feetyardForm?.value.feet /
        lfRate[0]?.alternateUomConversionUnit;
        let feetQty = Math.floor(decimalQty);
        let fractionalPart = decimalQty - feetQty;
        let inchQty = Math.round(fractionalPart * 12); 
        if (inchQty === 12) {
          feetQty += 1;
          inchQty = 0;
        }
          displayQtyUOM = `${feetQty}' `;
            if (inchQty > 0) {
              displayQtyUOM += ` ${inchQty}"`;
            }
            displayQtyUOM = displayQtyUOM
            ? displayQtyUOM + " " + lfRate[0]?.alternateUom?.name
            : "";
        } else if (this.inputUOM === "LF") {
          let feetQty = this.feetyardForm?.value.feet;
          let inchQty = this.feetyardForm?.value.inches;
          let decimalInchQty = inchQty / 12;

          let decimalLFQty = parseInt(feetQty) + decimalInchQty;
          let lfRateLF = this.pdpUomConversionRate?.filter(
            (element: any) => element.alternateUom.code == "LF"
          );

          outputQty = (
            (decimalLFQty * lfRateLF[0]?.alternateUomConversionUnit * 1000) /
            1000
          ).toFixed(2);
          displayQtyUOM = outputQty + " " + this.pdpInvUOMValue;
        } else if (this.inputUOM === "FTK") {
          let feetSFQty = this.feetyardForm?.value.feet;
          let lfRateSF = this.pdpUomConversionRate?.filter(
            (element: any) => element.alternateUom.code == "FTK"
          );
          outputQty = (
            feetSFQty * lfRateSF[0]?.alternateUomConversionUnit
          ).toFixed(2);
          displayQtyUOM = outputQty + " " + this.pdpInvUOMValue;
        }
      } else {
        if (
          this.inputUOM === this.pdpInvUOMCode ||
          this.inputUOM === this.pdpPricingUOMCode
        ) {
          let conversionRate = this.pdpUomConversionRate.find(
            (rate: any) => rate.alternateUom.code === this.inputUOM
          );
          let feetSFQty = this.feetyardForm?.value.feet;
          if (conversionRate?.alternateUomConversionUnit === 1) {
            let lfRateSF1 = this.pdpUomConversionRate?.filter(
                (element: any) => element.alternateUom.code != this.inputUOM
              );

            // If the conversion rate is 1, the quantity remains the same
              if(this.pdpInvUOMCode != this.pdpPricingUOMCode){
                  feetSFQty = this.feetyardForm?.value.feet;
                let lfRateSF = this.pdpUomConversionRate?.filter(
                  (element: any) => element.alternateUom.code != this.inputUOM
                );
                let res =  (feetSFQty / lfRateSF[0]?.alternateUomConversionUnit
              );
              if (res - Math.floor(res) < 0.000005) {
                outputQty = Math.floor(res);
              } else {
                outputQty = Math.ceil(res);
              }
              outputQty = outputQty <= 0 ? 1 : outputQty;


              } else{
                 outputQty = Math.round(1 / lfRateSF1[0]?.alternateUomConversionUnit) * feetSFQty;
        
              }

           
          } else {
            feetSFQty = this.feetyardForm?.value.feet;
          let lfRateSF = this.pdpUomConversionRate?.filter(
            (element: any) => element.alternateUom.code == this.inputUOM
          );
          let res =  (feetSFQty * lfRateSF[0]?.alternateUomConversionUnit
        );
        if (res - Math.floor(res) < 0.000005) {
          outputQty = Math.floor(res);
        } else {
          outputQty = Math.ceil(res);
        }
        outputQty = outputQty <= 0 ? 1 : outputQty;


          }
          let displayUOM = this.pdpUomConversionRate.find(
            (rate: any) => rate.alternateUom.code != this.inputUOM
          );
          

          displayQtyUOM = `${outputQty} ${displayUOM?.alternateUom.name}`;
         
        }
        if (this.inputUOM != this.pdpInvUOMCode) {
          let feetSFQty = this.feetyardForm?.value.feet;

          let conversionRate = this.pdpUomConversionRate.find(
            (rate: any) => rate.alternateUom.code === this.inputUOM
          );
        
          if (this.inputUOM === "ZCT") {
            // Display square yards for ZCT
            outputQty = (feetSFQty / (conversionRate?.alternateUomConversionUnit || 1)).toFixed(2);
            displayQtyUOM = `${outputQty} Square Yards`;
          } else if (this.inputUOM === "YDK") {
            // Display cartons for YDK
            outputQty = Math.max(
              Math.ceil(feetSFQty * (conversionRate?.alternateUomConversionUnit || 1)),
              1
            );
            displayQtyUOM = `${outputQty} Cartons`;
          } else if (this.inputUOM === "FTK") {
            let res = feetSFQty * (conversionRate?.alternateUomConversionUnit || 1);
            if (res - Math.floor(res) < 0.000005) {
              outputQty = Math.floor(res);
            } else {
              outputQty = Math.ceil(res);
            }
            outputQty = outputQty <= 0 ? 1 : outputQty;
            let displayUOM = this.pdpUomConversionRate.find(
              (rate: any) => rate.alternateUom.code !== "FTK"
            );
            displayQtyUOM = `${outputQty} ${displayUOM?.alternateUom.name || this.pdpInvUOMValue}`;
          }

          if (this.pdpInvUOMCode == "RO") {
            this.requestedQty = outputQty;
          }
        }
        if (this.inputUOM === "EA" && this.pdpUomConversionRate.length === 1) {
          displayQtyUOM = "";
          outputQty = this.feetyardForm.value;
        }
      }

      if(this.pdpUomConversionRate.length === 1){
        displayQtyUOM = "";
      }

      this.requestedQty =
        this.inputUOM == "RO" ? this.feetyardForm?.value.feet : outputQty;
      if (this.inputUOM === "ZCT") {
        this.convertPdpInvUOMValue = this.feetyardForm?.value.feet;
      } else {
        this.convertPdpInvUOMValue = outputQty;
        if (this.inputUOM === "FTK") {
          
          if(this.subProductType != "HERO_RUBBER"){
          this.pdpConvUnit = this.uomDetails?.sqFtPerCarton ?
            (this.uomDetails?.sqFtPerCarton * outputQty).toFixed(2) +
            " " +
            "Square Foot" : "";
        }else{
            let conversionRate = this.pdpUomConversionRate.find(
            (rate: any) => rate.alternateUom.code === this.inputUOM
          );
          // If the conversion rate is 1, the quantity remains the same
          this.pdpConvUnit  = Math.round(1 / conversionRate?.alternateUomConversionUnit) * outputQty + " " + "Square Foot";
        
        }
        
      }

        if (this.inputUOM === "YDK") {
          this.pdpConvUnit = this.uomDetails?.sqFtPerCarton ?
            ((this.uomDetails?.sqFtPerCarton / 9) * outputQty).toFixed(2) +
            " " +
            "Square Yard" : "";
        }
      }
      if (this.feetyardForm?.value?.unit == "YDK") {
        this.requestedYdkQty = this.feetyardForm?.value.feet;
      } else {
        this.requestedYdkQty = outputQty;
      }
      if (
        this.feetyardForm?.value.feet === "" ||
        this.feetyardForm?.value.feet === null
      )
        return "";
      else return displayQtyUOM;
    } else {
      return "";
    }
  }

  conversionFunction2(): string {
    const feet = Number(this.feetyardForm?.value?.feet) || 0;
  const inches = Number(this.feetyardForm?.value?.inches) || 0;

    if (feet === 0 && inches === 0) {
      this.pdpConvUnit = "";
      return "";
    }
     this.pdpConvUnit = "";
   this.inputUOM = this.feetyardForm?.value?.unit;
    const userRequestedQuantity = this.feetyardForm?.value?.inches ? Number(this.feetyardForm?.value?.feet) + Number(this.feetyardForm?.value?.inches) / 12 : Number(this.feetyardForm?.value?.feet);
    const userRequestedUOM = this.feetyardForm?.value?.unit;
    const inventoryUom = this.pdpInvUOMCode;
    const pricingUom = this.pdpPricingUOMCode;
    const conversionFactors = this.pdpUomConversionRate;
    const ceilingUoms = ['ZCT', 'RO', 'PF'];
   
    const getDecimalsForUom = (value: number): number => {
      return parseFloat(value.toFixed(8));
    };
    const getCeilQuantity = (value: number): number => {
      

         return Math.ceil(getRoundedQuantityTwoDecimals(value));
      
     
    };
     const getCeilQuantityThreeDecimals = (value: number): number => {
      
      
         return Math.ceil(getRoundedQuantityThreeDecimals(value));
      
     
    };
    const getRoundedQuantityTwoDecimals = (value: number): number => {
      return Number((Math.round((value + Number.EPSILON) * 100) / 100).toFixed(2));
    };
     const getRoundedQuantityThreeDecimals = (value: number): number => {
      return Number((Math.round((value + Number.EPSILON) * 1000) / 1000).toFixed(3));
    };
    const valueWithinOneCentRounding = (initialUomConversion: number): boolean => {
      const twoDecimalUomConversion = getRoundedQuantityTwoDecimals(initialUomConversion);
      const roundedUomConversion = Math.round(initialUomConversion);
      return roundedUomConversion === twoDecimalUomConversion - 0.01 || roundedUomConversion === twoDecimalUomConversion + 0.01;
    };



    // --- getFullQuantityInInventoryUOM (no rounding except ceiling UOMs) ---
    let fullInventoryUomQty = userRequestedQuantity;
    if (userRequestedUOM && userRequestedUOM !== inventoryUom) {
      for (const factor of conversionFactors) {
        if (factor.alternateUom.code === userRequestedUOM) {
          const inventoryUomConversion = getDecimalsForUom(factor.alternateUomConversionUnit);
          if (ceilingUoms.includes(inventoryUom)) {
            fullInventoryUomQty = getCeilQuantity(userRequestedQuantity * inventoryUomConversion);
          } else {
            fullInventoryUomQty = userRequestedQuantity * inventoryUomConversion;
          }
          break;
        }
      }
    }

    // --- getQuantityInInventoryUOM (with rounding) ---
    let inventoryUomQty = getRoundedQuantityTwoDecimals(userRequestedQuantity);
    if (userRequestedUOM && userRequestedUOM !== inventoryUom) {
      for (const factor of conversionFactors) {
        if (factor.alternateUom.code === userRequestedUOM) {
          const inventoryUomConversion = getDecimalsForUom(factor.alternateUomConversionUnit);
          if (ceilingUoms.includes(inventoryUom)) {
            inventoryUomQty = getCeilQuantity(userRequestedQuantity * inventoryUomConversion);
          } else {
            inventoryUomQty = getRoundedQuantityTwoDecimals(userRequestedQuantity * inventoryUomConversion);
          }
          break;
        }
      }
    }

    // --- getQuantityInPricingUOM (converts via full inventory qty to pricing UOM) ---
    let pricingUomQty = getRoundedQuantityTwoDecimals(userRequestedQuantity);
    if (userRequestedUOM && pricingUom && pricingUom !== userRequestedUOM) {
      const invQtyForPricing = fullInventoryUomQty;
      for (const factor of conversionFactors) {
        if (factor.alternateUom.code === pricingUom) {
          if (factor.alternateUomConversionUnit % 1 !== 0) {
            const initialUomConversion = 1 / getDecimalsForUom(factor.alternateUomConversionUnit);
            const pricingUomConversion = valueWithinOneCentRounding(initialUomConversion) ? Math.round(initialUomConversion) : initialUomConversion;
            if (ceilingUoms.includes(pricingUom)) {
              pricingUomQty = getCeilQuantityThreeDecimals(invQtyForPricing * pricingUomConversion);
            } else {
              pricingUomQty = getRoundedQuantityTwoDecimals(invQtyForPricing * pricingUomConversion);
            }
          } else {
            const pricingUomConversion = getDecimalsForUom(factor.alternateUomConversionUnit);
            if (ceilingUoms.includes(pricingUom)) {
              pricingUomQty = getCeilQuantityThreeDecimals(invQtyForPricing / pricingUomConversion);
            } else {
              pricingUomQty = getRoundedQuantityTwoDecimals(invQtyForPricing / pricingUomConversion);
            }
          }
          break;
        }
      }
    }
   
     if (userRequestedUOM && pricingUom && inventoryUom && pricingUom === userRequestedUOM && inventoryUom === userRequestedUOM && this.erpProductCategory === 'B' && (this.productType === 'SOFTSURFACE' || this.productType === 'SoftSurface')) {
      inventoryUomQty = getCeilQuantity(inventoryUomQty);
      pricingUomQty = getCeilQuantity(pricingUomQty);
      for (const factor of conversionFactors) {
        if (factor.alternateUom.code === 'LF') {

          const inventoryUomConversion = getDecimalsForUom(factor.alternateUomConversionUnit);
          if (ceilingUoms.includes(inventoryUom)) {
            inventoryUomQty = getCeilQuantityThreeDecimals(userRequestedQuantity / inventoryUomConversion);
             const wholeFeet = Math.floor(inventoryUomQty);                                                        
            const inches = Math.round((inventoryUomQty - wholeFeet) * 12);                                        
            if (inches > 0) {                                                  
               const inchesStr = inches < 10 ? '0' + inches : inches == 10 ? inches +"0" :'' + inches;
                inventoryUomQty = parseFloat(wholeFeet + "." + inchesStr);       
              }  
          } else {
           inventoryUomQty = getRoundedQuantityTwoDecimals(userRequestedQuantity / inventoryUomConversion);  
            const wholeFeet = Math.floor(inventoryUomQty);                                                        
            const inches = Math.round((inventoryUomQty - wholeFeet) * 12);                                        
             if (inches > 0) {                                                  
                const inchesStr = inches < 10 ? '0' + inches : inches == 10 ? inches +"0" :'' + inches;
                inventoryUomQty = parseFloat(wholeFeet + "." + inchesStr);       
              }  
          }
          break;
        }
      }

     }

    this.inventoryUomQty = inventoryUomQty;
    this.fullInventoryUomQty = fullInventoryUomQty;
    this.pricingUomQty = pricingUomQty;
    if(userRequestedUOM && userRequestedUOM !== inventoryUom){

      if(this.feetyardForm?.value?.unit == "YDK"){
       this.requestedYdkQty = this.feetyardForm?.value.feet;
      } else {
        this.requestedYdkQty = pricingUomQty;
      }
      this.requestedQty = inventoryUomQty;
      this.convertPdpInvUOMValue = inventoryUomQty;
      if (this.inputUOM === "YDK") {
          let ydkRate = this.pdpUomConversionRate?.find(
            (rate: any) => rate.alternateUom.code === "YDK"
          );
          let invRate = this.pdpUomConversionRate?.find(
            (rate: any) => rate.alternateUom.code !== "YDK"
          );
          if (ydkRate?.alternateUomConversionUnit && invRate?.alternateUomConversionUnit) {
            let sqYdPerUnit = invRate.alternateUomConversionUnit / ydkRate.alternateUomConversionUnit;
            this.pdpConvUnit = (sqYdPerUnit * this.requestedQty).toFixed(2) + " " + "Square Yard";
          } else {
            this.pdpConvUnit = "";
          }
        }
         if (this.inputUOM === "FTK") {
          let ftkRate = this.pdpUomConversionRate?.find(
            (rate: any) => rate.alternateUom.code === "FTK"
          );
          let invRate = this.pdpUomConversionRate?.find(
            (rate: any) => rate.alternateUom.code !== "FTK"
          );
          if (ftkRate?.alternateUomConversionUnit && invRate?.alternateUomConversionUnit) {
            let sqFtPerUnit = invRate.alternateUomConversionUnit / ftkRate.alternateUomConversionUnit;
            this.pdpConvUnit = (sqFtPerUnit * this.requestedQty).toFixed(2) + " " + "Square Foot";
          } else {
            this.pdpConvUnit = "";
          }
        }
      return `${inventoryUomQty} ${this.uomCodeToUomName(inventoryUom)}`;
    }
    else if(userRequestedUOM && userRequestedUOM !== pricingUom){
        if(this.feetyardForm?.value?.unit == "YDK"){
       this.requestedYdkQty = this.feetyardForm?.value.feet;
      } else {
        this.requestedYdkQty = inventoryUomQty;
      }
      this.requestedQty = inventoryUomQty;
      this.convertPdpInvUOMValue = inventoryUomQty;
      if (this.inputUOM === "YDK") {
          let ydkRate = this.pdpUomConversionRate?.find(
            (rate: any) => rate.alternateUom.code === "YDK"
          );
          let invRate = this.pdpUomConversionRate?.find(
            (rate: any) => rate.alternateUom.code !== "YDK"
          );
          if (ydkRate?.alternateUomConversionUnit && invRate?.alternateUomConversionUnit) {
            let sqYdPerUnit = invRate.alternateUomConversionUnit / ydkRate.alternateUomConversionUnit;
            this.pdpConvUnit = (sqYdPerUnit * this.requestedQty).toFixed(2) + " " + "Square Yard";
          } else {
            this.pdpConvUnit = "";
          }
        }
         if (this.inputUOM === "FTK") {
          let ftkRate = this.pdpUomConversionRate?.find(
            (rate: any) => rate.alternateUom.code === "FTK"
          );
          let invRate = this.pdpUomConversionRate?.find(
            (rate: any) => rate.alternateUom.code !== "FTK"
          );
          if (ftkRate?.alternateUomConversionUnit && invRate?.alternateUomConversionUnit) {
            let sqFtPerUnit = invRate.alternateUomConversionUnit / ftkRate.alternateUomConversionUnit;
            this.pdpConvUnit = (sqFtPerUnit * this.requestedQty).toFixed(2) + " " + "Square Foot";
          } else {
            this.pdpConvUnit = "";
          }
        }
      return `${pricingUomQty} ${this.uomCodeToUomName(pricingUom)}`;
    }
    else if(userRequestedUOM && pricingUom && inventoryUom && pricingUom === userRequestedUOM && inventoryUom === userRequestedUOM && this.erpProductCategory === 'B' && (this.productType === 'SOFTSURFACE' || this.productType === 'SoftSurface')){
        if(this.feetyardForm?.value?.unit == "YDK"){
       this.requestedYdkQty = this.feetyardForm?.value.feet;
       this.requestedQty = inventoryUomQty;
       this.convertPdpInvUOMValue = inventoryUomQty;
      } else {
        this.requestedYdkQty = inventoryUomQty;
        this.requestedQty = inventoryUomQty;
        this.convertPdpInvUOMValue = inventoryUomQty;
      }
      if (this.inputUOM === "YDK") {
          let ydkRate = this.pdpUomConversionRate?.find(
            (rate: any) => rate.alternateUom.code === "YDK"
          );
          let invRate = this.pdpUomConversionRate?.find(
            (rate: any) => rate.alternateUom.code !== "YDK"
          );
          if (ydkRate?.alternateUomConversionUnit && invRate?.alternateUomConversionUnit) {
            let sqYdPerUnit = invRate.alternateUomConversionUnit / ydkRate.alternateUomConversionUnit;
            this.pdpConvUnit = (sqYdPerUnit * this.requestedQty).toFixed(2) + " " + "Square Yard";
          } else {
            this.pdpConvUnit = "";
          }
        }
         if (this.inputUOM === "FTK") {
          let ftkRate = this.pdpUomConversionRate?.find(
            (rate: any) => rate.alternateUom.code === "FTK"
          );
          let invRate = this.pdpUomConversionRate?.find(
            (rate: any) => rate.alternateUom.code !== "FTK"
          );
          if (ftkRate?.alternateUomConversionUnit && invRate?.alternateUomConversionUnit) {
            let sqFtPerUnit = invRate.alternateUomConversionUnit / ftkRate.alternateUomConversionUnit;
            this.pdpConvUnit = (sqFtPerUnit * this.requestedQty).toFixed(2) + " " + "Square Foot";
          } else {
            this.pdpConvUnit = "";
          }
        }

        return `${inventoryUomQty} Linear FT`;
    }
    else{
        if(this.feetyardForm?.value?.unit == "YDK"){
       this.requestedYdkQty = this.feetyardForm?.value.feet;
       this.convertPdpInvUOMValue = inventoryUomQty;
       this.requestedQty = inventoryUomQty; 
      } else {
        this.requestedYdkQty = inventoryUomQty;
        this.convertPdpInvUOMValue    = inventoryUomQty;
        this.requestedQty = inventoryUomQty;  
      }
       if (this.inputUOM === "YDK") {
          let ydkRate = this.pdpUomConversionRate?.find(
            (rate: any) => rate.alternateUom.code === "YDK"
          );
          let invRate = this.pdpUomConversionRate?.find(
            (rate: any) => rate.alternateUom.code !== "YDK"
          );
          if (ydkRate?.alternateUomConversionUnit && invRate?.alternateUomConversionUnit) {
            let sqYdPerUnit = invRate.alternateUomConversionUnit / ydkRate.alternateUomConversionUnit;
            this.pdpConvUnit = (sqYdPerUnit * this.requestedQty).toFixed(2) + " " + "Square Yard";
          } else {
            this.pdpConvUnit = "";
          }
        }
         if (this.inputUOM === "FTK") {
          let ftkRate = this.pdpUomConversionRate?.find(
            (rate: any) => rate.alternateUom.code === "FTK"
          );
          let invRate = this.pdpUomConversionRate?.find(
            (rate: any) => rate.alternateUom.code !== "FTK"
          );
          if (ftkRate?.alternateUomConversionUnit && invRate?.alternateUomConversionUnit) {
            let sqFtPerUnit = invRate.alternateUomConversionUnit / ftkRate.alternateUomConversionUnit;
            this.pdpConvUnit = (sqFtPerUnit * this.requestedQty).toFixed(2) + " " + "Square Foot";
          } else {
            this.pdpConvUnit = "";
          }
        }
       return `${inventoryUomQty} ${this.uomCodeToUomName(inventoryUom)}`;
    }

    
    
  }


  uomCodeToUomName(uomCode: string): string {
    const uom = this.pdpUomConversionRate?.find(
      (element: any) => element.alternateUom.code === uomCode
    );
    return uom ? uom.alternateUom.name : uomCode;
  } 
  sqYardsToLinear(val: any) {
    val = (Math.round(val * 100) / 100).toFixed(2);
    if (JSON.stringify(val)?.includes(".")) {
      let k: any = val.split(".");
      let temp = k[1];

      k[1] = (temp * 12) / Math.pow(10, 2);

      if (Math.round(k[1]) === 12) {
        let t = k[0];
        k[0] = parseInt(t) + 1;
        k[1] = 0;
      }
      val = `${k[0]} ft. ${Math.round(k[1])} in. Linear Feet`;
    } else {
      val = `${val} ft. Linear Feet`;
    }
    return val;
  }
  // roundValue(value: any) {
  //   if(this.feetyardForm?.value?.unit === "ZCT" || this.feetyardForm?.value?.unit === "RO"){

  //   let result = Math.ceil(value * 100) / 100;
  //   return result;
  //   }
  //   else{
  //     return value;
  //   }
  // }
  roundToHundredth(value: any) {
    return Number(value.toFixed(2));
  }
  validateQuantity() {
    let isValid = true;
    this.isMultiCutValid = false;
    for (let i = 0; i < this.formData.length; i++) {
      const feetControl = this.formData.at(i).get("feet");
      const inchesControl = this.formData.at(i).get("inches");

      const feetValue = feetControl?.value || 0;
      const inchesValue = inchesControl?.value || 0;

      const sumValue = parseInt(inchesValue) / 12 + parseInt(feetValue);

      if (
        sumValue >
        Number(this.uomDetails?.standardRollLength?.replaceAll(",", "")) / 2
      ) {
        isValid = false;
        break;
      }
    }

    this.enableCheckAvailability = isValid;
    this.multiCutFlag = !isValid;
    this.isQuantityValid = isValid;
  }

  validateNo(e: any, maxLength = 13) {
    const charCode = e.which ? e.which : e.keyCode;
    if (
      (charCode > 31 && (charCode < 48 || charCode > 57)) ||
      e.target.value.length == maxLength
    ) {
      return false;
    }
    return true;
  }
  replacementRadioChange(val: boolean) {
    this.replacementOrderModalForm.controls["replacementOrder"].setValue(val);
    for (let key in this.replacementOrderModalForm.controls) {
      if (key !== "replacementOrder") {
        this.replacementOrderModalForm.controls[key].setValue(null);
      }
    }
  }
  hasClaimSubmittedRadioChange(val: boolean) {
    this.replacementOrderModalForm.controls["hasClaimSubmitted"].setValue(val);
    for (let key in this.replacementOrderModalForm.controls) {
      if (key !== "replacementOrder" && key !== "hasClaimSubmitted") {
        key != "replacementReason"
          ? this.replacementOrderModalForm.controls[key].setValue("")
          : this.replacementOrderModalForm.controls[key].setValue(null);
      }
    }
    // if (val == true) {
    //   this.replacementOrderModalForm.controls["Claim"].setValidators(
    //     Validators.required
    //   );
    //   this.replacementOrderModalForm.controls["Claim"].updateValueAndValidity();
    //   this.replacementOrderModalForm.controls["Claim"].markAsPristine();

    //   this.replacementOrderModalForm.controls["Claim"].markAsUntouched();
    // } else {
    //   this.replacementOrderModalForm.controls["Claim"].clearValidators();
    //   this.replacementOrderModalForm.controls["Claim"].updateValueAndValidity();
    // }
  }
  validatePO(e: any) {
    return /^[a-z0-9 !@#-]$/i.test(e.key);
  }
  resetReplacementOrderModalForm() {
    this.replacementOrderModalForm.setValue({
      hasClaimSubmitted: null,
      replacementOrder: null,
      Claim: "",
      replacementReason: null,
      PO: "",
      Order: "",
      Invoice: "",
      Roll: "",
    });
  }
  navigateToCart() {
    this.modalService.hide();
    this.router.navigateByUrl("/commercial/cart");
    this.resetReplacementOrderModalForm();
  }

  orderSampleHandler() {
    if (
      this.storageService.cartData == undefined ||
      this.storageService.cartData == "" ||
      this.storageService.cartData.hasOwnProperty("errorMessage") ||
      this.storageService.cartData?.totalItems == 0
    ) {
      this.openChooseAddressModal(
        {},
        null,
        null,
        this.feetyardForm.value,
        false,
        true
      );
    } else {
      const initialState: ModalOptions = {
        initialState: {
          // Data to  popup
          productColorVariantOptions: this.pdbData?.productColorVariantOptions,
          feetyardForm: this.feetyardForm.value,
           originProductType:this.pdbData?.productType,
          originSubProductType:this.pdbData?.subProductType,
          productCode: this.productCode,
        },
      };
      this.bsModalRef = this.modalService.show(
        PlpOrderSamplesComponent,
        Object.assign(initialState, {
          id: "PlpOrderSamplesComponent",
          class: "modal-xl modal-dialog-centered",
          backdrop: "static",
          keyboard: false,
        })
      );
      this.bsModalRef.content.cartIdNew = this.storageService.cartData?.code;
    }
  }

  manageFullSpecificatons(productType: any, subProductType: any, pdbData: any) {
    let specifications = this.fullSpecificationsConst[productType];

    if (specifications?.length > 0) {
      let specificationsData = specifications.find(
        (items: any, index: number) => {
          if (items.productType === subProductType) {
            return items;
          }
        }
      );
      let specificationsDataNew = specificationsData?.specifications || [];

      let specificationsArray: any = [];
      specificationsDataNew.map((item: any) => {
        let value =
          item.value != ""
            ? pdbData[item.value] != undefined
              ? pdbData[item.value]
              : "NA"
            : "NA";

        specificationsArray.push({
          name: item.name,
          value: value,
        });
      });

      this.fullSpecificationsConstWidgets = specificationsArray;

      let performanceSustainabilityNew =
        specificationsData?.sustainability || [];
      let performanceSustainabilityArray: any = [];
      performanceSustainabilityNew.map((item: any) => {
        let value =
          item.value != ""
            ? pdbData[item.value] != undefined
              ? pdbData[item.value]
              : "NA"
            : "NA";
        performanceSustainabilityArray.push({
          name: item.name,
          value: value,
        });
      });
      this.fullPerformanceSustainabilityConstWidgets =
        performanceSustainabilityArray;

      let fullDesignConstWidgetsNew =
        specificationsData?.designPerformance || [];
      let fullDesignConstWidgetsArray: any = [];
      fullDesignConstWidgetsNew.map((item: any) => {
        let value =
          item.value != ""
            ? pdbData[item.value] != undefined
              ? this.convertTitleCase(pdbData[item.value])
              : "NA"
            : "NA";
        fullDesignConstWidgetsArray.push({
          name: item.name,
          value:
            item.name === "Total Weight" ||
            item.name === "Certified Pile Weight"
              ? value + " oz"
              : value,
        });
      });
      this.fullDesignConstWidgets = fullDesignConstWidgetsArray;

      let fullWeighsConstWidgetsNew = specificationsData?.weighsMeasures || [];
      let fullWeighsConstWidgetsArray: any = [];
      fullWeighsConstWidgetsNew.map((item: any) => {
        let value =
          item.value != ""
            ? pdbData[item.value] != undefined
              ? this.convertTitleCase(pdbData[item.value])
              : "NA"
            : "NA";
        fullWeighsConstWidgetsArray.push({
          name: item.name,
          value: value,
        });
      });
      this.fullWeighsMeasureConstWidgets = fullWeighsConstWidgetsArray;
    }
  }

  manageFullUAMRecords(productType: any, subProductType: any, uomDetails: any) {
    let specifications = this.fullSpecificationsConst[productType];
    if (specifications?.length > 0) {
      let specificationsData = specifications.find(
        (items: any, index: number) => {
          if (items.productType == subProductType) {
            return items;
          }
        }
      );
      let fullWeighsMeasureConstWidgetsNew =
        specificationsData?.weighsMeasures || [];
      let fullWeighsMeasureConstWidgetsArray: any = [];
      fullWeighsMeasureConstWidgetsNew.map((item: any) => {
        let value =
          item.value != ""
            ? this.pdbData[item.value] != undefined
              ? this.convertTitleCase(this.pdbData[item.value])
              : "NA"
            : "NA";
        fullWeighsMeasureConstWidgetsArray.push({
          name: item.name,
          value: value,
        });
      });
      this.fullWeighsMeasureConstWidgets = fullWeighsMeasureConstWidgetsArray;
    }
  }
  getCrossOver(productCode: any) {
    this.productService.hasCrossOver(productCode).subscribe((res: any) => {
      this.setLoadAPI("hasCrossOvers");
      this.crossOverCheck = res.body;
      if (!this.crossOverCheck) {
        this.setLoadAPI("getCrossOver");
      }
      this.allDetailCrossOver();
    }, () => {
      this.setLoadAPI("hasCrossOvers");
      this.setLoadAPI("getCrossOver");
    });
  }
  allDetailCrossOver() {
    if (this.crossOverCheck) {
      this.productService
        .getcrossOver(this.productCode)
        .subscribe((res: any) => {
          this.setLoadAPI("getCrossOver");
          this.crossoverData = res.body;
          const references = this.crossoverData.accessoryTypes[0]?.value.references || [];
          this.crossoverProducts = [...references];
           this.crossoverProducts.forEach((product, index) => {
            this.crossoverProducts[index].productImage = 
              product?.colorImgURL || 
              "https://s7d4.scene7.com/is/image/MohawkResidential/missing";
            this.crossoverProducts[index].productImageAlt = product?.colorName || "Product Image";
          });
          
          // Keep the first one for backward compatibility
          this.completedata = references.length > 0 ? references[0] : {};
          if (this.completedata) {
            this.completedata.productImage = 
              this.completedata?.colorImgURL || 
              "https://s7d4.scene7.com/is/image/MohawkResidential/missing";
            this.completedata.productImageAlt = this.completedata?.colorName || "Product Image";
          }
        }, () => {
          this.setLoadAPI("getCrossOver");
        });
    }
  }
  transformKey(key: any) {
    return key.replace(/([A-Z])/g, " $1").replace(/^./, function (str: any) {
      return str.toUpperCase();
    });
  }
  openCrossModal(template3: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template3, {
      id: "crossOverModal",
      class: "modal-lg modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }
  crossOverItemClick() {
    this.modalService.hide("crossOverModal");
    this.router.navigateByUrl("/", { skipLocationChange: false }).then(() => {
      this.router.navigateByUrl(
        "commercial/products/details/" + this.completedata.code
      );
      // this.getCrossOver(this.completedata.code);
    });
  }
  closeChangeShippingOptionModal() {
    this.originalDefaultSM = this.originalDefaultShippingMethod;
    this.modalService.hide("changeShippingOptionsModal");
  }

  closeShippingOptionsModalModal() {
    // this.modalRef.hide();
    this.modalService.hide("shippingOptionsModal");
  }

  modalRefs: BsModalRef[] = [];
  closeModal(modalId?: number) {
    const ids: number[] = this.modalService["loaders"].map(
      (l: any) => l.instance.id
    );
    for (const id of ids) {
      this.modalService.hide(id);
    }
  }

  showValidationError: boolean = false;
  validationErrorMessage: any;
  shippingInfoMessage: any;
  minicartSubscriptionForChange: any;
  shippingOptionChanged: any;

  validateShipViaAddress(type: any) {
    this.shippingOptionChanged = type;

    // this.spinnerLoading = true;
    // console.log(
    //   "this.shipViaSelectedOption",
    //   this.shipViaSelectedOption,
    //   this.incoTermsLoc2SelectedOption
    // );
    let shipViaSelectedOption =
      this.shipViaSelectedOption || this.defaultShippingMethod || this.shippingAddress?.defaultShippingMethod;
    let incoTermsLoc2SelectedOption = 
      this.incoTermsLoc2SelectedOption?.value ||
      this.incoTermsLoc2SelectedOption ||
      this.defaultShipVia ||
      this.shippingAddress?.defaultShipVia;
    let incoTermsSelectedOption =
      this.incoTermsSelectedOption ||
      this.defaultIncoTerms ||
      this.shippingAddress?.defaultIncoTerms;
    let shippingWareHouseSelectedOption =
      this.shippingWareHouseSelectedOption || this.defaultShippingWarehouse  || this.shippingAddress?.defaultShippingWarehouse;
      incoTermsLoc2SelectedOption = typeof incoTermsLoc2SelectedOption == "object" ? incoTermsLoc2SelectedOption?.label.toUpperCase(): incoTermsLoc2SelectedOption;
   // incoTermsLoc2SelectedOption = incoTermsLoc2SelectedOption ? incoTermsLoc2SelectedOption?.toUpperCase() : incoTermsLoc2SelectedOption;
    if(!this.userInfo?.isCustomer && !this.userInfo?.isSalesPerson  && !this.userInfo?.isSalesOps){
      this.orderService
      .validateShippingOptions(
        shippingWareHouseSelectedOption,
        this.erpProductCategory,
        incoTermsLoc2SelectedOption
      )
      .subscribe({
        next: (res) => {
          if (res.body?.status === "success") {
            this.orderService
              .validateShipVia(
                shipViaSelectedOption,
                incoTermsLoc2SelectedOption
              )
              .subscribe({
                next: (resp) => {
                  if (resp.body.status === "success") {
                    if (type == "chooseSolution") {
                      this.spinnerLoading = true;
                      this.minicartSubscriptionForChange = this.storageService
                        .getItem("miniCartCount")
                        .subscribe((res: any) => {
                        
                          this.minicartSubscriptionForChange.unsubscribe();
                          if (
                            res == undefined ||
                            res == "" ||
                            res.hasOwnProperty("errorMessage") ||
                            res?.totalItems == 0
                          ) {
                            this.spinnerLoading = false;
                            this.populateShippingOptions();
                            this.closeShippingOptionsModalModal();
                            this.onShippingOptionSubmit();
                          } else {
                            this.spinnerLoading = true;
                            this.productService
                              .getCartData(res.code)
                              .subscribe({
                                next: (result) => {
                                  this.spinnerLoading = false;
                              
                                  let rdd = result?.body?.requestedDeliveryDate ? result?.body?.requestedDeliveryDate : new Date();
                                  rdd = (rdd != "See line details." ? rdd : this.datePipe.transform(new Date(), "MM/dd/YYYY"));
                                  this.shippingAddress = { ...this.shippingAddress, rdd: rdd, requestedDeliveryDate: rdd };
                                  this.storageService.setItem("shipping-address", this.shippingAddress);
                                  this.storageService.setItem("shippingAddress", this.shippingAddress);                      
                                  let defaultIncoTerms = result.body.incoTerms;
                                  let defaultIncoTermsDesc =
                                    result.body.incoTermsDesc;
                                  let defaultShipVia = result.body.shipVia;
                                  let defaultShippingMethod =
                                    result.body.shippingConditions;
                                  let defaultShippingWarehouse =
                                    result.body.shippingWarehouse;
                                  let defaultShippingWarehouseDesc =
                                    result.body.shippingWarehouseDesc;
                                  let shippingConditionDesc =
                                    result.body.shippingConditionDesc;
                                  let defaultShippingMethodDesc =
                                    result.body.shippingConditionDesc;
                                    if(result.body.shipComplete === false){
                                      this.spinnerLoading = false;
                                      this.populateShippingOptions();
                                      this.closeShippingOptionsModalModal();
                                      this.onShippingOptionSubmit();
                                     
                                    }else
                                  if (
                                    (defaultIncoTerms ==
                                      this.incoTermsSelectedOption &&
                                    defaultShipVia ==
                                      this.incoTermsLoc2SelectedOption &&
                                    defaultShippingMethod ==
                                      this.shipViaSelectedOption &&
                                    defaultShippingWarehouse ==
                                      this.shippingWareHouseSelectedOption) ||(result.shipComplete === false)
                                  ) {
                                    this.spinnerLoading = false;
                                    this.populateShippingOptions();
                                    this.closeShippingOptionsModalModal();
                                    this.onShippingOptionSubmit();
                                  } else {
                                    this.modalService.hide("shippingOptionsModal");
                                    this.shippingInfoMessage =
                                      "Selected Shipping options are different from the items in your cart. Do you want to continue?";
                                    // else{
                                    // this.shippingInfoMessage="Saving this changes will impact your cart. Do you want to continue?"}

                                    this.modalRef = this.modalService.show(
                                      this.changeDeliveryType,
                                      {
                                        id: "changeDeliveryType",
                                        class: "modal-lg modal-dialog-centered",
                                        backdrop: "static",
                                        keyboard: false,
                                      }
                                    );
                                  }
                                },
                                error: (err) => {
                                  this.spinnerLoading = false;
                                },
                              });

                            // this.openCrossModal(this.shippingOption)
                          }
                        });
                    }

                    if (type == "changeShippingOption") {
                      this.spinnerLoading = true;
                      this.minicartSubscriptionForChange = this.storageService
                        .getItem("miniCartCount")
                        .subscribe((res: any) => {
                          this.minicartSubscriptionForChange.unsubscribe();
                          if (
                            res == undefined ||
                            res == "" ||
                            res.hasOwnProperty("errorMessage") ||
                            res?.totalItems == 0
                          ) {
                            this.populateShippingOptions();
                            this.shippingOptionModalSubmit();
                          } else {
                            this.spinnerLoading = true;
                            this.productService
                              .getCartData(res.code)
                              .subscribe({
                                next: (result) => {
                                  this.spinnerLoading = false;
                                  let rdd = result?.body?.requestedDeliveryDate ? result?.body?.requestedDeliveryDate : new Date();
                                  rdd = (rdd != "See line details." ? rdd : this.datePipe.transform(new Date(), "MM/dd/YYYY"));
                                  this.shippingAddress = { ...this.shippingAddress, rdd: rdd, requestedDeliveryDate: rdd };
                                  this.storageService.setItem("shipping-address", this.shippingAddress);
                                  this.storageService.setItem("shippingAddress", this.shippingAddress);                      
                         
                                  let defaultIncoTerms = result.body.incoTerms;
                                  let defaultIncoTermsDesc =
                                    result.body.incoTermsDesc;
                                  let defaultShipVia = result.body.shipVia;
                                  let defaultShippingMethod =
                                    result.body.shippingConditions;
                                  let defaultShippingWarehouse =
                                    result.body.shippingWarehouse;
                                  let defaultShippingWarehouseDesc =
                                    result.body.shippingWarehouseDesc;
                                  let shippingConditionDesc =
                                    result.body.shippingConditionDesc;
                                  let defaultShippingMethodDesc =
                                    result.body.shippingConditionDesc;
                                    if(result.body.shipComplete === false){
                                      this.spinnerLoading = false;
                                      this.populateShippingOptions();
                                      this.closeShippingOptionsModalModal();
                                      this.onShippingOptionSubmit();
                                     
                                    }else
                                  if (
                                    (defaultIncoTerms ==
                                      this.incoTermsSelectedOption &&
                                    defaultShipVia ==
                                      this.incoTermsLoc2SelectedOption &&
                                    defaultShippingMethod ==
                                      this.shipViaSelectedOption &&
                                    defaultShippingWarehouse ==
                                      this.shippingWareHouseSelectedOption) ||(result.shipComplete === false)
                                  ) {
                                    this.spinnerLoading = false;
                                    this.populateShippingOptions();
                                    this.shippingOptionModalSubmit();
                                  } else {
                                    if (result.body.shipComplete) {
                                      this.shippingInfoMessage =
                                        "Saving this changes will change " +
                                        "Ship Complete order" +
                                        " to " +
                                        "Ship Order Based on Availability" +
                                        " in your cart. Do you want to continue?";
                                      // else{
                                      // this.shippingInfoMessage="Saving this changes will impact your cart. Do you want to continue?"}

                                      this.modalRef = this.modalService.show(
                                        this.changeDeliveryType,
                                        {
                                          id: "changeDeliveryType",
                                          class:
                                            "modal-lg modal-dialog-centered",
                                          backdrop: "static",
                                          keyboard: false,
                                        }
                                      );
                                    } else {
                                      this.populateShippingOptions();
                                      this.shippingOptionModalSubmit();
                                    }
                                  }
                                },
                                error: (err) => {
                                  this.spinnerLoading = false;
                                },
                              });
                            // this.openCrossModal(this.shippingOption)
                          }
                        });
                    }
                  } else if (res.body?.status === "error") {
                    this.spinnerLoading = false;
                    this.showValidationError = true;
                    this.validationErrorMessage = resp.body.message;
                    // this.openModalError(res.body?.message);
                    // Handle error
                  }
                },
                error: (err) => {},
              });
          } else if (res.body?.status === "error") {
            this.spinnerLoading = false;
            this.productService.progressHide();
            this.showValidationError = true;
            this.validationErrorMessage = res.body?.message;
            // this.openModalError(res.body?.message);
            // Handle error
          }
        },
        error: (err) => { this.productService.progressHide();},
      });
    }else{
      this.originalDefaultShippingMethod = this.originalDefaultSM;
      this.shippingAddress.originalDefaultShippingMethod = this.originalDefaultShippingMethod;
      if (type == "chooseSolution") {
        this.spinnerLoading = true;
        this.minicartSubscriptionForChange = this.storageService
          .getItem("miniCartCount")
          .subscribe((res: any) => {
            // console.log("res is ------>", res);
            this.minicartSubscriptionForChange.unsubscribe();
            if (
              res == undefined ||
              res == "" ||
              res.hasOwnProperty("errorMessage") ||
              res?.totalItems == 0
            ) {
              this.spinnerLoading = false;
              this.populateShippingOptions();
              this.closeShippingOptionsModalModal();
              this.onShippingOptionSubmit();
            } else {
              this.spinnerLoading = true;
              this.productService
                .getCartData(res.code)
                .subscribe({
                  next: (result) => {
                    this.spinnerLoading = false;
                    let rdd = result?.body?.requestedDeliveryDate ? result?.body?.requestedDeliveryDate : new Date();
                    rdd = (rdd != "See line details." ? rdd : this.datePipe.transform(new Date(), "MM/dd/YYYY"));
                    this.shippingAddress = { ...this.shippingAddress, rdd: rdd, requestedDeliveryDate: rdd };
                    this.storageService.setItem("shipping-address", this.shippingAddress);
                    this.storageService.setItem("shippingAddress", this.shippingAddress);
               
                    let defaultIncoTerms = result.body.incoTerms;
                    let defaultIncoTermsDesc =
                      result.body.incoTermsDesc;
                    let defaultShipVia = result.body.shipVia;
                    let defaultShippingMethod =
                      result.body.shippingConditions;
                    let defaultShippingWarehouse =
                      result.body.shippingWarehouse;
                    let defaultShippingWarehouseDesc =
                      result.body.shippingWarehouseDesc;
                    let shippingConditionDesc =
                      result.body.shippingConditionDesc;
                    let defaultShippingMethodDesc =
                      result.body.shippingConditionDesc;
                      if(result.body.shipComplete === false){
                        this.spinnerLoading = false;
                        this.populateShippingOptions();
                        this.closeShippingOptionsModalModal();
                        this.onShippingOptionSubmit();
                       
                      }else
                    if (
                      (defaultIncoTerms ==
                        this.incoTermsSelectedOption &&
                      defaultShipVia ==
                        (typeof this.incoTermsLoc2SelectedOption == 'object' ? this.incoTermsLoc2SelectedOption?.label.toUpperCase() :  this.incoTermsLoc2SelectedOption.toUpperCase()) &&
                      defaultShippingMethod ==
                        this.shipViaSelectedOption &&
                      defaultShippingWarehouse ==
                        this.shippingWareHouseSelectedOption) ||(result.shipComplete === false)
                    ) {
                      this.spinnerLoading = false;
                      this.populateShippingOptions();
                      this.closeShippingOptionsModalModal();
                      this.onShippingOptionSubmit();
                    } else {
                      this.modalService.hide("shippingOptionsModal");
                      this.shippingInfoMessage =
                        "Selected Shipping options are different from the items in your cart. Do you want to continue?";
                      // else{
                      // this.shippingInfoMessage="Saving this changes will impact your cart. Do you want to continue?"}

                      this.modalRef = this.modalService.show(
                        this.changeDeliveryType,
                        {
                          id: "changeDeliveryType",
                          class:
                            "modal-lg modal-dialog-centered",
                          backdrop: "static",
                          keyboard: false,
                        }
                      );
                    }
                  },
                  error: (err) => {
                    this.productService.progressHide();
                    this.spinnerLoading = false;
                  },
                });

              // this.openCrossModal(this.shippingOption)
            }
          });
      }
      if (type == "changeShippingOption") {
        this.spinnerLoading = true;
        this.minicartSubscriptionForChange = this.storageService
          .getItem("miniCartCount")
          .subscribe((res: any) => {

            this.minicartSubscriptionForChange.unsubscribe();
            if (
              res == undefined ||
              res == "" ||
              res.hasOwnProperty("errorMessage") ||
              res?.totalItems == 0
            ) {
              this.populateShippingOptions();
              this.shippingOptionModalSubmit();
            } else {
              this.spinnerLoading = true;
              this.productService
                .getCartData(res.code)
                .subscribe({
                  next: (result) => {
                    this.spinnerLoading = false;
                    let rdd = res?.body?.requestedDeliveryDate ? res?.body?.requestedDeliveryDate : new Date();
                    rdd = (rdd != "See line details." ? rdd : this.datePipe.transform(new Date(), "MM/dd/YYYY"));
                    this.shippingAddress = { ...this.shippingAddress, rdd: rdd, requestedDeliveryDate: rdd };
                    this.storageService.setItem("shipping-address", this.shippingAddress);
                    this.storageService.setItem("shippingAddress", this.shippingAddress);
                    let defaultIncoTerms = result.body.incoTerms;
                    let defaultIncoTermsDesc =
                      result.body.incoTermsDesc;
                    let defaultShipVia = result.body.shipVia;
                    let defaultShippingMethod =
                      result.body.shippingConditions;
                    let defaultShippingWarehouse =
                      result.body.shippingWarehouse;
                    let defaultShippingWarehouseDesc =
                      result.body.shippingWarehouseDesc;
                    let shippingConditionDesc =
                      result.body.shippingConditionDesc;
                    let defaultShippingMethodDesc =
                      result.body.shippingConditionDesc;
                      if(result.body.shipComplete === false){
                        this.spinnerLoading = false;
                        this.populateShippingOptions();
                        this.closeShippingOptionsModalModal();
                        this.shippingOptionModalSubmit();
                       
                      }else
                    if (
                      (defaultIncoTerms ==
                        this.incoTermsSelectedOption &&
                      defaultShipVia ==
                        (typeof this.incoTermsLoc2SelectedOption == 'object' ? this.incoTermsLoc2SelectedOption?.label.toUpperCase() :  this.incoTermsLoc2SelectedOption.toUpperCase()) &&
                      defaultShippingMethod ==
                        this.shipViaSelectedOption &&
                      defaultShippingWarehouse ==
                        this.shippingWareHouseSelectedOption) ||(result.shipComplete === false)
                    ) {
                      this.spinnerLoading = false;
                      this.populateShippingOptions();
                      this.shippingOptionModalSubmit();
                    } else {
                      if (result.body.shipComplete) {
                        this.shippingInfoMessage =
                          "Saving this changes will change " +
                          "Ship Complete order" +
                          " to " +
                          "Ship Order Based on Availability" +
                          " in your cart. Do you want to continue?";
                        // else{
                        // this.shippingInfoMessage="Saving this changes will impact your cart. Do you want to continue?"}

                        this.modalRef = this.modalService.show(
                          this.changeDeliveryType,
                          {
                            id: "changeDeliveryType",
                            class:
                              "modal-lg modal-dialog-centered",
                            backdrop: "static",
                            keyboard: false,
                          }
                        );
                      } else {
                        this.populateShippingOptions();
                        this.shippingOptionModalSubmit();
                      }
                    }
                  },
                  error: (err) => {
                    this.productService.progressHide();
                    this.spinnerLoading = false;
                  },
                });

              // this.openCrossModal(this.shippingOption)
            }
          });
      }
      // if (type == "chooseSolution") {
      //   this.populateShippingOptions();
      //   this.closeShippingOptionsModalModal();
      //   this.onShippingOptionSubmit();
      // }
      // if (type == "changeShippingOption") {
      //   this.populateShippingOptions();
      //   this.shippingOptionModalSubmit();
      // }
    }
    
  }

  disableShipVia(){
    if((this.userInfo?.isCustomer || this.userInfo?.isSalesPerson  || this.userInfo?.isSalesOps) 
          && (this.shippingAddress?.isOneTimeShipTo) && this.shipViaSelectedOption == "CA"){
            return false;
    }else if((this.userInfo?.isCustomer || this.userInfo?.isSalesPerson  || this.userInfo?.isSalesOps)){
      return true;
    }else {
      return false;
    }
  }

  continueChanges() {
    if (this.shippingOptionChanged == "chooseSolution") {
      this.modalService.hide("changeDeliveryType");
      this.populateShippingOptions();
      this.closeShippingOptionsModalModal();
      this.onShippingOptionSubmit();
    }
    if (this.shippingOptionChanged == "changeShippingOption") {
      this.submitInfoChanges();
    }
  }
  confirmChanges(){
    this.modalService.hide("changeDeliveryType");
    this.modalService.hide("changeShippingOptionsModal");
    this.populateShippingOptions();
    this.onShippingOptionSubmit();
  }
  populateShippingOptions() {
    let shipViaSelectedOption =
      this.shipViaSelectedOption ||
      this.defaultShippingMethod ||
      this.shippingAddress?.defaultShippingMethod ||
      this.shippingAddress?.defaultShippingCondition;

    let incoTermsLoc2SelectedOption =
      this.incoTermsLoc2SelectedOption?.value ||
      this.incoTermsLoc2SelectedOption ||
      this.defaultShipVia;
    this.shippingAddress?.defaultShipVia;
    let incoTermsSelectedOption =
      this.incoTermsSelectedOption ||
      this.defaultIncoTerms ||
      this.shippingAddress?.defaultIncoTerms;
    let shippingWareHouseSelectedOption =
      this.shippingWareHouseSelectedOption || this.defaultShippingWarehouse;
    this.shippingAddress?.defaultShippingWarehouse;

    const shipViaSelectedOptionValue = this.shipViaOptions.find(
      (item: any) => item.value === shipViaSelectedOption
    );
    this.defaultShippingMethod = this.userInfo?.isCustomer || this.userInfo?.isSalesPerson || this.userInfo?.isSalesOps? this.originalDefaultShippingMethod ||
      shipViaSelectedOption ||
      this.defaultShippingMethod ||
      this.shippingAddress?.defaultShippingMethod ||
      this.shippingAddress?.defaultShippingCondition:shipViaSelectedOption ||
      this.defaultShippingMethod ||
      this.shippingAddress?.defaultShippingMethod ||
      this.shippingAddress?.defaultShippingCondition;

    // this.defaultShippingMethod =
    //   shipViaSelectedOption ||
    //   this.defaultShippingMethod ||
    //   this.shippingAddress?.defaultShippingMethod ||
    //   this.shippingAddress?.defaultShippingCondition;
    this.defaultShippingConditionDesc =
      shipViaSelectedOptionValue?.label ||
      this.defaultShippingConditionDesc ||
      this.shippingAddress?.defaultShippingConditionDesc;
    this.defaultShippingMethodDesc =
      shipViaSelectedOptionValue?.label ||
      this.defaultShippingMethodDesc ||
      this.shippingAddress?.defaultShippingConditionDesc;
    let incoTermSelectedOptionValue = this.incoTermsOptions.find(
      (item: any) => item.value === incoTermsSelectedOption
    );
    this.defaultIncoTermsDesc =
      incoTermSelectedOptionValue?.label ||
      this.defaultIncoTermsDesc ||
      this.shippingAddress?.defaultIncoTermsDesc;
    this.defaultIncoTerms = incoTermsSelectedOption || this.defaultIncoTerms;
    if (
      incoTermSelectedOptionValue === undefined ||
      incoTermSelectedOptionValue === null
    ) {
      incoTermSelectedOptionValue = this.incoTermsOptions.find(
        (item: any) => item.label === incoTermsSelectedOption
      );
      this.defaultIncoTermsDesc =
        incoTermSelectedOptionValue?.label ||
        this.defaultIncoTermsDesc ||
        this.shippingAddress?.defaultIncoTermsDesc;
      this.defaultIncoTerms =
        incoTermSelectedOptionValue?.value ||
        incoTermsSelectedOption ||
        this.defaultIncoTerms;
    }

    const shippingWHSelectedOptionValue = this.shippingWareHouseOptions.find(
      (item: any) => item.value === shippingWareHouseSelectedOption
    );
    this.defaultShippingWarehouseDesc =
      shippingWHSelectedOptionValue?.label ||
      this.defaultShippingWarehouseDesc ||
      this.shippingAddress?.defaultShippingWarehouseDesc;
    this.defaultShippingWarehouse =
      shippingWareHouseSelectedOption || this.defaultShippingWarehouse;
    
    incoTermsLoc2SelectedOption = typeof incoTermsLoc2SelectedOption == "object"
      ? incoTermsLoc2SelectedOption?.label.toUpperCase()
      : incoTermsLoc2SelectedOption;
      
    this.defaultShipVia = incoTermsLoc2SelectedOption || this.defaultShipVia;
    this.shippingAddress.defaultShippingCondition =this.userInfo?.isCustomer || this.userInfo?.isSalesPerson  || this.userInfo?.isSalesOps ? this.originalDefaultShippingMethod :this.defaultShippingMethod;
    this.shippingAddress.defaultShippingMethod = this.userInfo?.isCustomer || this.userInfo?.isSalesPerson  || this.userInfo?.isSalesOps ? this.originalDefaultShippingMethod :this.defaultShippingMethod;
    this.shippingAddress.originalDefaultShippingMethod = this.userInfo?.isCustomer || this.userInfo?.isSalesPerson  || this.userInfo?.isSalesOps ? this.originalDefaultShippingMethod :this.defaultShippingMethod;
    this.shippingAddress.defaultShippingConditionDesc =
      this.defaultShippingConditionDesc;
    this.shippingAddress.defaultShippingMethodDesc =
      this.defaultShippingConditionDesc;

    this.shippingAddress.defaultShippingWarehouseDesc =
      this.defaultShippingWarehouseDesc;
    this.shippingAddress.defaultShippingWarehouse =
      this.defaultShippingWarehouse;

    this.shippingAddress.defaultIncoTerms = this.defaultIncoTerms;
    this.shippingAddress.defaultIncoTermsDesc = this.defaultIncoTermsDesc;

    this.shippingAddress.defaultShipVia = this.defaultShipVia;
  }
  validateShipVia(event: any) {
    this.showValidationError = false;
  }
  shippingOptionModalSubmit() {
    // this.shipViaModalSubmit();
    // this.shippingWareHouseModalSubmit();
    this.closeChangeShippingOptionModal();
    // this.modalService.hide("shippingOptionModal");
  }
  shippingWareHouseSelectedOption: any = "";
  incoTermsLoc2SelectedOption: any = "";
  incoTermsLoc2Options: any = [];

  shipViaSelectedOption: any = "";
  incoTermsSelectedOption: any = "";
  incoTermsOptions: any = [];
  shipViaOptions: any = [];
  shipViaType: string = "";
  shippingWareHouseOptions: any = [];
  shippingWareHouseType: string = "";

  changeShippingWareHouseOptions(event: any) {
    this.shippingWareHouseSelectedOption = event;
    this.getIncoTermsLoc2(event);
  }
  originalDefaultSM:any='';
  changeshipViaOptions(event: any) {
    if (this.userInfo.isCustomer || this.userInfo.isSalesPerson || this.userInfo?.isSalesOps) {
      this.spinnerLoading = false;

      this.shippingWareHouseOptions = [];
      this.shippingWareHouseOptions.push({
        value: this.shippingAddress?.defaultShippingWarehouse,
        label: this.shippingAddress?.defaultShippingWarehouseDesc,
      });
      this.orderService
        .getShippingoptionForCustomers(
          this.shippingAddress.postalCode,
          this.shipViaSelectedOption,
          this.shippingWareHouseSelectedOption,
          this.shippingAddress.isOneTimeShipTo == undefined ? false : this.shippingAddress.isOneTimeShipTo,
          this.uid
        )
        .subscribe({
          next: (res) => {
            this.showValidationError = false;
            if(res?.body?.incoTerms || res?.body?.shipvia){
                this.spinnerLoading = false;
                this.incoTermsOptions = [];
                this.incoTermsLoc2Options = [];
                this.incoTermsOptions.push({
                  value: res.body.incoTerms,
                  label: res.body.incoTermsDesc,
                });
                if(res.body.shipvia){
                  this.incoTermsLoc2Options.push({
                    value: res.body.shipvia,
                    label: res.body.shipvia,
                  });
                }
                this.originalDefaultSM = res.body?.originalDefaultShippingMethod;
                //this.originalShippingMethod = res.body?.originalDefaultShippingMethod;
                this.incoTermsSelectedOption = this.incoTermsOptions[0]?.value;
                this.incoTermsLoc2SelectedOption = res.body.shipvia;

            }
            else{
                  this.spinnerLoading = false;
                  this.showValidationError = true;
                   this.validationErrorMessage = "Shipping Options are not available for customer"
                   this.shippingInfoMessage = "Shipping Options are not available for customer";
                   this.incoTermsLoc2SelectedOption = "";
                   this.incoTermsSelectedOption = "";
                   
                    setTimeout(() => {
                        this.shippingInfoMessage = "";
                    }, 8000);
                  }
          },
          error: (err) => {
            this.productService.progressHide();
            this.spinnerLoading = false;
          },
        });
    }else{
      this.shipViaSelectedOption = event;
      this.getIncoTerms(event);
      const selectedShippingWHOption = this.shippingWareHouseOptions.find(
        (item: any) => item.value === this.shippingWareHouseSelectedOption
      );
      this.incoTermsLoc2SelectedOption = null;
      this.getIncoTermsLoc2SM(selectedShippingWHOption?.value);
    }
    
  }

  getIncoTermsLoc2SM(shippingWareHouse: any) {
    this.incoTermsLoc2Options = [];
    // this.incoTermsLoc2Options = [
    //   { value: "CWC", label: "CWC" },
    //   { value: "GBP", label: "GBP" },
    //   { value: "BF62", label: "BF62" },
    //   { value: "UPS", label: "UPS" },
    //   { value: "UTP0", label: "UTP0" },
    //   { value: "CSC", label: "CSC" },
    //   { value: "ANC", label: "ANC" },
    //   { value: "SELF", label: "SELF" },
    //   { value: "STP0", label: "STP0" },
    //   { value: "FFE", label: "FFE" },
    //   { value: "MWC0", label: "MWC0" },
    //   { value: "UTB3", label: "UTB3" },
    //   { value: "HO11", label: "HO11" },
    //   { value: "TPU0", label: "TPU0" },
    //   { value: "CSE", label: "CSE" },
    //   { value: "MCP0", label: "MCP0" },
    // ];
    let postalCode = this.shippingAddress?.postalCode;
    if (this.shippingAddress?.postalCode.includes("-")) {
      postalCode = this.shippingAddress?.postalCode.split("-")[0];
    }
    this.incoTermsLoc2Options = [];
    const selectedShippingMethod = this.shipViaOptions.find(
      (item: any) => item.value === this.shipViaSelectedOption
    );
    this.incoTermsLoc2Options = [];
    this.orderService
      .getIncoTermsLoc2(
        postalCode,
        shippingWareHouse,
        this.shipViaSelectedOption
      )
      .subscribe({
        next: (res) => {
          const resObject = res?.body;
          const objectKeys = Object.keys(resObject).sort();
          objectKeys.forEach((key) => {
            this.incoTermsLoc2Options.push({
              value: resObject[key].shipvia,
              label: resObject[key].shipvia,
              preferred: resObject[key].preferred
            });
          });
        },
        error: (err) => { this.productService.progressHide();},
      });
  }
  validateShippingOptions() {
    //this.spinnerLoading = true;
    this.shippingWareHouseOptions = [];
    this.shippingWareHouseSelectedOption =
      this.shippingAddress?.defaultShippingWarehouse || "";
    this.shipViaOptions = [];

    this.shipViaSelectedOption =
      this.shippingAddress?.defaultShippingMethod ||
      this.shipViaOptions[0]?.value;

    this.incoTermsSelectedOption =
      this.shippingAddress?.defaultIncoTermsDesc ||
      this.incoTermsOptions[0]?.value;

    this.incoTermsLoc2SelectedOption = this.shippingAddress?.defaultShipVia;

    if (this.defaultShippingMethod) {
      this.shipViaSelectedOption = this.defaultShippingMethod;
    }
    if (this.defaultIncoTerms) {
      this.incoTermsSelectedOption = this.defaultIncoTerms;
    }
    if (this.defaultShippingWarehouse) {
      this.shippingWareHouseSelectedOption = this.defaultShippingWarehouse;
    }
    if (this.defaultShipVia) {
      this.incoTermsLoc2SelectedOption = this.defaultShipVia;
    }
    this.validateShipViaAddress("chooseSolution");
  }
  shippingOptionsModal(template: TemplateRef<any>) {
    this.spinnerLoading = true;
    this.shippingWareHouseOptions = [];

    this.shippingWareHouseSelectedOption = this.defaultShippingWarehouse ||
      this.shippingAddress?.defaultShippingWarehouse || "";
    this.shipViaOptions = [];
    this.spinnerLoading = true;
    this.shipViaSelectedOption = this.defaultShippingMethod || 
       this.shippingAddress?.defaultShippingMethod ||
        this.shipViaOptions[0]?.value;
    this.productService.getShippingMethodWithOutFlag(
      this.shippingAddress.postalCode,
      this.shippingAddress.isOneTimeShipTo == undefined ? false : this.shippingAddress.isOneTimeShipTo,
      this.userInfo.isCustomer || this.userInfo.isSalesPerson || this.userInfo?.isSalesOps,
      this.shipViaSelectedOption
    ).subscribe((res: any) => {
      if (res?.body) {
        this.shipViaOptions = [];
        for (let key of Object.entries(res?.body)) {
          this.shipViaOptions.push({
            value: key[0],
            label: key[1],
          });
        }
      }
      if (this.userInfo.isCustomer || this.userInfo.isSalesPerson || this.userInfo?.isSalesOps) {
        this.spinnerLoading = false;
        this.shipViaSelectedOption = this.defaultShippingMethod || 
          this.shippingAddress?.defaultShippingMethod ||
          this.shipViaOptions[0]?.value;
       
        this.shippingWareHouseOptions = [];
        this.shippingWareHouseOptions.push({
          value: this.defaultShippingWarehouse || this.shippingAddress?.defaultShippingWarehouse,
          label: this.defaultShippingWarehouseDesc || this.shippingAddress?.defaultShippingWarehouseDesc,
        });

        this.incoTermsOptions = [];
              this.incoTermsOptions.push({
                value: this.defaultIncoTerms || this.shippingAddress?.defaultIncoTerms,
                label: this.defaultIncoTermsDesc || this.shippingAddress?.defaultIncoTermsDesc,
              });

              this.incoTermsLoc2Options = [];
              this.incoTermsLoc2Options.push({
                value: this.defaultShipVia || this.shippingAddress?.defaultShipVia,
                label: this.defaultShipVia || this.shippingAddress?.defaultShipVia,
              });
              this.incoTermsSelectedOption =  this.incoTermsOptions[0]?.value || this.defaultIncoTermsDesc || 
              this.shippingAddress?.defaultIncoTermsDesc;
              this.incoTermsLoc2SelectedOption = this.incoTermsLoc2Options[0]?.value  || this.defaultShipVia;
        // this.orderService
        //   .getShippingoptionForCustomers(
        //     this.shippingAddress.postalCode,
        //     this.shipViaSelectedOption,
        //     this.shippingWareHouseSelectedOption,
        //     this.shippingAddress.isOneTimeShipTo,
        //     ''
        //   )
        //   .subscribe({
        //     next: (res) => {
        //       this.spinnerLoading = false;
        //       this.originalDefaultShippingMethod = res.body?.originalDefaultShippingMethod;
        //       this.incoTermsOptions = [];
        //       this.incoTermsOptions.push({
        //         value: res.body.incoTerms,
        //         label: res.body.incoTermsDesc,
        //       });
        //       this.incoTermsSelectedOption =  this.incoTermsOptions[0]?.label || this.defaultIncoTermsDesc || 
        //       this.shippingAddress?.defaultIncoTermsDesc;
        //       this.incoTermsLoc2SelectedOption = res.body.shipvia;
        //     },
        //     error: (err) => {
        //       this.spinnerLoading = false;
        //     },
        //   });
      }
      if (!this.userInfo.isCustomer && !this.userInfo.isSalesPerson && !this.userInfo?.isSalesOps) {
        this.shipViaSelectedOption = this.defaultShippingMethod || 
          this.shippingAddress?.defaultShippingMethod ||
          this.shipViaOptions[0]?.value;

        this.getIncoTerms(this.shipViaSelectedOption);
        this.incoTermsSelectedOption = this.defaultIncoTerms ||
          this.shippingAddress?.defaultIncoTerms ||
          this.incoTermsOptions[0]?.value;

        this.productService.getShippingWareHouseWithOutFlag().subscribe(
          (res: any) => {
            if (res?.body) {
              this.shippingWareHouseOptions = [];
              for (let key of Object.entries(res?.body)) {
                this.shippingWareHouseOptions.push({
                  value: key[0],
                  label: key[1],
                });
              }
            }

            this.incoTermsLoc2SelectedOption = this.defaultShipVia || 
              this.shippingAddress?.defaultShipVia;
            this.getIncoTermsLoc2(this.shippingWareHouseSelectedOption);
            this.incoTermsSelectedOption = this.defaultIncoTerms ||
              this.shippingAddress?.defaultIncoTerms ||
              this.incoTermsOptions[0]?.value;
          }
        );
      }
      this.modalRef = this.modalService.show(template, {
        id: "changeShippingOptionsModal",
        class: "modal-lg modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      });
    });
  }
  changeincoTermsOptions(event: any) {
    this.incoTermsSelectedOption = event;
  }
  getIncoTerms(shipVia: any) {
    this.incoTermsOptions = [];
    this.orderService.getIncoTerms(shipVia).subscribe({
      next: (res) => {
        const resObject = res?.body;
        const objectKeys = Object.keys(resObject).sort();
        objectKeys.forEach((key) => {
          this.incoTermsOptions.push({
            value: key,
            label: resObject[key],
          });
        });
        if (this.incoTermsOptions.length === 0) {
          this.incoTermsOptions.push({
            value: this.shippingAddress?.defaultIncoTerms,
            label: this.shippingAddress?.defaultIncoTermsDesc,
          });
        }
      },
      error: (err) => { this.productService.progressHide();},
    });
  }
  getIncoTermsLoc2(shippingWareHouse: any) {
    this.incoTermsLoc2Options = [];
    // this.incoTermsLoc2Options = [
    //   { value: "CWC", label: "CWC" },
    //   { value: "GBP", label: "GBP" },
    //   { value: "BF62", label: "BF62" },
    //   { value: "UPS", label: "UPS" },
    //   { value: "UTP0", label: "UTP0" },
    //   { value: "CSC", label: "CSC" },
    //   { value: "ANC", label: "ANC" },
    //   { value: "SELF", label: "SELF" },
    //   { value: "STP0", label: "STP0" },
    //   { value: "FFE", label: "FFE" },
    //   { value: "MWC0", label: "MWC0" },
    //   { value: "UTB3", label: "UTB3" },
    //   { value: "HO11", label: "HO11" },
    //   { value: "TPU0", label: "TPU0" },
    //   { value: "CSE", label: "CSE" },
    //   { value: "MCP0", label: "MCP0" },
    // ];
    let postalCode = this.shippingAddress?.postalCode;
    if (this.shippingAddress?.postalCode.includes("-")) {
      postalCode = this.shippingAddress?.postalCode.split("-")[0];
    }
    this.incoTermsLoc2Options = [];

    let selectedShippingMethod = this.shipViaOptions.find(
      (item: any) => item.value.trim() === this.shipViaSelectedOption
    );
    if (selectedShippingMethod === undefined || selectedShippingMethod === "") {
      selectedShippingMethod = this.shipViaOptions.find(
        (item: any) => item.label.trim() === this.shipViaSelectedOption
      );
    }
    this.orderService
      .getIncoTermsLoc2(
        postalCode,
        shippingWareHouse,
        selectedShippingMethod?.value
      )
      .subscribe({
        next: (res) => {
          const resObject = res?.body;
          const objectKeys = Object.keys(resObject).sort();
          objectKeys.forEach((key) => {
            this.incoTermsLoc2Options.push({
              value: resObject[key].shipvia,
              label: resObject[key].shipvia,
              preferred: resObject[key].preferred
            });
          });
          // if (this.incoTermsLoc2Options.length === 0) {
          //   this.incoTermsLoc2Options.push({
          //     value: this.shippingAddress?.defaultShipVia,
          //     label: this.shippingAddress?.defaultShipVia,
          //   });
          // }
        },
        error: (err) => { this.productService.progressHide();},
      });
  }
  sameDyeLot: boolean = true;
  changeSameDyeLotEvent(event: any) {
    this.sameDyeLot = event.state;
  
  }

  submitInfoChanges() {
    this.modalService.hide("changeDeliveryType");
    if (this.shippingOptionChanged == "changeShippingOption") {
      this.validateShipViaAddress("changeShippingOption");
    } else {
      this.validateShipViaAddress("chooseSolution");
    }
  }
 
  closeInfoChanges() {
    this.originalDefaultSM = this.originalShippingMethod;
    this.originalDefaultShippingMethod = this.originalShippingMethod;;
    this.modalService.hide("changeDeliveryType");
    this.closeChangeShippingOptionModal();
  }

  checkMinMaxValidation(e: any, tab: any, lengthType: any) {
    if (tab == "rolls") {
      let minValue = this.feetyardForm.get("minLength")?.value;
      let maxValue = this.feetyardForm.get("maxLength")?.value || this.maxRollLength;
      if (lengthType == "min") {
        this.rollsMinLength = !(+minValue < +maxValue) && maxValue;
        this.rollsMaxLength = false;
        this.tabFeildsErrMsg = this.rollsMinLength
          ? "Please enter a valid min length value"
          : "";
      } else if (lengthType == "max") {
        this.rollsMaxLength = !(+minValue < +maxValue) && minValue;
        this.rollsMinLength = false;
        this.tabFeildsErrMsg = this.rollsMaxLength
          ? "Please enter a valid max length value"
          : "";
      }
    } else if (tab == "inventory") {
      let minFeet = this.feetyardForm.get("minFeet")?.value;
      let maxFeet = this.feetyardForm.get("maxFeet")?.value;
      let minInches = this.feetyardForm.get("minInches")?.value;
      let maxInches = this.feetyardForm.get("maxInches")?.value;
      if (lengthType == "min") {
        if (maxInches && +minFeet == +maxFeet) {
          this.inventoryMinInches =
            !(+minInches < +maxInches) &&
            minInches &&
            +minFeet == +maxFeet &&
            maxFeet;
          this.tabFeildsErrMsg = this.inventoryMinInches
            ? "Please enter a valid min inches value"
            : "";
          this.inventoryMinFeet = false;
        } else {
          this.inventoryMinFeet = !(+minFeet < +maxFeet) && maxFeet;
          this.tabFeildsErrMsg = this.inventoryMinFeet
            ? "Please enter a valid min feet value"
            : "";
          this.inventoryMinInches = false;
        }
        this.inventoryMaxFeet = false;
        this.inventoryMaxInches = false;
      } else if (lengthType == "max") {
        if (minInches && +minFeet == +maxFeet) {
          this.inventoryMaxInches =
            !(+minInches < +maxInches) &&
            minInches &&
            maxInches &&
            +minFeet == +maxFeet;
          this.tabFeildsErrMsg = this.inventoryMaxInches
            ? "Please enter a valid max inches value"
            : "";
          this.inventoryMaxFeet = false;
        } else {
          this.inventoryMaxFeet = !(+minFeet < +maxFeet) && minFeet;
          this.tabFeildsErrMsg = this.inventoryMaxFeet
            ? "Please enter a valid max feet value"
            : "";
          this.inventoryMaxInches = false;
        }
        this.inventoryMinFeet = false;
        this.inventoryMinInches = false;
      }
    }
  }

  closeExcessQuantityModal() {
    this.modalService.hide("excessQuantityModal");
  }

  excessQntyErrType = "";
  excessQntyErrMsg = "";
  checkExcessQuantity(e: any) {
    const value = Number(e.target?.value);
    const converted = this.conversionFunction1();
    const type = this.feetyardForm.get("unit")?.value;
    const minMsg =
      "Excessive quantity entered. Please verify the quantity entered is the desired amount";
    const maxMsg =
      "Excessive quantity entered. Please contact customer service for ordering assistance";
    const rollsMaxMsg = "We apologize for the temporary inconvenience, orders greater than 50 rolls must be entered through your Salesperson.";
    this.excessQntyErrMsg = "";
    this.excessQntyErrType = "";
    this.uomDetails?.quantityValidation?.filter((d: any) => {
      const isCushionPad = (type === "RO" && this.subProductType === "CUSHION_PAD");
      if (d?.UOM === type && this.bundleProduct === false) {
        if ((value >= d?.warnLength && value < d?.stopLength) && !isCushionPad) {
          this.excessQntyErrMsg = minMsg;
          this.excessQntyErrType = "warning";
        } else if (value >= d?.stopLength) {
          this.excessQntyErrMsg = isCushionPad ? rollsMaxMsg : maxMsg;
          this.excessQntyErrType = "danger";
        }
      }
      if (this.bundleProduct === true && (type === 'ZCT' || type === 'FTK')) {
        if (value >= 3704 && type ==='ZCT' ) {
          this.excessQntyErrMsg =  maxMsg;
          this.excessQntyErrType = "danger";
        }
        if(value >= 199962.21 && type === 'FTK'){
          this.excessQntyErrMsg =  maxMsg;
          this.excessQntyErrType = "danger";
        }
      } 

    });
  }

  onPaste(event: ClipboardEvent) {
    let value = event.clipboardData?.getData("text");
    if (!Number(value)) {
      event.preventDefault();
    }
  }

  onPasteForFeet(event: ClipboardEvent) {
    let value = event.clipboardData?.getData("text");
    if (!Number(value) || value?.includes('.')) {
      event.preventDefault();
    }
  }
  ColorSelected: any
  colorSeleted(event: any){
    this.ColorSelected = event;
    this.sizeSelect = false;
  }
  
  sizeSelected: any = false;
  sizeSeleted(event: any) {
    this.sizeSelected = event;
    this.colorSelect = false;
    localStorage.setItem("pdpSizeNotSelected", event);
  }

  stopAlert() {
    setTimeout(() => {
      this.colorSelect = false;
      this.sizeSelect = false;
    }, 10000);
  }

  removeATPCart(){
    if(this.removeATP === true){
      this.storageService.getItem("atpCart").pipe(take(1)).subscribe((res) => {
        if(res){
        let payload:any = {
          "shipTo": this.uid,
          "soldTo": this.soldToAccount,
          "oneTimeShippingAddress": this.shippingAddress?.oneTimeShippingAddress || this.shippingAddress?.isOneTimeShipTo || false,
          "erpOrderID": res?.solution[0]?.erpOrderID,
          "erpOrderLineNumber": res?.solution[0]?.erpOrderLineNumber,
          "productCode": this.productCode,
          "hybrisOrderNumber": res?.hybrisOrderNumber,
          "hybrisLineNumber": res?.hybrisLineNumber,
        }
        
        this.spinnerLoading = true;
        this.productService.removeATPCartEntry(payload).subscribe((resp:any)=>{
          if(resp.status === "200" || resp.status === 200){
            if(resp.body.status === "SUCCESS"){
            this.spinnerLoading = false;
            this.storageService.removeItem("atpCart");
            this.removeATP = false;
            }
          }
        });
      }
      });
    }
  }

  trackByUrl = (_: number, item: any) => item?.url ?? _;
  trackByName = (_: number, item: any) => item?.name ?? _;
  trackByKey = (_: number, item: any) => item?.key ?? _;

  ngOnDestroy(): void {
    this.productService.getMiniCartData(this.uid).pipe(take(1)).subscribe((res) => {
      let cartData = res?.body || res;
      if (cartData && typeof cartData === 'object') {
          if ((!('totalItems' in cartData)) && (!('errorMessage' in cartData))) {
            this.removeATP = true;
            this.removeATPCart();
          }
      }
    },(err)=>{ this.service.progressHide();});
  }
  
}
