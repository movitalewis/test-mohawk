import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { commercialMenuIsCSR } from "src/app/features/shared/constants/menu/commercial.config";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";

@Component({
    selector: "app-post-modification-product-catalog-list",
    templateUrl: "./post-modification-product-catalog-list.component.html",
    styleUrls: ["./post-modification-product-catalog-list.component.scss"],
    standalone: false
})
export class PostModificationProductCatalogListComponent implements OnInit {
  productListing = commercialMenuIsCSR[0].subNav;
  constructor(private activateRoute: ActivatedRoute) {}
  order_number: any;
  ngOnInit(): void {
    this.productListing?.filter((c: any) => {
      if (c.name == "Soft Surface") {
        c.imgUrl = "https://s7d4.scene7.com/is/image/MohawkResidential/H4108_151_354_454_63010_925_room_00?$mhgThumbnail$";
        c.subNav = c?.subNav?.filter((sb: any) => (sb?.name == "Carpet Tile" || sb?.name == "Broadloom" || sb?.name == "View All"));
      } else if (c.name == "Hard Surface") {
        c.imgUrl = "https://s7d4.scene7.com/is/image/MohawkResidential/67929_948_room_00?$mhgThumbnail$";
        c.subNav = c?.subNav?.filter((sb: any) => (sb?.name == "Luxury Vinyl Tile (LVT)" || sb?.name == "Rubber" || sb?.name == "Wood" || sb?.name == "Laminate" || sb?.name == "Non-Vinyl Resilient" || sb?.name == "HOMOGENEOUS_RESILIENT_TILE" || sb?.name == "HVT" || sb?.name == "Resilient Sheet" || sb?.name == "View All"));
      } else if (c.name == "Accessories") {
        c.imgUrl = "https://s7d4.scene7.com/is/image/MohawkResidential/Architectural_Wall_Base_Straight_Cut_AWB01-4_5?$mhgThumbnail$";
        c.subNav = c?.subNav?.filter((sb: any) => (sb?.name == "Adhesives and Sundries" || sb?.name == "Underlayment"|| sb?.name == "Cushion / Pad"|| sb?.name == "Trim And Transition"|| sb?.name == "Wall Base"|| sb?.name == "Stair Tread" || sb?.name == "View All"));
      } else if (c.name == "Sample") {
        c.imgUrl = "https://s7d4.scene7.com/is/image/MohawkResidential/8M039_535_room_01?$mhgThumbnail$";
        c.subNav = c?.subNav?.filter((sb: any) => (sb?.name == "Default Sample" || sb?.name == "View All Sample"));
      }
    });

    this.activateRoute.params.subscribe((params: any) => {
      
      this.order_number = params?.order_number;
    });
  }
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
        "commercial/post-modification/products?name=Soft Surface&page=Carpet Tile&type=CARPET_TILE",
      titleList2: "Broadloom",
      titleList2Link:
        "commercial/post-modification/products?name=Soft Surface&page=Broadloom&type=BROADLOOM",

      viewLink:
        "commercial/post-modification/products?name=Soft Surface&page=View All Soft Surface&type=SOFTSURFACE",
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
        "commercial/post-modification/products?name=Hard Surface&page=Luxury Vinyl Tile (LVT)&type=LVT",
      titleList2: "Rubber",
      titleList2Link:
        "commercial/post-modification/products?name=Hard Surface&page=Rubber&type=RUBBER",
      titleList3: "Wood",
      titleList3Link:
        "commercial/post-modification/products?name=Hard Surface&page=Wood&type=WOOD",
      titleList4: "Laminate",
      titleList4Link:
        "commercial/post-modification/products?name=Hard Surface&page=Laminate&type=LAMINATE",
      titleList5: "Non-Vinyl Resilient",
      titleList5Link:
        "commercial/post-modification/products?name=Hard Surface&page=Non-Vinyl Resilient&type=NON_VINYL_RESILIENT",
      titleList6: "Homogeneous Resilient Tile",
      titleList6Link: "commercial/post-modification/products?name=Hard Surface&page=Homogeneous Resilient Tile&type=HOMOGENEOUS_RESILIENT_TILE",
      titleList7: "Resilient Sheet",
      titleList7Link:
        "commercial/post-modification/products?name=Hard Surface&page=Resilient Sheet&type=RESILIENT_SHEET",
      viewLink:
        "commercial/post-modification/products?name=Hard Surface&page=View All Hard Surface&type=HARDSURFACE",
      learnMore: "https://www.mohawkgroup.com/products/hard-surface",
    },
  ];
  accessoriesList: Array<any> = [
    {
      icon: "https://s7d4.scene7.com/is/image/MohawkResidential/Architectural_Wall_Base_Straight_Cut_AWB01-4_5?$mhgThumbnail$",
      iconExt: ".svg",
      title: "Accessories",
      titleList1: "Stair Tread",
      titleList1Link:
        "commercial/post-modification/products?name=Accessories&page=Stair Treads&type=STAIR_TREAD",
      titleList2: "Wall Base",
      titleList2Link:
        "commercial/post-modification/products?name=Accessories&page=Wall Base&type=WALL_BASE",
      titleList3: "Trim And Transition",
      titleList3Link:
        "commercial/post-modification/products?name=Accessories&page=Trim And Transition&type=TRIM_AND_TRANSITION",
      titleList4: "Cushion / Pad",
      titleList4Link:
        "commercial/post-modification/products?name=Accessories&page=Cushion and Pad&type=CUSHION_PAD",
      titleList5: "Underlayment",
      titleList5Link:
        "commercial/post-modification/products?name=Accessories&page=Underlayment&type=UNDERLAYMENT",
      titleList6: "Adhesives and Sundries",
      titleList6Link:
        "commercial/post-modification/products?name=Accessories&page=Adhesives and Sundries&type=ADHESIVES_SUNDRIES",
      viewLink:
        "commercial/post-modification/products?name=Accessories&page=View All Accessories&type=ACCESSORIES",
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
        "commercial/post-modification/products?name=Sample&page=Default Sample&type=DEFAULT_SAMPLE",
      viewLink:
        "commercial/post-modification/products?name=Sample&page=View All Sample&type=SAMPLE",
      learnMore:
        "https://www.mohawkgroup.com/products/accessories?product_type=Adhesives%20and%20Sundries",
    },
  ];

}
