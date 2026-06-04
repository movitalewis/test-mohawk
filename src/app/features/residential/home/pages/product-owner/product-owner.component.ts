import { Component, OnInit } from "@angular/core";
import { StorageService } from "src/app/features/http-services/storage.service";
import { MESSAGE_CONSTANTS } from "src/app/features/shared/constants/MESSAGE-CONSTANTS";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { ProgressModalComponent } from "src/app/features/shared/components/progress-modal/progress-modal.component";

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
      path: "/residential",
      active: false,
    },

    {
      name: "Product Catalog",
      path: "/",
      active: true,
    },
  ];

  productSoftSurfaceList: Array<any> = [
    {
      icon: "https://mohawk.scene7.com/is/image/MohawkResidential/RMC992T62?wid=400&hei=400&fit=crop%2c1&fmt=png8-alpha&op_sharpen=1",
      iconExt: ".svg",
      title: "Soft Surface",
      titleList1: "Residential Broadloom",
      titleList1Link:
        "residential/products?name=Soft Surface&page=Residential Broadloom&type=RESIDENTIAL_BROADLOOM",
      titleList2: "Commercial Broadloom",
      titleList2Link:
        "residential/products?name=Soft Surface&page=Commercial Broadloom&type=COMMERCIAL_BROADLOOM",
      titleList3: "Carpet Tile",
      titleList3Link:
        "residential/products?name=Soft Surface&page=Carpet Tile&type=CARPET_TILE",
      titleList4: "Pad & Cusion",
      titleList4Link:
        "residential/products?name=Soft Surface&page=" +
        encodeURIComponent("Pad & Cushion") +
        "&type=PAD_CUSHION",
      titleList5: "Adhesives",
      titleList5Link:
        "residential/products?name=Soft Surface&page=Adhesivesn&type=ADHESIVES_SOFT",
        viewLink:
        "residential/products?name=Soft Surface&page=View All Soft Surface&type=SOFTSURFACE",
      learnMore:
        "https://www.mohawkflooring.com/carpet",
    },
  ];

  productHardSurfaceList: Array<any> = [
    {
      icon: "https://mohawk.scene7.com/is/image/MohawkResidential/RMHWSC65_62?wid=600&hei=600&fit=crop%2c1&fmt=png8-alpha&op_sharpen=1",
      iconExt: ".svg",
      title: "Hard Surface",
      titleList1: "Resilient Vinyl",
      titleList1Link:
        "residential/products?name=Hard Surface&page=Resilient Vinyl&type=RESILIENT_VINYL",
      titleList2: "Wood & Laminate",
      titleList2Link:
        "residential/products?name=Hard Surface&page=" +
        encodeURIComponent("Wood & Laminate") +
        "&type=WOOD_LAMINATE",
      titleList3: "Underlayment",
      titleList3Link:
        "residential/products?name=Hard Surface&page=Underlayment&type=UNDERLAYMENT",
      titleList4: "Adhesives",
      titleList4Link:
        "residential/products?name=Hard Surface&page=Adhesives&type=ADHESIVES_HARD",
      titleList5: "Care & Maintenance",
      titleList5Link:
        "residential/products?name=Hard Surface&page=" +
        encodeURIComponent("Care & Maintenance") +
        "&type=CARE_MAINTENANCE",
      viewLink:
      "residential/products?name=Hard Surface&page=View All Hard Surface&type=HARDSURFACE",
      learnMore:
        "https://www.mohawkflooring.com/wood",
    },
  ];

  productTileList: Array<any> = [
    {
      icon: "https://mohawk.scene7.com/is/image/MohawkResidential/T838_DV01_00?wid=600&hei=600&fit=crop%2c1&fmt=png8-alpha&op_sharpen=1",
      iconExt: ".svg",
      title: "Tile",
      titleList1: "Ceramic",
      titleList1Link:
        "residential/products?name=Tile&page=Ceramic&type=CERAMIC",
      titleList2: "Porcelain",
      titleList2Link:
        "residential/products?name=Tile&page=Porcelain&type=PORCELAIN",
      titleList3: "Trim and Accents",
      titleList3Link:
        "residential/products?name=Tile&page=Trim and Accents&type=TRIM_ACCENTS",
      titleList4: "Natural Stone",
      titleList4Link:
        "residential/products?name=Tile&page=Natural Stone&type=NATURAL_STONE",
      titleList5: "Decorative Accessories",
      titleList5Link:
        "residential/products?name=Tile&page=Decorative Accessories&type=DECORATIVE_ACCESSORIES",
      viewLink: "residential/products?name=Tile&page=View All Tile&type=TILE",
       learnMore:"",
    },
  ];

  productIndoorList: Array<any> = [
    {
      icon: "https://mohawk.scene7.com/is/image/MohawkResidential/RMHWSC65_62?wid=600&hei=600&fit=crop%2c1&fmt=png8-alpha&op_sharpen=1",
      iconExt: ".svg",
      title: "Indoor/Outdoor",
       titleList1: "Needlepunch Broadloom",
      titleList1Link:
        "residential/products?name=Indoor%2FOutdoor&page=Needlepunch%20Broadloom&type=NEEDLEPUNCH_BROADLOOM",
      titleList2: "Needlepunch Tile",
      titleList2Link:
        "residential/products?name=Indoor%2FOutdoor&page=Needlepunch%20Tile&type=NEEDLEPUNCH_TILE",
      // titleList3: "Sales Tools",
      // titleList3Link:
      //   "residential/products?name=Merchandising&page=Sales Tools&type=SALES_TOOLS",
      // titleList4: "Graphics and Stickers",
      // titleList4Link:
      //   "residential/products?name=Merchandising&page=Graphics and Stickers&type=GRAPHICS_AND_STICKERS",
      viewLink:
        "residential/products?name=Indoor%2FOutdoor&page=Indoor%2FOutdoor&type=INDOOROUTDOOR",
        learnMore:"",
    },
  ];

  productAccessoriesList: Array<any> = [
    {
      icon: "https://mohawk.scene7.com/is/image/MohawkResidential/RMVRVL44_20?wid=600&hei=600&fit=crop%2c1&fmt=png8-alpha&op_sharpen=1",
      iconExt: ".svg",
      title: "Accessories",
      titleList1: "Trim and Moldings",
      titleList1Link:
        "residential/products?name=Accessories&page=Trim and Moldings&type=TRIM_AND_MOLDINGS",
      titleList2: "Wall Base & Stair Solutions",
      titleList2Link:
        "residential/products?name=Accessories&page=" +
        encodeURIComponent("Wall Base & Stair Solutions") +
        "&type=WALL_BASE_AND_STAIR_SOLUTIONS",
      titleList3: "Installation Kits & Tools",
      titleList3Link:
        "residential/products?name=Accessories&page=" +
        encodeURIComponent("Installation Kits & Tools") +
        "&type=INSTALLATION_KITS_AND_TOOLS",
      titleList4: "Installation Kits & Tools",
      titleList4Link:
        "residential/products?name=Accessories&page=tools&type=TOOLS",
      titleList5: "Installation Kits & Tools",
      titleList5Link:
        "residential/products?name=Accessories&page=Powders&type=POWDERS",
      viewLink: "residential/products?name=Accessories&page=View All Accessories&type=ACCESSORIES",
      learnMore:
        "https://mohawktoday.com",
    },
  ];

  // productSampleList: Array<any> = [
  //   {
  //     icon: "https://s7d4.scene7.com/is/image/MohawkResidential/spray-bottle-no-logo",
  //     iconExt: ".svg",
  //     title: "Sample",
  //     titleList1: "Default Sample",
  //     titleList1Link:
  //       "residential/products?name=Sample&page=Default Sample&type=DEFAULT_SAMPLE",
  //     viewLink:
  //       "residential/products?name=Sample&page=View All Sample&type=SAMPLE",
  //   },
  // ];

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
