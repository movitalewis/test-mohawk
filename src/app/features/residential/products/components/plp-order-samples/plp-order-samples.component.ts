import { ChangeDetectorRef,ViewChild, Component, Input, OnInit, OnDestroy, TemplateRef } from "@angular/core";
import { Route, Router } from "@angular/router";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { Config, Columns, DefaultConfig } from "ngx-easy-table";
import { ProductAddressService } from "../services/product-address.service";
import { OrderService } from "../../../orders/services/order.service";
import { XchangeImageViewLightBoxComponent } from "src/app/features/shared/components/xchange-image-view-light-box/xchange-image-view-light-box.component";
import { CarouselComponent } from 'ngx-owl-carousel-o';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { StorageService } from "src/app/features/http-services/storage.service";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { ProductService } from "../../pages/services/product.service";
import { DatePipe } from "@angular/common";
import { debounceTime, map, mergeMap, Subject, take, finalize } from "rxjs";
import { OwlOptions } from "ngx-owl-carousel-o";
import { ConfirmationDialogComponent } from "src/app/features/shared/components/confirmation-dialog/confirmation-dialog.component";
import { PdpPfxPriceFields } from "src/app/features/shared/constants/menu/residential.config";
import { PostModificationProductService } from "../../../post-modification/post-modification-products/post-modification-pages/post-modification-services/post-modification-product.service";
import { XchangeDataLayerService } from "src/app/features/http-services/data-layer.service";
@Component({
    selector: "residential-plp-order-samples",
    templateUrl: "./plp-order-samples.component.html",
    styleUrls: ["./plp-order-samples.component.scss"],
    standalone: false
})
export class PlpOrderSamplesComponent implements OnInit, OnDestroy {
  searchkey: any = "";
  result: any;
  searchBy: any = 'Color #';
  searchByList = ['Color #', 'Color Name'];
  placeholder: any = 'Search by Color #';
  modalRef?: BsModalRef;
  cards: any = [];
  pdpPfxPriceFields = PdpPfxPriceFields;
  showGotoCartBtn = false;
  selectedSize: any = '24" X 24"';
  selectedQuantity: any = "1";
  // orderSamples: any;
  reactiveForm!: FormGroup;
  initialState: any;
  submitted = false;
  uid = "";
  spinnerLoading = false;
  @Input() productColorVariantOptions: any = [];
  @Input() cartIdNew: any;
  image: any =
    "https://s7d4.scene7.com/is/image/MohawkResidential/28074_819_repeat?wid=200&hei=200&scl=3";

  productDetails: any;
  public styleName: any;
  public styleId: any;
  public productPriceDetails: any;
  accountData: any;
  alert = {
    show: false,
    type: "",
    message: "",
  };
  sizeOptions: any;
  isPostModificationOrder = false;
  isShipCompleteOrder = false;
  customOptionsProducts: OwlOptions = {
    loop: false,
    autoWidth: false,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: true,
    navSpeed: 700,
    navText: ["", ""],
    margin: 10,
    items: 6,
    responsive: {
      0: {
        items: 3,
      },
      400: {
        items: 6,
      },
      740: {
        items: 4,
      },
      940: {
        items: 6,
      },
    },
    nav: false,
    stagePadding: 5,
  };
  // availableQuantity: any;
  sampleType: any;
  isCustomer: boolean = false;
  selectedTab: any = "";
  colorVarient: any;
  sampleTempData: any;
  isShipToUser:boolean = false;
  soldToAccount:any = "";
  samplesInventoryCheckCounter: number = 0;

  constructor(
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private productService: ProductAddressService,
    private serivice: ProductService,
    private route: Router,
    private formBuilder: FormBuilder,
    private router: Router,
    public storageService: StorageService,
    private userService: UserService,
    private datePipe: DatePipe,
    private orderService: OrderService,
    private prostModificationService: PostModificationProductService,
    private cdr: ChangeDetectorRef,
    private dataLayer: XchangeDataLayerService
  ) {}
tabId = 0
  selectTab(newTabId: any, key: any) {
    const previousTabId = this.tabId;
    if (previousTabId !== newTabId) {
        /* const originalList = this.sampleTempData[previousTabId]?.value?.products || [];
        this.orderSamplesData[previousTabId].value.products = JSON.parse(JSON.stringify(originalList)); */
    }
    this.tabId = newTabId;
    this.searchkey = ''; 
    this.alert.message = "";
    this.alert.show = false;
    this.selectedTab = key;
    if(key !="Architect Folders" && this.orderSamplesData[this.tabId]?.value?.products && 
        this.orderSamplesData[this.tabId]?.value?.products.length == 1){
      this.orderSamplesData[this.tabId].value.products[0].selected = false;
      this.onSelectItem(this.orderSamplesData[this.tabId].value.products[0], key);
    }
  }

  orderSamplesModal(template1: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template1, {
      id: 1,
      class: "modal-xl modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }
  sidebarPath: any;
  userInfo:any;
  selectedVarient = "";
  shippingAddress: any = {};
  quantityDropdownData: any = [];
  showSelectedItemsAlert: boolean = false;
  ngOnInit(): void {
    for (let a = 1; a < 11; a++) {
      this.quantityDropdownData.push({ value: a, label: a });
    }
    this.storageService.getItem("uid").subscribe((res) => {
      this.uid = res;
    });
    this.sidebarPath = localStorage.getItem("path");
    this.initialState = this.modalService.config.initialState;
    this.isPostModificationOrder = this.initialState?.isPostOrder || false;
    this.selectedVarient = this.initialState?.selectedVarient;
    this.reactiveForm = this.formBuilder.group({
      Adobe: ["", Validators.required],
      AdobeQuantity: ["", Validators.required],
    });
    this.userService.isCustomer.subscribe((res: any) => {
      this.isCustomer = res;
    });
    this.getAllSamples();
    this.shippingAddress = this.initialState?.shippingAddress;
    if (this.shippingAddress == undefined) {
      this.getShippingAddress();
    }
    if (this.initialState?.orderNumber) {
      this.orderService
        .getOrderDetails(this.initialState?.orderNumber)
        .subscribe((res: any) => {
          this.isShipCompleteOrder =
            res?.body?.orderHistoryData[0]?.shipCompleteOrderFlag;
        });
    }

    this.storageService.getItem("userInfo")
      .pipe(take(1))
      .subscribe((res) => {
        this.userInfo = res;
        this.isShipToUser = res?.isShipToUser;
        this.soldToAccount = res?.orgUnit?.soldTo || "";
    });
  }

  getOrderSamplePriceSearch(item: any, key: string) {
    let styleDetails: any = [];
    if (item?.sizeOptions?.length > 0) {
      item?.sizeOptions.forEach((size: any) => {
        if(size?.value?.noCharge == false){
        styleDetails.push({
          styleNumber: item.sellingStyleId,
          productCategory: key,
          sizeCode: size.value?.sellingSizeId,
          backingCode: size.value?.sellingBackingId,
          sellingGroup: "",
          styleName: item.sellingStyleName,
          code: size.value?.code,
          colorNumber: size.value?.sellingColorId,
        });
      }
      });
    } else {
      if(item?.noCharge == false){
      styleDetails.push({
        styleNumber: item.sellingStyleId,
        productCategory: key,
        sizeCode: item.sellingSizeId,
        backingCode: item.sellingBackingId,
        sellingGroup: "",
        styleName: item.sellingStyleName,
        code: item.code,
        colorNumber: item.sellingColorId,
      });
    }
    }
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
      styleDetails: styleDetails,
    };
    item.spinnerLoading = true;
    this.serivice.getOrderSamplePriceSearch(payLoad).subscribe(
      (res: any) => {
        item.spinnerLoading = false;
        // size
        if (item?.sizeOptions?.length > 0) {
          res?.body?.result?.forEach((sizeRes: any) => {
            const findItem = item?.sizeOptions.find(
               (size: any) => size?.value?.sellingSizeId === sizeRes.size//size?.value?.sellingSizeDescription
            );
            if (findItem) {
              findItem.productPriceData = sizeRes;
              item.productPriceData = sizeRes;
            }
            // findItem.productPriceData = sizeRes;
            // item=findItem;
            // this.productPriceDetails = findItem.productPriceData
          });
        } else {
          item.productPriceData = res?.body?.result && res?.body?.result[0] || {};
         // this.productPriceDetails = res?.body?.result[0];
        }
        // this.productPriceDetails = item?.sizeOptions?.length > 0 
        // ? item.sizeOptions.map((size: any) => size.productPriceData) 
        // : item.productPriceData;
      },
      (err) => {
        item.productPriceData = {};
        item.spinnerLoading = false;
      }
    );
  }
  miniCartData: any;
  getShippingAddress() {
    let sub = this.storageService
      .getItem("defaultAddres")
      .subscribe((accountData: any) => {
        this.shippingAddress = accountData;
        sub.unsubscribe();
        let sub1 = this.serivice.getMiniCartData(this.uid).subscribe((miniCart: any) => {
          this.miniCartData = miniCart?.body;
          let rdd = miniCart?.body?.requestedDeliveryDate ? miniCart?.body?.requestedDeliveryDate : new Date();
          rdd = (rdd !== "See line details." ? rdd : this.datePipe.transform(new Date(), "MM/dd/YYYY"));
          this.shippingAddress = { ...this.shippingAddress, rdd: rdd, requestedDeliveryDate: rdd }
          sub1.unsubscribe();
        });
      });
  }
  onHideModal() {
 
    if (this.samplesInventoryCheckCounter > 0) {
      this.samplesInventoryCheckCounter = 0;
      this.serivice.progressHide();
    }
    this.modalService.hide("PlpOrderSamplesComponent");
  }

  ngOnDestroy() {
    if (this.samplesInventoryCheckCounter > 0) {
      this.samplesInventoryCheckCounter = 0;
      this.serivice.progressHide();
    }
  }

  value: boolean = true;
  onSelectItem(item: any, key: string, allSelect: boolean = false) {

    this.showSelectedItemsAlert = false;
    item.selected = item.selected === undefined ? true : !item.selected;
    if(allSelect){
      item.selected = true;
    }
    this.sampleType = "";
    this.value = !this.value;
    if (item.selected) {
      let productCode = item?.code;
      let quantityLenth = 10;
      this.quantityDropdownData = [];

      if (key == "Piece Samples") {
        quantityLenth = 10;
        this.sampleType = "PS";
      }

      if (key == "Architect Folders") {
        quantityLenth = 3;
        this.sampleType = "AF";
      }

      for (let a = 1; a <= quantityLenth; a++) {
        this.quantityDropdownData.push({ value: a, label: a });
      }
      item.quantityOptions = this.quantityDropdownData;
      item.quantity =
        item.quantity === undefined || item.quantity == ""
          ? this.quantityDropdownData[0].value
          : item.quantity;
      if (item?.sizeOptions?.length > 0) {
        item.size = item?.sizeOptions[0]?.value?.sellingSizeDescription;
      } else {
        item.size = item?.sellingSizeDescription;
      }
      // this.getProductVariantMatrix(productCode, item);
      // this.getProductPriceDetails(productCode);
      if (key != "Piece Samples") {
        this.samplesInventoryCheck(item, item.quantity);
      }
      if (key == "Architect Folders") {
        this.sampleType = "AF";
      }
      if (key == "Piece Samples") {
        this.sampleType = "PS";
      }
     // if (!item.noCharge) {
        this.getOrderSamplePriceSearch(item, key);
    //  } else {
        // item.spinnerLoading = false;
    //  }
    }
  }

  selectAllPieceSamples(){
    this.orderSamplesData[this.tabId].value.products.forEach((product:any) => {
      this.onSelectItem(product, "Piece Samples", true);
    });
  }

  getProductImage(imageurl: any) {
    let swatchImage = imageurl ? imageurl?.includes("https"):"https://s7d4.scene7.com/is/image/MohawkResidential/missing?$xchangeThumb$";

    return swatchImage? imageurl + "?$xchangeThumb$":"https://s7d4.scene7.com/is/image/MohawkResidential/missing?$xchangeThumb$";
  }

  orderSamplesData: any = [];
  getAllSamples() {
    // this.spinnerLoading = true;
    this.serivice.progressShow('getAllSamples', 'getAllSamplesId');
    this.serivice
      .getAllSamples(this.initialState?.productCode)
      .subscribe((res) => {
        this.serivice.progressHide('getAllSamplesId');
        this.spinnerLoading = false;
        this.sampleTempData=  res?.body?.sampleProducts || []
        this.orderSamplesData = JSON.parse(JSON.stringify(this.sampleTempData));
        this.orderSamplesData.forEach((el: any) => {
          el?.value?.products?.forEach((item: any) => {
            if (item?.sizeOptions?.length > 0) {
              item?.sizeOptions.forEach((d: any) => {
                d.value.sellingSizeDescription = d?.value
                  ?.sellingSizeDescription
                  ? d?.value?.sellingSizeDescription
                  : d?.value?.sellingSizeId;
              });
              item.size = item?.sizeOptions[0]?.value?.sellingSizeDescription;
            } else {
              item.sellingSizeDescription = item?.sellingSizeDescription
                ? item?.sellingSizeDescription
                : item?.sellingSizeId;
              item.size = item?.sellingSizeDescription
                ? item?.sellingSizeDescription
                : item?.sellingSizeId;
            }

            item.incoTerms =
              this.shippingAddress?.IncoTerms ||
              this.shippingAddress?.defaultIncoTerms;
            item.shippingCondition =
            this.userInfo.isCustomer === true || this.userInfo.isSalesPerson == true || this.userInfo.isSalesOps == true ? 
            this.shippingAddress?.originalDefaultShippingMethod ||
              this.shippingAddress?.defaultShippingMethod ||
              this.shippingAddress?.defaultShippingCondition ||
              this.shippingAddress?.shippingMethod ||
              this.shippingAddress?.shippingCondition ||
              this.shippingAddress?.defaultShippingConditionDesc ||
              "":
              this.shippingAddress?.defaultShippingMethod ||
              this.shippingAddress?.defaultShippingCondition ||
              this.shippingAddress?.shippingMethod ||
              this.shippingAddress?.shippingCondition ||
              this.shippingAddress?.defaultShippingConditionDesc ||
              "",
              // this.shippingAddress?.ShipVia ||
              // this.shippingAddress?.shipVia ||
              
            item.shipVia =
              this.shippingAddress?.shipVia ||
              this.shippingAddress?.defaultShipVia ||
              this.shippingAddress?.incoTermsLoc2;
            item.shippingWarehouse =
              this.shippingAddress?.shippingWarehouse ||
              this.shippingAddress?.defaultShippingWarehouse ||
              this.shippingAddress?.defaultShippingWarehouseDesc ||
              "";
            item.requestedDeliveryDate = this.datePipe.transform(
              this.shippingAddress?.rdd,
              "MM/dd/yyyy"
            );
          });
          if (el?.key == "Architect Folders") {
            this.selectedArchProd = el?.value?.products[0];
            // el.value.products[0].selected = true;
            el.selectedItem = el?.value?.products[0].code;
            this.onSelectItem(el?.value?.products[0], el?.key);
          }
          if(el?.key != "Architect Folders" && el?.value?.products && el?.value?.products.length == 1){
            this.onSelectItem(el?.value?.products[0], el?.key);
          }
        });
        this.orderSamplesData = this.orderSamplesData.filter(
          (item: any) =>
            (this.isCustomer &&
              (item?.key == "Architect Folders" ||
                item?.key == "Piece Samples")) ||
            !this.isCustomer
        );
      }, () => {        
        this.serivice.progressHide('getAllSamplesId');
      });
  }
  // checkCartAdded() {
  //   const filterData = this.orderSamples.filter(
  //     (item: any) => item.quantity != "" && item.quantity != null
  //   );
  //   return filterData.length == 0;
  // }
  addtoCartHandler(products: any) {
    this.alert.message = "";
    this.alert.show = false;
    if (
      this.storageService.cartData?.merchandisingProduct == true &&
      this.storageService.cartData?.sampleOrder == true &&
      this.storageService?.cartData.hasOwnProperty("code")
    ) {
      this.openConfirmationModal({
        title: "Headsup!",
        content:
          "Looks like a merchandising cart is active, adding this item to the cart will remove all the products in your current cart. Are you sure want to continue?",
        primaryActionLabel: "Continue",
        secondaryActionLabel: "Cancel",
        onPrimaryAction: () => this.clearCartAndAdd(products),
        onSecondaryAction: () => {
          this.modalService.hide("confirmationModal");
        },
      });
    } else if (
      this.storageService.cartData?.sampleOrder == false &&
      this.storageService?.cartData.hasOwnProperty("code")
    ) {
      this.openConfirmationModal({
        title: "Headsup!",
        content:
          "Looks like a non-sample cart is active, adding this sample to the cart will remove all the products in your current cart. Are you sure want to continue?",
        primaryActionLabel: "Continue",
        secondaryActionLabel: "Cancel",
        onPrimaryAction: () => this.clearCartAndAdd(products),
        onSecondaryAction: () => {
          this.modalService.hide("confirmationModal");
        },
      });
    } else {
      if (
        this.storageService.cartData?.sampleOrder == true &&
        this.storageService?.cartData.hasOwnProperty("code")
      ) {
        this.cartIdNew = this.storageService?.cartData?.code;
      }
      this.addToCartClick(products);
    }
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

  clearCartAndAdd(products: any) {
    this.modalService.hide("confirmationModal");
    // this.spinnerLoading = true;
    this.serivice.progressShow('removeCart', 'removeCartId');
    this.serivice
      .removeAllFromCart(
        this.storageService.cartData?.cartNumber ||
          this.storageService.cartData?.code
      )
      .subscribe((res: any) => {
        this.serivice.progressHide('removeCartId');
        if (res.status == 200) {
          this.serivice.getMiniCartData(this.uid).subscribe((res: any) => {
            this.storageService.setItem("miniCartCount", res?.body || res);
            this.cartIdNew = null;
            this.addToCartClick(products);
          });
        } else {
          this.alert.type = "danger";
          this.alert.message = res?.body || res?.error;
          this.alert.show = true;
          this.spinnerLoading = false;
        }
      }, () => {
        this.serivice.progressHide('removeCartId');
      });
  }
  isAddressReqHistory:boolean = true;
  addToCartClick(products: any) {
    let uppercaseProduct = "";
    if (
      this.initialState?.feetyardForm?.url &&
      this.initialState?.feetyardForm?.url != null &&
      this.initialState?.feetyardForm?.url != undefined
    ) {
      const url = this.initialState?.feetyardForm?.url;
      let firstValue = url?.split("/")[3];
      if((this.initialState?.feetyardForm?.categoryName).includes("INDOOR_OUTDOOR")){
        firstValue = url?.split("/")[1];
      } 
      uppercaseProduct = firstValue?.toUpperCase().replace(/[^\w]/g, "");
    }
    if (
      this.initialState?.feetyardForm?.originProductType &&
      this.initialState?.feetyardForm?.originProductType != null &&
      this.initialState?.feetyardForm?.originProductType != undefined
    ) {
      uppercaseProduct =
        this.initialState?.feetyardForm?.originProductType.toUpperCase();
    }
    let mockcartRequest: any;
    let totalSizeVariantList: any = [];
    let sizeProductCode: any;
    let selectProduct: any;
    products.map((itm: any) => {
      if (itm.selected) {
        selectProduct = itm;
        // totalSizeVariantList.push(itm.code);

        itm.sizeOptions?.forEach((sizeSpecProduct: any) => {
          // Check and assign productPriceData
          sizeSpecProduct.productPriceData =
            sizeSpecProduct?.productPriceData || {};
  
          if (sizeSpecProduct.value.sellingSizeDescription === itm.size) {
            itm.code = sizeSpecProduct.value.code;
            sizeProductCode = sizeSpecProduct.value.code;
            itm.productPriceData  = sizeSpecProduct?.productPriceData;
            totalSizeVariantList.push(sizeSpecProduct.value.code); // sellingSizeId
          }
        });
  
        // Ensure productPriceData is present for selected product
       // itm.productPriceData = sizeProductCode.productPriceData || {};


        // itm.sizeOptions?.map((sizeSpecProduct: any) => {
        // itm.productPriceData = sizeSpecProduct?.productPriceData ? sizeSpecProduct?.productPriceData : {};
        //   if (sizeSpecProduct.value.sellingSizeDescription === itm.size) {
        //     itm.code = sizeSpecProduct.value.code;
        //     sizeProductCode = sizeSpecProduct.value.code;
        //     totalSizeVariantList.push(sizeSpecProduct.value.code); //sellingSizeId
        //   }
        // });
      }
    });
    console.log("products---->",products,"products[0].productPriceData--dsfsadfsd",products.productPriceData)
 
    mockcartRequest = {
      addressCity:
        this.shippingAddress?.addressCity || this.shippingAddress?.town || "",
      addressCountry:
        this.shippingAddress?.oneTimeShippingAddress ||
        this.shippingAddress?.isOneTimeShipTo
          ? this.shippingAddress?.country?.isocode
          : this.shippingAddress?.country,
      addressLine1:
        this.shippingAddress?.addressLine1 || this.shippingAddress?.line1 || "",
      addressLine2:
        this.shippingAddress?.addressLine2 || this.shippingAddress?.line2 || "",
      addressName: this.shippingAddress?.addressName,
      addressPostalCode:
        this.shippingAddress?.addressPostalCode ||
        this.shippingAddress?.postalCode ||
        "",
      addressState:
        this.shippingAddress?.addressState ||
        this.shippingAddress?.region ||
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
      shipToUnit: this.shippingAddress?.oneTimeShippingAddress || this.shippingAddress?.isOneTimeShipTo
        ? "" : this.shippingAddress?.id || this.uid,
      soldTo: this.isShipToUser ? this.soldToAccount : this.uid,
      orderPlacedSite: "xchange",
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
      pdpProductCode: sizeProductCode ? sizeProductCode : selectProduct?.code,
      phoneNumber: "",
      purchaseOrderNumber: this.shippingAddress?.purchaseOrderNumber
        ? this.shippingAddress?.purchaseOrderNumber
        : "",
      replacementOrder: this.shippingAddress?.replacementOrder
        ? this.shippingAddress?.replacementOrder
        : false,
      replacementReason: this.shippingAddress?.replacementReason
        ? this.shippingAddress?.replacementReason
        : "",
      requestedDeliveryDate: this.datePipe.transform(
        this.shippingAddress?.rdd,
        "MM/dd/yyyy"
      ),
      sampleType: this.sampleType
        ? this.sampleType
        : this.shippingAddress?.sampleType
        ? this.shippingAddress?.sampleType
        : "",
      totalSizeVariantList: totalSizeVariantList,
      incoTerms:
        this.shippingAddress?.IncoTerms ||
        this.shippingAddress?.defaultIncoTerms,
        shippingCondition:  this.userInfo.isCustomer === true || this.userInfo.isSalesPerson == true || this.userInfo.isSalesOps == true ? 
        this.shippingAddress?.originalDefaultShippingMethod ||
          this.shippingAddress?.defaultShippingMethod ||
          this.shippingAddress?.defaultShippingCondition ||
          this.shippingAddress?.shippingMethod ||
          this.shippingAddress?.shippingCondition ||
          this.shippingAddress?.defaultShippingConditionDesc ||
          "":
          this.shippingAddress?.defaultShippingMethod ||
          this.shippingAddress?.defaultShippingCondition ||
          this.shippingAddress?.shippingMethod ||
          this.shippingAddress?.shippingCondition ||
          this.shippingAddress?.defaultShippingConditionDesc ||
          "",

      shipVia:
        this.shippingAddress?.shipVia ||
        this.shippingAddress?.defaultShipVia ||
        this.shippingAddress?.incoTermsLoc2,
      shippingWarehouse:
        this.shippingAddress?.shippingWarehouse ||
        this.shippingAddress?.defaultShippingWarehouse ||
        this.shippingAddress?.defaultShippingWarehouseDesc ||
        "",

      // incoTerms: this.shippingAddress.defaultIncoTerms,
      isMultiCut: false,
      item: [
        {
          dyeLot: this.initialState?.feetyardForm?.dye,
          feet:
            this.initialState?.productType === "Hard_Surface" ||
            (this.initialState.productType === "Soft_Surface" &&
              this.initialState.selectedProduct.subProductType ===
                "CARPETPRODUCT_CARPET_TILE")
              ? Number(0)
              : Number(this.initialState?.feetyardForm?.feet),
          inches:
            this.initialState?.productType === "Hard_Surface" ||
            (this.initialState.productType === "Soft_Surface" &&
              this.initialState.selectedProduct.subProductType ===
                "CARPETPRODUCT_CARPET_TILE")
              ? Number(0)
              : Number(this.initialState?.feetyardForm?.inches),
          productCode: this.initialState?.productCode,
          requestedUOM: this.initialState?.feetyardForm?.unit || "YDK",
          requestedQty: this.initialState?.feetyardForm?.requestedQty
            ? this.initialState?.feetyardForm?.requestedQty
            : this.initialState?.feetyardForm?.feet,
          maxFeet: 0,
          maxInches: 0,
          minFeet: 0,
          minInches: 0,
          rollPrices: true,
          solution: [],
         // productPriceData: this.productPriceDetails || {},
        },
      ],

      shippingInfo:
        this.shippingAddress?.oneTimeShippingAddress === false
          ? ""
          : {
              // acceptDate: this.shippingAddress.lastestacceptDate
              //   ? this.datePipe.transform(
              //       this.shippingAddress.lastestacceptDate,
              //       "MM/dd/yyyy"
              //     )
              //   : "",
              // apptNeeded: this.shippingAddress.appoinment,
              // forkLiftRequired: this.shippingAddress.accomodate,
              // jobSiteDelivery: this.shippingAddress.jobsiteDelivery,
              // largestTruckSize: this.shippingAddress.truckSize,
              // liftGateAndPallet: this.shippingAddress.liftGateAndPallet,
              // loadingDock: this.shippingAddress.loading,
              // location: this.shippingAddress.Location,
              // poleLiftRequired: this.shippingAddress.poleLift,
              // requireNotification: this.shippingAddress.notification,
              // siteContactName: this.shippingAddress.ContactName,
              // siteContactPhone: this.shippingAddress.Phone,
              // storeNumber: this.shippingAddress.storeNumber,
              // acknowledge: this.reactiveForm.value.storeNumber,
            },
      sampleProduct: true,
      shipComplete: this.shippingAddress?.oneTimeShippingAddress ||
      this.shippingAddress?.isOneTimeShipTo ? this.miniCartData?.shipComplete || this.storageService.cartData?.shipComplete || false : false,
      orderSamples:
      this.selectedTab == "Architect Folders"
  ? products
      .filter((itm: any) => itm.quantity && itm.selected)
      .map((itm: any) => ({
        ...itm,
        originProductType: uppercaseProduct || this.initialState?.originProductType,
        originSubProductType: this.initialState?.feetyardForm?.originSubProductType.toUpperCase() || this.initialState?.originSubProductType || this.initialState?.subProductType,
        noPrice: !(itm.productPriceData && Number(itm.productPriceData.priceEach) > 0), 
        productPriceData: itm.productPriceData || {},
      }))
  : products
      .filter((itm: any) => itm.selected)
      .map((itm: any) => ({
        ...itm,
        originProductType: uppercaseProduct || this.initialState?.originProductType,
         originSubProductType: this.initialState?.feetyardForm?.originSubProductType?.toUpperCase() || this.initialState?.originSubProductType || this.initialState?.subProductType,
        noPrice: !(itm.productPriceData && Number(itm.productPriceData.priceEach) > 0), 
        productPriceData: itm.productPriceData || {},
      })),
  };
    let userId = this.userService.getUserEmail().toLowerCase();
    let cartId = localStorage.getItem("cartId");

    this.alert.show = false;
    // this.spinnerLoading = true;
    this.serivice.progressShow('addToCart', 'addToCartId');
    console.log("mockcartRequest---->",mockcartRequest)
    this.serivice
      .addToCart(
        this.userService.getUserEmail().toLowerCase(),
        this.cartIdNew || null,
        mockcartRequest
      )
      .subscribe((res: any) => {
        this.serivice.progressHide('addToCartId');
        this.dataLayer.addToCart(
          "N/A",
          res?.body?.entries?.map((item: any, index: number) => {
            return {
              item_id: item?.productDetails?.code || "",
              item_name:
                item?.productDetails?.sellingStyleName ||
                item?.productDetails?.styleName ||
                "",
              index,
              item_brand:
                item?.productDetails?.brandName ||
                item?.productDetails?.brand ||
                item?.productDetails?.brandId ||
                "",
              item_category:
                item?.productDetails?.subCategoryCode ||
                item?.productDetails?.subProductType ||
                item?.productDetails?.subCategoryName ||
                "",
              item_category2:
                item?.productDetails?.productLine ||
                item?.productDetails?.collection ||
                "",
              item_category3:
                item?.productDetails?.styleName ||
                item?.productDetails?.sellingStyleName ||
                "",
              item_category4:
                item?.productDetails?.colorName ||
                item?.productDetails?.sellingColorName ||
                item?.productDetails?.color ||
                "",
              item_list_id: "",
              item_list_name: "",
              item_variant: `${
                item?.productDetails?.productLine ||
                item?.productDetails?.collection ||
                ""
              } ${
                item?.productDetails?.styleName ||
                item?.productDetails?.sellingStyleName ||
                ""
              }`,
              price: 0,
              quantity:
                Number(mockcartRequest?.orderSamples[index]?.quantity) || 1,
              uom: "EA",
              selected_uom: "EA",
            };
          }) || []
        );
        this.spinnerLoading = false;
        if (res?.body?.messages && res?.body?.messages[0]?.status == "Error") {
          this.alert.type = "danger";
          this.alert.show = true;
          this.alert.message = res?.body?.messages[0]?.message;
        } else {
          products.map((itm: any) => {
            itm.selected = false;
            itm.quantity = "1";
            itm.size = itm?.sellingSizeDescription || "";
          });
          this.orderSamplesData?.forEach((el: any) => {
            if (el?.key == "Architect Folders") {
              this.selectedArchProd = el?.value?.products[0];
              el.selectedItem = el?.value?.products[0]?.code;
              this.selectedArchProd.selected = false;
              this.onSelectItem(el?.value?.products[0], el?.key);
            }
          });
          this.showGotoCartBtn = true;
          this.alert.type = "success";
          this.alert.show = true;
          this.alert.message = "Successfully added sample to the cart.";
          this.spinnerLoading = false;
          this.serivice.getMiniCartData(this.uid).subscribe((res: any) => {
            let mincartData = res?.body || res;
            this.storageService.setItem("miniCartCount", res?.body || res);
            if(mincartData?.code){
              if(this.isAddressReqHistory && (this.shippingAddress?.oneTimeShippingAddress || this.shippingAddress?.isOneTimeShipTo)
                && (this.initialState?.isSuggestedAddress || this.initialState?.isInvalidAddress)){
                this.addressReqHistory(mincartData?.code);
                this.isAddressReqHistory = false;
              }
            }
          });
          setTimeout(() => {
            this.alert.type = "";
            this.alert.show = false;
            this.alert.message = "";
          }, 4000);
        }
      }),
      (err: any) => {
        this.serivice.progressHide('addToCartId');
        this.spinnerLoading = false;
      };
  }
  get f(): { [key: string]: AbstractControl } {
    return this.reactiveForm.controls;
  }

  addressReqHistory(cartNumber:any){
    let userAddress = this.userEnteredAddress();
    let payload = {                                                                                                     
      "RequestType": "modify",                                                                            
      "OrderNumber": +cartNumber || '',                                                                               
      "CartNumber": "",                                                                                
      "UserId": this.isShipToUser ? this.soldToAccount : this.uid,                                                                                
      "EmailId": this.userService.getUserEmail().toLowerCase() || '',
      "IsInvalidAddress": this.initialState?.isInvalidAddress || false,
      "IsSuggestedAddress": this.initialState?.isSuggestedAddress || false,
      "UserEnteredAddress": userAddress,
      "SystemSuggestedAddress": this.initialState?.isSuggestedAddress ? this.initialState?.addressErrorMsg : "",
      "SystemError": this.initialState?.isInvalidAddress ? this.initialState?.addressErrorMsg : "",
      "Website": "Xchange",
      "AccountType": "R"
    }
    this.serivice.addressReqHistory(payload).subscribe({
      next: (res: any) => {
      },
      error: (err: any) => {
      }
    });
}

  userEnteredAddress() {
    const addr = this.shippingAddress;
    if (!addr) return '';

    const line1 = addr?.addressLine1 || addr?.line1;
    const line2 = addr?.addressLine2 || addr?.line2;
    const city = addr?.city;
    const state = addr?.addressState || addr?.region;
    const zip = addr?.zipCode;

    const street = [line1, line2].filter(Boolean).join(', ');
    const location = `${city ? city + ', ' : ''}${state || ''} ${zip || ''}`;
    return `${street ? street + ', ' : ''}${location}`;
  } 

  onSubmit(): void {
    this.submitted = true;

    if (this.reactiveForm.invalid) {
      return;
    }
    // this.openOrderSamplesModal();
  }

  onReset(): void {
    this.submitted = false;
    this.reactiveForm.reset();
  }
  validateNo(e: any) {
    const charCode = e.which ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  continueShopping(modalId?: number) {
    this.modalService.hide(modalId);
    this.router.navigateByUrl(this.sidebarPath);
  }
  checkoutPage(modalId?: number) {
    this.modalService.hide(modalId);
    const url =
      this.router.url == "/"
        ? window.location.href
        : this.router.url.split("?")[0];
    const baseUrl = url.includes("commercial") ? "commercial" : "residential";
    this.router.navigateByUrl(baseUrl + "/cart");
  }
  disableAddtoCart(samples: any, key: any) {
    const selectedRecords = (samples || [])?.filter(
      (item: any) => item?.selected == true
    );
    const qtyFlag = !selectedRecords?.every((item: any) => Number(item?.quantity) > 0 && item?.size);
    const data = (samples || [])?.filter((item: any) => item?.quantity > 0);
    return key == "Architect Folders"
      ? data?.length == 0
      : (selectedRecords.length == 0 || (selectedRecords.length && qtyFlag));
    // return (
    //   data?.length !== selectedRecords.length || selectedRecords.length == 0
    // );
  }
  selectedItemsCount(samples: any) {
    const data = samples?.filter((item: any) => item?.selected == true);
    return data?.length;
  }
  quantityChange(val: any, product: any) {
    let quantity = Number(val) ? val : val?.target.value;
    this.samplesInventoryCheck(product, quantity);
  }
  avilableMessage = "";
  samplesInventoryCheck(product: any, requestedQty: any) {
    // product.spinnerLoading = true;
    this.avilableMessage = "";
    const productCode = product?.code;
    let soldTo = this.uid && this.uid.split("_");
    let payload = {
      zipcode:
        this.shippingAddress?.addressPostalCode ||
        this.shippingAddress?.postalCode,
      shippingWarehouse:
        this.shippingAddress?.defaultShippingWarehouse ||
        this.shippingAddress?.shippingWarehouse,
      shipTo: this.uid,

      soldTo: soldTo && soldTo[0],
      samples: [
        {
          productCode: productCode,
          requestedQty: requestedQty,
          requestUOM: "EA",
        },
      ],
    };
    
    this.samplesInventoryCheckCounter++;
    if (this.samplesInventoryCheckCounter === 1) {
      this.serivice.progressShow("samplesInventoryCheck", "samplesInventoryCheckId");
    }
    
    this.orderService
      .samplesInventoryCheck(payload)
      .pipe(
        finalize(() => {
          this.samplesInventoryCheckCounter = Math.max(0, this.samplesInventoryCheckCounter - 1);
          if (this.samplesInventoryCheckCounter === 0) {
            setTimeout(() => {
              this.serivice.progressHide("samplesInventoryCheckId");
            }, 100);
          }
        })
      )
      .subscribe(
        (response) => {
          // product.spinnerLoading = false;
          if (response?.body?.samples) {
            product.availableQuantity = Math.floor(
              response.body.samples[0].availableQuantity
            );
          }
          if (response?.body?.status === "Error") {
            product.avilableMessage = response.body?.message;
            this.avilableMessage = response.body?.message;
          }
        },
        () => {
          // product.spinnerLoading = false;
        }
      );
  }

  openLightBoxModal(event: Event, path: string) {
    event.stopPropagation();
    const initialState: ModalOptions = {
      initialState: {
        path: path,
      },
    };
    this.bsModalRef = this.modalService.show(
      XchangeImageViewLightBoxComponent,
      Object.assign(initialState, {
        class: "modal-lg modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }

  selectedArchProd: any;
  selectArcProduct(e: any, item: any) {
    item?.value?.products?.forEach((p: any) => {
      p.selected = undefined;
      if (p.code == e) {
        this.selectedArchProd = p;
        if (p?.sizeOptions) {
          if (p?.sizeOptions?.length > 0) {
            this.selectedArchProd.size =
              p?.sizeOptions[0]?.value?.sellingSizeDescription;
          }
        } else {
          this.selectedArchProd.size = p?.sellingSizeDescription;
          this.selectedArchProd.quantity = 1;
        }
        this.onSelectItem(p, item.key);
      }
    });
  }
  addtoLineHandler(products: any) {
    this.alert.message = "";
    this.alert.show = false;
    if (this.initialState?.postModificationOrders?.sampleOrder === false) {
      this.openConfirmationModal({
        title: "Restriction Alert",
        content: "Sample products cannot be added to standard orders.",
        primaryActionLabel: "Back to Order Details",
        secondaryActionLabel: "",
        onPrimaryAction: () => {
          this.modalService.hide("confirmationModal");
          this.router.navigate([
            "/residential/orders/orders-history-details/" +
              this.initialState.postModificationOrders.orderCode,
          ]);
          this.onHideModal();
        },
      });
    } else if (
      this.initialState?.postModificationOrders?.merchandisingProduct === true
    ) {
      this.openConfirmationModal({
        title: "Restriction Alert",
        content: "Sample products cannot be added to merchandising orders.",
        primaryActionLabel: "Back to Order Details",
        secondaryActionLabel: "",
        onPrimaryAction: () => {
          this.modalService.hide("confirmationModal");
          this.router.navigate([
            "/residential/orders/orders-history-details/" +
              this.initialState.postModificationOrders.orderCode,
          ]);
          this.onHideModal();
        },
      });
    } else {
      this.addtoLine(products);
    }
  }
  addtoLine(products: any) {
    this.spinnerLoading = true;
    let mockcartRequest;
    let totalSizeVariantList: any = [];
    let sizeProductCode: any;
    console.log("addtoLine----->", this.initialState.postModificationOrders);
    products.map((itm: any) => {
      if (itm.selected) {
        // totalSizeVariantList.push(itm.code);
        itm.sizeOptions?.map((sizeSpecProduct: any) => {
          if (sizeSpecProduct.value.sellingSizeDescription === itm.size) {
            itm.code = sizeSpecProduct.value.code;
            sizeProductCode = sizeSpecProduct.value.code;
            totalSizeVariantList.push(sizeSpecProduct.value.code); //sellingSizeId
          }
        });
      }
    });

    let payLoad = {
      orderCode: this.initialState.postModificationOrders.orderCode,
      shipComplete: this.isShipCompleteOrder,
      sampleProduct: true,
      lineItems: [
        {
          lineNumber: "",
          shippingCondition:
            this.initialState.postModificationOrders
              .postOrderShippingConditions ||
            this.storageService.cartData?.shippingCondition ||
            this.shippingAddress?.shippingConditions ||
            this.shippingAddress?.defaultShippingConditions ||
            this.shippingAddress?.defaultShippingMethod ||
            this.shippingAddress?.defaultShippingConditionDesc ||
            "",
          incoTerms:
            this.initialState.postModificationOrders?.postOrderIncoTerms ||
            this.shippingAddress?.IncoTerms ||
            this.shippingAddress?.defaultIncoTerms,
          shippingWarehouse:
            this.initialState.postModificationOrders
              ?.postOrderShippingWarehouse ||
            this.storageService?.cartData?.shippingWarehouse ||
            this.shippingAddress?.shippingWarehouse ||
            this.shippingAddress?.defaultShippingWarehouse ||
            this.shippingAddress?.defaultShippingWarehouseDesc ||
            "",
          requestedDeliveryDate:
            this.initialState.postModificationOrders
              ?.postOrderRequestedDeliveryDate,
          shipVia:
            this.initialState.postModificationOrders?.postOrderShipVia ||
            this.shippingAddress?.shipVia ||
            this.shippingAddress?.incoTermsLoc2 ||
            this.shippingAddress?.defaultShipVia,
          productCode: this.initialState?.productCode,
          solution: [],
          requestedQty: this.initialState?.feetyardForm.requestedQty,
          requestedUOM: this.initialState?.feetyardForm.unit,
          pdpProductCode: sizeProductCode,
          totalSizeVariantList: totalSizeVariantList,
          shipComplete: this.isShipCompleteOrder ?? true,
        },
      ],
      orderSamples: products.filter((itm: any) => itm.selected),
    };
    this.alert.show = false;
    this.spinnerLoading = true;
    this.prostModificationService.addLineOrAccessories(payLoad).subscribe({
      next: (res) => {
        this.spinnerLoading = false;
        if (res?.body?.messages[0].status == "Error") {
          this.alert.type = "danger";
          this.alert.message = res?.body?.messages[0].message;
          this.alert.show = true;
        } else {
          this.alert.type = "success";
          this.alert.message = res?.body?.messages[0].message;
          this.alert.show = true;
          this.orderSamplesData.filter((item: any) => {
            item?.value?.products?.filter((item: any) => {
              item.selected = false;
              item.quantity = this.quantityDropdownData[0].value;
            });
          });
        }
      },
      error: (err) => {
        this.spinnerLoading = false;
        this.alert.type = "danger";
        this.alert.message = err?.message || "error";
        this.alert.show = true;
      },
    });
  }

  backToOrderDetails() {
    this.router.navigate([
      "/residential/orders/orders-history-details/" +
        this.initialState.postModificationOrders.orderCode,
    ]);
    this.alert.type = "danger";
    this.alert.message = "";
    this.alert.show = false;
    this.onHideModal();
  }
  onSearchBy(event: any) {
    this.placeholder = event === 'Color #' ? 'Search by Color #' : 'Search by Color Name';
    this.searchkey = '';
    const originalList = this.sampleTempData[this.tabId]?.value?.products || [];
    this.orderSamplesData[this.tabId].value.products = JSON.parse(JSON.stringify(originalList));

   // this.onSearch('');
  }
  noResults: boolean = false;

  onSearch(event: any) {
   // this.spinnerLoading= true
    this.searchkey = event?.target?.value || '';
    const originalList = this.sampleTempData[this.tabId]?.value?.products || [];
    if (this.searchkey) {
     
        const searchValue = this.searchkey.toLowerCase();
        const filteredList = originalList.filter((data: any) =>
            this.searchBy === 'Color #'
                ? data?.sellingColorId?.toLowerCase().includes(searchValue)
                : data?.sellingColorName?.toLowerCase().includes(searchValue)
        );
        this.orderSamplesData[this.tabId].value.products = filteredList;
        this.cdr.detectChanges();
        
    } else {
        this.orderSamplesData[this.tabId].value.products = JSON.parse(JSON.stringify(originalList));
        this.cdr.detectChanges();
        

      }


}

inputEvent(e: any, product: any) {
  product.quantity = ((e?.target?.value <= product?.quantityOptions?.length) ? (e?.target?.value) : (product.quantity));  
}
}