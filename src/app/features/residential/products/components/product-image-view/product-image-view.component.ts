import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import {
  CarouselComponent,
  OwlOptions,
  SlidesOutputData,
} from "ngx-owl-carousel-o";
import { SelectColorLightboxComponent } from "src/app/features/residential/products/components/select-color-lightbox/select-color-lightbox.component";
import { ProductColorsConfig } from "../../../../shared/interfaces/product-colors-config";
import { SwitchButton } from "../../../../shared/interfaces/switch-button";
import { XchangeImageViewLightBoxComponent } from "../../../../shared/components/xchange-image-view-light-box/xchange-image-view-light-box.component";
import { ProductService } from "../../pages/services/product.service";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { StorageService } from "src/app/features/http-services/storage.service";
import { PageChangedEvent } from "ngx-bootstrap/pagination";
import { XchangeViewAllColorsComponent } from "src/app/features/shared/components/xchange-view-all-colors/xchange-view-all-colors.component";
import { PaginationService } from "ngx-pagination";
import { PdpPfxPriceFields } from "src/app/features/shared/constants/menu/residential.config";
import { XchangeDataLayerService } from "src/app/features/http-services/data-layer.service";
import { ProgressModalComponent } from "src/app/features/shared/components/progress-modal/progress-modal.component";
import { MESSAGE_CONSTANTS } from "src/app/features/shared/constants/MESSAGE-CONSTANTS";

@Component({
    selector: "product-image-view",
    templateUrl: "./product-image-view.component.html",
    styleUrls: ["./product-image-view.component.scss"],
    standalone: false
})
export class ProductImageViewComponent
  implements OnInit, OnChanges, AfterViewInit
{
   modalRef!: BsModalRef;
  @Input("productImages") productImages!: ProductColorsConfig;
  @Input() pdpData: any;
  @ViewChild("owlCar") owlCar!: CarouselComponent;
  @ViewChild("owlCarNew") owlCarNew!: CarouselComponent;
  @Input() pdpDataOptions: any;
  @Input() colorVariant: any;
  colorVariantPaginationData: any;
  @Output() selectedProduct = new EventEmitter<any>();
  @Output() colorSeletedCheck = new EventEmitter<any>();
  @Output() sizeSeletedCheck = new EventEmitter<any>();
  @Output() orderSampleClick = new EventEmitter<any>();
  @Input() preOrderFlag: any = false;
  @Input() uomDetails:any;
  @Input() inHouseAccount: any;
  @Input() erpProductCategory: any = "";
  @Input() pdpPricingUOMValue: any;
  @Input() pdpPricingUOMCode: any;

  droppedDate: Date = new Date();
  // @ViewChild("paginationRef") paginationRef!: PaginationService;
  selectedProductItem: any;

  imageBaseUrl =
    "https://s7d4.scene7.com/is/image/MohawkResidential/missing?$xchangeThumb$";

  activeSlideId!: any;
  viewType: string = "swatch";
  productImageForm!: FormGroup;
  switchBtnConfig: SwitchButton = {
    leftLabel: "Swatch",
    leftValue: "swatch",
    rightLabel: "Room View",
    rightValue: "room",
    id: "image-mode",
  };
  pdpPfxPriceFields = { ...PdpPfxPriceFields };
  customOptions: OwlOptions = {
    loop: false,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    navText: ["", ""],
    responsive: {
      0: {
        items: 1,
      },
      400: {
        items: 1,
      },
      740: {
        items: 1,
      },
      940: {
        items: 1,
      },
    },
    nav: false,
  };
  thumbImage = "https://s7d4.scene7.com/is/image/MohawkResidential/missing";
  spinnerLoading = true;
  activeColorName: string = "";
  activeColorId: string = "";
  activeSpreadRate: string = "";
  activePartNumber: string = "";
  selectedPdpData: any;
  applicationType: string = "";
  // isSalesPerson: boolean = false;
  // isSalesOps: boolean = false;
  // uid: any;
  isCustomer: boolean = false;

  @Input() availabilityForms: any;
  missingImage =
    "https://s7d4.scene7.com/is/image/MohawkResidential/missing?$xchangeThumb$";
  FromPlpFlag: any;
  sizeFlag: any;
  selectedSizeValue: any;
  multiSizeAvailable:boolean = false;
  userHasSelectedSize: boolean = false;

  constructor(
    private cd: ChangeDetectorRef,
    private modalService: BsModalService,
    private productService: ProductService,
    public userService: UserService,
    private fb: FormBuilder,
    public router: Router,
    private activeRoute: ActivatedRoute,
    public storageService: StorageService,
    private paginNationService: PaginationService,
    private dataLayer: XchangeDataLayerService
  ) {
    this.FromPlpFlag = localStorage.getItem("fromPlpFlag") === "true";
    localStorage.removeItem("fromPlpFlag");
   
  }
  ngAfterViewInit(): void {
    if (this.pdpData?.productType != "MERCHANDISING" && this.pdpData?.subProductType != "POWDERS" &&   this.pdpData?.subProductType != 'TOOLS') {
      this.owlCarNew.to(this.pdpDataOptions?.otherDetails?.selected?.code);
    }
    
    this.spinnerLoading = false;
   
    setTimeout(() => {
      console.log("this.pdpData?.subProductT--->",this.pdpData)
      
      this.dataLayer.viewItem(
        this.storageService.userPriceLabel || "",
        0,
        [this.pdpData]?.map((item: any) => {
          return {
            item_id: item?.code || "",
            item_name: item?.sellingStyleName || item?.styleName || "",
            index: 0,
            item_brand: item?.brandName || item?.brand || item?.brandId || "",
            item_category:
              item?.subCategoryCode ||
              item?.subProductType ||
              item?.subCategoryName ||
              "",
            item_category2: item?.productLine || item?.collection || "",
            item_category3: item?.styleName || item?.sellingStyleName || "",
            item_category4:
              item?.colorName || item?.sellingColorName || item?.color || "",
            item_list_id: "",
            item_list_name: "",
            item_variant: `${item?.productLine || item?.collection || ""} ${
              item?.styleName || item?.sellingStyleName || ""
            }`,
            price:
              Number(
                this.pdpDataOptions?.priceDetails &&
                  this.pdpDataOptions?.priceDetails[
                    this.pdpPfxPriceFields[this.pdpData?.subProductType]?.key
                  ]
                  ? this.pdpDataOptions?.priceDetails[
                      this.pdpPfxPriceFields[this.pdpData?.subProductType]
                        ?.key
                    ]
                  : "0"
              ) || 0,
            quantity: 1,
            uom: this.pdpPricingUOMValue
              ? this.pdpPricingUOMValue
              : this.pdpPfxPriceFields[this.pdpData?.subProductType][0]?.type ||
                "",
          };
        }) || []
      );
    }, 2000);
  }
  productSelectedValue: any;
  ngOnChanges(changes: SimpleChanges): void {
    let change: any = changes;

    if (!change?.colorVariant?.firstChange) {
      if (change?.colorVariant?.currentValue != undefined) {
        this.updatePageData(true);
      }
    }
    this.selectedPdpData = change?.pdpData?.currentValue;
    if (change?.pdpDataOptions?.currentValue?.otherDetails?.selected) {
      this.productSelectedValue =
        change?.pdpDataOptions?.currentValue?.otherDetails?.selected;
      this.activeColorName =
        change?.pdpDataOptions?.currentValue?.otherDetails?.selected.sellingColorName;
      this.activeColorId =
        change?.pdpDataOptions?.currentValue?.otherDetails?.selected.sellingColorId;
      this.activePartNumber =
        change?.pdpDataOptions?.currentValue?.otherDetails?.selected.partNumber;
      this.activeSpreadRate =
        change?.pdpDataOptions?.currentValue?.otherDetails?.selected.spreadRate;
      this.applicationType =
        change?.pdpDataOptions?.currentValue?.otherDetails?.selected.applicationType;
    }
    if (this.pdpData?.subProductType === "UNDERLAYMENT") {
      this.switchBtnConfig.rightLabel = "";
    } else {
      this.switchBtnConfig.rightLabel = "Room View";
    }
    this.pdpPfxPriceFields = { ...PdpPfxPriceFields };

    if (this.pdpData?.subProductType == "RESILIENT_VINYL") {
      if (this.erpProductCategory == "S") {
        this.pdpPfxPriceFields["RESILIENT_VINYL"] = this.pdpPfxPriceFields[
          "RESILIENT_VINYL"
        ].filter((e: any) => e.key == "cartonPriceSF" || e.key == "palletPriceSF");
      } else if (this.erpProductCategory == "B") {
        this.pdpPfxPriceFields["RESILIENT_VINYL"] = this.pdpPfxPriceFields[
          "RESILIENT_VINYL"
        ].filter((e: any) => e.key != "cartonPriceSF");
      }
    }
    if (
      this.pdpDataOptions?.priceDetails?.uom == "ZCT" &&
      this.pdpPricingUOMCode == "ZCT"
    ) {
      this.pdpPfxPriceFields[this.pdpData?.subProductType].filter(
        (item: any) => {
          console.log(
            item,
            this.pdpPricingUOMCode,
            this.pdpDataOptions?.priceDetails?.uom
          );
          if (item?.key == "cartonPriceSF") {
            item.key = "cartonPriceSY";
            item.type = "sq. yd.";
          }
        }
      );
    }
  }

  ngOnInit(): void {
    this.activeRoute.params.subscribe((res: any) => {
      this.activeSlideId = decodeURIComponent(res.code);
    });
    
    // Reset user selection flag when component initializes (new product)
    this.userHasSelectedSize = false;
    
    if (this.colorVariant?.length === 1) {
      this.FromPlpFlag = false;
    }
    if (this.pdpDataOptions?.sizeOptions?.length === 1) {
      this.sizeFlag = false;
    }

    if((this.pdpData?.subProductType == "POWDERS" || this.pdpData?.subProductType == 'TOOLS')){
      this.FromPlpFlag = false;
    }

    // this.productService.getUOMDetails(this.pdpData.code).subscribe(
    //   (res:any) => {

    //     this.erpProductCategory = res?.body?.erpProductCategory;
    //   });
    this.updatePageData();
  }
  updatePageData(updateCarousel = false) {
    let isSizeSelected = localStorage.getItem("pdpSizeNotSelected") == "false";
    if (
      isSizeSelected &&
      this.pdpDataOptions?.otherDetails?.selected?.sellingSizeId
    ) {
      // Only set selectedSizeValue if it's not already set (preserve user selection)
      if (!this.selectedSizeValue) {
        this.selectedSizeValue =
          this.pdpDataOptions?.otherDetails?.selected?.sellingSizeId;
      }
    }
    this.createProductImageForm();
    this.colorVariantPaginationData = this.colorVariant.slice(
      0,
      this.itemPerPage
    );

    this.multiSizeAvailable = false;
    this.colorVariant.forEach((item: any, ind: any) => {
      if (item.value.code === this.activeSlideId) {
        let paginationPage = (ind + 1) / this.itemPerPage;
        let checkPageNumber = Math.trunc((ind + 1) / this.itemPerPage);
        if (paginationPage > checkPageNumber) {
          this.pageIndex = checkPageNumber + 1;
        } else {
          this.pageIndex = checkPageNumber;
        }
        let data = item.value;
        data.size = this.productImageForm.value.size;
        data.backing = this.productImageForm.value.backing;
        this.activeColorName =
          this.pdpDataOptions?.otherDetails?.selected?.sellingColorName;
        this.activeColorId =
          this.pdpDataOptions?.otherDetails?.selected?.sellingColorId;
        this.activePartNumber =
          this.pdpDataOptions?.otherDetails?.selected?.partNumber;
        this.activeSpreadRate =
          this.pdpDataOptions?.otherDetails?.selected?.spreadRate;
        this.selectedProductItem = item.value;
        this.selectedProduct.emit(data);
        this.colorSeletedCheck.emit(this.FromPlpFlag);
        this.sizeSeletedCheck.emit(!data.size);
        this.applicationType =
          this.pdpDataOptions?.otherDetails?.selected?.applicationType;
        // this.currentPage = this.itemPerPage -
        for (let i = 0; i < this.itemPerPage; i++) {
          const j = this.itemPerPage * i - ind;
          if (j > -1) {
            // this.currentPage = i;
            // this.paginNationService.setCurrentPage("paginationRef", i);
            // this.paginNationService.getInstance("paginationRef").currentPage =
            i;
            break;
          }
        }
        // this.tot
      }
      if(item?.value?.multiSize){
        this.multiSizeAvailable = true;
      }
    });
    if (updateCarousel) {
      this.owlCarNew.to(this.pdpDataOptions?.otherDetails?.selected?.code);
    }
    this.setDefaultValue(this.activeSlideId);
    this.userService.getCurrentUserDetail().subscribe((res: any) => {
      // this.inHouseAccount = res.body.orgUnit?.inHouseAccount;
      // this.isSalesOps = res?.body?.isSalesOps;
      // this.uid = res.body.orgUnit?.uid;
      // if (res?.body?.isSalesPerson || res?.body?.isSalesOps) {
      //   this.isSalesPerson = true;
      // }
      if (res?.body?.isCustomer) {
        this.isCustomer = true;
      }
    });
  }
  showOrderSample: any;
  createProductImageForm() {
    this.showOrderSample = this.pdpDataOptions.showOrderSample;
    this.productImageForm = this.fb.group({
      size: [
        this.sizeFlag ? null : this.selectedSizeValue,
        [Validators.required],
      ],
      backing: [null, [Validators.required]],
      colorCode: [
        this.FromPlpFlag ? null : this.activeSlideId,
        [Validators.required],
      ],
    });
    Object.keys(this.productImageForm.controls).forEach((controlName) => {
      const control = this.productImageForm.get(controlName);
      control?.markAsTouched();
      control?.updateValueAndValidity();
    });
  }

  getPassedData(data: SlidesOutputData) {}

  getProductImage(imageurl: any) {
    let swatchImage = imageurl?.includes("https") || false;
    const image = swatchImage
      ? imageurl + "?$xchangeThumb$"
      : "https://s7d4.scene7.com/is/image/MohawkResidential/missing?$xchangeThumb$";
    return image;
  }
  getswatchRoomImage() {
    let imageurl = this.missingImage;
    let swatchImageObj: any = this.productImages.find(
      (item) => item["swatchImage"] != undefined
    );
    let roomImage: any = this.productImages.find(
      (item) => item["roomImage"] != undefined
    );
    if (this.viewType === "swatch") {
      imageurl = swatchImageObj.swatchImage;
    } else {
      imageurl = roomImage.roomImage;
    }
    let swatchImage = imageurl?.includes("https") || false;
    const image = swatchImage
      ? imageurl + "?$xchangeThumb$"
      : "https://s7d4.scene7.com/is/image/MohawkResidential/missing?$xchangeThumb$";
    return image;
  }
  onSwitch(data: string) {
    this.viewType = data;
    const anyService = this.owlCar as any;
    const carouselService = anyService.carouselService as any;
    carouselService.register("");
    carouselService.refresh();
    if (data == "room") {
      this.owlCar.to("product1");
    } else {
      this.owlCar.to("product0");
    }
    this.cd.detectChanges();
  }

  bsModalRef?: BsModalRef;

  openLightBoxModal(path: string) {
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

  openColorSelectModal() {
    const initialState: ModalOptions = {
      initialState: {
        // Data to  popup
      },
    };
    this.bsModalRef = this.modalService.show(
      SelectColorLightboxComponent,
      Object.assign(initialState, {
        class: "modal-lg modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }
  openOrderSamplepdpModal() {
    let selectedProduct: any = this.selectedProductItem
      ? this.selectedProductItem
      : {};
    selectedProduct["size"] = this.productImageForm?.value?.size;
    selectedProduct["backing"] = this.productImageForm?.value?.backing;
    this.orderSampleClick.emit(selectedProduct);
  }
  onSizeValueChange(value: any, sizeOptions: any) {
    // Track user selection
    this.userHasSelectedSize = true;
    
    let productCode = sizeOptions.filter(function (item: any) {
      if (item.key == value) {
        return item.value.code;
      }
    });
    // this.productClick(productCode[0].value.code, productCode[0].value);
    if (productCode.length > 0) {
      this.productClick(productCode[0].value.code, productCode[0].value);
    } else {
      this.sizeFlag = true;
      this.sizeSeletedCheck.emit(!this.productImageForm.value.size);
    }
  }
  onBackingValueChange(value: any, backingOptions: any) {
    let productCode = backingOptions.filter(function (item: any) {
      if (item.key == value) {
        return item.value.code;
      }
    });
    this.productClick(productCode[0].value.code, productCode[0].value);
  }
  onColorValueChange(code: any, colorVariant: any) {
    console.log("code isss--->", code, colorVariant);
    const productCode = colorVariant.filter(
      (item: any) => item.value?.code === code
    );
    if (productCode.length > 0) {
      this.productClick(productCode[0].value.code, productCode[0].value);
    } else {
      this.FromPlpFlag = true;
      this.sizeFlag = false;
      this.userHasSelectedSize = false; // Reset flag when changing color
      this.productImageForm.controls["size"].setValue(null);
      this.productImageForm.controls["backing"].setValue(null);
      this.colorSeletedCheck.emit(true);
    }
  }
  productClick(code: string, product: any) {
    // Check if this is a different product (different color)
    const isDifferentProduct = this.activeSlideId !== code;
    
    this.FromPlpFlag = false;
    this.sizeFlag = false;
    this.colorSeletedCheck.emit(this.FromPlpFlag);
    
    // Reset user selection flag when changing to different product
    if (isDifferentProduct) {
      this.userHasSelectedSize = false;
    }
    
    let selectedProduct: any = product;
    selectedProduct.size = this.productImageForm.value.size;
    selectedProduct.backing = this.productImageForm.value.backing;
    this.activeColorName = product.sellingColorName;
    this.activeColorId = product.sellingColorId;
    this.activePartNumber = product.partNumber;
    this.activeSpreadRate = product.spreadRate;
    this.selectedProduct.emit(selectedProduct);
    this.selectedProductItem = product;
    this.activeSlideId = code;
    this.droppedDate = product.droppedDate;
    this.applicationType = product.applicationType;
    this.selectedSizeValue = this.productImageForm.value.size;
    this.sizeSeletedCheck.emit(!this.productImageForm.value.size);
    if (code.includes("#")) {
      code = this.replaceHashWithPercentEncoded(code);
    }
    const targetUrl = `/residential/products/details/${code}`;
    if (this.router.url == targetUrl) {
      this.updatePageData();
    } else {
      this.router.navigateByUrl(targetUrl);
    }
  }
  pageIndex: number = 1;
  itemPerPage: number = 6;
  currentPage: number = 0;
  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.colorVariantPaginationData = this.colorVariant.slice(
      startItem,
      endItem
    );
  }
  replaceHashWithPercentEncoded(input: string): string {
    return input.replace(/#/g, "%23");
  }

  viewAllColors() {
    const initialState: ModalOptions = {
      initialState: {
        // Data to  popup
        data: this.colorVariant,
        selectedProduct: this.activeSlideId,
      },
    };
    this.bsModalRef = this.modalService.show(
      XchangeViewAllColorsComponent,
      Object.assign(initialState, {
        id: "viewAllColors",
        class: "modal-xl modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
    this.bsModalRef.content.productCode.subscribe((data: any) => {
      this.productClick(data?.value?.code, data.value);

      // this.router.navigateByUrl("residential/products/details/" + data);
    });
  }

  selectedProductBackingOptions: string = "";
  selectedProductSizeOptions: string = "";
  setDefaultValue(productCode: any) {
    let code = this.pdpDataOptions?.otherDetails?.selected?.code;

    // Only set defaults if form values are empty (new product selection)
    const currentSize = this.productImageForm?.value?.size;
    const currentBacking = this.productImageForm?.value?.backing;

    if (this.pdpDataOptions?.backingOptions.length > 0) {
      this.pdpDataOptions.backingOptions.forEach((element: any) => {
        if (element.value.code == code && !this.FromPlpFlag && !currentBacking) {
          this.productImageForm.patchValue({
            backing: element.key,
          });
        }
      });
    }

    if (this.pdpDataOptions?.sizeOptions.length === 1) {
      this.pdpDataOptions.sizeOptions.forEach((element: any) => {
        if (element.value.code == code && !this.FromPlpFlag && !currentSize) {
          this.productImageForm.patchValue({
            size: element.key,
          });
          this.sizeSeletedCheck.emit(!this.productImageForm.value.size);
        }
      });
    } else {
      // Only set size if no current selection and user hasn't selected a size
      if (!currentSize && !this.userHasSelectedSize) {
        this.productImageForm.patchValue({
          size: this.sizeFlag ? null : this.selectedSizeValue,
        });
        this.sizeSeletedCheck.emit(!this.productImageForm.value.size);
      }
    }
    this.productImageForm.controls["size"].updateValueAndValidity();
  }

  onTableDataChange(event: any) {
    this.pageIndex = event;
  }

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
    stagePadding: 27,
  };

  resetSizeValue() {
    this.selectedSizeValue = null;
    this.productImageForm.value.size = null;
    localStorage.setItem("pdpSizeNotSelected", "true");
  }

  
   
}
