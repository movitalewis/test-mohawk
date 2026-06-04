import {
  Component,
  OnInit,
  ViewEncapsulation,
  Input,
  ViewChild,
  ElementRef,
  TemplateRef,
  Inject,
} from "@angular/core";
import { DatePipe, Location } from "@angular/common";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { ErrorModalComponent } from "src/app/features/shared/components/error-modal/error-modal.component";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import { SpecificationsWidget } from "src/app/features/shared/interfaces/specifications-widget";

import { PlpOrderSamplesComponent } from "src/app/features/residential/products/components/plp-order-samples/plp-order-samples.component";
import { PlpOrderSamplesComponent as CommercialPlpOrderSamplesComponent } from "src/app/features/commercial/products/components/plp-order-samples/plp-order-samples.component";
import { XchangeAddAccessoriesLightboxComponent } from "src/app/features/shared/components/xchange-add-accessories-lightbox/xchange-add-accessories-lightbox.component";
import { StorageService } from "src/app/features/http-services/storage.service";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { ResidentialPlpTypes } from "src/app/features/shared/constants/menu/residential.config";
import { debounce, debounceTime, map, mergeMap, Subject, take } from "rxjs";
import { PostModificationProductService } from "../post-modification-services/post-modification-product.service";
import { PostModificationChooseAddressLightboxComponent } from "../../post-modification-components/post-modification-choose-address-lightbox/post-modification-choose-address-lightbox.component";
import { PostModificationShareViaEmailLightboxComponent } from "../../post-modification-components/post-modification-share-via-email-lightbox/post-modification-share-via-email-lightbox.component";
import { PostModificationAddCompanionProductsComponent } from "../../post-modification-components/post-modification-add-companion-products/post-modification-add-companion-products.component";
import { PostModificationPlpShippingAddressComponent } from "../../post-modification-components/post-modification-plp-shipping-address/post-modification-plp-shipping-address.component";
import { OrderService } from "src/app/features/residential/orders/services/order.service";
import { ConfirmationDialogComponent } from "src/app/features/shared/components/confirmation-dialog/confirmation-dialog.component";
import { ProductService } from "src/app/features/commercial/products/pages/services/product.service";
import { residentialFullSpecifications } from "src/app/features/shared/constants/pdp-full-specifications";
import { WINDOW } from "src/app/features/shared/utilities/window";
import { environment } from "src/environments/environment";

@Component({
    selector: "app-post-modification-pdp",
    templateUrl: "./post-modification-pdp.component.html",
    styleUrls: ["./post-modification-pdp.component.scss"],
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class PostModificationPdpComponent implements OnInit {
  @Input() pdpDataOptions: any;
  @Input() colorVariant: any;
  alertType = "danger";
  breadcrumbItems: BreadcrumbItems = [
    {
      name: "Home",
      path: "/residential",
      active: false,
    },
    {
      name: "Products",
      path: " ",
      active: false,
    },
    /*{
      name: "Carpet",
      path: " ",
      active: false,
    },
    {
      name: "Residential Broadloom",
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
  atpCheckProductTypes = JSON.parse(ResidentialPlpTypes.atpCheckProductTypes);
  feetyardForm!: FormGroup;
  feetyardSubmitButton = "Check Availability / Place Order";
  multiCutsForm!: FormGroup;
  productCode: string = "C.BC453.383.1200.A";
  pdbData: any;
  pdpInventoryUom: any = "";
  pdpInventoryUomValue: any = 0;
  pdpUomConversionRate: any = [];
  erpProductCategory: any = "";
  productImages: any = [];
  convertPdpInvUOMValue: any = "";
  shippingOptionFlag: boolean = false;
  productPriceDetails: any;
  warrantyInfo: any;
  inchesValue: any;
  zcttouomconv: any;
  feetYardFormDataSubmit: any;
  isMultiCutValid: boolean = true;
  isCheckAvailabilityAllowed: boolean = false;
  careAndMaintenance: any;
  isPermissions: boolean = false;
  fullSpecificationsConst: any = residentialFullSpecifications;
  fullSpecificationsConstWidgets: any = [];
  fullPerformanceSustainabilityConstWidgets: any = [];
  fullDesignConstWidgets: any = [];
  installationInfo: any;
  inHouseAccount: boolean = false;
  isQuantityValid: any;
  multiCutFlag: boolean = false;
  fullWeighsMeasureConstWidgets: any = [];
  deliveryAddress: any;
  conversationRollToSqYards: any;
  @ViewChild("changeDeliveryType", { static: true }) changeDeliveryType!: TemplateRef<any>;
  rollsMinLength: boolean = false;
  rollsMaxLength: boolean = false;
  inventoryMinFeet: boolean = false;
  inventoryMaxFeet: boolean = false;
  inventoryMinInches: boolean = false;
  inventoryMaxInches: boolean = false;
  spinnerLoading: boolean = true;
  tabFeildsErrMsg: any = "";
  recommendedImages: any = {
    Installation:
      "https://s7d4.scene7.com/is/image/MohawkResidential/smartstrand_logo_color?fmt=webp",
    Trim: "https://s7d4.scene7.com/is/image/MohawkResidential/UltraStrand_Logo_White?fmt=webp",
    Cushion:
      "https://mohawkxchange.com/mhkflooringstorefront/_ui/responsive/common/images/item-mohawk-flooring-cushion-smartcushion.png",
  };
  cartData: any = {};
  unitArray: any = [];
  detailedProductType: string = "";
  shippingAddress: any;
  shippingIndoOptions:any={};
  feetYardFormData: any;
  uid: string = "";
  csrSuperAdmin: any;
  isSalesPerson: boolean = false;
  isProductManager: boolean = false;
  modalRef!: BsModalRef;
  pdpConvUnit: any;
  pdpInvUOMCode: any = "";
  pdpInvUOMValue: any = "";
  pdpPricingUOMCode: any = "";
  pdpPricingUOMValue: any = "";
  requestedQty: any;
  replacementOrderModalForm!: FormGroup;
  convValue: any;
  isCustomer: boolean = false;
  @ViewChild("shippingOption", { static: true })
  shippingOption!: TemplateRef<any>;
  @ViewChild("changeDeliveryType", { static: true })
  shippingInfoMessage: any;
  minicartSubscriptionForChange: any;
  minFeetRequired: boolean = false;  
  minInchesRequired: boolean = false;  
  maxFeetRequired: boolean = false;  
  maxInchesRequired: boolean = false;
  isMinMaxValid: boolean = false;
  constructor(
    private modalService: BsModalService,
    private service: PostModificationProductService,
    private router: Router,
    private fb: FormBuilder,
    private _location: Location,
    private activate: ActivatedRoute,
    private storageService: StorageService,
    public productService: PostModificationProductService,
    public userService: UserService,
    public orderService: OrderService,
    private productServices: ProductService,
    private datePipe: DatePipe,
    @Inject(WINDOW) private windowRef: Window,
  ) {}

  returnPreviousUrl() {
    this._location.back();
  }

  createFeetYardForm() {
    this.feetyardForm = this.fb.group({
      unit: ["", [Validators.required]],
      // unit: ["YDK", [Validators.required]],
      quantity: ["", [Validators.min(1)]],
      feet: ["", [Validators.required, Validators.min(1)]],
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
  order_number: any;
  userInfo: any;
  ngOnInit(): void {
    this.activate.params.subscribe((res: any) => {
      if (res?.order_number) {
        this.order_number = res?.order_number;
        this.getOrderIdDetails();
      }
    });
    this.userService.getCurrentUserDetail().subscribe((res: any) => {
      this.userInfo = res?.body;
    });
    const data: any = this.modalService.config.initialState;
    this.storageService.getItem("miniCartCount").subscribe((res) => {
      this.cartData = res;
    });

    this.storageService.getItem("userInfo").subscribe((res) => {
      this.isCustomer = res?.isCustomer;
      this.isPermissions = res?.isCSR
        ? true
        : res?.isCSRSuperAdmin
        ? true
        : res?.isCustomer
        ? true
        : false;

      this.csrSuperAdmin = res;
      if (res?.isSalesPerson || res?.isSalesOps) {
        this.isSalesPerson = true;
      }
      if (res?.isProductManager) {
        this.isProductManager = true;
      }
    });
    this.typeOfproduct =
      this.activate.snapshot.queryParamMap.get("type") || "hard";
    this.userService.getCurrentUserDetail().subscribe((res: any) => {
      this.uid = res?.body?.orgUnit?.uid;
    });
    this.createFeetYardForm();
    this.getQueryParamFromUrl();

    this.getAllAccessory();
    this.getProductVariantMatrix();
    this.getPdpData();
    this.getProductPriceDetails(this.productCode);
    this.getProductMedias(this.productCode);

    this.subject.pipe(debounceTime(500), take(1)).subscribe((searchText) => {
      if (searchText) this.getValues(searchText);
    });
  }

  orderDetails: any;
  postModificationOrders: any;
  getOrderIdDetails() {
    this.orderService
      .getOrderDetails(this.order_number)
      .subscribe((res: any) => {
        this.spinnerLoading = false;
        if (res && res.body && res.body?.errorCode == "error") {
          this.errorMessage = res.body?.errorMessage;
        } else {
          this.errorMessage =
            res.body?.orderHistoryData?.submitOrderError || "";
          this.postModificationOrders = res.body.orderHistoryData[0];
          this.spinnerLoading = false;
          // this.orderData = res.body.orderHistoryData[0];
          // this.poNumber = this.orderData?.poNumber;

          // this.comments = this.orderData?.comment;
          this.shippingAddress = res?.body?.shippingAddress;
          this.orderDetails = res.body.orderHistoryData[0];
          this.deliveryAddress = res.body.orderHistoryData[0].shippingAddress;
          this.shipCompleteFlag =
            res.body.orderHistoryData[0].shipCompleteOrderFlag;
        }
      });
  }
  subject = new Subject();
  getMinMaxValues(event: any) {
    this.subject.next(event.target.value);
  }
  getTargetLength(event: any) {
    this.getValues(event.target.value);
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
    if (type === "YDK" || type === "FTK" || type == "ZCT" || type == "rolls") {
      if (event?.key == "." && value.includes(".")) {
        return false;
      }
      return this.isDecimalNumberKey(event);
    } else {
      if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
      }
      return true;
    }
  }

  isDecimalNumberKey(event: any) {
    const value: any = event?.currentTarget?.value;
    var charCode = event.which ? event.which : event.keyCode;

    if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    // if (value.includes(".")) {
    //   let val = value.split(".");
    //   val = val[val.length - 1].split("");
    //   if (val.length > 1) {
    //     return false;
    //   }
    // }
    return true;
  }
  restrictUptoTwoDecimal(e: any) {
    var t = e.target.value;
    e.target.value =
      t.indexOf(".") >= 0
        ? t.substr(0, t.indexOf(".")) + t.substr(t.indexOf("."), 3)
        : t;
    if ((e.target.value + "")[0] === "0") {
      e.target.value = "";
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
      value: "Residential Broadloom",
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
  openChooseAddressModal(
    cartData: any,
    value: any = null,
    type?: any,
    feetYardFormData?: any,
    isForAddAccessories?: any,
    showOrderSample?: any
  ) {
    let formValue = JSON.parse(JSON.stringify(this.feetyardForm.value));

    /* if (this.productType === "WOOD") {
      formValue["feet"] = "";
    }*/

    // this.feetyardSubmitButton = "Check Availability / Place Order";
    if (type == "multiCut") {
      value = (value || []).filter((entry: any) => (entry?.feet || entry?.inches));
    }
    const initialState: ModalOptions = {
      initialState: {
        // Data to  popup
        selectedProduct: this.selectedProduct,
        cartData: cartData,
        productType:
          this.pdbData?.productType?.includes("CARPET") ||
          this.pdbData?.productType?.includes("SOFTPRODUCT")
            ? "Soft_Surface"
            : "Hard_Surface",
        feetyardForm: feetYardFormData,
        multiCutIndication: type == "multiCut" ? true : false,
        viewInventory: type === "Inventory" ? true : false,
        aptCheckEntrie: value ? value : [],
      },
    };
    this.bsModalRef = this.modalService.show(
      PostModificationChooseAddressLightboxComponent,
      Object.assign(initialState, {
        id: "ChooseAddressModal",
        class: "modal-xl modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
    this.bsModalRef.content.pdpdata = this.entries;
    this.bsModalRef.content.isAtpCheck = this.isAtpCheck;
  }
  selectedProduct: any = {};
  setSelectedProductItem(item: any) {
    // this.selectedProduct = { ...item, ...this.pdbData };
    if (this.productCode != item?.code) {
      this.productCode = item?.code;
      this.productValue = item?.code;
      this.getPdpData();
      this.getProductMedias(this.productCode);
      this.getProductPriceDetails(this.productCode);
      this.getProductVariantMatrix();
    }
  }
  openShareViaEmailModal() {
    const initialState: ModalOptions = {
      initialState: {
        // Data to  popup
      },
    };
    this.bsModalRef = this.modalService.show(
      PostModificationShareViaEmailLightboxComponent,
      Object.assign(initialState, {
        class: "modal-md modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }

  exceptionErrorMessage: string = "";
  substituteProductFlag: boolean = false;
  getPdpData() {
    this.service.getPdpRecords(this.productCode, this.substituteProductFlag).subscribe((res) => {
      this.spinnerLoading = false;
      if (res && res.status == 500) {
        this.exceptionErrorMessage = res.error;
      }
      if (res && res.status == 400) {
        this.exceptionErrorMessage = res.error.message
          ? res.error.message
          : res.message;
      }
      if (res.body) {
        this.spinnerLoading = false;
        this.pdbData = res.body;
        this.productType = this.pdbData.productType;
        this.subProductType = this.pdbData.subProductType;
        this.isAtpCheck = this.atpCheckProductTypes.includes(
          this.subProductType
        );
        if (
          (this.subProductType == "RESILIENT_VINYL" ||
            this.subProductType == "Resilient_Vinyl" || this.subProductType == 'PAD_CUSHION') &&
          // (this.pdbData.sellingBackingName == "VINYL TILE" ||
          //   this.pdbData.sellingBackingName == "Vinyl Tile") &&
          this.erpProductCategory == "S"
        ) {
          this.isAtpCheck = false;
        }

        this.selectedProduct = { ...this.selectedProduct, ...this.pdbData };
        let path = "";
        if (this.productType == "SOFTSURFACE") {
          path =
            "residential/products?name=Soft Surface&page=View All Soft Surface&type=SOFTSURFACE";
        }
        if (this.productType == "HARDSURFACE") {
          path =
            "residential/products?name=Hard Surface&page=View All Hard Surface&type=HARDSURFACE";
        }
        if (this.productType == "TILE") {
          path =
            "residential/products?name=Tile&page=View%20All%20Tile&type=tile";
        }
        if (this.productType == "ACCESSORIES") {
          path =
            "residential/products?name=Accessories&page=View%20All%20Accessories&type=ACCESSORIES";
        }
        if (this.productType == "MERCHANDISING") {
          path =
            "residential/products?name=Merchandising&page=View%20All%20Merchandising&type=MERCHANDISING";
        }

        // if (
        //   this.pdbData.subProductType.includes("RESILIENT") ||
        //   this.pdbData.subProductType.includes("VINYL")
        // ) {
        //   path =
        //     "residential/products?name=Resilient%2FVinyl&page=View%20All%20Resilient%2FVinyl&type=resilient_vinyl";
        // }

        this.breadcrumbItems[2] = {
          name: decodeURIComponent(
            this.convertTitleCase(this.selectedProduct.productType)
          ),
          path: path,
          active: false,
        };
        this.breadcrumbItems[3] = {
          name: decodeURIComponent(
            this.convertTitleCase(this.pdbData.subProductType)
          ),
          path: "",
          active: true,
        };
        this.getUOMDetails();
      }
    });
  }

  variantData: any;
  convertTitleCase(str: any) {
    str = str.replace("_", " ");
    return str.toLowerCase().replace(/\b\w/g, (s: string) => s.toUpperCase());
  }
  getProductVariantMatrix() {
    this.service.getPdpVariantRecords(this.productCode).subscribe((res) => {
      this.spinnerLoading = false;
      if (res && res.status == 500) {
        this.exceptionErrorMessage = res.error;
      }
      if (res && res.status == 400) {
        this.exceptionErrorMessage = res.error.message
          ? res.error.message
          : res.message;
      }
      if (res.body) {
        this.variantData = res.body;
      }
    });
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

  @ViewChild("scrollToTop", { read: ElementRef }) scrollToTop: any;
  scrollPageToTop() {
    this.scrollToTop.nativeElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest",
    });
  }
  checkForItemAddedinCartValues: any;
  checkForItemAddedinCartType: any;
  colorSelect : boolean = false
  originalDefaultShippingMethod : any ='';
  originalSM:any='';
  checkForItemAddedinCart(type?: any, values?: any) {
    // if (this.cartData?.code) {

    // } else {
    //   this.checkAvailability(type, values);
    // }
    // else {
      if(this.ColorSelected == true && this.productType!='MERCHANDISING'){
        this.colorSelect = true
        this.errorMessage = 'Please choose a color';
        this.scrollPageToTop()
        this.stopAlert()
        return
       }
    this.spinnerLoading = true;
    this.checkForItemAddedinCartValues = values;
    this.checkForItemAddedinCartType = type;
   
      this.orderService
        .getShippingOptions(
          false,
          this.productCode,
          this.deliveryAddress.id,
          this.userInfo.orgUnit?.soldTo
        )
        .subscribe({
          next: (res) => {
            this.originalDefaultShippingMethod = res?.body?.originalDefaultShippingMethod;;
            this.originalDefaultSM= res?.body?.originalDefaultShippingMethod;
            this.originalSM = res?.body?.originalDefaultShippingMethod;
            this.defaultIncoTerms = res.body.defaultIncoTerms;
            this.defaultIncoTermsDesc = res.body.defaultIncoTermsDesc;
            this.defaultShipVia = res.body.defaultShipVia;
            this.defaultShippingMethod = res.body.defaultShippingMethod;
            this.defaultShippingWarehouse = res.body.defaultShippingWarehouse;
            this.defaultShippingWarehouseDesc =
              res.body.defaultShippingWarehouseDesc;
            this.defaultShippingConditionDesc =
              res.body.defaultShippingConditionDesc;
            this.defaultShippingMethodDesc =
              res.body.defaultShippingConditionDesc;
            this.spinnerLoading = false;
            this.modalRef = this.modalService.show(this.shippingOption, {
              id: "shippingOptionsModal",
              class: "modal-lg modal-dialog-centered",
              backdrop: "static",
              keyboard: false,
            });
          },
          error: (err) => {},
        });
    
    // this.openCrossModal(this.shippingOption)

    // }
    // });
  }
  defaultIncoTerms: any;
  defaultIncoTermsDesc: any;
  defaultShipVia: any;
  defaultShippingMethod: any;
  defaultShippingMethodDesc: any;
  defaultShippingWarehouse: any;
  defaultShippingWarehouseDesc: any;
  defaultShippingConditionDesc: any;
  getMiniCart$() {
    return this.storageService.getItem("uid").pipe(
      take(1),
      map((uid: any) => ({
        uid: uid,
      })),
      mergeMap((data: any) => this.productService.getMiniCartData(data))
    );
  }

  checkAvailability(type?: any, values?: any) {
    let payload = "productCode=" + this.productCode;
    let currentDate = this.datePipe.transform(new Date(), "MM/dd/yyyy");
    if (this.minicartSubscription) {
      this.minicartSubscription.unsubscribe();
    }
    let feetYardFormData = JSON.parse(JSON.stringify(this.feetyardForm.value));

    if (type && type == "Roll") {
      feetYardFormData.requestedQty = feetYardFormData?.quantity;
      feetYardFormData.uom = "RO";
      feetYardFormData.unit = "RO";
    } else if (type && type == "Inventory") {
      feetYardFormData.unit = "RO";
      const inches =
        feetYardFormData?.inches != ""
          ? "." + feetYardFormData?.inches?.trim()
          : "";
      feetYardFormData.requestedQty = feetYardFormData?.feet?.trim() + inches;
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
        feetYardFormData.unit = "ZCT";
      } else {
        feetYardFormData.requestedQty = feetYardFormData?.feet?.trim() + inches;
      }
      if (
        this.subProductType != "CARPET_TILE" &&
        feetYardFormData.unit === "YDK" &&
        (this.pdpInvUOMCode === "Roll" || this.pdpInvUOMCode === "RO")
      ) {
        feetYardFormData.requestedQty = this.requestedQty;
        feetYardFormData.unit = "RO";
      }
      if (
        feetYardFormData.unit === "FTK" &&
        (this.pdpInvUOMCode === "Roll" || this.pdpInvUOMCode === "RO")
      ) {
        feetYardFormData.requestedQty = this.requestedQty;
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
    }
    this.feetYardFormDataSubmit = feetYardFormData;
    this.isAtpCheck = this.atpCheckProductTypes.includes(this.subProductType);
    if (
      // (this.pdbData.sellingBackingName == "VINYL TILE" ||
      //   this.pdbData.sellingBackingName == "Vinyl Tile") &&
      this.erpProductCategory == "S"
    ) {
      this.isAtpCheck = false;
    }
    if (!this.isAtpCheck && this.orderDetails?.sampleOrder === false) {
      this.addToCartDirect(
        this.selectedProduct,
        feetYardFormData,
        type,
        values
      );
    } else if (
      this.orderDetails?.sampleOrder === true &&
      this.orderDetails?.merchandisingProduct === false
    ) {
      this.openConfirmationModal({
        title: "Restriction Alert",
        content: "Standard products cannot be added to sample orders",
        primaryActionLabel: "Back to Order Details",
        secondaryActionLabel: "",
        onPrimaryAction: () => {
          this.modalService.hide("confirmationModal");
          this.router.navigate([
            "/residential/orders/orders-history-details/" +
              this.orderDetails.orderCode,
          ]);
        },
      });
    } else {
      const initialState: ModalOptions = {
        initialState: {
          aptCheckEntrie: values ? values : [],
          solutions: [this.selectedProduct],
          originalDefaultShippingMethod:this.isCustomer || this.isSalesPerson ? this.originalDefaultShippingMethod:'',
          feetyardForm: feetYardFormData,
          multiCutIndication: type == "multiCut" ? true : false,
          viewInventory: type === "Inventory" ? true : false,
          shippingAddress: {
            ...this.orderDetails?.shippingAddress,
            ...{ id: undefined },
          },
          orderDetails: this.orderDetails,
          productPriceData: this.productPriceDetails,
          requestedDeliveryDate: currentDate || "",
          rdd: this.orderDetails?.requestedDeliveryDate,
          shippingConditions: this.shippingIndoOptions,
          productCode: this.productCode,
          sameDyeLot: this.sameDyeLot,
          shipComplete: this.shipCompleteFlag,
          productType: this.pdbData?.productType?.includes("CARPETPRODUCT")
            ? "Soft_Surface"
            : "Hard_Surface",
        },
      };
      this.bsModalRef = this.modalService.show(
        PostModificationAddCompanionProductsComponent,
        Object.assign(initialState, {
          class: "modal-xl modal-dialog-centered",
          backdrop: "static",
          keyboard: false,
        })
      );

      this.bsModalRef.content.solutions = [this.selectedProduct];
    }
  }
  orderSampleHandler() {
    this.storageService.setItem("ordeSample", "true");
    const initialState: ModalOptions = {
      initialState: {
        // Data to  popup
        productColorVariantOptions: this.pdbData?.productColorVariantOptions,
        feetyardForm: this.feetyardForm.value,
        inventoryUOM: this.pdpInvUOMCode,
        inventoryUOMConvValue: this.convertPdpInvUOMValue,
        productCode: this.productCode,
        isPostOrder: true,
        postModificationOrders: this.postModificationOrders,
        orderNumber: this.order_number,
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
        id: "confirmationModal",
        class: "modal-md modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }

  addToCartDirect(item: any, feetyardForm: any, type?: any, value = null) {
    this.spinnerLoading = true;
    this.feetYardFormData = feetyardForm;
    let currentDate = this.datePipe.transform(new Date(), "MM/dd/yyyy");
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
            this.subProductType === "CARPETPRODUCT_CARPET_TILE"))
      ) {
        if (this.feetYardFormData?.unit == "RO") {
          quantity = this.feetYardFormData?.requestedQty;
        } else {
          quantity = this.convertPdpInvUOMValue;
        }
      } else {
        quantity = this.feetYardFormData?.requestedQty;
      }
    } else {
      quantity = this.feetYardFormData?.feet;
    }
    let payLoad = {
      orderCode: this.orderDetails.orderCode,
      shipComplete: this.shipCompleteFlag,
      lineItems: [
        {
          lineNumber: "",
          ...(feetyardForm.dyeLot ? { dyeLot: feetyardForm.dyeLot } : {}),
          feet: Number(this.feetYardFormData?.feet),
          inches: Number(this.feetYardFormData?.inches),
          requestedUOM: value
            ? "LF"
            : this.productType === "HARDSURFACE" ||
              (this.productType === "SOFTSURFACE" &&
                this.subProductType === "CARPETPRODUCT_CARPET_TILE")
            ? this.pdpInvUOMCode
            : this.feetYardFormData?.unit,
          requestedQty: Number(quantity),
          maxFeet: this.feetYardFormData?.maxFeet,
          maxInches: this.feetYardFormData?.maxInches,
          minFeet: this.feetYardFormData?.minFeet,
          minInches: this.feetYardFormData?.minInches,
          productCode: this.productCode,
          shippingCondition: this.shippingIndoOptions?.defaultShippingCondition,
          shipVia: this.shippingIndoOptions?.defaultShipVia,
          incoTerms: this.shippingIndoOptions.defaultIncoTerms,
          shippingWarehouse: this.shippingIndoOptions?.defaultShippingWarehouse,
          requestedDeliveryDate: currentDate || "",
          solution: [],
          productPriceData: this.productPriceDetails,
          sameDyeLot: this.sameDyeLot,
          ...(this.orderDetails?.replacementOrder == true
            ? { reInspect: true }
            : {}),
        },
      ],
    };

    this.productService.addLineOrAccessories(payLoad).subscribe({
      next: (res) => {
        this.spinnerLoading = false;
        if (res?.body?.messages[0].status == "Error") {
          // this.addtoCartFailed = true;
          this.scrollPageToTop();
          this.exceptionErrorMessage = this.isCustomer
            ? "Action could not be completed. Sales document is currently being processed."
            : "Action could not be completed. " +
              res?.body?.messages[0]?.message;
        } else {
          this.router.navigate([
            "/residential/orders/orders-history-details/" +
              this.orderDetails.orderCode,
          ]);
          // this.onHideModal();
        }
      },
      error: (err) => {
        this.spinnerLoading = false;
      },
    });
  }
  openOrderSamplepdpModalShipping() {
    this.service
      .getCartData(this.storageService?.cartData?.code)
      .subscribe((res: any) => {
        let rdd = res?.body?.requestedDeliveryDate ? res?.body?.requestedDeliveryDate : new Date();
        rdd = (rdd != "See line details." ? rdd : this.datePipe.transform(new Date(), "MM/dd/YYYY"));
        this.shippingAddress = { ...this.shippingAddress, rdd: rdd, requestedDeliveryDate: rdd };
        this.storageService.setItem("shipping-address", this.shippingAddress);
        this.storageService.setItem("shippingAddress", this.shippingAddress);
        if (res.body === undefined || res?.body?.totalItems === 0) {
          const initialState: ModalOptions = {
            initialState: {
              modalRef: this.bsModalRef,
              productColorVariantOptions:
                this.pdbData?.productColorVariantOptions,
              orderDetails: this.orderDetails,
            },
          };
          this.bsModalRef = this.modalService.show(
            PostModificationPlpShippingAddressComponent,
            Object.assign(initialState, {
              id: "PlpShippingAddressComponentcommercial",
              class: "modal-lg modal-dialog-centered",

              backdrop: "static",
              keyboard: false,
            })
          );
        } else {
          const initialState: ModalOptions = {
            initialState: {
              productColorVariantOptions:
                this.pdbData?.productColorVariantOptions,
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
        }
      });
  }
  openOrderSamplepdpModal(values = null, type?: any, feetYardFormData?: any) {
    // this.service.getCartData().subscribe(
    //   (res: any) => {
    //     if (res.status == 200) {
    //       if (res.body.totalItems == 0) {
    //         this.openChooseAddressModal(res.body);
    //       }
    //     } else {
    //       this.openChooseAddressModal(res.body);
    //     }
    //   },
    //   (err: any) => {
    //     this.openChooseAddressModal(null);
    //   }
    // );
    this.openChooseAddressModal(null, values, type, feetYardFormData);
  }
  onQuantityChange(elem: any) {
    elem.value = elem.value.replace(/[^0-9]/g, "").replace(/(\..*)\./g, "$1");
  }
  productImgInvalid: boolean = false;
  onProdImgInvalidate(invalid: boolean) {
    this.productImgInvalid = invalid;
  }
  createQuote() {
    let obj = {
      productCode: this.pdbData.code,
      requestedUOM: this.feetyardForm.value.unit,
      quantity: this.convertToInt(
        this.feetyardForm.value.feet + "." + this.feetyardForm.value.inches
      ),
      userCartID: "",
    };
    // this.service.createQuote(obj).subscribe((res: any) => {

    //   this.quoteId = res.body.code;
    //   this.additionalData = {
    //     code: this.pdbData.code,
    //     quoteCode: this.quoteId,
    //   };
    //   this.gotoRequest();
    // });
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
    this.entries[0].dyeLot = data?.dyeLot;
    this.entries[0].feet = data?.targetLength;
    this.entries[0].requestUOM = "RO";

    this.checkForItemAddedinCart();
  }
  getEntriesValueMultiCut(data?: any) {
    this.resetVal();
    this.entries[0].productCode = this.productCode;
    this.entries[0].dyeLot = data?.dyeLot;

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
      if (data?.multicuts?.length != i + 1) arr.push(val);
    });

    this.entries[0].multiCut = arr;

    this.entries[0].requestUOM = "multicut";

    this.checkForItemAddedinCart("multiCut", arr);
  }

  addFormRow(e: any, i: number) {
    var keyCode = e.keyCode || e.which;

    var pattern = /^[a-z\d\-_\s]+$/i;

    var isValid = pattern.test(String.fromCharCode(keyCode));
    if (isValid) {
      if (this.multiCutsForm.value["multicuts"].length == i + 1) {
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
          if (res.body.totalItems == 0) {
            this.openChooseAddressModal(res.body);
          }
        },
        (err: any) => {
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
  rollsPlaceholder = 200;
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
      // this.feetyardForm.controls["maxFeet"].setValidators(Validators.required);
      // this.feetyardForm.controls["minFeet"].setValidators(Validators.required);
      this.feetyardForm.controls["unit"].setValidators(null);
      this.feetyardForm.controls["quantity"].setValidators(null);
      this.feetyardForm.controls["quantity"].updateValueAndValidity();

      this.feetyardForm.controls["feet"].setValidators(null);
    } else {
      if (!this.selectedTab) {
        this.feetyardForm?.controls["unit"].setValue(this.unitArray[0]?.type);
      }
      this.feetyardForm.controls["maxFeet"].setValidators(null);
      this.feetyardForm.controls["minFeet"].setValidators(null);
      this.feetyardForm.controls["unit"].setValidators(Validators.required);

      this.feetyardForm.controls["feet"].setValidators([
        Validators.required,
        Validators.min(1),
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
  uomErrorMsg: any;
  showBlockedProductMsg: boolean = false;
  getUOMDetails() {
    this.service.getUOMDetails(this.productCode).subscribe(
      (res) => {
        this.feetyardForm.enable();
        this.pdpPricingUOMCode = res?.body?.pricingUom.code;
        this.pdpPricingUOMValue = res?.body?.pricingUom.name;
        this.erpProductCategory = res?.body?.erpProductCategory;
        this.showBlockedProductMsg =
          res?.body?.enableCheckAvailability == false &&
          res?.body?.styleBlocked == true
            ? true
            : false;
        this.setLoadAPI("uomData");
        if (
          (this.subProductType == "RESILIENT_VINYL" ||
            this.subProductType == "Resilient_Vinyl" || this.subProductType == 'PAD_CUSHION') &&
          // (this.pdbData.sellingBackingName == "VINYL TILE" ||
          //   this.pdbData.sellingBackingName == "Vinyl Tile") &&
          res?.body?.erpProductCategory == "S"
        ) {
          this.isAtpCheck = false;
        }

        this.enableCheckAvailability = res.body.enableCheckAvailability;
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
            res?.body?.inventoryUom.code === "RO" &&
            this.subProductType === "PAD_CUSHION"
          ) {
            let lfRate = res?.body?.alternateUomData?.filter(
              (element: any) => element.alternateUom.code !== "RO"
            );
            this.conversationRollToSqYards =
              1 / lfRate[0].alternateUomConversionUnit;
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
            this.rollsPlaceholder = this.uomDetails.standardRollLength
              ? this.uomDetails.standardRollLength
              : 0;
            this.getValues(targetLength);
          } else {
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

          this.pdpUomConversionRate = res?.body?.alternateUomData.filter(
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
  loadAPIs: any = ["pdpData", "uomData", "matrix", "productPrice", "media"];
  setLoadAPI(apiName: any) {
    if (this.loadAPIs.indexOf(apiName) == -1) {
      this.loadAPIs.push(apiName);
    }
  }
  manageFullUAMRecords(productType: any, subProductType: any, uomDetails: any) {
    let specifications = this.fullSpecificationsConst[productType];
    if (
      subProductType == "RESILIENT_VINYL" &&
      uomDetails.erpProductCategory == "B"
    ) {
      subProductType = subProductType + "_V";
    }
    if (specifications.length > 0) {
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
        // let value =
        //   item.value != ""
        //     ? this.uomDetails[item.value] != undefined
        //       ? this.convertTitleCase(uomDetails[item.value])
        //       : "NA"
        //     : "NA";
        let value =
          item.value != ""
            ? this.pdbData[item.value] != undefined
              ? this.convertTitleCase(this.pdbData[item.value])
              : "NA"
            : "NA";
        if (item.value == "quickShipEligible") {
          value =
            item.value != ""
              ? this.pdbData[item.value] != undefined
                ? this.convertTitleCase(this.pdbData[item.value])
                : "NA"
              : "NA";
        }
        fullWeighsMeasureConstWidgetsArray.push({
          name: item.name,
          value: value,
        });
      });
      this.fullWeighsMeasureConstWidgets = fullWeighsMeasureConstWidgetsArray;
    }
  }
  productCodeTerm: any;

  getAllAccessory() {
    this.service.getalldisplaytypes(this.productCode).subscribe((res) => {
      this.spinnerLoading = false;
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
    });
  }

  addToCart(data1: any) {
    const data: any = this.modalService.config.initialState;

    const initialState: ModalOptions = {
      initialState: {
        cartData: data?.cartData || this.order_number,
        itemName: data1,
        postOrder: true,
        shippingAddress: this.orderDetails.shippingAddress,
        // productCode="C.BC456.683.1300.AB",
      },
    };
    this.bsModalRef = this.modalService.show(
      XchangeAddAccessoriesLightboxComponent,
      Object.assign(initialState, {
        class: "modal-xl modal-dialog-centered xchangeaddaccessorieslightbox",
        backdrop: "static",
        keyboard: false,
      })
    );
    this.bsModalRef.content.type = 2;
  }

  // convertvalue(unit: any, val: any) {
  //   let value = String((val * this.slectedUnitVal?.conversion).toFixed(2)).split('.');
  //     this.feetyardForm.get("feet")?.setValue(Number(value[0]));
  //     this.feetyardForm.get("inches")?.setValue(Number(value[1]));
  // }
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
    this.feetyardForm?.controls["unit"].setValue(val);
  }
  inputUOM: any;
  requestedYdkQty: any;
  conversionFunction1() {
    if (Number(this.feetyardForm?.value.feet) > 0) {
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
          let feetQty = JSON.stringify(decimalQty).split(".")[0];
          let inchQty = JSON.stringify(decimalQty).split(".")[1]
            ? parseInt(
                JSON.stringify(decimalQty).split(".")[1].substring(0, 2)
              ) * 12
            : 0;
          let inchQty2Digits =
            inchQty / Math.pow(10, JSON.stringify(inchQty).length);
            let inchFloat=0.0;
            if(JSON.stringify(inchQty2Digits).length === 4){
              inchFloat = parseFloat(inchQty2Digits.toFixed(1))
              if(inchFloat != 1){
                inchFloat = inchFloat * 10;
              }
            }
            if(JSON.stringify(inchQty2Digits).length != 4){
              inchFloat = parseFloat(inchQty2Digits.toFixed(1)) *10
            }
        //  let inchFloat = parseFloat(inchQty2Digits.toFixed(1)) * 10;
          displayQtyUOM =
            parseFloat(feetQty) +
            " ft " +
            (inchFloat == 0
              ? ""
              : parseFloat(inchFloat.toFixed(1)) + " inches");
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
            (decimalLFQty * lfRateLF[0].alternateUomConversionUnit * 1000) /
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
          let feetSFQty = this.feetyardForm?.value.feet;
          let lfRateSF = this.pdpUomConversionRate?.filter(
            (element: any) => element.alternateUom.code == this.inputUOM
          );
          let lfRateSF1 = this.pdpUomConversionRate?.filter(
            (element: any) => element.alternateUom.code != this.inputUOM
          );

          outputQty = (
            feetSFQty / lfRateSF1[0]?.alternateUomConversionUnit
          ).toFixed(2);
          displayQtyUOM = outputQty + " " + lfRateSF1[0]?.alternateUom.name;
        }
        if (this.inputUOM != this.pdpInvUOMCode) {
          let feetSFQty = this.feetyardForm?.value.feet;
          let lfRateSF = this.pdpUomConversionRate?.filter(
            (element: any) => element.alternateUom.code == this.inputUOM
          );
          outputQty = (
            feetSFQty * lfRateSF[0]?.alternateUomConversionUnit
          ).toFixed(2);
          outputQty = outputQty <= 0 ? 1 : Math.ceil(outputQty);
          displayQtyUOM = outputQty + " " + this.pdpInvUOMValue;
          if (this.pdpInvUOMCode == "RO") {
            this.requestedQty = outputQty;
          }
        }
        if (this.inputUOM === "EA" && this.pdpUomConversionRate.length === 1) {
          displayQtyUOM = "";
          outputQty = this.feetyardForm.value;
        }
      }

      this.requestedQty =
        this.inputUOM == "RO" ? this.feetyardForm?.value.feet : outputQty;
      if (this.inputUOM === "ZCT") {
        this.convertPdpInvUOMValue = this.feetyardForm?.value.feet;
      } else {
        this.convertPdpInvUOMValue = outputQty;
        if (this.inputUOM === "FTK") {
          this.pdpConvUnit =
            (this.uomDetails?.sqFtPerCarton * outputQty).toFixed(2) +
            " " +
            "Square Feet";
        }

        if (this.inputUOM === "YDK") {
          this.pdpConvUnit =
            ((this.uomDetails?.sqFtPerCarton / 9) * outputQty).toFixed(2) +
            " " +
            "Square Yard";
        }
      }
      if (this.feetyardForm?.value?.unit == "YDK") {
        this.requestedYdkQty = this.feetyardForm?.value.feet;
      } else {
        this.requestedYdkQty = outputQty;
      }
      // console.log("this.feetyardForm?.value?.unit---->",this.feetyardForm?.value?.unit,"display---->",outputQty,"outputqty----->",displayQtyUOM,"this.feetyardForm?.value.feet--->",this.feetyardForm?.value.feet)

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

  // // Tile
  // unitArray: any = [
  //   {
  //     key: "Carton(s)",
  //     Value: "Carton(s)",
  //   },
  //   {
  //     key: "Sq.Ft.",
  //     Value: "Sq.Ft.",
  //   }
  // ];
  // // Resilent
  // unitArray: any = [
  //   {
  //     key: "LF",
  //     Value: "LF",
  //   },
  //   {
  //     key: "Sq.Yds",
  //     Value: "Sq.Yds",
  //   },
  //   {
  //     key: "SqFeet",
  //     Value: "SqFeet",
  //   }
  // ];
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

    // if(this.feetyardForm.value?.unit === "INH"){

    //   this.feetyardForm.controls["feet"].addValidators(Validators.max(11));
    //   this.feetyardForm.controls["feet"].updateValueAndValidity();
    // }
    // else {
    //   this.feetyardForm.controls["feet"].clearValidators();

    //   this.feetyardForm.controls["feet"].addValidators(Validators.required);
    //   this.feetyardForm.controls["feet"].updateValueAndValidity();
    // }

    if (this.feetyardForm.value?.unit === "LF") {
      this.feetyardForm.controls["feet"].patchValue("");
    }
  }

  // Price conversion
  feetInchCal() {
    let val: any = "";
    if (this.feetyardForm?.value?.unit == "LF") {
      const feet =
        this.feetyardForm?.value.feet == "" ? 0 : this.feetyardForm?.value.feet;
      const inches: any =
        this.feetyardForm?.value.inches == ""
          ? 0
          : this.feetyardForm?.value.inches;
      const inchCal = inches / 12;

      val = (Number(feet) + inchCal) * this.pdpInventoryUomValue;
    } else if (
      this.feetyardForm?.value?.unit == "YDK" &&
      this.feetyardForm?.value.feet != ""
    ) {
      val = this.feetyardForm?.value.feet / this.pdpInventoryUomValue;
    } else if (
      this.feetyardForm?.value?.unit == "FTK" &&
      this.feetyardForm?.value.feet != ""
    ) {
      val = this.feetyardForm?.value.feet * this.pdpInventoryUomValue;
    } else if (
      this.feetyardForm?.value?.unit == "ZCT" &&
      this.feetyardForm?.value.feet != ""
    ) {
      val = this.feetyardForm?.value.feet / this.pdpInventoryUomValue;
    }

    if (
      this.pdpInventoryUom === "Linear FT" &&
      JSON.stringify(val)?.includes(".")
    ) {
      val = JSON.stringify(val);
      let k: any = val.split(".");
      let temp = k[1];

      k[1] = (k[1] * 12) / Math.pow(10, temp.length);

      val = `${k[0]} ft. ${Math.round(k[1])} in. Linear Feet`;
    }

    return val;
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
    this.productService
      .getProductPriceDetails(productCode)
      .subscribe((res: any) => {
        this.productPriceDetails = res.body;
      });
  }

  //getProductMedias
  getProductMedias(productCode: any) {
    // this.feetyardForm.controls["feet"].patchValue(this.selectedUnitOfMeasure);
    this.productService.getProductMedias(productCode).subscribe((res: any) => {
      this.spinnerLoading = false;
      if (res && res.status == 500) {
        this.exceptionErrorMessage = res.error;
      }
      if (res && res.status == 400) {
        this.exceptionErrorMessage = res.error.message
          ? res.error.message
          : res.message;
      }
      this.warrantyInfo = res.body?.warrantyInfo;
      this.careAndMaintenance = res.body?.careAndMaintenanceInfo;
      this.installationInfo = res.body?.installationInfo;
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
    });
  }

  validateQuantity() {
    let isValid = true;
    for (let i = 0; i < this.formData.length; i++) {
      const feetControl = this.formData.at(i).get("feet");
      const inchesControl = this.formData.at(i).get("inches");

      const feetValue = feetControl?.value || 0;
      const inchesValue = inchesControl?.value || 0;

      const sumValue = parseInt(inchesValue) / 12 + parseInt(feetValue);

      if (
        sumValue >
        Number(this.uomDetails?.standardRollLength.replaceAll(",", "")) / 2
      ) {
        isValid = false;
        break;
      }
    }

    this.enableCheckAvailability = isValid;
    this.multiCutFlag = !isValid;
    this.isQuantityValid = isValid;
    this.validateMultiCut();
  }
  closeChangeShippingOptionModal() {
    


    this.originalDefaultShippingMethod = this.originalSM;
    this.originalDefaultSM = this.originalSM;

   
      this.shipViaSelectedOption =this.defaultShippingMethod;
    this.incoTermsLoc2SelectedOption = this.defaultShipVia;
   
    this.incoTermsSelectedOption = this.defaultIncoTerms 
    this.shippingWareHouseSelectedOption  = this.defaultShippingWarehouse;
    



    this.modalService.hide("changeShippingOptionsModal");
    // this.modalService.hide();
  }
  closeShippingOptionsModalModal() {
    // this.validateShipViaAddress()
    this.originalDefaultSM = this.originalDefaultShippingMethod;
    this.modalService.hide("shippingOptionsModal");
    // this.modalService.hide();
  }
  showValidationError: boolean = false;
  validationErrorMessage: any;
  validateShipVia(event: any) {
    console.log(event);
    this.showValidationError = false;
  }
  shippingOptionModalSubmit() {
    // this.shipViaModalSubmit();
    // this.shippingWareHouseModalSubmit();
    this.closeChangeShippingOptionModal();
    // this.modalService.hide("shippingOptionModal");
  }
  changeShippingWareHouseOptions(event: any) {
    this.shippingWareHouseSelectedOption = event;
    this.getIncoTermsLoc2(event);
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
  shippingOptionChanged: any;

  // validateShipViaAddress(type: any) {
  //   this.shippingOptionChanged=type;

  //   console.log(
  //     "this.shipViaSelectedOption",
  //     this.shipViaSelectedOption,
  //     this.incoTermsLoc2SelectedOption
  //   );
  //   this.spinnerLoading = true;
  //   let shipViaSelectedOption =
  //     this.shipViaSelectedOption || this.defaultShippingMethod;
  //   let incoTermsLoc2SelectedOption =
  //     this.incoTermsLoc2SelectedOption.label ||
  //     this.incoTermsLoc2SelectedOption ||
  //     this.defaultShipVia;
  //     let incoTermsSelectedOption =
  //     this.incoTermsSelectedOption ||
  //     this.defaultIncoTerms ||
  //     this.shippingAddress?.defaultIncoTerms;
  //     let shippingWareHouseSelectedOption =
  //     this.shippingWareHouseSelectedOption ||
  //     this.defaultShippingWarehouse||
  //     this.shippingAddress?.defaultShippingWarehouse;
  //   this.orderService
  //   .validateShippingOptions(shippingWareHouseSelectedOption,this.erpProductCategory, incoTermsLoc2SelectedOption)
  //   .subscribe({
  //       next: (res) => {
  //         if (res.body.status === "success") {

  //           this.orderService
  //           .validateShipVia(shipViaSelectedOption, incoTermsLoc2SelectedOption)
  //           .subscribe({
  //             next: (resp) => {
  //               if (resp.body.status === "success") {

  //           if (type == "chooseSolution") {
  //             this.spinnerLoading = true;
  //             this.minicartSubscriptionForChange = this.storageService
  //               .getItem("miniCartCount")
  //               .subscribe((res: any) => {
  //                 console.log("res is ------>",res)
  //                 this.minicartSubscriptionForChange.unsubscribe();
  //                 if (
  //                   res == undefined ||
  //                   res == "" ||
  //                   res.hasOwnProperty("errorMessage") ||
  //                   res?.totalItems == 0
  //                 ) {
  //                   this.spinnerLoading = false;
  //                   this.populateShippingOptions();
  //                   this.closeChangeShippingOptionModal()
  //                     this.closeShippingOptionsModalModal();
  //                     // this.onShippingOptionSubmit();
  //                     this.checkAvailability(
  //                       this.checkForItemAddedinCartType,
  //                       this.checkForItemAddedinCartValues
  //                     );
  //                 } else {
  //                   this.spinnerLoading = true;
  //                   this.productService.getCartData(res.code).subscribe({
  //                     next: (result) => {
  //                       this.spinnerLoading = false;
  //                       console.log(result.body);
  //                       let defaultIncoTerms = result.body.incoTerms;
  //                       let defaultIncoTermsDesc = result.body.incoTermsDesc;
  //                       let defaultShipVia = result.body.shipVia;
  //                       let defaultShippingMethod =
  //                         result.body.shippingConditions;
  //                       let defaultShippingWarehouse =
  //                         result.body.shippingWarehouse;
  //                       let defaultShippingWarehouseDesc =
  //                         result.body.shippingWarehouseDesc;
  //                       let shippingConditionDesc =
  //                         result.body.shippingConditionDesc;
  //                       let defaultShippingMethodDesc =
  //                         result.body.shippingConditionDesc;
  //                       if (
  //                         defaultIncoTerms == this.incoTermsSelectedOption &&
  //                         defaultShipVia == this.incoTermsLoc2SelectedOption &&
  //                         defaultShippingMethod == this.shipViaSelectedOption &&
  //                         defaultShippingWarehouse ==
  //                           this.shippingWareHouseSelectedOption
  //                       ) {
  //                         this.populateShippingOptions();
  //                         this.closeChangeShippingOptionModal()
  //                           this.closeShippingOptionsModalModal();
  //                           // this.onShippingOptionSubmit();
  //                           this.checkAvailability(
  //                             this.checkForItemAddedinCartType,
  //                             this.checkForItemAddedinCartValues
  //                           );
  //                       }
  //                       else{

  //                         this.shippingInfoMessage="Selected Shipping options are different from the items in your cart. Do you want to continue?"
  //                         // else{
  //                         // this.shippingInfoMessage="Saving this changes will impact your cart. Do you want to continue?"}

  //                         this.modalRef = this.modalService.show(
  //                         this.changeDeliveryType,
  //                         {
  //                           id: "changeDeliveryType",
  //                           class: "modal-lg modal-dialog-centered",
  //                           backdrop: "static",
  //                           keyboard: false,
  //                         }
  //                       );                        }

  //                     },
  //                     error: (err) => {
  //                       this.spinnerLoading = false;
  //                     },
  //                   });

  //                   // this.openCrossModal(this.shippingOption)
  //                 }
  //               });
  //           }
  //           if (type == "changeShippingOption") {
  //             this.orderService.getOrderDetails(this.order_number).subscribe({
  //               next: (result) => {
  //                 let defaultIncoTerms =
  //                   result.body?.orderHistoryData[0]?.incoTerms;
  //                 let defaultIncoTermsDesc = result.body.incoTermsDesc;
  //                 let defaultShipVia =
  //                   result.body?.orderHistoryData[0]?.shipVia;
  //                 let defaultShippingMethod =
  //                   result.body?.orderHistoryData[0]?.shippingConditions;
  //                 let defaultShippingWarehouse =
  //                   result.body?.orderHistoryData[0]?.shippingWarehouse;
  //                 let defaultShippingWarehouseDesc =
  //                   result.body?.orderHistoryData[0]?.shippingWarehouseDesc;
  //                 let shippingConditionDesc =
  //                   result.body?.orderHistoryData[0]?.shippingConditionDesc;
  //                 let defaultShippingMethodDesc =
  //                   result.body?.orderHistoryData[0]?.shippingConditionDesc;
  //                 if (
  //                   defaultIncoTerms == this.incoTermsSelectedOption &&
  //                   defaultShipVia == this.incoTermsLoc2SelectedOption &&
  //                   defaultShippingMethod == this.shipViaSelectedOption &&
  //                   defaultShippingWarehouse ==
  //                     this.shippingWareHouseSelectedOption
  //                 ) {
  //                   this.spinnerLoading = false;
  //                   this.populateShippingOptions();
  //                   this.shippingOptionModalSubmit();
  //                 } else {
  //                   this.spinnerLoading = false;
  //                   if (
  //                     result?.body?.orderHistoryData[0]?.shipCompleteOrderFlag
  //                   ) {
  //                     this.shippingInfoMessage =
  //                       "Saving this changes, Order " +
  //                       "Ship Complete order" +
  //                       " to " +
  //                       "Ship Order Based on Availability" +
  //                       ". Do you wish to continue?";
  //                     //  else{
  //                     //  this.shippingInfoMessage="Saving this changes, Order shipping preference will change to ship order based on availability. Do you wish to continue?"}
  //                     this.modalRef = this.modalService.show(
  //                       this.changeDeliveryType,
  //                       {
  //                         id: "changeDeliveryType",
  //                         class: "modal-lg modal-dialog-centered",
  //                         backdrop: "static",
  //                         keyboard: false,
  //                       }
  //                     );
  //                   } else {
  //                 this.spinnerLoading = false;
  //                     this.submitInfoChanges();
  //                   }
  //                 }
  //               },
  //               error: (err) => {
  //                 this.spinnerLoading = false;
  //               },
  //             });
  //           }
  //         }else if (resp.body.status === "error") {
  //           this.spinnerLoading = false;
  //           this.showValidationError = true;
  //           this.validationErrorMessage = res.body.message;
  //         }
  //       },
  //       error: (err) => {},
  //     });
  //         } else if (res.body.status === "error") {
  //           this.spinnerLoading = false;
  //           this.showValidationError = true;
  //           this.validationErrorMessage = res.body.message;
  //         }
  //       },
  //       error: (err) => {},
  //     });
  // }
  validateShipViaAddress(type: any) {
    this.shippingOptionChanged = type;

    console.log(
      "this.shipViaSelectedOption",
      this.shipViaSelectedOption,
      this.incoTermsLoc2SelectedOption
    );
    this.spinnerLoading = true;
    let shipViaSelectedOption =
      this.shipViaSelectedOption || this.defaultShippingMethod;
    let incoTermsLoc2SelectedOption =
      //  this.incoTermsLoc2SelectedOption.label ||
      this.incoTermsLoc2SelectedOption ||
      this.defaultShipVia || this.orderDetails?.shipVia ||
      this.shippingAddress?.defaultShipVia;
      
    incoTermsLoc2SelectedOption = typeof incoTermsLoc2SelectedOption == "object"
      ? incoTermsLoc2SelectedOption?.label.toUpperCase()
      : incoTermsLoc2SelectedOption;

    let incoTermsSelectedOption =
      this.incoTermsSelectedOption ||
      this.defaultIncoTerms || this.orderDetails?.incoTerms || 
      this.shippingAddress?.defaultIncoTerms;
    let shippingWareHouseSelectedOption =
      this.shippingWareHouseSelectedOption || this.defaultShippingWarehouse;
      if(!this.userInfo?.isCustomer && !this.userInfo?.isSalesPerson && !this.userInfo?.isSalesOps ){
    this.orderService
      .validateShippingOptions(
        shippingWareHouseSelectedOption,
        this.erpProductCategory,
        incoTermsLoc2SelectedOption
      )
      .subscribe({
        next: (res) => {
          if (res.body.status === "success") {
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
                          console.log("res is ------>", res);
                          this.minicartSubscriptionForChange.unsubscribe();
                          if (
                            res == undefined ||
                            res == "" ||
                            res.hasOwnProperty("errorMessage") ||
                            res?.totalItems == 0
                          ) {
                            this.spinnerLoading = false;
                            this.populateShippingOptions();
                            this.closeChangeShippingOptionModal();
                            this.closeShippingOptionsModalModal();
                            // this.onShippingOptionSubmit();
                            this.checkAvailability(
                              this.checkForItemAddedinCartType,
                              this.checkForItemAddedinCartValues
                            );
                          } else {
                            this.spinnerLoading = true;
                            this.productService
                              .getCartData(res.code)
                              .subscribe({
                                next: (result) => {
                                  this.spinnerLoading = false;
                                  console.log(result.body);
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
                                  if (
                                    this.changeDeliveryType === undefined ||
                                    (defaultIncoTerms ==
                                      this.incoTermsSelectedOption &&
                                      defaultShipVia ==
                                        this.incoTermsLoc2SelectedOption &&
                                      defaultShippingMethod ==
                                        this.shipViaSelectedOption &&
                                      defaultShippingWarehouse ==
                                        this.shippingWareHouseSelectedOption)
                                  ) {
                                    this.populateShippingOptions();
                                    this.closeChangeShippingOptionModal();
                                    this.closeShippingOptionsModalModal();
                                    // this.onShippingOptionSubmit();
                                    this.checkAvailability(
                                      this.checkForItemAddedinCartType,
                                      this.checkForItemAddedinCartValues
                                    );
                                  } else {
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
                      this.orderService
                        .getOrderDetails(this.order_number)
                        .subscribe({
                          next: (result) => {
                            let defaultIncoTerms =
                              result.body?.orderHistoryData[0]?.incoTerms;
                            let defaultIncoTermsDesc =
                              result.body.incoTermsDesc;
                            let defaultShipVia =
                              result.body?.orderHistoryData[0]?.shipVia;
                            let defaultShippingMethod =
                              result.body?.orderHistoryData[0]
                                ?.shippingConditions;
                            let defaultShippingWarehouse =
                              result.body?.orderHistoryData[0]
                                ?.shippingWarehouse;
                            let defaultShippingWarehouseDesc =
                              result.body?.orderHistoryData[0]
                                ?.shippingWarehouseDesc;
                            let shippingConditionDesc =
                              result.body?.orderHistoryData[0]
                                ?.shippingConditionDesc;
                            let defaultShippingMethodDesc =
                              result.body?.orderHistoryData[0]
                                ?.shippingConditionDesc;
                            if (
                              defaultIncoTerms ==
                                this.incoTermsSelectedOption &&
                              defaultShipVia ==
                                this.incoTermsLoc2SelectedOption &&
                              defaultShippingMethod ==
                                this.shipViaSelectedOption &&
                              defaultShippingWarehouse ==
                                this.shippingWareHouseSelectedOption
                            ) {
                              this.spinnerLoading = false;
                              this.populateShippingOptions();
                              this.shippingOptionModalSubmit();
                            } else {
                              this.spinnerLoading = false;
                              if (
                                result?.body?.orderHistoryData[0]
                                  ?.shipCompleteOrderFlag
                              ) {
                                this.shippingInfoMessage =
                                  "Saving this changes, Order " +
                                  "Ship Complete order" +
                                  " to " +
                                  "Ship Order Based on Availability" +
                                  ". Do you wish to continue?";
                                //  else{
                                //  this.shippingInfoMessage="Saving this changes, Order shipping preference will change to ship order based on availability. Do you wish to continue?"}
                                this.modalRef = this.modalService.show(
                                  this.changeDeliveryType,
                                  {
                                    id: "changeDeliveryType",
                                    class: "modal-lg modal-dialog-centered",
                                    backdrop: "static",
                                    keyboard: false,
                                  }
                                );
                              } else {
                                this.spinnerLoading = false;
                                this.submitInfoChanges();
                              }
                            }
                          },
                          error: (err) => {
                            this.spinnerLoading = false;
                          },
                        });
                    }
                  } else if (resp.body.status === "error") {
                    this.spinnerLoading = false;
                    this.showValidationError = true;
                    this.validationErrorMessage = res.body.message;
                  }
                },
                error: (err) => {},
              });
          } else if (res.body.status === "error") {
            this.spinnerLoading = false;
            this.showValidationError = true;
            this.validationErrorMessage = res.body.message;
          }
        },
        error: (err) => {},
      });
    }else{
      this.originalDefaultShippingMethod = this.originalDefaultSM;
   //   this.shippingAddress.originalDefaultShippingMethod = this.originalDefaultShippingMethod;
      if (type == "chooseSolution") {
        this.spinnerLoading = true;
        this.minicartSubscriptionForChange = this.storageService
          .getItem("miniCartCount")
          .subscribe((res: any) => {
            console.log("res is ------>", res);
            this.minicartSubscriptionForChange.unsubscribe();
            if (
              res == undefined ||
              res == "" ||
              res.hasOwnProperty("errorMessage") ||
              res?.totalItems == 0
            ) {
              this.spinnerLoading = false;
              this.populateShippingOptions();
              this.closeChangeShippingOptionModal();
              this.closeShippingOptionsModalModal();
              // this.onShippingOptionSubmit();
              this.checkAvailability(
                this.checkForItemAddedinCartType,
                this.checkForItemAddedinCartValues
              );
            } else {
              this.spinnerLoading = true;
              this.productService
                .getCartData(res.code)
                .subscribe({
                  next: (result) => {
                    this.spinnerLoading = false;
                    console.log(result.body);
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
                    if (
                      this.changeDeliveryType === undefined ||
                      (defaultIncoTerms ==
                        this.incoTermsSelectedOption &&
                        defaultShipVia ==
                          this.incoTermsLoc2SelectedOption &&
                        defaultShippingMethod ==
                          this.shipViaSelectedOption &&
                        defaultShippingWarehouse ==
                          this.shippingWareHouseSelectedOption)
                    ) {
                      this.populateShippingOptions();
                      this.closeChangeShippingOptionModal();
                      this.closeShippingOptionsModalModal();
                      // this.onShippingOptionSubmit();
                      this.checkAvailability(
                        this.checkForItemAddedinCartType,
                        this.checkForItemAddedinCartValues
                      );
                    } else {
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
        this.orderService
          .getOrderDetails(this.order_number)
          .subscribe({
            next: (result) => {
              let defaultIncoTerms =
                result.body?.orderHistoryData[0]?.incoTerms;
              let defaultIncoTermsDesc =
                result.body.incoTermsDesc;
              let defaultShipVia =
                result.body?.orderHistoryData[0]?.shipVia;
              let defaultShippingMethod =
                result.body?.orderHistoryData[0]
                  ?.shippingConditions;
              let defaultShippingWarehouse =
                result.body?.orderHistoryData[0]
                  ?.shippingWarehouse;
              let defaultShippingWarehouseDesc =
                result.body?.orderHistoryData[0]
                  ?.shippingWarehouseDesc;
              let shippingConditionDesc =
                result.body?.orderHistoryData[0]
                  ?.shippingConditionDesc;
              let defaultShippingMethodDesc =
                result.body?.orderHistoryData[0]
                  ?.shippingConditionDesc;
              if (
                defaultIncoTerms ==
                  this.incoTermsSelectedOption &&
                defaultShipVia ==
                  this.incoTermsLoc2SelectedOption &&
                defaultShippingMethod ==
                  this.shipViaSelectedOption &&
                defaultShippingWarehouse ==
                  this.shippingWareHouseSelectedOption
              ) {
                this.spinnerLoading = false;
                this.populateShippingOptions();
                this.shippingOptionModalSubmit();
              } else {
                this.spinnerLoading = false;
                if (
                  result?.body?.orderHistoryData[0]
                    ?.shipCompleteOrderFlag
                ) {
                  this.shippingInfoMessage =
                    "Saving this changes, Order " +
                    "Ship Complete order" +
                    " to " +
                    "Ship Order Based on Availability" +
                    ". Do you wish to continue?";
                  //  else{
                  //  this.shippingInfoMessage="Saving this changes, Order shipping preference will change to ship order based on availability. Do you wish to continue?"}
                  this.modalRef = this.modalService.show(
                    this.changeDeliveryType,
                    {
                      id: "changeDeliveryType",
                      class: "modal-lg modal-dialog-centered",
                      backdrop: "static",
                      keyboard: false,
                    }
                  );
                } else {
                  this.spinnerLoading = false;
                  this.submitInfoChanges();
                }
              }
            },
            error: (err) => {
              this.spinnerLoading = false;
            },
          });
      }

    }
  }

  disableShipVia(){
    if((this.userInfo?.isCustomer  || this.userInfo?.isSalesPerson  || this.userInfo?.isSalesOps) 
          && (this.orderDetails.oneTimeShipTo) && this.shipViaSelectedOption == "CA"){
            return false;
    }else if((this.userInfo?.isCustomer || this.userInfo?.isSalesPerson  || this.userInfo?.isSalesOps)){
      return true;
    }else {
      return false;
    }
  }

  originalDefaultSM:any='';
  changeshipViaOptions(event: any) {

    this.shippingWareHouseOptions = [];
    this.shippingWareHouseOptions.push({
      value: this.orderDetails?.shippingWarehouse || this.defaultShippingWarehouse,
      label: this.orderDetails?.shippingWarehouseDesc || this.defaultShippingWarehouseDesc,
    });
    this.shippingWareHouseSelectedOption =  this.shippingWareHouseOptions[0].value || this.defaultShippingWarehouse || this.shippingWareHouseOptions[0].value || this.orderDetails?.shippingWarehouse;

    if (this.userInfo.isCustomer || this.userInfo.isSalesPerson || this.userInfo?.isSalesOps) {
      this.spinnerLoading = false;
     
      let postalCode = this.orderDetails.shippingAddress?.postalCode;
      if (this.orderDetails.shippingAddress?.postalCode.includes("-")) {
        postalCode = this.orderDetails.shippingAddress?.postalCode.split("-")[0];
      }
      this.orderService
        .getShippingoptionForCustomers(
          postalCode,
          this.shipViaSelectedOption,
          this.shippingWareHouseSelectedOption,
          this.orderDetails?.oneTimeShipTo,
          this.uid
        )
        .subscribe({
          next: (res) => {
            this.showValidationError = false;
            console.log("res---->",res);
            if(res?.body?.incoTerms || res?.body?.shipvia){
                this.spinnerLoading = false;
               this.incoTermsOptions = [];
                this.incoTermsOptions.push({
                  value: res.body.incoTerms,
                  label: res.body.incoTermsDesc,
                });
                this.incoTermsLoc2Options = [];
                if(res.body.shipvia){
                  this.incoTermsLoc2Options.push({
                    value: res.body.shipvia,
                    label: res.body.shipvia,
                  });
                }

                this.shippingWareHouseOptions = [];
                this.shippingWareHouseOptions.push({
                  value: res.body?.shippingWarehouse || this.orderDetails?.shippingWarehouse || this.defaultShippingWarehouse,
                  label: res.body?.shippingWarehouseDesc || this.orderDetails?.shippingWarehouseDesc || this.defaultShippingWarehouseDesc,
                });
  
                this.shippingWareHouseSelectedOption = this.shippingWareHouseOptions[0]?.value;

                this.originalDefaultSM = res.body?.originalDefaultShippingMethod;
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
                    // this.addtoCartErrorMessage = [
                    //     ...[],
                    //     ...[{ message: this.validationErrorMessage }],
                    // ];
                    setTimeout(() => {
                        this.shippingInfoMessage = "";
                    }, 8000);
                  }
          },
          error: (err) => {
            this.spinnerLoading = false;
          },
        });
    } else {
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
    let postalCode = this.orderDetails.shippingAddress?.postalCode;
    if (this.orderDetails.shippingAddress?.postalCode.includes("-")) {
      postalCode = this.orderDetails.shippingAddress?.postalCode.split("-")[0];
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
        error: (err) => {},
      });
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
            value: this.orderDetails.incoTerms,
            label: this.orderDetails.incoTermsDesc,
          });
        }
        this.incoTermsSelectedOption =
         this.incoTermsOptions[0].value;
      },
      error: (err) => {},
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
    let postalCode = this.orderDetails.shippingAddress?.postalCode;
    if (this.orderDetails.shippingAddress?.postalCode.includes("-")) {
      postalCode = this.orderDetails.shippingAddress?.postalCode.split("-")[0];
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
          this.spinnerLoading = false;
          const resObject = res?.body;
          const objectKeys = Object.keys(resObject).sort();
          objectKeys.forEach((key) => {
            this.incoTermsLoc2Options.push({
              value: resObject[key].shipvia,
              label: resObject[key].shipvia,
              preferred: resObject[key].preferred
            });
          });
          // this.shipViaSelectedOption = this.defaultShippingMethod;
          // if (this.incoTermsLoc2Options.length === 0) {
          //   this.incoTermsLoc2Options.push({
          //     value: this.shippingAddress?.defaultShipVia,
          //     label: this.shippingAddress?.defaultShipVia,
          //   });
          // }
        },
        error: (err) => {},
      });
  }
  changeincoTermsOptions(event: any) {
    this.incoTermsSelectedOption = event;
  }
  // shippingOptionsModal(template: TemplateRef<any>) {
  //   this.shippingWareHouseOptions = [];
  //   this.shippingWareHouseSelectedOption =
  //     this.orderDetails.shippingWarehouse || "";
  //   this.shipViaOptions = [];
  //   this.spinnerLoading = true;

  //   this.productServices
  //     .getShippingMethodWithOutFlag(
  //       this.orderDetails.shippingAddress?.postalCode,
  //       true,
  //       (this.userInfo.isCustomer || this.userInfo.isSalesPerson),
  //       this.shipViaSelectedOption
  //     )
  //     .subscribe((res: any) => {
  //       if (res?.body) {
  //         this.shipViaOptions = [];

  //         for (let key of Object.entries(res?.body)) {
  //           this.shipViaOptions.push({
  //             value: key[0],
  //             label: key[1],
  //           });
  //         }
  //       }

  //       this.shipViaSelectedOption =
  //         this.defaultShippingMethod || this.shipViaOptions[0].value;

  //       this.getIncoTerms(this.shipViaSelectedOption);
  //       // console.log(this.incoTermsOptions)
  //       // this.incoTermsSelectedOption =
  //       //   this.shippingAddress?.defaultIncoTermsDesc ||
  //       //   this.incoTermsOptions[0].label;

  //       this.productServices
  //         .getShippingWareHouseWithOutFlag()
  //         .subscribe((res: any) => {
  //           if (res?.body) {
  //             this.shippingWareHouseOptions = [];

  //             for (let key of Object.entries(res?.body)) {
  //               this.shippingWareHouseOptions.push({
  //                 value: key[0],
  //                 label: key[1],
  //               });
  //             }
  //           }
  //           this.shippingOptionFlag = true;
  //           this.incoTermsLoc2SelectedOption = this.defaultShipVia;
  //           this.getIncoTermsLoc2(this.shippingWareHouseSelectedOption);
  //           this.modalRef = this.modalService.show(template, {
  //             id: "changeShippingOptionsModal",
  //             class: "modal-lg modal-dialog-centered",
  //             backdrop: "static",
  //             keyboard: false,
  //           });
  //         });
  //     });
  // }
 dupShippingOptions:any={};
  shippingOptionsModal(template: TemplateRef<any>) {
    this.spinnerLoading = true;
    this.shippingWareHouseOptions = [];
    this.shipViaOptions = [];
    this.spinnerLoading = true;
    this.shipViaSelectedOption = this.defaultShippingMethod || 
       this.orderDetails?.shippingMethod ||
        this.shipViaOptions[0]?.value;
    this.productService.getShippingMethodWithOutFlag(
      this.orderDetails?.shippingAddress.postalCode,
      this.orderDetails?.oneTimeShipTo,
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
      this.shippingWareHouseOptions = [];
      this.shippingWareHouseOptions.push({
        value: this.orderDetails?.shippingWarehouse || this.defaultShippingWarehouse,
        label: this.orderDetails?.shippingWarehouseDesc || this.defaultShippingWarehouseDesc,
      });

      this.shippingWareHouseSelectedOption =  this.shippingWareHouseOptions[0].value || this.defaultShippingWarehouse || this.shippingWareHouseOptions[0].value || this.orderDetails?.shippingWarehouse;

      if (this.userInfo.isCustomer || this.userInfo.isSalesPerson || this.userInfo?.isSalesOps) {
        this.spinnerLoading = false;
        this.shipViaSelectedOption = this.defaultShippingMethod ||
          this.shipViaOptions[0]?.value ||   this.orderDetails?.shippingMethod;
       
         this.orderService
          .getShippingoptionForCustomers(
            this.orderDetails?.shippingAddress.postalCode,
            this.shipViaSelectedOption,
            this.shippingWareHouseSelectedOption,
            this.orderDetails?.oneTimeShipTo,
            this.uid
          )
          .subscribe({
            next: (res) => {
              this.spinnerLoading = false;
              this.originalDefaultShippingMethod = res.body?.originalDefaultShippingMethod;
              this.originalDefaultSM = res?.body?.originalDefaultShippingMethod;
              this.incoTermsOptions = [];
              this.incoTermsOptions.push({
                value: res.body.incoTerms,
                label: res.body.incoTermsDesc,
              });
              this.incoTermsLoc2Options = [];
              this.incoTermsLoc2Options.push({
                value: res.body.shipvia,
                label: res.body.shipvia,
              });
              this.shippingWareHouseOptions = [];
              this.shippingWareHouseOptions.push({
                value: res.body?.shippingWarehouse || this.orderDetails?.shippingWarehouse || this.defaultShippingWarehouse,
                label: res.body?.shippingWarehouseDesc || this.orderDetails?.shippingWarehouseDesc || this.defaultShippingWarehouseDesc,
              });

              this.shippingWareHouseSelectedOption =  this.shippingWareHouseOptions[0].value || this.defaultShippingWarehouse || this.shippingWareHouseOptions[0].value || this.orderDetails?.shippingWarehouse;

              this.incoTermsSelectedOption =  this.incoTermsOptions[0]?.value || this.defaultIncoTerms || 
              this.orderDetails?.incoTerms;
              this.incoTermsLoc2SelectedOption = res.body.shipvia;

            },
            error: (err) => {
              this.spinnerLoading = false;
            },
          });
      }
      if (!this.userInfo.isCustomer && !this.userInfo.isSalesPerson && !this.userInfo?.isSalesOps) {
        this.shipViaSelectedOption = this.defaultShippingMethod || 
          this.orderDetails?.shippingMethod ||
          this.shipViaOptions[0]?.value;

        this.getIncoTerms(this.shipViaSelectedOption);
        this.incoTermsSelectedOption = this.defaultIncoTerms ||
          this.orderDetails?.incoTerms ||
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
              this.orderDetails?.shipVia;
            this.getIncoTermsLoc2(this.shippingWareHouseSelectedOption);
            this.incoTermsSelectedOption = this.defaultIncoTerms ||
              this.orderDetails?.incoTerms ||
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
  continueChanges() {
    if (this.shippingOptionChanged == "chooseSolution") {
      this.modalService.hide("changeDeliveryType");
      this.populateShippingOptions();
      this.closeChangeShippingOptionModal();
      this.closeShippingOptionsModalModal();
      // this.onShippingOptionSubmit();
      this.checkAvailability(
        this.checkForItemAddedinCartType,
        this.checkForItemAddedinCartValues
      );
    }
    if (this.shippingOptionChanged == "changeShippingOption") {
      this.submitInfoChanges();
    }
  }
  populateShippingOptions() {
    let shipViaSelectedOption =
      this.shipViaSelectedOption ||
      this.defaultShippingMethod || this.orderDetails?.shippingMethod ||
      this.shippingAddress?.defaultShippingMethod ||
      this.shippingAddress?.defaultShippingCondition;
    let incoTermsLoc2SelectedOption =
      this.incoTermsLoc2SelectedOption?.label ||
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
    this.defaultShippingMethod = shipViaSelectedOption ||
      this.defaultShippingMethod ||
      this.shippingAddress?.defaultShippingMethod ||
      this.shippingAddress?.defaultShippingCondition;
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

    this.defaultShipVia = incoTermsLoc2SelectedOption || this.defaultShipVia;
    this.shippingIndoOptions.defaultShippingCondition =this.defaultShippingMethod;
    this.shippingIndoOptions.defaultShippingMethod = this.defaultShippingMethod;
    this.shippingIndoOptions.originalDefaultShippingMethod = this.userInfo?.isCustomer || this.userInfo?.isSalesPerson  || this.userInfo?.isSalesOps ? this.originalDefaultShippingMethod :this.defaultShippingMethod;
    this.shippingIndoOptions.defaultShippingConditionDesc =
      this.defaultShippingConditionDesc;
    this.shippingIndoOptions.defaultShippingMethodDesc =
      this.defaultShippingConditionDesc;

    this.shippingIndoOptions.defaultShippingWarehouseDesc =
      this.defaultShippingWarehouseDesc;
    this.shippingIndoOptions.defaultShippingWarehouse =
      this.defaultShippingWarehouse;

    this.shippingIndoOptions.defaultIncoTerms = this.defaultIncoTerms;
    this.shippingIndoOptions.defaultIncoTermsDesc = this.defaultIncoTermsDesc;

    this.shippingIndoOptions.defaultShipVia = this.defaultShipVia;
   
  }

  sameDyeLot: boolean = true;
  changeSameDyeLotEvent(event: any) {
    this.sameDyeLot = event.state;
    console.log(this.sameDyeLot);
  }
  shipCompleteFlag: boolean = true;
  submitInfoChanges() {
    this.modalService.hide("changeDeliveryType");
    this.shipCompleteFlag = false;
    this.validateShipViaAddress("chooseSolution");
  }
  closeInfoChanges() {
    this.originalDefaultSM = this.originalSM;
    this.originalDefaultShippingMethod = this.originalSM;;
  
   
    
    this.modalService.hide("changeDeliveryType");
    this.closeChangeShippingOptionModal();
  }

  checkMinMaxValidation(e: any, tab: any, lengthType: any) {
    if (tab == "rolls") {
      let minValue = this.feetyardForm.get("minLength")?.value;
      let maxValue = this.feetyardForm.get("maxLength")?.value;
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
      this.tabFeildsErrMsg = "";
      this.inventoryMinInches = false;
      this.inventoryMinFeet = false;
      this.inventoryMaxFeet = false;
      this.inventoryMaxInches = false;
      // this.minFeetRequired = false;
      // this.minInchesRequired = false;
      // this.maxFeetRequired = false;
      // this.maxInchesRequired = false;      
      // this.feetyardForm.controls["minFeet"].setValidators(null);
      // this.feetyardForm.controls["minInches"].setValidators(null);
      // this.feetyardForm.controls["maxFeet"].setValidators(null);
      // this.feetyardForm.controls["maxInches"].setValidators(null);
      // this.feetyardForm.updateValueAndValidity();
      let notValid = !((Number(minFeet) + (Number(minInches) / 12)) < (Number(maxFeet) + (Number(maxInches) / 12)));
      if (lengthType == "min" && notValid && (minFeet || minInches)) {
        if (maxInches && +minFeet == +maxFeet) {
          this.inventoryMinInches =
            !(+minInches < +maxInches) &&
            minInches &&
            +minFeet == +maxFeet &&
            maxFeet;
          this.tabFeildsErrMsg = this.inventoryMinInches
            ? "Please enter a valid min inches value"
            : "";
          // this.inventoryMinFeet = false;
        } else {
          this.inventoryMinFeet = !(+minFeet < +maxFeet) && maxFeet;
          this.tabFeildsErrMsg = this.inventoryMinFeet
            ? "Please enter a valid min feet value"
            : "";
          // this.inventoryMinInches = false;
        }
        // this.inventoryMaxFeet = false;
        // this.inventoryMaxInches = false;
      } else if (lengthType == "max" && notValid && (maxFeet || maxInches)) {
        if (minInches && +minFeet == +maxFeet) {
          this.inventoryMaxInches =
            !(+minInches < +maxInches) &&
            minInches &&
            maxInches &&
            +minFeet == +maxFeet;
          this.tabFeildsErrMsg = this.inventoryMaxInches
            ? "Please enter a valid max inches value"
            : "";
          // this.inventoryMaxFeet = false;
        } else {
          this.inventoryMaxFeet = !(+minFeet < +maxFeet) && minFeet;
          this.tabFeildsErrMsg = this.inventoryMaxFeet
            ? "Please enter a valid max feet value"
            : "";
          // this.inventoryMaxInches = false;
        }
        // this.inventoryMinFeet = false;
        // this.inventoryMinInches = false;
      }
      // this.minFeetRequired = (!minFeet && !minInches && ((maxFeet && !maxInches) || (maxFeet && maxInches)));
      // this.minInchesRequired = (!minInches && !minFeet && (!maxFeet && maxInches));
      // this.maxFeetRequired = ((minFeet || minInches) && (!maxFeet && !maxInches));
      // this.maxInchesRequired = (!minFeet && minInches && !maxFeet && !maxInches);      
      // this.feetyardForm.clearValidators();
      // if (minFeet || minInches || maxFeet || maxInches) {
      //   if (this.minFeetRequired) {
      //     this.feetyardForm.controls["minFeet"].setValidators(Validators.required);
      //     if (!minFeet) {
      //       this.feetyardForm.controls["minInches"].setValidators(Validators.required);
      //     } else {
      //       this.feetyardForm.controls["minInches"].setValidators(null);      
      //     }
      //   } else if (this.minInchesRequired) {
      //     this.feetyardForm.controls["minInches"].setValidators(Validators.required);
      //   } else if (this.maxFeetRequired) {
      //     this.feetyardForm.controls["maxFeet"].setValidators(Validators.required);
      //     if (!maxFeet) {
      //       this.feetyardForm.controls["maxInches"].setValidators(Validators.required);
      //     } else {
      //       this.feetyardForm.controls["maxInches"].setValidators(null);            
      //     }
      //   } else if (this.maxInchesRequired) {
      //     this.feetyardForm.controls["maxInches"].setValidators(Validators.required);
      //   } else {
      //     this.feetyardForm.clearValidators();          
      //   }
      //   this.feetyardForm.updateValueAndValidity();
      // } else {
      //   this.feetyardForm.reset();
      //   this.feetyardForm.clearValidators();
      //   this.feetyardForm.updateValueAndValidity();   
      // }
      // this.isMinMaxValid = !(!this.minInchesRequired && !this.minFeetRequired && !this.maxInchesRequired && !this.maxFeetRequired);
    }
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
        this.storageService.getItem("defaultAddres").subscribe((res: any) => {
          if (res != null) {
            shipToId = res.shipTo;
          }
          this.fetchMinMaxRollLength(value, shipToId);
        });
      }
    });
  }
  fetchMinMaxRollLength(value: any, shipToId: any) {
    this.productService
      .getMinMaxRollLength(value, this.uid, shipToId, this.productCode)
      .pipe(debounceTime(1000))
      .subscribe({
        next: (res: any) => {
          if (Object.keys(res?.body).length != 0) {
            this.minRollLength = res?.body?.minRoll;
            this.maxRollLength = res?.body?.maxRoll;
            localStorage.setItem("MinRollLength", this.minRollLength);
            localStorage.setItem("MaxRollLength", this.maxRollLength);
            let control = this.feetyardForm.controls;
            if (this.selectedTab != "feet") {
              control["feet"].setValue(value);
            }
            control["feet"].updateValueAndValidity();
            control["targetLength"].setValue(value);
            control["targetLength"].updateValueAndValidity();
            // control["minLength"].setValue(res?.body?.minRoll);
            // control["maxLength"].setValue(res?.body?.maxRoll);
            control["minLength"].updateValueAndValidity();
            control["maxLength"].updateValueAndValidity();
          }
        },
        error: (err) => {},
      });
  }
  onPaste(event: ClipboardEvent) {
    let value = event.clipboardData?.getData("text");
    if (!Number(value)) {
      event.preventDefault();
    }
  }

  excessQntyErrType = "";
  excessQntyErrMsg = "";
  checkExcessQuantity(e: any) {
    const value = Number(e.target?.value);
    const type = this.feetyardForm.get("unit")?.value;
    const minMsg =
      "Excessive quantity entered. Please verify the quantity entered is the desired amount";
    const maxMsg =
      "Excessive quantity entered. Please contact customer service for ordering assistance";
    this.excessQntyErrMsg = "";
    this.excessQntyErrType = "";
    this.uomDetails?.quantityValidation?.filter((d: any) => {
      if (d?.UOM === type) {
        if (value > d?.warnLength && value <= d?.stopLength) {
          this.excessQntyErrMsg = minMsg;
          this.excessQntyErrType = "warning";
        } else if (value > d?.stopLength) {
          this.excessQntyErrMsg = maxMsg;
          this.excessQntyErrType = "danger";
        }
      }
    });
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
  ColorSelected: any
  colorSeleted(event: any){
   this.ColorSelected = event
  }
  stopAlert() {
    setTimeout(() => {
      this.colorSelect = false;
    }, 10000);
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
  
  validateMultiCut() {
    let selectedMultiCutCount = 0;
    for (let control of this.items.controls) {
      let feetValue = control.get("feet")?.value;
      if (feetValue > 0) {
        selectedMultiCutCount++;
      }
    }

    if (selectedMultiCutCount >= 2) {
      this.isMultiCutValid = true;
      return true;
    } else {
      this.isMultiCutValid = false;
      return false;
    }
  }
}
