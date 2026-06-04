import { Component, OnInit } from "@angular/core";
import { StorageService } from "src/app/features/http-services/storage.service";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { ProgressModalComponent } from "src/app/features/shared/components/progress-modal/progress-modal.component";
import { MESSAGE_CONSTANTS } from "src/app/features/shared/constants/MESSAGE-CONSTANTS";
@Component({
    selector: "app-product-owner",
    templateUrl: "./product-owner.component.html",
    styleUrls: ["./product-owner.component.scss"],
    standalone: false
})
export class ProductOwnerComponent implements OnInit {
  modalRef?: BsModalRef;
  breadcrumbItems: BreadcrumbItems = [
    {
      name: "Home",
      path: "/commercial",
      active: false,
    },

    {
      name: "Product Catalog",
      path: "/",
      active: true,
    },
  ];

  softSurfaceList: Array<any> = [
    {
      icon: "https://s7d4.scene7.com/is/image/MohawkResidential/H4108_151_354_454_63010_925_room_00?$mhgThumbnail$",
      iconExt: ".svg",
      title: "Soft Surface",
      titleList1: "Carpet Tile",
      titleList1Link:
        "commercial/products?name=Soft Surface&page=Carpet Tile&type=CARPET_TILE",
      titleList2: "Broadloom",
      titleList2Link:
        "commercial/products?name=Soft Surface&page=Broadloom&type=BROADLOOM",

      viewLink:
        "commercial/products?name=Soft Surface&page=View All Soft Surface&type=SOFTSURFACE",
      learnMore: "https://www.mohawkgroup.com/products/soft-surface",
    },
  ];

  hardSurfaceList: Array<any> = [
    {
      icon: "https://s7d4.scene7.com/is/image/MohawkResidential/67929_948_room_00?$mhgThumbnail$",
      iconExt: ".svg",
      title: "Hard Surface",
      titleList1: "Luxury Vinyl Tile (LVT)",
      titleList1Link:
        "commercial/products?name=Hard Surface&page=Luxury Vinyl Tile (LVT)&type=LVT",
      titleList2: "Rubber",
      titleList2Link:
        "commercial/products?name=Hard Surface&page=Rubber&type=RUBBER",
      titleList3: "Wood",
      titleList3Link:
        "commercial/products?name=Hard Surface&page=Wood&type=WOOD",
      titleList4: "Laminate",
      titleList4Link:
        "commercial/products?name=Hard Surface&page=Laminate&type=LAMINATE",
      titleList5: "Non-Vinyl Resilient",
      titleList5Link:
        "commercial/products?name=Hard Surface&page=Non-Vinyl Resilient&type=NON_VINYL_RESILIENT",
      titleList6: "Homogeneous Resilient Tile",
      titleList6Link: "commercial/products?name=Hard Surface&page=Homogeneous Resilient Tile&type=HOMOGENEOUS_RESILIENT_TILE",
      titleList7: "Resilient Sheet",
      titleList7Link:
        "commercial/products?name=Hard Surface&page=Resilient Sheet&type=RESILIENT_SHEET",
      viewLink:
        "commercial/products?name=Hard Surface&page=View All Hard Surface&type=HARDSURFACE",
      learnMore: "https://www.mohawkgroup.com/products/hard-surface",
    },
  ];

  // walkOffList: Array<any> = [
  //   {
  //     icon: "https://s7d4.scene7.com/is/image/MohawkResidential/missing?$Thumbnail$",
  //     iconExt: ".svg",
  //     title: "Walk Off",
  //     titleList1: "Carpet Tile",
  //     titleList1Link: "commercial/products?name=Walk Off&page=Carpet Tile&type=CARPET_TILE",
  //     viewLink: "commercial/products?name=Walk Off&page=View All Walk Off&type=WALKOFFPRODUCT",
  //   },
  // ];

  accessoriesList: Array<any> = [
    {
      icon: "https://s7d4.scene7.com/is/image/MohawkResidential/Architectural_Wall_Base_Straight_Cut_AWB01-4_5?$mhgThumbnail$",
      iconExt: ".svg",
      title: "Accessories",
      titleList1: "Stair Tread",
      titleList1Link:
        "commercial/products?name=Accessories&page=Stair Treads&type=STAIR_TREAD",
      titleList2: "Wall Base",
      titleList2Link:
        "commercial/products?name=Accessories&page=Wall Base&type=WALL_BASE",
      titleList3: "Trim And Transition",
      titleList3Link:
        "commercial/products?name=Accessories&page=Trim And Transition&type=TRIM_AND_TRANSITION",
      titleList4: "Cushion / Pad",
      titleList4Link:
        "commercial/products?name=Accessories&page=Cushion and Pad&type=CUSHION_PAD",
      titleList5: "Underlayment",
      titleList5Link:
        "commercial/products?name=Accessories&page=Underlayment&type=UNDERLAYMENT",
      titleList6: "Adhesives and Sundries",
      titleList6Link:
        "commercial/products?name=Accessories&page=Adhesives and Sundries&type=ADHESIVES_SUNDRIES",
      viewLink:
        "commercial/products?name=Accessories&page=View All Accessories&type=ACCESSORIES",
      learnMore: "https://www.mohawkgroup.com/products/accessories",
    },
  ];

  adhesivesList: Array<any> = [
    {
      icon: "https://s7d4.scene7.com/is/image/MohawkResidential/8M039_535_room_01?$mhgThumbnail$",
      iconExt: ".svg",
      title: "Sample",
      titleList1: "Default Sample",
      titleList1Link:
        "commercial/products?name=Sample&page=Default Sample&type=DEFAULT_SAMPLE",
      viewLink:
        "commercial/products?name=Sample&page=View All Sample&type=SAMPLE",
      learnMore:
        "https://www.mohawkgroup.com/products/accessories?product_type=Adhesives%20and%20Sundries",
    },
  ];

  constructor(
    private storageService:StorageService,
    private modalService: BsModalService, 
  ) {}

  ngOnInit(): void {
    if(this.storageService.userInfo.isProductManager){
      this.breadcrumbItems[0].path += '/product-owner';
    }
    const messageConstants = MESSAGE_CONSTANTS.LandingPage["productCatalog"]
    this.openProgressModal({
      modalHeaderText: messageConstants?.headerText,
      progressText: messageConstants?.bodyText,
      progressBarText: messageConstants?.barText
    });
    setTimeout(() => {
      this.modalService.hide("progressModal");
     }, 2000);
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
}
