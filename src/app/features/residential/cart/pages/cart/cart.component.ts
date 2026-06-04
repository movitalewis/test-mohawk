import {
  Component,
  OnInit,
  TemplateRef,
  Input,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  ElementRef,
  Inject,
  ViewChildren,
  QueryList,
  HostListener,
} from "@angular/core";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { XchangeAddAccessoriesLightboxComponent } from "src/app/features/shared/components/xchange-add-accessories-lightbox/xchange-add-accessories-lightbox.component";
import { PlaceReservePopupComponent } from "../../components/place-reserve-popup/place-reserve-popup.component";
import { ProductService } from "../../../products/pages/services/product.service";
import { SampleBudgetService } from '../../../budget/services/sample-budget.service';
import { StorageService } from "src/app/features/http-services/storage.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { TabsetComponent } from "ngx-bootstrap/tabs";
import { Router } from "@angular/router";
import { ApiService } from "src/app/features/http-services/api.service";
import { API_CONSTANTS } from "src/app/features/shared/constants/API-CONSTANTS";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { AddUserModalComponent } from "src/app/features/shared/components/add-user-modal/add-user-modal.component";
import { ConfirmationDialogComponent } from "src/app/features/shared/components/confirmation-dialog/confirmation-dialog.component";
import { NewReserveNameComponent } from "src/app/features/shared/components/new-reserve-name/new-reserve-name.component";
import { Columns, Config, DefaultConfig } from "ngx-easy-table";
import { GetBuilderInfoComponent } from "src/app/features/shared/components/builder-modals/get-builder-info/get-builder-info.component";
import { BuilderDetailsComponent } from "src/app/features/shared/components/builder-modals/builder-details/builder-details.component";
import { faL } from "@fortawesome/free-solid-svg-icons";
import { OrderService } from "../../../orders/services/order.service";
import { Subject, Subscription, async, forkJoin, take, takeUntil } from "rxjs";
import { AddCompanionProductsComponent } from "../../../products/components/add-companion-products/add-companion-products.component";
import { DatePipe, DOCUMENT, formatDate } from "@angular/common";
import { jsPDF } from "jspdf";
import { ShareViaEmailLightboxComponent } from "../../../products/components/share-via-email-lightbox/share-via-email-lightbox.component";
import html2canvas from "html2canvas";
import { ResidentialPlpTypes } from "src/app/features/shared/constants/menu/residential.config";
import { STATES } from "src/app/features/shared/constants/States";
import { ProgressModalComponent } from "src/app/features/shared/components/progress-modal/progress-modal.component";
import { XchangeDataLayerService } from "src/app/features/http-services/data-layer.service";
@Component({
    selector: "residential-cart",
    templateUrl: "./cart.component.html",
    styleUrls: ["./cart.component.scss"],
    standalone: false
})
export class CartComponent implements OnInit, AfterViewInit {
  faEllipsisVertical: any = faEllipsisVertical;
  @ViewChild("staticTabs", { static: false }) staticTabs!: TabsetComponent;
  @ViewChildren("hidden") hidden: QueryList<CartComponent> | undefined;
  alertData = {
    message: "Product(s) removed Successfully.",
    type: "info",
  };
  shipViaType: any;
  requestDeliveryDate: any;
  poNumber: string = "";
  comments :string = "";
  showAssignedSpec = false;
  isCollapsed = false;
  isCollapsedSecond = true;
  selectedItemNumber: any = 0;
  messageSuccess: boolean = false;
  cartId: any = "";
  reATP: boolean = false;
  cartData: any = {};
  cartNumberData: any = {};
  camsCartEntries: any = [];
  uid: string = "";
  cartIndexData: any = {};
  cartEntries: any = [];
  orderSample: any = "";
  internalComment: boolean = false;
  typeOfproduct: any = "";
  productType: any = "";
  subProductType: any;
  isAtpCheck: boolean = false;
  atpCheckProductTypes = JSON.parse(ResidentialPlpTypes.atpCheckProductTypes);
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
  paymentTerms: any = undefined;
  builderOrder = "";
  bulderDropdown = [
    { value: "false", label: "No" },
    { value: "true", label: "Yes" },
  ];
  showroom = false;
  public checkoutForm!: FormGroup;
  breadcrumbItems: BreadcrumbItems = [
    {
      name: "Home",
      path: "/residential",
      active: false,
    },

    {
      name: "",
      active: true,
    },
  ];
  poMandatoryFlag: boolean = false;
  modalRef!: BsModalRef;
  userList: any = [];
  paymentTermList: any = [];
  defaultAddress: any;
  marketSegment: any;
  formattedAddress: any;
  completeOrder: boolean = false;
  shippingAddress: any = {};
  estimatedDate: any = "";
  totalItems: any;
  alertMsg: string = "";
  alertType = "danger";
  orderPlacedData: any;
  minicartSubscription: any;
  userEmail: any;
  errorAlerts: any = [];
  // showSidemarkCheckbox = true;
  builderSub: any;
  isSolutionDetailsClicked: boolean = false;
  shipViaOptions: any = [];
  shippingWareHouseOptions: any = [];
  carrierOptions: any = [];
  shippingConditions: string = "";
  incoTermsSelectedOption: any;
  incoTermsOptions: any = [];
  shippingWareHouse: string = "";
  incoTermsLoc2SelectedOption: any;
  incoTermsLoc2Options: any = [];
  erpProductCategory: string = "";
  currentSelectedCartEntry: any = {};
  carrierModalObj: any = {
  
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
  builderOrderAllowed!: boolean;
  restrictPlaceOrder: boolean = false;
  noChargeReasonsList: any = [];
  noChargeReasonsObj: any;
  csrFlag: boolean = false;
  customerFlag: boolean = false;
  tabId: number = 0;
  priceLabel:any="";
  destroySubject: Subject<void> = new Subject();
  smallParcelEligible: boolean = false;
  smallParcelShippingData: any = [];
  showDetailsFlag: boolean = false;
  invalidPO: boolean = false;
  shippingAddressId: any;
  addtoCartFailed = false;
  addtoCartErrorMessage = "";
  termsCodeList: any = [];
  selectedLine: any;
  salesPersonFlag:boolean=false;
  selectedTermCode: any;
  shippingWHDrodpDown: any;
  poSuggestionMsg: any =
    '{ } \\\\(Doublebackslash) []:;" , these special characters are not allowed';
  reInspect: boolean = false;
  errorMsg: any = "";
  mtClass: any;
  poMtclass: any;
  pLine: any;
  header: any;
  states = [...STATES[0]?.states, ...STATES[1]?.states];
  poSubscription: any;
  proceedFlag: boolean = false;
  rddFlag: boolean = false;
  inHouseAccount: boolean = false;
  isShipToUser:boolean = false;
  userInfo: any = "";
  soldToAccount:any = "";
  substituteProductFlag: boolean = false;
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
    public productService: ProductService,
    public getStorageService: StorageService,
    private fb: FormBuilder,
    private router: Router,
    private apiService: ApiService,
    public userService: UserService,
    private sampleBudgetService: SampleBudgetService,
    private orderService: OrderService,
    private datePipe: DatePipe,
    private dataLayer: XchangeDataLayerService,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.getStorageService
      .getItem("builderOrderAllowed")
      .subscribe((res: any) => {
        this.builderOrderAllowed = res;
        this.cd.detectChanges();
      });

    this.minicartSubscription = this.getStorageService
      .getItem("miniCartCount")
      .pipe(takeUntil(this.destroySubject))
      .subscribe((res) => {
        if (res?.code && !this.cartIsLoading) {
          this.cartNumberData = res;
          this.cartData.code = res?.code;
          this.shippingAddressId = res.shipTo;

          //if (res?.sampleOrder == true) {
          //this.userList = [];
          //this.userList.push({ name: "Create New Contact", value: "new" });
          //} else {
          this.getSubmittedFor();
          //}
          this.getCartData();
          // this.minicartSubscription.unsubscribe();
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
      if (res?.isCSR || res?.isSalesPerson) {
        this.showNoFreightAndNoCharge = true;
      } else {
        this.showNoFreightAndNoCharge = false;
      }
      this.customerFlag = res?.isCustomer ? true : false;
      this.salesPersonFlag = res?.isSalesPerson || res?.isSalesOps ? true:false;
      if (!this.csrFlag && !res?.isSalesPerson && !this.submitFor) {
        this.submitFor = {
          uid: res?.uid,
          name: res?.name,
        };
      }
      this.inHouseAccount = res?.orgUnit?.inHouseAccount;
      this.priceLabel = res?.priceLabel;
      this.isShipToUser = res?.isShipToUser;
      this.soldToAccount = res?.orgUnit?.soldTo || "";
      this.cd.detectChanges();
    });
  }
  showNoFreightAndNoCharge: boolean = false;
  cartInfo: any = {};
  cartIsLoading = false;
  requestingPriceForm!: FormGroup;
  availabilityReserve:boolean=false;
  sampleCamsOrderNumber:any;
  skipGetCartProgrossModal: boolean = false;
  isCartLoadingModalOpened = false;
  getCartData(cartId: string = "") {
    // this.spinnerLoading = true;
    this.reviewActiveTab = false;
    this.cartIsLoading = true;
    this.cartEntries = [];
    this.camsCartEntries = [];
     const cartIdVal: any = cartId ? cartId : this.cartData?.code || this.cartNumberData?.code;
    this.scrollPageToTop();
    if (!this.skipGetCartProgrossModal && !this.isCartLoadingModalOpened) {
      this.isCartLoadingModalOpened = true;
      this.productService.progressShow('getCart', 'getCartId');
    }
    this.productService.getCartData(cartIdVal).subscribe(
      (res: any) => {
        this.productService.progressHide('getCartId');
        // this.modalService.hide("progressModal");
        this.hideProgressModal("rdd-progressBar");
        this.cartIsLoading = false;
        this.spinnerLoading = false;
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
        // this.checkReserveEligibility(
        //   res?.body?.code || this.cartNumberData?.code
        // );
        let commentsData =
          res?.body?.b2bCommentData && res?.body?.b2bCommentData[0]?.comment
            ? res?.body?.b2bCommentData[0]?.comment
            : "";

            this.sampleCamsOrderNumber = res.body?.camsCartEntries[0]?.camsOrderNumber;
          
        (this.comments = commentsData), console.log("res issss--->", res.body?.camsCartEntries[0]?.
          camsOrderNumber);
        // this.dataLayer.viewCart(
        //   res?.body?.entries[0]?.totalPrice?.currencyIso ||
        //     res?.body?.entries[0]?.totalSurchargeValue?.currencyIso ||
        //     res?.body?.entries[0]?.unitPrice?.currencyIso ||
        //     "",
        //   res?.body?.entries?.map((entry: any, index: number) => {
        //     return {
        //       item_id: entry.product?.code || "",
        //       item_name: entry.product?.name || "",
        //       index,
        //       item_brand:
        //         entry.product?.brandName || entry.product?.brandId || "",
        //       item_category:
        //         entry.product?.subCategoryCode ||
        //         entry.product?.subProductType ||
        //         entry.product?.subCategoryName ||
        //         "",
        //       item_category2:
        //         entry.product?.productLine || entry.product?.collection || "",
        //       item_category3:
        //         entry.product?.styleName || entry.product?.name || "",
        //       item_category4: entry.product?.colorName || "",
        //       item_list_id: "",
        //       item_list_name: "",
        //       item_variant: `${entry.product?.productLine || ""} ${
        //         entry.product?.styleName || entry.product?.name || ""
        //       }`,
        //       price: entry.unitPrice?.value || 0,
        //       quantity: Number(entry.pricingUOMQuantity) || 0,
        //       uom: entry.pricingUom || "",
        //       selected_uom: entry.uom?.code || "",
        //     };
        //   }) || []
        // );
        this.builderOrder = String(res?.body?.builderOrder);
        this.getPaymentTermsList(res?.body);

        this.showroom = res?.body?.showroom;
        this.submitFor = res?.body?.submittedFor || this.submitFor;
        this.paymentTerms = res?.body?.termsCode;
        this.orderSample = res?.body?.sampleOrder;
        this.cartInfo = res?.body;
        this.poMandatoryFlag = res?.body?.poIndicator;
        this.poNumber = res?.body?.poNumber;
        this.checkoutForm.patchValue({ porequest: res?.body?.poNumber });
        this.promoCode = res?.body?.promoCode;
        this.updatePOflag(this.poMandatoryFlag);
        this.marketSegment = res?.body?.marketSegment;
        this.defaultAddress = res?.body?.deliveryAddress;
        this.formattedAddress = res?.body?.deliveryAddress?.companyName + " ";
        this.reATPChangeSource = res?.body?.shipComplete;
       
        // this.completeOrder = res.body?.shipComplete ? res.body?.shipComplete : res.body?.groupWithFewerShipments ? res.body?.groupWithFewerShipments : false;
        res.body?.deliveryAddress?.line1 +
          " " +
          res.body?.deliveryAddress?.town +
          " " +
          res.body?.deliveryAddress?.region?.isocodeShort +
          " " +
          res.body?.deliveryAddress?.postalCode;

        // this.cartEntries = res?.body?.entries ? res?.body?.entries : [];
        this.camsCartEntries = res?.body?.camsCartEntries || [];
        if(this.camsCartEntries){
          this.camsCartEntries.forEach((entries: any, i: number) => {
            entries?.cartEntries.forEach((item: any, index: number) => {
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
        this.totalItems = res?.body?.totalItems;

        this.cartData = res.body;
        this.reInspect = this.cartData?.reInspect;
        this.requestDeliveryDate = res?.body?.requestedDeliveryDate;
        this.shippingWareHouseSelectedOption = res.body?.shippingWarehouseDesc;
        this.builderOrderAllowed = this.cartData?.builderOrderAllowed || this.builderOrderAllowed;
        this.restrictPlaceOrder = this.cartData?.restrictPlaceOrder || this.restrictPlaceOrder;
        if (this.storedShippingAddress?.oneTimeShippingAddress) {
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
        this.showRoomChecked = this.cartData?.showroom;        
        if (this.cartData?.replacementOrder == true) {
          if (this.cartData?.replacementOrderInfo?.hasClaimSubmitted == true) {
            this.storedShippingAddress = {
              ...this.storedShippingAddress,
              replacementOrder: this.cartData?.replacementOrder ? true : false,
              hasClaimSubmitted:this.cartData?.replacementOrderInfo?.hasClaimSubmitted ? true : false,
              claimNumber: this.cartData?.replacementOrderInfo?.claimNumber,
              replacementReason :this.cartData?.replacementOrderInfo?.replacementReason,
            };
          } else {
            this.storedShippingAddress = {
              ...this.storedShippingAddress,
              replacementOrder: this.cartData?.replacementOrder ? true : false,
              hasClaimSubmitted:this.cartData?.replacementOrderInfo?.hasClaimSubmitted ? true : false,
              purchaseOrderNumber: this.cartData?.replacementOrderInfo?.purchaseOrderNumber,
              replacementReason: this.cartData?.replacementOrderInfo?.replacementReason,
              orderNumber: this.cartData?.replacementOrderInfo?.replacementOrderNumber,
              invoiceNumber: this.cartData?.replacementOrderInfo?.invoiceNumber,
            };
            
          }
        }
        this.productService.progressHide('getCartId');
        this.isCartLoadingModalOpened = false;
      },
      (err: any) => {
        this.isCartLoadingModalOpened = false;
        this.productService.progressHide("getCartId");
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
            //  }
            this.isAvailableForReserveEligibility = true;
          } else {
            this.isAvailableForReserveEligibility = false;
          }
        } else {
          this.isAvailableForReserveEligibility = true;
        }
      },
      (err: any) => {
        this.isAvailableForReserveEligibility = false;
        this.productService.progressHide();
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

   get isCartHasInStockLine() {
    return (this.cartData?.camsCartEntries || []).some((camsEntry: any) => (camsEntry?.cartEntries || []).some((entry: any) => (entry?.availabilityStatus || "").toLowerCase() === 'in stock'));
  }

  reserveProductsModal() {
    this.ngOnDestroy()
    // this.checkReserveEligibility(this.cartNumberData?.code);
    // this.checkReserveEligibility(this.cartNumberData?.code);
 //   if (this.isAvailableForReserveEligibility) {
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
          this.apiService.getMiniCart(this.uid, this.userEmail);
          if (data?.status == "Success" || data?.status == "success") {
            this.cartData = {};
            this.modalService.hide('new-reserve-name-modal');
            this.router.navigate(["/residential/orders/reserves"], {
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
  notificationUrl: any;
  storedShippingAddress: any;
  isSampleOrderRestricted: boolean = false;
  isRequestedPriceChanged:boolean = false;
  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    const { mtClass, poMtclass, pLine, header } =
      this.userService.getDeviceType();
    this.mtClass = mtClass;
    this.poMtclass = poMtclass;
    this.pLine = pLine;
    this.header = header;
  }
  ngOnInit(): void {
    const { mtClass, poMtclass, pLine, header } =
      this.userService.getDeviceType();
    this.mtClass = mtClass;
    this.poMtclass = poMtclass;
    this.pLine = pLine;
    this.header = header;
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
    this.notificationUrl = [`${baseUrl}/my-profile/notification-preferences`];
    this.getStorageService.getItem("shippingAddress")
      .pipe(takeUntil(this.destroySubject))
      .subscribe((res: any) => {
      this.storedShippingAddress = res;
      this.cd.detectChanges();
    });
    if (this.orderService.showRsrvDtlSuccessMsg == true) {
      this.alertType = "success";
      this.alertMsg = "Product(s) are added successfully into the cart.";
    }
    this.orderService.showRsrvDtlSuccessMsg = false;
    this.createCheckoutForm();
    // this.builderSub = this.getStorageService
    //   .getItem("miniCartCount")
    //   .subscribe((res) => this.getBuilderOrder$(res));

    this.requestingNewPriceForm();
    // this.validatePO(1);
    this.getNoChargeReasonCodes();
    this.getOrderDates();
    this.apiService.getMiniCart(this.uid, this.userEmail);
  }
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
    });
  }
  checkNoChargeReasonSelected() {
    const filterData = this.cartEntries.filter(
      (item: any) =>
        item?.noCharge == true &&
        (item.noChargeReasonCode == undefined || item?.noChargeReasonCode == "")
    );
    return !this.cartData?.builderInfo?.modelHome && !this.showRoomChecked
      ? filterData.length > 0
      : false;
  }
  ngOnDestroy(): void {
    this.destroySubject.next();
    this.destroySubject.complete();
  }

  trackByCamsOrder = (_: number, item: any) => item?.camsOrderNumber ?? _;
  trackByEntryNumber = (_: number, item: any) => item?.entryNumber ?? _;

  showPoSuggestionMsg: boolean = false;
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
          this.marketSegment = res.body.marketSegment;
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
            this.camsCartEntries = res?.body?.camsCartEntries ? res?.body?.camsCartEntries : [];
        //  this.cartEntries = res?.body?.entries ? res?.body?.entries : [];
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
            if (this.staticTabs?.tabs[0]?.active === true) {
              if (!!res.body.materialAvailableDate) {
                this.estimatedDate = res.body.materialAvailableDate;
              } else {
                this.estimatedDate = "See line details.";
              }
            } else {
              if (!!res.body.eddDate) {
                this.estimatedDate = res.body.eddDate;
              } else {
                this.estimatedDate = "See line details.";
              }
            }
          } else {
            this.estimatedDate = "NA";
          }
          // this.estimatedDate = !!res.body.entries[0].eddDate ? res.body.entries[0].eddDate: res.body.entries[1].eddDate
          this.cartData = res.body;

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
          // this.productService.progressHide();
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
      (err) => { this.productService.progressHide();}
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
      .subscribe({
        next: (res: any) => {
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
        error: (err: any) => {
          this.productService.progressHide("removeItemFromCartId");
          this.spinnerLoading = false;
        },
      });
    this.closePopup(selectedId);
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

  clearAllfromCart() {
    this.productService
      .removeAllFromCart(this.cartData?.cartNumber || this.cartData?.code)
      .subscribe((res: any) => {
        this.messageSuccess = true;
        this.cartData = res.body;
        this.autoDismissMsg();
      },(err)=>{this.productService.progressHide();});
  }

  autoDismissMsg() {
    setTimeout(() => {
      // <<<---using ()=> syntax
      this.messageSuccess = false;
    }, 5000);
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
      shipAvailability: [""],
      standardShipping: [""],
      estdeliverydate: [""],
      reqdeliverydate: [""],
      shipCompleteOrder: ["Ship Complete Order"],
      groupWithFewerShipment: [""],
      // ShipOrderBasedonAvailability: [""],
      porequest: ["", [Validators.required]],
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
      this.shippingAddress["marketSegment"] = this.marketSegment;
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

      // this.openProgressModal({ progressText: "Placing Order..." });
      this.productService.progressShow('placeOrder', 'placeOrderId');
      this.productService
        .placeOrder(payload, "cartId")
        .subscribe((res: any) => {
          this.modalService.hide('placeOrderId');
          this.messageSuccess = true;
          this.cartData = res.body;
        }, (err: any) => { this.productService.progressHide('placeOrderId'); });
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
      this.breadcrumbItems[1].path = "/residential/orders?page=0";
      if (this.cartNumberData?.sampleOrder) {
        this.breadcrumbItems[1].path = "/residential/orders?page=2";
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
    this.cd.detectChanges();
    this.proceed(staticTabs);
  }
  hideConfirmationModal() {
    this.modalService.hide("confirmationModal");
  }

  proceedWithPOvalidation(staticTabs?: any) {
    if ((this.cartData.poNumber != this.poNumber && this.poNumber.length > 0)|| (this.invalidPO || this.cartData?.poIndicator)) {
      this.validatePO(staticTabs);
    } else {
      this.proceed(staticTabs);
    }
  }

  validatePO(staticTabs?: any) {
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
          this.modalService.hide("progressModal");
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
        onPrimaryAction: () => {
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
                quantity: Number(entry.pricingUOMQuantity) || 0,
                uom: entry.pricingUom || "",
                selected_uom: entry.uom?.code || "",
              };
            }) || []
          );
          // this.addtoCartFailed = true;
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
          this.cartData = {};
          this.createCheckoutForm();
          this.productService.getLatestMiniCart(this.uid);
          this.checkedToggleIndex.clear();
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
        this.builderOrder == "" ||
        this.builderOrder == null ||
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
        let payLod = {
          carrierNumber: item?.carrierNumber,
          lineNumber: item?.entryNumber,
          reInspect: item?.reInspect,
          noFreight: item?.noFreight,
          noCharge: item?.noCharge,
          noChargeReasonCode:
            !this.cartData?.builderInfo?.modelHome && !this.showRoomChecked
              ? item?.noChargeReasonCode
              : "",
          priceComment: item?.priceComment,
          requestedPrice: this.checkoutForm.value.requestedPrice,
          sideMark: item?.sideMark,
          incoTerms: item?.incoTerms,
          shipVia: item?.shipVia?.label ? item?.shipVia?.label : item?.shipVia || "",
          shippingCondition: (this.userInfo?.isCustomer || this.userInfo?.isSalesPerson || this.userInfo?.isSalesOps) ? item?.originalDefaultShippingMethod || this.originalDefaultShippingMethod : item?.shippingCondition,
          shipperZipCode: item?.zipcode,
          shipperAccountNumber: item?.accountNumber,
          carrierType: item?.carrierType,
          requestedDeliveryDate: item?.requestedDeliveryDate,
          termsCode: item?.termsCode,
        };
        items.push(payLod);
      });
    });
    const payLoad = {
      termsCode: this.paymentTerms,
      showroom: this.showroom,
      attentionTo: "attension",
      // comment: this.checkoutForm.controls["comments"].value,
      comment: this.comments,
      internalComment: this.internalComment,
      carrierType: this.cartData?.smallParcelCarrier,
      items: items,
      jobLocation: "",
      marketSegment: "",
      poNumber: this.checkoutForm.value.porequest,
      promoCode: this.checkoutForm.value.promocode,
      shipperAccountNumber: this.cartData?.accountNumber,
      shipperZipCode: this.cartData?.zipcode,
      shipComplete: this.flagForChange ? false : this.radioButtonValue == "radio-button-1",
      deliveryGrouping: this.radioButtonValue === "radio-button-3",
      // shipperAccountNumber: this.cartNumberData?.sampleOrder ? this.uid : "",
      // // this.uid
      // // ***max 10 Alpha numeric
      // shipperZipCode: this.cartNumberData?.sampleOrder
      //   ? this.defaultAddress?.postalCode
      //   : "",
      // this.defaultAddress?.postalCode
      submittedFor: this.submitFor?.uid,
      builderOrder:
        this.builderOrder == "true"
          ? true
          : this.builderOrder == "false"
          ? false
          : "",
      orderIndicatorPhoneOrEmail: this.orderIndicator
    };
    this.flagForChange = false;
    this.isShipOrderBased = false;
    this.allowShippingPreferenceChange = true;
    // this.spinnerLoading = true;
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
          // this.productService.progressHide(this.proceedFlag ? 'orderReviewId' : 'updateCartId');
          // this.modalService.hide("progressModal");
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
                      // this.productService.progressHide();
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
                    // this.modalService.hide("progressModal");
                  });
                }
                else{
                  if(this.cartData?.parcelFlag === true){
                    // this.modalService.hide();
                    this.productService.progressHide('checkoutId');
                    // this.modalService.hide("progressModal");
                    this.spinnerLoading = false;
                    this.alertType = "danger";
                    this.errorMsg = "Shipping method 'Parcel' is not eligible for Ship Order Based on Availability. Please select a different Shipping Method to proceed.";
                    this.hideErrorMsg();
                    return;
                  }
        
                  if(this.cartData?.c3pIncoTermsFlag == true && this.cartData?.incoTerms != 'C3P'){
                    // this.productService.progressHide();
                    // this.modalService.hide("progressModal");
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
    // this.openProgressModal({ progressText: "Proceeding to Checkout.." }, "md", "checkoutProgressModal");
    this.productService.progressShow('checkoutCart', 'checkoutCartId');
    this.productService
      .cartToCheckout(this.cartData?.code)
      .subscribe((resp: any) => {
        this.productService.progressHide('checkoutCartId');
        this.spinnerLoading = false;
        if (resp?.status == 500) {
          this.alertType = "danger";
          this.errorMsg = resp?.error;
          return;
        }
        if(resp?.body?.errorMessages &&
          resp?.body?.errorMessages.length > 0
          ){
            this.alertType = "danger";
            this.errorMsg = resp?.body?.errorMessages[0].message;
            return;
          }
        this.checkoutData = resp?.body;
        this.dataLayer.beginCheckout(this.checkoutData?.subTotal?.value);
        this.cartData = resp?.body;
      //  this.cartEntries = resp?.body?.entries ? resp?.body?.entries : [];
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
        if (this.cartNumberData?.sampleOrder) {
          this.isSampleOrderRestricted = false;
          this.cartEntries.map((item: any) => {
            item.isOrderRestricted = false;
            item.isExceededSampleBudget = false;
            if (
              item?.requestedPrice > 0 &&
              item?.sufficientSampleBudget == false &&
              !item?.salesmanId.includes("13")
            ) {
              if(item.exceededSampleBudget){
             
                item.isExceededSampleBudget = true;
              }else{
                item.isExceededSampleBudget = false;
              }
              item.isOrderRestricted = true;
             
              this.isSampleOrderRestricted = true;
            }
           
          });
          
        }

        this.cartEntries.map((item: any) => {
          if ( item?.requestedPrice > 0) {
            this.isRequestedPriceChanged = true;
          }
        });

        staticTabs != undefined
          ? (staticTabs.tabs[1].active = true)
          : null;
        this.showroom = resp?.body?.showroom;
      }, () => {
        this.productService.progressHide('checkoutCartId');
      });
  }

  hideErrorMsg(){
    setTimeout(() => {
      this.errorMsg = '';
    }, 5000);
  }

  url: any;
  submitOrderVal: any;
  submitOrder(staticTabs: any) {
    this.alertMsg = "";
    // this.spinnerLoading = true;
    // this.openProgressModal({ progressText: "Placing order.." });
    this.productService.progressShow('placeOrder', 'placeOrderId');
    this.productService.submitOrder(this.cartData?.code, {}).subscribe(
      (res) => {
        this.productService.progressHide('placeOrderId');
        // this.modalService.hide("progressModal");
        this.getStorageService.getItem("uid")
          .pipe(takeUntil(this.destroySubject))
          .subscribe((uid: any) => {
          this.uid = uid;
        });
        this.productService.getLatestMiniCart(this.uid);
        // this.modalService.hide();
        this.scrollPageToTop();
        this.spinnerLoading = false;
        this.orderPlacedData = res.body;
        if (res.body?.status === "Error" || res.status != 200) {
          // this.modalService.hide("progressModal");
          this.alertMsg = res?.error || "Failed to submit your Order.";
          this.alertType = "danger";
          // window.scrollTo({
          //   top: 0,
          //   behavior: "smooth",
          // });
          this.resetFirstTab(staticTabs);
        } else {
          // this.productService.progressHide();
          // this.modalService.hide("progressModal");
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
            this.getStorageService.selectedCloneOrders?.selectedLines.splice(
              0,
              1
            );
            this.getStorageService.setItem("selectedCloneOrders", {
              sampleOrder:
                this.getStorageService.selectedCloneOrders?.sampleOrder,
              selectedLines:
                this.getStorageService.selectedCloneOrders?.selectedLines,
              module: "residential",
              productNumber:
                this.getStorageService.selectedCloneOrders.productNumber,
            });
          }
          this.placeOrder(2);
          staticTabs.tabs[2].active = true;
        }

      },
      (err: any) => {
        this.productService.progressHide('placeOrderId');
        // this.modalService.hide("progressModal");
        // this.modalService.hide();
        this.scrollPageToTop();
        this.alertMsg = "Failed to submit your Order.";
        this.alertType = "danger";

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
        this.resetFirstTab(staticTabs);
      }
    );
  }
  getUrl(id: any) {
    let currentUrl = this.router.url.split("?")[0];
    let baseUrl = currentUrl.includes("commercial") ? "commercial" : "residential";
    currentUrl = currentUrl.replace(/\/(residential|commercial)\/.*/, "");
    let url = [`${currentUrl}/${baseUrl}/orders/orders-history-details/${id}`];
    return url;
  }
  resetFirstTab(staticTabs: any) {
    this.checkoutForm.setValue({
      shipAvailability: "",
      standardShipping: "",
      estdeliverydate: "",
      shipCompleteOrder: "Ship Complete Order",
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
  // shipViaErrormsg: any= ""
  // onShipViaChange() {
  //   this.productService.updateShippingMethodWithOutFlag(this.cartNumberData?.code,this.shipViaSelectedOption)
  //   .subscribe((res: any) => {
  //     if(res.body && res.body.errorStatus){
  //       this.shipViaErrormsg = res.body.errorStatus;
  //     }
  //   });
  // }
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
    if (this.selectedOption?.value != event) {
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
          ? true
          : false,
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
                  value: res.body?.shippingWarehouse || this.storedShippingAddress?.defaultShippingWarehouse || this.selectedShipViaProduct?.shippingWarehouse,
                  label: res.body?.shippingWarehouseDesc || this.storedShippingAddress?.defaultShippingWarehouseDesc || this.selectedShipViaProduct?.shippingWarehouseDesc,
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
                      this.storedShippingAddress?.defaultShipViaDesc ||
                      apiShipVia,
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
  changeshippingWareHOuseOptions(event: any) {
    this.shippingWareHouseSelectedOption = event;
  }
  isCompleteCart: boolean = false;
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
          this.selectedOption = this.shipViaOptions.find(
            (item: any) => item.value === this.shipViaSelectedOption
          );
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

    // zipcode=46158&accountNumber=1R2F12&carrierType=96044139
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
           } else {
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
          this.modalService.hide("progressModal");
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
  cartEntriesLength: any;

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
      this.productService.getPdpRecords(lineProduct.product.code, this.substituteProductFlag).subscribe(
        (res) => {
          // this.setLoadAPI("pdpData");
          // this.scrollPageToTop();
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
            
            this.spinnerLoading = true;
            this.productService.getUOMDetails(res.body.code).subscribe(
              (result) => {
                this.spinnerLoading = false;
                let erpProductCategory = result?.body?.erpProductCategory;;
                if(erpProductCategory === 'B'){
                  this.isAtpCheck = true;
                }
                if ((this.pdbData?.classification == "Accessories" && !(this.pdbData.subProductType === 'PAD_CUSHION' && this.isAtpCheck))|| this.pdbData.productType ===  "MERCHANDISING") {
                  this.isAtpCheck = false;
                }

                this.addAccessoriesAddcart(lineProduct, this.isAtpCheck, erpProductCategory);
              },
              () => {
                this.modalService.hide("progressModal");
              }
            );
          }
        },
        () => {
          this.modalService.hide("progressModal");
        }
      );
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
            requestDeliveryDate: this.requestDeliveryDate || this.storedShippingAddress?.requestedDeliveryDate,
            productType: this.pdbData.productType.toUpperCase(),
            entryLength: this.entryNumber,
            sameDyeLot: lineProduct.sameDyeLot,
            poNumber:this.poNumber,
            submittedFor:this.submitFor?.uid,
            erpProductCategory: erpProductCategory,
            rdd: this.requestDeliveryDate || this.storedShippingAddress?.requestedDeliveryDate,
            preferredStock: lineProduct?.preferredStock,
            atpCheckFromCart: (entry: any) => {
              this.modalService.hide("AddCompanionProductsComponent");
              this.entryNumber = entry;
              this.productService.getMiniCartData(this.uid).subscribe(
                (res) => {
                  this.cartData = res?.body;
                  if (entry < this.cartEntriesLength.length) {
                    this.getPdpData(this.cartEntriesLength[entry]);
                  } else {
                    this.rddFlag = false;
                    this.cancelReserve();
                    this.getCartData(this.cartData?.code);
                  }
                },
                () => {
                  // this.modalService.hide("progressModal");
                }
              );
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
      this.productService.getMiniCartData(this.uid).subscribe(
        (res) => {
          this.cartData = res?.body;

          this.addToCartEachEntry(lineProduct, feetYardFormData);

          // this.entryNumber = this.entryNumber + 1;

          // // for (let i = 0; i < this.cartEntriesLength.length; i++) {
          // if (this.entryNumber < this.cartEntriesLength.length && this.isCompleteCart) {
          //   this.getPdpData(this.cartEntriesLength[this.entryNumber]);
          // }
        },
        () => {
          this.modalService.hide("progressModal");
        }
      );
      // for (let i = 0; i < this.cartEntriesLength.length; i++) {
      // if (
      //   this.entryNumber < this.cartEntriesLength.length &&
      //   this.isCompleteCart
      // ) {
      //   this.getPdpData(this.cartEntriesLength[this.entryNumber]);
      // }
    }
  }
 // cartId:any;
  addToCartEachEntry(lineProduct: any, feetYardFormData: any) {
    this.spinnerLoading = true;
    let orderSamples: any = [];
    if (lineProduct.product.code.includes("#")) {
      lineProduct.product.code = lineProduct.product.code.replace(/#/g, "%23");
    }
    const setTimeoutRef = setTimeout(() => {
      this.spinnerLoading = false;
    }, 30000);
    this.productService
      .getProductPriceDetails(lineProduct.product.code)
      .subscribe((res: any) => {
        this.spinnerLoading = false;
        clearTimeout(setTimeoutRef);

        this.priceDetails = res.body;

        if (this.cartData?.sampleOrder === true) {
          orderSamples = [
            {
              code: lineProduct?.product.code,
              noCharge: false,
              quantity: lineProduct?.quantity,
              requestedQty: lineProduct?.quantity,
              requestedUOM: lineProduct?.uom?.code,
              selected: true,
              sellingBackingId: lineProduct?.product?.sellingBackingId,
              sellingColorId: lineProduct?.product?.sellingColorId,
              sellingColorName: lineProduct?.product?.sellingColorName,
              sellingSizeId: lineProduct?.product?.sellingSizeId,
              sellingStyleId: lineProduct?.product?.sellingStyleId || lineProduct?.product?.styleNumber,
              size: lineProduct?.product?.sellingStyleId || lineProduct?.product?.sellingSizeDescription,
              sellingStyleName: lineProduct?.product?.sellingStyleName,
              requestedDeliveryDate:
                this.requestDeliveryDate || lineProduct?.requestedDeliveryDate,
              shippingCondition:
              this.userInfo.isCustomer === true || this.userInfo.isSalesPerson === true || this.userInfo.isSalesOps ? 
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
              originProductType: lineProduct?.originProductType,
              originSubProductType: lineProduct?.originSubProductType,
              productPriceData: this.priceDetails,
            },
          ];
        }

        const item = {
          dyeLot: feetYardFormData?.dye,
          feet: Number(feetYardFormData?.feet),
          inches: Number(feetYardFormData?.inches),
          productCode:
            this.cartData?.sampleOrder === true
              ? lineProduct?.sampleProductReference
              : this.pdbData?.code,
          requestedUOM: feetYardFormData?.unit,
          requestedQty:
            this.cartData?.sampleOrder === true
              ? ""
              : feetYardFormData?.quantity,
          // maxFeet: feetYardFormData?.maxFeet || 0,
          maxInches: feetYardFormData?.maxInches || 0,
          minFeet: feetYardFormData?.minFeet || 0,
          minInches: feetYardFormData?.minInches || 0,
          rollPrices: true,
          shippingCondition:
          this.userInfo.isCustomer === true || this.userInfo.isSalesPerson === true || this.userInfo.isSalesOps == true ? 
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
          showroom:this.showroom,
          termsCode:this.paymentTerms,
          solution: [],
          productPriceData: this.priceDetails,
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
            this.shippingAddress?.addressCity ||
            this.shippingAddress?.town ||
            this.defaultAddress?.town ||
            "",
          addressCountry:
          
            this.shippingAddress?.isOneTimeShipTo ||
            this.shippingAddress?.oneTimeShippingAddress 
              ? this.shippingAddress.country?.isocode
              : this.shippingAddress.country?.isocode ||
            this.defaultAddress?.country?.isocode,
          addressLine1:
            this.shippingAddress?.addressLine1 ||
            this.shippingAddress?.line1 ||
            this.defaultAddress?.line1 ||
            "",
          addressLine2:
            this.shippingAddress?.addressLine2 ||
            this.shippingAddress?.line2 ||
            this.defaultAddress?.line2 ||
            "",
          addressName: this.shippingAddress?.addressName || 
            this.defaultAddress?.companyName,
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
              : lineProduct?.product.code,
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
            ? { merchandisingProduct: this.cartData?.merchandisingProduct }
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
          this.userInfo.isCustomer === true || this.userInfo.isSalesPerson == true || this.userInfo.isSalesOps == true ? 
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
          shippingInfo: {},
          reAtp: true,
          poNumber:this.poNumber,
          submittedFor:this.submitFor?.uid,
          shipComplete: this.isCompleteCart == true ? true : false,
          showroom:this.showroom,
          termsCode:this.paymentTerms,
          comment: this.comments,
          soldTo: this.isShipToUser ? this.soldToAccount : this.uid,
          builderOrder: this.builderOrder == "true" ? true : this.builderOrder == "false"  ? false  : "",
          builderInfo: this.cartData?.builderInfo,
          orderPlacedSite: "xchange",
          isAccessoryCart: this.pdbData?.classification == "Accessories" ? true : false
        };
        // payLoad.incoTerms = this.incoTermsSelectedOption || lineProduct.incoTerms;
        // (payLoad.shippingCondition = this.
        //    lineProduct.shippingCondition),
        //   (payLoad.requestedDeliveryDate = this.requestDeliveryDate);

        let cartNumber: any = null;
        if (this.isCompleteCart) {
          if (this.cartEntriesLength.length == 1 && this.entryNumber == 0) {
            cartNumber = null;
          } else {
            cartNumber = this.cartData?.code || null;
          }
          this.productService.getMiniCartData(this.uid).subscribe(
            (res) => {
              if (res.body?.errorMessage?.includes("No Cart existed")) {
                cartNumber = null;
              } else {
                cartNumber = res.body.code;
              }
            },
            () => {
              this.modalService.hide("progressModal");
            }
          );
        } else {
          if (this.cartEntriesLength.length <= 1) {
            cartNumber = null;
          } else {
            cartNumber = this.cartData?.code || null;
          }
          this.productService.getMiniCartData(this.uid).subscribe(
            (res) => {
              if (res.body?.errorMessage?.includes("No Cart existed")) {
                cartNumber = null;
              } else {
                cartNumber = res.body.code;
              }
            },
            () => {
              this.modalService.hide("progressModal");
            }
          );
        }

        this.productService.getMiniCartData(this.uid).subscribe(
          (res) => {
            if (res.body?.errorMessage?.includes("No Cart existed")) {
              cartNumber = null;
            } else {
              cartNumber = res.body.code;
            }
            if(this.shippingAddress?.oneTimeShippingAddress || this.shippingAddress?.sOneTimeShipTo){
              payLoad.shippingInfo = this.cartData?.shippingInfo
            }
            if((this.storedShippingAddress?.defaultShippingMethod ==='PA'||
              this.storedShippingAddress?.shippingCondition === 'PA' ||
              this.storedShippingAddress?.shippingMethod === 'PA') && (this.shippingAddress?.oneTimeShippingAddress ||  this.shippingAddress?.sOneTimeShipTo)){
                payLoad.shippingInfo = [];
              }
           
            this.productService
              .addToCart(this.userService.getUserEmail().toLowerCase(), cartNumber, payLoad)
              .subscribe(
                (res) => {
                  this.spinnerLoading = false;
                  this.cartId = res?.body?.cartNumber;
                  this.modalService.hide("progressModal");

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
                        this.getPdpData(
                          this.cartEntriesLength[this.entryNumber]
                        );
                      } else {
                        this.spinnerLoading = false;
                        this.rddFlag = false;
                        this.hideProgressModal("rdd-progressBar");
                        this.modalService.hide("progressModal");
                        this.getCartData(this.cartId);
                      }
                      return res?.body?.messages[0]?.message;
                    } else {
                      // this.atpCheckFromCart();
                      this.successCase(res);
                      this.entryNumber = this.entryNumber + 1;

                      // for (let i = 0; i < this.cartEntriesLength.length; i++) {
                      if (
                        this.entryNumber < this.cartEntriesLength.length &&
                        this.isCompleteCart
                      ) {
                        this.getPdpData(
                          this.cartEntriesLength[this.entryNumber]
                        );
                      } else {
                        this.spinnerLoading = false;
                        this.rddFlag = false;
                        this.modalService.hide("progressModal");
                        this.getCartData(this.cartId);
                      }
                      return res?.body?.messages[0]?.message;
                    }
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
                      this.modalService.hide("progressModal");
                      this.getCartData(this.cartId);
                    }
                    return res?.body?.messages[0]?.message;
                  }
                },
                (err: any) => {
                  this.modalService.hide("progressModal");
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
          },
          () => {
            this.modalService.hide("progressModal");
          }
        );
      });
  }

  failedCase(msg?: any) {
    // this.spinnerLoading = false;
    this.addtoCartFailed = true;
    this.addtoCartErrorMessage = msg;
    this.scrollPageToTop();
  }
  successCase(res?: any) {
    this.spinnerLoading = true;
    let cartNumber = this.cartData?.code || null;
    this.getStorageService.getItem("uid")
      .pipe(takeUntil(this.destroySubject))
      .subscribe((res) => {
      this.uid = res;
    });
    this.productService.getMiniCartData(this.uid).subscribe((res) => {
      this.hideProgressModal("rdd-progressBar");
      this.spinnerLoading = false;
      this.cartData = res?.body || res;
      this.getStorageService.setItem("miniCartCount", this.cartData);
      this.spinnerLoading = false;
      const data: any = this.modalService.config.initialState;
      const initialState: ModalOptions = {
        initialState: {
          // Data to  popup
          cartData: data?.cartData,
        },
      };
    });
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
          this.incoTermsLoc2Options = [];
          this.setLoadAPI("ShipVia");

          if (Object.keys(res?.body).length > 0) {
            const resObject = res?.body;
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

  requestedPricePerUnit: any;
  selectedProduct: any;

  routeToProfile() {
    this.router.navigate(["/residential/my-profile/notification-preferences"]);
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
  // getBuilderOrder$(res: any) {
  //   this.showErrorMessage = false;
  //   if (res?.code) {
  //     this.productService.getBuilderOrder(res?.code).subscribe(
  //       (response) => {

  //         if (
  //           response &&
  //           response?.body &&
  //           response?.body.builders &&
  //           response?.body.builders.length > 0 &&
  //           response?.body.builders[0].errorCode == "0001"
  //         ) {
  //           this.showErrorMessage = true;
  //           this.errorMessageBuilder = response?.body.builders[0].message;
  //         } else {
  //           this.showErrorMessage = false;
  //           this.builderOrderDetails = response?.body?.builders || [];
  //         }
  //       },
  //       (err: any) => {
  //         this.errorMessageBuilder = err?.message;
  //       }
  //     );
  //   }
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
            this.scrollPageToTop();
            this.productService.progressHide("add-user");
            this.modalRef.content.errorMessage = err.error;
          },
        });
      });
    } else {
      //   this.setSubmittedFor$(value?.uid).subscribe({
      //     next: (res) => {},
      //     error: (err) => {},
      //   });
    }
  }
  createNewUser$(payload: any): any {
    let data: any = {
      username: this.userService.getUserEmail().toLowerCase(),
      cartId: this.cartNumberData?.code,
    };

    return this.productService.createNewUser(data, payload);
  }

  openBuilderModal(value: any) {
    // onPrimaryAction: () => this.returnToCart(),
    this.cartData.builderOrder = value == "true";
    this.proceed(null, true, true);
    const initialState: ModalOptions = {
      initialState: {
        showroom: this.showroom,
        builderInfo: this.cartData?.builderInfo,
        isSampleOrder: this.cartData.sampleOrder,
        onClose: () => {
          this.skipGetCartProgrossModal = false;
          // this.builderOrder = this.builderOrder ? "true" : "false";
          if (this.bmCloseFlag) {
            this.bmCloseFlag = false;
            return;
          }
          this.builderOrder = "false";
          this.proceed(null, true, true);
          // this.bulderDropdown.find(
          //   (item) => item.label === this.builderOrder
          // )?.value;
        },
        builderSubmitted: (res: any) => {
          this.builderOrder = "true";
          if (res?.builders.length > 0) {
            if (res?.builders[0]?.modelHome == true) {
              this.showroom = false;
              this.showRoomChecked = false;
            }
            this.proceed(null, true, true);
            this.skipGetCartProgrossModal = false;
          }
          // if (res?.builders.length > 0) {
          //   this.proceed(null, true);
          // }
        },
      },
    };
    if (value == "true") {
      this.skipGetCartProgrossModal = true;
      this.modalRef = this.modalService.show(
        GetBuilderInfoComponent,
        Object.assign(initialState, {
          id: "builder-info",
          class: "modal-lg modal-dialog-centered",
          backdrop: "static",
          keyboard: false,
        })
      );
    }
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
  radioButtonValue: any = "radio-button-1";
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

  orderIndicator:any= undefined;
  onOrderIndicatorSelected(value: string) {
    this.orderIndicator = value;
    //this.proceed(null, true, true);
  }

  @ViewChild("scrollToTop", { read: ElementRef }) scrollToTop: any;
  scrollPageToTop() {
    // this.scrollToTop.nativeElement.scrollIntoView({
    //   behavior: "smooth",
    //   block: "start",
    //   inline: "nearest",
    // });
    // document.getElementById("mainPage")?.scrollIntoView(true);
    const scroll = document.querySelectorAll(".custom-scrollbar");
    scroll.forEach((element) => {
      const elem = element as HTMLElement;
      elem.scrollTop = 0;
    });
  }
  selectedPriceIndex = 0;
  showPricingUOM: any = "per unit";
  priceRequestModal(
    template: TemplateRef<any>,
    selectedProduct: any,
    index: number
  ) {
    this.showPricingUOM = selectedProduct?.pricingUomDescription || "per unit";
    index = this.cartEntries.map((i:any) => i.entryNumber).indexOf(selectedProduct.entryNumber);
    this.selectedPriceIndex = index;

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
      //  Validators.max(requestPriceMax),
        Validators.pattern(/^\d+(\.\d+)?$/),
      ]);
    }

    if(this.cartData?.sampleOrder == true){
      control["requestedPrice"].setValidators([
        Validators.required,
        Validators.max(requestPriceMax),
        Validators.pattern(/^\d+(\.\d+)?$/),
      ]);
      control["priceComment"].clearValidators();
    }

    control["requestedPrice"].markAsUntouched();
    control["priceComment"].markAsUntouched();
    control["requestedPrice"].updateValueAndValidity();
    control["priceComment"].updateValueAndValidity();
    // this.checkRequestedPriceValidator();

    this.selectedProduct = selectedProduct;
    this.modalRef = this.modalService.show(template, {
      id: "shipViaModal",
      class: "modal-md modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }

  requestingNewPriceForm() {
    this.requestingPriceForm = this.fb.group({
      requestedPrice: [
        "",
        [
          Validators.required,
          Validators.min(0.01),
          Validators.pattern(/^\d+(\.\d+)?$/),
        ],
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
      requestedPrice: this.cartData?.sampleOrder ? this.requestingPriceForm.value.requestedPrice === "0" || this.requestingPriceForm.value.requestedPrice === "0.0" || this.requestingPriceForm.value.requestedPrice === "0.00" ? "0.01" : this.requestingPriceForm.value.requestedPrice:this.requestingPriceForm.value.requestedPrice,
      priceComment: this.requestingPriceForm.value.priceComment,
    };
    if (this.requestingPriceForm.valid) {
      this.cartEntries[this.selectedPriceIndex].requestedPrice =
      this.cartData?.sampleOrder ? this.requestingPriceForm.value.requestedPrice === "0" || this.requestingPriceForm.value.requestedPrice === "0.0" || this.requestingPriceForm.value.requestedPrice === "0.00"? "0.01" : this.requestingPriceForm.value.requestedPrice:this.requestingPriceForm.value.requestedPrice;
      this.cartEntries[this.selectedPriceIndex].priceComment =
        this.requestingPriceForm.value.priceComment;
      this.productService.requestingNewPrice(payload, {}).subscribe(
        (res: any) => {},
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
  showRoomChecked: boolean = false;
  changeEvent(event: any, checkRef: any) {
    if (
      this.cartData?.builderInfo?.modelHome !== undefined &&
      this.cartData?.builderInfo?.modelHome == true &&
      event?.state == true
    ) {
      this.openConfirmationModal({
        title: "Warning",
        content: `Model Home is already been selected,in builder options <br /> Selecting this option will override Model Home`,
        primaryActionLabel: "YES",
        secondaryActionLabel: "NO",
        onPrimaryAction: () => {
          this.showRoomChecked = true;
          this.showroom = true;
          checkRef.checked = true;
          let payload = {
            blockNum: this.cartData?.builderInfo?.blockNum,
            builderMigrated: this.cartData?.builderInfo?.builderMigrated,
            lotNum: this.cartData?.builderInfo?.lotNum,
            modelHome: false,
            showRoom: this.showRoomChecked,
            builderCity: this.cartData?.builderInfo?.builderCity,
            builderName: this.cartData?.builderInfo?.builderName,
            builderNumber: this.cartData?.builderInfo?.builderNumber,
            builderState: this.cartData?.builderInfo?.builderState,
            divCity: this.cartData?.builderInfo?.divCity,
            divName: this.cartData?.builderInfo?.divName,
            divNumber: this.cartData?.builderInfo?.divNumber,
            divState: this.cartData?.builderInfo?.divState,
            subDivCity: this.cartData?.builderInfo?.subDivCity,
            subDivName: this.cartData?.builderInfo?.subDivName,
            subDivNumber: this.cartData?.builderInfo?.subDivNumber,
            subDivState: this.cartData?.builderInfo?.subDivState,
			      subDivisionFreeText: this.cartData?.builderInfo?.subDivisionFreeText,
          };
          this.productService
            .submitBuilderInfo(this.cartNumberData?.code, payload)
            .subscribe((response) => {
              this.cartData.builderInfo = { ...this.cartData?.builderInfo, modelHome: false };
              // this.cartData.builderInfo = response?.body?.builders[0];
            });
          this.modalService.hide("confirmationModal");
        },
        onSecondaryAction: () => {
          this.showRoomChecked = false;
          this.showroom = false;
          checkRef.checked = false;
          this.modalService.hide("confirmationModal");
        },
      });
    } else {
      this.showRoomChecked = event?.state;
      checkRef.checked = event?.state;
      this.showroom = event?.state;
    }
  }
  navigateToProductPage(id: any) {
    this.router.navigate(["residential/products/details/" + id]);
  }
  continueShopping() {
    this.router.navigate(["residential"]);
  }
  solutionDetailsClicked() {
    this.isSolutionDetailsClicked = !this.isSolutionDetailsClicked;
  }
  reInspectFlag: boolean = false;
  reATPChangeSource: boolean = false;
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
  
  breadcrumbClick(item: any) {
    if (this.breadcrumbItems.length > 2 && item.name == "Cart") {
      this.breadcrumbItems.pop();
      this.changeTab(0);
      this.staticTabs.tabs[0].active = true;
    }
  }

  //carrierOptionList: any = [];
  async shippingMethodVendorAccountNumbers(productCode: any, lineNumber: any) {
    this.productService
      .shippingMethodVendorAccountNumbersAPIv2(productCode, lineNumber)
      .subscribe((res: any) => {
        if (res?.status == 200) {
          return res.body;
        } else {
          return ["123453", "123451", "123452", "123455", "123454"];
        }
      });
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
  changeIncoTerm(cartLineItem: any) {}
  keyPressForZip(e: KeyboardEvent) {
    return /^[a-z,A-Z,0-9]$/i.test(e.key);
  }
  keyPressForAccount(e: KeyboardEvent) {
    return /^[a-z,A-Z,0-9]$/i.test(e.key);
  }

  bmCloseFlag: boolean = false;
  showBuilderModal() {
    this.bmCloseFlag = true;
    this.openBuilderModal("true");
  }

  viewBuilderDetails() {
    const initialState: ModalOptions = {
      initialState: {
        builderInfo: this.cartData?.builderInfo,
        fromPage: "cart",
      },
    };
    this.modalRef = this.modalService.show(
      BuilderDetailsComponent,
      Object.assign(initialState, {
        id: "builder-info",
        class: "modal-lg modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }

  keyComemnts(e: KeyboardEvent) {
    let t = e;
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

              // this.shipViaSelectedOption =
              //   this.storedShippingAddress?.defaultShippingWarehouse ||
              //   this.shippingWareHouseOptions[0].value;
              // if (this.isCompleteCart) {
              //   this.shipViaSelectedOption = this.cartData?.shippingWarehouse;
              // }
              this.incoTermsLoc2SelectedOption =
                cartIndexData?.shipVia ||
                cartIndexData?.defaultShipVia ||
                this.storedShippingAddress?.defaultShipVia;
              this.getIncoTermsLoc2(
                this.isCompleteCart
                  ? this.cartData?.shippingWarehouse
                  : cartIndexData.shippingWarehouse
              );
            }
          }
          // this.modalRef = this.modalService.show(template, {
          //   id: "shipingWareHouseModal",
          //   class: "modal-lg modal-dialog-centered",
          //   backdrop: "static",
          //   keyboard: false,
          // });
        },(err)=>{this.setLoadAPI("ShippingWarehouse");});
    } else {
      this.shippingWHDrodpDown = cartIndexData.shippingWarehouse;
      if (!this.customerFlag && !this.salesPersonFlag) {
        this.shippingWareHouseOptions.push({
          value: cartIndexData.shippingWarehouse,
          label: cartIndexData.shippingWarehouseDesc,
        });
        // this.shipViaSelectedOption =
        //   this.storedShippingAddress?.defaultShippingWarehouse ||
        //   this.shippingWareHouseOptions[0].value;
        // if (this.isCompleteCart) {

        //   this.shipViaSelectedOption = this.cartData?.shippingWarehouse;
        // }
        this.incoTermsLoc2SelectedOption =
          this.storedShippingAddress?.defaultShipVia;
        this.getIncoTermsLoc2(
          this.isCompleteCart
            ? this.cartData?.shippingWarehouse
            : cartIndexData.shippingWarehouse
        );
      }
      // this.modalRef = this.modalService.show(template, {
      //   id: "shipingWareHouseModal",
      //   class: "modal-lg modal-dialog-centered",
      //   backdrop: "static",
      //   keyboard: false,
      // });
    }
  }

  closeShippingWareHouseModal() {
    this.isShippingWareHouseModalOpened = false;
    this.modalService.hide("shipingWareHouseModal");
  }
  changeShippingWareHouseOptions(event: any) {
    this.shippingWareHouseSelectedOption = event;

    this.getIncoTermsLoc2(this.shippingWareHouseSelectedOption);
  }
  submittedForReAtp:any="";
  poReAtp:any="";
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
    // this.getStorageService.getItem("shippingAddress").subscribe((res: any) => {
    // storedShippingAddress = res;

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
    // this.submittedForReAtp = this.cartData.submittedFor;
    // this.poReAtp = this.cartData.poNumber;
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
    //  if(this.totalItems>1){
    // this.getStorageService.setItem("updateIncoLine", this.currentSelectedCartEntry.entryNumber);
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
        apiCalls.push(
          this.productService
          .removeSelectedItemFromCart(
            this.cartData?.cartNumber || this.cartData?.code,
            item.entryNumber
          ));
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

    if (this.isCompleteCart) {
      this.cartEntriesLength = this.cartData.entries;
      this.productService
        .cancelCart(this.cartData?.code || "123456")
        .subscribe({
          next: (res) => {
            if (res.status == 200 && res.body.messages[0].status == "Success") {
              // this.cartData=undefined
              this.apiService.getMiniCart(this.uid, this.userEmail);
              this.entryNumber = 0;

              this.getPdpData(this.cartEntriesLength[0]);
              this.spinnerLoading = false;
              this.checkedToggleIndex.clear();
            }
          },
          error: (error: any) => {
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
      this.productService
        .getPdpRecords(lineProduct.product.code, this.substituteProductFlag)
        .subscribe((res) => {
          if (res && res.status == 500) {
          }
          if (res && res.status == 400) {
          }

          if (res.body) {
            this.pdbData = res.body;
            this.productType = this.pdbData.productType;
            this.subProductType = this.pdbData.subProductType;
            this.isAtpCheck = this.atpCheckProductTypes.includes(this.subProductType);
            
            this.productService
              .getUOMDetails(res.body.code)
              .subscribe((result) => {
                this.spinnerLoading = false;
                this.isAtpCheck = this.atpCheckProductTypes.includes(this.subProductType);
                let erpProductCategory = result?.body?.erpProductCategory;
                if(erpProductCategory === 'B'){
                  this.isAtpCheck = true;
                }
                if ((this.pdbData?.classification == "Accessories" && !(this.pdbData.subProductType === 'PAD_CUSHION' && this.isAtpCheck))|| this.pdbData.productType ===  "MERCHANDISING") {
                  this.isAtpCheck = false;
                }
                if (this.pdbData && this.isAtpCheck) {
                  if (lineProduct.product.code.includes("#")) {
                    lineProduct.product.code = lineProduct.product.code.replace(
                      /#/g,
                      "%23"
                    );
                  }
                  const setTimeoutRef = setTimeout(() => {
                    this.spinnerLoading = false;
                  }, 30000);
                  this.productService
                    .getProductPriceDetails(lineProduct.product.code)
                    .subscribe(
                      (res: any) => {
                        this.productService.progressHide("reAtpId");
                        this.spinnerLoading = false;
                        clearTimeout(setTimeoutRef);

                        this.priceDetails = res.body;

                        //  this.getProductPriceDetails(lineProduct.product.code);
                        const initialState: ModalOptions = {
                          initialState: {
                            comment: this.comments,
                            rddFlag: this.rddFlag,
                            fromViewInventory: false,
                            solutions: [this.pdbData],
                            erpProductCategory: erpProductCategory,
                            openFromaddressModal: false,
                            shippingAddress: this.storedShippingAddress,
                            shippingOptions: this.storedShippingAddress,
                            poNumber:this.poNumber,
                            submittedFor:this.submitFor?.uid,
                            priceDetails: this.priceDetails,
                            reATPChangeSource : this.reATPChangeSource,
                            requestedYdkQty:
                              lineProduct.pricingUom === "YDK"
                                ? lineProduct?.pricingUOMQuantity
                                : "",
                            cartData: null,
                            feetyardForm: {
                              unit: lineProduct.uom.code,
                              quantity: "",
                              feet:
                                lineProduct.uom.code === "LF"
                                  ? lineProduct.userRequestedQuantity.split(
                                      "."
                                    )[0]
                                  : 0,
                              inches:
                                lineProduct.uom.code === "LF"
                                  ? lineProduct.userRequestedQuantity.split(
                                      "."
                                    )[1]
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
                              requestedYdkQty:
                                lineProduct.pricingUom === "YDK"
                                  ? lineProduct?.pricingUOMQuantity
                                  : "",
                            },
                            productType: this.pdbData.productType.toUpperCase(),
                            aptCheckEntrie: [],
                            reATP: true,
                            multiCutIndication: false,
                            viewInventory: false,
                            entryLength: this.entryNumber,
                            isReinspect: this.reInspectFlag,
                            requestedPrice:lineProduct?.requestedPrice,
                            priceComment:lineProduct?.priceComment,
                            noCharge:lineProduct?.noCharge,
                            noChargeReasonCode:lineProduct?.noChargeReasonCode,
                            noFreight:lineProduct?.noFreight,
                            sideMark:lineProduct?.sideMark,
                            showroom:this.showroom,
                            termsCode:this.paymentTerms,
                            isCompleteCart: this.isCompleteCart,
                            sameDyeLot: lineProduct.sameDyeLot,
                            builderOrder: this.builderOrder == "true" ? true : this.builderOrder == "false"  ? false  : "",
                            builderInfo: this.cartData?.builderInfo,
                            rdd: this.requestDeliveryDate || this.storedShippingAddress?.requestedDeliveryDate,
                            preferredStock: lineProduct?.preferredStock,
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
                                    this.cancelReserve();
                                    this.getCartData(this.cartData?.code);
                                  }
                                },
                                () => {
                                  this.modalService.hide("progressModal");
                                }
                              );
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
                      },
                      (err: any) => {
                        this.productService.progressHide("reAtpId");
                        // this.spinnerLoading = false;
                        clearTimeout(setTimeoutRef);
                      }
                    );
                //  this.bsModalRef.content.solutions = [this.pdbData];
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
              },()=>{this.productService.progressHide("reAtpId");});

            // this.pdbData=[...this.pdbData]

            // this.productType = this.pdbData.productType;
          }
        },()=>{this.productService.progressHide("reAtpId");});
    }
  }
  priceDetails = "";
  getProductPriceDetails(productCode: any) {
    if (productCode.includes("#")) {
      productCode = productCode.replace(/#/g, "%23");
    }
    const setTimeoutRef = setTimeout(() => {
      this.spinnerLoading = false;
    }, 30000);
    this.productService.getProductPriceDetails(productCode).subscribe(
      (res: any) => {
        this.spinnerLoading = false;
        clearTimeout(setTimeoutRef);

        this.priceDetails = res.body;
      },
      (err: any) => {
        this.productService.progressHide();
        this.spinnerLoading = false;
        clearTimeout(setTimeoutRef);
      }
    );
  }

  addToCartReATP(feetYardFormData: any, pdpData: any) {
    this.spinnerLoading = true;
    // this.productService.progressShow("","reatp");
    if (pdpData?.code.includes("#")) {
      pdpData.code = pdpData?.code.replace(/#/g, "%23");
    }
    const setTimeoutRef = setTimeout(() => {
      this.spinnerLoading = false;
    }, 30000);
    this.productService
      .getProductPriceDetails(pdpData?.code)
      .subscribe((res: any) => {
        this.spinnerLoading = false;
        clearTimeout(setTimeoutRef);

        this.priceDetails = res.body;

        const item = {
          dyeLot: "",
          feet: feetYardFormData?.feet ? Number(feetYardFormData?.feet) : "",
          inches: feetYardFormData?.inches
            ? Number(feetYardFormData?.inches)
            : "",
          productCode: pdpData?.code,
          requestedUOM: feetYardFormData?.uom.code,
          requestedQty: feetYardFormData?.userRequestedQuantity,
          maxFeet: feetYardFormData?.maxFeet,
          maxInches: feetYardFormData?.maxInches,
          minFeet: feetYardFormData?.minFeet,
          minInches: feetYardFormData?.minInches,
          sideMark:feetYardFormData?.sideMark,
          rollPrices: true,
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
          productPriceData: this.priceDetails,
          priceComment:feetYardFormData.priceComment,
          requestedPrice:feetYardFormData.requestedPrice,
          solution: [], // Wrap the current solution in an array
          //  shippingCondition: this..shipViaSelectedOption,
          // x
          noCharge: feetYardFormData?.noCharge,
          noChargeReasonCode:feetYardFormData?.noChargeReasonCode,
          noFreight:feetYardFormData?.noFreight,
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
          reAtp: true,
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
          replacementOrder:
            this.storedShippingAddress?.replacementOrder || false,
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
          shippingInfo: 
          {},
          shipComplete: this.isCompleteCart == true ? true : false,
          ...(this.reInspectFlag === true
            ? { reInspect: this.reInspectFlag || false }
            : {}),
          poNumber:this.poNumber,
        showroom:this.showroom,
        termsCode:this.paymentTerms,
        submittedFor:this.submitFor?.uid,
        comment: this.comments,
        soldTo: this.isShipToUser ? this.soldToAccount : this.uid,
        orderPlacedSite: "xchange",
        isAccessoryCart: this.pdbData?.classification == "Accessories" ? true : false
        };
        
        this.productService.getMiniCartData(this.uid).subscribe((res) => {
          this.cartData = res?.body || res;
          let cartNumber = null;
          if (res.body?.errorMessage?.includes("No Cart existed")) {
            cartNumber = null;
          } else {
            cartNumber = res?.body?.code;
          }
          if (this.shippingAddress?.oneTimeShippingAddress) {
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
                let cartId = res?.body?.cartNumber;
                if (res?.body?.errorMessages || res?.body?.messages?.length) {
                  if (
                    res?.body?.errorMessages === "Error" ||
                    res?.body?.messages[0]?.status === "Error" ||
                    res?.body?.messages[0]?.status === "Failed" ||
                    res?.body?.messages[1]?.status === "Error"
                  ) {
                    this.spinnerLoading = false;
                    this.failedCase(res?.body?.messages[0]?.message);
                    this.productService.progressHide("reAtpId");
                    // this.modalService.hide("progressModal");
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
                        this.getCartData(cartId);
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
                      this.getCartData(cartId)
                    }
                  }
                  this.successCase(res);
                  //  this.spinnerLoading = false;
                }
              },
              (err: any) => {
                this.productService.progressHide("reAtpId");
                // this.spinnerLoading = false;
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
      error: (err) => {},
    });
  }
  getPaymentTermsList(cartData: any) {
    this.productService.getPaymentTermsList(cartData).subscribe({
      next: (res) => {
        if (this.paymentTermList.length === 0) {
          for (let key in res.body) {
            this.paymentTermList.push({ value: key, label: res.body[key] });
          }
        }
        // this.daysToBeEnabled = this.datesEnabled;
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
    this.router.navigateByUrl("residential/cloneorders");
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
        .subscribe((res) => { });
      this.proceedCloneOrdrs();
    });
  }
  resetCloneOrderData() {
    this.getStorageService.setItem("selectedCloneOrders", {
      sampleOrder: "",
      selectedLines: [],
      module: "residential",
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
      // this.spinnerLoading = true;
      // this.productService
      //   .smallParcelShippingCondition(this.carrierModalObj.carrierType)
      //   .subscribe(
      //     (res: any) => {
      //       this.spinnerLoading = false;
      //       this.smallParcelShippingData = [];

      //       const shippingData =
      //         Object.keys(res.body).length === 0 ? defaultObj : res.body;
      //       for (let key in shippingData) {
      //         this.smallParcelShippingData.push({
      //           value: key,
      //           label: shippingData[key],
      //         });
      //       }
      //     },
      //     () => {
      //       this.spinnerLoading = false;
      //     }
      //   );
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
    this.modalService?.hide();
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
        module: "residential",
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
/* let payloadAddress= {
  address1: this.carrierModalObj?.addressLine1,
  address2: this.carrierModalObj?.addressLine2,
  buID: 1,
  city: this.carrierModalObj?.city,
  country: this.carrierModalObj?.country,
  erpId: 1,
  postalcode: this.carrierModalObj?.postalCode,
  state: stateAbbr
}; */
const payloadAddress = `(IvVstel='',` +
`IvCity='${this.carrierModalObj?.city}',` +
`IvCountry='${this.carrierModalObj?.country}',` +
`IvPostalCode='${this.carrierModalObj?.postalCode}',` +
`IvProvideAlt=1,` +
`IvRegion='${stateAbbr}',` +
`IvStreetLine='${encodeURIComponent(this.carrierModalObj?.addressLine1.trim())}')?$format=json`;
// this.spinnerLoading = true;
this.errorMessage = "";
    this.productService.progressShow('validateAddress', 'validateAddressId');
this.productService.validateAddress(payloadAddress).subscribe({
  next: (res) => {
    const EvStatus = res?.d?.EvStatus;
    const EvMessage = res?.d?.EvMessage;
    this.productService.progressHide('validateAddressId');
    this.modalService.hide("progressModal");
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
        oneTimeBillingAddress: true
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
              // this.productService.progressHide('updateSmallParcelFieldsId');
              // this.modalService.hide("progressModal");
              this.carrierMoAlertData.type = "danger";
              this.carrierMoAlertData.message = res?.body?.message;
            }
          },
          () => {
            this.productService.progressHide('updateSmallParcelFieldsId');
            // this.modalService.hide("progressModal");
            this.spinnerLoading = false;
            // this.modalService.hide("progressModal");
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
         <body onload="window.print()" style="background-color: #fff;">
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
  // printPages() {
  //   let printWin: any;
  //   this.printstatus=true;
  //   let accordianElements: any =
  //     this.document.getElementsByClassName("panel-collapse");
  //   for (let a = 0; a < accordianElements.length; a++) {
  //     accordianElements[a].style.display = "block";
  //   }
  //   var data: any = document.getElementById("print-area");
  //   this.hidelement(true);
  //   this.showElementForPdf(true);
  //   html2canvas(data, { useCORS: true }).then((canvas) => {
  //     var imgWidth = 208;
  //     var pageHeight = 900;
  //     var imgHeight = (canvas.height * imgWidth) / canvas.width;
  //     var heightLeft = imgHeight;
  //     const contentDataURL = canvas.toDataURL("image/jpeg");
  //     let pdf = new jsPDF("p", "mm", "a4");
  //     var position = 0;
  //     pdf.addImage(contentDataURL, "PNG", 0, position, imgWidth, imgHeight);
  //     let today = new Date();
  //     var dataUrl = contentDataURL;
  //     var image = new Image();
  //     var windowContent = "<!DOCTYPE html>";
  //     windowContent += "<html>";
  //     windowContent +=
  //       "<head><title>Print</title><style>@media print { body { width: 210mm; /* A4 width */ height: 297mm; /* A4 height */ margin: 0; /* No margin */ padding: 0; /* No padding */ } }</style></head>";
  //     windowContent += '<body onload="window.print();window.close()">';
  //     windowContent += '<img src="' + dataUrl + '" width=700>';
  //     windowContent += "</body>";
  //     windowContent += "</html>";
  //     printWin = window.open("", "", "width=500");
  //     printWin.document.open();
  //     printWin.document.write(windowContent);
  //     printWin.document.close();
  //     printWin.focus();
  //     this.hidelement(false);
  //     this.showElementForPdf(false);
  //     this.notAllowedFlag = false;      
  //     this.spinnerLoading = false;
  //     if (!this.showDetailsFlag) {
  //       for (let a = 0; a < accordianElements.length; a++) {
  //         accordianElements[a].style.display = "none";
  //       }
  //     }
  //   });
  //   this.printstatus=false
  // }

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
  getProductImage(imageurl: any) {
    const urlPattern = /^(https?:\/\/[^\s]+)$/;
    if (urlPattern.test(imageurl)) {
      return imageurl + "?$xchangeThumb$";
    }
    return "https://s7d4.scene7.com/is/image/MohawkResidential/missing";
  }
  

  changeTermCodeModal(changeDataTemplate: TemplateRef<any>, sLine: any) {
    this.selectedLine = sLine;
    this.selectedTermCode = sLine?.termsCode;
    this.modalRef = this.modalService.show(changeDataTemplate, {
      id: "changeTermCodeModal",
      class: "modal-md modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
    if (this.termsCodeList.length === 0) {
      this.orderService.getTermsCodeList().subscribe((res) => {
        for (let k in res?.body)
          this.termsCodeList.push({ key: k, value: res?.body[k] });
      });
    }
  }

  submitTermCode() {
    this.termsCodeList.filter((d: any) => {
      if (d.key == this.selectedTermCode) {
        this.selectedLine.termsCode = d.key;
        this.selectedLine.termsCodeDescription = d.value;
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
    this.productService.progressShow('cartProcessing', 'cartProcessingId');
    let camsEntries = this.camsCartEntries[this.changeRddDateIndex];
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
          ? cartIndexData?.product?.subProductType === "PAD_CUSHION"
            ? `(${cartIndexData?.pricingUOMQuantity} ${cartIndexData?.pricingUomDescription})`
            : cartIndexData?.solution && cartIndexData?.solution[0]?.orderMinInFeet != undefined && cartIndexData?.product?.subProductType != "UNDERLAYMENT" 
            ? `(${cartIndexData?.solution[0]?.orderMinInFeet} / ${cartIndexData?.solution[0]?.orderMaxInFeet})`
            : ""
          : uomInfo;
      if(cartIndexData?.product?.productType === "ACCESSORIES" && cartIndexData?.uom?.code === "RO"
        && cartIndexData?.product?.subProductType !== "PAD_CUSHION"){
        rollMax = ""
      }
      return `${userRequestedQuantity} ${
        cartIndexData?.uom?.name || ""
      }(s) ${rollMax}`.trim();
    }
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
            isCompleteCart ? lineItem?.shippingConditions || this.shipViaOptions[0].value : lineItem.shippingCondition ||  this.shipViaOptions[0].value;

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
                    
                   
            this.setLoadAPI("shippingMethod", 1);
                    // this.modalRef = this.modalService.show(templateType, {
                    //   id: "shipingWareHouseModal",
                    //   class: "modal-lg modal-dialog-centered",
                    //   backdrop: "static",
                    //   keyboard: false,
                    // });
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

  flagForChange:boolean=false;
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
  continueChanges( staticTabs:any,
    carrierTemplate:any, 
    selectedItem: any,
    isFromHeader?: boolean){
      if(this.cartData.shipComplete == true && this.cartData?.incoTerms == "C3P"){

       this.carrierModal(carrierTemplate, selectedItem, isFromHeader);
     }
     else{
      this.submitOrder(staticTabs);
     }

  }

  closeInfoChanges() {
    this.modalService.hide("proceedWithOutParcel");
    
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
        if(this.smallParcelEligible && ((this.cartEntries[0]?.shippingCondition != 'PA' &&
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
                    this.storedShippingAddress?.oneTimeShippingAddress === undefined
                      ? false
                      : this.storedShippingAddress?.oneTimeShippingAddress,
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
                        this.storedShippingAddress?.defaultShippingCondition || this.storedShippingAddress?.defaultShippingMethod ||
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
                              this.modalService.hide("progressModal");
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
      } else{
        this.submitOrder(staticTabs);
      }
  }

  closeShippingOptionsModalModal() {
    this.modalService.hide("shippingOptionsModal");
  }

  openToggles = true;

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
  
    let shipViaSelectedOption =
      this.shipViaSelectedOption || this.shippingAddress?.defaultShippinGCondition;
    let incoTermsLoc2SelectedOption =
      this.incoTermsLoc2SelectedOption?.value ||
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
        this.storedShippingAddress.defaultShippingCondition =
        this.originalDefaultShippingMethod;
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
          this.storedShippingAddress.defaultShippingCondition =
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
                            this.storedShippingAddress.defaultShippingCondition =
                            this.shipViaSelectedOption;
                          this.submitCombinedShippingInfo();
                          this.closeShippingWareHouseModal();
                        }
                      } else if (res.body.status === "error") {
                        // this.modalService.hide("progressModal");
                        this.productService.progressHide('validateShipViaId');
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

  hideProgressModal(id = "progressModal") {
    this.modalService.hide(id);
  }

  originalDefaultShippingMethod:any;
  checkoutShippingInfo(templateType: any, lineItem: any, isCompleteCart: any) {
    this.shipViaOptions = [];
    this.isCompleteCart = isCompleteCart;
    this.selectedShipViaProduct = lineItem;
    this.shipViaSelectedOption =
    this.storedShippingAddress?.defaultShippingCondition || this.storedShippingAddress?.defaultShippingMethod;
    this.shippingWareHouseSelectedOption =
      this.storedShippingAddress?.defaultShippingWarehouse || "";
    this.productService
      .getShippingMethodWithOutFlag(
        this.defaultAddress?.postalCode,
        this.storedShippingAddress?.oneTimeShipTo === undefined
          ? false
          : this.storedShippingAddress?.oneTimeShipTo,
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
            this.storedShippingAddress?.defaultShippingCondition || this.storedShippingAddress?.defaultShippingMethod ||
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
                  this.modalService.hide("progressModal");
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
    if (this.orderSample) {
      return false
    } else {
      return !(this.cartEntries?.every((item: any) => (
        (item.unitPrice.value == 0 && item.requestedPrice > 0) ||
        (item.unitPrice.value > 0 && (item.requestedPrice >= 0 || item.requestedPrice == undefined || !item.requestedPrice))
      )));
    }
  }

  sampleBudgetList:any = [];
  viewBudget(template: TemplateRef<any>){
    this.spinnerLoading = true;
    let cartCode = this.cartNumberData?.code || this.cartData?.code;
    this.sampleBudgetService.getSampleBudgetForCart(cartCode).subscribe((res) => {
      if(res.body){
        this.spinnerLoading = false;
        this.sampleBudgetList = res.body?.sampleBudgetList || [];
        this.modalRef = this.modalService.show(template, {
          id: 'viewBudgetModal',
          class: 'modal-lg modal-dialog-centered',
          backdrop: 'static',
          keyboard: false,
        });
      }
    });
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
        this.modalService.hide("progressModal");
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
  isShippingWareHouseModalOpened: boolean = false;
  setLoadAPI(apiName: any, apiLength: number = 4) {
    this.shippingOptionsAPIs.add(apiName);
    if (this.shippingOptionsAPIs.size >= apiLength && !this.isShippingWareHouseModalOpened) {
      this.isShippingWareHouseModalOpened = true;
      this.productService.progressHide('getShippingOptionsId');
      this.modalRef = this.modalService.show(this.shippingOptionTemplate, {
        id: "shipingWareHouseModal",
        class: "modal-lg modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      });
    }
  }
}
