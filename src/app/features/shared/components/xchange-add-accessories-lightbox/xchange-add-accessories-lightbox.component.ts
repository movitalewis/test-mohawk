import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { Config, Columns, DefaultConfig } from "ngx-easy-table";
import { ProductService } from "src/app/features/commercial/products/pages/services/product.service";
import {
  FormControl,
  FormGroup,
  Validators,
  FormBuilder,
} from "@angular/forms";
import { StorageService } from "src/app/features/http-services/storage.service";

import { Router } from "@angular/router";
import { Subscription, take } from "rxjs";
import { UserService } from "../../user/services/user.service";
import { DatePipe, Location } from "@angular/common";
import { ConfirmationDialogComponent } from "../confirmation-dialog/confirmation-dialog.component";
import { OrderService } from "src/app/features/residential/orders/services/order.service";
import { PostModificationProductService } from "src/app/features/commercial/post-modification/post-modification-products/post-modification-services/post-modification-product.service";
import { QuotesService } from "src/app/features/commercial/quotes/services/quotes.service";
@Component({
    selector: "xchange-add-accessories-lightbox",
    templateUrl: "./xchange-add-accessories-lightbox.component.html",
    styleUrls: ["./xchange-add-accessories-lightbox.component.scss"],
    standalone: false
})
export class XchangeAddAccessoriesLightboxComponent
  implements OnInit, OnDestroy
{
  modalRef?: BsModalRef;
  myForm!: FormGroup;
  enableButton: boolean = false;
  accountData: any;
  productDetails: any;
  shippingAddress: any;
  atpCheckData: any;
  solutionsValue: any;
  spinnerLoading: any = false;
  uid = "";
  @Input() type = 1;
  @Input() cartDataProductId: any;
  @Input() showSuccessAlert = true;
  @Input() showContinueShopping = true;
  buttonName: any;
  alertMessages = "";
  shippingInfoMessage: any;
  minicartSubscriptionForChange: any;
  shippingOptionChanged: any;
  @ViewChild("changeDeliveryType", { static: true })
  changeDeliveryType!: TemplateRef<any>;
  shipCompleteFlag!: boolean;
  isShipToUser:boolean = false;
  soldToAccount: any = "";
  onClose: Function = () => {};
  cartCount: any = 0;

  getQuoteAction = () => {};
  constructor(
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    public productService: ProductService,
    public postProductService: PostModificationProductService,
    private fb: FormBuilder,
    private router: Router,
    private cartService: ProductService,
    private storageService: StorageService,
    public userService: UserService,
    private _location: Location,
    private datePipe: DatePipe,
    private orderService: OrderService,
    private quotesService: QuotesService
  ) {
    this.getUrlparams();
    this.storageService.getItem("uid").subscribe((res) => {
      this.uid = res;
      // this.getCartValues();
    });
  }
  ngOnDestroy(): void {
    this.productSub.unsubscribe();
  }
  goBack() {
    this._location.back();
  }

  addAccessoriesModal(template1: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template1, {
      id: 1,
      class: "modal-xl modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }

  public configuration!: Config;
  public columns!: Columns[];

  public data = [
    {
      qty: "",
      productImage:
        "https://s7d4.scene7.com/is/image/MohawkResidential/SmartCushion_PSC1_P_3",
      description: "Smartcushion",
      size: "6Ft 00In",
      density: "",
      thickness: "",
      price: "N/A",
    },
    {
      qty: "",
      productImage: "https://s7d4.scene7.com/is/image/MohawkResidential/CW87_3",
      description: "Fresh Protector 7/16",
      size: "6Ft 00In",
      density: "",
      thickness: "",
      price: "N/A",
    },
    {
      qty: "",
      productImage: "https://s7d4.scene7.com/is/image/MohawkResidential/P61_3",
      description: "Viking Medium 7/16",
      size: "6Ft 00In",
      density: "",
      thickness: "",
      price: "N/A",
    },
  ];
  sidebarPath: any;
  cartAccessoriesData: any = {};
  selectedProduct: any;
  productSub: Subscription = new Subscription();
  currentPath: any;
  minicartData: any;
  cartData: any;
  shippingWarehouse: any;
  shippingCondition: any;
  shipVia: any;
  incoTerms: any;
  quantityDropdownData: any = [];
  userInfo: any;
  @ViewChild("shippingOption", { static: true })
  shippingOption!: TemplateRef<any>;
  selectedAccessories: any;
  sameDyeLot: boolean = false;
  public priceLabel: any;
  shippingOptionsAPIs = new Set<string>();
  // shippingOptionsAPIs: any = ["ShippingMethod", "IncoTerms", "WareHouse", "ShipVia"];
  ngOnInit(): void {
    this.userService.getCurrentUserDetail().subscribe((res: any) => {
      this.userInfo = res?.body;
      this.soldToAccount = res.body?.orgUnit?.soldTo || "";
      });
    this.storageService.getItem("userInfo").pipe(take(1)).subscribe((res) => {
      this.isShipToUser = res?.isShipToUser;
      this.priceLabel = res?.priceLabel;
    });
    this.cartData = this.storageService.cartData;
    // console.log("this.cartData 0=======>", this.cartData);
    // this.getMiniCart();
    for (let a = 1; a < 10; a++) {
      this.quantityDropdownData.push({ value: a, label: a });
    }
    this.sidebarPath = localStorage.getItem("path");
    this.cartAccessoriesData = this.modalService.config.initialState;
    this.selectedAccessories =
      this.cartAccessoriesData.selectedAccessories || null;
    this.type = this.cartAccessoriesData?.type || this.type;
    this.cartDataProductId =
      this.cartAccessoriesData?.cartDataProductId || this.cartDataProductId;
    this.cartData =
      this.cartAccessoriesData?.cartData || this.storageService.cartData;
    this.showSuccessAlert =
      this.cartAccessoriesData?.showSuccessAlert || this.showSuccessAlert;
    this.showContinueShopping =
      this.cartAccessoriesData?.showContinueShopping ||
      this.showContinueShopping;
    this.sameDyeLot = this.cartAccessoriesData?.sameDyeLot || false;

    this.initialFrom();
    if (
      this.showSuccessAlert ||
      this.cartAccessoriesData?.loadAllAccessoriesDetails
    ) {
      this.getAccessoryDetails();
    } else {
      this.getAllAccessoryDetails();
    }
    this.getProductDetails();

    /* if (this.cartAccessoriesData?.shippingAddress) {
      this.shippingAddress =
        this.cartAccessoriesData.shippingAddress ||
        this.cartAccessoriesData.cartData?.shippingAddress;
    } else {
      this.getShippingAddress();
    } */
    this.getShippingAddress();
    this.getAccountData();

    this.configuration = { ...DefaultConfig };
    this.configuration.checkboxes = false;
    this.productSub = this.storageService.getItem("item").subscribe((res) => {
      this.selectedProduct = res;
    });
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;
    this.configuration.rows = 50;
    const data: any = this.modalService.config.initialState;
  }
  modalRefs: BsModalRef[] = [];
  closeModal(modalId?: number) {
    const ids: number[] = this.modalService["loaders"].map(
      (l: any) => l.instance.id
    );
    for (const id of ids) {
      this.modalService.hide(id);
    }
    this.onClose()
    // this.modalService.hide(modalId);
  }
  getProductDetails() {
    this.storageService.getItem("item").subscribe((productDetails: any) => {
      this.productDetails = productDetails;
    });
  }
  getAccountData() {
    this.storageService
      .getItem("atpCheckData")
      .subscribe((accountData: any) => {
        this.accountData = accountData;
      });
  }
  getShippingAddress() {
    this.productService
          .getMiniCartData(this.storageService.uid)
          .subscribe((res: any) => {
          this.minicartData = res;
          let miniCartInfo = res?.body;
          this.shippingAddress = res?.body?.deliveryAddress;
          this.cartCount = res?.body?.totalItems || 0;
          if (
            res.body?.errorMessage?.includes("No Cart existed") ||
            res.body.totalItems == 0
          ) {
            this.shippingAddress = this.cartAccessoriesData.shippingAddress || this.cartAccessoriesData.cartData?.shippingAddress;
          }else{
            this.shipCompleteFlag = res?.body?.shipComplete;
            if(miniCartInfo?.hardProductShippingData && 
              Object.keys(miniCartInfo?.hardProductShippingData).length > 1){
                this.shippingAddress.defaultIncoTerms = miniCartInfo?.hardProductShippingData?.incoTerms;
                this.shippingAddress.defaultShipVia = miniCartInfo?.hardProductShippingData?.shipVia;
                this.shippingAddress.defaultShippingMethod = miniCartInfo?.hardProductShippingData?.shippingCondition;
                this.shippingAddress.defaultShippingWarehouse = miniCartInfo?.hardProductShippingData?.shippingWarehouse;
               this.shippingAddress.originalDefaultShippingMethod = this.userInfo.isCustomer  || this.userInfo.isSalesPerson || this.userInfo.isSalesOps ? miniCartInfo?.hardProductShippingData?.originalShippingCondition  : miniCartInfo?.hardProductShippingData?.shippingCondition;
            } else if(miniCartInfo?.softProductShippingData && 
              Object.keys(miniCartInfo?.softProductShippingData).length > 1){
                this.shippingAddress.defaultIncoTerms = miniCartInfo?.softProductShippingData?.incoTerms;
                this.shippingAddress.defaultShipVia = miniCartInfo?.softProductShippingData?.shipVia;
                this.shippingAddress.defaultShippingMethod = miniCartInfo?.softProductShippingData?.shippingCondition;
                this.shippingAddress.defaultShippingWarehouse = miniCartInfo?.softProductShippingData?.shippingWarehouse;
                 this.shippingAddress.originalDefaultShippingMethod = this.userInfo.isCustomer  || this.userInfo.isSalesPerson || this.userInfo.isSalesOps ? miniCartInfo?.softProductShippingData?.originalShippingCondition  : miniCartInfo?.softProductShippingData?.shippingCondition;
              }else{
                this.shippingAddress.defaultIncoTerms = miniCartInfo?.deliveryAddress?.defaultIncoTerms || this.shippingAddress?.defaultIncoTerms;
                this.shippingAddress.defaultShipVia = miniCartInfo?.deliveryAddress?.defaultShipVia || this.shippingAddress?.defaultShipVia;
                this.shippingAddress.defaultShippingMethod = miniCartInfo?.deliveryAddress?.defaultShippingMethod || this.shippingAddress?.defaultShippingMethod;
                this.shippingAddress.defaultShippingWarehouse = miniCartInfo?.deliveryAddress?.defaultShippingWarehouse || this.shippingAddress?.defaultShippingWarehouse;
              }
            this.storageService.setItem("shippingAddress",this.shippingAddress)
          }
        });
  }
  // getMiniCart() {
  //   // this.storageService.getItem("uid").subscribe((res) => {
  //   this.productService
  //     .getMiniCartData(this.storageService.uid)
  //     .subscribe((res: any) => {
  //       this.minicartData = res;
  //     });

  //   //  })
  // }
  getatpCheckData() {
    this.storageService
      .getItem("atpCheckData")
      .subscribe((atpCheckData: any) => {
        this.atpCheckData = atpCheckData;
      });
  }
  getSolutionsData() {
    this.storageService
      .getItem("solutionsValue")
      .subscribe((solutionsValue: any) => {
        this.solutionsValue = solutionsValue;
      });
  }

  accessoriesData: any = [];
  productCode: string = "";
  productCodeId: any;
  getAllAccessoryDetails() {
    if (this.type == 1) {
      let lastIndexOfUrl = this.router.url.split("/");
      this.productCode = lastIndexOfUrl[lastIndexOfUrl.length - 1];
    } else {
      this.productCode = this.cartDataProductId;
    }
    this.spinnerLoading = true;
    this.productService.progressShow('getAccessories', 'getAccessoriesId');
    this.productService
      .getAllAccessoryDetailsForPopup(this.productCode)
      .subscribe((res: any) => {
        this.productService.progressHide('getAccessoriesId');
        this.spinnerLoading = false;
        this.accessoryDetails = res?.body?.accessoryTypes || [];
        this.configuration.rows = this.accessoryDetails.length;
        this.setColumns();
      }),
      (err: any) => {
        this.productService.progressHide('getAccessoriesId');
        this.spinnerLoading = false;
        this.setColumns();
      };
  }
  accessoryDetails: any = [];
  // accessoryTypesData:any;

  setColumns() {
    const activeKey = this.activeTab || this.accessoryDetails?.[0]?.key;
    if (
      this.accessoryDetails &&
      (activeKey == "Floor" ||
        activeKey == "Installation")
    ) {
      this.columns = [
        { key: "qty", title: "Qty", cssClass:{ name: "qty-col", includeHeader: true} },
        { key: "colorImgURL", title: "Product Image" },
        { key: "partNumber", title: "Part #" },
        { key: "style", title: "Style #" },
        { key: "styleName", title: "Description" },
        { key: "colorName", title: "Color" },
        { key: "sizeName", title: "Size" },
        { key: "price", title: `Price (${this.priceLabel})` },
      ];
    } else if (activeKey == "Trim") {
      this.columns = [
        { key: "qty", title: "Qty", cssClass:{ name: "qty-col", includeHeader: true} },
        { key: "colorImgURL", title: "Product Image" },
        { key: "partNumber", title: "Part #" },
        { key: "style", title: "Style #" },
        { key: "styleName", title: "Description" },
        { key: "colorName", title: "Color" },
        { key: "sizeName", title: "Size" },
        { key: "unitsPerCaton", title: "Units Per Carton" },
        { key: "price", title: `Price (${this.priceLabel})` },
      ];
    } else {
      this.columns = [
        { key: "qty", title: "Qty", cssClass:{ name: "qty-col", includeHeader: true} },
        { key: "colorImgURL", title: "Product Image" },
        { key: "styleName", title: "Description" },
        { key: "sizeName", title: "Size" },
        { key: "density", title: "Density" },
        { key: "thickness", title: "Thickness" },
        { key: "price", title: `Price (${this.priceLabel})` },
      ];
    }

    if (this.accessoryDetails && activeKey == "Cushion") {
      let qtyObj = { key: "qty", title: "Qty (Rolls)", cssClass:{ name: "qty-col", includeHeader: true} };
      const index = this.columns.findIndex((item) => item.key === "qty");
      this.columns.splice(index, 1, qtyObj);
    }
  }
  activeTab: any;
  getAccessoryDetails() {
    if (this.type == 1) {
      let lastIndexOfUrl = this.router.url.split("/");
      this.productCode = lastIndexOfUrl[lastIndexOfUrl.length - 1];
    } else {
      this.productCode = this.cartDataProductId;
    }
    this.spinnerLoading = true;
    this.productService.progressShow('getAccessories', 'getAccessoriesId');
    this.productService
      .getAllAccessories(
        this.productCodeId == undefined ? this.productCode : this.productCodeId
      )
      .subscribe(
        (res: any) => {
          this.productService.progressHide('getAccessoriesId');
          this.spinnerLoading = false;
          this.accessoryDetails = res?.body?.accessoryTypes || [];
          if (this.accessoryDetails.length) {
            this.accessoryDetails.forEach((item: any) => {
              if (item?.value?.references.length) {
                item?.value?.references.map((ref: any) => {
                  ref._tabKey = item?.key;
                  ref.isLoading = true;
                  this.getAccessoriesPricing(ref);
                });
              }
            });
            this.activeTab = null;
            for (const item of this.accessoryDetails) {
              if (
                this.selectedAccessories &&
                this.selectedAccessories.includes(item.key)
              ) {
                this.activeTab = item.key;
                break;
              }
            }
            if (!this.activeTab && this.accessoryDetails.length > 0) {
              this.activeTab = this.accessoryDetails[0].key;
            }
          }
          this.setColumns();
        },
        (err: any) => {
          this.productService.progressHide('getAccessoriesId');
          this.spinnerLoading = false;
          this.setColumns();
          this.modalService.hide();
        }
      );
    // this.productService
    //   .allAccessoryDetails(this.cartAccessoriesData?.itemName, this.productCode)
    //   .subscribe((res: any) => {
    //     this.accessoryDetails = res?.body?.accessoryTypes || [];
    //     if (this.type == 1) {
    //       this.accessoryDetails.map((item: any) => {
    //         item.quantity = 0;
    //       });
    //     } else {
    //       this.accessoryDetails.map((item: any) => {
    //         item.value.references[0]["quantity"] = 0;
    //       });
    //     }
    //   });
  }
  selectedTeam = "";
  onSelected(value: string): void {
    this.selectedTeam = value;
  }
  initialFrom() {
    this.myForm = this.fb.group({
      qtyrolls: ["", Validators.required],
    });
    this.myForm.markAsUntouched();
  }
  get f() {
    return this.myForm.controls;
  }
  submitted: any = false;
  submit(myForm: any) {
    this.submitted = true;
    if (this.myForm.valid) {
      this.getAccessoryDetails();
      this.getAllAccessoryDetails();
    }
  }
  continue(modalId?: number) {
    this.modalService.hide(modalId);
    this.router.navigateByUrl(this.sidebarPath);
  }
  cartActiveButton = false;
  viewCartBtn:boolean = false;
  addtoCart() {
    if (
      this.storageService.cartData?.sampleOrder == true &&
      this.storageService?.cartData.hasOwnProperty("code")
    ) {
      this.openConfirmationModal({
        title: "Headsup!",
        content:
          "Looks like a sample cart is active, adding this Accessory to the cart will remove all the products in your current cart. Are you sure want to continue?",
        primaryActionLabel: "Continue",
        secondaryActionLabel: "Cancel",
        onPrimaryAction: () => this.clearCartAndAdd(),
        onSecondaryAction: () => {
          this.modalService.hide("confirmationModal");
        },
      });
    } else {
      if (this.cartAccessoriesData.postOrder === true) {
        this.updatePostOrder();
      } else {
        this.addtoCartDirct();
      }
    }
  }
  updatePostOrder() {
    this.spinnerLoading = true;
    let lastIndexOfUrl = this.router.url.split("/");
    let orderCode = lastIndexOfUrl[lastIndexOfUrl.length - 1];
    let currentDate = this.datePipe.transform(new Date(), "MM/dd/yyyy");
    let filteredData: any = [];
    this.accessoryDetails.forEach((item: any) => {
      filteredData = [
        ...filteredData,
        ...item?.value?.references.filter((ref: any) => ref?.quantity > 0),
      ];
    });
    const items: any = [];
    filteredData.forEach((item: any) => {
      items.push({
        productCode: item?.code,
        requestedQty: item.quantity,
        requestedUOM: (item?.erpProductCategory == "S" || item?._tabKey === "Cushion") && item?.rollOnly == true ? "RO" : item.inventoryUOM,
        shippingCondition: this.defaultShippingMethod || "",
        shippingWarehouse: this.defaultShippingWarehouse || "",
        shipVia: this.defaultShipVia || "",
        incoTerms: this.defaultIncoTerms || "",
        requestedDeliveryDate: currentDate || "",
        solution: [],
        lineNumber: "",
      });
    });

    let payLoad = {
      orderCode: this.cartAccessoriesData.cartData || orderCode,
      lineItems: items,
    };

    this.postProductService.addLineOrAccessories(payLoad).subscribe({
      next: (res: any) => {
        this.spinnerLoading = false;
        this.closeModal();
        if (this.router.url.includes("residential")) {
          this.router.navigate([
            "/residential/orders/orders-history-details/" +
              this.cartAccessoriesData.cartData,
          ]);
        } else {
          this.router.navigate([
            "/commercial/orders/orders-history-details/" +
              this.cartAccessoriesData.cartData,
          ]);
        }
        //  this.getUpdatedAccessories();
      },
      error: (err: any) => {
        this.spinnerLoading = false;
      },
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
          styleNumber: item?.style,
          productCategory: "",
          sizeCode: item?.size,
          backingCode: item?.sellingBackingId,
          sellingGroup: "",
          styleName: item?.styleName,
          code: item?.code,
          colorNumber: item?.color,
        },
      ],
    };
    return this.productService.getAccessoriesPricing(payLoad).subscribe(
      (resp: any) => {
        item.isLoading = false;
        item.priceDetails = resp?.body?.result?.length
          ? resp?.body?.result[0]
          : "";
        item.price = resp?.body?.result?.length
          ? resp?.body?.result[0]?.priceEach
          : "NA";
      },
      () => {
        item.isLoading = false;
      }
    );
  }

  clearCartAndAdd() {
    this.modalService.hide("confirmationModal");
    // this.spinnerLoading = true;
    this.productService.progressShow('cancelCart', 'cancelCartId');
    this.productService
      .removeAllFromCart(
        this.storageService.cartData?.cartNumber ||
          this.storageService.cartData?.code
      )
      .subscribe((res: any) => {
        this.productService.progressHide('cancelCartId');
        if (res.status == 200) {
          this.productService
            .getMiniCartData(this.uid)
            .subscribe((res: any) => {
              this.storageService.setItem("miniCartCount", res?.body || res);
              this.addtoCartDirct();
            });
        } else {
          this.spinnerLoading = false;
        }
      }, () => {
        this.productService.progressHide('cancelCartId');
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

  addtoCartDirct() {
    this.alertMessages = "";
    // this.spinnerLoading = true;

    let filteredData: any = [];
    // console.log("this dfhdjshfshjdfsdjhf---->",this.shippingAddress)
    this.accessoryDetails.forEach((item: any) => {
      filteredData = [
        ...filteredData,
        ...item?.value?.references.filter((ref: any) => ref?.quantity > 0),
      ];
    });
    const items: any = [];
    filteredData.forEach((item: any) => {
      items.push({
        feet: "",
        inches: "",
        productCode: item?.code,
        requestedQty: item.quantity,
        requestedUOM: (item?.erpProductCategory == "S" || item?._tabKey === "Cushion") && item?.rollOnly == true ? "RO" : item.inventoryUOM,
        shippingCondition: this.userInfo?.isCustomer || this.userInfo?.isSalesPerson  || this.userInfo?.isSalesOps ? this.shippingAddress?.originalDefaultShippingMethod ||this.shippingAddress?.defaultShippingCondition || this.shippingAddress?.defaultShippingMethod || "":this.shippingAddress?.defaultShippingMethod ||"",
        shippingWarehouse: this.shippingAddress?.defaultShippingWarehouse || "",
        shipVia: this.shippingAddress?.defaultShipVia || "",
        incoTerms: this.shippingAddress?.defaultIncoTerms || "",
        productPriceData: item?.priceDetails,
        sameDyeLot: this.sameDyeLot,
        solution: [],
      });
    });
    this.cartData = this.storageService.cartData;
    this.productService.progressShow('addToCart', 'addToCartId');
    const payLoad = {
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
      pdpProductCode: this.productCode,
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
      requestedDeliveryDate:
        this.datePipe.transform(this.shippingAddress?.rdd, "MM/dd/yyyy") ||
        this.datePipe.transform(
          this.shippingAddress?.requestedDeliveryDate,
          "MM/dd/yyyy"
        ) ||
        this.datePipe.transform(new Date(), "MM/dd/yyyy"),
      sampleProduct: this.shippingAddress?.sampleProduct
        ? this.shippingAddress?.sampleProduct
        : false,
      sampleType: this.shippingAddress?.sampleType
        ? this.shippingAddress?.sampleType
        : "",
      shippingCondition:
        this.userInfo?.isCustomer || this.userInfo?.isSalesPerson  || this.userInfo?.isSalesOps ? this.shippingAddress?.originalDefaultShippingMethod 
        || this.shippingAddress?.defaultShippingCondition  || this.shippingAddress?.defaultShippingMethod ||  this.defaultShippingMethod || "":
        this.shippingAddress?.defaultShippingMethod || this.defaultShippingMethod ||"",
      shippingWarehouse:
        this.shippingAddress?.defaultShippingWarehouse ||
        this.defaultShippingWarehouse ||
        "",
      shipVia:
        this.shippingAddress?.defaultShipVia || this.defaultShipVia || "",
      incoTerms:
        this.shippingAddress?.defaultIncoTerms || this.defaultIncoTerms || "",
      isMultiCut: false,
      item: items,
      reAtp: false,
      shipComplete: this.shipCompleteFlag ? true : false,
      isAccessoryCart: true,
      shippingInfo: {
        jobSite:
          this.cartData?.shippingInfo?.jobSite ||
          this.cartDataFromAPI?.shippingInfo?.jobSite || this.shippingAddress?.jobsiteDelivery,
        loadingDock:
          this.cartData?.shippingInfo?.loadingDock ||
          this.cartDataFromAPI?.shippingInfo?.loadingDock || this.shippingAddress?.loading,
        location:
          this.cartData?.shippingInfo?.location ||
          this.cartDataFromAPI?.shippingInfo?.location || this.shippingAddress?.Location,
        offloadEqptRequired:
          this.cartData?.shippingInfo?.offloadEqptRequired ||
          this.cartDataFromAPI?.shippingInfo?.offloadEqptRequired,
        requireNotification:
          this.cartData?.shippingInfo?.requireNotification ||
          this.cartDataFromAPI?.shippingInfo?.requireNotification || this.shippingAddress?.notification,
        siteContactName:
          this.cartData?.shippingInfo?.siteContactName ||
          this.cartDataFromAPI?.shippingInfo?.siteContactName || this.shippingAddress?.ContactName,
        siteContactPhone:
          this.cartData?.shippingInfo?.siteContactPhone ||
          this.cartDataFromAPI?.shippingInfo?.siteContactPhone || this.shippingAddress?.Phone,
        unLoadAssistance:
          this.cartData?.shippingInfo?.unLoadAssistance ||
          this.cartDataFromAPI?.shippingInfo?.unLoadAssistance,
        loadingDockDoorAvailable:
          this.cartData?.shippingInfo?.loadingDockDoorAvailable ||
          this.cartDataFromAPI?.shippingInfo?.loadingDockDoorAvailable,
        poleLiftRequired:
          this.cartData?.shippingInfo?.poleLiftRequired ||
          this.cartDataFromAPI?.shippingInfo?.poleLiftRequired,
        forkLiftRequired:
          this.cartData?.shippingInfo?.forkLiftRequired ||
          this.cartDataFromAPI?.shippingInfo?.forkLiftRequired,
        largestTruckSize:
          this.cartData?.shippingInfo?.largestTruckSize ||
          this.cartDataFromAPI?.shippingInfo?.largestTruckSize || this.shippingAddress?.truckSize,
        jobSiteDelivery:
          this.cartData?.shippingInfo?.jobSiteDelivery ||
          this.cartDataFromAPI?.shippingInfo?.jobSiteDelivery || this.shippingAddress?.jobsiteDelivery,
        liftGateAndPallet:
          this.cartData?.shippingInfo?.liftGateAndPalle ||
          this.cartDataFromAPI?.shippingInfo?.liftGateAndPalle || this.shippingAddress?.liftGateAndPallet,
        strapsNeeded:
          this.cartData?.shippingInfo?.strapsNeeded ||
          this.cartDataFromAPI?.shippingInfo?.strapsNeeded,
        acceptDate:
          this.cartData?.shippingInfo?.acceptDate ||
          this.cartDataFromAPI?.shippingInfo?.acceptDate || this.shippingAddress?.lastestacceptDate
          ? this.datePipe.transform(
              this.shippingAddress?.lastestacceptDate,
              "MM/dd/yyyy"
            )
          : undefined,
        apptNeeded:
          this.cartData?.shippingInfo?.apptNeeded ||
          this.cartDataFromAPI?.shippingInfo?.apptNeeded || this.shippingAddress?.appoinment,
        palletJack:
          this.cartData?.shippingInfo?.palletJack ||
          this.cartDataFromAPI?.shippingInfo?.palletJack || this.shippingAddress?.palletJack,
        storeNumber:
          this.cartData?.shippingInfo?.storeNumber ||
          this.cartDataFromAPI?.shippingInfo?.storeNumber || this.shippingAddress?.storeNumber,
      },
    };

    const cartNumber = this.cartData?.code || null;
    this.productService
      .addToCart(this.userService.getUserEmail().toLowerCase(), cartNumber, payLoad)
      .subscribe((res) => {
        this.productService.progressHide('addToCartId');
        let isError = (res?.body?.messages || []).some(
          (d: any) => d?.status == "Error"
        );

        if (isError) {
          this.spinnerLoading = false;
          (res?.body?.messages || []).filter((d: any) => {
            let msg = `${d?.id || ""}-${d?.number || ""}-${d?.message}. `;
            this.alertMessages = this.alertMessages + msg;
          });
          return;
        }
        this.spinnerLoading = false;
        this.showSuccessAlert = true;
        this.accessoryDetails = [];
        if (res?.body.hasOwnProperty("errorMessages") == false) {
          this.storageService.getItem("uid").subscribe((res) => {
            this.uid = res;
          });
          this.productService.getLatestMiniCart(this.uid);
        }
        if (cartNumber == null) {
          let cartData = {
            code: res.body?.cartNumber,
            entries: res.body?.entries,
          };
          this.storageService.setItem("miniCartCount", cartData);
          this.viewCartBtn = true;
        } else {
          this.cartActiveButton = true;
        }
      }, () => {
        this.productService.progressHide('addToCartId');
      });
  }
  toCheckNull: any;
  disableButtons = true;
  // quantityChange(data: any, event: any) {
  //   if (this.type == 1) {
  //     this.accessoryDetails.forEach((element: any) => {
  //       if (element?.code == data?.code) {
  //         element.quantity = Number(event);
  //       }
  //     });
  //   } else {
  //     this.accessoryDetails.forEach((element: any) => {
  //       if (
  //         element?.value.references[0]["code"] ==
  //         data?.value.references[0]["code"]
  //       ) {
  //         element.value.references[0]["quantity"] = Number(event);
  //       }
  //     });
  //   }

  //   let k = [];
  //   this.disableButtons = this.disableButtons =
  //     this.type == 1
  //       ? (k = this.accessoryDetails.filter((item: any) => item?.quantity > 0))
  //           .length == 0
  //       : (k = this.accessoryDetails.filter(
  //           (item: any) => item?.value.references[0]["quantity"] > 0
  //         )).length == 0;

  //   // value?.references[0].quantity
  // }

  requestFrom: any = "commercial";
  getUrlparams() {
    this.requestFrom = this.router.url.split("/")[1];
  }

  destroyAllpoups() {
    this.modalService.hide();
    // this.modalService.hide("XchangeAddAccessoriesLightboxComponent")
    // this.modalService.hide("AddCompanionProductsComponent")
    // this.modalService.hide("ChooseAddressLightboxComponent")
  }

  rediretToCart() {
    this.destroyAllpoups();
    let navigateURL = this.requestFrom + "/cart";
    // if ("/" + navigateURL == this.router.url) {
    //   this.router.navigateByUrl("/", { skipLocationChange: true }).then(() => {
    //     this.router.navigate([navigateURL]);
    //   });
    // } else {
    this.router.navigate([navigateURL]);
    // }
  }
  disableAddToCartBtn() {
    let filteredData: any = [];
    this.accessoryDetails.forEach((item: any) => {
      filteredData = [
        ...filteredData,
        ...item?.value?.references.filter(
          (ref: any) =>
            (ref?.quantity != null || ref?.quantity != undefined) &&
            Number(ref?.quantity) >= 0
        ),
      ];
    });

    let disableForInhouseAcc = (this.userInfo?.isSalesPerson || this.userInfo.isSalesOps) &&
    this.userInfo?.orgUnit?.inHouseAccount ? true : false;

    return !(
      filteredData?.every((n: any) => n?.quantity > 0) &&
      filteredData?.length > 0 && !disableForInhouseAcc
    );
  }

  checkValue(event: any, item: any) {
    const inputVal = event?.target?.value;
    const parsedVal = parseInt(inputVal, 10);
    if (
      isNaN(parsedVal) ||
      parsedVal < 0 ||
      parsedVal.toString() !== inputVal ||
      parsedVal === 0
    ) {
      item.quantity = null;
    } else {
      const newArr = this.quantityDropdownData.filter(
        (el: any) => el.value == parsedVal
      );
      item.quantity = newArr.length > 0 ? parsedVal : null;
    }
  }
  originalDefaultShippingMethod:any='';
  originalDefaultSM:any='';
  openShippingOptions() {
    // console.log("this.cartData.isQuote========>",this.cartData);
    if (this.cartData.isQuote) {
      this.addtoCartForQuote();
    } else {
      let filteredData: any = [];
      this.accessoryDetails.forEach((item: any) => {
        filteredData = [
          ...filteredData,
          ...item?.value?.references.filter((ref: any) => ref?.quantity > 0),
        ];
      });
      // this.spinnerLoading = true;
      
        let shippingAddress: any = null;
        this.storageService.getItem("shippingAddress").pipe(take(1)).subscribe((res) => {
          shippingAddress = res;
        this.defaultShippingMethod = shippingAddress?.defaultShippingMethod;
       
    this.productService.progressShow('getShippingOptions', 'getShippingOptionsId');
        this.orderService
          .getShippingOptions(
            false,
            this.productCode,
            this.shippingAddress?.id,
            this.userInfo.orgUnit.soldTo
          )
          .subscribe({
            next: (res) => {
              this.productService.progressHide('getShippingOptionsId');
              this.spinnerLoading = false;
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
                this.defaultIncoTerms = res.body.defaultIncoTerms;
                this.defaultIncoTermsDesc = res.body.defaultIncoTermsDesc;
  
                this.defaultShipVia = res.body.defaultShipVia;
                
                this.defaultShippingMethod = res.body.defaultShippingMethod;
                this.shippingWareHouseOptions = [];
                this.shippingWareHouseOptions.push({
                  value: res.body.defaultShippingWarehouse,
                  label:  res.body.defaultShippingWarehouseDesc,
                });
                this.incoTermsOptions.push({
                  value: res.body.defaultIncoTerms,
                  label:  res.body.defaultIncoTermsDesc,
                });
                this.incoTermsLoc2Options.push({
                  value: res.body.defaultShippingWarehouse,
                  label:  res.body.defaultShippingWarehouseDesc,
                });
                this.defaultShippingWarehouse = res.body.defaultShippingWarehouse;
               
                this.defaultShippingWarehouseDesc =
                  res.body.defaultShippingWarehouseDesc;
                
                  this.originalDefaultSM = res.body?.originalDefaultShippingMethod;
                  this.incoTermsSelectedOption =  this.incoTermsOptions[0]?.value || this.defaultIncoTermsDesc || 
                  this.shippingAddress?.defaultIncoTermsDesc;
                  this.incoTermsLoc2SelectedOption = res.body.defaultShipVia;
              this.modalRef = this.modalService.show(this.shippingOption, {
                id: "shippingOptionsModal",
                class: "modal-lg modal-dialog-centered",
                backdrop: "static",
                keyboard: false,
              });
            },
            error: (err) => {
              this.productService.progressHide('getShippingOptionsId');
              this.spinnerLoading = false;
            },
          });
        // this.openCrossModal(this.shippingOption)
        });
      
    }
  }

  closeChangeShippingOptionModal() {
    this.modalService.hide("changeShippingOptionsModal");
  }
  closeShippingOptionsModalModal() {
    // this.validateShipViaAddress()
    this.isShippingOptionsModalOpened = false;
    this.modalService.hide("shippingOptionsModal");
  }
  showValidationError: boolean = false;
  validationErrorMessage: any;
  cartDataFromAPI: any;
  validateShipViaAddress(type: any) {
    this.shippingOptionChanged = type;
    // this.spinnerLoading = true;
    console.log(
      "this.shipViaSelectedOption",
      this.shipViaSelectedOption,
      this.incoTermsLoc2SelectedOption
    );
    let shipViaSelectedOption =
      this.shipViaSelectedOption || this.defaultShippingMethod;

    let incoTermsLoc2SelectedOption = this.incoTermsLoc2SelectedOption === undefined ? '':
      this.incoTermsLoc2SelectedOption?.value ||
      this.incoTermsLoc2SelectedOption ||
      this.defaultShipVia || this.shippingAddress?.defaultShipVia;
    let incoTermsSelectedOption =
      this.incoTermsSelectedOption ||
      this.defaultIncoTerms ||
      this.shippingAddress?.defaultIncoTerms;
    let shippingWareHouseSelectedOption =
      this.shippingWareHouseSelectedOption ||
      this.defaultShippingWarehouse ||
      this.shippingAddress?.defaultShippingWarehouse;
    
    incoTermsLoc2SelectedOption = typeof incoTermsLoc2SelectedOption == "object"
      ? incoTermsLoc2SelectedOption?.label.toUpperCase()
      : incoTermsLoc2SelectedOption;
    let filteredData: any = [];
    this.accessoryDetails.forEach((item: any) => {
      filteredData = [
        ...filteredData,
        ...item?.value?.references.filter((ref: any) => ref?.quantity > 0),
      ];
    });
    const items: any = [];
    filteredData.forEach((item: any) => {
      items.push({
        productCode: item?.code,
      });
    });

    if(!this.userInfo.isCustomer  && !this.userInfo.isSalesPerson && !this.userInfo.isSalesOps){
      this.productService.progressShow('validateShippingOptions', 'validateShippingOptionsId');
      this.productService
      .getUOMDetails(items[0].productCode)
      .subscribe((result) => {
        let erpProductCategory = result?.body?.erpProductCategory;
        this.orderService
          .validateShippingOptions(
            shippingWareHouseSelectedOption,
            erpProductCategory,
            incoTermsLoc2SelectedOption
          )
          .subscribe({
            next: (res) => {
              this.productService.progressHide('validateShippingOptionsId');
              this.spinnerLoading = false;
              if (res.body.status === "success") {
                this.productService.progressShow('validateShipvia', 'validateShipviaId');
                this.orderService
                  .validateShipVia(
                    shipViaSelectedOption,
                    incoTermsLoc2SelectedOption
                  )
                  .subscribe({
                    next: (resp) => {
                      this.productService.progressHide('validateShipviaId');
                      if (resp.body.status === "success") {
                        this.populateShippingOptions();

                        if (type == "chooseSolution") {
                          this.spinnerLoading = true;
                          if (this.cartAccessoriesData.postOrder === true) {
                            this.addtoCart();
                            // this.onShippingOptionSubmit();
                            this.closeChangeShippingOptionModal();
                            this.closeShippingOptionsModalModal();
                          } else {
                            this.minicartSubscriptionForChange =
                              this.storageService
                                .getItem("miniCartCount")
                                .subscribe((res: any) => {
                                  this.minicartSubscriptionForChange.unsubscribe();
                                  if (
                                    res == undefined ||
                                    res == "" ||
                                    res.hasOwnProperty("errorMessage") ||
                                    res?.totalItems == 0
                                  ) {
                                    this.addtoCart();
                                    // this.onShippingOptionSubmit();
                                    this.closeShippingOptionsModalModal();
                                  } else {
                                    this.spinnerLoading = true;
                                    this.productService
                                      .getCartData(res.code)
                                      .subscribe({
                                        next: (result) => {
                                          this.spinnerLoading = false;
                                          this.cartDataFromAPI = result.body;
                                          let rdd = result?.body
                                            ?.requestedDeliveryDate
                                            ? result?.body
                                                ?.requestedDeliveryDate
                                            : new Date();
                                          rdd =
                                            rdd != "See line details."
                                              ? rdd
                                              : this.datePipe.transform(
                                                  new Date(),
                                                  "MM/dd/YYYY"
                                                );
                                          this.shippingAddress = {
                                            ...this.shippingAddress,
                                            rdd: rdd,
                                            requestedDeliveryDate: rdd,
                                          };
                                          this.storageService.setItem(
                                            "shipping-address",
                                            this.shippingAddress
                                          );
                                          this.storageService.setItem(
                                            "shippingAddress",
                                            this.shippingAddress
                                          );
                                          console.log(result.body);
                                          let defaultIncoTerms =
                                            result.body.incoTerms;
                                          let defaultShipVia =
                                            result.body.shipVia;
                                          let defaultShippingMethod =
                                            result.body.shippingConditions;
                                          let defaultShippingWarehouse =
                                            result.body.shippingWarehouse;
                                          if (
                                            defaultIncoTerms ==
                                              incoTermsSelectedOption &&
                                            defaultShipVia ==
                                              incoTermsLoc2SelectedOption &&
                                            defaultShippingMethod ==
                                              shipViaSelectedOption &&
                                            defaultShippingWarehouse ==
                                              shippingWareHouseSelectedOption
                                          ) {
                                            this.spinnerLoading = false;
                                            this.shipCompleteFlag =
                                              result?.body?.shipComplete;
                                            this.addtoCart();
                                            // this.onShippingOptionSubmit();
                                            this.closeShippingOptionsModalModal();
                                          } else {
                                            this.closeShippingOptionsModalModal();
                                            this.shippingOptionChanged = "chooseSolution";
                                            this.shippingInfoMessage =
                                              "Selected Shipping options are different from the items in your cart. Do you want to continue?";
                                            // else{
                                            // this.shippingInfoMessage="Saving this changes will impact your cart. Do you want to continue?"}

                                            this.modalRef =
                                              this.modalService.show(
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
                                          this.spinnerLoading = false;
                                        },
                                      });
                                  }
                                });
                          }
                        }
                        if (type == "changeShippingOption") {
                          this.originalDefaultShippingMethod = this.originalDefaultSM;
                          this.spinnerLoading = true;
                          if (this.cartAccessoriesData.postOrder === true) {
                            this.shippingOptionModalSubmit();
                          } else {
                            this.minicartSubscriptionForChange =
                              this.storageService
                                .getItem("miniCartCount")
                                .subscribe((res: any) => {
                                  this.minicartSubscriptionForChange.unsubscribe();
                                  if (
                                    res == undefined ||
                                    res == "" ||
                                    res.hasOwnProperty("errorMessage") ||
                                    res?.totalItems == 0
                                  ) {
                                    this.shippingOptionModalSubmit();
                                  } else {
                                    this.spinnerLoading = true;
                                    this.productService
                                      .getCartData(res.code)
                                      .subscribe({
                                        next: (result) => {
                                          this.spinnerLoading = false;
                                          this.cartDataFromAPI = result.body;
                                          console.log(result.body);
                                          let rdd = result?.body
                                            ?.requestedDeliveryDate
                                            ? result?.body
                                                ?.requestedDeliveryDate
                                            : new Date();
                                          rdd =
                                            rdd != "See line details."
                                              ? rdd
                                              : this.datePipe.transform(
                                                  new Date(),
                                                  "MM/dd/YYYY"
                                                );
                                          this.shippingAddress = {
                                            ...this.shippingAddress,
                                            rdd: rdd,
                                            requestedDeliveryDate: rdd,
                                          };
                                          this.storageService.setItem(
                                            "shipping-address",
                                            this.shippingAddress
                                          );
                                          this.storageService.setItem(
                                            "shippingAddress",
                                            this.shippingAddress
                                          );
                                          let defaultIncoTerms =
                                            result.body.incoTerms;
                                          let defaultShipVia =
                                            result.body.shipVia;
                                          let defaultShippingMethod =
                                            result.body.shippingConditions;
                                          let defaultShippingWarehouse =
                                            result.body.shippingWarehouse;

                                          if (
                                            defaultIncoTerms ==
                                              incoTermsSelectedOption &&
                                            defaultShipVia ==
                                              incoTermsLoc2SelectedOption &&
                                            defaultShippingMethod ==
                                              shipViaSelectedOption &&
                                            defaultShippingWarehouse ==
                                              shippingWareHouseSelectedOption
                                          ) {
                                            this.spinnerLoading = false;
                                            this.shipCompleteFlag =
                                              result?.body?.shipComplete;
                                            this.shippingOptionModalSubmit();
                                          } else {
                                            if (result.body?.shipComplete) {
                                              this.shippingInfoMessage =
                                                "Saving this changes will change " +
                                                "Ship Complete order" +
                                                " to " +
                                                "Ship Order Based on Availability" +
                                                " in your cart. Do you want to continue?";
                                              // else{
                                              // this.shippingInfoMessage="Saving this changes will impact your cart. Do you want to continue?"}

                                              this.modalRef =
                                                this.modalService.show(
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
                                              this.submitInfoChanges();
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
                        }
                        // console.log("res---->", res);
                        // this.showValidationError=false;
                        // this.closeModal()
                        // this.();
                        // this.closeChangeShippingOptionModal()
                      } else if (resp.body.status === "error") {
                        this.showValidationError = true;
                        this.validationErrorMessage = resp.body.message;
                      }
                    },
                    error: (err) => {
                      this.productService.progressHide('validateShipviaId');},
                  });
              } else if (res.body.status === "error") {
                this.showValidationError = true;
                this.validationErrorMessage = res.body.message;
                // this.openModalError(res.body.message);
              }
            },
            error: (err) => {
              this.productService.progressHide('validateShippingOptionsId');
            },
          });
      }, () => {        
        this.productService.progressHide('validateShippingOptionsId');
      });
    }else{
      this.originalDefaultShippingMethod= this.originalDefaultSM;
      this.populateShippingOptions();
      // this.spinnerLoading = true;
          if (this.cartAccessoriesData.postOrder === true) {
            this.addtoCart();
            // this.onShippingOptionSubmit();
            this.closeShippingOptionsModalModal();
          } else {
            this.minicartSubscriptionForChange =
              this.storageService
                .getItem("miniCartCount")
                .subscribe((res: any) => {
                  this.minicartSubscriptionForChange.unsubscribe();
                  if (
                    res == undefined ||
                    res == "" ||
                    res.hasOwnProperty("errorMessage") ||
                    res?.totalItems == 0
                  ) {
                    this.addtoCart();
                    // this.onShippingOptionSubmit();
                    this.closeChangeShippingOptionModal()
                    this.closeShippingOptionsModalModal();
                  } else {
                    this.spinnerLoading = true;
                    this.productService
                      .getCartData(res.code)
                      .subscribe({
                        next: (result) => {
                          this.spinnerLoading = false;
                          this.cartDataFromAPI = result.body;
                          let rdd = result?.body
                            ?.requestedDeliveryDate
                            ? result?.body
                                ?.requestedDeliveryDate
                            : new Date();
                          rdd =
                            rdd != "See line details."
                              ? rdd
                              : this.datePipe.transform(
                                  new Date(),
                                  "MM/dd/YYYY"
                                );
                          this.shippingAddress = {
                            ...this.shippingAddress,
                            rdd: rdd,
                            requestedDeliveryDate: rdd,
                          };
                          this.storageService.setItem(
                            "shipping-address",
                            this.shippingAddress
                          );
                          this.storageService.setItem(
                            "shippingAddress",
                            this.shippingAddress
                          );
                          console.log(result.body);
                          let defaultIncoTerms =
                            result.body.incoTerms;
                          let defaultShipVia =
                            result.body.shipVia;
                          let defaultShippingMethod =
                            result.body.shippingConditions;
                          let defaultShippingWarehouse =
                            result.body.shippingWarehouse;
                          if (
                            defaultIncoTerms ==
                              incoTermsSelectedOption &&
                            defaultShipVia ==
                              incoTermsLoc2SelectedOption &&
                            defaultShippingMethod ==
                              shipViaSelectedOption &&
                            defaultShippingWarehouse ==
                              shippingWareHouseSelectedOption
                          ) {
                            this.spinnerLoading = false;
                            this.shipCompleteFlag =
                              result?.body?.shipComplete;
                            this.addtoCart();
                            // this.onShippingOptionSubmit();
                            this.closeShippingOptionsModalModal();
                          } else {
                            this.closeShippingOptionsModalModal();
                            this.shippingOptionChanged="chooseSolution";
                            this.shippingInfoMessage =
                              "Selected Shipping options are different from the items in your cart. Do you want to continue?";
                            // else{
                            // this.shippingInfoMessage="Saving this changes will impact your cart. Do you want to continue?"}

                            this.modalRef =
                              this.modalService.show(
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
                          this.spinnerLoading = false;
                          this.productService.progressHide();
                        },
                      });
                  }
                });
          }
      // this.storageService
      //   .getItem("miniCartCount")
      //   .subscribe((res: any) => {
      //     this.minicartSubscriptionForChange.unsubscribe();
      //     if (
      //       res == undefined ||
      //       res == "" ||
      //       res.hasOwnProperty("errorMessage") ||
      //       res?.totalItems == 0
      //     ) {
      //       this.addtoCart();
      //       // this.onShippingOptionSubmit();
      //       this.closeShippingOptionsModalModal();
      //     }else{
      //       this.shipCompleteFlag =res?.shipComplete;
      //       this.addtoCart();
      //       this.closeShippingOptionsModalModal();
      //       this.closeChangeShippingOptionModal();
      //     }
      //   });
      
    }
  }

  disableShipVia(){
    if((this.userInfo?.isCustomer || this.userInfo?.isSalesPerson  || this.userInfo?.isSalesOps) 
          && (this.shippingAddress?.oneTimeShippingAddress || this.shippingAddress?.isOneTimeShipTo) && this.shipViaSelectedOption == "CA"){
            return false;
    }else if((this.userInfo?.isCustomer || this.userInfo?.isSalesPerson  || this.userInfo?.isSalesOps)){
      return true;
    }else {
      return false;
    }
  }
  
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
  defaultIncoTerms: any;
  defaultIncoTermsDesc: any;
  defaultShipVia: any;
  defaultShippingMethod: any;
  defaultShippingMethodDesc: any;
  defaultShippingWarehouse: any;
  defaultShippingWarehouseDesc: any;
  defaultShippingConditionDesc: any;
  populateShippingOptions() {
    let shipViaSelectedOption =
      this.shipViaSelectedOption ||
      this.defaultShippingMethod ||
      this.shippingAddress?.defaultShippingMethod ||
      this.shippingAddress?.defaultShippingCondition;
    let incoTermsLoc2SelectedOption =  this.incoTermsLoc2SelectedOption == undefined ? '':
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
    this.defaultShippingMethod =
      shipViaSelectedOption ||
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
    let updatedShippingAddress: any = {};
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
    updatedShippingAddress.defaultShippingCondition =
      this.defaultShippingMethod;
    updatedShippingAddress.defaultShippingMethod = this.defaultShippingMethod;
    updatedShippingAddress.defaultShippingConditionDesc =
      this.defaultShippingConditionDesc;
    updatedShippingAddress.defaultShippingMethodDesc =
      this.defaultShippingConditionDesc;

    updatedShippingAddress.defaultShippingWarehouseDesc =
      this.defaultShippingWarehouseDesc;
    updatedShippingAddress.defaultShippingWarehouse =
      this.defaultShippingWarehouse;

    updatedShippingAddress.defaultIncoTerms = this.defaultIncoTerms;
    updatedShippingAddress.defaultIncoTermsDesc = this.defaultIncoTermsDesc;

    updatedShippingAddress.defaultShipVia = this.defaultShipVia;

    this.shippingAddress = {
      ...this.shippingAddress,
      ...updatedShippingAddress,
    };
  }

  changeShippingWareHouseOptions(event: any) {
    this.shippingWareHouseSelectedOption = event;
    this.getIncoTermsLoc2(event);
  }

  // changeshipViaOptions(event: any) {
  //   this.shipViaSelectedOption = event;
  //   console.log(
  //     "shipViaSelectedOption",
  //     event,
  //     "shhhhhh--->",
  //     this.shipViaSelectedOption
  //   );

  //   this.getIncoTerms(event);
  //   const selectedShippingWHOption = this.shippingWareHouseOptions.find(
  //     (item: any) => item.value === this.shippingWareHouseSelectedOption
  //   );
  //   this.incoTermsLoc2SelectedOption = null;
  //   this.getIncoTermsLoc2SM(selectedShippingWHOption?.value);
  // }
  changeshipViaOptions(event: any) {
    // this.shippingWareHouseOptions = [];
    // this.shippingWareHouseOptions.push({
    //   value: this.defaultShippingWarehouse || this.shippingAddress?.defaultShippingWarehouse,
    //   label: this.defaultShippingWarehouseDesc || this.shippingAddress?.defaultShippingWarehouseDesc,
    // });
    this.shippingWareHouseSelectedOption = this.shippingWareHouseOptions[0].value;
    if (this.userInfo.isCustomer || this.userInfo.isSalesPerson || this.userInfo.isSalesOps) {
      this.spinnerLoading = false;

     

      this.orderService
        .getShippingoptionForCustomers(
          this.shippingAddress.postalCode,
          this.shipViaSelectedOption,
          this.shippingWareHouseSelectedOption,
          this.shippingAddress.isOneTimeShipTo === undefined? false: this.shippingAddress.isOneTimeShipTo,
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
                this.shippingWareHouseOptions = [];
                this.shippingWareHouseOptions.push({
                  value: res.body?.shippingWarehouse ||   this.defaultShippingWarehouse || this.shippingAddress?.defaultShippingWarehouse,
                  label: res?.body?.shippingWarehouseDesc || this.defaultShippingWarehouseDesc || this.shippingAddress?.defaultShippingWarehouseDesc,
                });
                this.shippingWareHouseSelectedOption = this.shippingWareHouseOptions[0].value

                this.incoTermsLoc2Options =[];
                this.incoTermsLoc2Options.push({
                  value:res.body.shipvia,
                  label:res.body.shipvia
                })
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
              preferred: resObject[key].preferred,
            });
          });
        },
        error: (err) => {},
      });
  }
  // shippingOptionsModal(template: TemplateRef<any>) {
  //   this.shippingWareHouseOptions = [];

  //   this.shippingWareHouseSelectedOption =
  //     this.shippingWareHouseSelectedOption ||
  //     this.defaultShippingWarehouse ||
  //     this.shippingAddress?.defaultShippingWarehouse;
  //   this.shipViaOptions = [];

  //   this.productService
  //     .getShippingMethodWithOutFlag(
  //       this.shippingAddress?.postalCode,
  //       this?.shippingAddress?.isOneTimeShipTo,
  //       this.userInfo?.isCustomer === undefined ||
  //         this.userInfo?.isCustomer === false
  //         ? false
  //         : true,
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
  //         this.shipViaSelectedOption ||
  //         this.defaultShippingMethod ||
  //         this.shipViaOptions[0].value ||
  //         this.shippingAddress?.defaultShippingMethod;

  //       this.getIncoTerms(this.shipViaSelectedOption);
  //       this.incoTermsSelectedOption =
  //         this.incoTermsSelectedOption ||
  //         this.defaultIncoTerms ||
  //         this.shippingAddress?.defaultIncoTerms ||
  //         this.incoTermsOptions[0].value;
  //       this.shippingAddress?.defaultIncoTerms ||
  //         this.incoTermsOptions[0].value;

  //       this.productService
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

  //           this.incoTermsLoc2SelectedOption =
  //             this.incoTermsLoc2SelectedOption.label ||
  //             this.incoTermsLoc2SelectedOption ||
  //             this.defaultShipVia ||
  //             this.shippingAddress?.defaultShipVia;

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
  // shippingOptionsModal(template: TemplateRef<any>) {
  //   this.shippingWareHouseOptions = [];

  //   this.shippingWareHouseSelectedOption = this.defaultShippingWarehouse ||
  //     this.shippingAddress?.defaultShippingWarehouse || "";
  //   this.shipViaOptions = [];
  //   this.spinnerLoading = true;
  //   this.shipViaSelectedOption = this.defaultShippingMethod || 
  //      this.shippingAddress?.defaultShippingMethod ||
  //       this.shipViaOptions[0]?.value;
  //   this.productService.getShippingMethodWithOutFlag(
  //     this.shippingAddress.postalCode,
  //     this.shippingAddress.isOneTimeShipTo,
  //     this.userInfo.isCustomer || this.userInfo.isSalesPerson,
  //     this.shipViaSelectedOption
  //   ).subscribe((res: any) => {
  //     if (res?.body) {
  //       this.shipViaOptions = [];
  //       for (let key of Object.entries(res?.body)) {
  //         this.shipViaOptions.push({
  //           value: key[0],
  //           label: key[1],
  //         });
  //       }
  //     }
  //     if (this.userInfo.isCustomer || this.userInfo.isSalesPerson) {
  //       this.spinnerLoading = false;
  //       this.shipViaSelectedOption = this.defaultShippingMethod || 
  //         this.shippingAddress?.defaultShippingMethod ||
  //         this.shipViaOptions[0]?.value;
       
  //       this.shippingWareHouseOptions = [];
  //       this.shippingWareHouseOptions.push({
  //         value: this.shippingAddress?.defaultShippingWarehouse,
  //         label: this.shippingAddress?.defaultShippingWarehouseDesc,
  //       });
  //       this.orderService
  //         .getShippingoptionForCustomers(
  //           this.shippingAddress.postalCode,
  //           this.shipViaSelectedOption,
  //           this.shippingWareHouseSelectedOption,
  //           this.shippingAddress.isOneTimeShipTo,
  //           ''
  //         )
  //         .subscribe({
  //           next: (res) => {
  //             this.spinnerLoading = false;
  //             this.originalDefaultShippingMethod = res.body?.originalDefaultShippingMethod;
  //             this.incoTermsOptions = [];
  //             this.incoTermsOptions.push({
  //               value: res.body.incoTerms,
  //               label: res.body.incoTermsDesc,
  //             });
  //             this.incoTermsSelectedOption =  this.incoTermsOptions[0]?.label || this.defaultIncoTermsDesc || 
  //             this.shippingAddress?.defaultIncoTermsDesc;
  //             this.originalDefaultShippingMethod = res.body?.originalDefaultShippingMethod;
  //             this.incoTermsLoc2SelectedOption = res.body.shipvia;
  //           },
  //           error: (err) => {
  //             this.spinnerLoading = false;
  //           },
  //         });
  //     }
  //     if (!this.userInfo.isCustomer || this.userInfo.isSalesPerson) {
  //       this.spinnerLoading = false;
  //       this.shipViaSelectedOption = this.defaultShippingMethod || 
  //         this.shippingAddress?.defaultShippingMethod ||
  //         this.shipViaOptions[0]?.value;

  //       this.getIncoTerms(this.shipViaSelectedOption);
  //       this.incoTermsSelectedOption = this.defaultIncoTerms ||
  //         this.shippingAddress?.defaultIncoTerms ||
  //         this.incoTermsOptions[0]?.label;

  //       this.productService.getShippingWareHouseWithOutFlag().subscribe(
  //         (res: any) => {
  //           if (res?.body) {
  //             this.shippingWareHouseOptions = [];
  //             for (let key of Object.entries(res?.body)) {
  //               this.shippingWareHouseOptions.push({
  //                 value: key[0],
  //                 label: key[1],
  //               });
  //             }
  //           }

  //           this.incoTermsLoc2SelectedOption = this.defaultShipVia || 
  //             this.shippingAddress?.defaultShipVia;
  //           this.getIncoTermsLoc2(this.shippingWareHouseSelectedOption);
  //           this.incoTermsSelectedOption = this.defaultIncoTerms ||
  //             this.shippingAddress?.defaultIncoTerms ||
  //             this.incoTermsOptions[0]?.label;
  //         }
  //       );
  //     }
  //     this.modalRef = this.modalService.show(template, {
  //       id: "changeShippingOptionsModal",
  //       class: "modal-lg modal-dialog-centered",
  //       backdrop: "static",
  //       keyboard: false,
  //     });
  //   });
  // }
  shippingOptionTemplate!: TemplateRef<any>;
  shippingOptionsModal(template: TemplateRef<any>) {
    // this.spinnerLoading = true;
    this.shippingOptionTemplate = template;
    this.shippingOptionsAPIs.clear();
    this.shippingWareHouseOptions = [];
    this.productService.progressShow('getShippingOptions', 'getShippingOptionsId');

    this.shippingWareHouseSelectedOption = this.defaultShippingWarehouse ||
      this.shippingAddress?.defaultShippingWarehouse || "";
    this.shipViaOptions = [];
    this.shipViaSelectedOption = this.defaultShippingMethod || 
       this.shippingAddress?.defaultShippingMethod ||
        this.shipViaOptions[0]?.value;
    this.productService.getShippingMethodWithOutFlag(
      this.shippingAddress.postalCode,
      this.shippingAddress?.oneTimeShippingAddress || this.shippingAddress?.isOneTimeShipTo
      ? true
      : false,
      this.userInfo.isCustomer || this.userInfo.isSalesPerson || this.userInfo?.isSalesOps,
      this.shipViaSelectedOption
    ).subscribe((res: any) => {
      this.setLoadAPI('ShippingMethod');
      // this.productService.progressHide('getShippingOptionsId');
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
       
       
        this.orderService
          .getShippingoptionForCustomers(
            this.shippingAddress.postalCode,
            this.shipViaSelectedOption,
            this.shippingWareHouseSelectedOption,
            this.shippingAddress.isOneTimeShipTo == undefined? false:this.shippingAddress.isOneTimeShipTo,
           this.uid
          )
          .subscribe({
            next: (res) => {
              this.setLoadAPI('ShippingMethod', 1);
              this.spinnerLoading = false;
              this.originalDefaultSM = res.body?.originalDefaultShippingMethod;

              this.shippingWareHouseOptions = [];
              this.shippingWareHouseOptions.push({
                value: res.body?.shippingWarehouse ||   this.shippingAddress?.defaultShippingWarehouse,
                label: res?.body?.shippingWarehouseDesc || this.shippingAddress?.defaultShippingWarehouseDesc,
              });
              this.shippingWareHouseSelectedOption = this.shippingWareHouseOptions[0].value


              this.incoTermsOptions = [];
              this.incoTermsOptions.push({
                value: res.body.incoTerms,
                label: res.body.incoTermsDesc,
              });

              this.incoTermsLoc2Options = [];
              this.incoTermsOptions.push({
                value: res.body.shipvia,
                label: res.body.shipvia,
              });
              this.incoTermsSelectedOption =  this.incoTermsOptions[0].value;
              this.incoTermsLoc2SelectedOption = res.body.shipvia;
            },
            error: (err) => {
              this.setLoadAPI('ShippingMethod', 1);
              this.spinnerLoading = false;
            },
          });
      }
      if (!this.userInfo.isCustomer && !this.userInfo.isSalesPerson && !this.userInfo.isSalesOps) {
        this.spinnerLoading = false;
        this.shipViaSelectedOption = this.defaultShippingMethod || 
          this.shippingAddress?.defaultShippingMethod ||
          this.shipViaOptions[0]?.value;

        this.getIncoTerms(this.shipViaSelectedOption);
        this.incoTermsSelectedOption = this.defaultIncoTerms ||
          this.shippingAddress?.defaultIncoTerms ||
          this.incoTermsOptions[0]?.value;

        this.productService.getShippingWareHouseWithOutFlag().subscribe(
          (res: any) => {
              this.setLoadAPI('WareHouse');
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
          },()=>{this.setLoadAPI('WareHouse');}
        );
      }
      // this.modalRef = this.modalService.show(template, {
      //   id: "changeShippingOptionsModal",
      //   class: "modal-lg modal-dialog-centered",
      //   backdrop: "static",
      //   keyboard: false,
      // });
    }, () => {
      this.setLoadAPI('ShippingMethod', 1);
      // this.productService.progressHide();
    });
  }
  changeincoTermsOptions(event: any) {
    this.incoTermsSelectedOption = event;
  }
  getIncoTerms(shipVia: any) {
    this.incoTermsOptions = [];
    this.orderService.getIncoTerms(shipVia).subscribe({
      next: (res) => {
        this.setLoadAPI('IncoTerms');
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
      error: (err) => {
        this.setLoadAPI('IncoTerms');
      },
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
          this.setLoadAPI('ShipVia');
          const resObject = res?.body;
          const objectKeys = Object.keys(resObject).sort();
          objectKeys.forEach((key) => {
            this.incoTermsLoc2Options.push({
              value: resObject[key].shipvia,
              label: resObject[key].shipvia,
              preferred: resObject[key].preferred,
            });
          });
          // if (this.incoTermsLoc2Options.length === 0) {
          //   this.incoTermsLoc2Options.push({
          //     value: this.shippingAddress?.defaultShipVia,
          //     label: this.shippingAddress?.defaultShipVia,
          //   });
          // }
        },
        error: (err) => {this.setLoadAPI('ShipVia');},
      });
  }
  keyPressNumbers(e: KeyboardEvent) {
    let event: any = e.target;
    let value = event.value + e.key;
    return /^[0-9]$/i.test(e.key) && Number(value) <= 999;
  }

  submitInfoChanges() {
    this.modalService.hide("changeDeliveryType");
    this.closeChangeShippingOptionModal();
    this.validateShipViaAddress("chooseSolution");
  }

  closeInfoChanges() {
    this.modalService.hide("changeDeliveryType");
    this.closeChangeShippingOptionModal();
  }

  continueChanges() {
    if (this.shippingOptionChanged == "chooseSolution") {
      this.modalService.hide("changeDeliveryType");
      this.closeShippingOptionsModalModal();
      this.shipCompleteFlag = false;
      this.closeChangeShippingOptionModal();
      this.addtoCart();
      // this.validateShipViaAddress("chooseSolution");
      // this.onShippingOptionSubmit();
    }
    if (this.shippingOptionChanged == "changeShippingOption") {
      this.submitInfoChanges();
    }
  }

  getTabHeadingName(item: any): string {
    if (item?.key === 'Trim' && this.requestFrom === 'commercial') {
      return 'Wall Base Trim';
    }
    return item?.key;
  }

  navigateToPDP(code:any){
    this.closeModal();
    this.router.navigate(["commercial/products/details/" + code]);
  }

  addtoCartForQuote() {
    // console.log("this.cartData 1======>",this.cartData.isQuote);
    let filteredData: any = [];
    this.accessoryDetails.forEach((item: any) => {
      filteredData = [
        ...filteredData,
        ...item?.value?.references.filter((ref: any) => ref?.quantity > 0),
      ];
    });
    // this.spinnerLoading = true;

    let payload = {
      cartCode: this.cartData?.code,
      accessories: filteredData?.map((d: any) => {
        return {
          productCode: d?.code,
          uom: d?.inventoryUOM,
          quantity: d?.quantity,
        };
      }),
    };
    this.productService.progressShow('addToQuote', 'addToQuoteId');
    this.quotesService.addMultiAccessoriesToQuoteCart(payload).subscribe(
      (res: any) => {
        this.productService.progressHide('addToQuoteId');
        this.scrollTop();
        this.spinnerLoading = false;
        if (
          res?.body?.messages &&
          (res?.body?.messages[0]?.status === "00001" ||
            res?.body?.messages[0]?.status?.toLowerCase() == "error")
        ) {
          this.showSuccessAlert = true;
          this.stopAlert();
          this.storageService.getItem("uid").subscribe((res) => {
            this.uid = res;
          });
          this.productService.getLatestMiniCart(this.uid);
          this.getQuoteAction();
        } else {
          this.showSuccessAlert = true;
          this.stopAlert();
          this.storageService.getItem("uid").subscribe((res) => {
            this.uid = res;
          });
          this.productService.getLatestMiniCart(this.uid);
          this.getQuoteAction();
          this.spinnerLoading = false;
        }
      },
      (err: any) => {
        this.productService.progressHide('addToQuoteId');
        this.spinnerLoading = false;
        this.showSuccessAlert = true;
      }
    );
  }

  scrollTop() {
    let top = document.getElementById("scrollTop");
    if (top !== null) {
      top.scrollIntoView();
      top = null;
    }
  }

  stopAlert() {
    setTimeout(() => {
      this.showSuccessAlert = false;
    }, 8000);
  }
  isShippingOptionsModalOpened: boolean = false;
  setLoadAPI(apiName: any, apiLength: number = 4) {
    this.shippingOptionsAPIs.add(apiName);
    if (this.shippingOptionsAPIs.size >= apiLength && !this.isShippingOptionsModalOpened) {
      this.productService.progressHide('getShippingOptionsId');
      this.modalRef = this.modalService.show(this.shippingOptionTemplate, {
        id: "shippingOptionsModal",
        class: "modal-lg modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      });
      this.isShippingOptionsModalOpened = true;
    }
  }
}
