import { Location } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Columns, Config, DefaultConfig } from "ngx-easy-table";
import { SharedService } from "src/app/features/http-services/shared.service";
import { StorageService } from "src/app/features/http-services/storage.service";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import { PostModificationProductService } from "../../post-modification-pages/post-modification-services/post-modification-product.service";
import { PostModificationCompareProductService } from "../post-modification-services/post-modification-compare-products.service";

@Component({
    selector: "app-post-modification-products-compare",
    templateUrl: "./post-modification-products-compare.component.html",
    styleUrls: ["./post-modification-products-compare.component.scss"],
    standalone: false
})
export class PostModificationProductsCompareComponent implements OnInit {
  breadcrumbItems: BreadcrumbItems = [
    {
      name: "Home",
      path: "/residential",
      active: false,
    },
    {
      name: "Search Result",
      path: " ",
      active: false,
    },
    {
      name: "Compare",
      path: "/",
      active: true,
    },
  ];

  compareProducts: any;
  selectedProducts: any;
  public configuration!: Config;
  public columns!: Columns[];
  public designColumns!: Columns[];
  public susColumns!: Columns[];

  constructor(
    private cpService: PostModificationCompareProductService,
    private storageService: StorageService,
    private _location: Location,
    private activateRoute: ActivatedRoute,
    private productService: PostModificationProductService
  ) {}

  ngOnInit(): void {
    
    this.configuration = { ...DefaultConfig };
    this.configuration.checkboxes = false;
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;
    this.columns = [
      { key: "sellingBackingName", title: "Style Name" },
      { key: "sellingColorId", title: "Color" },
      { key: "code", title: "# of Colors" },
      { key: "subProductType", title: "Sub Product Type" },
      { key: "quickshipEligible", title: "QuickShip Eligible" },
    ];
    this.designColumns = [
      { key: "sellingSizeId", title: "Size" },
      { key: "density", title: "Density" },
      { key: "fiberType", title: "Fiber Type" },
      { key: "backingMaterial", title: "Backing Material" },
      { key: "dyeMethod", title: "Dye Method" },
      { key: "warranty", title: "Warranty" },
    ];

    this.susColumns = [
      { key: "mindfulMaterail", title: "Mindful Materail" },
      { key: "declareLabel", title: "Declare Label" },
      { key: "lvingProductChallenge", title: "Lving Product Challenge" },
    ];

    this.storageService.getItem("selectedProducts").subscribe((res: any) => {
      this.selectedProducts = res;
     
    });

    // this.cpService.getCompareProducts().subscribe((res: any) => {
    //   this.compareProducts = res;
    
    // });
    let queryParams: any = this.activateRoute.snapshot.queryParams;
    if (Object.keys(queryParams).length > 0) {
      // this.compareProductDetails(JSON.parse(queryParams?.selectedProducts));
    }
    this.storageService.getItem("selectedProducts").subscribe((res: any) => {
      this.selectedProducts = res;
      this.compareProductDetails(this.selectedProducts);
    });
  }

  compareProductDetails(data?: any) {
    
    let queryParam = "";
    data.forEach((element: any, index: number) => {
      if (index == 0) {
        queryParam = queryParam + "compareProducts=" + element.firstVariantCode;
      } else {
        queryParam = queryParam + "&compareProducts=" + element.firstVariantCode;
      }
    });

    let queryParams= data.join(',');
    this.productService
      .compareProducts(`${queryParam}&fields=FULL`)
      .subscribe({
        next: (res) => {
         
          
          this.compareProducts=res?.body?.compareProducts
        },
        error: (err) => {
      
        },
      });
  }

  returnPreviousUrl() {
    this._location.back();
  }

  removeCompareItem(item: any) {
    this.selectedProducts = this.selectedProducts.filter(
      (res: any) => res.code != item.code
    );
  }

  toKeys(a: any) {
    let keys = [];
    for (let key in a) {
      keys.push({ key: key, value: a[key] });
    }    
    return keys;
  }
}
