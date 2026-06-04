import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
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
import { PlpShippingAddressComponent } from "src/app/features/residential/products/components/plp-shipping-address/plp-shipping-address.component";
import { SelectColorLightboxComponent } from "src/app/features/residential/products/components/select-color-lightbox/select-color-lightbox.component";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { StorageService } from "src/app/features/http-services/storage.service";
import {
  PageChangedEvent,
  PaginationComponent,
} from "ngx-bootstrap/pagination";
import { XchangeViewAllColorsComponent } from "src/app/features/shared/components/xchange-view-all-colors/xchange-view-all-colors.component";
import { PaginationService } from "ngx-pagination";
import { PdpPfxPriceFields } from "src/app/features/shared/constants/menu/residential.config";
import { ProductColorsConfig } from "src/app/features/shared/interfaces/product-colors-config";
import { SwitchButton } from "src/app/features/shared/interfaces/switch-button";
import { PostModificationProductService } from "../../post-modification-pages/post-modification-services/post-modification-product.service";
import { XchangeImageViewLightBoxComponent } from "src/app/features/shared/components/xchange-image-view-light-box/xchange-image-view-light-box.component";
import { PostModificationPlpOrderSamplesComponent } from "../post-modification-plp-order-samples/post-modification-plp-order-samples.component";
import { OrderService } from "src/app/features/residential/orders/services/order.service";
import { PlpOrderSamplesComponent } from "src/app/features/residential/products/components/plp-order-samples/plp-order-samples.component";
import { PlpOrderSamplesComponent as CommercialPlpOrderSamplesComponent } from "src/app/features/commercial/products/components/plp-order-samples/plp-order-samples.component";
import { UserService } from "src/app/features/shared/user/services/user.service";

@Component({
    selector: "product-post-modification-image-view",
    templateUrl: "./post-modification-product-image-view.component.html",
    styleUrls: ["./post-modification-product-image-view.component.scss"],
    standalone: false
})
export class PostModificationProductImageViewComponent
  implements OnInit, OnChanges, AfterViewInit
{
  @Input("productImages") productImages!: ProductColorsConfig;
  @Input() pdpData: any;
  @ViewChild("owlCar") owlCar!: CarouselComponent;
  @ViewChild("owlCarNew") owlCarNew!: CarouselComponent;
  @Input() pdpDataOptions: any;
  @Input() colorVariant: any;
  @Input() availabilityForms: any;
  @Input() isOrderSampleClickFromParent = false;
  @Output() selectedProduct = new EventEmitter<any>();
  @Output() colorSeletedCheck = new EventEmitter<any>();
  @Output() orderSampleClick = new EventEmitter<any>();
  colorVariantPaginationData: any;
  // @ViewChild("paginationRef") paginationRef!: PaginationService;
  selectedProductItem: any;
  imageBaseUrl =
    "https://s7d4.scene7.com/is/image/MohawkResidential/O_28074_717";
  activeColorName: string = "";
  activeColorId: string = "";
  activeSpreadRate: string = "";
  activePartNumber: string = "";
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
  pdpPfxPriceFields = PdpPfxPriceFields;
  customOptions: OwlOptions = {
    loop: true,
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
  thumbImage =
    "https://s7d4.scene7.com/is/image/MohawkResidential/missing?$xchangeThumb$";
  FromPlpFlag: any;

  constructor(
    private cd: ChangeDetectorRef,
    private modalService: BsModalService,
    private productService: PostModificationProductService,
    private fb: FormBuilder,
    public router: Router,
    private activeRoute: ActivatedRoute,
    private storageService: StorageService,
    private paginNationService: PaginationService,
    public orderService: OrderService,
    public userService: UserService
  ) {
    this.FromPlpFlag = localStorage.getItem('fromPlpFlag') === 'true';
    localStorage.removeItem('fromPlpFlag');
  }
  ngAfterViewInit(): void {
    this.owlCarNew.to(this.pdpDataOptions?.otherDetails?.selected?.code);
  }
  ngOnChanges(changes: SimpleChanges): void {
    let change: any = changes;
    if (change?.pdpDataOptions?.currentValue?.otherDetails?.selected) {
      // this.productSelectedValue =
      //   change?.pdpDataOptions?.currentValue?.otherDetails?.selected;
      this.activeColorName =
        change?.pdpDataOptions?.currentValue?.otherDetails?.selected.sellingColorName;
      this.activeColorId =
        change?.pdpDataOptions?.currentValue?.otherDetails?.selected.sellingColorId;
      this.activePartNumber =
        change?.pdpDataOptions?.currentValue?.otherDetails?.selected.partNumber;
      this.activeSpreadRate =
        change?.pdpDataOptions?.currentValue?.otherDetails?.selected.spreadRate;
      // this.applicationType =
      //   change?.pdpDataOptions?.currentValue?.otherDetails?.selected.applicationType;
    }

    if (!change?.colorVariant?.firstChange) {
      if (change?.colorVariant?.currentValue != undefined) {
        this.updatePageData(true);
      }
    }
  }
  order_number: any;
  moduleName: string = "";
  ngOnInit(): void {
    this.activeRoute.params.subscribe((res: any) => {
      this.order_number = res.order_number;
      this.activeSlideId = decodeURIComponent(res.code);
    });
    if (this.colorVariant?.length === 1) {
      this.FromPlpFlag = false;
    }
    if (window.location.pathname.includes("commercial")) {
      this.moduleName = "/commercial";
    } else {
      this.moduleName = "/residential";
    }
    this.userService.getCurrentUserDetail().subscribe((res: any) => {
    });
    this.updatePageData();
  }
  updatePageData(updateCarousel = false) {
    this.createProductImageForm();
    this.colorVariantPaginationData = this.colorVariant.slice(
      0,
      this.itemPerPage
    );
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
    });
    if (updateCarousel) {
      this.owlCarNew.to(this.pdpDataOptions?.otherDetails?.selected?.code);
    }
    this.setDefaultValue(this.activeSlideId);
  }
  showOrderSample: any;
  createProductImageForm() {
    this.showOrderSample = this.pdpDataOptions.showOrderSample;
    this.productImageForm = this.fb.group({
      size: [null, [Validators.required]],
      backing: [null, [Validators.required]],
      colorCode: [this.FromPlpFlag ? null : this.activeSlideId, [Validators.required]],
     });
     Object.keys(this.productImageForm.controls).forEach(controlName => {
      const control = this.productImageForm.get(controlName);
      control?.markAsTouched(); 
      control?.updateValueAndValidity(); 
    });
  }

  getPassedData(data: SlidesOutputData) {}
  onColorValueChange(code: any, colorVariant: any) {
    console.log("code isss--->", code, colorVariant);
    const productCode = colorVariant.filter((item: any) => item.value?.code === code);
     if (productCode.length > 0) {
        this.productClick(productCode[0].value.code, productCode[0].value);
    } else {
      this.FromPlpFlag= true;
      this.productImageForm.controls["size"].setValue(null);
      this.productImageForm.controls["backing"].setValue(null);
      this.colorSeletedCheck.emit(true);

    }
  }
  getProductImage(imageurl: any) {
    return imageurl + "?$xchangeThumb$";
  }
  onSwitch(data: string) {
    this.viewType = data;
    const anyService = this.owlCar as any;
    const carouselService = anyService.carouselService as any;
    carouselService.register("");
    carouselService.refresh();
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
    if (this.isOrderSampleClickFromParent) {
      return;
    }
    // let selectedProduct: any = this.selectedProductItem
    //   ? this.selectedProductItem
    //   : {};
    // selectedProduct["size"] = this.productImageForm?.value?.size;
    // selectedProduct["backing"] = this.productImageForm?.value?.backing;

    this.orderService
      .getOrderDetails(this.order_number)
      .subscribe((res: any) => {
        if (!res.body.orderHistoryData[0]) {
          const initialState: ModalOptions = {
            initialState: {
              modalRef: this.bsModalRef,
              productColorVariantOptions: this.colorVariant,
              varients: this.colorVariant,
              selectedVarient: this.activeSlideId,
              selectedProduct: selectedProduct,
            },
          };
          this.bsModalRef = this.modalService.show(
            PlpShippingAddressComponent,
            Object.assign(initialState, {
              id: "PlpShippingAddressComponentcommercial",
              class: "modal-lg modal-dialog-centered",
              backdrop: "static",
              keyboard: false,
            })
          );
          this.bsModalRef.content.cartIdNew = res?.body?.code;
        } else {
          const initialState: ModalOptions = {
            initialState: {
              // Data to  popup
              productColorVariantOptions: this.colorVariant,
            },
          };
          this.bsModalRef = this.modalService.show(
            PostModificationPlpOrderSamplesComponent,
            Object.assign(initialState, {
              id: "PlpOrderSamplesComponent",
              class: "modal-xl modal-dialog-centered",
              backdrop: "static",
              keyboard: false,
            })
          );
          this.bsModalRef.content.cartIdNew = res?.code;
        }
      });
  }
  onSizeValueChange(value: any, sizeOptions: any) {
    let productCode = sizeOptions.filter(function (item: any) {
      if (item.key == value) {
        return item.value.code;
      }
    });
    this.productClick(productCode[0].value.code, productCode[0].value);
  }
  onBackingValueChange(value: any, backingOptions: any) {
    let productCode = backingOptions.filter(function (item: any) {
      if (item.key == value) {
        return item.value.code;
      }
    });
    this.productClick(productCode[0].value.code, productCode[0].value);
  }
  productClick(code: string, product: any) {
    this.FromPlpFlag= false;
    this.colorSeletedCheck.emit(this.FromPlpFlag);
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
    const targetUrl = `/residential/post-modification/products/details/${this.order_number}/${code}` 
    // this.router.navigateByUrl(
    //   "residential/post-modification/products/details/" +
    //     this.order_number +
    //     "/" +
    //     code
    // );
    if(this.router.url == targetUrl) {
      console.log('coming ');
      
      this.updatePageData();
    } 
    else {
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

    if (this.pdpDataOptions?.backingOptions.length > 0) {
      this.pdpDataOptions.backingOptions.forEach((element: any) => {
        if (element.value.code == code && !this.FromPlpFlag) {
          this.productImageForm.patchValue({
            backing: element.key,
          });
        }
      });
    }

    if (this.pdpDataOptions?.sizeOptions.length > 0) {
      this.pdpDataOptions.sizeOptions.forEach((element: any) => {
        if (element.value.code == code && !this.FromPlpFlag) {
          this.productImageForm.patchValue({
            size: element.key,
          });
        }
      });

      // this.selectedProductSizeOptions = selectedSizeOptions[0].key;
    }
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
  };
}
