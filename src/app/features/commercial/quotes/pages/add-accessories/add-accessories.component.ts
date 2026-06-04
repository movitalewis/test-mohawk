import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { QuotesService } from "../../services/quotes.service";
import { BsModalRef, BsModalService,ModalOptions } from "ngx-bootstrap/modal";
import { Subscription, take } from "rxjs";
import { Config, Columns, DefaultConfig } from "ngx-easy-table";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { StorageService } from "src/app/features/http-services/storage.service";
import { NgSelectComponent } from "@ng-select/ng-select";
import { Router } from "@angular/router";
import { ProductService } from "../../../products/pages/services/product.service";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { ProgressModalComponent } from "src/app/features/shared/components/progress-modal/progress-modal.component";
import { MESSAGE_CONSTANTS } from "src/app/features/shared/constants/MESSAGE-CONSTANTS";
@Component({
    selector: "app-add-accessories",
    templateUrl: "./add-accessories.component.html",
    styleUrls: ["./add-accessories.component.scss"],
    standalone: false
})
export class AddAccessoriesComponent implements OnInit {
  buttonName: any;
  public configuration!: Config;
  public columns!: Columns[];
  quantityDropdownData: any = [];
  cartData: any;
  alertData: any = {
    message: "success",
  };
  alertType: any = "success";
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
  userInfo: any = "";
  alertTrigger: any = false;
  cartNumber: any;
  productData: any;
  navigateToCheckoutAfter: any;
  isButtonDisabled: boolean = false;
  @Input() type = 1;
  @Input() cartDataProductId: any;
  @Input() showSuccessAlert = false;
  @Input() showContinueShopping = true;
  getUpdatedAccessories = () => { };
  selectedAccessories:any;

  constructor(
    private quotesService: QuotesService,
    public bsModalRef: BsModalRef,
    private storageService: StorageService,
    private fb: FormBuilder,
    private router: Router,
    private modalService: BsModalService,
    public productService: ProductService,
    public userService: UserService,
  ) {
    this.getUrlparams();
    this.storageService.getItem("uid").subscribe((res) => {
      this.uid = res;
      // this.getCartValues();
    });
    this.storageService.getItem("userInfo").pipe(take(1)).subscribe((res) => {
      this.userInfo = res;
    });
  }
  quoteCode: any;
  requestFrom: any = "commercial";
  getUrlparams() {
    this.requestFrom = this.router.url.split("/")[1];
    this.quoteCode = this.router.url.split("/")[4];
  }
  sidebarPath: any;
  cartAccessoriesData: any = {};
  selectedProduct: any;
  productSub: Subscription = new Subscription();
  ngOnDestroy(): void {
    this.productSub.unsubscribe();
  }

  showmessage: any = false;
  @ViewChild(NgSelectComponent) ngSelectComponent:
    | NgSelectComponent
    | undefined;

  ngOnInit(): void {
    this.cartData = this.storageService.cartData;
    this.cartNumber = this.cartData?.code || null;
    this.sidebarPath = localStorage.getItem("path");
    this.cartAccessoriesData = this.modalService.config.initialState;
    this.selectedAccessories = this.cartAccessoriesData.selectedAccessories || null;
    this.navigateToCheckoutAfter =
      this.cartAccessoriesData.navigateToCheckoutAfter || false;

    for (let a = 1; a < 10; a++) {
      this.quantityDropdownData.push({ value: a, label: a });
    }
    this.initialFrom();
    if (this.navigateToCheckoutAfter) {
      this.getQuoteAdhesivesAccerioes();
    } else {
      this.getAccessoryDetails();
    }

    // this.getAllAccessoryDetails();

    this.getProductDetails();

    // this.getAccessories();
    this.configuration = { ...DefaultConfig };
    this.configuration.checkboxes = false;
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;
    this.configuration.rows = 50;
    this.columns = [
      { key: "qty", title: "Qty", cssClass:{ name: "qty-col", includeHeader: true} },
      { key: "colorImgURL", title: "Product Image" },
      { key: "styleName", title: "Description" },
      { key: "size", title: "Size" },
      { key: "density", title: "Density" },
      { key: "thickness", title: "Thickness" },
      { key: "price", title: "Price (USD)" },
    ];
    // this.spinnerLoading = true;

    // this.initialFrom();
  }

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
        { key: "styleName", title: "Description" },
        { key: "sizeName", title: "Size" },
        { key: "price", title: "Price (USD)" },
      ];
    } else if (activeKey == "Trim") {
      this.columns = [
        { key: "qty", title: "Qty", cssClass:{ name: "qty-col", includeHeader: true} },
        { key: "colorImgURL", title: "Product Image" },
        { key: "partNumber", title: "Part #" },
        { key: "styleName", title: "Description" },
        { key: "colorName", title: "Color" },
        { key: "sizeName", title: "Size" },
        { key: "unitsPerCaton", title: "Units Per Carton" },
        { key: "price", title: "Price (USD)" },
      ];
    } else {
      this.columns = [
        { key: "qty", title: "Qty", cssClass:{ name: "qty-col", includeHeader: true} },
        { key: "colorImgURL", title: "Product Image" },
        { key: "styleName", title: "Description" },
        { key: "sizeName", title: "Size" },
        { key: "density", title: "Density" },
        { key: "thickness", title: "Thickness" },
        { key: "price", title: "Price (USD)" },
      ];
    }

    if (this.accessoryDetails && activeKey == "Cushion") {
      let qtyObj = { key: "qty", title: "Qty (Rolls)", cssClass:{ name: "qty-col", includeHeader: true} };
      const index = this.columns.findIndex((item) => item.key === "qty");
      this.columns.splice(index, 1, qtyObj);
    }
  }

  closeModal() {
    this.bsModalRef.hide();
  }
  initialFrom() {
    this.myForm = this.fb.group({
      qtyrolls: ["", Validators.required],
    });
    this.myForm.markAsUntouched();
  }
  accessoriesData: any = [];
  getAccessories() {
    this.quotesService
      .getAllAccessories(this.cartAccessoriesData?.quoteCode?.product?.code)
      .subscribe((res: any) => {
        if (res) {
          this.accessoriesData = res?.body?.accessoryTypes || [];

          if (this.accessoriesData == null || undefined) {
            this.showmessage = true;
          }
          this.spinnerLoading = false;
        }
      }),
      (err: any) => {
        this.spinnerLoading = false;
        this.accessoriesData = [];
      };
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

  getTabHeadingName(item: any): string {
    if (item?.key === 'Trim') {
      return 'Wall Base Trim';
    }
    return item?.key;
  }

  rediretToCart() {
    this.destroyAllpoups();
    /* let navigateURL = this.requestFrom + "/cart";
    if ("/" + navigateURL == this.router.url) {
      this.router.navigateByUrl("/", { skipLocationChange: true }).then(() => {
        this.router.navigate([navigateURL]);
      });
    } else {
      this.router.navigate([navigateURL]);
    } */
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
  // addtoCart() {
  //   this.spinnerLoading = true;
  //   // const quantityProducts = this.accessoryDetails.filter(
  //   //   (item: any) => item.quantity > 0
  //   // );

  //   let filteredData: any = [];
  //   this.accessoryDetails.forEach((item: any) => {
  //     filteredData = [
  //       ...filteredData,
  //       ...item?.value?.references.filter((ref: any) => ref?.quantity > 0),
  //     ];
  //   });
  //   const items: any = [];
  //   filteredData.forEach((item: any) => {
  //     items.push({
  //       feet: "",
  //       inches: "",
  //       productCode: item?.code,
  //       requestedQty: item.quantity,
  //       requestedUOM: item.inventoryUOM,
  //       solution: [],
  //     });
  //   });

  //   const payLoad = {
  //     addressCity:
  //       this.shippingAddress?.addressCity || this.shippingAddress?.town || "",
  //     addressCountry:
  //       this.shippingAddress?.oneTimeShippingAddress ||
  //       this.shippingAddress?.isOneTimeShipTo
  //         ? this.shippingAddress?.country?.isocode
  //         : this.shippingAddress?.country,
  //     addressLine1:
  //       this.shippingAddress?.addressLine1 || this.shippingAddress?.line1 || "",
  //     addressLine2:
  //       this.shippingAddress?.addressLine2 || this.shippingAddress?.line2 || "",
  //     addressName: this.shippingAddress?.addressName,
  //     addressPostalCode:
  //       this.shippingAddress?.addressPostalCode ||
  //       this.shippingAddress?.postalCode ||
  //       "",
  //     addressState:
  //       this.shippingAddress?.addressState ||
  //       this.shippingAddress?.region ||
  //       "",
  //     carrierNumber: this.shippingAddress?.carrierNumber,
  //     satellite: this.shippingAddress?.satellite?.code,
  //     claimNumber: this.shippingAddress?.claimNumber
  //       ? this.shippingAddress?.claimNumber
  //       : "",
  //     hasClaimSubmitted: this.shippingAddress?.hasClaimSubmitted
  //       ? this.shippingAddress?.hasClaimSubmitted
  //       : false,
  //     invoiceNumber: this.shippingAddress?.invoiceNumber
  //       ? this.shippingAddress?.invoiceNumber
  //       : "",
  //     shipToUnit: this.shippingAddress?.oneTimeShippingAddress
  //       ? ""
  //       : this.shippingAddress?.id,
  //     noPrice: this.shippingAddress?.noPrice
  //       ? this.shippingAddress?.noPrice
  //       : true,
  //     oneTimeShippingAddress:
  //       this.shippingAddress?.oneTimeShippingAddress ||
  //       this.shippingAddress?.isOneTimeShipTo ||
  //       false,
  //     replacementOrderNumber: this.shippingAddress?.orderNumber
  //       ? this.shippingAddress?.orderNumber
  //       : "",
  //     pdpProductCode: this.productCode,
  //     phoneNumber: "",
  //     purchaseOrderNumber: this.shippingAddress?.purchaseOrderNumber
  //       ? this.shippingAddress?.purchaseOrderNumber
  //       : "",
  //     replacementOrder: this.shippingAddress?.replacementOrder
  //       ? this.shippingAddress?.replacementOrder
  //       : false,
  //     replacementReason: this.shippingAddress?.replacementReason
  //       ? this.shippingAddress?.replacementReason
  //       : "",
  //     requestedDeliveryDate: this.datePipe.transform(
  //       this.shippingAddress?.rdd,
  //       "MM/dd/yyyy"
  //     ),
  //     sampleProduct: this.shippingAddress?.sampleProduct
  //       ? this.shippingAddress?.sampleProduct
  //       : false,
  //     sampleType: this.shippingAddress?.sampleType
  //       ? this.shippingAddress?.sampleType
  //       : "",
  //     shippingCondition:
  //     this.shippingAddress?.defaultShippingMethod ?

  //     this.shippingAddress?.defaultShippingMethod :""
  //       ,
  //     isMultiCut: false,
  //     item: items,

  //     shippingInfo: {
  //       jobSite: true,
  //       loadingDock: true,
  //       location: "location",
  //       offloadEqptRequired: true,
  //       requireNotification: true,
  //       siteContactName: "ContactName",
  //       siteContactPhone: "111-2222-3333",
  //       unLoadAssistance: true,
  //       loadingDockDoorAvailable: "",
  //       poleLiftRequired: "",
  //       forkLiftRequired: "",
  //       largestTruckSize: "",
  //       jobSiteDelivery: "",
  //       liftGateAndPallet: "",
  //       strapsNeeded: "",
  //     },
  //   };

  //   this.cartData = this.storageService.cartData;
  //   const cartNumber = this.cartData?.code || null;
  //   this.productService
  //     .addToCart(this.userService.getUserEmail().toLowerCase(), cartNumber, payLoad)
  //     .subscribe((res) => {
  //       this.spinnerLoading = false;

  //       this.showSuccessAlert = true;
  //       this.accessoryDetails = [];
  //       if (res?.body.hasOwnProperty("errorMessages") == false) {
  //         this.storageService.getItem("uid").subscribe((res) => {
  //           this.uid = res;
  //         });

  //         this.productService.getLatestMiniCart(this.uid);
  //       }
  //       if (cartNumber == null) {
  //         let cartData = {
  //           code: res.body?.cartNumber,
  //           entries: res.body?.entries,
  //         };
  //         this.storageService.setItem("miniCartCount", cartData);
  //       } else {
  //         this.cartActiveButton = true;
  //       }
  //     });

  // }
  toCheckNull: any;
  disableButtons = true;
  destroyAllpoups() {
    this.modalService.hide();
    if (this.navigateToCheckoutAfter && this.hasPrice) {
      this.navigateToCheckout();
    }
    // this.modalService.hide("XchangeAddAccessoriesLightboxComponent")
    // this.modalService.hide("AddCompanionProductsComponent")
    // this.modalService.hide("ChooseAddressLightboxComponent")
  }

  getShippingAddress() {
    this.storageService
      .getItem("shippingAddress")
      .subscribe((shippingAddress: any) => {
        this.shippingAddress = shippingAddress;
      });
  }
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

  productCode: string = "";
  productCodeId: any;
  getAllAccessoryDetails() {
    this.productCode = this.cartAccessoriesData?.quoteCode?.product?.code;
    this.quotesService
      .getAllAccessoryDetailsForPopup(this.productCode)
      .subscribe((res: any) => {
        this.accessoryDetails = res?.body?.accessoryTypes || [];
      }),
      (err: any) => { };
  }
  accessoryDetails: any = [];
  // accessoryTypesData:any;
  activeTab: any;
  getAccessoryDetails() {
    this.productCode = this.cartAccessoriesData?.quoteCode?.product?.code;
    this.progressShow('getAccessoryDetails')
    this.quotesService
      .getAllAccessories(
        this.productCodeId == undefined ? this.productCode : this.productCodeId
      )
      .subscribe((res: any) => {
       this.progressHide()
        // this.accessoryTypesData
        // this.accessoryDetails = res?.body?.accessoryTypes[0]?.value?.references;
        this.accessoryDetails = res?.body?.accessoryTypes || [];
        if (this.accessoryDetails?.length) {
          this.accessoryDetails?.forEach((item: any) => {
            if (item?.value?.references.length) {
              item?.value?.references.map((ref: any) => {
                ref.isLoading = true;
                this.getAccessoriesPricing(ref);
              });
            }
          });
          this.activeTab=null;
          for (const item of this.accessoryDetails) {
            if (this.selectedAccessories && this.selectedAccessories.includes(item.key)) {
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

  getQuoteAdhesivesAccerioes() {
    let quoteCode = this.cartAccessoriesData?.quoteCode;
    this.spinnerLoading = true;
    this.quotesService.getQuoteAdhesives(quoteCode).subscribe((res: any) => {
      this.spinnerLoading = false;
      this.accessoryDetails = res?.body?.references || [];
      this.configuration.rows = this.accessoryDetails.length;
      if (this.accessoryDetails?.length) {
        this.accessoryDetails?.forEach((item: any) => {
              item.isLoading = true;
              this.getAccessoriesPricing(item);
        });
      }
      this.setColumns();
    },
    (err: any) => {
      this.spinnerLoading = false;
    });
  }
  selectedTeam = "";
  onSelected(value: string): void {
    this.selectedTeam = value;
  }

  // disableAddToCartBtn() {
  //   let filteredData: any = [];
  //   this.accessoryDetails.forEach((item: any) => {
  //     filteredData = [
  //       ...filteredData,
  //       ...item?.value?.references.filter((ref: any) => ref?.color > 0),
  //     ];
  //   });
  //   return filteredData.length == 0;
  // }

  items: any = [];

  addtoQuote(val: any, code: any, uom: any, row: any) {
    const inputString = val.target.value.trim();
    const inputValue = parseFloat(inputString);
    if (inputString === '') {
      const existingItemIndex = this.items.findIndex((item: any) => item.productCode === code);
      if (existingItemIndex !== -1) {
        this.items.splice(existingItemIndex, 1);
      }
    } else if (!inputString.includes('.') && inputValue > 0) {
      const existingItemIndex = this.items.findIndex((item: any) => item.productCode === code);
      const newItem = {
        productCode: code,
        uom: uom,
        quantity: inputValue,
      };
  
      if (existingItemIndex !== -1) {
        this.items[existingItemIndex] = newItem;
      } else {
        this.items.push(newItem);
      }
    } else {
      const existingItemIndex = this.items.findIndex((item: any) => item.productCode === code);
      if (existingItemIndex !== -1) {
        this.items.splice(existingItemIndex, 1);
      }
      row.quantity = null;
      
    }

  }
  
  
  
  // addtoQuote() {

  //   let filteredData: any = [];
  //   this.accessoryDetails.forEach((item: any) => {

  //     filteredData = [
  //       ...filteredData,
  //       ...item?.value?.references.filter((ref: any) => ref?.quantity > 0),
  //     ];
  //   });
  //   const items: any = [];
  //   filteredData.forEach((item: any) => {
  //     items.push({
  //       feet: "",
  //       inches: "",
  //       productCode: item?.code,
  //       requestedQty: item.quantity,
  //       requestedUOM: item.inventoryUOM,
  //       solution: [],
  //     });
  //   });

  // }
  stopAlert() {
    setTimeout(() => {
      this.alertTrigger = false;
      this.showSuccessAlert = false;
      // this.closeModal();
    }, 8000);
  }

  addProduct() {
    let filteredData: any = [];
    if (this.buttonName?.toLowerCase() === "convert to order") {
      filteredData = this.accessoryDetails?.filter((item: any) => item?.quantity > 0);
    } else {
      this.accessoryDetails.forEach((item: any) => {
        filteredData = [
          ...filteredData,
          ...item?.value?.references.filter((ref: any) => ref?.quantity > 0),
        ];
      });      
    }
   this.progressShow('addProduct')
    // if (this.items.length > 0) {
      let payload = {
        quoteCode: this.router.url.split("/")[4],
        accessories: filteredData?.map((d: any) => {
          if (d?.price && d?.price != "NA") {
            return {
              productCode: d?.code,
              uom: d?.inventoryUOM,
              quantity: d?.quantity,
              unitPrice: d?.price,
            };            
          } else {
            return {
              productCode: d?.code,
              uom: d?.inventoryUOM,
              quantity: d?.quantity,
            };
          }
        }),
      };

      this.quotesService.addAccessoriesProduct(payload).subscribe(
        (res: any) => {
          this.scrollTop();
          if (!!res.body.messages) {
            if (res.body.messages[0].status === "00001" || res.body.messages[0]?.status?.toLowerCase() == "error") {
              this.progressHide()
              this.alertData = {
                message: res.body.messages[0].message,
              };
              this.alertType = "danger";
              this.showSuccessAlert = true;
              this.alertTrigger = true;
              this.stopAlert();
              this.getUpdatedAccessories();
              this.closeModal();
            } else {
              this.progressHide()
              this.alertTrigger = true;
              this.alertData = {
                message: "Product added to cart successfully!!",
              };
              this.alertType = "success";
              this.showSuccessAlert = true;
              this.isButtonDisabled = true;
              this.stopAlert();
              if (this.buttonName?.toLowerCase() === "convert to order" && this.hasPrice == true) {
                this.convertToOrder();
              }else{
                this.getUpdatedAccessories();
                this.closeModal();
              }
              this.progressHide()
            }
          }
        },
        (err: any) => {
          this.progressHide()
          this.showSuccessAlert = true;
          this.alertTrigger = true;
          this.alertData = {
            message: err?.error,
          };
          this.alertType = "danger";
        }
      );
    // } else {
    //   this.spinnerLoading = false;
    //   this.rediretToCart();
    //   this.navigateToCheckout();
    // }
  }

  convertToOrder(){
this.progressShow('convertToOrder')
    this.quotesService
        .convertOrder(this.quoteCode)
        .subscribe(
          (res: any) => {
           this.progressHide()
            this.closeModal();
            this.navigateToCheckout();
          },
          (err: any) => {
            this.closeModal();
            this.progressHide()
          }
        );
  }

  navigateToCheckout() {
    this.quotesService.convertOrderClicked = true;
    this.quotesService.quoteCartCode = this.quoteCode;
    this.productService.getMiniCartData(this.uid).subscribe((res: any) => {
      this.storageService.setItem("miniCartCount", res.body);
      this.router.navigateByUrl("/commercial/cart");
    });
  }
  onClear(i: number) {
    this.items?.splice(i, 1);
  }

  hasPrice:boolean = false;
  disableButton() {
    let disableBtn = true;
    if (this.buttonName?.toLowerCase() === "convert to order") {
      if (this.accessoryDetails?.length === 0) {
        disableBtn = false;
      } else {
        let ind = this.accessoryDetails?.findIndex(
          (item: any) => item?.quantity > 0
        );
        disableBtn = ind == -1;

        let priceData = this.accessoryDetails?.findIndex(
          (item: any) => item?.price > 0
        );
        this.hasPrice = priceData == -1 ? false : true;
      }
    } else {
      let filteredData: any = [];
      this.accessoryDetails.forEach((item: any) => {
        filteredData = [
          ...filteredData,
          ...item?.value?.references.filter((ref: any) => (ref?.quantity != null || ref?.quantity != undefined) && (Number(ref?.quantity) >= 0)),
        ];
      });    
      disableBtn = !(filteredData?.every((n:any)=>(n?.quantity>0))&& filteredData?.length>0);
    }
    return disableBtn;    
      
  }

  checkValue(event: any, item: any) {
    const inputVal = event.target.value;
    const parsedVal = parseInt(inputVal, 10);
    if (isNaN(parsedVal) || parsedVal < 0 || parsedVal.toString() !== inputVal || parsedVal === 0) {
      item.quantity = null;
    } else {
      const newArr = this.quantityDropdownData.filter((el: any) => el.value == parsedVal);
      item.quantity = newArr.length > 0 ? parsedVal : null;
    }
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
    return this.productService
      .getAccessoriesPricing(payLoad)
      .subscribe((resp: any) => {
        item.isLoading = false;
        item.price = resp?.body?.result?.length
          ? resp?.body?.result[0]?.priceEach
          : "NA";
      },()=>{item.isLoading = false;});
  }
  
  keyPressNumbers(e: KeyboardEvent) {
    let event: any = e.target;
    let value = event.value + e.key;    
    return (/^[0-9]$/i.test(e.key)) && (Number(value) <= 999);
  }
  scrollTop() {
    let top = document.getElementById("scrollTop");
    if (top !== null) {
      top.scrollIntoView();
      top = null;
    }
  }
  
  continueShopping() {
    this.closeModal();
    this.router.navigate(["/commercial/product-owner"]);
   }

    progressShow(msgType: any) {
         const messageConstants = MESSAGE_CONSTANTS?.quotes?.QuoteDetails?.[msgType]
         this.openProgressModal({
           modalHeaderText: messageConstants?.headerText,
           progressText: messageConstants?.bodyText,
           progressBarText: messageConstants?.barText
         });
       }
       progressHide() {
         this.modalService.hide("progressModal");
       }
       openProgressModal(data: any = {}, size: string = "md", modalId: string = "progressModal") {
        this.modalRef = this.modalService.show(ProgressModalComponent, {
          id: modalId,
          class: `modal-${size} modal-dialog-centered`,
          backdrop: true,
          ignoreBackdropClick: true
        });
        Object.assign(this.modalRef.content, data);
      }
}
