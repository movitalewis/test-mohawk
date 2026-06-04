import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
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
import { ProductColorsConfig } from "../../interfaces/product-colors-config";
import { SwitchButton } from "../../interfaces/switch-button";
import { XchangeImageViewLightBoxComponent } from "../xchange-image-view-light-box/xchange-image-view-light-box.component";
import { UserService } from "../../user/services/user.service";

@Component({
    selector: "xchange-product-image-view",
    templateUrl: "./xchange-product-image-view.component.html",
    styleUrls: ["./xchange-product-image-view.component.scss"],
    standalone: false
})
export class XchangeProductImageViewComponent implements OnInit {
  @Input("productImages") productImages!: ProductColorsConfig;
  @ViewChild("owlCar") owlCar!: CarouselComponent;
  @Input() pdpDataOptions: any;
  @Input() colorVariant: any;
  imageBaseUrl =
    "https://s7d4.scene7.com/is/image/MohawkResidential/missing?$xchangeThumb$";

  activeSlideId!: string;

  viewType: string = "swatch";

  switchBtnConfig: SwitchButton = {
    leftLabel: "Swatch",
    leftValue: "swatch",
    rightLabel: "Room View",
    rightValue: "room",
    id: "image-mode",
  };

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
  isMohawkOneuser: boolean = false;

  constructor(
    private cd: ChangeDetectorRef,
    private modalService: BsModalService,
    public userService: UserService
  ) {
    this.userService.getCurrentUserDetail().subscribe({
      next: (res) => {
        this.isMohawkOneuser = res?.body?.isMohawkOneuser;
      }
    })
  }

  ngOnInit(): void {
    this.productImages = [
      {
        swatchImage:
          "https://s7d4.scene7.com/is/image/MohawkResidential/O_28074_717?wid=800&hei=800&cropN=0.3%2c0.3%2c0.4%2c0.4&op_sharpen=1",
        thumbImage:
          "https://s7d4.scene7.com/is/image/MohawkResidential/O_28074_717?wid=800&hei=800&cropN=0.3%2c0.3%2c0.4%2c0.4&op_sharpen=1",
        roomImage: "/assets/images/products/p1-room.svg",
        name: "Crackled Glaze",
        colorCode: "717",
      },
      {
        swatchImage:
          "https://s7d4.scene7.com/is/image/MohawkResidential/O_28074_727?wid=800&hei=800&cropN=0.3%2c0.3%2c0.4%2c0.4&op_sharpen=1",
        thumbImage:
          "https://s7d4.scene7.com/is/image/MohawkResidential/O_28074_727?wid=800&hei=800&cropN=0.3%2c0.3%2c0.4%2c0.4&op_sharpen=1",
        roomImage: "/assets/images/products/p2-room.svg",
        name: "Gleaming Tan",
        colorCode: "727",
      },
      {
        swatchImage:
          "https://s7d4.scene7.com/is/image/MohawkResidential/O_28074_729?wid=800&hei=800&cropN=0.3%2c0.3%2c0.4%2c0.4&op_sharpen=1",
        thumbImage:
          "https://s7d4.scene7.com/is/image/MohawkResidential/O_28074_729?wid=800&hei=800&cropN=0.3%2c0.3%2c0.4%2c0.4&op_sharpen=1",
        roomImage: "/assets/images/products/p2-room.svg",
        name: "Homestead",
        colorCode: "729",
      },
      {
        swatchImage:
          "https://s7d4.scene7.com/is/image/MohawkResidential/O_28074_732?wid=800&hei=800&cropN=0.3%2c0.3%2c0.4%2c0.4&op_sharpen=1",
        thumbImage:
          "https://s7d4.scene7.com/is/image/MohawkResidential/O_28074_732?wid=800&hei=800&cropN=0.3%2c0.3%2c0.4%2c0.4&op_sharpen=1",
        roomImage: "/assets/images/products/p1-room.svg",
        name: "Adobe",
        colorCode: "732",
      },
      {
        swatchImage:
          "https://s7d4.scene7.com/is/image/MohawkResidential/O_28074_752?wid=800&hei=800&cropN=0.3%2c0.3%2c0.4%2c0.4&op_sharpen=1",
        thumbImage:
          "https://s7d4.scene7.com/is/image/MohawkResidential/O_28074_752?wid=800&hei=800&cropN=0.3%2c0.3%2c0.4%2c0.4&op_sharpen=1",
        roomImage: "/assets/images/products/p1-room.svg",
        name: "Redstone Lasso",
        colorCode: "752",
      },
    ];
  }

  getPassedData(data: SlidesOutputData) {
    this.activeSlideId =
      data && data.slides && data.slides[0] && data.slides[0].id
        ? data.slides[0].id
        : "";
  }

  getProductImage(imageurl: any) {
    let swatchImage = imageurl.includes("https");
    return swatchImage? imageurl + "?$xchangeThumb$":"https://s7d4.scene7.com/is/image/MohawkResidential/missing?$xchangeThumb$";
   // return image + "$xchangeThumb$";
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
    const initialState: ModalOptions = {
      initialState: {
        // Data to  popup
      },
    };
    this.bsModalRef = this.modalService.show(
      PlpShippingAddressComponent,
      Object.assign(initialState, {
        id: "PlpShippingAddressComponent",
        class: "modal-lg modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }
}
