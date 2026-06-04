import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from "@angular/core";
import { ProductListService } from "src/app/features/commercial/products/services/product-list.service";
import { SharedService } from "src/app/features/http-services/shared.service";
import { ProductList } from "../../interfaces/product-list";
import { XchangeDataLayerService } from "src/app/features/http-services/data-layer.service";
import { Router } from "@angular/router";

@Component({
    selector: "xchange-products-list",
    templateUrl: "./xchange-products-list.component.html",
    styleUrls: ["./xchange-products-list.component.scss"],
    standalone: false
})
export class XchangeProductsListComponent implements OnInit {
  
  @Output() removeItemFromSelected: EventEmitter<any> = new EventEmitter<any>();
  @Input("productList") productList!: ProductList;
  @Input("columnSize") columnSize:  any = 4;
  @Input() isPostOrder: any = false;
  @Input() isWalkOff: any = false;
  @Input() postModificationOrders: any;

  @Input() orderNumber: any = "";
  @ViewChild("productListContainer") productListContainer!: ElementRef;
  @ViewChild("scrollContainer") scrollContainer!: ElementRef;

  itemTobeRemoved: any = {};

  compareList: Array<string> = [];

  constructor(
    private sharedService: SharedService,
    public productListService: ProductListService,
    private dataLayer: XchangeDataLayerService,
    public router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.dataLayer.viewItemList(
        this.router?.url || "",
        "product-listing",
        
        this.productList.map((product: any, index: number) => {
       
         
          return {
            item_id: product?.firstVariantCode || product?.code || "",
            item_name: product?.name || product?.styleName || "",
            index,
            item_brand: product?.brandName || product?.brand || "",
            item_category:
              product?.subCategoryCode ||
              product?.subProductType ||
              product?.subCategoryName ||
              "",
            item_category2: product?.productLine || product?.collection || "",
            item_category3: product?.styleName || "",
            item_category4: "",
            item_list_id: this.router?.url || "",
            item_list_name: "product-listing",
            item_variant: `${product?.productLine || ""} ${
              product?.styleName || ""
            }`,
            price: parseFloat(product?.priceTag?.match(/[\d\.]+/)) || 0,
            quantity: 1,
            uom: product?.priceTag?.split(" / ")[1] || "",
          };

        })
        
      );
      
      
    }, 2000);
  }

  handleCompareProduct(data: any) {

    if (data.type === "add") {
      if (this.compareList.length <= 2) {
        this.compareList.push(data.data);
      } else {
        this.sharedService.setuntickUnselectedProducts(data.data);
      }
    } else {
      this.compareList = this.compareList.filter((p) => p !== data.data);
    }
  }
  removeSelectedData(data: any) {
    this.itemTobeRemoved = data;
    this.handleCompareProduct({ type: "remove", data: data });
  }
  scrollToTop() {
    this.productListContainer.nativeElement.scrollTop = 0;
  }
  scrollToBottom() {
    this.productListContainer.nativeElement.scrollTop =
      this.productListContainer.nativeElement.scrollHeight;
  }
  scrollToIndex(index: number) {
    const productContainers =
      this.productListContainer.nativeElement.querySelectorAll(
        ".product-container"
      );
    if (index >= 0 && index < productContainers.length) {
      const productContainer = productContainers[index];
      this.productListContainer.nativeElement.scrollTo({
        top: productContainer.offsetTop,
        behavior: "smooth",
      });
    }
  }
  onScroll() {
    const scrollTop = this.productListContainer.nativeElement.scrollTop;
    const scrollHeight = this.productListContainer.nativeElement.scrollHeight;
    const clientHeight = this.productListContainer.nativeElement.clientHeight;
    const scrollbar =
      this.scrollContainer.nativeElement.querySelector(".scrollbar");

    // Delay setting scrollbar height and position by 100 milliseconds
    setTimeout(() => {
      scrollbar.style.height = `${
        (clientHeight * clientHeight) / scrollHeight
      }px`;
      scrollbar.style.top = `${(scrollTop * clientHeight) / scrollHeight}px`;
    }, 100);
  }
}
