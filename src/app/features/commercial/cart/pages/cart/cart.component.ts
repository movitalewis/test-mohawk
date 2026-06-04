import {
  Component,
  OnInit,
  TemplateRef,
  Input,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  ElementRef,
  OnDestroy,
  Inject,
  ViewChildren,
  QueryList,
  HostListener,
} from "@angular/core";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import { Columns, Config, DefaultConfig } from "ngx-easy-table";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { XchangeAddAccessoriesLightboxComponent } from "src/app/features/shared/components/xchange-add-accessories-lightbox/xchange-add-accessories-lightbox.component";
import { PlaceReservePopupComponent } from "../../components/place-reserve-popup/place-reserve-popup.component";
import { ProductService } from "../../../products/pages/services/product.service";
import { StorageService } from "src/app/features/http-services/storage.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { TabsetComponent } from "ngx-bootstrap/tabs";
import { Router } from "@angular/router";
import { API_CONSTANTS } from "src/app/features/shared/constants/API-CONSTANTS";
import { ApiService } from "src/app/features/http-services/api.service";
import { ConfirmationDialogComponent } from "src/app/features/shared/components/confirmation-dialog/confirmation-dialog.component";
import { NewReserveNameComponent } from "src/app/features/shared/components/new-reserve-name/new-reserve-name.component";
import { AddUserModalComponent } from "src/app/features/shared/components/add-user-modal/add-user-modal.component";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { GetBuilderInfoComponent } from "src/app/features/shared/components/builder-modals/get-builder-info/get-builder-info.component";
import {
  cartFileTypeArray,
  fileTypeArray,
} from "src/app/features/shared/constants/CONTENT-CONSTANTS";
import { ErrorModalComponent } from "src/app/features/shared/components/error-modal/error-modal.component";
import { QuotesService } from "../../../quotes/services/quotes.service";
import {
  Observable,
  Subject,
  Observer,
  Subscription,
  takeUntil,
  map,
  noop,
  of,
  switchMap,
  forkJoin,
  tap,
  take,
} from "rxjs";
import { OrderService } from "../../../orders/services/order.service";
import { AddCompanionProductsComponent } from "../../../products/components/add-companion-products/add-companion-products.component";
import { DatePipe, DOCUMENT, formatDate } from "@angular/common";
import { jsPDF } from "jspdf";
import { ShareViaEmailLightboxComponent } from "../../../products/components/share-via-email-lightbox/share-via-email-lightbox.component";
import html2canvas from "html2canvas";
import { ResidentialPlpTypes } from "src/app/features/shared/constants/menu/residential.config";
import { CommercialPlpTypes } from "src/app/features/shared/constants/menu/commercial.config";
import { STATES } from "src/app/features/shared/constants/States";
import { ProgressModalComponent } from "src/app/features/shared/components/progress-modal/progress-modal.component";
import { XchangeDataLayerService } from "src/app/features/http-services/data-layer.service";

@Component({
    selector: "commercial-cart",
    templateUrl: "./cart.component.html",
    styleUrls: ["./cart.component.scss"],
    standalone: false
})
export class CartComponent implements OnInit, AfterViewInit, OnDestroy {
  faEllipsisVertical: any = faEllipsisVertical;
  @ViewChild("staticTabs", { static: false }) staticTabs!: TabsetComponent;
  @ViewChildren("hidden") hidden: QueryList<CartComponent> | undefined;
  alertData = {
    message: "Product(s) removed Successfully.",
    type: "info",
  };
  requestDeliveryDate: any;
  showAssignedSpec = false;
  invalidFileString: any = "";
  filesArray: any = [];
  totalFileSize: number = 0;
  poNumber: string = "";
  isCollapsed = false;
  priceLabel:any="";
  salesPersonFlag:boolean=false;
  isCollapsedSecond = true;
  selectedItemNumber: any = 0;
  messageSuccess: boolean = false;
  cartId: any = "";
  cartData: any = {};
  cartNumberData: any = {};
  uid: any = "";
  cartIndexData: any = {};
  reATP: boolean = false;
  cartEntries: any = [];
  cartQuoteNumber:any="";
  priceDetails:any;
  internalComment: boolean = false;
  currentDate = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
    timeZoneName: "short",
  });
  spinnerLoading = false;
  checkoutData: any;
  minDate = new Date();
  columns = [
    { key: "rollNumber", title: "Roll Number" },
    { key: "dyeLot", title: "Dye Lot" },
    { key: "warehouse", title: "Warehouse" },
    { key: "estimatedDeliveryDate", title: "Estimated Delivery Date" },
    { key: "backorderDate", title: "Back Order Date" },
  ];
  submitFor: any = undefined;
  public checkoutForm!: FormGroup;
  breadcrumbItems: BreadcrumbItems = [
    {
      name: "Home",
      path: "/commercial",
      active: false,
    },

    {
      name: "",
      active: true,
    },
  ];
  poMandatoryFlag: boolean = false;
  marketsegmentdata: any;
  modalRef!: BsModalRef;
  userList: any = [];
  defaultAddress: any;
  formattedAddress: any;
  shippingAddress: any = {};
  estimatedDate: any = "";
  totalItems: any;
  alertMsg: string = "";
  alertType = "danger";
  orderPlacedData: any;
  minicartSubscription: any;
  userEmail: any;

  errorAlerts: any = [];
  selectedEndUser: any;
  selectedMarketSegment: any;
  // shipComplete: boolean = true;
  shipCompleteDescription: any;
  isSolutionDetailsClicked: boolean = false;
  endUserDataLoaded: boolean = false;
  isQuoteCart = false;
  quoteCartCode!: number;
  quoteDataMapped = false;
  cartCode: any;
  shipViaOptions: any = [];
  carrierOptions: any = [];
  shippingConditions: string = "";
  incoTermsSelectedOption: any;
  incoTermsOptions: any = [];
  currentSelectedCartEntry: any = {};
  csrFlag: boolean = false;
  carrierModalObj: any = {
   // carrierId: null,

    shipperAccountNumber: "",
    shipperZipCode: "",
    name:"",
    addressLine1:"",
    addressLine2:"",
    city:"",
    state:"",
    country:"",
    postalCode:""
  };
  carrierMoAlertData: any;
  destroySubject: Subject<void> = new Subject();
  restrictPlaceOrder: boolean = false;
  tabId: number = 0;
  completeOrder: boolean = false;
  shippingWareHouseOptions: any = [];
  typeOfproduct: any = "";
  productType: any = "";
  customerFlag: boolean = false;
  subProductType: any;
  isAtpCheck: boolean = false;
  atpCheckProductTypes = JSON.parse(CommercialPlpTypes.atpCheckProductTypes);
  shippingWareHouse: string = "";
  incoTermsLoc2SelectedOption: any;
  incoTermsLoc2Options: any = [];
  smallParcelEligible: boolean = false;
  smallParcelShippingData: any = [];
  showDetailsFlag: boolean = false;
  shippingAddressId: any;
  addtoCartFailed = false;
  addtoCartErrorMessage = "";
  checkoutReqPrice = true;
  marketSegmentCode: any;
  termsCodeList: any = [];
  selectedLine: any;
  selectedTermCode: any;
  invalidPO: boolean = false;
  poSuggestionMsg: any =
    '{ } \\\\(Doublebackslash) []:;" , these special characters are not allowed';
  errorMsg: any = "";
  reInspect: boolean = false;
  deviceType: any;
  mtClass: any;
  pro: any;
  air: any;
  mini: any;
  orderSample: any = "";
  isSampleOrder: boolean = false;
  endUser: any = "";
  creUser: any = "";
  adUser: any = "";
  gpoUser: any = "";
  poSubscription: any;
  states = [...STATES[0]?.states, ...STATES[1]?.states];
  proceedFlag: boolean = false;
  rddFlag: boolean = false;
  modelRoom: boolean = false;
  userInfo: any;
  substituteProductFlag: boolean = false;
  isShipToUser:boolean = false;
  soldToAccount:any = "";
  isRequestedPriceChanged:boolean = false;
  camsCartEntries: any = [];
  shipViaOptionsForPA:any = [{
    value: "UPS",
    label: "UPS",
  },
  {
    value: "UP2",
    label: "UP2",
  },
  {
    value: "UP1S",
    label: "UP1S",
  }];
  shippingOptionsAPIs = new Set<string>();
  // shippingOptionsAPIs: any = ["ShippingMethod", "IncoTerms", "WareHouse", "ShipVia"];
  constructor(
    private cd: ChangeDetectorRef,
    public modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private productService: ProductService,
    public getStorageService: StorageService,
    private fb: FormBuilder,
    private router: Router,
    private apiService: ApiService,
    public userService: UserService,
    private quoteService: QuotesService,
    private orderService: OrderService,
    private datePipe: DatePipe,
    private dataLayer: XchangeDataLayerService,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.minicartSubscription = this.getStorageService
      .getItem("miniCartCount")
      .pipe(takeUntil(this.destroySubject))
      .subscribe((res) => {
        if (res?.code && !this.cartIsLoading) {
          this.cartNumberData = res;
          this.cartData.code = res?.code;
          this.shippingAddressId = res.shipTo;
          this.isSampleOrder = res.sampleOrder;
          // if (res?.sampleOrder == true) {
          //   this.userList = [];
          //   this.userList.push({ name: "Create New Contact", value: "new" });
          // } else {
          this.getSubmittedFor();
          //  }
          this.getCartData();
          //   this.minicartSubscription.unsubscribe();
        }
        this.cd.detectChanges();
        // this.getCartValues();
      });
    this.getStorageService.getItem("uid")
    .pipe(takeUntil(this.destroySubject))
    .subscribe((res) => {
      this.uid = res;
      this.cd.detectChanges();
      // this.getCartValues();
    });
    this.getStorageService.getItem("userInfo")
    .pipe(takeUntil(this.destroySubject))
    .subscribe((res) => {
      this.userInfo = res;
      this.userEmail = res?.uid;
      this.csrFlag = res?.isCSR || res?.isCSRSuperAdmin ? true : false;
      this.internalComment = res?.isCSR && res?.isCSRSuperAdmin ? true : false;
      if (res?.isCSR || res.isSalesPerson) {
        this.showNoFreightAndNoCharge = true;
      } else {
        this.showNoFreightAndNoCharge = false;
      }
      this.customerFlag = res?.isCustomer ? true : false;
      this.salesPersonFlag = res?.isSalesPerson  || res?.isSalesOps ? true:false;
      this.priceLabel = res?.priceLabel;
      this.isShipToUser = res?.isShipToUser;
      this.soldToAccount = res?.orgUnit?.soldTo || "";
      if (!this.csrFlag && !res?.isSalesPerson && !this.submitFor) {
        this.submitFor = {
          uid: res?.uid,
          name: res?.name,
        };
      }
      this.cd.detectChanges();
    });
  }
  showNoFreightAndNoCharge: boolean = false;

  reInspectFlag: boolean = false;
  reInspectShippingOptions: any;
  changeReInspectEvent(event: any, isCompleteCart: boolean, lineItem: any) {
    if (event.state == true && lineItem.reInspect == false) {
      this.isAtpCheck = this.atpCheckProductTypes.includes(
        lineItem.product.subProductType
      );

      this.reInspectFlag = true;
      this.reInspect = event.state;
      this.isCompleteCart = isCompleteCart;
      if (this.isAtpCheck === true) {
        this.selectedShipViaProduct = lineItem;
        this.reInspectShippingOptions = {
          defaultShippingCondition: lineItem?.shippingCondition,
          shippingCondition: lineItem?.shippingCondition,
          defaultShippingConditionDesc: lineItem?.shippingConditionsDesc,
          shippingConditionDesc: lineItem?.shippingConditionsDesc,
          defaultShippingMethod: lineItem?.shippingCondition,
          shippingMethod: lineItem?.shippingCondition,
          defaultShippingMethodDesc: lineItem?.shippingConditionsDesc,
          shippingMethodDesc: lineItem?.shippingConditionsDesc,
          defaultShipVia: lineItem?.shipVia,
          shipVia: lineItem?.shipVia,
          shipViaDesc: lineItem?.shipVia,
          shippingWarehouse: lineItem?.shippingWarehouse,
          shippingWarehouseDesc: lineItem?.shippingWarehouseDesc,
          defaultShippingWarehouse: lineItem?.shippingWarehouse,
          defaultIncoTerms: lineItem?.incoTerms,
          defaultShippingWarehouseDesc: lineItem?.shippingWarehouseDesc,
          incoTerms: lineItem?.incoTerms,
          defaultIncoTermsDesc: lineItem?.incoTermsDesc,
          incoTermsDesc: lineItem?.incoTermsDes
        }

        this.shippingWareHouseModalSubmit();
      } else {
        this.cartEntries.forEach((item: any) => {
          if (item.entryNumber == lineItem.entryNumber) {
            item.reInspect = this.reInspect;
          }
        });
        this.proceed(null, true, true);
      }
    }
  }
  presetValuesForQuoteForm() {
    this.quoteService
      .getQuoteDetails(
        this.userService.getUserEmail().toLowerCase(),
        this.quoteCartCode.toString()
      )
      .subscribe((res: any) => {
        //this.checkoutForm.controls["submitFor"].setValue({ name: "hi" });
        this.checkoutForm.controls["marketSegment"].setValue(
          res?.body?.marketSegment
        );
        this.checkoutForm.controls["endUser"].setValue(
          res.body.endUserDescription
        );
        this.selectedEndUser = res.body.endUserCode;
        this.checkoutForm.controls["jobLocation"].setValue(
          res.body.jobLocation
        );
        this.checkoutForm.get("marketSegment")?.disable();
        this.checkoutForm.get("endUser")?.disable();
        this.checkoutForm.get("jobLocation")?.disable();
      },(err)=>{this.productService.progressHide();});
  }
  cartInfo: any = {};
  cartIsLoading = false;
  requestingPriceForm!: FormGroup;
  builderOrder = "";
  showroom = false;
  marketSegment: any;
  reATPChangeSource:boolean=false;
  sampleCamsOrderNumber:any;
  skipGetCartProgrossModal: boolean = false;
  isCartLoadingModalOpened = false;
  getCartData(cartId: string = "") {
    this.reviewActiveTab = false;
    this.cartIsLoading = true;
    this.cartEntries = [];
    this.camsCartEntries = [];
    // this.spinnerLoading = true;
    const cartIdVal: any = cartId ? cartId : this.cartData?.code || this.cartNumberData?.code;
    this.scrollPageToTop();
    if (!this.skipGetCartProgrossModal && !this.isCartLoadingModalOpened) {
      this.isCartLoadingModalOpened = true;
      this.productService.progressShow('getCart', 'getCartId');
    }
    this.productService.getCartData(cartIdVal).subscribe(
      (res: any) => {
        this.productService.progressHide('getCartId');
        // this.modalService.hide('progressModal');
        // this.checkReserveEligibility(this.cartNumberData?.code);
        this.spinnerLoading = false;

        if (
          res.body?.messages &&
          (res.body?.messages[0]?.status == "Error" ||
            res.body?.messages[0]?.status == "Failed")
        ) {
          const ind = this.errorAlerts.findIndex(
            (item: any) => item.type == "cartData"
          );
          if (ind > 0) {
            this.errorAlerts.splice(ind, 1);
          }
          this.errorAlerts.push({
            type: "cartData",
            message: res.body?.messages[0]?.message,
          });
        }
        // this.checkReserveEligibility(
        //   res?.body?.code || this.cartNumberData?.code
        // );

        let commentsData =
          (res?.body?.b2bCommentData &&
            res?.body?.b2bCommentData[0]?.comment) ||
          "";
        this.checkoutForm.patchValue({
          comments: commentsData,
        });
        this.checkoutForm.controls["marketSegment"].setValue(
          res?.body?.marketSegment
        );
        this.sampleCamsOrderNumber = res.body?.camsCartEntries[0]?.camsOrderNumber;
        /* this.dataLayer.viewCart(
          res?.body?.entries[0]?.totalPrice?.currencyIso ||
            res?.body?.entries[0]?.totalSurchargeValue?.currencyIso ||
            res?.body?.entries[0]?.unitPrice?.currencyIso ||
            "",
          res?.body?.entries?.map((entry: any, index: number) => {
            return {
              item_id: entry.product?.code || "",
              item_name: entry.product?.name || "",
              index,
              item_brand:
                entry.product?.brandName || entry.product?.brandId || "",
              item_category:
                entry.product?.subCategoryCode ||
                entry.product?.subProductType ||
                entry.product?.subCategoryName ||
                "",
              item_category2: entry.product?.productLine || entry.product?.collection || "",
              item_category3:
                entry.product?.styleName || entry.product?.name || "",
              item_category4: entry.product?.colorName || "",
              item_list_id: "",
              item_list_name: "",
              item_variant: `${entry.product?.productLine || ""} ${
                entry.product?.styleName || entry.product?.name || ""
              }`,
              price: entry.unitPrice?.value || 0,
              quantity: entry.quantity || 0,
              uom: entry.uom?.name || "",
            };
          }) || []
        ); */

        this.builderOrder = res?.body?.builderOrder ? "Yes" : "No";
        this.showroom = res?.body?.showroom || this.showroom;;
        this.submitFor = res?.body?.submittedFor || this.submitFor;
        this.orderSample = res?.body?.sampleOrder;
        this.cartQuoteNumber = res.body?.quoteNumber || "";
        this.quoteCartCode = res.body?.quoteNumber;
        this.isQuoteCart = res.body?.quoteNumber != "" && res.body?.quoteNumber != undefined? true: false;
        this.cartIsLoading = false;
        this.reATPChangeSource = res?.body?.shipComplete;
        this.filesArray = res?.body?.poAttachements?.files
          ? res?.body?.poAttachements?.files
          : [];
        this.cartInfo = res?.body;
        this.poMandatoryFlag = res?.body?.poIndicator;
        this.poNumber = res?.body?.poNumber;
        this.checkoutForm.patchValue({ porequest: res?.body?.poNumber });
        this.updatePOflag(this.poMandatoryFlag);
        this.promoCode = res?.body?.promoCode;
        this.marketSegment = res.body?.marketSegment;
        this.defaultAddress = res.body?.deliveryAddress;
        this.storedShippingAddress =
          this.storedShippingAddress || res.body?.deliveryAddress;
        this.formattedAddress = res.body?.deliveryAddress?.companyName
          ? res.body?.deliveryAddress?.companyName
          : " " +
            " " +
            res.body?.deliveryAddress?.line1 +
            " " +
            res.body?.deliveryAddress?.town +
            " " +
            res.body?.deliveryAddress?.region?.isocodeShort +
            " " +
            res.body?.deliveryAddress?.postalCode;
        this.camsCartEntries = res?.body?.camsCartEntries || [];
        if(this.camsCartEntries){
          this.camsCartEntries.forEach((entries: any, i: number) => {
            entries.cartEntries.forEach((item: any, index: number) => {
              this.cartEntries.push(item);
            });
          });
        }
        this.cartEntries?.map(async (item: any) => {
          item.isCollapsed = true;
          item.sideMarkChecked = false;
          if (
            res.body?.shippingConditions === "CA" ||
            res.body?.shippingConditionsDesc === "CA"
          ) {
            this.needTodisabled = true;
            this.productService
              .shippingMethodVendorAccountNumbersAPIv2(
                res.body?.code,
                item.entryNumber
              )
              .subscribe(async (res: any) => {
                if (res?.status == 200) {
                  item.carrierOptionList = [];
                  for (let key in res?.body) {
                    item.carrierOptionList.push([key, res?.body[key]]);
                  }
                } else {
                  item.carrierOptionList = [
                    "123453",
                    "123451",
                    "123452",
                    "123455",
                    "123454",
                  ];
                }
              });
          }
        });
        this.totalItems = res.body?.totalItems;
        this.combinedShippingWarehouse = false;
        if (this.totalItems != 0 && this.totalItems != undefined) {
          if (this.staticTabs?.tabs[0]?.active === true) {
            if (
              !!res.body?.materialAvailableDate &&
              res.body?.materialAvailableDate !== "See line details."
            ) {
              this.estimatedDate = this.datePipe.transform(
                res.body.materialAvailableDate,
                "MM/dd/yyyy"
              );
            } else {
              this.estimatedDate = "See line details.";
            }
          } else {
            if (
              !!res.body?.eddDate &&
              res.body?.eddDate !== "See line details."
            ) {
              this.estimatedDate = this.datePipe.transform(
                res.body.eddDate,
                "MM/dd/yyyy"
              );
            } else {
              this.estimatedDate = "See line details.";
            }
          }
        } else {
          this.estimatedDate = "NA";
        }
        // this.getStorageService.setItem("miniCartCount", res.body);
        if (res.body?.shipComplete === true) {
          this.radioButtonValue = "radio-button-1";
        } else {
          this.radioButtonValue = "radio-button-2";
        }
        if (res.body?.deliveryGrouping === true) {
          this.radioButtonValue = "radio-button-3";
        }

        this.orderIndicator = res?.body?.orderIndicatorPhoneOrEmail || undefined;
        if (this.customerFlag || this.salesPersonFlag) {
          this.orderIndicator = '';
        }
        this.totalItems = res.body?.totalItems;

        this.cartData = res.body;
        this.endUser = this.cartData?.endUser?.name;
        this.creUser = this.cartData?.creUser?.name;
        this.adUser = this.cartData?.adUser?.name;
        this.gpoUser = this.cartData?.gpoUser?.name;
        this.reInspect = this.cartData?.reInspect;
        this.requestDeliveryDate = res.body?.requestedDeliveryDate;
        this.shippingWareHouseSelectedOption = res.body?.shippingWarehouseDesc;
        this.restrictPlaceOrder = this.cartData?.restrictPlaceOrder || this.restrictPlaceOrder;
        this.modelRoom = this.cartData?.modelRoom;
        this.selectedEndUser = this.cartData?.endUser?.uid;
        if(this.storedShippingAddress?.oneTimeShippingAddress){
          let sub: Subscription = this.getStorageService.getItem("defaultAddres")
          // .pipe(takeUntil(this.destroySubject))
          .subscribe((defAddress: any) => {
            if (defAddress) {
              defAddress.shippingInfo = res?.body?.shippingInfo;
              this.getStorageService.setItem("defaultAddres", defAddress);
              sub.unsubscribe();
            }
          });
        } else {
          let sub: Subscription = this.getStorageService.getItem("defaultAddres")
          // .pipe(takeUntil(this.destroySubject))
          .subscribe((defAddress: any) => {
            let rdd = res?.body?.requestedDeliveryDate ? res?.body?.requestedDeliveryDate : new Date();
            rdd = (rdd != "See line details." ? rdd : this.datePipe.transform(new Date(), "MM/dd/yyyy"));
            defAddress = { ...defAddress, rdd: rdd, requestedDeliveryDate: rdd };
            this.getStorageService.setItem("defaultAddres", defAddress);
            sub.unsubscribe();
          });          
        }
        // this.estimatedDate = !!res.body.entries[0].eddDate ? res.body.entries[0].eddDate: res.body.entries[1].eddDate

        this.needTodisabled = !(
          this.cartData?.shippingConditions === "CA" &&
          this.cartEntries.every((e: any) => e?.carrierNumber)
        );        
        if (this.cartData?.replacementOrder == true) {
          if (this.cartData?.replacementOrderInfo?.hasClaimSubmitted == true) {
            this.storedShippingAddress = {
              ...this.storedShippingAddress,
              replacementOrder: this.cartData?.replacementOrder ? true : false,
              hasClaimSubmitted: this.cartData?.replacementOrderInfo?.hasClaimSubmitted ? true : false,
              claimNumber: this.cartData?.replacementOrderInfo?.claimNumber,
              replacementReason: this.cartData?.replacementOrderInfo?.replacementReason,
            };
          } else {
            this.storedShippingAddress = {
              ...this.storedShippingAddress,
              replacementOrder: this.cartData?.replacementOrder ? true : false,
              hasClaimSubmitted: this.cartData?.replacementOrderInfo?.hasClaimSubmitted ? true : false,
              purchaseOrderNumber: this.cartData?.replacementOrderInfo?.purchaseOrderNumber,
              replacementReason: this.cartData?.replacementOrderInfo?.replacementReason,
              orderNumber: this.cartData?.replacementOrderInfo?.replacementOrderNumber,
              invoiceNumber: this.cartData?.replacementOrderInfo?.invoiceNumber,
            };
            
          }
        this.productService.progressHide('getCartId');
        this.combinedShippingWarehouse = false;
        }
        this.productService.progressHide('getCartId');
        this.isCartLoadingModalOpened = false;
      },
      (err: any) => {
        this.productService.progressHide();
        this.isCartLoadingModalOpened = false;
        this.cartIsLoading = false;

        this.totalItems = 0;
        const ind = this.errorAlerts.findIndex(
          (item: any) => item.type == "cartData"
        );
        if (ind > 0) {
          this.errorAlerts.splice(ind, 1);
        }
        this.errorAlerts.push({
          type: "cartData",
          message: err?.error?.errors[0].message,
        });
      }
    );
  }

  errorData(err: any) {
    this.totalItems = 0;
    this.cartIsLoading = false;
    const ind = this.errorAlerts.findIndex(
      (item: any) => item.type == "cartData"
    );
    if (ind > 0) {
      this.errorAlerts.splice(ind, 1);
    }
    this.errorAlerts.push({
      type: "cartData",
      message: err?.error?.errors[0].message,
    });
  }
  mapData(res: any) {
    // this.checkReserveEligibility(this.cartNumberData?.code);
    if (
      res.body?.messages &&
      (res.body?.messages[0]?.status == "Error" ||
        res.body?.messages[0]?.status == "Failed")
    ) {
      const ind = this.errorAlerts.findIndex(
        (item: any) => item.type == "cartData"
      );
      if (ind > 0) {
        this.errorAlerts.splice(ind, 1);
      }
      this.errorAlerts.push({
        type: "cartData",
        message: res.body?.messages[0]?.message,
      });
    }
    // this.checkReserveEligibility(this.cartNumberData?.code || res?.body?.code);
    this.checkoutForm.patchValue({
      comments: res?.body?.comment || "",
    });
    this.checkoutForm.controls["modelRoom"].setValue(
      res?.body?.modelRoom || false
    );
    // this.checkoutForm.controls["submitFor"].setValue(
    //   res?.body?.submittedFor || null
    // );

    this.cartIsLoading = false;

    this.cartInfo = res?.body;
    this.poMandatoryFlag = res?.body?.poIndicator;
    this.poNumber = res?.body?.poNumber;
    this.updatePOflag(this.poMandatoryFlag);
    // this.checkoutForm.controls["marketSegment"].setValue(
    //   res.body.marketSegment
    // );
    this.defaultAddress = res.body.deliveryAddress;
    this.formattedAddress = res.body?.deliveryAddress?.companyName
      ? res.body?.deliveryAddress?.companyName
      : "" +
        res.body?.deliveryAddress?.line1 +
        " " +
        res.body?.deliveryAddress?.town +
        " " +
        res.body?.deliveryAddress?.region?.isocodeShort +
        " " +
        res.body?.deliveryAddress?.postalCode;
    this.cartEntries = res?.body?.entries ? res?.body?.entries : [];
    this.cartEntries?.map((item: any) => {
      item.isCollapsed = true;
      item.disableData = false;
    });
    this.totalItems = res.body.totalItems;
    if (this.totalItems != 0) {
      if (!!res.body.entries[0].eddDate) {
        this.estimatedDate = res.body.eddDate;
      } else {
        this.estimatedDate = "See line details.";
      }
    } else {
      this.estimatedDate = "NA";
    }
    //   this.totalItems = res.body.totalItems;

    this.cartData = res.body;
    this.endUser = this.cartData?.endUser?.name;
    this.creUser = this.cartData?.creUser?.name;
    this.adUser = this.cartData?.adUser?.name;
    this.gpoUser = this.cartData?.gpoUser?.name;
  }

  ngOnDestroy(): void {
    this.destroySubject.next();
    this.destroySubject.complete();
  }

  trackByCamsOrder = (_: number, item: any) => item?.camsOrderNumber ?? _;
  trackByEntryNumber = (_: number, item: any) => item?.entryNumber ?? _;
  // getFormFloorValue() {
  // return this.checkoutForm.value.ShipCompleteOrder !== ""
  //   ? this.checkoutForm.value.ShipCompleteOrder
  //   : this.checkoutForm.value.ShipOrderBasedonAvailability;
  // }
  isAvailableForReserveEligibility: boolean = false;
  nonEligibleCodes: any = [];
  nonEligibleCodeString = "";
  checkReserveEligibility(cartId: any) {
    this.nonEligibleCodes = [];
    this.productService.checkReserveEligibility(cartId).subscribe(
      (res: any) => {
        if (res && res.body) {
          if (res.body?.messages && res.body?.messages[0]?.status == "Error") {
            const ind = this.errorAlerts.findIndex(
              (item: any) => item.type == "checkElgibility"
            );
            if (ind > 0) {
              this.errorAlerts.splice(ind, 1);
            }
            this.errorAlerts.push({
              type: "checkElgibility",
              message: res.body?.messages[0]?.message,
            });
          }
          this.nonEligibleCodes = "";
          this.nonEligibleCodeString = "";
          if (res.body.reserveEligible) {
            /* if (
              res?.body?.nonEligibleCodes !== undefined &&
              res?.body?.nonEligibleCodes.length > 0
            ) {*/
            this.nonEligibleCodes = res.body.nonEligibleCodes;
            this.nonEligibleCodeString = "";
            this.nonEligibleCodes?.forEach((element: any) => {
              this.nonEligibleCodeString += element + "</br>";
            });
            // }
            this.isAvailableForReserveEligibility = true;
          } else {
            this.isAvailableForReserveEligibility = false;
          }
        } else {
          this.isAvailableForReserveEligibility = true;
        }
      },
      (err: any) => {
        this.productService.progressHide();
        this.isAvailableForReserveEligibility = false;
        const ind = this.errorAlerts.findIndex(
          (item: any) => item.type == "checkElgibility"
        );
        if (ind > 0) {
          this.errorAlerts.splice(ind, 1);
        }
        this.errorAlerts.push({
          type: "checkElgibility",
          message: err?.error?.errors[0].message,
        });
      }
    );
  }

  returnToQuote() {
    this.router.navigateByUrl(
      "/commercial/quotes/quote-detail/" + this.quoteCartCode
    );
  }
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      id: "remove-item-from-cart",
      class: "modal-lg modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }

  openModal1(template1: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template1, {
      id: 1,
      class: "modal-lg modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }

  reserveProductsModal() {
    this.ngOnDestroy()
    // this.checkReserveEligibility(this.cartNumberData?.code);
    // this.checkReserveEligibility(this.cartNumberData?.code);
  //  if (this.isAvailableForReserveEligibility) {
      this.openConfirmationModal({
        title: "Reserve Item(s)",
        content:
          this.nonEligibleCodeString == ""
            ? "Are you sure want to create a reserve?"
            : this.nonEligibleCodeString + "Reserve eligible products?",
        primaryActionLabel: "CONTINUE",
        secondaryActionLabel: "CANCEL",
        onPrimaryAction: () => {
          this.modalService.hide('confirmationModal');
          this.placeReserve();
          this.proceed(null, true, true);
        },
        onSecondaryAction: () => this.cancelReserve(),
      });
   // }
  }

     get isCartHasInStockLine() {
    return (this.cartData?.camsCartEntries || []).some((camsEntry: any) => (camsEntry?.cartEntries || []).some((entry: any) => (entry?.availabilityStatus || "").toLowerCase() === 'in stock'));
  }

  placeReserve() {
    // this.productService.placeReserve(this.cartNumberData?.code).subscribe((res: any) => {

    // });
    const initialState: ModalOptions = {
      initialState: {
        // Data to  popup
        getCartAction: (data: any) => {
          this.getStorageService.getItem("uid")
          .pipe(takeUntil(this.destroySubject))
          .subscribe((uid: any) => {
            this.uid = uid;
          });
          this.apiService.getMiniCart(this.uid, this.uid);
          if (data?.status == "Success" || data?.status == "success") {
            this.cartData = {};
            this.modalService.hide('new-reserve-name-modal');
            this.router.navigate(["/commercial/orders/reserves"], {
              queryParams: {
                message: data?.message || "Successfully created reserve.",
              },
            });
          } else if (data?.status == "Error" || data?.status == "error") {
            this.alertMsg = data?.message;
            this.alertType = "danger";
          }
        },
      },
    };
    this.bsModalRef = this.modalService.show(
      NewReserveNameComponent,
      Object.assign(initialState, {
        id: "new-reserve-name-modal",
        class: "modal-lg modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }

  cancelReserve() {
    this.modalService.hide();
  }

  openCartAccessoriesModal(data: any) {
    const initialState: ModalOptions = {
      initialState: {
        type: 2,
        showSuccessAlert: false,
        cartData:this.cartData,
        cartDataProductId: data?.product?.code,
        loadAllAccessoriesDetails: true,
        onClose: () => {
          this.skipGetCartProgrossModal = false;
        },
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
  }
  suggestions$?: Observable<any>;
  suggestionsCre$?: Observable<any>;
  suggestionsGpo$?: Observable<any>;
  suggestionsAd$?: Observable<any>;
  endUsers: any = [];
  notificationUrl: any;
  storedShippingAddress: any;
  notFoundendUser: boolean = false;
  endUserName: string = "";
  orgUid:any;
  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    const { mtClass, deviceType, pro, air, mini } =
      this.userService.getDeviceType();
    this.mtClass = mtClass;
    this.deviceType = deviceType;
    this.pro = pro;
    this.air = air;
    this.mini = mini;
  }
  ngOnInit(): void {
    const { mtClass, deviceType, pro, air, mini } =
      this.userService.getDeviceType();
    this.mtClass = mtClass;
    this.deviceType = deviceType;
    this.pro = pro;
    this.air = air;
    this.mini = mini;

    if (
      this.productService.cloneOrderCartId != "" &&
      (this.getStorageService?.userInfo?.isSalesPerson ||
        this.getStorageService?.userInfo?.isSalesOps)
    ) {
      this.getCartData(this.productService.cloneOrderCartId);
      this.getSubmittedFor();
    }
    if (this.getStorageService.selectedCloneOrders?.selectedLines.length == 0) {
      this.productService.cloneOrderCartId = "";
      this.resetCloneOrderData();
    }
    let baseUrl = this.router.url.split("?")[0].includes("commercial")
      ? "commercial"
      : "residential";
    this.getStorageService.getItem("shippingAddress")
    .pipe(takeUntil(this.destroySubject))
    .subscribe((res: any) => {
      this.storedShippingAddress = res;
      this.cd.detectChanges();
    });
    this.notificationUrl = [`${baseUrl}/my-profile/notification-preferences`];
    this.suggestions$ = new Observable(
      (observer: Observer<string | undefined>) => {
        observer.next(this.checkoutForm.value.endUser);
      }
    ).pipe(
      switchMap((query: string | undefined) => {
        if (query) {
          return this.productService.getEndUserList(this.uid, query).pipe(
            map((res: any) => {
              if (res?.body?.endUsers?.length == 1) {
                let notFoundUser = res?.body?.endUsers.filter(
                  (res: any) => res?.value?.unitName == this.endUserName
                );
                if (notFoundUser) {
                  this.notFoundendUser = true;
                  this.checkoutForm.patchValue({
                    endUser: this.endUserName,
                  });
                  this.selectedEndUser =
                    notFoundUser.length > 0 ? notFoundUser[0].key : "";
                  this.checkoutForm.controls["marketSegment"].enable();
                  return [];
                }
              } else {
                return res?.body?.endUsers || [];
              }
            }),
            tap(
              () => noop,
              (res) => {
                this.spinnerLoading = false;
                res = {
                  body: {
                    endUsers: {
                      entry: [
                        {
                          key: "10100310_8135_80_81",
                          value: "API is erroring",
                        },
                        {
                          key: "10100310_8135_80_81",
                          value: "Here are some",
                        },
                        {
                          key: "10100310_8135_80_81",
                          value: "Hardcode values",
                        },
                      ],
                    },
                  },
                };
                this.endUsers = res.body.endUsers.entry;
              }
            )
          );
        }

        return of([]);
      })
    );
    if (this.orderService.showRsrvDtlSuccessMsg == true) {
      this.alertType = "success";
      this.alertMsg = "Product(s) are added successfully into the cart.";
    }
    this.orderService.showRsrvDtlSuccessMsg = false;
    this.createCheckoutForm();
    // this.getSubmittedFor();
    this.quoteDataMapped = false;
    // if (this.quoteService.convertOrderClicked) {
    //   this.userService.getCurrentUserDetail().subscribe((profileRes: any) => {
    //     this.cartIsLoading = true;
    //     this.quoteService
    //       .convertOrder(this.quoteService.quoteCartCode)
    //       .subscribe(
    //         (res: any) => {
    //           this.quoteService.convertOrderClicked = false;
    //           this.isQuoteCart = true;
    //           this.cartCode = res.body.code;
    //           this.quoteCartCode = res.body.quoteData.code;
    //           this.mapData(res);
    //           this.presetValuesForQuoteForm();
    //           setTimeout(
    //             () =>
    //               this.apiService.getMiniCart(
    //                 profileRes?.body?.orgUnit?.uid,
    //                 profileRes?.body?.email
    //               ),
    //             1000
    //           );
    //         },
    //         (err: any) => {
    //           this.errorData(err);
    //         }
    //       );
    //   });
    // } else {
      // this.minicartSubscription = this.getStorageService
      //   .getItem("miniCartCount")
      //   .subscribe((res) => {
      //     this.cartCode = res.code;

      //     if (res.isQuote) {
      //       this.isQuoteCart = true;
      //       this.quoteCartCode = res.quoteNumber;
      //       this.quoteService
      //         .convertOrder(this.quoteCartCode)
      //         .subscribe((res: any) => {
      //           this.mapData(res);
      //           this.presetValuesForQuoteForm();
      //         });
      //     } else if (res?.code) {
      //       this.cartNumberData = res;
      //       // this.getCartData();
      //     }
      //     this.minicartSubscription.unsubscribe();
      //   });
  //  }

    this.configuration = { ...DefaultConfig };
    this.configuration.checkboxes = false;
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;

    this.builderColumns = [
      { key: "#", title: "", width: "15%" },
      { key: "builder", title: "Builder" },
      { key: "city", title: "City" },
      { key: "state", title: "State" },
    ];

    this.requestingNewPriceForm();
    // this.getBuilderOrder$();
    // this.validatePO(1);
    this.getMarketsegments();
    this.uid = localStorage.getItem("accountNumber");
    // this.getEndUserList("");
    this.getStorageService.getItem("userInfo")
    .pipe(takeUntil(this.destroySubject))
    .subscribe((res) => {
      this.userEmail = res.uid;
      // this.getCartValues();
    });

    if (!this.isQuoteCart) {
      this.checkoutForm.controls["endUser"].setValidators([
        Validators.required,
      ]);
      this.checkoutForm.controls["marketSegment"].disable();
    } else {
      this.checkoutForm.controls["endUser"].clearValidators();
      this.checkoutForm.controls["endUser"].updateValueAndValidity();
    }

    this.userService.getCurrentUserDetail()
    .pipe(takeUntil(this.destroySubject))
    .subscribe((res: any) => {
      this.endUserName = res?.body?.orgUnit?.name;
      this.orgUid = res?.body?.orgUnit?.uid;
    });
    this.getNoChargeReasonCodes();
    this.apiService.getMiniCart(this.uid, this.userEmail);

    this.suggestionsCre$ = new Observable(
      (observer: Observer<string | undefined>) => {
        observer.next(this.checkoutForm.value.cre);
      }
    ).pipe(
      switchMap((query: string | undefined) => {
        if (query) {
          return this.productService.getCreList(this.uid, query).pipe(
            map((res: any) => {
              return res?.body?.endUsers || [];
            }),
            tap(
              () => noop,
              (res) => {
                this.spinnerLoading = false;
                res = {
                  body: {
                    endUsers: {},
                  },
                };
                this.endUsers = res.body.endUsers.entry;
              }
            )
          );
        }
        return of([]);
      })
    );

    this.suggestionsGpo$ = new Observable(
      (observer: Observer<string | undefined>) => {
        observer.next(this.checkoutForm.value.gpo);
      }
    ).pipe(
      switchMap((query: string | undefined) => {
        if (query) {
          return this.productService.getGpoList(this.uid, query).pipe(
            map((res: any) => {
              return res?.body?.endUsers || [];
            }),
            tap(
              () => noop,
              (res) => {
                this.spinnerLoading = false;
                res = {
                  body: {
                    endUsers: {},
                  },
                };
                this.endUsers = res.body.endUsers.entry;
              }
            )
          );
        }
        return of([]);
      })
    );

    this.suggestionsAd$ = new Observable(
      (observer: Observer<string | undefined>) => {
        observer.next(this.checkoutForm.value.ad);
      }
    ).pipe(
      switchMap((query: string | undefined) => {
        if (query) {
          return this.productService.getAdList(this.uid, query).pipe(
            map((res: any) => {
              return res?.body?.endUsers || [];
            }),
            tap(
              () => noop,
              (res) => {
                this.spinnerLoading = false;
                res = {
                  body: {
                    endUsers: {},
                  },
                };
                this.endUsers = res.body.endUsers.entry;
              }
            )
          );
        }
        return of([]);
      })
    );
  }

  noChargeReasonsList: any = [];
  noChargeReasonsObj: any;
  getNoChargeReasonCodes() {
    this.noChargeReasonsList = [];
    this.noChargeReasonsObj = {};
    this.productService.getNoChargeReasonCodes().subscribe((res: any) => {
      if (res?.body && Object.keys(res?.body).length > 0) {
        this.noChargeReasonsObj = res?.body;
        for (let key in res.body) {
          this.noChargeReasonsList.push({ value: key, label: res.body[key] });
        }
      }
    },(err)=>{this.productService.progressHide();});
  }
  getMarketsegments() {
    this.productService.getmarketsegment().subscribe((res: any) => {
      if (res?.body?.marketSegments) {
        this.marketsegmentdata = res?.body?.marketSegments.sort(
          (a: any, b: any) => (a.code < b.code ? -1 : 1)
        );
      } else {
        this.marketsegmentdata = [];
      }
    },(err)=>{this.productService.progressHide();});
  }
  requestQuoteBack(){
    this.router.navigateByUrl("/commercial/quotes/quote-detail/"+this.cartData?.quoteNumber);
  }

  showPoSuggestionMsg:boolean = false;
  keyPressAlphaNumeric(e: KeyboardEvent) {
    let lastKey =
      this.poNumber && this.poNumber.charAt(this.poNumber.length - 1);
    if (lastKey == "\\" && lastKey == e.key) {
      return false;
    }
    this.showPoSuggestionMsg = /^[^{}[\]:;".\\]*$/.test(e.key) ? false : true;
    return /^[^{}[\]:;".\\]*$/.test(e.key) ;
  }

  onPastePONumber(event: ClipboardEvent) {
    let value:any = event.clipboardData?.getData("text");
    this.showPoSuggestionMsg = /^[^{}[\]:;".\\]*$/.test(value) ? false : true;
    if(value.includes("\\")){
      this.showPoSuggestionMsg = true;
      return false;
    }
    return /^[^{}[\]:;".\\]*$/.test(value);
  }

  ngAfterViewInit() {
    this.changeTab(0);
    if (this.staticTabs?.tabs[0]) {
      this.staticTabs.tabs[0].active = true;
    }
  }

  getCartValues() {
    /* if (this.cartNumberData) {
      this.productService
        .getCartEntries(this.cartNumberData?.code)
        .subscribe((res: any) => {
          this.cartData = res.body;
          this. 
        });
    }*/
    //  this.getDataFromIndexDb();
    //  this.getShippingAddress();

    this.productService
      .getCartData(this.getStorageService?.cartData?.code)
      .subscribe(
        (res: any) => {
          if (
            res.body?.messages &&
            (res.body?.messages[0]?.status == "Error" ||
              res.body?.messages[0]?.status == "Failed")
          ) {
            const ind = this.errorAlerts.findIndex(
              (item: any) => item.type == "cartData"
            );
            if (ind > 0) {
              this.errorAlerts.splice(ind, 1);
            }
            this.errorAlerts.push({
              type: "cartData",
              message: res.body?.messages[0]?.message,
            });
          }
          this.checkoutForm.controls["marketSegment"].setValue(
            res.body.marketSegment
          );
          this.defaultAddress = res.body.deliveryAddress;
          this.formattedAddress =
            res.body?.deliveryAddress?.companyName +
            " " +
            res.body?.deliveryAddress?.line1 +
            " " +
            res.body?.deliveryAddress?.town +
            " " +
            res.body?.deliveryAddress?.region?.isocodeShort +
            " " +
            res.body?.deliveryAddress?.postalCode;

          this.cartEntries = res?.body?.entries ? res?.body?.entries : [];
          this.totalItems = res.body.totalItems;
          if (res.body?.shipComplete === true) {
            this.radioButtonValue = "radio-button-1";
          } else {
            this.radioButtonValue = "radio-button-2";
          }
          if (res.body?.deliveryGrouping === true) {
            this.radioButtonValue = "radio-button-3";
          }
          if (this.totalItems != 0) {
            if (!!res.body.eddDate) {
              this.estimatedDate = res.body.eddDate;
            } else {
              this.estimatedDate = "See line details.";
            }
          } else {
            this.estimatedDate = "NA";
          }
          // this.estimatedDate = !!res.body.entries[0].eddDate ? res.body.entries[0].eddDate: res.body.entries[1].eddDate
          this.cartData = res.body;
          this.endUser = this.cartData?.endUser?.name;
          this.creUser = this.cartData?.creUser?.name;
          this.adUser = this.cartData?.adUser?.name;
          this.gpoUser = this.cartData?.gpoUser?.name;
          if (!this.rddFlag) {
            let rdd = res?.body?.requestedDeliveryDate ? res?.body?.requestedDeliveryDate : new Date();
            rdd = (rdd != "See line details." ? rdd : this.datePipe.transform(new Date(), "MM/dd/yyyy"));
            this.shippingAddress = { ...this.shippingAddress, rdd: rdd, requestedDeliveryDate: rdd };
            this.storedShippingAddress = { ...this.storedShippingAddress, rdd: rdd, requestedDeliveryDate: rdd };
            this.getStorageService.setItem("shipping-address", this.shippingAddress);
            this.getStorageService.setItem("shippingAddress", this.storedShippingAddress);
          }

          if (!!res.body.submittedFor) {
            this.userList.push(res.body.submittedFor);
          } else if (this.userList.length === 0) {
            this.getStorageService.getItem("userInfo")
            .pipe(takeUntil(this.destroySubject))
            .subscribe((res) => {
              this.userList = [];
              this.userList.push(res);
            });
          }
        },
        (err) => {
          const ind = this.errorAlerts.findIndex(
            (item: any) => item.type == "cartData"
          );
          if (ind > 0) {
            this.errorAlerts.splice(ind, 1);
          }
          this.errorAlerts.push({
            type: "cartData",
            message: err?.error?.errors[0].message,
          });
        }
      );
  }

  getSubmittedFor(): any {
    this.userList = [];
    let tempUserList: any[] = [];
    this.productService.getSubmittedFor().subscribe(
      (res: any) => {
        let users = res?.body?.users ? res?.body?.users : [];
        if (users.length > 0) {
          users.map((e: any) =>
            tempUserList.push({ ...e, name: `${e.firstName} ${e.lastName}` })
          );
          tempUserList.push({ name: "Create New Contact", value: "new" });
          this.userList = tempUserList;
        } else if (users.length === 0) {
          this.getStorageService.getItem("userInfo")
          .pipe(takeUntil(this.destroySubject))
          .subscribe((res) => {
            this.userList = [];
            this.userList.push(res);
            this.userList.push({ name: "Create New Contact", value: "new" });
          });
        }
      },
      (err) => {this.productService.progressHide();}
    );
  }

  closePopup(selectedId: string) {
    this.modalService.hide(selectedId);
  }

  removeSingleItemFromCart(selectedId: string, entryNumbr: any) {
    this.scrollPageToTop();
    this.spinnerLoading = true;
    this.dataLayer.removeFromCart(
      this.cartData?.totalPrice?.currencyIso || "",
      this.cartData?.entries
        ?.map((entry: any, index: number) => {
          return {
            item_id: entry.product?.code || "",
            item_name: entry.product?.name || "",
            index,
            item_brand:
              entry.product?.brandName || entry.product?.brandId || "",
            item_category:
              entry.product?.subCategoryCode ||
              entry.product?.subProductType ||
              entry.product?.subCategoryName ||
              "",
            item_category2:
              entry.product?.productLine || entry.product?.collection || "",
            item_category3:
              entry.product?.styleName || entry.product?.name || "",
            item_category4: entry.product?.colorName || "",
            item_list_id: "",
            item_list_name: "",
            item_variant: `${entry.product?.productLine || ""} ${
              entry.product?.styleName || entry.product?.name || ""
            }`,
            price: entry.unitPrice?.value || 0,
            quantity: Number(entry.pricingUOMQuantity) || 0,
            uom: entry.pricingUom || "",
            selected_uom: entry.uom?.code || "",
          };
        })
        ?.filter(
          (entry: { index: any }) => entry.index == (entryNumbr - 1 || 0)
        )
    );
    this.productService.progressShow('removeItemFromCart', "removeItemFromCartId");
    this.productService
      .removeSelectedItemFromCart(
        this.cartData?.cartNumber || this.cartData?.code,
        entryNumbr
      )
      .subscribe(
        (res: any) => {
          this.productService.progressHide();
          this.productService.progressHide("removeItemFromCartId");
          this.spinnerLoading = false;

          this.messageSuccess = true;
          this.autoDismissMsg();
          // this.apiService.getMiniCart(this.uid, this.userEmail);
          this.getStorageService
            .getItem("uid")
            .pipe(take(1))
            .subscribe((uid: any) => {
              this.uid = uid;
              this.productService
                .getMiniCartData(this.uid)
                .subscribe((res: any) => {
                  this.getStorageService.setItem("miniCartCount", res.body);
                  if (
                    res.body?.errorMessage?.includes("No Cart existed") ||
                    res.body.totalItems == 0
                  ) {
                    this.cartData = {};
                  } else {
                    //this.getCartData();
                    this.proceed(null, true, true);
                  }
                });
            });
        },
        (err: any) => {
          this.productService.progressHide("removeItemFromCartId");
          this.spinnerLoading = false;
        }
      );
    this.closePopup(selectedId);
  }

  clearAllfromCart() {
    this.productService
      .removeAllFromCart(this.cartData?.cartNumber || this.cartData?.code)
      .subscribe((res: any) => {
        this.messageSuccess = true;
        this.cartData = res.body;
        this.autoDismissMsg();
      });
  }

  autoDismissMsg() {
    setTimeout(() => {
      // <<<---using ()=> syntax
      this.messageSuccess = false;
    }, 3000);
  }

  /*getDataFromIndexDb() {
    this.getStorageService
      .getItem("solutionsValue")
      .subscribe((solutionsValue: any) => {
        this.cartIndexData = solutionsValue;
      });
  }*/

  /*getShippingAddress() {
    this.getStorageService
      .getItem("defaultAddres")
      .subscribe((shippingAddress: any) => {
        this.shippingAddress = shippingAddress;
        this.shippingAddress.formattedAddress =
          shippingAddress?.addressLine1 +
          ", " +
          shippingAddress?.addressCity +
          ", " +
          shippingAddress?.addressPostalCode;
      });
  }
*/
  createCheckoutForm() {
    this.checkoutForm = this.fb.group({
      submitFor: [
        null,
        [Validators.required, Validators.pattern(/^(?=.*[a-zA-Z0-9]).*$/)],
      ],
      endUser: [null],
      cre: [null],
      gpo: [null],
      ad: [null],
      jobLocation: [
        "",
        [Validators.required, Validators.pattern(/^(?![\s])[a-zA-Z0-9\s\S]*$/)],
      ],
      marketSegment: [
        "",
        [Validators.required, Validators.pattern(/^(?=.*[a-zA-Z0-9]).*$/)],
      ],
      modelRoom: [false],
      shipAvailability: [""],
      standardShipping: [""],
      estdeliverydate: [""],
      reqdeliverydate: [""],
      shipCompleteOrder: [""],
      groupWithFewerShipment: [""],
      // ShipOrderBasedonAvailability: [""],
      porequest: [
        "",
        [Validators.required, Validators.pattern(/^(?![\s])[a-zA-Z0-9\s\S]*$/)],
      ],
      sidemark: [""],
      promocode: [""],
      comments: [""],
    });

    this.checkoutForm.valid;
  }

  placeOrder(tabId: any) {
    // this.palceCheckout();
    this.changeTab(tabId);
  }

  isSubmitted = false;
  palceCheckout() {
    this.isSubmitted = true;
    if (this.checkoutForm.valid) {
      this.shippingAddress["marketSegment"] =
        this.checkoutForm.value.marketSegment;
      this.shippingAddress["formattedAddress"] = this.formattedAddress;
      let payload = {
        token: "tok_demo",
        accountNumber: "22100075_8135_80_81",
        billingAddress: {
          firstName: "Premanand",
          id: this.shippingAddress.id,
          lastName: "Shelke",
          titleCode: "Mr",
          district: this.shippingAddress.town,
          line1: this.shippingAddress.line1,
          phone: "6667778787",
          postalCode: this.shippingAddress.postalCode,
          town: this.shippingAddress.town,
          region: this.shippingAddress.isocode,
          country: this.shippingAddress.country,
        },
      };
      if (this.isQuoteCart) {
        this.openProgressModal({ progressText: "Placing Quote..." });
        this.quoteService
          .placeQuoteOrder(this.quoteCartCode)
          .subscribe((res: any) => {
            this.modalService.hide();
            this.messageSuccess = true;
            this.cartData = res.body;
          },() => {
              this.modalService.hide('progressModal');
          });
      } else {
        // this.openProgressModal({ progressText: "Placing Order..." });
        this.productService.progressShow('placeOrder', 'placeOrderId');
        this.productService
          .placeOrder(payload, "cartId")
          .subscribe((res: any) => {
            this.modalService.hide('placeOrderId');
            this.messageSuccess = true;
            this.cartData = res.body;
          },() => {
            this.modalService.hide('placeOrderId');
          });
      }
    }
  }

  changeTab(tabId: number) {
    this.alertMsg = "";
    this.alertType = "";
    this.tabId = tabId;
    this.staticTabs?.tabs.filter((res: any, i: number) => {
      if (i === tabId) {
        res.disabled = false;
      } else {
        res.disabled = true;
      }
    });
    if (this.breadcrumbItems.length > 2) {
      this.breadcrumbItems.pop();
    }
    if (tabId == 0) {
      this.breadcrumbItems[1].name = "Cart";
      this.breadcrumbItems[1].active = true;
    } else if (tabId == 1) {
      this.breadcrumbItems[1].active = false;
      this.breadcrumbItems.push({
        name: "Review Order",
        active: true,
      });
    } else {
      this.breadcrumbItems[1].name = "Orders";
      this.breadcrumbItems[1].path = "/commercial/orders?page=0";
      if (this.cartNumberData?.sampleOrder) {
        this.breadcrumbItems[1].path = "/commercial/orders?page=2";
      }
      this.breadcrumbItems[1].active = false;
      this.breadcrumbItems.push({
        name: "Order Confirmation",
        active: true,
      });
    }
  }
  validateAddressModal(message: any, showPrimary: any, staticTabs?: any) {
    this.openConfirmationModal({
      title: "Purchase Order Validation",
      content: message,
      primaryActionLabel: showPrimary == true ? "Continue" : "",
      secondaryActionLabel: "Use a different PO #",
      onPrimaryAction: () => this.returnToCart(staticTabs),
      onSecondaryAction: () => this.returnToCartClear(),
    });
  }
  validateCartModal(message: any, staticTabs?: any) {
    this.openConfirmationModal({
      title: "Purchase Order Validation",
      content: message,
      primaryActionLabel: "",
      secondaryActionLabel: "Dismiss",
      onPrimaryAction: () => this.returnToCart(staticTabs),
      onSecondaryAction: () => this.returnToCart(staticTabs),
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
        id: "confirmationModal",
        class: "modal-md modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }
  returnToCartClear() {
    this.hideConfirmationModal();
    this.poNumber = "";
    this.cd.detectChanges();
  }
  returnToCart(staticTabs?: any) {
    this.modalService.hide("confirmationModal");
    this.proceed(staticTabs);
    this.cd.detectChanges();
  }
  hideConfirmationModal() {
    this.modalService.hide("confirmationModal");
  }
  proceedWithPOvalidation(staticTabs?: any) {
    if ((this.cartData.poNumber != this.poNumber && this.poNumber.length > 0) || (this.invalidPO || this.cartData?.poIndicator)) {
      this.validatePO(staticTabs);
    } else {
      this.proceed(staticTabs);
    }
  }

  validatePO(staticTabs?: any) {
    // if (this.poNumber.length < 1) {
    //   return;
    // }
    if (this.poNumber || this.invalidPO || this.cartData?.poIndicator) {
      let cartID = this.cartNumberData?.code;
      if (this.poSubscription) {
        this.poSubscription.unsubscribe();
      }
      // this.openProgressModal({ progressText: "Proceeding to Order Review.." });
      this.productService.progressShow('validatePO', 'validatePOId');
      this.poSubscription = this.productService
        .validatePO(cartID, encodeURIComponent(this.poNumber))
        .subscribe((res: any) => {
          this.productService.progressHide('validatePOId');
          this.modalService.hide('progressModal');
          if (res.body.status == "warning") {
            this.validateAddressModal(res.body.message, true, staticTabs);
            this.invalidPO = false;
          } else if (res.body.status == "error") {
            this.validateCartModal(res.body.message, staticTabs);
            this.invalidPO = true;
          } else {
            this.invalidPO = false;
            this.proceed(staticTabs);
          }
        },(err)=>{this.productService.progressHide('validatePOId');});
    }
  }
  updatePOflag(flag: boolean) {
    if (flag) {
      this.checkoutForm.controls["porequest"].setValidators([
        Validators.required,
        Validators.pattern(/^(?![\s])[a-zA-Z0-9\s\S]*$/),
      ]);
      // this.checkoutForm.controls["porequest"].updateValueAndValidity();
    } else {
      this.checkoutForm.controls["porequest"].clearValidators();

      this.checkoutForm.controls["porequest"].updateValueAndValidity();
    }
    //log(this.checkoutForm);
  }
  cancelCartConfirmation() {
    this.errorMsg = "";
    this.allowShippingPreferenceChange = true;        
    if (this.getStorageService.selectedCloneOrders?.selectedLines.length > 1) {
      this.openConfirmationModal({
        title: "Cancel Cart",
        content:
          "Are you sure want to cancel the cart and proceed with next account in sample orders clone?",
        primaryActionLabel: "YES",
        secondaryActionLabel: "NO",
        onPrimaryAction: () => 
        {
          this.proceed(null, true, true);
          this.cancelCart();
        },
        onSecondaryAction: () => this.hideConfirmationModal(),
      });
    } else if (
      this.getStorageService.selectedCloneOrders?.selectedLines.length == 1
    ) {
      this.openConfirmationModal({
        title: "Cancel Cart",
        content: "Are you sure you want to cancel cart?",
        primaryActionLabel: "Back to Clone Orders",
        secondaryActionLabel: "NO",
        onPrimaryAction: () => this.cancelCart(),
        onSecondaryAction: () => this.hideConfirmationModal(),
      });
    } else {
      this.openConfirmationModal({
        title: "Cancel Cart",
        content: "Are you sure you want to cancel cart?",
        primaryActionLabel: "YES",
        secondaryActionLabel: "NO",
        onPrimaryAction: () => this.cancelCart(),
        onSecondaryAction: () => this.hideConfirmationModal(),
      });
    }
  }
  cancelCart() {
    this.hideConfirmationModal();
    // this.spinnerLoading = true;
    this.productService.progressShow('cancelCart', 'cancelCartId');
    this.productService.cancelCart(this.cartData?.code || "123456").subscribe({
      next: (res) => {
        this.productService.progressHide('cancelCartId');
        this.messageSuccess = true;
        this.autoDismissMsg();
        if (res.status == 200) {
          this.spinnerLoading = false;
          this.dataLayer.removeFromCart(
            this.cartEntries[0]?.totalPrice?.currencyIso ||
              this.cartEntries[0]?.totalSurchargeValue?.currencyIso ||
              this.cartEntries[0]?.unitPrice?.currencyIso ||
              "",
            this.cartEntries?.map((entry: any, index: number) => {
              return {
                item_id: entry.product?.code || "",
                item_name: entry.product?.name || "",
                index,
                item_brand:
                  entry.product?.brandName || entry.product?.brandId || "",
                item_category:
                  entry.product?.subCategoryCode ||
                  entry.product?.subProductType ||
                  entry.product?.subCategoryName ||
                  "",
                item_category2:
                  entry.product?.productLine || entry.product?.collection || "",
                item_category3:
                  entry.product?.styleName || entry.product?.name || "",
                item_category4: entry.product?.colorName || "",
                item_list_id: "",
                item_list_name: "",
                item_variant: `${entry.product?.productLine || ""} ${
                  entry.product?.styleName || entry.product?.name || ""
                }`,
                price: entry.unitPrice?.value || 0,
                quantity: entry.quantity || 0,
                uom: entry.uom?.name || "",
              };
            }) || []
          );
          // this.addtoCartFailed = true;
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
          if (this.isQuoteCart) {
            this.router.navigateByUrl(
              "/commercial/quotes/quote-detail/" + this.quoteCartCode
            );
          }
          this.cartData = {};
          this.createCheckoutForm();
          /* this.productService.getMiniCartData(this.uid).subscribe((res) => {
            this.cartData = res?.body || res;
            this.getStorageService.setItem("miniCartCount", this.cartData);
          }); */
          this.productService.getLatestMiniCart(this.uid);
          if (
            this.getStorageService.selectedCloneOrders?.selectedLines.length > 0
          ) {
            this.cloneOrdersFromCancelCart();
          }
        }
      },
      error: (error: any) => {
        this.productService.progressHide('cancelCartId');
        this.spinnerLoading = false;
        // this.addtoCartFailed = true;
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        this.cartData = {};
      },
    });
  }
  validateSmallParcel() {
    this.productService.validateSmallParcel(this.cartData?.code).subscribe((res: any) => {
      this.smallParcelEligible = res.body?.smallParcelEligible;
    });
  }
  reviewActiveTab: boolean = false;
  flagForChange:boolean = false;
  proceed(staticTabs?: any, stayInSameTab?: boolean, ignoreValidation = false) {
    this.rddFlag = false;
    this.reviewActiveTab =
      staticTabs != undefined && (staticTabs.tabs[1].active = true)
        ? true
        : false;

    if (
      ignoreValidation == false &&
      (this.submitFor == "" ||
        this.submitFor == null ||
        !this.checkoutForm.valid ||
        this.checkNoChargeReasonSelected() ||
        this.invalidPO
      )
    ) {
      return;
    }

    let items: any = [];

    this.camsCartEntries.forEach((entries: any, i: number) => {
      entries.cartEntries.forEach((item: any, index: number) => {
        items.push({
          lineNumber: item?.entryNumber,
          noFreight: item?.noFreight,
          noCharge: item?.noCharge,
          noChargeReasonCode:
            this.cartData?.modelRoom !== undefined && !this.cartData?.modelRoom
              ? item?.noChargeReasonCode
              : "",
          reInspect: item?.reInspect,
          priceComment: item?.priceComment,
          requestedPrice: this.checkoutForm.value.requestedPrice || item?.requestedPrice,
          sideMark: item?.sideMark,
          incoTerms: item?.incoTerms,
          shipVia: item?.shipVia?.label ? item?.shipVia?.label: item?.shipVia || "",
          shipperZipCode: item?.zipcode,
          shipperAccountNumber: item?.accountNumber,
          carrierType: item?.carrierType,
          requestedDeliveryDate: item?.requestedDeliveryDate,
          termsCode: this.cartData?.termsCode,        
          shippingCondition: (this.userInfo?.isCustomer || this.userInfo?.isSalesPerson || this.userInfo?.isSalesOps) ? item?.originalDefaultShippingMethod || this.originalDefaultShippingMethod : item?.shippingCondition,
          shippingWarehouse: item?.shippingWarehouse,
        });
      });
    });
    this.checkoutForm.value.endUser = this.selectedEndUser || "";
    const payLoad = {
      attentionTo: "attension",
      modelRoom: this.checkoutForm.value.modelRoom,
      comment: this.checkoutForm.controls["comments"].value,
      internalComment: this.internalComment,
      carrierType: this.cartData?.smallParcelCarrier,
      endUserCode: this.selectedEndUser || "",
      creUserCode: this.selectedCre || "",
      gpoUserCode: this.selectedGpo || "",
      adUserCode: this.selectedAd || "",
      items: items,
      jobLocation: this.checkoutForm.controls["jobLocation"].value,
      marketSegment: this.checkoutForm.controls["marketSegment"].value,
      poNumber: this.checkoutForm.value.porequest,
      promoCode: this.checkoutForm.value.promocode,
      shipComplete: this.flagForChange ? false : this.radioButtonValue == "radio-button-1",
      shipperAccountNumber: this.cartData?.accountNumber,
      shipperZipCode: this.cartData?.zipcode,
      deliveryGrouping: this.radioButtonValue === "radio-button-3",
      termsCode: this.cartData?.termsCode,
      submittedFor: this.submitFor?.uid,
      orderIndicatorPhoneOrEmail: this.orderIndicator
    };
    this.flagForChange = false;
    this.isShipOrderBased = false;
    // this.spinnerLoading = true;
    this.allowShippingPreferenceChange = true;
    if (this.proceedFlag) {
      this.productService.progressShow('orderReview', 'orderReviewId');
      // this.openProgressModal({ progressText: "Proceeding to Order Review.." });
    }
    if (stayInSameTab) {
      this.productService.progressShow('updateCart', 'updateCartId');  
    }
      this.productService
      .proceedToCheckout(payLoad, this.cartData?.code)
      .subscribe((res: any) => {
        this.productService.progressHide(this.proceedFlag ? 'orderReviewId' : 'updateCartId');
        this.alertType = "";
        this.errorMsg = "";
        this.proceedFlag = false;
        if (res?.status == 500) {
          // this.productService.progressHide();
          // this.modalService.hide('progressModal');
          // this.modalService.hide();
          this.alertType = "danger";
          this.errorMsg = res?.name;
          return;
        }
        if(res?.body?.errorMessages && 
          res?.body?.errorMessages.length > 0
          ){
            this.alertType = "danger";
            this.errorMsg = res?.body?.errorMessages[0].message;
            // this.modalService.hide("progressModal");
            return;
          }
        
        if (stayInSameTab) {
          /* this.productService.progressHide();
          this.modalService.hide("progressModal");
          this.modalService.hide(); */
          this.getCartData(this.cartData?.code);
        } else {
          if((this.cartData?.sampleOrder == false && this.userInfo.isCSR) || (this.cartData?.sampleOrder ==true && this.cartData?.incoTerms == "C3P") ||
              (this.cartData?.sampleOrder == false && !this.userInfo.isCSR && this.cartData?.incoTerms == "C3P")){
            if(this.cartData?.shipComplete === true) {
              this.productService.progressShow('validateSmallParcel', 'validateSmallParcelId');
                this.productService.validateSmallParcel(this.cartData?.code).subscribe((res: any) => {
                this.productService.progressHide('validateSmallParcelId');
                this.smallParcelEligible = res.body?.smallParcelEligible;
                if (res?.status == 200 && res.body?.smallParcelEligible === false && this.cartData?.shippingConditions === "PA" && this.cartData?.shipComplete === true ) {
                  // this.modalService.hide("progressModal");
                  // this.modalService.hide();
                  this.spinnerLoading = false;
                  this.alertType = "danger";
                  this.errorMsg = "This cart does not qualify for small parcel shipping. Please update your shipping options.";
                  this.hideErrorMsg();
                  return;
                }
                // this.productService.progressHide();
                this.proceedToCheckout(staticTabs);
           
              }, () => {
                this.productService.progressHide('validateSmallParcelId');
              });
            } else{
              if(this.cartData?.parcelFlag === true){
                // this.modalService.hide();
                this.spinnerLoading = false;
                this.alertType = "danger";
                this.errorMsg = "Shipping method 'Parcel' is not eligible for Ship Order Based on Availability. Please select a different Shipping Method to proceed.";
                this.hideErrorMsg();
                return;
              }

              if(this.cartData?.c3pIncoTermsFlag == true && this.cartData?.incoTerms != 'C3P'){
                // this.modalService.hide();
                this.spinnerLoading = false;
                this.alertType = "danger";
                this.errorMsg = "Please change either all lines items are to C3P or change the current line to some other inco terms.";
                this.hideErrorMsg();
                return;
              }
              //this.productService.progressHide();
              this.proceedToCheckout(staticTabs);
            }
          }else{
            //this.productService.progressHide();
            this.proceedToCheckout(staticTabs);
          }
        }
      }, () => {
        this.productService.progressHide(this.proceedFlag ? 'orderReviewId' : 'updateCartId');
      });
    this.scrollPageToTop();
  }

  proceedToCheckout(staticTabs?: any){
    this.productService.progressShow('checkout', 'checkoutId');
    this.productService
      .cartToCheckout(this.cartData?.code)
      .subscribe((resp: any) => {
        // this.modalService.hide("progressModal");
        this.productService.progressHide('checkoutId');
        this.modalService.hide();
        this.spinnerLoading = false;
        if (resp?.status == 500) {
          this.alertType = "danger";
          this.errorMsg = resp?.error;
          // this.productService.progressHide();
          return;
        }
        if(resp?.body?.errorMessages && 
          resp?.body?.errorMessages.length > 0
          ){
            this.alertType = "danger";
            this.errorMsg = resp?.body?.errorMessages[0].message;
            this.productService.progressHide();
            return;
          }
        this.checkoutData = resp?.body;
        this.dataLayer.beginCheckout(this.checkoutData?.subTotal?.value);
        this.cartData = resp?.body;
        this.camsCartEntries = resp?.body?.camsCartEntries ? resp?.body?.camsCartEntries : [];
        this.cartEntries = [];
        if(this.camsCartEntries){
          this.camsCartEntries.forEach((entries: any, i: number) => {
            entries?.cartEntries.forEach((item: any, index: number) => {
              this.cartEntries.push(item);
            });
          });
        }
        this.changeTab(1);
        this.isRequestedPriceChanged = false;
        if(!(this.cartData?.quoteNumber != '' && this.cartData?.quoteNumber != undefined)){
          this.cartEntries.map((item: any) => {
            if ( item?.requestedPrice > 0) {
              this.isRequestedPriceChanged = true;
            }
          });
        }

        staticTabs != undefined
          ? (staticTabs.tabs[1].active = true)
          : null;
        this.showroom = resp?.body?.showroom;
        // this.productService.progressHide();
      }, () => {
        this.productService.progressHide('checkoutId');
      });
  }

  hideErrorMsg(){
    setTimeout(() => {
      this.errorMsg = '';
    }, 5000);
  }

  submitOrderVal: any;

  submitOrder(staticTabs: any) {
    this.alertMsg = "";
    // this.spinnerLoading = true;
    if (this.isQuoteCart) {
      this.openProgressModal({ progressText: "Placing Quote order.." });
      this.quoteService.placeQuoteOrder(this.quoteCartCode).subscribe(
        (res) => {
          this.modalService.hide();
          this.onSuccess(res, staticTabs);
        },
        (err: any) => {
          this.productService.progressHide();
          this.modalService.hide();
          this.onFail(err, staticTabs);
        }
      );
    } else {
      this.productService.progressShow('placeOrder', 'placeOrderId');
      // this.openProgressModal({ progressText: "Placing Order.." });
      this.productService.submitOrder(this.cartData?.code, {}).subscribe(
        (res) => {
          this.productService.progressHide('placeOrderId');
          // this.modalService.hide('progressModal');
          this.modalService.hide();
          this.onSuccess(res, staticTabs);
        },
        (err: any) => {
          this.productService.progressHide('placeOrderId');
          // this.modalService.hide('progressModal');
          this.modalService.hide();
          this.onFail(err, staticTabs);
        }
      );
    }
  }
  url: any;
  onSuccess(res: any, staticTabs: any) {
    this.getStorageService.getItem("uid")
    .pipe(takeUntil(this.destroySubject))
    .subscribe((uid: any) => {
      this.uid = uid;
    });
    this.productService.getLatestMiniCart(this.uid);

    this.scrollPageToTop();
    this.spinnerLoading = false;
    this.orderPlacedData = res.body;

    if (res.body?.status === "Error" || res.status != 200) {
      this.alertMsg = res?.error || "Failed to submit your Order.";
      this.alertType = "danger";
      // window.scrollTo({
      //   top: 0,
      //   behavior: "smooth",
      // });
      this.resetFirstTab(staticTabs);
    } else {
      this.submitOrderVal = res?.body;
      this.dataLayer.purchase(
        this.submitOrderVal?.orderNumber || "",
        this.checkoutData?.totalSurcharge?.value || 0,
        (this.checkoutData?.freightCharges?.value || 0) +
          (this.checkoutData?.miscCharges?.value || 0)
      );
      this.url = this.getUrl(this.submitOrderVal?.orderNumber);
      if (
        this.getStorageService.selectedCloneOrders?.selectedLines.length > 0
      ) {
        this.getStorageService.selectedCloneOrders?.selectedLines.splice(0, 1);
        this.getStorageService.setItem("selectedCloneOrders", {
          sampleOrder: this.getStorageService.selectedCloneOrders?.sampleOrder,
          selectedLines:
            this.getStorageService.selectedCloneOrders?.selectedLines,
          module: "commercial",
          productNumber:
            this.getStorageService.selectedCloneOrders.productNumber,
        });
      }
      this.placeOrder(2);
      staticTabs.tabs[2].active = true;
    }
  }
  onFail(err: any, staticTabs: any) {
    this.scrollPageToTop();
    this.alertMsg = "Failed to submit your Order.";
    this.alertType = "danger";
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    this.resetFirstTab(staticTabs);
  }
  resetFirstTab(staticTabs: any) {
    this.checkoutForm.setValue({
      shipAvailability: "",
      standardShipping: "",
      estdeliverydate: "",
      shipCompleteOrder: this.shipCompleteDescription,
      groupWithFewerShipments: "",
      porequest: "",
      sidemark: "",
      comments: "",
      reqdeliverydate: [""],
    });
    this.placeOrder(0);
    staticTabs.tabs[0].active = true;
  }
  shipViaSelected: any = "PM32";
  // shipViaChange: any = "PM32";
  // shipViaList = [
  //   { value: "MA", label: "Mohawk Arranged" },
  //   { value: "CA", label: "Customer Arranged" },
  //   { value: "PS", label: "Pickup at satellite" },
  //   { value: "PM", label: "Pick up at mill" },
  // ];
  shipViaSelectedOption: any = "";
  shippingWareHouseSelectedOption: any = "";
  selectedOption: any;
  originalDefaultSM:any='';
  changeshipViaOptions(event: any) {
    this.showValidationError = false;
    this.validationErrorMessage = "";
    if (event == undefined) {
      this.shipViaSelectedOption = null;
      this.incoTermsSelectedOption = null;
      this.incoTermsLoc2SelectedOption = null;
      return;
    }
    this.selectedOption = this.shipViaOptions.find(
      (item: any) => item.value === event
    );
    if (this.selectedOption.value != event) {
      this.orderService
        .isShippingMethodReAtpRequired(this.selectedOption.value, event)
        .subscribe((result: any) => {
          this.combinedShippingWarehouse = result.body;
        });
    }
    this.getStorageService.setItem("atpCheckFromCart", this.selectedOption);
    this.shipViaSelectedOption = event;
    this.incoTermsSelectedOption = null;
    if (this.customerFlag || this.salesPersonFlag) {
      this.spinnerLoading = false;

      this.orderService
        .getShippingoptionForCustomers(
          this.defaultAddress?.postalCode,
          this.shipViaSelectedOption,
          this.shippingWareHouseSelectedOption,
          this.storedShippingAddress?.oneTimeShippingAddress || this.storedShippingAddress?.isOneTimeShipTo
                        ? true : false,
          this.uid
        )
        .subscribe({
          next: (res) => {
            this.spinnerLoading = false;
            this.showValidationError = false;
            if(res?.body?.incoTerms || res?.body?.shipvia){
                this.incoTermsOptions = [];
                this.incoTermsOptions.push({
                  value: res.body.incoTerms,
                  label: res.body.incoTermsDesc,
                });

                this.shippingWareHouseOptions = [];
                this.shippingWareHouseOptions.push({
                  value: res.body?.shippingWarehouse || this.storedShippingAddress?.defaultShippingWarehouse,
                  label: res.body?.shippingWarehouseDesc || this.storedShippingAddress?.defaultShippingWarehouseDesc,
                });
                this.shippingWareHouseSelectedOption = this.shippingWareHouseOptions[0].value;
                this.incoTermsSelectedOption = this.incoTermsOptions[0].value;
                this.incoTermsLoc2Options = [];
                const apiShipVia = res.body?.shipvia;
                const apiShipViaDesc = res.body?.shipViaDesc;
                if(this.shipViaSelectedOption == "PA" && this.customerFlag == false && this.cartData.sampleOrder){
                  this.shipViaOptionsForPA.forEach((item:any) => {
                    this.incoTermsLoc2Options.push({
                      value: item.value,
                      label: item.label
                    });
                  });
                } else {
                  this.incoTermsLoc2Options.push({
                    value: apiShipVia || this.storedShippingAddress?.defaultShipVia,
                    label:
                      apiShipViaDesc ||
                      this.storedShippingAddress?.defaultShipViaDesc,
                  });
                }
                if (
                  apiShipVia &&
                  !this.incoTermsLoc2Options.some(
                    (o: any) => o.value === apiShipVia
                  )
                ) {
                  this.incoTermsLoc2Options.push({
                    value: apiShipVia,
                    label: apiShipViaDesc || apiShipVia,
                  });
                }
                this.incoTermsLoc2SelectedOption = res?.body?.shipvia;
                this.originalDefaultSM = res.body?.originalDefaultShippingMethod;
            }
            else{
              this.showValidationError = true;
              this.validationErrorMessage = "Shipping Options are not available for customer"
              this.incoTermsLoc2SelectedOption = "";
              this.incoTermsSelectedOption = "";
            }
          },
          error: (err) => {
            this.productService.progressHide();
            this.spinnerLoading = false;
          },
        });
    } else {
      this.getIncoTerms(this.shipViaSelectedOption);
      const selectedShippingWHOption = this.shippingWareHouseOptions.find(
        (item: any) => item.value === this.shippingWareHouseSelectedOption
      );
      this.incoTermsLoc2SelectedOption = null;
      this.getIncoTermsLoc2(selectedShippingWHOption?.value);
    }
  }
  changeshippingWareHOuseOptions(event: any) {
    this.shippingWareHouseSelectedOption = event;
  }
  isCompleteCart: boolean = false;
  shipViaType: any;

  shipViaModal(
    template: TemplateRef<any>,
    lineItem: any,
    changeoption: any,
    isCompleteCart: boolean
  ) {
    this.shipViaType = changeoption;

    this.shipViaOptions = [];
    this.isCompleteCart = isCompleteCart;
    this.selectedShipViaProduct = lineItem;
    this.productService
      .getShippingMethodWithOutFlag(
        this.defaultAddress.postalCode,
        this.storedShippingAddress?.oneTimeShippingAddress || this.storedShippingAddress?.isOneTimeShipTo
          ? true
          : false,
        this.customerFlag || this.salesPersonFlag,
        this.shipViaSelectedOption
      )
      .subscribe((res: any) => {
        if (res?.body) {
          for (let key of Object.entries(res?.body)) {
            this.shipViaOptions.push({
              value: key[0],
              label: key[1],
            });
          }
          this.shipViaSelectedOption =
            lineItem?.shippingCondition || this.shipViaOptions[0];
          if (this.isCompleteCart) {
            this.shipViaSelectedOption = 
              this.defaultAddress.defaultShippingMethod;
          }
          this.incoTermsSelectedOption = lineItem?.incoTerms;
          this.currentSelectedCartEntry = lineItem;
          this.getIncoTerms(this.shipViaSelectedOption);
        }
        this.modalRef = this.modalService.show(template, {
          id: "shipViaModal",
          class: "modal-md modal-dialog-centered",
          backdrop: "static",
          keyboard: false,
        });
      });
  }

  shipWareHouseModal(template: TemplateRef<any>, lineItem: any) {
    this.shippingWareHouseSelectedOption = [];
    this.productService
      .getShippingWareHouseWithOutFlag()
      .subscribe((res: any) => {
        if (res?.body) {
          for (let key of Object.entries(res?.body)) {
            this.shippingWareHouseSelectedOption.push({
              value: key[0],
              label: key[1],
            });
          }
          this.shippingWareHouseSelectedOption =
            lineItem?.shippingWarehouse || this.shippingWareHouseOptions[0];
          this.incoTermsLoc2SelectedOption = lineItem?.shipVia;
          this.currentSelectedCartEntry = lineItem;
          this.getIncoTerms(this.shippingWareHouseSelectedOption);
        }
        this.modalRef = this.modalService.show(template, {
          id: "shipViaModal",
          class: "modal-md modal-dialog-centered",
          backdrop: "static",
          keyboard: false,
        });
      });
  }

  selectedItemForCarrier: any;
  carrierConfirmation() {
    this.openConfirmationModal({
      title: "Note",
      content: `Please note that modifying the carrier at the header level will have an effect on all the lines.<br /> Do you want to continue? ?`,
      primaryActionLabel: "CONTINUE",
      secondaryActionLabel: "CANCEL",
      onPrimaryAction: () => {
        this.updateCarrierInfo(true);
        this.hideConfirmationModal();
      },
      onSecondaryAction: () => this.cancelReserve(),
    });
  }
  // carrierModal(template: any, selectedItem: any, isFromHeader?: boolean) {
  //   this.carrierMoAlertData = {};
  //   this.getSmallParcelCarriers();
  //   this.selectedItemForCarrier = selectedItem;
  //   this.selectedItemForCarrier.isFromHeader = isFromHeader || false;
  //   this.carrierModalObj.carrierType = selectedItem?.carrierType;
  //   this.carrierModalObj.shipperZipCode = selectedItem?.zipcode;
  //   this.carrierModalObj.shipperAccountNumber = selectedItem?.accountNumber;

  //   this.modalRef = this.modalService.show(template, {
  //     id: "carrierModalId",
  //     class: "modal-md modal-dialog-centered",
  //     backdrop: "static",
  //     keyboard: false,
  //   });

  //   // zipcode=46158&accountNumber=1R2F12&carrierType=96044139
  // }
  carrierModal(template: any, selectedItem: any, isFromHeader?: boolean) {
    this.carrierMoAlertData = {};
  //  this.getSmallParcelCarriers();
    // this.selectedItemForCarrier = selectedItem;
    // this.selectedItemForCarrier.isFromHeader = isFromHeader || false;
    let stateAbbr;
    if(this.cartData?.billingAddress?.region.trim().length > 2){
      for (const country of STATES) {
        let state = country.states.find(state => state.name.toLowerCase() === this.cartData?.billingAddress?.region.toLowerCase());
        if (state) {
         stateAbbr = state.abbreviation;
       }
       
     }
    }else{
      stateAbbr = this.cartData?.billingAddress?.region;
    }
    this.carrierModalObj.shipperZipCode = this.cartData?.shipperZipCode;
    this.carrierModalObj.shipperAccountNumber = this.cartData?.shipperAccountNumber;
    this.carrierModalObj.smallParcelCarrier = this.cartData?.smallParcelCarrier;
    this.carrierModalObj.name = this.cartData?.billingAddress?.name;
    this.carrierModalObj.addressLine1 = this.cartData?.billingAddress?.addressLine1;
    this.carrierModalObj.addressLine2 = this.cartData?.billingAddress?.addressLine2;
    this.carrierModalObj.city = this.cartData?.billingAddress?.city;
    this.carrierModalObj.state = stateAbbr || this.checkoutData?.billingAddress?.region;
    this.carrierModalObj.postalCode = this.cartData?.billingAddress?.postalCode;
    this.carrierModalObj.country = this.cartData?.billingAddress?.country

    this.modalRef = this.modalService.show(template, {
      id: "carrierModalId",
      class: "modal-lg modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });

  
  }
  getSmallParcelCarriers() {
    this.carrierOptions = [];
    // this.spinnerLoading = true;
    this.productService.progressShow('getCarriers', 'getCarriersId');
    this.productService.getSmallParcelCarriers().subscribe({
      next: (res: any) => {
        this.productService.progressHide('getCarriersId');
        this.spinnerLoading = false;
        const defaultObj = {
          FDEG: "FED EX",
          UPSN: "UPS",
        };
        const carriersObj =
          Object.keys(res.body).length === 0 ? defaultObj : res.body;
        for (let key in carriersObj) {
          this.carrierOptions.push({ value: key, label: carriersObj[key] });
        }
      },
      error: (err: any) => {
        this.productService.progressHide('getCarriersId');
        this.spinnerLoading = false;
      },
    });
  }
  carrierSubmit(staticTabs:any) {
    this.validateShipperAccount(staticTabs);
  }
  updateCarrierInfo(updateChilds: boolean) {
    let carrierItem = this.carrierOptions.find(
      (item: any) => item.value == this.carrierModalObj.carrierType
    );
    this.selectedItemForCarrier.shipperAccountNumber =
      this.carrierModalObj.shipperAccountNumber;
    this.selectedItemForCarrier.shipperZipCode = this.carrierModalObj.shipperZipCode;
    this.selectedItemForCarrier.carrierType = this.carrierModalObj.smallParcelCarrier;
    this.selectedItemForCarrier.carrierVal = carrierItem.label;
    this.selectedItemForCarrier.carrerShippingMethod =
      carrierItem.carrerShippingMethod;
    if (updateChilds) {
      this.cartEntries.map((item: any) => {
        item.shipperAccountNumber = this.carrierModalObj.shipperAccountNumber;
        item.shipperZipCode = this.carrierModalObj.shipperZipCode;
        item.carrierType = this.carrierModalObj.smallParcelCarrier;
        item.carrierVal = carrierItem.label;
        item.carrerShippingMethod = this.carrierModalObj.carrerShippingMethod;
      });
    }
  }

  proceedWithoutSp(template:any,staticTabs:any){

    if(this.cartData.shipComplete == true && this.cartData?.incoTerms == "C3P"){  

              this.modalRef = this.modalService.show(
                template,
                Object.assign({
                  id: "proceedWithOutParcel",
                  class: "modal-md modal-dialog-centered",
                  backdrop: "static",
                  keyboard: false,
                })
              );

  }else{
    this.submitOrder(staticTabs);
  }
   
   

}
continueChanges(staticTabs:any,
  carrierTemplate:any, 
  selectedItem: any,
  isFromHeader?: boolean){
    if(this.cartData.shipComplete == true && this.cartData?.incoTerms == "C3P"){

     this.carrierModal(carrierTemplate, selectedItem, isFromHeader);
   }else{
    
      this.submitOrder(staticTabs);
     
   }

}

closeInfoChanges() {
  this.modalService.hide("proceedWithOutParcel");
  
}

  // validateShipperAccount() {
  //   this.spinnerLoading = true;
  //   this.productService
  //     .validateShipperAccount(
  //       this.getStorageService.cartData?.code,
  //       this.carrierModalObj.shipperAccountNumber,
  //       this.carrierModalObj.shipperZipCode,
  //       this.carrierModalObj.carrierType,
  //       this.carrierModalObj.carrerShippingMethod
  //     )
  //     .subscribe({
  //       next: (res: any) => {
  //         this.spinnerLoading = false;
  //         if (res?.body?.status == "Error" || res?.error) {
  //           this.carrierMoAlertData.type = "danger";
  //           this.carrierMoAlertData.message =
  //             res?.body?.message || res?.error?.errors[0].message;
  //           // this.carrierConfirmation();
  //         } else {
  //           this.updateSmallParcelFields(
  //             this.staticTabs,
  //             this.getStorageService.cartData?.code,
  //             this.carrierModalObj.shipperAccountNumber,
  //             this.carrierModalObj.shipperZipCode,
  //           );
  //           // this.modalRef.hide();
  //           // if (this.selectedItemForCarrier?.isFromHeader == true) {
  //           //   this.carrierConfirmation();
  //           // } else {
  //           //   this.updateCarrierInfo(false);
  //           // }
  //         }
  //         // this.modalRef.hide();
  //         if (this.selectedItemForCarrier?.isFromHeader == true) {
  //           // this.carrierConfirmation();
  //         } else {
  //           this.updateCarrierInfo(false);
  //         }
  //       },
  //       error: (err: any) => {
  //         this.spinnerLoading = false;
  //       },
  //     });
  // }
  validateShipperAccount(staticTabs:any) {
    if(this.cartData?.shippingConditions == 'PA' && this.cartData?.incoTerms == 'C3P'){
      // this.spinnerLoading = true;
      if((this.cartData.shipperAccountNumber != this.carrierModalObj.shipperAccountNumber) || this.hasCarrierAddressChanges()){
        this.carrierMoAlertData.message = ""
        this.productService.progressShow('validateShipperAccount', 'validateShipperAccountId');
        this.productService
      .validateShipperAccount(
        this.getStorageService.cartData?.code,
        this.carrierModalObj.shipperAccountNumber,
        this.carrierModalObj.shipperZipCode,
        this.carrierModalObj.smallParcelCarrier
      )
      .subscribe({
        next: (res: any) => {
          this.productService.progressHide('validateShipperAccountId');
          // this.modalService.hide("progressModal");
          this.spinnerLoading = false;
          if (res?.body?.status == "Error" || res?.error) {
            this.carrierMoAlertData = {
              type: "danger",
              message: res?.body?.message || res?.error?.errors[0].message
            };
          }
            else{
              this.updateSmallParcelFields(
                this.staticTabs,
                this.getStorageService.cartData?.code,
                this.carrierModalObj.shipperAccountNumber,
                this.carrierModalObj.shipperZipCode
              );
            }
           
        },
        error: (err: any) => {
          this.productService.progressHide('validateShipperAccountId');
          // this.modalService.hide("progressModal");
          this.spinnerLoading = false;
        },
      });
    }else{
      this.submitOrder(staticTabs);
    }
  }else{
      this.updateSmallParcelFields(
        this.staticTabs,
        this.getStorageService.cartData?.code,
        this.carrierModalObj.shipperAccountNumber,
        this.carrierModalObj.shipperZipCode
      );
    }
    
  }

  hasCarrierAddressChanges() {
    let stateAbbr;
    if(this.cartData?.billingAddress?.region.trim().length > 2){
      for (const country of STATES) {
        let state = country.states.find(state => state.name.toLowerCase() === this.cartData?.billingAddress?.region.toLowerCase());
        if (state) {
         stateAbbr = state.abbreviation;
       }
       
     }
    }else{
      stateAbbr = this.cartData?.billingAddress?.region;
    }

    const billing = this.cartData?.billingAddress;
    const stateFromData = stateAbbr || this.checkoutData?.billingAddress?.region;

    const safeTrim = (val:any) => (val ? String(val).trim() : '');

    const comparisons = [
      { modal: this.carrierModalObj.name, cart: billing?.name },
      { modal: this.carrierModalObj.addressLine1, cart: billing?.addressLine1 },
      { modal: this.carrierModalObj.addressLine2, cart: billing?.addressLine2 },
      { modal: this.carrierModalObj.city, cart: billing?.city },
      { modal: this.carrierModalObj.state, cart: stateFromData },
      { modal: this.carrierModalObj.postalCode, cart: billing?.postalCode },
      { modal: this.carrierModalObj.country, cart: billing?.country }
    ];

    return comparisons.some(pair => safeTrim(pair.modal) !== safeTrim(pair.cart));
  }

  cartEntriesLength: any;

  // incoTermSubmit() {
  //   this.getStorageService.setItem("completeCart", this.cartData);
  //   this.spinnerLoading = true

  //   if (this.isCompleteCart) {
  //     this.cartEntriesLength = this.cartData.entries;
  //     this.productService.cancelCart(this.cartData?.code || "123456").subscribe({
  //       next: (res) => {
  //         if (res.status == 200 && res.body.messages[0].status == "Success") {
  //           // this.cartData=undefine
  //           // this.spinnerLoading = false;
  //           this.apiService.getMiniCart(this.uid, this.userEmail);
  //           this.getPdpData(this.cartEntriesLength[0]);
  //           this.spinnerLoading = false;

  //         }
  //       },
  //       error: (error: any) => {

  //         this.spinnerLoading = false;
  //         // // this.addtoCartFailed = true;
  //         // window.scrollTo({
  //         //   top: 0,
  //         //   behavior: "smooth",
  //         // });

  //         // this.cartData = {};
  //       },
  //     });
  //   } else {
  //     this.cartEntriesLength = [];
  //     this.productService
  //       .removeSelectedItemFromCart(
  //         this.cartData?.cartNumber || this.cartData?.code,
  //         this.currentSelectedCartEntry.entryNumber
  //       )
  //       .subscribe({
  //             next: (res: any) => {
  //           if (res.status == 200 && res.body.messages[0].status == "Success") {
  //           this.apiService.getMiniCart(this.uid, this.userEmail);

  //           this.getPdpData(this.currentSelectedCartEntry);
  //           this.spinnerLoading = false;}
  //         },
  //       });
  //   }
  // }
  // }
  public pdbData: any;
  getPdpData(lineProduct: any) {
    if (this.cartData.sampleOrder) {
      const feetYardFormData = {
        unit: lineProduct.uom.code,

        quantity: lineProduct.userRequestedQuantity,

        feet: 0,

        inches: 0,

        dye: "",

        targetLength: "",

        minLength: "",

        maxLength: "",

        maxFeet: "",

        maxInches: "",

        minFeet: "",

        minInches: "",

        requestedQty: lineProduct.userRequestedQuantity,
      };

      this.spinnerLoading = true;

      this.addToCartEachEntry(lineProduct, feetYardFormData);
    } else {
      this.spinnerLoading = true;
      this.productService
        .getPdpRecords(lineProduct.product.code, this.substituteProductFlag)
        .subscribe((res) => {
          this.spinnerLoading = false;
          if (res && res.status == 500) {
            // this.exceptionErrorMessage = res.error;
            // this.setLoadAPI("uomData");
          }
          if (res && res.status == 400) {
            // this.exceptionErrorMessage = res.error.message
            // ? res.error.message
            // : res.message;
            // this.setLoadAPI("uomData");
          }
          if (res.body) {
            this.pdbData = res.body;
            this.productType = this.pdbData.productType;
            this.subProductType = this.pdbData.subProductType;
            this.isAtpCheck = this.atpCheckProductTypes.includes(this.subProductType);
            this.productService
                .getBundledReferences(lineProduct.product.code)
                .subscribe((bundledata) => {
              lineProduct.bundleProduct = bundledata?.body?.references && bundledata?.body?.references.length > 0 ? true : false;
              this.spinnerLoading = true;
              this.productService
                .getUOMDetails(res.body.code)
                .subscribe((result) => {
                  this.spinnerLoading = false;
                  let erpProductCategory = result?.body?.erpProductCategory;
                  this.isAtpCheck = this.atpCheckProductTypes.includes(this.subProductType);
                  if(erpProductCategory === 'B'){
                    this.isAtpCheck = true;
                  }
                  if ((this.pdbData?.classification == "Accessories" && !(this.pdbData.subProductType === 'CUSHION_PAD' && this.isAtpCheck))|| this.pdbData.productType ===  "MERCHANDISING") {
                    this.isAtpCheck = false;
                  }
                  this.addAccessoriesAddcart(lineProduct, this.isAtpCheck, erpProductCategory);
                }, () => {                
                  this.modalService.hide('progressModal');
                });
            });
          }
        }, () => {          
          this.modalService.hide('progressModal');
        });
    }
  }
  entryNumber: any = 0;
  addAccessoriesAddcart(lineProduct: any, isAtpCheck: boolean, erpProductCategory:any) {
    const feetYardFormData = {
      unit: lineProduct.uom.code,
      quantity: lineProduct.userRequestedQuantity,
      feet: 0,
      inches: 0,
      dye: "",
      targetLength: "",
      minLength: "",
      maxLength: "",
      maxFeet: "",
      maxInches: "",
      minFeet: "",
      minInches: "",
      requestedQty: lineProduct.userRequestedQuantity,
    };
    if (isAtpCheck) {
      if (this.pdbData) {
        const initialState: ModalOptions = {
          initialState: {
            rddFlag: this.rddFlag,
            fromViewInventory: false,
            aptCheckEntrie: [],
            solutions: [this.pdbData],
            feetyardForm: feetYardFormData,
            shippingAddress: this.storedShippingAddress,
            shippingCondition:
              this.shipViaSelectedOption || lineProduct.shippingCondition,
            incoTerms: this.incoTermsSelectedOption || lineProduct.incoTerms,
            multiCutIndication: false,
            viewInventory: false,
            sameDyeLot: lineProduct.sameDyeLot,
            rdd: this.requestDeliveryDate || this.storedShippingAddress?.requestedDeliveryDate,
            requestDeliveryDate: this.requestDeliveryDate,
            productType: this.pdbData.productType.toUpperCase(),
            entryLength: this.entryNumber,
            isQuoteCart: this.isQuoteCart,
            erpProductCategory: erpProductCategory,
            preferredStock: lineProduct?.preferredStock,
            bundleProduct: lineProduct?.bundleProduct,
            atpCheckFromCart: (entry: any) => {
              this.modalService.hide("AddCompanionProductsComponent");
              this.entryNumber = entry;
              this.productService.getMiniCartData(this.uid).subscribe((res) => {
                this.cartData = res?.body;
                if (entry < this.cartEntriesLength.length) {
                  this.getPdpData(this.cartEntriesLength[entry]);
                }else {
                  this.rddFlag = false;
                  this.cancelReserve();
                  this.getCartData(this.cartData?.code)
                }
              }, () => {          
                // this.modalService.hide('progressModal');
              });
            },
          },

          id: "AddCompanionProductsComponent",
          class: "modal-xl modal-dialog-centered",
        };

        this.bsModalRef = this.modalService.show(
          AddCompanionProductsComponent,
          Object.assign(initialState, {
            id: "AddCompanionProductsComponent",
            class: "modal-xl modal-dialog-centered",
            backdrop: "static",
            keyboard: false,
          })
        );

        this.bsModalRef.content.solutions = [this.pdbData];
      }
    } else {
      this.modalService.hide();
      this.productService.getMiniCartData(this.uid).subscribe((res) => {
        this.cartData = res?.body;
        this.addToCartEachEntry(lineProduct, feetYardFormData);
        // this.entryNumber = this.entryNumber + 1;

        // // for (let i = 0; i < this.cartEntriesLength.length; i++) {
        // if (this.entryNumber < this.cartEntriesLength.length && this.isCompleteCart) {
        //   this.getPdpData(this.cartEntriesLength[this.entryNumber]);
        // }
      },(err)=>{this.productService.progressHide();});
      // if (
      //   this.entryNumber < this.cartEntriesLength.length &&
      //   this.isCompleteCart
      // ) {
      //   this.getPdpData(this.cartEntriesLength[this.entryNumber]);
      // }
    }
  }
  addToCartEachEntry(lineProduct: any, feetYardFormData: any) {
    this.spinnerLoading = true;
    let orderSamples: any = [];
    if (lineProduct.product.code.includes("#")) {
      lineProduct.product.code = lineProduct.product.code.replace(/#/g, "%23");
    }
    const setTimeoutRef = setTimeout(() => {
      this.spinnerLoading = false;
    }, 30000);
    this.productService.getProductPriceDetails(lineProduct.product.code).subscribe(
      (res: any) => {
        this.spinnerLoading = false;
        clearTimeout(setTimeoutRef);

        this.priceDetails = res.body;

    if (this.cartData?.sampleOrder === true) {
      orderSamples = [
        {
          code: lineProduct?.product.code,
          quantity: lineProduct?.quantity,
          requestedQty: lineProduct?.quantity,
          requestedUOM: lineProduct?.uom?.code,
          selected: true,
          noCharge: false,
          sellingBackingId: lineProduct?.product?.sellingBackingId,
          sellingColorId: lineProduct?.product?.sellingColorId,
          sellingColorName: lineProduct?.product?.sellingColorName,
          sellingSizeId: lineProduct?.product?.sellingSizeId,
          sellingStyleId: lineProduct?.product?.sellingStyleId || lineProduct?.product?.styleNumber,
          size: lineProduct?.product?.sellingStyleId || lineProduct?.product?.sellingSizeDescription,
          shippingCondition:
          this.userInfo.isCustomer === true || this.userInfo.isSalesPerson == true || this.userInfo.isSalesOps == true ? 
          this.originalDefaultShippingMethod || lineProduct?.originalDefaultShippingMethod ||
          this.storedShippingAddress?.defaultShippingMethod ||
            this.storedShippingAddress?.shippingCondition ||
            this.storedShippingAddress?.shippingMethod ||
            "":
            this.storedShippingAddress?.defaultShippingMethod ||
            this.storedShippingAddress?.shippingCondition ||
            this.storedShippingAddress?.shippingMethod ||
            "",
          shipVia:
            this.storedShippingAddress?.defaultShipVia ||
            this.storedShippingAddress?.shipVia ||
            this.storedShippingAddress?.incoTermsLoc2 ||
            "",
          shippingWarehouse:
            this.storedShippingAddress?.defaultShippingWarehouse ||
            this.storedShippingAddress?.shippingWarehouse ||
            this.storedShippingAddress?.defaultShippingWarehouseDesc ||
            "",
          incoTerms:
            this.storedShippingAddress?.defaultIncoTerms ||
            this.storedShippingAddress?.incoTerms ||
            "",
          sellingStyleName: lineProduct?.product?.sellingStyleName,
          requestedDeliveryDate: lineProduct?.requestedDeliveryDate,
          originProductType: lineProduct?.originProductType,
          originSubProductType: lineProduct?.subProductType,
        },
      ];
    }

    const item = {
      dyeLot: feetYardFormData?.dye,
      feet: Number(feetYardFormData?.feet),
      inches: Number(feetYardFormData?.inches),
      productCode:
        this.cartData?.sampleOrder === false
          ? this.pdbData.code
          : lineProduct?.sampleProductReference,
      requestedUOM: feetYardFormData?.unit,
      requestedQty:
        this.cartData?.sampleOrder === true ? "" : feetYardFormData.quantity,
      maxFeet: feetYardFormData?.maxFeet || 0,
      maxInches: feetYardFormData?.maxInches || 0,
      minFeet: feetYardFormData?.minFeet || 0,
      minInches: feetYardFormData?.minInches || 0,
      rollPrices: true,
      requestedDeliveryDate:
        this.requestDeliveryDate || lineProduct?.requestedDeliveryDate,
      shippingCondition:
        this.userInfo.isCustomer === true || this.userInfo.isSalesPerson == true || this.userInfo.isSalesOps == true ? 
        this.originalDefaultShippingMethod || lineProduct?.originalDefaultShippingMethod ||
        this.storedShippingAddress?.defaultShippingMethod ||
          this.storedShippingAddress?.shippingCondition ||
          this.storedShippingAddress?.shippingMethod ||
          "":
          this.storedShippingAddress?.defaultShippingMethod ||
          this.storedShippingAddress?.shippingCondition ||
          this.storedShippingAddress?.shippingMethod ||
          "",
      shipVia:
        this.storedShippingAddress?.defaultShipVia ||
        this.storedShippingAddress?.shipVia ||
        this.storedShippingAddress?.incoTermsLoc2 ||
        "",
      shippingWarehouse:
        this.storedShippingAddress?.defaultShippingWarehouse ||
        this.storedShippingAddress?.shippingWarehouse ||
        this.storedShippingAddress?.defaultShippingWarehouseDesc ||
        "",
      incoTerms:
        this.storedShippingAddress?.defaultIncoTerms ||
        this.storedShippingAddress?.incoTerms ||
        "",
      sameDyeLot: lineProduct.sameDyeLot,
      requestedPrice:lineProduct?.requestedPrice,
      priceComment:lineProduct?.priceComment,
          noCharge:lineProduct?.noCharge,
          noChargeReasonCode:lineProduct?.noChargeReasonCode,
          noFreight:lineProduct?.noFreight,
          sideMark:lineProduct?.sideMark,
      solution: [],
      ...(this.reInspectFlag === true
        ? { reInspect: this.reInspect || false }
        : { reInspect: lineProduct.reInspect || false }),
       // Wrap the current solution in an array
      // shippingCondition:
      //   this.shipViaSelectedOption || lineProduct.shippingCondition,
      // shipVia:
      //   this.shippingAddress?.shipVia || this.shippingAddress?.defaultShipVia,
      // shippingWarehouse:
      //   this.cartData?.shippingWarehouse ||
      //   this.shippingAddress?.shippingWarehouse ||
      //   this.shippingAddress?.defaultShippingWarehouse ||
      //   this.shippingAddress?.defaultShippingWarehouseDesc ||
      //   "",
      // incoTerms: this.incoTermsSelectedOption || lineProduct.incoTerms,
      // requestedDeliveryDate: this.requestDeliveryDate,
    };
    let phoneNumber =
      this.shippingAddress?.Phone ||
      this.shippingAddress?.phoneNumber ||
      "1234567890";
    phoneNumber = phoneNumber
      .replace("(", "")
      .replace(")", "")
      .replace(/ /g, "");        
    if (this.cartData?.sampleOrder === true) {
      delete item?.requestedQty;
    }
    const payLoad: any = {
      addressCity:
        this.shippingAddress?.addressCity || this.shippingAddress?.town || this.defaultAddress?.town || "",
      addressCountry:
        this.shippingAddress?.oneTimeShippingAddress ||
        this.shippingAddress?.isOneTimeShipTo
          ? this.shippingAddress.country?.isocode
          : this.shippingAddress.country?.isocode ||
          this.defaultAddress?.country?.isocode,
      addressLine1:
        this.shippingAddress?.addressLine1 || this.shippingAddress?.line1 || this.defaultAddress?.line1 || "",
      addressLine2:
        this.shippingAddress?.addressLine2 || this.shippingAddress?.line2 || this.defaultAddress?.line2 || "",
      addressName: this.shippingAddress?.addressName || this.shippingAddress?.companyName,
      addressPostalCode:
        this.shippingAddress?.addressPostalCode ||
        this.shippingAddress?.postalCode ||
        this.defaultAddress?.postalCode ||
        "",
      addressState:
        this.shippingAddress?.addressState ||
        this.shippingAddress?.region ||
        this.defaultAddress?.region?.isocodeShort ||
        "",
      carrierNumber: this.shippingAddress?.carrierNumber,
      satellite: this.shippingAddress?.satellite?.code,
      claimNumber: this.shippingAddress?.claimNumber
        ? this.shippingAddress?.claimNumber
        : "",
      hasClaimSubmitted: this.shippingAddress?.hasClaimSubmitted
        ? this.shippingAddress?.hasClaimSubmitted
        : false,
      invoiceNumber: this.shippingAddress?.invoiceNumber
        ? this.shippingAddress?.invoiceNumber
        : "",
      shipToUnit: this.shippingAddress?.oneTimeShippingAddress
        ? ""
        : this.shippingAddressId,
      item: [item],
      
      noPrice: this.shippingAddress?.noPrice
        ? this.shippingAddress?.noPrice
        : true,
      oneTimeShippingAddress:
        this.shippingAddress?.oneTimeShippingAddress ||
        this.shippingAddress?.isOneTimeShipTo ||
        false,
      replacementOrderNumber: this.shippingAddress?.orderNumber
        ? this.shippingAddress?.orderNumber
        : "",
      pdpProductCode:
        this.cartData?.sampleOrder === false
          ? this.pdbData.code
          : lineProduct?.product?.code,
      phoneNumber: phoneNumber,
      purchaseOrderNumber: this.shippingAddress?.purchaseOrderNumber
        ? this.shippingAddress?.purchaseOrderNumber
        : "",
      replacementOrder:
        this.cartData?.replacementOrder ||
        this.shippingAddress?.replacementOrder ||
        false,
      replacementReason: this.shippingAddress?.replacementReason
        ? this.shippingAddress?.replacementReason
        : "",
      requestedDeliveryDate:
        this.datePipe.transform(
          lineProduct?.requestedDeliveryDate,
          "MM/dd/yyyy"
        ) ||
        this.datePipe.transform(
          lineProduct?.requestedDeliveryDate,
          "MM/dd/yyyy"
        ) ||
        this.datePipe.transform(
          this.storedShippingAddress?.requestedDeliveryDate,
          "MM/dd/yyyy"
        ),
        ...(this.cartData?.merchandisingProduct == true
          ? { merchandisingProduct: this.cartData?.merchandisingProduct}
          : {}),
      sampleProduct: this.cartData?.sampleOrder
        ? this.cartData?.sampleOrder
        : false,
      sampleType:
        this.cartData?.sampleOrder === false
          ? this.shippingAddress?.sampleType
            ? this.shippingAddress?.sampleType
            : ""
          : "",
        shippingCondition:
          this.userInfo.isCustomer === true || this.userInfo.isSalesPerson === true || this.userInfo.isSalesOps == true ? 
          this.originalDefaultShippingMethod ||
          this.storedShippingAddress?.defaultShippingMethod ||
            this.storedShippingAddress?.shippingCondition ||
            this.storedShippingAddress?.shippingMethod ||
            "":
            this.storedShippingAddress?.defaultShippingMethod ||
            this.storedShippingAddress?.shippingCondition ||
            this.storedShippingAddress?.shippingMethod ||
            "",
        shipVia:
          this.storedShippingAddress?.defaultShipVia ||
          this.storedShippingAddress?.shipVia ||
          this.storedShippingAddress?.incoTermsLoc2 ||
          "",
        shippingWarehouse:
          this.storedShippingAddress?.defaultShippingWarehouse ||
          this.storedShippingAddress?.shippingWarehouse ||
          this.storedShippingAddress?.defaultShippingWarehouseDesc ||
          "",
        incoTerms:
          this.storedShippingAddress?.defaultIncoTerms ||
          this.storedShippingAddress?.incoTerms ||
          "",
      orderSamples: orderSamples,
      isMultiCut: false,
      shippingInfo: null,
      ...(
        { quoteNumber: this.cartQuoteNumber || false }
        ),
      reAtp:true,
      shipComplete: this.isCompleteCart == true ? true:false,
      termsCode:this.reAtpTermsCode || "",
      comment:this.reAtpComment || "",
      internalComment:this.reAtpInternalComment || "",
      poNumber:this.reAtpPoNumber ||"",
      marketSegment:this.reAtpMarketSegment || "",
      jobLocation:this.reAtpJobLocation || "",
      submittedFor:this.reAtpSubmittedFor || "",
      endUserCode:this.reAtpEndUserCode || "",
      creUserCode:this.reAtpCreUserCode || "",
      gpoUserCode:this.reAtpGpoUserCode || "",
      adUserCode:this.reAtpAdUserCode || "",
      deliveryGrouping:this.reAtpDeliveryGrouping || false,
      soldTo: this.isShipToUser ? this.soldToAccount : this.uid,
      orderPlacedSite: "xchange",
      isAccessoryCart: this.pdbData?.classification == "Accessories" ? true : false,
      bundleProduct: lineProduct?.bundleProduct,
    };
    // payLoad.incoTerms = this.incoTermsSelectedOption || lineProduct.incoTerms;
    // (payLoad.shippingCondition = this.
    //    lineProduct.shippingCondition),
    //   (payLoad.requestedDeliveryDate = this.requestDeliveryDate);

    let cartNumber = null;
    if (this.isCompleteCart) {
      if (this.cartEntriesLength.length == 1 && this.entryNumber == 0) {
        cartNumber = null;
      } else {
        cartNumber = this.cartData?.code || null;
      }
      this.productService.getMiniCartData(this.uid).subscribe((res) => {
        if (res.body?.errorMessage?.includes("No Cart existed")) {
          cartNumber = null;
        } else {
          cartNumber = res?.body?.code;
        }
      }, () => {          
        this.modalService.hide('progressModal');
      });
    } else {
      if (this.cartEntriesLength.length <= 1) {
        cartNumber = null;
      } else {
        cartNumber = this.cartData?.code || null;
      }
    }
    this.productService.getMiniCartData(this.uid).subscribe((res) => {
      if (res.body?.errorMessage?.includes("No Cart existed")) {
        cartNumber = null;
      } else {
        cartNumber = res?.body?.code;
      }
      if(this.shippingAddress?.oneTimeShippingAddress){
        payLoad.shippingInfo = this.cartData?.shippingInfo
      }
      if((this.storedShippingAddress?.defaultShippingMethod ==='PA'||
        this.storedShippingAddress?.shippingCondition === 'PA' ||
        this.storedShippingAddress?.shippingMethod === 'PA') && this.shippingAddress?.oneTimeShippingAddress){
          payLoad.shippingInfo = [];
        }
      this.productService
        .addToCart(this.userService.getUserEmail().toLowerCase(), cartNumber, payLoad)
        .subscribe(
          (res) => {
            this.productService.progressHide();
            this.spinnerLoading = false;
            let cartId = res?.body?.cartNumber;
            if (res?.body?.errorMessages || res?.body?.messages?.length) {
              if (
                res?.body?.errorMessages === "Error" ||
                res?.body?.messages[0]?.status === "Error" ||
                res?.body?.messages[0]?.status === "Failed" ||
                res?.body?.messages[1]?.status === "Error"
              ) {
                this.failedCase(res?.body?.messages[0]?.message);
                this.entryNumber = this.entryNumber + 1;

                // for (let i = 0; i < this.cartEntriesLength.length; i++) {
                if (
                  this.entryNumber < this.cartEntriesLength.length &&
                  this.isCompleteCart
                ) {
                  this.getPdpData(this.cartEntriesLength[this.entryNumber]);
                } else {
                  this.rddFlag = false;
                  this.modalService.hide('progressModal');
                  this.getCartData(cartId);
                }
                return res?.body?.messages[0]?.message;
              } else {
                // this.atpCheckFromCart();
                this.successCase(res);
                if (this.isCompleteCart)
                  this.entryNumber = this.entryNumber + 1;
                // for (let i = 0; i < this.cartEntriesLength.length; i++) {
                if (
                  this.entryNumber < this.cartEntriesLength.length &&
                  this.isCompleteCart
                ) {
                  this.getPdpData(this.cartEntriesLength[this.entryNumber]);
                } else {
                  this.rddFlag = false;
                  this.modalService.hide('progressModal');
                  this.getCartData(cartId);
                }
                return res?.body?.messages[0]?.message;
              }
            } else {
              // this.atpCheckFromCart();
              this.successCase(res);
              this.entryNumber = this.entryNumber + 1;

              // for (let i = 0; i < this.cartEntriesLength.length; i++) {
              if (
                this.entryNumber < this.cartEntriesLength.length &&
                this.isCompleteCart
              ) {
                this.getPdpData(this.cartEntriesLength[this.entryNumber]);
              } else {
                this.rddFlag = false;
                this.modalService.hide('progressModal');
                this.getCartData(cartId);
              }
              return res?.body?.messages[0]?.message;
            }
          },
          (err: any) => {
            this.modalService.hide('progressModal');
            this.spinnerLoading = false;
            this.addtoCartFailed = true;
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
            this.entryNumber = this.entryNumber + 1;

            // for (let i = 0; i < this.cartEntriesLength.length; i++) {
            if (
              this.entryNumber < this.cartEntriesLength.length &&
              this.isCompleteCart
            ) {
              this.getPdpData(this.cartEntriesLength[this.entryNumber]);
            } else {              
              this.rddFlag = false;
              this.getCartData();
            }
            return "Error occured during add to cart";
          }
        );
    }, () => {
      this.modalService.hide('progressModal');
    });
  });
  }

  failedCase(msg?: any) {
    // this.spinnerLoading = false;
    this.addtoCartFailed = true;
    this.addtoCartErrorMessage = msg;
    this.scrollPageToTop();
  }
  successCase(res?: any) {
    let cartNumber = this.cartData?.code || null;
    this.spinnerLoading = true;

    // if (cartNumber == null) {
    //   let cartData = {
    //     code: res.body?.cartNumber,
    //     entries: res.body?.entries,
    //   };
    //   this.cartData = cartData;
    //   // this.storageService.setItem("miniCartCount", cartData);
    // }
    this.getStorageService.getItem("uid")
    .pipe(takeUntil(this.destroySubject))
    .subscribe((res) => {
      this.uid = res;
    });
    this.productService.getMiniCartData(this.uid).subscribe((res) => {
      this.spinnerLoading = false;
      this.hideProgressModal("rdd-progressBar");
      this.cartData = res?.body || res;
      this.endUser = this.cartData?.endUser?.name;
      this.creUser = this.cartData?.creUser?.name;
      this.adUser = this.cartData?.adUser?.name;
      this.gpoUser = this.cartData?.gpoUser?.name;
      this.getStorageService.setItem("miniCartCount", this.cartData);
      this.spinnerLoading = false;
      const data: any = this.modalService.config.initialState;
      const initialState: ModalOptions = {
        initialState: {
          // Data to  popup
          cartData: data?.cartData,
        },
      };
      // if (!this.reATP) {
      //   this.modalRef = this.modalService.show(
      //     XchangeAddAccessoriesLightboxComponent,
      //     Object.assign(initialState, {
      //       class: "modal-xl modal-dialog-centered",
      //     })
      //   );
      // }
      // this.bsModalRef.content.type = 2;
    });
    // this.getCartData();
  }
  getIncoTerms(shipVia: any) {
    this.incoTermsOptions = [
      { value: "CLP", label: "Collect Beyond Prepaid" },
      { value: "PPA", label: "Prepay & add" },
      { value: "PPD", label: "Prepaid" },
      { value: "CLB", label: "Collect Beyond" },
    ];
    this.orderService.getIncoTerms(shipVia).subscribe({
      next: (res) => {
        this.setLoadAPI("IncoTerms");
        if (Object.keys(res?.body).length > 0) {
          this.incoTermsOptions = [];
          for (let key of Object.entries(res?.body)) {
            this.incoTermsOptions.push({
              value: key[0],
              label: key[1],
            });
          }
        }
      },
      error: (err) => {this.setLoadAPI("IncoTerms");},
    });
  }
  changeincoTermsOptions(event: any) {
    this.incoTermsSelectedOption = event;
  }
  changeIncoTermsLoc2Options(event: any) {
    this.incoTermsLoc2SelectedOption = event;
  }
  incoTermLoc2Submit() {
    this.currentSelectedCartEntry.shipVia = this.incoTermsLoc2SelectedOption;
    const selectedIncoTermsLoc2Item = this.incoTermsLoc2Options.find(
      (item: any) => item.value === this.incoTermsLoc2SelectedOption
    );
    //  this.currentSelectedCartEntry.incoTermsDesc = selectedIncoTermsLoc2Item?.label;
  }
  getIncoTermsLoc2(shippingWareHouse: any) {
   
    let postalCode = this.defaultAddress?.postalCode;
    if (this.defaultAddress?.postalCode.includes("-")) {
      postalCode = this.defaultAddress?.postalCode.split("-")[0];
    }
    this.orderService
      .getIncoTermsLoc2(
        postalCode,
        shippingWareHouse,
        this.shipViaSelectedOption
      )
      .subscribe({
        next: (res) => {
          this.setLoadAPI("ShipVia");
          if (Object.keys(res?.body).length > 0) {
            const resObject = res?.body;
            this.incoTermsLoc2Options = [];
            const objectKeys = Object.keys(resObject).sort();
            objectKeys.forEach((key) => {
              this.incoTermsLoc2Options.push({
                value: resObject[key].shipvia,
                label: resObject[key].shipViaDesc,
                preferred: resObject[key].preferred
              });
            });
          }
        },
        error: (err) => {this.setLoadAPI("ShipVia");},
      });
  }

  changeincoTermsLoc2Options(event: any) {
    this.incoTermsLoc2SelectedOption = event;
  }

  requestedPricePerUnit: any;
  selectedProduct: any;
  selectedPriceIndex = 0;
  showPricingUOM: any = "per unit";
  priceRequestModal(
    template: TemplateRef<any>,
    selectedProduct: any,
    index: number
  ) {
    index = this.cartEntries.map((i:any) => i.entryNumber).indexOf(selectedProduct.entryNumber);
    this.selectedPriceIndex = index;
    this.showPricingUOM = selectedProduct?.pricingUomDescription || "per unit";

    let requestPrice = this.cartEntries[index]?.requestedPrice
      ? this.cartEntries[index]?.requestedPrice
      : "";
    this.requestingPriceForm.patchValue({
      requestedPrice: requestPrice,
      priceComment: this.cartEntries[index]?.priceComment
        ? this.cartEntries[index]?.priceComment
        : "",
    });
    let control = this.requestingPriceForm.controls;
    let requestPriceMax = this.cartEntries[index]?.unitPrice?.value
      ? this.cartEntries[index]?.unitPrice?.value
      : "";
    if (requestPriceMax) {
      control["requestedPrice"].setValidators([
        Validators.required,
        Validators.min(0.01),
        // Validators.max(requestPriceMax),
        Validators.pattern(/^\d+(\.\d+)?$/),
      ]);
    }
    control["requestedPrice"].markAsUntouched();
    control["priceComment"].markAsUntouched();
    control["requestedPrice"].updateValueAndValidity();
    control["priceComment"].updateValueAndValidity();

    this.selectedProduct = selectedProduct;
    this.modalRef = this.modalService.show(template, {
      id: "shipViaModal",
      class: "modal-md modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }

  routeToProfile() {
    this.router.navigate(["/commercial/my-profile/notification-preferences"]);
  }
  applyAll(event: any, index: any) {}

  checkAllBox(event: any, index:number, selectedCartEntry: any) {
    if (event.state) {
      let sideMark = this.cartEntries[index].sideMark;
      this.cartEntries.forEach((element: any, i: any) => {
        if(element.entryNumber != selectedCartEntry?.entryNumber){
          sideMark = selectedCartEntry?.sideMark
          element.sideMark = sideMark;
          element.sideMarkChecked = false;
        }else {
          element.sideMarkChecked = true;
        }
      });
    } else {
      this.cartEntries.forEach((element: any, i: any) => {
        if (i != index) {
          element.sideMark = "";
        }
        element.sideMarkChecked = false;
      });
    }
  }
  builderOrderDetails = [];
  showErrorMessage = false;
  errorMessage: any;
  errorMessageBuilder: string = "";
  // getBuilderOrder$() {
  //   this.showErrorMessage = false;
  //   this.getStorageService.getItem("miniCartCount").subscribe((res) => {

  //     if (res?.code) {
  //       this.productService.getBuilderOrder(res?.code).subscribe(
  //         (response) => {

  //           if (
  //             response &&
  //             response?.body &&
  //             response?.body.builders &&
  //             response?.body.builders.length > 0 &&
  //             response?.body.builders[0].errorCode == "0001"
  //           ) {
  //             this.showErrorMessage = true;
  //             this.errorMessageBuilder = response?.body.builders[0].message;
  //           } else {
  //             this.showErrorMessage = false;
  //             this.builderOrderDetails = response?.body?.builders || [];
  //           }
  //         },
  //         (err: any) => {
  //           this.errorMessageBuilder = err?.message;
  //         }
  //       );
  //     }
  //   });
  // }
  getBuilderDivision$() {
    this.getStorageService.getItem("miniCartCount")
    .pipe(takeUntil(this.destroySubject))
    .subscribe((res) => {
      if (res?.code) {
        this.productService.getDivision(res?.code).subscribe((response) => {});
      }
    });
  }
  getBuilderSubDivision$() {
    this.getStorageService.getItem("miniCartCount")
    .pipe(takeUntil(this.destroySubject))
    .subscribe((res) => {
      if (res?.code) {
        this.productService
          .getSubDivision(res?.code)
          .subscribe((response) => {});
      }
    });
  }
  // getBuilderSubDetails$() {
  //   this.getStorageService.getItem("miniCartCount").subscribe((res) => {

  //     if (res?.code) {
  //       this.productService.getBuilderOrder(res?.code).subscribe((response) => {

  //       });
  //     }
  //   });
  // }

  checkForNewUser(value: any) {
    if (value?.value == "new") {
      this.submitFor = "";
      const initialState: ModalOptions = {
        initialState: {
          // Data to  popup
        },
      };
      this.modalRef = this.modalService.show(
        AddUserModalComponent,
        Object.assign(initialState, {
          id: "add-user",
          class: "modal-lg modal-dialog-centered",
          backdrop: "static",
          keyboard: false,
        })
      );
      this.modalRef.content.formValue.subscribe((data: any) => {
        this.alertMsg = "";

        this.createNewUser$(data).subscribe({
          next: (res: any) => {
            if ((res.body?.status).toLowerCase() === "error") {
              this.modalRef.content.errorMessage = res.body?.message;
            } else {
              this.alertType = "success";
              this.alertMsg = res.body?.message;
              this.modalService.hide("add-user");
              this.scrollPageToTop();
              this.getSubmittedFor();
              this.submitFor = {
                uid: data?.email,
                name: `${data?.firstName} ${data?.lastName}`,
              };
            }
          },
          error: (err: any) => {
            this.productService.progressHide("add-user");
            this.scrollPageToTop();
            this.modalRef.content.errorMessage = err.error;
          },
        });
      });
    } else {
      //this.submitFor = this.checkoutForm.controls["submitFor"].value || "";
    }
  }
  createNewUser$(payload: any): any {
    let data: any = {
      username: this.userService.getUserEmail().toLowerCase(),
      cartId: this.cartNumberData?.code,
    };

    return this.productService.createNewUser(data, payload);
  }
  public configuration!: Config;
  builderColumns!: Columns[];
  builderData = [
    {
      builder: "ABC",
      city: "Allen",
      state: "Texas",
    },
    {
      builder: "XYZ",
      city: "NewYork City",
      state: "NewYork",
    },
  ];
  builderDivColumns: Columns[] = [
    { key: "#", title: "", width: "7%" },
    { key: "division", title: "Builder Division" },
    { key: "city", title: "City" },
    { key: "state", title: "State" },
  ];

  builderDivData = [
    {
      division: "ABC DIVISION",
      city: "Allen",
      state: "Texas",
    },
    {
      division: "XYZ DIVISION",
      city: "NewYork City",
      state: "NewYork",
    },
  ];

  bSubdivionColumns: Columns[] = [
    { key: "#", title: "", width: "7%" },
    { key: "subdivision", title: "Builder Subdivision" },
    { key: "city", title: "City" },
    { key: "state", title: "State" },
  ];
  builderDSData = [
    {
      subdivision: "ABC SUB DIVISION",
      city: "Allen",
      state: "Texas",
    },
    {
      subdivision: "XYZ SUB DIVISION",
      city: "NewYork City",
      state: "NewYork",
    },
  ];

  // builderDetailsColumns: Columns[] = [
  //   { key: "#", title: "", width: "7%" },
  //   { key: "builder", title: "Builder Details" },
  //   { key: "city", title: "City" },
  //   { key: "state", title: "State" },
  // ];

  openBuilderModal(value: any) {
    if (value == "Yes") {
      this.modalRef = this.modalService.show(GetBuilderInfoComponent, {
        id: "builder-info",
        class: "modal-lg modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      });
    }
  }
  openBuilderDivision(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      id: "builder-division",
      class: "modal-lg modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
    this.getBuilderDivision$();
  }
  openBuilderSubdvision(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      id: "builder-sub-division",
      class: "modal-lg modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
    this.getBuilderSubDivision$();
  }

  openBuilderDetails(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      id: "builder-details",
      class: "modal-lg modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }

  submitBuilderDetails() {
    this.modalService.hide();
    this.submitBuilderInfo$();
  }
  submitBuilderInfo$() {
    this.getStorageService.getItem("miniCartCount")
    .pipe(takeUntil(this.destroySubject))
    .subscribe((res) => {
      if (res?.code) {
        this.productService
          .submitBuilderInfo(res?.code)
          .subscribe((response) => {});
      }
    });
  }

  routeToOrderHistoryDetail(id: any) {
    if(this.cartData.sampleOrder == true){
      sessionStorage.setItem("tabId","2");
    }
    else{
      sessionStorage.setItem("tabId","0");
    } 
    // let baseUrl = this.router.url.split("?")[0].includes("commercial") ? "commercial" : "residential";
    let currentUrl = this.router.url.split("?")[0];
    let baseUrl = currentUrl.includes("commercial") ? "commercial" : "residential";
    currentUrl = currentUrl.replace(/\/(residential|commercial)\/.*/, "");
    this.router.navigate([`${baseUrl}/orders/orders-history-details/${id}`]);
  }
  getUrl(id: any) {
    let currentUrl = this.router.url.split("?")[0];
    let baseUrl = currentUrl.includes("commercial") ? "commercial" : "residential";
    currentUrl = currentUrl.replace(/\/(residential|commercial)\/.*/, "");
    let url = [`${currentUrl}/${baseUrl}/orders/orders-history-details/${id}`];
    return url;
  }
  
  @ViewChild("scrollToTop", { read: ElementRef }) scrollToTop: any;
  scrollPageToTop() {
    // this.scrollToTop.nativeElement.scrollIntoView({
    //   behavior: "smooth",
    //   block: "start",
    //   inline: "nearest",
    // });
    const scroll = document.querySelectorAll(".custom-scrollbar");
    scroll.forEach((element) => {
      const elem = element as HTMLElement;
      elem.scrollTop = 0;
    });
  }
  radioButtonValue = "radio-button-1";
  allowShippingPreferenceChange: boolean = true;

  onRadioButtonSelected(value: string) {
    const uniqueRequestedDeliveryDates = new Set(
      this.cartEntries.map((entry: any) => entry.requestedDeliveryDate)
    );
    const uniqueShippingConditions = new Set(
      this.cartEntries.map((entry: any) => entry.shippingCondition)
    );
    const uniqueIncoTerms = new Set(
      this.cartEntries.map((entry: any) => entry.incoTerms)
    );
    const uniqueShippingWarehouse = new Set(
      this.cartEntries.map((entry: any) => entry.shippingWarehouse)
    );
    const uniqueShipVia = new Set(
      this.cartEntries.map((entry: any) => entry.shipVia)
    );

    let allowShippingPreferenceChange =
      uniqueRequestedDeliveryDates.size === 1 &&
      uniqueShippingConditions.size === 1 &&
      uniqueIncoTerms.size === 1 && uniqueShippingWarehouse.size === 1 &&
      uniqueShipVia.size === 1;

    if (
      value === "radio-button-1" &&
      this.radioButtonValue === "radio-button-2"
    ) {
      if (!allowShippingPreferenceChange) {
        this.allowShippingPreferenceChange = false;
        this.scrollPageToTop();

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      } else {
        this.allowShippingPreferenceChange = true;
        this.radioButtonValue = value;
        this.proceed(null, true, true);
      }
    } else {
      this.radioButtonValue = value;
      this.proceed(null, true, true);
    }
  }

  orderIndicator:any = undefined;
  onOrderIndicatorSelected(value: string) {
    this.orderIndicator = value;
    //this.proceed(null, true, true);
  }

  requestingNewPriceForm() {
    this.requestingPriceForm = this.fb.group({
      requestedPrice: [
        "",
        [Validators.required, Validators.pattern(/^\d+(\.\d+)?$/), Validators.min(0.01)],
      ],
      priceComment: ["", [Validators.required, Validators.maxLength(100)]],
    });
  }
  cancelRequestForNewPrice() {
    this.modalRef.hide();
  }
  submitRequestForNewPrice() {
    let payload: any = {
      username: this.userService.getUserEmail().toLowerCase(),
      cartId: this.cartNumberData?.code,
      entryNumber: this.selectedProduct.entryNumber,
      requestedPrice: this.requestingPriceForm.value.requestedPrice,
      priceComment: this.requestingPriceForm.value.priceComment,
    };
    if (this.requestingPriceForm.valid) {
      this.cartEntries[this.selectedPriceIndex].requestedPrice =
        this.requestingPriceForm.value.requestedPrice;
      this.cartEntries[this.selectedPriceIndex].priceComment =
        this.requestingPriceForm.value.priceComment;
      this.productService.requestingNewPrice(payload, {}).subscribe(
        (res: any) => {
          this.checkoutReqPrice= true;
        },
        (err: any) => {this.productService.progressHide();}
      );
    }
  }

  builderOrderDetailsIndex: any;
  builderDivDataIndex: any;
  builderDSDataIndex: any;
  rowSelectedStepOne(item: any, selectedIndex: number) {
    this.builderOrderDetails.forEach((row: any, index: any) => {
      this.builderOrderDetailsIndex = index;
      row.selected = false;
      if (selectedIndex == index && item.state == true) {
        row.selected = item.state;
      } else {
        row.selected = false;
      }
    });
  }

  rowSelected(item: any, selectedIndex: number) {
    this.builderDivData.forEach((row: any, index: any) => {
      this.builderDivDataIndex = index;
      row.selected = false;
      if (selectedIndex == index && item.state == true) {
        row.selected = item.state;
      } else {
        row.selected = false;
      }
    });
  }

  rowSelectedbuilderDSData(item: any, selectedIndex: number) {
    this.builderDSData.forEach((row: any, index: any) => {
      row.selected = false;
      if (selectedIndex == index && item.state == true) {
        this.builderDSDataIndex = index;
        row.selected = item.state;
      } else {
        row.selected = false;
      }
    });
  }
  selectedPriceComment: any = "";
  openPriceComment(value: any, template: TemplateRef<any>) {
    this.selectedPriceComment = value;
    this.modalRef = this.modalService.show(template, {
      id: "builder-details",
      class: "modal-md modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }

  numberAndDcecimalvaluesOnly(event: any): boolean {
    const value = event?.currentTarget?.value;
    const charCode = event.which ? event.which : event.keyCode;
    if (event?.key == "." && value.includes(event?.key)) {
      return false;
    }
    if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    let str = "";

    if (
      event.target.selectionStart == null ||
      event.target.selectionEnd == null
    ) {
      str = event.target.value + event.key;
    } else {
      str =
        event.target.value.slice(0, event.target.selectionStart) +
        event.key +
        event.target.value.slice(
          event.target.selectionEnd,
          event.target.value.length
        );
    }
    if (str.includes(".")) {
      let val = str.split(".");
      val = val[val.length - 1].split("");
      if (val.length > 2) {
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
    if (value.includes(".")) {
      let val = value.split(".");
      val = val[val.length - 1].split("");
      if (val.length > 1) {
        return false;
      }
    }
    return true;
  }
  uploadFile(event: any, inputRef: any) {
    let files: any = [...[], ...event.target.files];
    inputRef.value = "";
    let fileBlob: any = [];
    let totalFileSize = 0;

    files.forEach((file: any) => {
      totalFileSize = totalFileSize + file.size;
    });
    if (totalFileSize > 5242880 * 5) {
      this.openModalError(
        files.length === 1
          ? files[0].name + " size cannot exceed 5 MB"
          : "Size of all files cannot exceed 25 MB"
      );
    } else {
      files.forEach((file: any) => {
        if (file.size < 5242880) {
          const fileSize = +(file.size / 1024).toFixed(2);
          if (Number(this.totalFileSize) + fileSize <= 25600) {
            let fileReader = new FileReader();
            fileReader.onloadend = (fileLoadedEvent: any) => {
              let byteArray = fileLoadedEvent.target.result;
              // Print data in console
              fileBlob.push({
                file: byteArray,
                name: file.name,
              });
              if (fileBlob.length == files.length) {
                this.spinnerLoading = true;
                this.productService
                  .postImageForCart(
                    fileBlob,
                    `${API_CONSTANTS.uploadFile}` +
                      "?orderReference=" +
                      this.getStorageService.cartData.code
                  )
                  .subscribe((res) => {
                    this.spinnerLoading = false;
                    this.totalFileSize = res?.dataUsed
                      ? +res?.dataUsed
                      : this.totalFileSize;
                    if (res?.status == "Error") {
                      this.openConfirmationModal({
                        title: "Upload File",
                        content: res?.message,
                        primaryActionLabel: "OK",
                        secondaryActionLabel: "",
                        onPrimaryAction: () => {
                          this.hideConfirmationModal();
                        },
                      });
                    } else {
                      // this.totalFileSize = res?.dataUsed ? +res?.dataUsed : this.totalFileSize;
                      let duplicateFile = "";
                      let duplicateFilesMsg = "";
                      res?.fileDetails?.forEach((f: any, i: number) => {
                        if (f?.status == "Success") {
                          this.filesArray.push({
                            fileName: f?.fileName,
                            filePk: f?.filePK,
                          });
                          if (res?.fileDetails?.length - 1 == i) {
                            if (
                              res?.fileDetails?.every(
                                (r: any) => res?.status == "Success"
                              )
                            ) {
                              this.openConfirmationModal({
                                title: "Upload File",
                                content: f?.message,
                                primaryActionLabel: "OK",
                                secondaryActionLabel: "",
                                onPrimaryAction: () => {
                                  this.hideConfirmationModal();
                                },
                              });
                            }
                          }
                        } else if (f.status == "Error") {
                          duplicateFilesMsg =
                            duplicateFilesMsg + "<li>" + f?.message + "</li>";
                          if (res?.fileDetails?.length - 1 == i) {
                            duplicateFile = f.fileName;
                            this.openConfirmationModal({
                              title: "Upload File",
                              content:
                                "<ul class='ul-upload'>" +
                                duplicateFilesMsg +
                                "</ul>",
                              primaryActionLabel: "OK",
                              secondaryActionLabel: "",
                              onPrimaryAction: () => {
                                this.hideConfirmationModal();
                              },
                            });
                          }
                        }
                      });
                    }
                  });
              }
            };
            fileReader.readAsArrayBuffer(file);
          } else {
            this.openModalError("Size of all files cannot exceed 25 MB");
          }
        } else {
          this.openModalError(file.name + " size cannot exceed 5 MB");
        }
      });
    }
  }

  removeFile(index: any) {
    let fileObj = this.filesArray[index];
    let requestObj = {
      filePK: index.filePk,
      cartId: this.cartNumberData?.code,
    };

    this.alertMsg = "";
    this.spinnerLoading = true;
    this.orderService.removefile(requestObj).subscribe((response) => {
      this.spinnerLoading = false;
      this.totalFileSize = response?.dataUsed
        ? +response?.dataUsed
        : this.totalFileSize;
      if (response?.body?.status == "Success") {
        this.alertMsg = response?.body?.message;
        this.alertType = "success";
        this.scrollPageToTop();
        this.filesArray = this.filesArray.filter(
          (res: any) => res?.filePk != requestObj.filePK
        );
      } else {
        this.alertMsg = response?.body?.message;
        this.alertType = "danger";
        this.scrollPageToTop();
      }
      this.stopAlert();
    });
  }

  stopAlert() {
    setTimeout(() => {
      this.alertMsg = "";
    }, 3000);
  }

  openModalError(title: any) {
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
  changeEvent(event: any) {
    this.cartData.modelRoom = event?.state == true;
    this.checkoutForm.controls["modelRoom"].setValue(event?.state);
    this.proceed(null, true, true);
  }
  navigateToProductPage(id: any) {
    this.router.navigate(["commercial/products/details/" + id]);
  }
  marketSegmentSelection(val: any) {
    this.selectedMarketSegment = val;
  }
  continueShopping() {
    this.router.navigate(["/commercial/product-owner"]);
  }
  solutionDetailsClicked() {
    this.isSolutionDetailsClicked = !this.isSolutionDetailsClicked;
  }

  checkedToggleIndex = new Set();
  showAssignedSqFtYrd(e: any, entryNumber:any) {
    if (e.checked) {
      this.checkedToggleIndex.add(entryNumber);
      // this.showAssignedSpec = true;
    } else {
      // this.showAssignedSpec = false;      
      this.checkedToggleIndex.delete(entryNumber);
    }
  }
  isToggleChecked(i:any) {
    return this.checkedToggleIndex.has(i)
  }
  

  requestQuote() {
    // this.checkReserveEligibility(this.cartNumberData?.code);
    if (this.cartData?.droppedProductExists) {
      this.openConfirmationModal({
        title: "Request Quote",
        content:
          "Dropped products are not eligible for Quote , Would you like to add only eligible products to Quote?",
        primaryActionLabel: "CONTINUE",
        secondaryActionLabel: "CANCEL",
        onPrimaryAction: () => {
          this.proceed(null, true, true);
          this.placeRequestQuote();
        },
        onSecondaryAction: () => this.cancelReserve(),
      });
    } else {
      this.placeRequestQuote();
    }
  }
  placeRequestQuote() {
    const payLoad = {
      userCartID: this.cartNumberData?.code,
      isQuoteRequestFromCart: "true",
    };
    this.spinnerLoading = true;
    this.openProgressModal({ progressText: "Creating Quote..." });
    this.productService.createQuote(payLoad).subscribe((res: any) => {
      // this.productService.getLatestMiniCart(this.uid);
      this.router.navigateByUrl(
        "/commercial/quotes/request-quote/" + res?.body.code
      );
      this.spinnerLoading = false;
      this.modalService.hide();

      // this.checkForItemAddedinCart();
    });
  }
  breadcrumbClick(item: any) {
    if (this.breadcrumbItems.length > 2 && item.name == "Cart") {
      this.breadcrumbItems.pop();
      this.changeTab(0);
      this.staticTabs.tabs[0].active = true;
    }
  }

  careerLength: any = [];
  needTodisabled: boolean = false;
  getSelectedCarrierOptions($event: any, index: number, entryNumber: any) {
    this.careerLength.push(entryNumber);
    this.careerLength = this.removeDuplicates(this.careerLength);
    this.cartEntries[index].carrierNumber = $event;

    // if (
    //   this.cartData?.shippingConditions === "CA" &&
    //   this.cartEntries.length === this.careerLength.length
    // ) {

    //   this.needTodisabled = false;
    // } else {

    //   this.needTodisabled = true;
    // }
    this.needTodisabled = !(
      this.cartData?.shippingConditions === "CA" &&
      this.cartEntries.every((e: any) => e?.carrierNumber)
    );
  }

  removeDuplicates(arr: any) {
    return [...new Set(arr)];
  }
  keyPressForZip(e: KeyboardEvent) {
    return /^[a-z,A-Z, ,0-9]$/i.test(e.key);
  }
  keyPressForAccount(e: KeyboardEvent) {
    return /^[a-z,A-Z,0-9]$/i.test(e.key);
  }

  keyComemnts(e: KeyboardEvent) {
    let t = e;
  }

  onSelectEndUser(event: any) {
    this.selectedEndUser = event?.item?.key;
    if (
      event?.item?.value?.marketSegmentCode &&
      event?.item?.value?.marketSegmentCode != "EMPTY" &&
      event?.item?.value?.marketSegmentCode != null
    ) {
      this.marketSegmentCode = event?.item?.value?.marketSegmentCode;
      let marketSegmentFilterData = this.marketsegmentdata.filter(
        (segment: any) => segment.code === this.marketSegmentCode
      );

      if (marketSegmentFilterData.length == 1) {
        this.checkoutForm.patchValue({
          marketSegment: this.marketSegmentCode,
        });
        this.checkoutForm.controls["marketSegment"].disable();
      } else {
        this.checkoutForm.controls["marketSegment"].enable();
      }
    } else {
      this.checkoutForm.controls["marketSegment"].enable();
    }
  }

  endUserFormattedText(data: any) {
    let town = data.value.town || "";
    let state = data.value.state || "";
    let unitName = data.value.unitName;
    let address = "";
    if (town || state) {
      address = ` ( ${town} - ${state} )`;
    }

    if (!town || !state) {
      address = address.replace("-", "");
    }

    return `${unitName} ${address}`;
  }

  typeaheadOnBlur(event: any, clearVal = false) {
    if (clearVal) {
      this.checkoutForm.patchValue({
        endUser: "",
      });
      this.checkoutForm.patchValue({
        marketSegment: undefined,
      });

      this.checkoutForm.controls["marketSegment"].disable();
      this.selectedEndUser = null;
      this.notFoundendUser = false;
    } else if (event?.value || event == undefined) {
      this.notFoundendUser = true;
      this.selectedEndUser = this.orgUid;
      this.checkoutForm.patchValue({
        endUser: this.endUserName,
      });
      this.checkoutForm.controls["marketSegment"].enable();
    }
  }

  public selectedShipViaProduct: any;
  shippingWareHouseType: string = "";
  shipingWareHouseModal(
    template: TemplateRef<any>,
    type: any,
    cartIndexData: any,
    isCompleteCart: boolean
  ) {
    this.isCompleteCart = isCompleteCart;
    this.selectedShipViaProduct = cartIndexData;

    this.shippingWareHouseType = type;
    if (type === "shippingWareHouse") {
      this.shippingWareHouseOptions = [];
      // this.spinnerLoading = true;
      this.productService
        .getShippingWareHouseWithOutFlag()
        .subscribe((res: any) => {
          this.setLoadAPI("ShippingWarehouse");
          this.spinnerLoading = false;
          if (res?.body) {
            if (!this.customerFlag && !this.salesPersonFlag) {
              this.shippingWareHouseOptions = [];
              for (let key of Object.entries(res?.body)) {
                this.shippingWareHouseOptions.push({
                  value: key[0],
                  label: key[1],
                });
              }
            }
          }

          this.incoTermsLoc2SelectedOption =
            cartIndexData?.shipVia ||
            cartIndexData?.defaultShipVia ||
            this.storedShippingAddress?.defaultShipVia;
          this.getIncoTermsLoc2(
            this.isCompleteCart
              ? this.cartData?.shippingWarehouse
              : cartIndexData.shippingWarehouse
          );
          // this.modalRef = this.modalService.show(template, {
          //   id: "shipingWareHouseModal",
          //   class: "modal-lg modal-dialog-centered",
          //   backdrop: "static",
          //   keyboard: false,
          // });
        }, () => {this.setLoadAPI("ShippingWarehouse")});
    } else {
      this.shippingWareHouseOptions.push({
        value: cartIndexData.shippingWarehouse,
        label: cartIndexData.shippingWarehouseDesc,
      });
      // this.shipViaSelectedOption =
      //   this.storedShippingAddress?.defaultShippingWarehouse ||
      //   this.shippingWareHouseOptions[0].value;
      // if (this.isCompleteCart) {
      //   this.shipViaSelectedOption = this.cartData?.shippingWareHouse;
      // }
      this.incoTermsLoc2SelectedOption =
        this.storedShippingAddress?.defaultShipVia;
      this.getIncoTermsLoc2(
        this.isCompleteCart
          ? this.cartData?.shippingWarehouse
          : cartIndexData.shippingWarehouse
      );
      // this.modalRef = this.modalService.show(template, {
      //   id: "shipingWareHouseModal",
      //   class: "modal-lg modal-dialog-centered",
      //   backdrop: "static",
      //   keyboard: false,
      // });
    }
  }

  closeShippingWareHouseModal() {
    this.isShippingOptionsModalOpened = false;
    this.modalService.hide("shipingWareHouseModal");
  }
  changeShippingWareHouseOptions(event: any) {
    this.shippingWareHouseSelectedOption = event;

    this.getIncoTermsLoc2(this.shippingWareHouseSelectedOption);
  }
  reAtpPoNumber:any = "";
  reAtpComment:any = "";
  reAtpMarketSegment:any = "";
  reAtpJobLocation:any ="";
  reAtpSubmittedFor:any = "";
  reAtpEndUserCode:any = "";
  reAtpCreUserCode:any = "";
  reAtpGpoUserCode:any = "";
  reAtpAdUserCode:any = "";
  reAtpInternalComment:any ="";
  reAtpTermsCode:any = "";
  reAtpDeliveryGrouping:boolean = false;
  shippingWareHouseModalSubmit() {
    this.productService.progressShow("reAtp","reAtpId");
    const selectedItem = this.shippingWareHouseOptions.find(
      (item: any) => item.value === this.shippingWareHouseSelectedOption
    );
    const selectedIncoTermsItem = this.incoTermsLoc2Options.find(
      (item: any) => item.value === this.incoTermsLoc2SelectedOption
    );
    const selectedShippingConditionItem = this.shipViaOptions.find(
      (item: any) => item.value === this.shipViaSelectedOption
    );
    const selectedIncoTerms = this.incoTermsOptions.find(
      (item: any) => item.value === this.incoTermsSelectedOption
    );
    this.reATP = true;
    

    if (selectedItem) {
      this.storedShippingAddress.defaultShippingWarehouse = selectedItem?.value;
      this.storedShippingAddress.defaultShippingWarehouseDesc =
        selectedItem?.label;
      this.storedShippingAddress.shippingWarehouse = selectedItem?.value;
      this.storedShippingAddress.shippingWarehouseDesc = selectedItem?.label;
    }
    if (selectedIncoTermsItem) {
      this.storedShippingAddress.defaultShipVia = selectedIncoTermsItem?.value;
      this.storedShippingAddress.defaultShipViaDesc =
        selectedIncoTermsItem?.label;
      this.storedShippingAddress.shipVia = selectedIncoTermsItem?.value;
      this.storedShippingAddress.shipViaDesc = selectedIncoTermsItem?.label;
      this.storedShippingAddress.incoTermsLoc2 = selectedIncoTermsItem?.value;
      this.storedShippingAddress.defaultIncoTermsLoc2 =
        selectedIncoTermsItem?.value;
    }
   
    if (selectedShippingConditionItem) {
      this.storedShippingAddress.defaultShippingCondition =
        selectedShippingConditionItem?.value;
      this.storedShippingAddress.defaultShippingConditionDesc =
        selectedShippingConditionItem?.label;
      this.storedShippingAddress.shippingCondition =
        selectedShippingConditionItem?.value;
      this.storedShippingAddress.shippingConditionDesc =
        selectedShippingConditionItem?.label;
      this.storedShippingAddress.shippingMethod =
        selectedShippingConditionItem?.value;
      this.storedShippingAddress.defaultShippingMethod =
        selectedShippingConditionItem?.value;
    }
    if (selectedIncoTerms) {
      this.storedShippingAddress.defaultIncoTerms = selectedIncoTerms?.value;
      this.storedShippingAddress.defaultIncoTermsDesc =
        selectedIncoTerms?.label;
      this.storedShippingAddress.incoTerms = selectedIncoTerms?.value;
      this.storedShippingAddress.incoTermsDesc = selectedIncoTerms?.label;
    }
    this.storedShippingAddress.rdd = this.selectedShipViaProduct != undefined ?  this.selectedShipViaProduct?.requestedDeliveryDate:
    this.cartData?.requestedDeliveryDate;
  this.storedShippingAddress.reqdeliverydate =
  this.selectedShipViaProduct != undefined ?  this.selectedShipViaProduct?.requestedDeliveryDate:
  this.cartData?.requestedDeliveryDate;

    
    if (this.reInspect == true && this.reInspectShippingOptions) {
      this.storedShippingAddress = { ...this.storedShippingAddress, ...this.reInspectShippingOptions}
    }
    if (this.storedShippingAddress?.oneTimeShippingAddress || this.storedShippingAddress?.isOneTimeShipTo) {
      this.storedShippingAddress = { ...this.storedShippingAddress, ...this.cartData?.shippingInfo };
    }
    this.getStorageService.setItem(
      "shippingAddress",
      this.storedShippingAddress
    );

    // });
    this.shippingAddress = this.storedShippingAddress;
    this.currentSelectedCartEntry = this.selectedShipViaProduct;


    this.reAtpTermsCode=this.cartData?.termsCode;
    this.reAtpComment =   this.checkoutForm.controls["comments"].value;
    this.reAtpInternalComment = this.internalComment;
    
    this.reAtpEndUserCode = this.checkoutForm.controls["endUser"].value || "";
    this.reAtpCreUserCode = this.checkoutForm.controls["cre"].value || "";
    this.reAtpGpoUserCode = this.checkoutForm.controls["gpo"].value || "";
    this.reAtpAdUserCode = this.checkoutForm.controls["ad"].value || "";
    this.reAtpJobLocation = this.checkoutForm.controls["jobLocation"].value || "";
    this.reAtpMarketSegment = this.checkoutForm.controls["marketSegment"].value||"";
    this.reAtpPoNumber = this.checkoutForm.value.porequest;
    this.reAtpDeliveryGrouping = this.radioButtonValue === "radio-button-3";
    this.reAtpTermsCode = this.cartData?.termsCode;
    this.reAtpSubmittedFor = this.submitFor?.uid;


    this.getStorageService.setItem("completeCart", this.cartData);
    this.spinnerLoading = true;
    if (this.isCompleteCart) {
      if(this.smallParcelShippingChange){
        this.cartEntriesLength = this.selectedShipViaProduct;
      }else{
        this.cartEntriesLength = this.selectedShipViaProduct?.cartEntries;
      }
      
      let apiCalls: any = [];
      this.smallParcelShippingChange = false;
      this.cartEntriesLength.forEach((item: any) => {
        if(!item?.isBundledEntry){
          apiCalls.push(
            this.productService
            .removeSelectedItemFromCart(
              this.cartData?.cartNumber || this.cartData?.code,
              item.entryNumber
          ));
        }
      });
      forkJoin(apiCalls).subscribe((res: any) => {
        if (res && res[0].status == 200 && res[0].body.messages[0].status == "Success") {
          this.apiService.getMiniCart(this.uid, this.userEmail);
          this.entryNumber = 0;
          this.getPdpDataForShipWarehouse(this.cartEntriesLength[0]);
          this.createCheckoutForm();
          this.spinnerLoading = false;
          this.checkedToggleIndex.clear();
        } else {
          this.productService.progressHide("reAtpId");
          // this.modalService.hide("progressModal");
        }
      },(err:any)=>{
          this.productService.progressHide("reAtpId");
        // this.modalService.hide("progressModal");
        this.spinnerLoading = false;
      });
    }else{
      this.cartEntriesLength = this.cartEntries;
      // this.spinnerLoading = true;
      this.productService
      .removeSelectedItemFromCart(
        this.cartData?.cartNumber || this.cartData?.code,
        this.currentSelectedCartEntry.entryNumber
      )
      .subscribe({
        next: (res: any) => {
          this.apiService.getMiniCart(this.uid, this.userEmail);
          if (res.status == 200) {
            this.getPdpDataForShipWarehouse(this.currentSelectedCartEntry);
            this.spinnerLoading = false;
            this.checkedToggleIndex.delete(this.currentSelectedCartEntry.entryNumber)
          } else {
          this.productService.progressHide("reAtpId");
            // this.modalService.hide("progressModal");
          }
        },
        error: () => {
          this.productService.progressHide("reAtpId");
          // this.modalService.hide("progressModal");
        },
      });
    }
  }

  incoTermSubmit() {
    const selectedItem = this.shipViaOptions.find(
      (item: any) => item.value === this.shipViaSelectedOption
    );
    const selectedIncoTermsItem = this.incoTermsOptions.find(
      (item: any) => item.value === this.incoTermsSelectedOption
    );
    this.reATP = true;

    // this.getStorageService.getItem("shippingAddress").subscribe((res: any) => {
    // storedShippingAddress = res;

    if (selectedItem) {
      this.storedShippingAddress.defaultShippingMethod = selectedItem?.value;
      this.storedShippingAddress.shippingCondition = selectedItem?.value;
      this.storedShippingAddress.defaultShippingCondition = selectedItem?.value;
      this.storedShippingAddress.shippingMethod = selectedItem?.value;
      this.storedShippingAddress.shippingMethodDesc = selectedItem?.label;
      this.storedShippingAddress.defaultShippingMethodDesc =
        selectedItem?.label;
    } else {
      this.storedShippingAddress.defaultShippingMethod =
        this.shippingAddress.defaultShippingMethod;
      this.storedShippingAddress.shippingMethod =
        this.shippingAddress.defaultShippingMethod;
      this.storedShippingAddress.shippingMethodDesc =
        this.shippingAddress.defaultShippingMethodDesc;
      this.storedShippingAddress.defaultShippingMethodDesc =
        this.shippingAddress.defaultShippingMethodDesc;
    }
    if (selectedIncoTermsItem) {
      this.storedShippingAddress.defaultIncoTerms =
        selectedIncoTermsItem?.value;
      this.storedShippingAddress.defaultIncoTermsDesc =
        selectedIncoTermsItem?.label;
      this.storedShippingAddress.incoTerms = selectedIncoTermsItem?.value;
      this.storedShippingAddress.incoTermsDesc = selectedIncoTermsItem?.label;
    } else {
      this.storedShippingAddress.defaultIncoTerms =
        this.shippingAddress.defaultIncoTerms;
      this.storedShippingAddress.defaultIncoTermsDesc =
        this.shippingAddress.defaultIncoTermsDesc;
      this.storedShippingAddress.incoTerms =
        this.shippingAddress.defaultIncoTerms;
      this.storedShippingAddress.incoTermsDesc =
        this.shippingAddress.defaultIncoTermsDesc;
    }

    this.storedShippingAddress.rdd =
      this.selectedShipViaProduct.requestedDeliveryDate;
    this.storedShippingAddress.reqdeliverydate =
      this.selectedShipViaProduct.requestedDeliveryDate;
    this.storedShippingAddress.shipVia = this.selectedShipViaProduct.shipVia;
    this.storedShippingAddress.defaultShipVia =
      this.selectedShipViaProduct.shipVia;
    this.storedShippingAddress.incoTermsLoc2 =
      this.selectedShipViaProduct.shipVia;
    this.storedShippingAddress.shippingWarehouse =
      this.selectedShipViaProduct.shippingWarehouse;
    this.storedShippingAddress.shippingWarehouseDesc =
      this.selectedShipViaProduct.shippingWarehouseDesc;
    this.storedShippingAddress.defaultShippingWarehouse =
      this.selectedShipViaProduct.shippingWarehouse;
    this.storedShippingAddress.defaultShippingWarehouseDesc =
      this.selectedShipViaProduct.shippingWarehouseDesc;

    if (this.requestDeliveryDate) {
      this.storedShippingAddress.requestDeliveryDate =
        this.requestDeliveryDate || this.shippingAddress?.requestDeliveryDate;
    }
    // this.storedShippingAddress.rdd =
    //   this.selectedShipViaProduct.requestedDeliveryDate;

    this.getStorageService.setItem(
      "shippingAddress",
      this.storedShippingAddress
    );

    // });
    this.shippingAddress = this.storedShippingAddress;

    // });

    this.currentSelectedCartEntry = this.selectedShipViaProduct;
    //  if(this.totalItems>1){
    // this.getStorageService.setItem("updateIncoLine", this.currentSelectedCartEntry.entryNumber);
    this.getStorageService.setItem("completeCart", this.cartData);
    this.spinnerLoading = true;
    this.cartEntriesLength = JSON.parse(JSON.stringify(this.cartData.entries)) ;
    if (this.isCompleteCart) {
      this.productService
        .cancelCart(this.cartData?.code || "123456")
        .subscribe({
          next: (res) => {
            if (res.status == 200 && res.body.messages[0].status == "Success") {
              // this.cartData=undefined
              this.apiService.getMiniCart(this.uid, this.userEmail);
              this.entryNumber = 0;
              this.getPdpData(this.cartEntriesLength[0]);
              this.cartData = {};
              this.createCheckoutForm();
              this.spinnerLoading = false;
              this.checkedToggleIndex.clear();
            }
          },
          error: (error: any) => {
            this.productService.progressHide();
            this.spinnerLoading = false;
            // // this.addtoCartFailed = true;
            // window.scrollTo({
            //   top: 0,
            //   behavior: "smooth",
            // });

            // this.cartData = {};
          },
        });
    } else {
      this.cartEntriesLength = [];
      this.productService
        .removeSelectedItemFromCart(
          this.cartData?.cartNumber || this.cartData?.code,
          this.currentSelectedCartEntry.entryNumber
        )
        .subscribe({
          next: (res: any) => {
            this.apiService.getMiniCart(this.uid, this.userEmail);

            if (res.status == 200 && res.body.messages[0].status == "Success") {
              this.getPdpData(this.currentSelectedCartEntry);
              this.spinnerLoading = false;
              this.checkedToggleIndex.delete(this.currentSelectedCartEntry.entryNumber);
            }
          },
        });
    }
  }
  getPdpDataForShipWarehouse(lineProduct: any) {
    if (this.cartData.sampleOrder) {
      const feetYardFormData = {
        unit: lineProduct.uom.code,

        quantity: lineProduct.userRequestedQuantity,

        feet: 0,

        inches: 0,

        dye: "",

        targetLength: "",

        minLength: "",

        maxLength: "",

        maxFeet: "",

        maxInches: "",

        minFeet: "",

        minInches: "",

        requestedQty: lineProduct.userRequestedQuantity,
      };

      this.spinnerLoading = true;

      this.addToCartEachEntry(lineProduct, feetYardFormData);
    } else {
      this.spinnerLoading = true;
      this.productService
        .getPdpRecords(lineProduct.product.code, this.substituteProductFlag)
        .subscribe((res) => {
          this.spinnerLoading = false;
          if (res && res.status == 500) {
          }
          if (res && res.status == 400) {
          }

          if (res.body) {
            this.pdbData = res.body;
            this.productType = this.pdbData.productType;
            this.subProductType = this.pdbData.subProductType;
            this.productService
                .getBundledReferences(lineProduct.product.code)
                .subscribe((bundledata) => {
              lineProduct.bundleProduct = bundledata?.body?.references && bundledata?.body?.references.length > 0 ? true : false;
              this.spinnerLoading = true;
              this.productService
                .getUOMDetails(res.body.code)
                .subscribe((result) => {
                  this.spinnerLoading = false;
                  this.isAtpCheck = this.atpCheckProductTypes.includes(this.subProductType);
                  let erpProductCategory = result?.body?.erpProductCategory;
                  if(erpProductCategory === 'B'){
                    this.isAtpCheck = true;
                  }
                  if ((this.pdbData?.classification == "Accessories" && !(this.pdbData.subProductType === 'CUSHION_PAD' && this.isAtpCheck))|| this.pdbData.productType ===  "MERCHANDISING") {
                    this.isAtpCheck = false;
                  }
                  if (this.pdbData && this.isAtpCheck) {
                    if (lineProduct.product.code.includes("#")) {
                      lineProduct.product.code = lineProduct.product.code.replace(/#/g, "%23");
                    }
                    const setTimeoutRef = setTimeout(() => {
                      this.spinnerLoading = false;
                    }, 30000);
                    this.productService.getProductPriceDetails(lineProduct.product.code).subscribe(
                      (res: any) => {
                        this.productService.progressHide("reAtpId");
                        this.spinnerLoading = false;
                        clearTimeout(setTimeoutRef);
                
                        this.priceDetails = res.body;
                    const initialState: ModalOptions = {
                      initialState: {
                        rddFlag: this.rddFlag,
                        fromViewInventory: false,
                        termsCode:this.reAtpTermsCode || "",
                        comment:this.reAtpComment || "",
                        internalComment:this.reAtpInternalComment || "",
                        poNumber:this.reAtpPoNumber ||"",
                        marketSegment:this.reAtpMarketSegment || "",
                        jobLocation:this.reAtpJobLocation || "",
                        submittedFor:this.reAtpSubmittedFor || "",
                        endUserCode:this.selectedEndUser || "",
                        creUserCode:this.reAtpCreUserCode || "",
                        gpoUserCode:this.reAtpGpoUserCode || "",
                        adUserCode:this.reAtpAdUserCode || "",
                        deliveryGrouping:this.reAtpDeliveryGrouping || false,
                        lineProduct: this.pdbData,
                        solutions: [this.pdbData],
                        openFromaddressModal: false,
                        shippingAddress: this.storedShippingAddress,
                        shippingOptions: this.storedShippingAddress,
                        shippingWarehouse: this.shippingWareHouseSelectedOption,
                        shippingCondition: this.shipViaSelectedOption,
                        incoTerms: this.incoTermsSelectedOption,
                        shipVia: this.incoTermsLoc2SelectedOption,
                        priceDetails: this.priceDetails,
                        quoteNumber:this.cartQuoteNumber,
                        requestedPrice:lineProduct?.requestedPrice,
                        priceComment:lineProduct?.priceComment,
                        requestedYdkQty: lineProduct.pricingUom === 'YDK' ? lineProduct?.pricingUOMQuantity :"",
                        cartData: null,
                        feetyardForm: {
                          unit: lineProduct.uom.code,
                          quantity: "",
                          feet:
                            lineProduct.uom.code === "LF"
                              ? lineProduct.userRequestedQuantity.split(".")[0]
                              : 0,
                          inches:
                            lineProduct.uom.code === "LF"
                              ? lineProduct.userRequestedQuantity.split(".")[1]
                              : 0,
                          dye: "",
                          targetLength: "",
                          minLength: "",
                          maxLength: "",
                          maxFeet: "",
                          maxInches: "",
                          minFeet: "",
                          minInches: "",
                          requestedQty: lineProduct.userRequestedQuantity,
                          requestedYdkQty: lineProduct.pricingUom === 'YDK' ? lineProduct?.pricingUOMQuantity :"",
                        },
                        productType: this.pdbData.productType.toUpperCase(),
                        aptCheckEntrie: [],
                        reATP: true,
                        multiCutIndication: false,
                        viewInventory: false,
                        entryLength: this.entryNumber,
                        isReinspect: this.reInspectFlag,
                        reATPChangeSource : this.reATPChangeSource,
                        isCompleteCart: this.isCompleteCart,
                        sameDyeLot: lineProduct.sameDyeLot,
                        showroom: this.showroom,
                        modelRoom: this.checkoutForm.value?.modelRoom,
                        noCharge: lineProduct?.noCharge,
                        noChargeReasonCode: lineProduct?.noChargeReasonCode,
                        noFreight: lineProduct?.noFreight,
                        sideMark: lineProduct?.sideMark,
                        erpProductCategory: erpProductCategory,
                        rdd: this.requestDeliveryDate || this.storedShippingAddress?.requestedDeliveryDate,
                        preferredStock: lineProduct?.preferredStock,
                        bundleProduct: lineProduct?.bundleProduct,
                        atpCheckFromCart: (entry: any) => {
                          this.modalService.hide();
                          this.entryNumber = entry;

                          this.productService.getMiniCartData(this.uid).subscribe(
                            (res) => {
                              this.cartData = res?.body;
                              if (entry < this.cartEntriesLength.length) {
                                this.getPdpDataForShipWarehouse(
                                  this.cartEntriesLength[entry]
                                );
                              } else {
                                this.rddFlag = false;
                                this.modalService.hide('progressModal');
                                this.getCartData(this.cartData?.code);
                              }
                            },
                            () => {
                              this.modalService.hide("progressModal");
                            });
                        },
                      },

                      id: "AddCompanionProductsComponent",
                      class: "modal-xl modal-dialog-centered",
                    };
                    this.modalService.hide('progressModal');
                    this.bsModalRef = this.modalService.show(
                      AddCompanionProductsComponent,
                      Object.assign(initialState, {
                        id: "AddCompanionProductsComponent",
                        class: "modal-xl modal-dialog-centered",
                        backdrop: "static",
                        keyboard: false,
                      })
                    );
                    this.bsModalRef.content = {...this.bsModalRef.content,...{solutions:[this.pdbData]}};
                  },()=>{this.productService.progressHide("reAtpId");});
                  } else if (this.pdbData && !this.isAtpCheck) {
                    if (this.isCompleteCart) {
                      this.addToCartReATP(lineProduct, this.pdbData);
                    } else {
                      const feetYardFormData = {
                        unit: lineProduct.uom.code,
                        quantity: lineProduct.userRequestedQuantity,
                        feet: 0,
                        inches: 0,
                        dye: "",
                        targetLength: "",
                        minLength: "",
                        maxLength: "",
                        maxFeet: "",
                        maxInches: "",
                        minFeet: "",
                        minInches: "",
                        requestedQty: lineProduct.userRequestedQuantity,
                      };
                      this.spinnerLoading = true;
                      this.addToCartEachEntry(lineProduct, feetYardFormData);
                    }
                    //   this.bsModalRef.content.solutions = [this.pdbData];
                  }

                  //  this.addAccessoriesAddcart(lineProduct, this.isAtpCheck);
                }, () => {
                  this.productService.progressHide("reAtpId");
                });

            },()=>{this.productService.progressHide("reAtpId");}); 
          } else {
            // this.modalService.hide('progressModal');
            this.productService.progressHide("reAtpId");
          }
        }, () => {
          this.productService.progressHide("reAtpId");
      });
    }
  }

  addToCartReATP(feetYardFormData: any, pdpData: any) {
    console.log("feetYardFormData----->",feetYardFormData)
    this.spinnerLoading = true;
    // this.productService.progressShow("","reatp");
    if (pdpData.code.includes("#")) {
      pdpData.code = pdpData.code.replace(/#/g, "%23");
    }
    const setTimeoutRef = setTimeout(() => {
      this.spinnerLoading = false;
    }, 30000);
    this.productService.getProductPriceDetails(pdpData.code).subscribe(
      (res: any) => {
        this.spinnerLoading = false;
        clearTimeout(setTimeoutRef);

        this.priceDetails = res.body;
//priceComment
      //  requestedPrice
    const item = {
      dyeLot: "",
      feet: feetYardFormData?.feet ? Number(feetYardFormData?.feet) : "",
      inches: feetYardFormData?.inches ? Number(feetYardFormData?.inches) : "",
      productCode: pdpData?.code,
      requestedUOM: feetYardFormData?.uom.code,
      requestedQty: feetYardFormData?.userRequestedQuantity,
      maxFeet: feetYardFormData?.maxFeet,
      maxInches: feetYardFormData?.maxInches,
      minFeet: feetYardFormData?.minFeet,
      minInches: feetYardFormData?.minInches,
      rollPrices: true,
      productPriceData: this.priceDetails,
      priceComment:feetYardFormData.priceComment,
      requestedPrice:feetYardFormData.requestedPrice,
      requestedDeliveryDate:
        feetYardFormData?.requestedDeliveryDate ||
        this.storedShippingAddress?.requestedDeliveryDate,

      shippingCondition:
        this.storedShippingAddress?.defaultShippingMethod ||
        this.storedShippingAddress?.shippingCondition ||
        this.storedShippingAddress?.shippingMethod ||
        this.storedShippingAddress?.defaultShippingConditions ||
        "",
      shipVia:
        this.storedShippingAddress?.shipVia ||
        this.storedShippingAddress?.defaultShipVia,
      shippingWarehouse:
        this.storedShippingAddress?.shippingWarehouse ||
        this.storedShippingAddress?.defaultShippingWarehouse ||
        this.storedShippingAddress?.defaultShippingWarehouseDesc ||
        "",
      incoTerms:
        this.storedShippingAddress?.defaultIncoTerms ||
        this.storedShippingAddress?.IncoTerms,
      solution: [], // Wrap the current solution in an array
      //  shippingCondition: this..shipViaSelectedOption,
      // xx
      noCharge: feetYardFormData?.noCharge,
      noChargeReasonCode:feetYardFormData?.noChargeReasonCode,
      noFreight:feetYardFormData?.noFreight,
      sideMark: feetYardFormData?.sideMark,
    };

    let phoneNumber =
      this.storedShippingAddress?.Phone ||
      this.storedShippingAddress?.phoneNumber ||
      "1234567890";
    phoneNumber = phoneNumber
      .replace("(", "")
      .replace(")", "")
      .replace(/ /g, "");
    const payLoad: any = {
      addressCity:
        this.storedShippingAddress?.addressCity ||
        this.storedShippingAddress?.town ||
        "",
      addressCountry:
        this.storedShippingAddress?.oneTimeShippingAddress ||
        this.storedShippingAddress?.isOneTimeShipTo
          ? this.storedShippingAddress.country?.isocode
          : this.storedShippingAddress.country,
      addressLine1:
        this.storedShippingAddress?.addressLine1 ||
        this.storedShippingAddress?.line1 ||
        "",
      addressLine2:
        this.storedShippingAddress?.addressLine2 ||
        this.storedShippingAddress?.line2 ||
        "",
      addressName: this.storedShippingAddress?.addressName || this.storedShippingAddress?.companyName,
      addressPostalCode:
        this.storedShippingAddress?.addressPostalCode ||
        this.storedShippingAddress?.postalCode ||
        "",
      addressState:
        this.storedShippingAddress?.addressState ||
        this.storedShippingAddress?.region ||
        "",
      carrierNumber: this.storedShippingAddress?.carrierNumber,
      satellite: this.storedShippingAddress?.satellite?.code,
      claimNumber: this.storedShippingAddress?.claimNumber
        ? this.storedShippingAddress?.claimNumber
        : "",
      hasClaimSubmitted: this.storedShippingAddress?.hasClaimSubmitted
        ? this.storedShippingAddress?.hasClaimSubmitted
        : false,
      invoiceNumber: this.storedShippingAddress?.invoiceNumber
        ? this.storedShippingAddress?.invoiceNumber
        : "",
      shipToUnit: this.storedShippingAddress?.oneTimeShippingAddress
        ? ""
        : this.shippingAddressId,
      item: [item],
      noPrice: this.storedShippingAddress?.noPrice
        ? this.storedShippingAddress?.noPrice
        : true,
      oneTimeShippingAddress:
        this.storedShippingAddress?.oneTimeShippingAddress ||
        this.storedShippingAddress?.isOneTimeShipTo ||
        false,
      replacementOrderNumber: this.storedShippingAddress?.orderNumber
        ? this.storedShippingAddress?.orderNumber
        : "",
      pdpProductCode: this.pdbData.code,
      phoneNumber: phoneNumber,
      purchaseOrderNumber: this.storedShippingAddress?.purchaseOrderNumber
        ? this.storedShippingAddress?.purchaseOrderNumber
        : "",
      replacementOrder: this.storedShippingAddress?.replacementOrder || false,
      replacementReason: this.storedShippingAddress?.replacementReason
        ? this.storedShippingAddress?.replacementReason
        : "",
      requestedDeliveryDate:
        feetYardFormData?.requestedDeliveryDate ||
        this.storedShippingAddress?.requestedDeliveryDate,

      sampleProduct: this.shippingAddress?.sampleProduct
        ? this.storedShippingAddress?.sampleProduct
        : false,
      sampleType: this.shippingAddress?.sampleType
        ? this.shippingAddress?.sampleType
        : "",
      shippingCondition:
        this.storedShippingAddress?.defaultShippingMethod ||
        this.storedShippingAddress?.shippingCondition ||
        this.storedShippingAddress?.shippingMethod ||
        this.storedShippingAddress?.defaultShippingConditions ||
        "",
      shipVia:
        this.storedShippingAddress?.shipVia ||
        this.storedShippingAddress?.defaultShipVia,
      shippingWarehouse:
        this.storedShippingAddress?.shippingWarehouse ||
        this.storedShippingAddress?.defaultShippingWarehouse ||
        this.storedShippingAddress?.defaultShippingWarehouseDesc ||
        "",
      incoTerms:
        this.storedShippingAddress?.defaultIncoTerms ||
        this.storedShippingAddress?.IncoTerms,
      orderSamples: this.storedShippingAddress?.orderSamples
        ? this.storedShippingAddress?.orderSamples
        : [],
      isMultiCut: false,
      shippingInfo: null,
      ...(
        { quoteNumber: this.cartQuoteNumber || false }
        ),
        reAtp:true,
        termsCode:this.reAtpTermsCode || "",
        comment:this.reAtpComment || "",
        internalComment:this.reAtpInternalComment || "",
        poNumber:this.reAtpPoNumber ||"",
        showroom: this.showroom,
        marketSegment:this.reAtpMarketSegment || "",
        jobLocation:this.reAtpJobLocation || "",
        submittedFor: this.submitFor?.uid || "",
        endUserCode:this.selectedEndUser || "",
        creUserCode:this.reAtpCreUserCode || "",
        gpoUserCode:this.reAtpGpoUserCode || "",
        adUserCode:this.reAtpAdUserCode || "",
        deliveryGrouping:this.reAtpDeliveryGrouping || false,
        shipComplete: this.isCompleteCart == true ? true:false,
        ...(this.reInspectFlag === true
          ? { reInspect: this.reInspectFlag || false }
          : {}),
        modelRoom: this.modelRoom,
        soldTo: this.isShipToUser ? this.soldToAccount : this.uid,
        orderPlacedSite: "xchange",
        isAccessoryCart: this.pdbData?.classification == "Accessories" ? true : false,
        bundleProduct: feetYardFormData?.bundleProduct,
    };
    
    this.productService.getMiniCartData(this.uid).subscribe((res) => {
      this.cartData = res?.body || res;
      let cartNumber = null;
      if (res.body?.errorMessage?.includes("No Cart existed")) {
        cartNumber = null;
      } else {
        cartNumber = res?.body?.code;
      }

      this.productService
        .addToCart(this.userService.getUserEmail().toLowerCase(), cartNumber, payLoad)
        .subscribe(
          (res) => {
            let cartId = res?.body?.cartNumber;
            // this.modalService.hide('progressModal');
            
            if (res?.body?.errorMessages || res?.body?.messages?.length) {
              if (
                res?.body?.errorMessages === "Error" ||
                res?.body?.messages[0]?.status === "Error" ||
                res?.body?.messages[0]?.status === "Failed" ||
                res?.body?.messages[1]?.status === "Error"
              ) {
                this.productService.progressHide("reAtpId");
                // this.modalService.hide('progressModal');
                this.spinnerLoading = false;
                this.failedCase(res?.body?.messages[0]?.message);
              } else {
                if (this.isCompleteCart) {
                  ++this.entryNumber;
                  // this.atpCheckFromCart();
                  if (this.entryNumber < this.cartEntriesLength.length) {
                    this.getPdpDataForShipWarehouse(
                      this.cartEntriesLength[this.entryNumber]
                    );
                  } else {
                    this.productService.progressHide("reAtpId");
                    this.rddFlag = false;
                    this.cancelReserve();
                    this.getCartData(cartId)
                  }
                }
                this.successCase(res);
                //  this.spinnerLoading = false;
              }
            } else {
              // this.atpCheckFromCart();
              if (this.isCompleteCart) {
                ++this.entryNumber;
                if (this.entryNumber < this.cartEntriesLength.length) {
                  this.getPdpDataForShipWarehouse(
                    this.cartEntriesLength[this.entryNumber]
                  );
                } else {
                  this.productService.progressHide("reAtpId");
                  this.rddFlag = false;
                  this.cancelReserve();
                  this.getCartData(cartId);
                }
              }
              this.successCase(res);
              //  this.spinnerLoading = false;
            }
          },
          (err: any) => {  
            this.productService.progressHide("reAtpId");          
            // this.modalService.hide('progressModal');
            this.spinnerLoading = false;
            this.addtoCartFailed = true;
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }
        );
    }, () => { this.productService.progressHide("reAtpId") });
  }, () => { this.productService.progressHide("reAtpId") });
  }
 
  datesEnabled: any = [];
  daysToBeEnabled: any = [];
  disabledDate: any = [];
  getOrderDates() {
    this.orderService.getDeliveryDate("?shipToUnit=" + "&cartId="+this.cartData?.code).subscribe({
      next: (res) => {
        this.datesEnabled = res.body;
        this.datesEnabled = this.datesEnabled?.map((el: any) => {
          return new Date(this.changeDateFormats(el));
        });

        this.daysToBeEnabled = this.datesEnabled;
      },
      error: (err) => {this.productService.progressHide();},
    });
  }
  changeDateFormats(val: any) {
    let dateArray = val.split("");
    let year = dateArray.splice(0, 4);
    let month = dateArray.splice(0, 2);
    let date = dateArray.splice(0, 2);

    return `${month.join("")}/${date.join("")}/${year.join("")}`;
  }
  changeDateFormat(val: any) {
    if (!(val instanceof Date)) {
      try {
        val = new Date(val);
      } catch (error) {
        return "";
      }
    }
    const month = (val.getMonth() + 1).toString().padStart(2, "0"); // Month is zero-based
    const day = val.getDate().toString().padStart(2, "0");
    const year = val.getFullYear();
    return `${month}/${day}/${year}`;
  }

  proceedCloneOrdrs() {
    this.router.navigateByUrl("commercial/cloneorders");
  }

  backToCloneOrders() {
    this.resetCloneOrderData();
    this.userService.setUnit("?unitUid=")
    .pipe(takeUntil(this.destroySubject))
    .subscribe((res) => {
      this.userService.setAccountInfoState(false);
      localStorage.setItem("accountNumber", "");
      localStorage.setItem("customerName", "");
      localStorage.setItem("accountData", "");
      localStorage.removeItem("customerAddress");

      this.getStorageService.setselectedAccount(null);
      this.userService.currentUserDetails.next(null);
      this.userService.getCurrentUserDetail()
      .pipe(takeUntil(this.destroySubject))
      .subscribe((res) => {});
      this.proceedCloneOrdrs();
    });
  }
  resetCloneOrderData() {
    this.getStorageService.setItem("selectedCloneOrders", {
      sampleOrder: "",
      selectedLines: [],
      module: "commercial",
      productNumber: "",
    });
  }
  carrierValueChange() {
    // this.carrierModalObj.carrierType
    if (this.carrierModalObj.carrierType) {
      const defaultObj: any = {
        PA: "PARCEL",
      };
      for (let key in defaultObj) {
        this.smallParcelShippingData.push({
          value: key,
          label: defaultObj[key],
        });
      }
     
    } else {
      this.smallParcelShippingData = [];
    }
  }
  public ReqDelDate: any;
  changeRddDateIndex:any;
  changeDateModal(
    changeDataTemplate: TemplateRef<any>,
    rdd: any,
    index: any,
    isSample:boolean = false,
    isCompleteCart:boolean = false
  ) {
    this.ReqDelDate = rdd;
    this.requestDeliveryDate = rdd;
    this.changeRddDateIndex = index;
    this.isCompleteCart = isCompleteCart;
    if(isSample){
      this.ReqDelDate = rdd?.requestedDeliveryDate;
      this.requestDeliveryDate = rdd?.requestedDeliveryDate;
      this.currentSelectedCartEntry = rdd;
    }
    this.getOrderDates();
    if(this.cartData?.shipComplete == true && this.camsCartEntries.length > 1){
      this.openConfirmationModal({
        title: "Requested Delivery Date Confirmation",
        content: `Changing the requested delivery date will update this order from Ship Complete to Ship order based on availability. Do you want to proceed?`,
        primaryActionLabel: "CONTINUE",
        secondaryActionLabel: "CANCEL",
        onPrimaryAction: () => {
          this.showRDDModal(changeDataTemplate);
          this.isShipOrderBased = true;
          this.modalService.hide("confirmationModal");
        },
        onSecondaryAction: () => this.hideConfirmationModal(),
      });
    }else{
      this.showRDDModal(changeDataTemplate);
    }
  }

  showRDDModal(changeDataTemplate: TemplateRef<any>){
    this.modalRef = this.modalService.show(changeDataTemplate, {
      id: "changeDateModal",
      class: "modal-md modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }

  cancelRddChange() {
    this.ReqDelDate = new Date(this.cartData?.requestedDeliveryDate);
    this.requestDeliveryDate = this.ReqDelDate;
    // this.messageError = "";
    this.modalRef?.hide();
  }
  changeRDD() {
    this.requestDeliveryDate = this.changeDateFormat(this.ReqDelDate);
    this.flagForChange = this.isShipOrderBased && this.cartData.sampleOrder == false ? true : false;
    this.changeRequestDeliveryDate();
  }
  cloneOrdersFromCancelCart() {
    if (this.getStorageService.selectedCloneOrders?.selectedLines.length > 0) {
      this.getStorageService.selectedCloneOrders?.selectedLines.splice(0, 1);
      this.getStorageService.setItem("selectedCloneOrders", {
        sampleOrder: this.getStorageService.selectedCloneOrders?.sampleOrder,
        selectedLines:
          this.getStorageService.selectedCloneOrders?.selectedLines,
        module: "commercial",
        productNumber: this.getStorageService.selectedCloneOrders.productNumber,
      });
    }
    if (this.getStorageService.selectedCloneOrders?.selectedLines.length == 0) {
      this.backToCloneOrders();
    } else {
      this.proceedCloneOrdrs();
    }
  }
  updateSmallParcelFields(
    staticTabs: any,
    cartId: any,
    shipperAccountNumber: any,
    shipperZipCode: any,
  ) {
    this.carrierMoAlertData = {};
    let stateAbbr;
    if(this.carrierModalObj?.state.trim().length > 2){
      for (const country of STATES) {
        let state = country.states.find(state => state.name.toLowerCase() === this.carrierModalObj?.state.toLowerCase());
        if (state) {
         stateAbbr = state.abbreviation;
       }
       
     }
    }else{
      stateAbbr = this.carrierModalObj?.state;
    }
//Validate address
const payloadAddress = `(IvVstel='',` +
`IvCity='${this.carrierModalObj?.city}',` +
`IvCountry='${this.carrierModalObj?.country}',` +
`IvPostalCode='${this.carrierModalObj?.postalCode}',` +
`IvProvideAlt=1,` +
`IvRegion='${stateAbbr}',` +
`IvStreetLine='${encodeURIComponent(this.carrierModalObj?.addressLine1.trim())}')?$format=json`;

this.spinnerLoading = true;
this.errorMessage = "";
this.productService.progressShow('validateAddress', 'validateAddressId');
this.productService.validateAddress(payloadAddress).subscribe({
  next: (res) => {
    const EvStatus = res?.d?.EvStatus;
    const EvMessage = res?.d?.EvMessage;
    this.productService.progressHide('validateAddressId');
    // this.modalService.hide("progressModal");
    if (EvStatus == 'E') {
      this.spinnerLoading = false;
      let EsAddress = res?.d?.EsAddress;
      let suggestedAddress = `Suggested Address: ${EsAddress?.Addressline || ""}, 
                                    ${EsAddress?.Politicaldivision2 || ""}, ${EsAddress?.Politicaldivision1 || ""}, 
                                    ${EsAddress?.Postcodeprimarylow || ""}`;
      this.carrierMoAlertData.message = EvMessage == "Suggested Address" ? suggestedAddress : EvMessage;
      this.carrierMoAlertData.type = "danger";
    } else {      
      this.spinnerLoading = true;
      let billingAddress = {
        addressLine1: this.carrierModalObj?.addressLine1  + " " + this.carrierModalObj?.addressLine2 ,
        addressLine2: this.carrierModalObj?.addressLine2,
        name: this.carrierModalObj?.name,
        city: this.carrierModalObj?.city,
        country: this.carrierModalObj?.country,
        postalCode: this.carrierModalObj?.postalCode,
        region: this.carrierModalObj?.state,
        oneTimeBillingAddress: true,
      };
      let payload = {};
      if (this.cartData?.shippingConditions == 'CA' && this.cartData?.incoTerms == 'C3P') {
        payload = {
          "smallParcel": true,
          "billingAddress": billingAddress
        };
      } else {
        payload = {
          "smallParcel": true,
          "shipperAccountNumber": shipperAccountNumber,
          "shipperZipCode": shipperZipCode,
          "billingAddress": billingAddress
        };
      }
      this.productService.progressShow('updateSmallParcelFields', 'updateSmallParcelFieldsId');
      this.productService
        .updateSmallParcelFields(
          cartId,
          payload
        )
        .subscribe(
          (res: any) => {
            this.productService.progressHide('updateSmallParcelFieldsId');
            // this.modalService.hide("progressModal");
            if (res.body?.status == "Success") {
              // this.modalService.hide();
              this.submitOrder(staticTabs);
            } else if (res?.body?.status == "Error" || res?.error) {
              this.spinnerLoading = false;
              // this.modalService.hide('progressModal');
              this.carrierMoAlertData.type = "danger";
              this.carrierMoAlertData.message = res?.body?.message;
            }
          },
          () => {
            this.productService.progressHide('updateSmallParcelFieldsId');
            // this.modalService.hide("progressModal");
            this.spinnerLoading = false;
            // this.modalService.hide('progressModal');
            this.carrierMoAlertData = {};
          }
        );
    }
  },
  error: () => {    
    this.productService.progressHide('validateAddressId');
    // this.modalService.hide("progressModal");
  }
});




   
  }
  // updateSmallParcelFields(
  //   staticTabs: any,
  //   cartId: any,
  //   shipperAccountNumber: any,
  //   shipperZipCode: any,
  // ) {
  //   this.carrierMoAlertData = {};
  //   this.productService
  //     .updateSmallParcelFields(
  //       cartId,
  //       shipperAccountNumber,
  //       shipperZipCode,
  //       this.cartData.billingAddress
  //     )
  //     .subscribe(
  //       (res: any) => {
  //         if (res.body?.status == "Success") {
  //           this.modalService.hide();
  //           this.submitOrder(staticTabs);
  //         } else if (res?.body?.status == "Error" || res?.error) {
  //           this.modalService.hide('progressModal');
  //           this.carrierMoAlertData.type = "danger";
  //           this.carrierMoAlertData.message = res?.body?.message;
  //         }
  //       },
  //       () => {
  //         this.modalService.hide('progressModal');
  //         this.carrierMoAlertData = {};
  //       }
  //     );
  // }
  getProductImage(imageurl: any) {
    const urlPattern = /^(https?:\/\/[^\s]+)$/;
    if (urlPattern.test(imageurl)) {
      return imageurl + "?$xchangeThumb$";
    }
    return "https://s7d4.scene7.com/is/image/MohawkResidential/missing";
  }
  notAllowedFlag: boolean = false;
  async printPage() {
    this.notAllowedFlag = true;
    // this.spinnerLoading = true;
    await new Promise(resolve => setTimeout(resolve, 100));
    this.hidelement(true);
    let printContents: any, popupWin: any;
    let accordianElements: any =
    this.document.querySelectorAll(".panel-collapse");
    this.showElementForPdf(true);
    for (let a = 0; a < accordianElements.length; a++) {
      accordianElements[a].style.display = "block";
    }
    let printSection = this.document.getElementById("print-area");
    printContents = printSection?.innerHTML;
    popupWin = window.open("", "_blank", "top=0,left=0,height=100%,width=auto");
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
        <title>&nbsp;</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
        <link rel="stylesheet" href="/styles.css" crossorigin="anonymous">
        <link rel="stylesheet" href="/assets/print/order-confirmations-res.css" crossorigin="anonymous">        
        </head>
         <body onload="window.print()"  style="background-color: #fff;">
        <img src="/assets/images/logo-residential-dark.png" width=250 style="margin:30px 0px">
        ${printContents}
        </body>
      </html>`
    );
    setTimeout(()=>{
        popupWin.document.close();
    },1000);
    popupWin.document.close();
    popupWin.onafterprint = () => popupWin.close();
    if (!this.showDetailsFlag) {
      for (let a = 0; a < accordianElements.length; a++) {
        accordianElements[a].style.display = "none";
      }
    }
    this.showDetailsFlag = false;
    this.hidelement(false);
    this.showElementForPdf(true);
    this.notAllowedFlag = false;
  }

  // viewPdf(from: any = "") {
  //   this.spinnerLoading = true;
  //   let accordianElements: any =
  //     this.document.getElementsByClassName("panel-collapse");
  //   for (let a = 0; a < accordianElements.length; a++) {
  //     accordianElements[a].style.display = "block";
  //   }
  //   const validateFields: any =
  //     document.getElementsByClassName("space-normalizer");
  //   for (let b = 0; b < validateFields.length; b++) {
  //     let item = validateFields[b];
  //     validateFields[b].style.letterSpacing = "0.7px";
  //     // item.className = item.className + " camel-case";
  //   }
  //   let data: any = document.getElementById("print-area");
  //   this.hidelement(true);
  //   this.showElementForPdf(true);
  //   let pdf: any = new jsPDF("p", "mm", "a4", true);
  //   pdf.html(data, {
  //     margin: [2, 2, 2, 3],
  //     normalizeWhitespace: true,
  //     disableCombineTextItems: true,
  //     callback: (doc: any) => {
  //       this.spinnerLoading = false;
  //       if (!this.showDetailsFlag) {
  //         for (let a = 0; a < accordianElements.length; a++) {
  //           accordianElements[a].style.display = "none";
  //         }
  //       }
  //       for (let c = 0; c < validateFields.length; c++) {
  //         let item = validateFields[c];
  //         item.className = item.className.replace(" camel-case", "");
  //       }
  //       this.hidelement(false);
  //       this.showElementForPdf(false);
  //       const pdfPageCount = pdf.internal.getNumberOfPages();
  //       for (let i = 0; i < pdfPageCount; i++) {
  //         pdf.setPage(i + 1);
  //         pdf.setFontSize(8);
  //         pdf.text(
  //           `Page ${i + 1} of ${pdfPageCount}`,
  //           pdf.internal.pageSize.width - 10,
  //           pdf.internal.pageSize.height - 10,
  //           {
  //             align: "right",
  //             styles: { fontSize: 8 },
  //           }
  //         );
  //         pdf.getText;
  //         // pdf.text(
  //         //   this.datePipe.transform(new Date(), "MM-dd-yyyy"),
  //         //   pdf.internal.pageSize.width - 10,
  //         //   10,
  //         //   {
  //         //     align: "right",
  //         //     styles: { fontSize: 8 },
  //         //   }
  //         // );
  //         // pdf.text(window.location.href, 10, 10, {
  //         //   align: "left",
  //         //   styles: { fontSize: 8 },
  //         // });
  //       }
  //       if (from == "share") {
  //         let pdfContent = pdf.output("datauristring");
  //         let orderPDFData = pdfContent.split(",");
  //         this.openShareViaEmailModal(orderPDFData[1]);
  //       } else {
  //         window.open(pdf.output("bloburl"));
  //       }
  //     },
  //     x: 2,
  //     y: 2,
  //     width: 200,
  //     windowWidth: 1200,
  //   });
  // }
  processElements(
    elements: any,
    index: any,
    pdf: any,
    callback: any,
    lastPosition = 10
  ) {
    if (index < elements.length) {
      html2canvas(elements[index], { scale: 1, useCORS: true })
        .then((canvas) => {
          const imgData = canvas.toDataURL("image/jpeg", 1.0);
          const imgWidth = 190; // Ensure this is within the page width limits
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          let position = lastPosition;
          if (index > 0) {
            position += 5;
          }
          if (position + imgHeight > pdf.internal.pageSize.getHeight() - 10) {
            pdf.addPage();
            position = 10; // Reset position for the new page
          }
          pdf.addImage(imgData, "JPEG", 10, position, imgWidth, imgHeight);
          this.processElements(
            elements,
            index + 1,
            pdf,
            callback,
            position + imgHeight
          );
        })
        .catch((error) => {
          console.error("Error processing element with html2canvas:", error);
        });
    } else {
      callback();
    }
  }
  viewPdf(from: any = "") {
    this.notAllowedFlag = true;
    this.showDetailsFlag = true;
    this.hidelement(true);
    this.toggleAccordionElements(true);
    this.showElementForPdf(true);
    let printContents: any, popupWin: any;
    let accordianElements: any =
      this.document.querySelectorAll(".panel-collapse");
    for (let a = 0; a < accordianElements.length; a++) {
      accordianElements[a].style.display = "block";
    }
    printContents = this.document.getElementById("print-area")?.innerHTML;
    popupWin = window.open("", "_blank");
    if (from === "share" && popupWin) {
      this.spinnerLoading = true;
      window.focus();
    }
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
        <title>&nbsp;</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
        <link rel="stylesheet" href="/styles.css" crossorigin="anonymous">
        <link rel="stylesheet" href="/assets/print/order-confirmations-res.css" crossorigin="anonymous">
        <style>
          .xchange-loader { position: fixed; display: flex; align-items: center; justify-content: center; height: 100%; /* background-color: rgba(51, 51, 51, 0.8); */ z-index: 999; left: 0; /* top: 9.1vw; */ bottom: 0; right: 0;}
          .custom-spinner { border: 4px solid #ce0e2d; border-top: 4px solid transparent; border-radius: 50%; width: 60px; height: 60px; animation: spin 1s linear infinite;  }
        @keyframes spin { 0%   { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        </head>
        <body style="background-color: #fff;">
        <section class="xchange-loader"  style="background-color:rgba(0, 0, 0, 0.5); top:0">
          <div class="custom-spinner" style="background-color:rgba(0, 0, 0, 0.5)"></div>
        </section>
        <div id="pdfOrderContent">
        <img src="/assets/images/logo-residential-dark.png" width=250 style="margin:30px 0px">
        ${printContents}
        </div>
        </body>
      </html>`
    );
    popupWin.document.close();
    // this.progressHide();
    popupWin.onload = () => {
      const content = popupWin.document.getElementById('pdfOrderContent');
      html2canvas(content, { scale: from === 'share' ? 2 : 1, useCORS: true }).then((canvas: any) => {
        const data = canvas.toDataURL('image/jpeg');
        const pdf = new jsPDF("p", "mm", "a4", true);
        const props = pdf.getImageProperties(data);
        const padding = 5;
        const pageWidth = pdf.internal.pageSize.getWidth() - padding * 2;
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgProps = {
          width: pageWidth,
          height: (canvas.height * pageWidth) / canvas.width,
        };
        const totalPdfPages = Math.ceil(imgProps.height / pageHeight);
        for (let page = 0; page < totalPdfPages; page++) {
          const sourceY = (pageHeight * page * canvas.width) / pageWidth;
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = pageHeight * (canvas.width / pageWidth);
          const ctx: any = pageCanvas.getContext('2d');
          ctx.canvas.style.border = "none"
          if (ctx) {
            ctx.drawImage(
              canvas,
              0,
              sourceY,
              canvas.width,
              pageCanvas.height,
              0,
              0,
              canvas.width,
              pageCanvas.height
            );
          }
          const pageImageData = pageCanvas.toDataURL('image/png');
          if (page > 0) {
            pdf.addPage();
          }
          if (page == 0) {
            pdf.addImage(pageImageData, 'JPEG', 5, 5, pageWidth, pageHeight - 20);
          } else {
            pdf.addImage(pageImageData, 'JPEG', 5, 10, pageWidth, pageHeight - 20);
          }
        }
        if (from === 'share') {
          let pdfContent = pdf.output("datauristring");
          let PDFData = pdfContent.split(",");
          this.spinnerLoading = false;
          this.openShareViaEmailModal(PDFData[1]);
        } else {
          const blob = pdf.output("blob");
          const url = URL.createObjectURL(blob);
          window.open(url, "_blank");
        }
        popupWin.close();
      });
    }
    this.hidelement(false);
    if (!this.showDetailsFlag) {
      for (let a = 0; a < accordianElements.length; a++) {
        accordianElements[a].style.display = "none";
      }
    }
    this.showDetailsFlag = false;
    this.hidelement(false);
    this.toggleAccordionElements(false);
    this.showElementForPdf(false);
    this.notAllowedFlag = false;
  }
  resetStyles() {
    const validateFields : any = document.querySelectorAll('.space-normalizer');
    for (let field of validateFields) {
      field.style.letterSpacing = 'normal';
    }
  }
  finalizePDF(pdf : any, from : any) {
    try {
        const pageCount = pdf.internal.getNumberOfPages();
        for (let i = 0; i < pageCount; i++) {
            pdf.setPage(i + 1);
            pdf.setFontSize(8);
            const rightMargin = 10; // Distance from the right edge
            const topMargin = 5;  // Distance from the top edge
            const pageWidth = pdf.internal.pageSize.width;
            const pageHeight = pdf.internal.pageSize.height
            pdf.text(`Page ${i + 1} of ${pageCount}`, pageWidth - rightMargin, pageHeight - rightMargin, { align: 'right' });
            pdf.text(this.datePipe.transform(new Date(), 'MM-dd-yyyy'), pageWidth - rightMargin, topMargin, { align: 'right' });
         //   pdf.text(window.location.href, rightMargin, topMargin, { align: 'left' });
        }

        if (from === 'share') {
          let pdfContent = pdf.output("datauristring");
          let orderPDFData = pdfContent.split(",");
          this.openShareViaEmailModal(orderPDFData[1]);
        } else {
            window.open(pdf.output('bloburl'), '_blank');
        }
    } catch (error) {
        console.error('Error finalizing PDF:', error);
    } finally {
        this.spinnerLoading = false; // Ensure spinner is always turned off
    }
  }
  toggleAccordionElements(show: boolean): void {
    const accordianElements = this.document.querySelectorAll<HTMLElement>(".panel-collapse");
    const display = show ? "block" : "none";
    accordianElements.forEach(el => { el.style.display = display; });
  }
  openShareViaEmailModal(pdfContent: any) {
    let mailSubject = `Mohawk Order details for ${this.submitOrderVal?.orderNumber}`;
    const initialState: ModalOptions = {
      initialState: {
        mailSubject: mailSubject,
        content: pdfContent,
      },
    };

    this.modalRef = this.modalService.show(
      ShareViaEmailLightboxComponent,
      Object.assign(initialState, {
        class: "modal-lg modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }

  hidelement(result: boolean) {
    this.hidden?.toArray().forEach((element: any) => {
      element.nativeElement.hidden = result;
    });
  }
  showElementForPdf(bool: boolean) {
    this.document.querySelectorAll(".print-element").forEach((element: any) => {
      element.style.display = bool == true ? "block" : "none";
    });
  }

  changeTermCodeModal(changeDataTemplate: TemplateRef<any>) {
    if (this.termsCodeList.length === 0) {
      this.getPaymentTermsList(this.cartData);
    }
    this.modalRef = this.modalService.show(changeDataTemplate, {
      id: "changeTermCodeModal",
      class: "modal-md modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }

  submitTermCode() {
    this.termsCodeList.filter((d: any) => {
      if (d.key == this.selectedTermCode) {
        this.selectedLine.termsCode = d.key;
        this.selectedLine.termsCodeDescription = d.value;
        this.cartData.termsCode = d.key;
        this.cartData.termsDescription = d.value;
      }
    });
    this.cartEntries.forEach((item: any) => {
      if (item.entryNumber == this.currentSelectedCartEntry.entryNumber) {
        item.termsCode = this.selectedTermCode;
      }
    });
    this.proceed(null, true, true);
    this.modalRef.hide();
  }
  changeInco() {
    if (this.isCompleteCart) {
      this.cartEntries.forEach((item: any) => {
        item.incoTerms = this.incoTermsSelectedOption;
      });
    } else {
      this.cartEntries.forEach((item: any) => {
        if (item.entryNumber == this.currentSelectedCartEntry.entryNumber) {
          item.incoTerms = this.incoTermsSelectedOption;
        }
      });
    }
    this.proceed(null, true, true);
  }

  changeRequestDeliveryDate() {
    this.rddFlag = true;
    // this.openProgressModal({ progressText: "Processing..." });
    let camsEntries = this.camsCartEntries[this.changeRddDateIndex];
    this.productService.progressShow('cartProcessing', 'cartProcessingId');
    if(camsEntries?.cartEntries){
      if(this.isCompleteCart){
        camsEntries?.cartEntries.forEach((item: any) => {
          item.requestedDeliveryDate = this.requestDeliveryDate;
        });
      }else{
        camsEntries?.cartEntries.forEach((item: any) => {
          if (item.entryNumber == this.currentSelectedCartEntry.entryNumber) {
            item.requestedDeliveryDate = this.requestDeliveryDate;
          }
        });
      }
    }
    this.storedShippingAddress.rdd = this.requestDeliveryDate;
    this.storedShippingAddress.requestedDeliveryDate =
      this.requestDeliveryDate;
    this.getStorageService.setItem(
      "shippingAddress",
      this.storedShippingAddress
    );
    this.shippingAddress = this.storedShippingAddress;
    this.cartEntriesLength = this.cartEntries;
    this.modalService.hide("changeDateModal");
    this.hideProgressModal();
    this.modalRef.hide();
    this.productService.progressHide('cartProcessingId');
    this.proceed(null, true, true);
  }

  getOrderQuantity(cartIndexData: any) {
    const userRequestedQuantity = cartIndexData?.userRequestedQuantity || "NA";
    if (cartIndexData?.uom?.name !== "Roll") {
      const uomInfo =
        cartIndexData?.uom?.code !== cartIndexData?.pricingUom
          ? `(${cartIndexData?.pricingUOMQuantity} ${cartIndexData?.pricingUomDescription})`
          : "";

      return `${userRequestedQuantity} ${
        cartIndexData?.uom?.name || ""
      } ${uomInfo}`.trim();
    } else {
      const uomInfo =
        cartIndexData?.uom?.code !== cartIndexData?.pricingUom
          ? `(${cartIndexData?.pricingUOMQuantity} ${cartIndexData?.pricingUomDescription})`
          : "";
        let rollMax =
          cartIndexData?.uom?.code === "RO"
            ? cartIndexData?.product?.subProductType === "CUSHION_PAD"
              ? `(${cartIndexData?.pricingUOMQuantity} ${cartIndexData?.pricingUomDescription})`
              : cartIndexData?.solution && cartIndexData?.solution[0]?.orderMinInFeet != undefined
              ? `(${cartIndexData?.solution[0]?.orderMinInFeet} / ${cartIndexData?.solution[0]?.orderMaxInFeet})`
              : ""
            : uomInfo;

      if((cartIndexData?.product?.productType === "ACCESSORIES" || cartIndexData?.product?.productType === "HARDSURFACE") && cartIndexData?.uom?.code === "RO"
        && cartIndexData?.product?.subProductType !== "CUSHION_PAD"){
        rollMax = ""
      }
      
      return `${userRequestedQuantity} ${
        cartIndexData?.uom?.name || ""
      }(s) ${rollMax}`.trim();
    }
  }
  
  combinedShippingWarehouse: boolean = false;
  combineChangeshippingWareHOuseOptions(event: any) {
    if (event == undefined) {
      this.shippingWareHouseSelectedOption = null;
      this.incoTermsLoc2SelectedOption = null;
      return;
    }
    this.shippingWareHouseSelectedOption = event;
    this.getIncoTermsLoc2(event);
    this.combinedShippingWarehouse = true;
  }

  isShipOrderBased:boolean = false;
  changeShippingConfirmation(templateType: any, lineItem: any, isCompleteCart: any) {
    if(this.cartData?.shipComplete == true && this.camsCartEntries.length > 1){
      this.openConfirmationModal({
        title: "Shipping Option Confirmation",
        content: `Changing the shipping option will update this order from Ship Complete to Ship order based on availability. Do you want to proceed?`,
        primaryActionLabel: "CONTINUE",
        secondaryActionLabel: "CANCEL",
        onPrimaryAction: () => {
          this.combinedShippingInfo(templateType, lineItem, isCompleteCart);
          this.isShipOrderBased = true;
          this.modalService.hide("confirmationModal");
        },
        onSecondaryAction: () => this.hideConfirmationModal(),
      });
    }else{
      this.combinedShippingInfo(templateType, lineItem, isCompleteCart)
    }
  }
  shippingOptionTemplate!: TemplateRef<any>;
  combinedShippingInfo(templateType: any, lineItem: any, isCompleteCart: any) {
    this.shippingOptionTemplate = templateType;
    this.shippingOptionsAPIs.clear();
    this.shipViaOptions = [];
    this.isCompleteCart = isCompleteCart;
    this.selectedShipViaProduct = lineItem;
    this.shipViaSelectedOption = isCompleteCart ? 
    lineItem.shippingConditions || this.storedShippingAddress?.defaultShippingCondition  : lineItem.shippingCondition;
    this.shippingWareHouseSelectedOption = isCompleteCart ? 
      this.storedShippingAddress?.defaultShippingWarehouse || lineItem?.shippingWarehouse : lineItem?.shippingWarehouse ;
    // this.spinnerLoading = true;
    this.productService.progressShow('getShippingOptions', 'getShippingOptionsId');
    this.productService
      .getShippingMethodWithOutFlag(
        this.defaultAddress?.postalCode,
        this.storedShippingAddress?.oneTimeShippingAddress || this.storedShippingAddress?.isOneTimeShipTo
          ? true
          : false,
        this.customerFlag || this.salesPersonFlag,
        this.shipViaSelectedOption
      )
      .subscribe((res: any) => {
        this.setLoadAPI("shippingMethod")
        // this.productService.progressHide();
        this.spinnerLoading = false;
        if (res?.body && Object.entries(res?.body).length >0) {
          for (let key of Object.entries(res?.body)) {
            this.shipViaOptions.push({
              value: key[0],
              label: key[1],
            });
          }
        }else{
          this.shipViaOptions.push({
            value: isCompleteCart ? lineItem.shippingConditions || this.storedShippingAddress?.defaultShippingCondition  : lineItem.shippingCondition,
            label: isCompleteCart ? 
            lineItem.shippingConditionsDesc || this.storedShippingAddress?.defaultShippingConditionDesc  : lineItem.shippingConditionsDesc,
          });
        }
          this.shipViaSelectedOption =
            isCompleteCart ? lineItem?.shippingConditions || this.shipViaOptions[0].value: lineItem.shippingCondition ||  this.shipViaOptions[0].value;

          /* if (this.isCompleteCart) {
            this.shipViaSelectedOption = this.cartData?.shippingConditions;
          } */
          this.incoTermsSelectedOption = lineItem?.incoTerms;
          this.currentSelectedCartEntry = lineItem;
          if (this.customerFlag || this.salesPersonFlag) {
            this.showValidationError = false;
            this.shipViaSelectedOption = isCompleteCart ? lineItem?.shippingConditions || this.shipViaOptions[0]?.value :
            lineItem?.shippingCondition || this.shipViaOptions[0]?.value
              
            // this.incoTermsSelectedOption =
            //   this.storedShippingAddress?.defaultIncoTermsDesc ||
            //   this.incoTermsOptions[0]?.label;
            this.shippingWareHouseOptions = [];
            this.shippingWareHouseOptions.push({
              value: isCompleteCart ? this.storedShippingAddress?.defaultShippingWarehouse || lineItem?.shippingWarehouse : lineItem?.shippingWarehouse ,
              label: isCompleteCart ? this.storedShippingAddress?.defaultShippingWarehouseDesc || lineItem?.shippingWarehouseDesc :lineItem?.shippingWarehouseDesc,
            });
            this.shippingWareHouseSelectedOption = this.shippingWareHouseOptions[0].value ||  this.storedShippingAddress?.defaultShippingWarehouse || lineItem?.shippingWarehouse;
            this.incoTermsOptions = [];
                    this.incoTermsOptions.push({
                      value: isCompleteCart ? this.storedShippingAddress?.defaultIncoTerms || lineItem.incoTerms :lineItem.incoTerms,
                      label: isCompleteCart ? this.storedShippingAddress?.defaultIncoTermsDesc || lineItem?.incoTermsDesc:lineItem?.incoTermsDesc,
                    });
                    this.incoTermsLoc2Options = [];
                    if(this.shipViaSelectedOption == "PA" && this.customerFlag == false && this.cartData.sampleOrder){
                      this.shipViaOptionsForPA.forEach((item:any) => {
                        this.incoTermsLoc2Options.push({
                          value: item.value,
                          label: item.label
                        });
                      });
                      this.incoTermsLoc2SelectedOption = isCompleteCart ?  lineItem.shipVia : lineItem.shipVia || this.storedShippingAddress?.defaultShipVia;
                    }else{
                      const shipViaVal = isCompleteCart
                        ? lineItem?.shipVia
                        : lineItem?.shipVia ||
                          this.storedShippingAddress?.defaultShipVia;
                      const shipViaLbl =
                        lineItem?.shipViaDesc ||
                        this.storedShippingAddress?.defaultShipViaDesc ||
                        shipViaVal;
                      this.incoTermsLoc2Options.push({
                        value: shipViaVal,
                        label: shipViaLbl,
                      });
                      this.incoTermsLoc2SelectedOption = this.incoTermsLoc2Options[0].value;
                    }
                    this.incoTermsSelectedOption = this.incoTermsOptions[0].value;
                    // this.modalRef = this.modalService.show(templateType, {
                    //   id: "shipingWareHouseModal",
                    //   class: "modal-lg modal-dialog-centered",
                    //   backdrop: "static",
                    //   keyboard: false,
                    // });
                    this.setLoadAPI("shippingMethod", 1);
          }

          
          
          if (!this.customerFlag && !this.salesPersonFlag) {
            this.showValidationError = false;
            this.getIncoTerms(this.shipViaSelectedOption);
            this.shippingWareHouseSelectedOption = [];
            this.productService
              .getShippingWareHouseWithOutFlag()
              .subscribe((res: any) => {
                this.setLoadAPI("ShippingWarehouse");
                if (res?.body) {
                  for (let key of Object.entries(res?.body)) {
                    this.shippingWareHouseSelectedOption.push({
                      value: key[0],
                      label: key[1],
                    });
                  }
                  this.shippingWareHouseSelectedOption =
                    lineItem?.shippingWarehouse ||
                    this.shippingWareHouseOptions[0];
                  this.incoTermsLoc2SelectedOption = lineItem?.shipVia;
                  this.currentSelectedCartEntry = lineItem;
                }
              }, () => {this.setLoadAPI("ShippingWarehouse");});
              if(this.isCompleteCart){
                this.shipingWareHouseModal(
                  templateType,
                  "shippingWareHouse",
                  lineItem,
                  true
                );
              }else{
                this.shipingWareHouseModal(
                  templateType,
                  "shippingWareHouse",
                  lineItem,
                  false
                );
              }
          }
         
        
        
      },()=>{
        this.setLoadAPI("shippingMethod");
      });
    
  }
  
  submitCombinedShippingInfo() {
    if (this.combinedShippingWarehouse == true) {
      this.shippingWareHouseModalSubmit();
    } else {
      this.changeShippingOption();
    }
  }

  changeShippingOption() {
    this.flagForChange = this.isShipOrderBased && this.cartData.sampleOrder == false ? true : false;
    if (!this.cartData.sampleOrder) {
      if(this.currentSelectedCartEntry && this.currentSelectedCartEntry?.cartEntries){
        this.cartEntries.forEach((item: any) => {
          if(this.currentSelectedCartEntry?.camsOrderNumber == item?.camsOrderNumber){
            item.incoTerms = this.incoTermsSelectedOption;
            item.shipVia = typeof this.incoTermsLoc2SelectedOption == "object"
              ? this.incoTermsLoc2SelectedOption?.label.toUpperCase()
              : this.incoTermsLoc2SelectedOption;
            item.shippingCondition = this.userInfo?.isCustomer || this.userInfo?.isSalesPerson || this.userInfo?.isSalesOps? this.originalDefaultShippingMethod || this.shipViaSelectedOption :this.shipViaSelectedOption;
            item.originalDefaultShippingMethod = this.userInfo?.isCustomer || this.userInfo?.isSalesPerson || this.userInfo?.isSalesOps? this.originalDefaultShippingMethod || this.shipViaSelectedOption:this.shipViaSelectedOption;
            item.shippingWareHouse = this.shippingWareHouseSelectedOption;
          }
        });
      }else if(this.selectedShipViaProduct){
        this.cartEntries.forEach((item: any) => {
          item.incoTerms = this.incoTermsSelectedOption;
          item.shipVia = typeof this.incoTermsLoc2SelectedOption == "object"
              ? this.incoTermsLoc2SelectedOption?.label.toUpperCase()
              : this.incoTermsLoc2SelectedOption;
          item.shippingCondition = this.userInfo?.isCustomer || this.userInfo?.isSalesPerson || this.userInfo?.isSalesOps ? this.originalDefaultShippingMethod || this.shipViaSelectedOption:this.shipViaSelectedOption;
          item.originalDefaultShippingMethod = this.userInfo?.isCustomer || this.userInfo?.isSalesPerson || this.userInfo?.isSalesOps? this.originalDefaultShippingMethod || this.shipViaSelectedOption:this.shipViaSelectedOption;
          item.shippingWareHouse = this.shippingWareHouseSelectedOption;
        });
      }
    }else{
      if(this.isCompleteCart){
        this.cartEntries.forEach((item: any) => {
          item.incoTerms = this.incoTermsSelectedOption;
          item.shipVia = typeof this.incoTermsLoc2SelectedOption == "object"
              ? this.incoTermsLoc2SelectedOption?.label.toUpperCase()
              : this.incoTermsLoc2SelectedOption;
          item.shippingCondition = this.userInfo?.isCustomer || this.userInfo?.isSalesPerson || this.userInfo?.isSalesOps ? this.originalDefaultShippingMethod || this.shipViaSelectedOption : this.shipViaSelectedOption;
          item.originalDefaultShippingMethod = this.userInfo?.isCustomer || this.userInfo?.isSalesPerson || this.userInfo?.isSalesOps? this.originalDefaultShippingMethod || this.shipViaSelectedOption:this.shipViaSelectedOption;
        });
      }else{
        this.cartEntries.forEach((item: any) => {
          if (item.entryNumber == this.currentSelectedCartEntry.entryNumber) {
            item.incoTerms = this.incoTermsSelectedOption;
            item.shipVia = typeof this.incoTermsLoc2SelectedOption == "object"
              ? this.incoTermsLoc2SelectedOption?.label.toUpperCase()
              : this.incoTermsLoc2SelectedOption;
            item.shippingCondition = this.userInfo?.isCustomer || this.userInfo?.isSalesPerson || this.userInfo?.isSalesOps ? this.originalDefaultShippingMethod || this.shipViaSelectedOption : this.shipViaSelectedOption;
            item.originalDefaultShippingMethod = this.userInfo?.isCustomer || this.userInfo?.isSalesPerson || this.userInfo?.isSalesOps? this.originalDefaultShippingMethod || this.shipViaSelectedOption:this.shipViaSelectedOption;
          }
        });
      }
    }

    this.proceed(null, true, true);
  }

  smallParcelShippingChange:boolean = false;
  checkPlaceOrder(
    staticTabs: any,
    proceedWithOutParcel: any,
    carrierTemplate:any, 
    selectedItem: any,
    isFromHeader?: boolean
  ) {

      if(this.cartData.shipComplete == true && this.cartData?.sampleOrder == false){
        if(this.smallParcelEligible && ((this.cartEntries[0].shippingCondition != 'PA' &&
          this.cartEntries[0].incoTerms != "C3P") || (this.cartEntries[0].shippingCondition != 'PA' &&
            this.cartEntries[0].incoTerms == "C3P"))){

                this.shipViaOptions = [];
                this.selectedShipViaProduct = this.cartEntries;
                this.smallParcelShippingChange = true;
                this.shipViaSelectedOption =
                this.storedShippingAddress?.defaultShippingCondition || this.storedShippingAddress?.defaultShippingMethod;
                this.shippingWareHouseSelectedOption =
                  this.storedShippingAddress?.defaultShippingWarehouse || "";
                this.productService
                  .getShippingMethodWithOutFlag(
                    this.defaultAddress?.postalCode,
                    this.storedShippingAddress?.oneTimeShippingAddress || this.storedShippingAddress?.isOneTimeShipTo
                      ? true
                      : false,
                    this.customerFlag || this.salesPersonFlag,
                    this.shipViaSelectedOption
                  )
                  .subscribe((res: any) => {
                    if (res?.body) {
                      for (let key of Object.entries(res?.body)) {
                        this.shipViaOptions.push({
                          value: key[0],
                          label: key[1],
                        });
                      }
                    
                      if (this.customerFlag || this.salesPersonFlag) {
                        this.showValidationError = false;
                        this.shipViaSelectedOption =
                          this.storedShippingAddress?.defaultShippingMethod ||
                          this.shipViaOptions[0]?.value;
                          this.incoTermsSelectedOption = this.storedShippingAddress?.defaultIncoTerms || this.incoTermsOptions[0]?.value;
                          this.incoTermsLoc2SelectedOption = this.storedShippingAddress?.defaultShipVia;
                        this.shippingWareHouseOptions = [];
                        this.shippingWareHouseOptions.push({
                          value: this.storedShippingAddress?.defaultShippingWarehouse,
                          label: this.storedShippingAddress?.defaultShippingWarehouseDesc,
                        });
                        this.orderService
                          .getShippingoptionForCustomers(
                            this.defaultAddress?.postalCode,
                            this.shipViaSelectedOption,
                            this.shippingWareHouseSelectedOption,
                            this.storedShippingAddress?.oneTimeShippingAddress || this.storedShippingAddress?.isOneTimeShipTo
                                  ? true : false,
                            this.uid
                          )
                          .subscribe({
                            next: (res) => {
                              this.spinnerLoading = false;
                              this.incoTermsOptions = [];
                              this.incoTermsOptions.push({
                                value: res.body.incoTerms,
                                label: res.body.incoTermsDesc,
                              });
                              this.incoTermsLoc2Options = [];
                              const apiShipVia = res.body?.shipvia;
                              const apiShipViaDesc = res.body?.shipViaDesc;
                              if (apiShipVia || apiShipViaDesc) {
                                this.incoTermsLoc2Options.push({
                                  value:
                                    apiShipVia ||
                                    this.storedShippingAddress?.defaultShipVia,
                                  label:
                                    apiShipViaDesc ||
                                    this.storedShippingAddress?.defaultShipViaDesc ||
                                    apiShipVia,
                                });
                              }
                              this.incoTermsLoc2SelectedOption = res.body.shipvia;
                            },
                            error: (err) => {
                              this.productService.progressHide();
                              this.spinnerLoading = false;
                            },
                          });
                      }
                      if (!this.customerFlag && !this.salesPersonFlag) {
                        this.incoTermsSelectedOption = this.storedShippingAddress?.defaultIncoTerms || 
                                                          this.incoTermsOptions[0]?.value;
                        this.incoTermsLoc2SelectedOption = this.storedShippingAddress?.defaultShipVia;
                        this.getIncoTerms(this.shipViaSelectedOption);
                    
                        this.productService
                          .getShippingWareHouseWithOutFlag()
                          .subscribe((res: any) => {
                            if (res?.body) {
                              this.shippingWareHouseOptions = [];
                              for (let key of Object.entries(res?.body)) {
                                this.shippingWareHouseOptions.push({
                                  value: key[0],
                                  label: key[1],
                                });
                              }
                              this.shippingWareHouseSelectedOption =  this.storedShippingAddress?.defaultShippingWarehouse ||
                                                                    this.shippingWareHouseOptions[0].value;
                             
                              this.getIncoTermsLoc2(
                               
                                  this.cartData?.shippingWarehouse
                                 
                              );
                            }
                          });
                      }
                     
                    }
                  });
                  this.isCompleteCart = true;
                  //this.combinedShippingWarehouse = true;

                  this.modalRef = this.modalService.show(
                    proceedWithOutParcel,
                    {
                      id: "proceedWithOutParcel",
                      class: "modal-md modal-dialog-centered",
                    }
                );
        } 
        else if(!this.smallParcelEligible && (this.cartEntries[0].shippingCondition != 'PA' &&
          this.cartEntries[0].incoTerms == "C3P")){
            this.carrierModal(carrierTemplate, selectedItem, isFromHeader);
        } 

        else if(this.smallParcelEligible && (this.cartEntries[0].shippingCondition == 'PA' &&
          this.cartEntries[0].incoTerms != "C3P"))
        {
          this.submitOrder(staticTabs);
        } 
        else if(this.smallParcelEligible && (this.cartEntries[0].shippingCondition == 'PA' &&
          this.cartEntries[0].incoTerms == "C3P"))
        {
          this.carrierModal(carrierTemplate, selectedItem, isFromHeader);
        } 
        else{
          this.submitOrder(staticTabs);
        }
      } else if(this.cartData?.sampleOrder == true && ((this.cartData?.shippingConditions == 'PA' && this.cartData.incoTerms == "C3P") ||
          (this.cartData.shippingConditions != 'PA' && this.cartData.incoTerms == "C3P"))){
              this.carrierModal(carrierTemplate, selectedItem, isFromHeader);
      }else{
        this.submitOrder(staticTabs);
      }
  }

  closeShippingOptionsModalModal() {
    // this.modalRef.hide();
    this.modalService.hide("shippingOptionsModal");
  }

  openToggles = true;
  toggleOpen() {
    this.openToggles = !this.openToggles;
  }

  onKey(value: any) {
    const inputValue = value.target.value.toLowerCase();
    const filteredUserList = this.userList.filter((user: any) =>
      user.name.toLowerCase().includes(inputValue)
    );

    if (filteredUserList.length > 0) {
      const firstMatchingIndex = this.userList.findIndex(
        (user: any) => user === filteredUserList[0]
      );
      this.scrollToIndex(firstMatchingIndex);
    }
  }
  @ViewChildren("selectElements") selectElements!: QueryList<any>;
  scrollToIndex(index: number) {
    const selectComponent = document.querySelector(".scroll-host ");
    if (selectComponent) {
      selectComponent.scroll({ top: index, behavior: "smooth" });
    }
  }
  showValidationError: boolean = false;
  validationErrorMessage: any;
  // validateShipViaAddress(type: any) {
  //   this.spinnerLoading = true;
  //   console.log(
  //     "this.shipViaSelectedOption",
  //     this.shipViaSelectedOption,
  //     this.incoTermsLoc2SelectedOption
  //   );
  //   let shipViaSelectedOption =
  //     this.shipViaSelectedOption || this.shippingAddress?.defaultShippingMethod;
  //   let incoTermsLoc2SelectedOption =
  //     this.incoTermsLoc2SelectedOption.label ||
  //     this.incoTermsLoc2SelectedOption ||
  //     this.shippingAddress?.defaultShipVia;
  //   let incoTermsSelectedOption =
  //     this.incoTermsSelectedOption || this.shippingAddress?.defaultIncoTerms;
  //   let shippingWareHouseSelectedOption =
  //     this.shippingWareHouseSelectedOption ||
  //     this.shippingAddress?.defaultShippingWarehouse;
  //   this.orderService
  //     .validateShipVia(
  //       shippingWareHouseSelectedOption,
  //       "C",
  //       incoTermsLoc2SelectedOption
  //     )
  //     .subscribe({
  //       next: (res) => {
  //         if (res.body.status === "success") {
  //           // this.populateShippingOptions();
  //           if (type == "changeShippingOption") {
  //             this.spinnerLoading = false;
  //             this.storedShippingAddress.defaultIncoTerms =
  //               this.incoTermsSelectedOption;
  //             this.storedShippingAddress.defaultShippingWarehouse =
  //               this.shippingWareHouseSelectedOption;
  //             this.storedShippingAddress.defaultShipVia =
  //               this.incoTermsLoc2SelectedOption;
  //             this.storedShippingAddress.defaultShippingMethod =
  //               this.shipViaSelectedOption;
  //             this.submitCombinedShippingInfo();
  //             this.closeShippingWareHouseModal();
  //           }
  //         } else if (res.body.status === "error") {
  //           this.showValidationError = true;
  //           this.spinnerLoading = false;
  //           this.validationErrorMessage = res.body.message;
  //         }
  //       },
  //       error: (err) => {},
  //     });
  // }

  validateShipViaAddress(type: any) {
    // this.spinnerLoading = true;
    if ((!this.cartData?.sampleOrder && !(this.getStorageService.selectedCloneOrders?.isCloneOrders == true)) &&
      this.defaultAddress?.formattedAddress?.includes("PO BOX") &&
      this.shipViaSelectedOption != 'PS' &&
      this.shipViaSelectedOption != 'PM') {
      this.showValidationError = true;
      this.validationErrorMessage = "Shipping to a PO BOX is not permitted. Please select an alternative shipping address";
      return;
    }
    console.log(
      "this.shipViaSelectedOption",
      this.shipViaSelectedOption,
      this.incoTermsLoc2SelectedOption
    );
    // console.log("this.currentSelectedCartEntry----> isCompleteCart",this.currentSelectedCartEntry,this.isCompleteCart)

    let shipViaSelectedOption =
      this.shipViaSelectedOption || this.shippingAddress?.defaultShippingMethod;
    let incoTermsLoc2SelectedOption =
      this.incoTermsLoc2SelectedOption?.label ||
      this.incoTermsLoc2SelectedOption ||
      this.shippingAddress?.defaultShipVia;
    let incoTermsSelectedOption =
      this.incoTermsSelectedOption || this.shippingAddress?.defaultIncoTerms;
    let shippingWareHouseSelectedOption =
      this.shippingWareHouseSelectedOption ||
      this.shippingAddress?.defaultShippingWarehouse;

    incoTermsLoc2SelectedOption = typeof incoTermsLoc2SelectedOption == "object"
      ? incoTermsLoc2SelectedOption?.label.toUpperCase()
      : incoTermsLoc2SelectedOption;

    let cartSelectProductCode;
    if (this.isCompleteCart === false) {
      cartSelectProductCode =
        this.currentSelectedCartEntry.product.productType === "SAMPLE"
          ? this.currentSelectedCartEntry.sampleProductReference
          : this.currentSelectedCartEntry.product.code;
    } else {
      cartSelectProductCode =
        this.cartEntries[0].product.productType === "SAMPLE"
          ? this.cartEntries[0].sampleProductReference
          : this.cartEntries[0].product.code;
    }
    // this.openProgressModal({ progressText: "Processing..." });
    //this.productService.progressShow('cartProcessing')
    if(this.userInfo.isCustomer || this.userInfo.isSalesPerson || this.userInfo.isSalesOps){
      if (type == "changeShippingOption") {
        this.closeShippingOptionsModalModal();
        this.spinnerLoading = false;
        this.originalDefaultShippingMethod = this.originalDefaultSM;
        this.storedShippingAddress.defaultShippingMethod =
        this.originalDefaultShippingMethod;
        this.storedShippingAddress.defaultIncoTerms =
          this.incoTermsSelectedOption;
        this.storedShippingAddress.defaultShippingWarehouse =
          this.shippingWareHouseSelectedOption;
        this.storedShippingAddress.defaultShipVia =
          typeof this.incoTermsLoc2SelectedOption == "object"
            ? this.incoTermsLoc2SelectedOption?.label.toUpperCase()
            : this.incoTermsLoc2SelectedOption;
        this.storedShippingAddress.defaultShippingMethod =
          this.shipViaSelectedOption;
        this.submitCombinedShippingInfo();
        this.closeShippingWareHouseModal();
      }
    }else{
      this.productService.progressShow('validateShippingOptions', 'validateShippingOptionId');
    this.productService
      .getUOMDetails(cartSelectProductCode)
      .subscribe((result) => {
        // this.spinnerLoading = false;
        this.orderService
          .validateShippingOptions(
            shippingWareHouseSelectedOption,
            result?.body?.erpProductCategory,
            incoTermsLoc2SelectedOption
          )
          .subscribe({
            next: (res) => {
              this.productService.progressHide('validateShippingOptionId');
              if (res.body.status === "success") {
                  this.productService.progressShow("validateShipVia", "validateShipViaId");
                  this.orderService
                  .validateShipVia(
                    shipViaSelectedOption,
                    incoTermsLoc2SelectedOption
                  )
                  .subscribe({
                    next: (res) => {
                      this.productService.progressHide('validateShipViaId');
                      if (res.body.status === "success") {
                        if (type == "changeShippingOption") {
                          this.closeShippingOptionsModalModal();
                          this.productService.progressHide();
                          this.spinnerLoading = false;
                          this.storedShippingAddress.defaultIncoTerms =
                            this.incoTermsSelectedOption;
                          this.storedShippingAddress.defaultShippingWarehouse =
                            this.shippingWareHouseSelectedOption;
                          this.storedShippingAddress.defaultShipVia =
                            typeof this.incoTermsLoc2SelectedOption == "object"
                              ? this.incoTermsLoc2SelectedOption?.label.toUpperCase()
                              : this.incoTermsLoc2SelectedOption;
                          this.storedShippingAddress.defaultShippingMethod =
                            this.shipViaSelectedOption;
                          this.submitCombinedShippingInfo();
                          this.closeShippingWareHouseModal();
                        }
                      } else if (res.body.status === "error") {
                        this.productService.progressHide('validateShipViaId');
                        // this.modalService.hide("progressModal");
                        this.showValidationError = true;
                        this.spinnerLoading = false;
                        this.validationErrorMessage = res.body.message;
                      }
                    },
                    error: (err) => {
                      this.productService.progressHide('validateShipViaId');
                      // this.modalService.hide("progressModal");
                    },
                  });
              } else if (res.body.status === "error") {
                this.productService.progressHide('validateShippingOptionId');
                // this.modalService.hide("progressModal");
                this.showValidationError = true;
                this.spinnerLoading = false;
                this.validationErrorMessage = res.body.message;
              }
            },
            error: (err) => {
              this.productService.progressHide('validateShippingOptionId');
              // this.modalRef.hide();
              // this.modalService.hide("progressModal");
            },
          });
      });
    }
  }

  disableShipVia(){
    if((this.customerFlag || this.userInfo?.isSalesPerson  || this.userInfo?.isSalesOps) 
          && (this.storedShippingAddress?.oneTimeShippingAddress || this.storedShippingAddress?.isOneTimeShipTo) && this.shipViaSelectedOption == "CA"){
            return false;
    }else if(this.customerFlag){
      return true;
    }else if((this.userInfo?.isSalesPerson  || this.userInfo?.isSalesOps) && this.shipViaSelectedOption != "PA"){
      return true;
    }else {
      return false;
    }
  }

  validateShipVia(event: any) {
    console.log(event);
    this.showValidationError = false;
  }

  notFoundCre: boolean = false;
  selectedCre: any;
  creTypeAheadOnBlur(event: any, clearVal = false) {
    if (clearVal) {
      this.checkoutForm.patchValue({ cre: "" });
      this.checkoutForm.patchValue({ marketSegment: undefined });
      this.checkoutForm.controls["marketSegment"].disable();
      this.selectedCre = null;
      this.notFoundCre = false;
    } else if (event?.value || event == undefined) {
      this.notFoundCre = true;
      this.checkoutForm.patchValue({ cre: event?.key });
      this.checkoutForm.controls["marketSegment"].enable();
    }
  }

  onSelectCre(event: any) {
    this.selectedCre = event?.item?.key;
    if (
      event?.item?.value?.marketSegmentCode &&
      event?.item?.value?.marketSegmentCode != "EMPTY" &&
      event?.item?.value?.marketSegmentCode != null
    ) {
      this.marketSegmentCode = event?.item?.value?.marketSegmentCode;
      let marketSegmentFilterData = this.marketsegmentdata.filter(
        (segment: any) => segment.code === this.marketSegmentCode
      );

      if (marketSegmentFilterData.length == 1) {
        this.checkoutForm.patchValue({ marketSegment: this.marketSegmentCode });
        this.checkoutForm.controls["marketSegment"].disable();
      } else {
        this.checkoutForm.controls["marketSegment"].enable();
      }
    } else {
      this.checkoutForm.controls["marketSegment"].enable();
    }
  }

  creFormattedText(data: any) {
    let town = data.value.town || "";
    let state = data.value.state || "";
    let unitName = data.value.unitName;
    let address = "";
    if (town || state) {
      address = ` ( ${town} - ${state} )`;
    }
    if (!town || !state) {
      address = address.replace("-", "");
    }
    return `${unitName} ${address}`;
  }

  notFoundGpo: boolean = false;
  selectedGpo: any;
  gpoTypeAheadOnBlur(event: any, clearVal = false) {
    if (clearVal) {
      this.checkoutForm.patchValue({ gpo: "" });
      this.selectedGpo = null;
      this.notFoundGpo = false;
    } else if (event?.value || event == undefined) {
      this.notFoundGpo = true;
      this.checkoutForm.patchValue({ gpo: event?.key });
    }
  }

  onSelectGpo(event: any) {
    this.selectedGpo = event?.item?.key;
  }

  gpoFormattedText(data: any) {
    let town = data.value.town || "";
    let state = data.value.state || "";
    let unitName = data.value.unitName;
    let address = "";
    if (town || state) {
      address = ` ( ${town} - ${state} )`;
    }
    if (!town || !state) {
      address = address.replace("-", "");
    }
    return `${unitName} ${address}`;
  }

  notFoundAd: boolean = false;
  selectedAd: any;
  adTypeAheadOnBlur(event: any, clearVal = false) {
    console.log("event======>", event);
    console.log("event======>", event?.key);
    if (clearVal) {
      this.checkoutForm.patchValue({ ad: "" });
      this.selectedAd = null;
      this.notFoundAd = false;
    } else if (event?.key || event == undefined) {
      this.notFoundAd = true;
      this.checkoutForm.patchValue({ ad: event?.key });
    }
  }

  onSelectAd(event: any) {
    this.selectedAd = event?.item?.key;
  }

  adFormattedText(data: any) {
    let town = data.value.town || "";
    let state = data.value.state || "";
    let unitName = data.value.unitName;
    let address = "";
    if (town || state) {
      address = ` ( ${town} - ${state} )`;
    }
    if (!town || !state) {
      address = address.replace("-", "");
    }
    return `${unitName} ${address}`;
  }

  openViewReplacementOrderModal(template: any) {
    const initialState: ModalOptions = {
      initialState: {},
    };
    this.modalRef = this.modalService.show(
      template,
      Object.assign(initialState, {
        id: "viewReplacementOrderModal",
        class: "modal-md modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }
  checkNoChargeReasonSelected() {
    const filterData = this.cartEntries.filter(
      (item: any) =>
        item?.noCharge == true &&
        (item.noChargeReasonCode == undefined || item?.noChargeReasonCode == "")
    );
    return this.cartData?.modelRoom !== undefined && !this.cartData?.modelRoom
      ? filterData.length > 0
      : false;
  }

  getPaymentTermsList(cartData: any) {
    this.spinnerLoading = true;
    this.productService.getPaymentTermsList(cartData).subscribe({
      next: (res) => {
        this.productService.progressHide();
        this.spinnerLoading = false;
        for (let k in res?.body) {
          this.termsCodeList.push({ key: k, value: res?.body[k] });
        }
        this.selectedLine = this.cartData;
        this.selectedTermCode = this.cartData?.termsCode;
      },
      error: (err) => {
        this.productService.progressHide();
        this.spinnerLoading = false;
      },
    });
  }

  openProgressModal(data = {}, size: any = "md", modalId = "progressModal") {
    const initialState: ModalOptions = {
      backdrop: true,
      ignoreBackdropClick: true,
      initialState: {
        ...data,
      },
    };
    this.modalRef = this.modalService.show(
      ProgressModalComponent,
      Object.assign(initialState, {
        id: modalId,
        class: `modal-${size} modal-dialog-centered`,
      })
    );
  }
  hideProgressModal(id = "progressModal"){
    this.modalService.hide(id);
  }
  originalDefaultShippingMethod:any;
  checkoutShippingInfo(templateType: any, lineItem: any, isCompleteCart: any) {
    this.shipViaOptions = [];
    this.isCompleteCart = isCompleteCart;
    this.selectedShipViaProduct = lineItem;
    this.shipViaSelectedOption =
    this.storedShippingAddress?.defaultShippingMethod;
    this.shippingWareHouseSelectedOption =
      this.storedShippingAddress?.defaultShippingWarehouse || "";
    this.productService
      .getShippingMethodWithOutFlag(
        this.defaultAddress?.postalCode,
        this.storedShippingAddress?.oneTimeShippingAddress || this.storedShippingAddress?.isOneTimeShipTo
          ? true
          : false,
        this.customerFlag || this.salesPersonFlag,
        this.shipViaSelectedOption
      )
      .subscribe((res: any) => {
        if (res?.body) {
          for (let key of Object.entries(res?.body)) {
            this.shipViaOptions.push({
              value: key[0],
              label: key[1],
            });
          }

          this.shipViaSelectedOption =
            lineItem?.shippingCondition || this.shipViaOptions[0];

          /* if (this.isCompleteCart) {
            this.shipViaSelectedOption = this.cartData?.shippingConditions;
          } */
          this.incoTermsSelectedOption = lineItem?.incoTerms;
          this.currentSelectedCartEntry = lineItem;
          if (this.customerFlag || this.salesPersonFlag) {
            this.showValidationError = false;
            this.shipViaSelectedOption =
              this.storedShippingAddress?.defaultShippingMethod ||
              this.shipViaOptions[0]?.value;
            this.incoTermsSelectedOption =
              this.storedShippingAddress?.defaultIncoTermsDesc ||
              this.incoTermsOptions[0]?.label;
            this.shippingWareHouseOptions = [];
            this.shippingWareHouseOptions.push({
              value: this.storedShippingAddress?.defaultShippingWarehouse,
              label: this.storedShippingAddress?.defaultShippingWarehouseDesc,
            });
            this.orderService
              .getShippingoptionForCustomers(
                this.defaultAddress?.postalCode,
                this.shipViaSelectedOption,
                this.shippingWareHouseSelectedOption,
                this.storedShippingAddress?.oneTimeShippingAddress || this.storedShippingAddress?.isOneTimeShipTo
                        ? true : false,
                this.uid
              )
              .subscribe({
                next: (res) => {
                  this.spinnerLoading = false;
                  this.incoTermsOptions = [];
                  this.incoTermsOptions.push({
                    value: res.body.incoTerms,
                    label: res.body.incoTermsDesc,
                  });
                  this.originalDefaultShippingMethod = res.body?.originalDefaultShippingMethod;
                  this.incoTermsSelectedOption = this.incoTermsOptions[0]?.label;
                  this.incoTermsLoc2Options = [];
                  const apiShipVia = res.body?.shipvia;
                  const apiShipViaDesc = res.body?.shipViaDesc;
                  if (apiShipVia || apiShipViaDesc) {
                    this.incoTermsLoc2Options.push({
                      value:
                        apiShipVia ||
                        this.storedShippingAddress?.defaultShipVia,
                      label:
                        apiShipViaDesc ||
                        this.storedShippingAddress?.defaultShipViaDesc ||
                        apiShipVia,
                    });
                  }
                  this.incoTermsLoc2SelectedOption = res.body.shipvia;
                },
                error: (err) => {
                  this.productService.progressHide();
                  this.spinnerLoading = false;
                },
              });
          }
          if (!this.customerFlag && !this.salesPersonFlag) {
            this.getIncoTerms(this.shipViaSelectedOption);
            this.shippingWareHouseSelectedOption = [];
            this.productService
              .getShippingWareHouseWithOutFlag()
              .subscribe((res: any) => {
                if (res?.body) {
                  for (let key of Object.entries(res?.body)) {
                    this.shippingWareHouseSelectedOption.push({
                      value: key[0],
                      label: key[1],
                    });
                  }
                  this.shippingWareHouseSelectedOption =
                    lineItem?.shippingWarehouse ||
                    this.shippingWareHouseOptions[0];
                  this.incoTermsLoc2SelectedOption = lineItem?.shipVia;
                  this.currentSelectedCartEntry = lineItem;
                  this.getIncoTerms(this.shippingWareHouseSelectedOption);
                }
              });
          }
         
        }
      });
    if (this.isCompleteCart) {
      this.shipingWareHouseModal(
        templateType,
        "shippingWareHouse",
        lineItem,
        true
      );
    } else {
      this.shipingWareHouseModal(
        templateType,
        "shippingWareHouse",
        lineItem,
        false
      );
    }
  }

  showShippingOptions(shippingOptions:any){
    this.modalRef = this.modalService.show(
      shippingOptions,
      {
        id: "shippingOptionsModal",
        class: "modal-lg modal-dialog-centered",
      }
    );
  }

  checkoutRequestedPrice() {
    if (this.isSampleOrder) {
      return false
    } else {
      return !(this.cartEntries.every((item: any) => (
        (item?.isBundledEntry) || (item.noCharge) || ((item.unitPrice.value == 0 && item.requestedPrice > 0) ||
        (item.unitPrice.value > 0 && (item.requestedPrice >= 0 || item.requestedPrice == undefined || !item.requestedPrice)))
      )));
    }
  }
  showFullText = false; 

  toggleText() {
    this.showFullText = !this.showFullText; 
  }
   errorMaxLength: string = 'Maximum character limit of 250 exceeded.';
  isInvalid: boolean = false;
  maxmodalRef?: BsModalRef;
  onSideMarkChange(value: any,maxlengthTemplate: TemplateRef<any>): void {
    if (value.length > 250) {
      this.cartIndexData.sideMark = value.substring(0, 250);
      this.maxmodalRef = this.modalService.show(maxlengthTemplate, {
        id: 9,
        class: 'modal-lg modal-dialog-centered',
        backdrop: 'static',
        keyboard: false,
      });
    }
  }
  getcountry(country: any) {
    STATES.filter((c: any) => {
      if (c.abbreviation == country) {
        this.states = c.states;
      }
    });
  }

  promoCodeError:any;
  invalidPromo:boolean = false;
  promoCode:any;

  alphaNumberic(e: any) {
    return /^[a-z0-9 -]$/i.test(e.key);
  }

  validatePromoCode(e?: any) {
    if (e.currentTarget.value.length < 1) {
      this.invalidPromo = false;
      return;
    };
    this.promoCodeError = "";
    let promoCode = e.currentTarget.value;
    this.orderService.validatePromoCode(promoCode).subscribe(
      (res: any) => {
        if (res?.body?.status == "Error") {
          this.promoCodeError = res?.body?.message;
          this.invalidPromo = true;
        } else {
          this.invalidPromo = false;
        }
      },
      (error: any) => {
        this.productService.progressHide();
        this.promoCodeError = error.error.message;
        this.invalidPromo = true;
      }
    );
  }
  isTyping: boolean = false;

  onTyping(): void {
    this.isTyping = true;
  }
  
  checkRequestedPriceValidator(e: any) {
    if (e.target.value == ".") {
      e.target.value = "0.";
    }
  }

  isShippingAddressValid(){
    return !(this.cartData?.entries?.every((item: any) => (
      (item?.shippingCondition && item?.incoTerms && item?.shippingWarehouse && item?.shipVia)
    )));
  }

  formatDateMessage(msg: string) {
    const msgDate = Date.parse(msg);
    let returnVal = msg;

    if (isNaN(msgDate) == false) {
      var d = new Date(msgDate);
      returnVal = formatDate(d, "MM/dd/yyyy", "en-US");
    }

    return returnVal;
  }
  isShippingOptionsModalOpened: boolean = false;
  setLoadAPI(apiName: any, apiLength: number = 4) {
    this.shippingOptionsAPIs.add(apiName);
    if (this.shippingOptionsAPIs.size >= apiLength && !this.isShippingOptionsModalOpened) {
      this.productService.progressHide('getShippingOptionsId');
      this.modalRef = this.modalService.show(this.shippingOptionTemplate, {
        id: "shipingWareHouseModal",
        class: "modal-lg modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      });
      this.isShippingOptionsModalOpened = true;
    }
  }
}
