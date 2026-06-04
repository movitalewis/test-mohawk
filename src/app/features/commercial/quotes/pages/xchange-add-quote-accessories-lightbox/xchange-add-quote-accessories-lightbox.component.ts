import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
} from "@angular/core";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
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
import { UserService } from "src/app/features/shared/user/services/user.service";
import { DatePipe, Location } from "@angular/common";
import { QuotesService } from "../../services/quotes.service";

@Component({
    selector: "app-xchange-add-quote-accessories-lightbox",
    templateUrl: "./xchange-add-quote-accessories-lightbox.component.html",
    styleUrls: ["./xchange-add-quote-accessories-lightbox.component.scss"],
    standalone: false
})
export class XchangeAddQuoteAccessoriesLightboxComponent
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
  userInfo: any = "";
  @Input() type = 1;
  @Input() cartDataProductId: any;
  @Input() showSuccessAlert = true;
  @Input() showContinueShopping = true;
  @Input() cartCode: any;
  buttonName: any;
  buttonQuote: any;
  getQuoteAction = () => { };
  onClose = () => { };
  items: any;  
  selectedAccessories:any;
  alertData: any = {
    message: "success",
  };
  alertType: any = "success";
  constructor(
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    public productService: ProductService,
    private fb: FormBuilder,
    private router: Router,
    private cartService: ProductService,
    private storageService: StorageService,
    public userService: UserService,
    private _location: Location,
    private datePipe: DatePipe,
    private quotesService: QuotesService
  ) {
    this.getUrlparams();
    this.storageService.getItem("uid").subscribe((res) => {
      this.uid = res;
    });
    this.storageService.getItem("userInfo").pipe(take(1)).subscribe((res) => {
          this.userInfo = res;
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
  cartData: any;
  quantityDropdownData: any = [];
  ngOnInit(): void {
    this.cartData = this.storageService.cartData;
    for (let a = 1; a < 10; a++) {
      this.quantityDropdownData.push({ value: a, label: a });
    }
    this.sidebarPath = localStorage.getItem("path");
    this.cartAccessoriesData = this.modalService.config.initialState;
    this.selectedAccessories = this.cartAccessoriesData.selectedAccessories || null;
    this.type = this.cartAccessoriesData?.type || this.type;
    this.cartDataProductId =
      this.cartAccessoriesData?.cartDataProductId || this.cartDataProductId;
    this.showSuccessAlert =
      this.cartAccessoriesData?.showSuccessAlert || this.showSuccessAlert;
    this.showContinueShopping =
      this.cartAccessoriesData?.showContinueShopping ||
      this.showContinueShopping;

    this.cartCode = this.cartAccessoriesData?.cartCode;

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

    if (this.cartAccessoriesData?.shippingAddress) {
      this.shippingAddress = this.cartAccessoriesData.shippingAddress;
    } else {
      this.getShippingAddress();
    }
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
    this.columns = [
      { key: "qty", title: "Qty", cssClass:{ name: "qty-col", includeHeader: true} },
      { key: "colorImgURL", title: "Product Image" },
      { key: "styleName", title: "Description" },
      { key: "sizeName", title: "Size" },
      { key: "density", title: "Density" },
      { key: "thickness", title: "Thickness" },
      { key: "price", title: "Price (USD)" },
    ];

    this.storageService.getItem("uid").subscribe((res) => {
      this.uid = res;
    });
  }
  modalRefs: BsModalRef[] = [];
  closeModal(modalId?: number) {
    const ids: number[] = this.modalService["loaders"].map(
      (l: any) => l.instance.id
    );
    for (const id of ids) {
      this.modalService.hide(id);
    }
    this.onClose();
  }

  setColumns() {
    if (
      this.accessoryDetails &&
      (this.accessoryDetails[0]?.key == "Floor" ||
        this.accessoryDetails[0]?.key == "Installation")
    ) {
      this.columns = [
        { key: "qty", title: "Qty", cssClass:{ name: "qty-col", includeHeader: true} },
        { key: "colorImgURL", title: "Product Image" },
        { key: "partNumber", title: "Part #" },
        { key: "styleName", title: "Description" },
        { key: "sizeName", title: "Size" },
        { key: "price", title: "Price (USD)" },
      ];
    } else if (this.accessoryDetails[0]?.key == "Trim") {
      this.columns = [
        { key: "qty", title: "Qty", cssClass:{ name: "qty-col", includeHeader: true} },
        { key: "colorImgURL", title: "Product Image" },
        { key: "partNumber", title: "Part #" },
        { key: "styleName", title: "Description" },
        { key: "colorName", title: "Color" },
        { key: "sizeName", title: "Size" },
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

    if (this.accessoryDetails && this.accessoryDetails[0]?.key == "Cushion") {
      let qtyObj = { key: "qty", title: "Qty (Rolls)", cssClass:{ name: "qty-col", includeHeader: true} };
      const index = this.columns.findIndex((item) => item.key === "qty");
      this.columns.splice(index, 1, qtyObj);
    }
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

  accessoriesData: any = [];
  productCode: string = "";
  productCodeId: any;
  getAllAccessoryDetails() {
    // this.spinnerLoading = true;
    if (this.type == 1) {
      let lastIndexOfUrl = this.router.url.split("/");
      this.productCode = lastIndexOfUrl[lastIndexOfUrl.length - 1];
    } else {
      this.productCode = this.cartDataProductId;
    }

    this.productService.progressShow('getAccessories');
    this.productService
      .getAllAccessoryDetailsForPopup(this.productCode)
      .subscribe((res: any) => {
        this.productService.progressHide();
        this.spinnerLoading = false;
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
          this.activeTab = null;
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
          this.productService.progressHide();
          this.spinnerLoading = false;
          this.setColumns();
          this.modalService.hide();
        });
      // (err: any) => {};
  }
  accessoryDetails: any = [];
  activeTab: any;
  getAccessoryDetails() {
    if (this.type == 1) {
      let lastIndexOfUrl = this.router.url.split("/");
      this.productCode = lastIndexOfUrl[lastIndexOfUrl.length - 1];
    } else {
      this.productCode = this.cartDataProductId;
    }
    // this.spinnerLoading = true;
    this.productService.progressShow('getAccessories');
    this.productService
      .getAllAccessories(
        this.productCodeId == undefined ? this.productCode : this.productCodeId
      )
      .subscribe((res: any) => {
        this.productService.progressHide();
        this.spinnerLoading = false;
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
          this.activeTab = null;
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
          this.productService.progressHide();
          this.spinnerLoading = false;
          this.setColumns();
          this.modalService.hide();
        });
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

  addtoCart() {
    let filteredData: any = [];
    this.accessoryDetails.forEach((item: any) => {
      filteredData = [
        ...filteredData,
        ...item?.value?.references.filter((ref: any) => ref?.quantity > 0),
      ];
    });
    // this.spinnerLoading = true;

    let payload = {
      cartCode: this.cartCode,
      accessories: filteredData?.map((d: any) => {
        return {
          productCode: d?.code,
          uom: d?.inventoryUOM,
          quantity: d?.quantity,
        }
      }),
    };

    this.productService.progressShow('addToQuote');
    this.quotesService.addMultiAccessoriesToQuoteCart(payload).subscribe(
      (res: any) => {
        this.productService.progressHide();
        this.scrollTop();
        this.spinnerLoading = false;
        if (res?.body?.messages && (res?.body?.messages[0]?.status === "00001" || res?.body?.messages[0]?.status?.toLowerCase() == "error")) {
          this.alertData = {
            message: res?.body?.messages[0]?.message,
          };
          this.alertType = "danger";
          this.showSuccessAlert = true; 
          this.stopAlert();
          this.storageService.getItem("uid").subscribe((res) => {
            this.uid = res;
          });
          this.productService.getLatestMiniCart(this.uid);
          this.getQuoteAction();
        } else { 
          this.accessoryDetails = [];
          this.alertData = {
            message: "Product added to cart successfully!!",
          };
          this.alertType = "success";
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
        this.productService.progressHide();
        this.spinnerLoading = false;
        this.showSuccessAlert = true;
        this.alertData = {
          message: err?.error,
        };
        this.alertType = "danger";
      }
    );
  }

  toCheckNull: any;
  disableButtons = true;

  requestFrom: any = "commercial";
  getUrlparams() {
    this.requestFrom = this.router.url.split("/")[1];
  }

  destroyAllpoups() {
    this.modalService.hide();
  }

  disableAddToCartBtn() {
    let filteredData: any = [];
    this.accessoryDetails.forEach((item: any) => {
      filteredData = [
        ...filteredData,
        ...item?.value?.references.filter((ref: any) => (ref?.quantity != null || ref?.quantity != undefined) && (Number(ref?.quantity) >= 0)),
      ];
    });    
    return !(filteredData?.every((n:any)=>(n?.quantity>0))&& filteredData?.length>0);
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
      }, () => { item.isLoading = false; });
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
  
  stopAlert() {
    setTimeout(() => {
      this.showSuccessAlert = false;
      this.destroyAllpoups()
    }, 8000);
  }

  continueShopping() {
    this.closeModal();
   this.router.navigate(["/commercial/product-owner"]);
  }
}
