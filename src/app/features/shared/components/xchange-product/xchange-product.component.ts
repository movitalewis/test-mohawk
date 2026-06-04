import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import {  Router } from "@angular/router";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { SharedService } from "src/app/features/http-services/shared.service";
import { StorageService } from "src/app/features/http-services/storage.service";
import { ChooseAddressLightboxComponent } from "src/app/features/residential/products/components/choose-address-lightbox/choose-address-lightbox.component";
import { PlpOrderSamplesComponent } from "src/app/features/residential/products/components/plp-order-samples/plp-order-samples.component";
import { PlpOrderSamplesComponent as CommercialPlpOrderSamplesComponent } from "src/app/features/commercial/products/components/plp-order-samples/plp-order-samples.component";


import { UserService } from "src/app/features/shared/user/services/user.service";
import { ProductService } from "src/app/features/commercial/products/pages/services/product.service";
import { EntitlementManagerService } from "src/app/features/residential/entitlement-manager/services/entitlement-manager.service";
import { ProductListService } from "src/app/features/commercial/products/services/product-list.service";

@Component({
    selector: "xchange-product",
    templateUrl: "./xchange-product.component.html",
    styleUrls: ["./xchange-product.component.scss"],
    standalone: false
})
export class XchangeProductComponent implements OnInit {
  @Output() compareOutput: EventEmitter<any> = new EventEmitter<any>();
  @Input() compareList: any;
  @Input("product") product!: any;
  @Input() isPostOrder: any = false;
  @Input() orderNumber: any = "";
  @Input() isWalkOff: any = false;
  @Input() postModificationOrders: any;

  moduleName: string = "";
  isSalesPerson: boolean = false;
  isSalesOps: boolean = false;
  isCustomer: boolean= false;
  default_image: string =
    "https://s7d4.scene7.com/is/image/MohawkResidential/missing?$xchangeThumb$";

  bsModalRef!: BsModalRef;
  inHouseAccount: boolean = false;
  awaitingResponse: boolean = false;
  updateEntitlementLoading: boolean = false;
  stylePrice = "";
  uid: any;
  soldToAccount:any = "";
  isSalesManager:boolean = false;
  isMohawkOneuser: boolean = false;
  isShipToUser:boolean = false;
  constructor(
    private modalService: BsModalService,
    private sharedService: SharedService,
    public storageService: StorageService,
    private route: Router,
    public userService: UserService,
    private productService: ProductService,
    private entitlementMgrService: EntitlementManagerService,
    public productListService: ProductListService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.sharedService.getuntickUnselectedProducts().subscribe((data: any) => {
      if (data) {
        let element: any = document.getElementById(
          data.firstVariantCode
        ) as HTMLInputElement | null;

        element.checked = false;
      }
    });
    if (window.location.pathname.includes("commercial")) {
      this.moduleName = "/commercial";
    } else {
      this.moduleName = "/residential";
    }

    this.userService.getCurrentUserDetail().subscribe((res: any) => {
      this.inHouseAccount = res.body.orgUnit?.inHouseAccount;
      this.isSalesOps = res?.body?.isSalesOps;
      this.uid = res.body.orgUnit?.uid;
      this.isMohawkOneuser = res?.body?.isMohawkOneuser;
      this.soldToAccount =  res.body.orgUnit?.accountType === "ZMSH" ? res.body.orgUnit?.soldTo : res.body.orgUnit?.uid;
      this.isShipToUser = res.body.orgUnit?.accountType === "ZMSH" ? true : false;
      if (res?.body?.isSalesPerson || res?.body?.isSalesOps) {
        this.isSalesPerson = true;
      }
      if(res?.body?.isALCBDM || res?.body?.isResidentialManager){
        this.isSalesManager = true;
      }
      if (res?.body?.isCustomer) {
        this.isCustomer = true;
      }
    });
    if(this.product.styleBlocked == true && this.moduleName == '/commercial' && this.isCustomer == true){
        this.product.priceTag = '';
    }else{
      this.getProductPrice(this.product);
    }
  }
  getImage(imageurl: any) {
    let swatchImage = imageurl.includes("https");
    return swatchImage? imageurl + "?$xchangeThumb$":"https://s7d4.scene7.com/is/image/MohawkResidential/missing?$xchangeThumb$";
   // return image + "?$xchangeThumb$ ";
  }
  onChangeCompare(e: any, data: any) {
    if (e.target.checked) {
      this.compareOutput.emit({ data: data, type: "add" });
    } else {
      this.compareOutput.emit({ data: data, type: "remove" });
    }
  }

  siezeColor(colorArr: any) {
    let len: any = this.isCustomer ? colorArr?.colorsForCustomer:colorArr?.colorsForInternalUser;
    if (len) {
      len = len.split(",");

      // if(len.includes('[')){
      // len = len.replace('[','').replace(']','');
      // }
      // else {
      //   len=len.split('');
      // }

      return len.length;
    } else {
      return 0;
    }
  }

  orderSample() {
    if (
      this.isPostOrder === false &&
      (this.storageService.cartData == undefined ||
        this.storageService.cartData == "" ||
        this.storageService.cartData.hasOwnProperty("errorMessage") ||
        this.storageService.cartData?.totalItems == 0)
    ) {
      const initialState: ModalOptions = {
        initialState: {
          // Data to  popup
          selectedProduct: this.product,
          cartData: {},
          productType: this.product?.productType,
          subProductType: this.product?.subCategoryCode || this.product?.subCategoryName,
          feetyardForm: this.product,
          multiCutIndication: false,
          viewInventory: false,
          aptCheckEntrie: [],
          openAddAccessories: false,
          showOrderSample: true,
          productColorVariantOptions: undefined,
          productCode: this.product.firstVariantCode,
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
      this.bsModalRef.content.pdpdata = this.product;
      this.bsModalRef.content.isAtpCheck = false;
    } else {
      const initialState: ModalOptions = {
        initialState: {
          // Data to  popup
          productColorVariantOptions: [],
          feetyardForm: this.product,
          productType: this.product?.productType,
          subProductType: this.product?.subCategoryCode || this.product?.subCategoryName,
          productCode: this.product.firstVariantCode,
          postModificationOrders: this.postModificationOrders,
          isPostOrder: this.isPostOrder,
        },
      };
      const componentRef: any =
        this.moduleName == "/residential"
          ? PlpOrderSamplesComponent
          : CommercialPlpOrderSamplesComponent;

      this.bsModalRef = this.modalService.show(
        componentRef,
        Object.assign(initialState, {
          id: "PlpOrderSamplesComponent",
          class: "modal-xl modal-dialog-centered",
          backdrop: "static",
          keyboard: false,
        })
      );
      this.bsModalRef.content.cartIdNew = this.storageService.cartData?.code;
    }
    // const initialState: ModalOptions = {
    //   initialState: {
    //     // Data to  popup
    //   },
    // };
    // this.bsModalRef = this.modalService.show(
    //   PlpShippingAddressComponent,
    //   Object.assign(initialState, { id: "PlpShippingAddressComponent", class: "modal-lg modal-dialog-centered" })
    // );
  }

  routeToProductDetails(id: any) {
    // this.storageService.setItem("plpUrl",this.route?.routerState?.snapshot?.url);
    localStorage.setItem("plpUrl", this.route?.routerState?.snapshot?.url);
    localStorage.setItem("fromPlpFlag", "true");
    if (this.isPostOrder) {
      this.route.navigate([
        this.moduleName +
          `/post-modification/products/details/${this.orderNumber}/` +
          id,
      ]);
    } else {
      if (this.isWalkOff) {
        let path = "/products/details/{id}?name={name}";
        path = path.replace("{name}", "walkoff");
        path = path.replace("{id}", id);
        path = this.moduleName + path;

        this.route.navigateByUrl(path);
      } else this.route.navigate([this.moduleName + "/products/details/" + id]);
    }
    localStorage.setItem("pdpSizeNotSelected", "true");
  }
  ngAfterViewInit() {
    // this.awaitingResponse = true;
    // setTimeout(() => {
    // this.productService
    //   .getProductPriceDetails(this.product.code)
    //   .subscribe((res) => {
    //     this.stylePrice = res.body?.cartonPriceSF;
    //     this.awaitingResponse = false;
    //   });
    // }, 3000);
  }

  updateCustEntitlement(product: any, operation = "", action = "") {
    let divisionUnit:any;
    if(this.uid === 'EMPTY_B2BUNIT'){
      divisionUnit = product.firstVariantCode.charAt(0);
    }
    let payload: any = {
      baseProductList: [product.code],
      operation: operation,
      division: this.uid === 'EMPTY_B2BUNIT' ? divisionUnit =='R' ? '81' :'82':this.uid.split("_")[3],
    };

    if (!action) {
      payload.customer = this.uid === 'EMPTY_B2BUNIT' ? '':this.uid.split("_")[0];
      payload.salesOrg = this.uid === 'EMPTY_B2BUNIT' ? '':this.uid.split("_")[1];
      payload.distributionChannel = this.uid === 'EMPTY_B2BUNIT'? '':this.uid.split("_")[2];
    }
    this.updateEntitlementLoading = true;
    this.entitlementMgrService.updateCustEntitlement(payload).subscribe(
      (response: any) => {
        product.styleBlocked = operation == "B" ? true : false;
        /* if(!product.styleBlocked){
          product.enableOrderSample = true;
        } */
        if (this.moduleName === '/commercial') {
          if (product.styleBlocked && this.isCustomer == true) {
              product.priceTag = '';
          } else {
            this.getProductPrice(this.product);
          }
        }
        this.updateEntitlementLoading = false;
      },
      (err: any) => {
        this.updateEntitlementLoading = false;
      }
    );
  }

  getProductPrice(product: any) {
    // this.awaitingResponse = true;
    // const styleDetails = {
    //   styleNumber: product.styleId,
    //   productCategory: product.subCategoryCode,
    //   sizeCode: "",
    //   backingCode: "",
    //   sellingGroup: "",
    //   styleName: "",
    //   code: product.code,
    // };
    // const payload = {
    //   collection: "",
    //   promoFlg: "0",
    //   sortBy: "",
    //   orderOfSort: "",
    //   isDownloadable: false,
    //   futurePrice: false,
    //   currentPage: "",
    //   recordsPerPage: "",
    //   startRow: "",
    //   endRow: "",
    //   styleDetails: [styleDetails],
    // };
    // this.productService.getPlpPriceSearch(payload).subscribe(
    //   (res: any) => {
    //     console.log(res);
    //     // this.awaitingResponse = false;
    //     res.body.result = res.body?.result || [];
    //     this.stylePrice = res.body?.result[0]?.cartonPriceSF;
    //     console.log(this.stylePrice);
    //   },
    //   () => {
    //     this.awaitingResponse = false;
    //   }
    // );
    let styleDetails: any = [];
    const itemVal = {
      styleNumber: product.styleId,
      productCategory: product.subCategoryCode,
      sizeCode: "",
      backingCode: "",
      sellingGroup: "",
      styleName: "",
      code: product.code,
    };
    styleDetails.push(itemVal);
    const payload = {
      collection: "",
      promoFlg: "0",
      sortBy: "",
      orderOfSort: "",
      isDownloadable: false,
      futurePrice: false,
      display: this.product?.categoryName && (this.product?.categoryName.includes("MERCHANDISING") || this.product?.categoryName.includes("merchandising") ) ? "true" : "false",
      currentPage: this.productListService.currentPage,
      recordsPerPage: this.productListService.pageSize,
      startRow: "",
      endRow: "",
      styleDetails: styleDetails,
    };
    this.product.isLoading = true;

    this.productService.getPlpPriceSearch(payload, this.soldToAccount).subscribe((res: any) => {
      let priceTag: any;
      this.product.isLoading = false;

      res.body?.result?.filter((item: any) => {
        if (item.code === this.product.code) {
          if (item?.minPrice >= 0 && item?.maxPrice > 0) {
            item.minPrice = item?.minPrice.toFixed(2);
            item.maxPrice = item?.maxPrice.toFixed(2);
            let price =
              item?.minPrice == item?.maxPrice
                ? item?.minPrice
                : item?.minPrice + " - " + item?.maxPrice;
            if (item?.uom == "YDK") {
              priceTag = `${this.storageService.userInfo?.priceLabel} ${price} / sq. yd.`;
            } else if (item?.uom == "FTK") {
              priceTag = `${this.storageService.userInfo?.priceLabel} ${price} / sq. ft.`;
            } else if (item?.uom == "EA") {
              priceTag = `${this.storageService.userInfo?.priceLabel} ${price} / ea.`;
            } else if (item?.uom == "PAL") {
              priceTag = `${this.storageService.userInfo?.priceLabel} ${price} / pal.`;
            } else if (item?.uom == "PF") {
              priceTag = `${this.storageService.userInfo?.priceLabel} ${price} / pf.`;
            } 
            else if (item?.uom == "LF") {
              priceTag = `${this.storageService.userInfo?.priceLabel} ${price} / linear ft.`;

            }

          }
        }
      });
      this.product.priceTag = priceTag ? priceTag : "Pricing N/A";
      this.cdr.detectChanges();
    });
  }
}
