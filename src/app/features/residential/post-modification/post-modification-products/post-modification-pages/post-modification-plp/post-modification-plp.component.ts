import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  HostListener,
} from "@angular/core";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import { ProductList } from "src/app/features/shared/interfaces/product-list";
import { ProductListService } from "src/app/features/commercial/products/services/product-list.service";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { PostModificationProductService } from "../post-modification-services/post-modification-product.service";
import { OrderService } from "src/app/features/residential/orders/services/order.service";

@Component({
    selector: "app-post-modification-plp",
    templateUrl: "./post-modification-plp.component.html",
    styleUrls: ["./post-modification-plp.component.scss"],
    standalone: false
})
export class PostModificationPlpComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  pageName: string = "";
  breadCumName: string = "";
  productList: any = [];
  dataList: any = [];
  breadcrumbItems: BreadcrumbItems = [
    {
      name: "Home",
      path: "/residential",
      active: false,
    },
    {
      name: "Products",
      path: " ",
      active: false,
    },
    // {
    //   name: "Carpet",
    //   path: " ",
    //   active: false,
    // },

    // {
    //   name: this.pageName.replace("%20", " "),
    //   path: "/",
    //   active: true,
    // },
  ];

  plpDetails: any = [];
  filterList: any = [];
  totalProducts: any = this.dataList.length;
  categoryLabel: any = "";
  sort: any = "ascending";
  routerSubscriber: any;
  pagination: any;
  selectedFilters: any = [];
  currentUrl: any;
  scrollerElement: any;
  currentComponent = "PLP";
  order_number: any;
  constructor(
    private productService: PostModificationProductService,
    public service: ProductListService,
    private activeRoute: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) {
    let queryParam: any = this.activeRoute.snapshot.queryParams;

    this.activeRoute.params.subscribe((param: any) => {
      this.order_number = param.order_number;
      this.getOrderIdDetails();
    });
    this.service.currentPage = 0;
    if (queryParam?.selectedFilter) {
      // this.getSelectedFilter();
      JSON.parse(queryParam?.selectedFilter).forEach((element: any) => {
        this.service.filters.set(
          element?.facetCode,
          element?.facetValueCode.split(",")
        );
      });
    } else {
    }
    this.routerSubscriber = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (event.url.includes("search")) {
          this.activeRoute.queryParams.subscribe((params: any) => {
            this.service.getSearchProducts(params?.search);
          });
        } else {
          if (this.currentUrl != event.url.split("?")[0]) {
            this.currentUrl = event.url.split("?")[0];
            this.activeRoute.queryParams.subscribe((params: any) => {
              if (params?.name && params?.type) {
                this.service.selctedCommercialPlpTypes =
                  this.service.ResidentialPlpTypes[params?.type] ||
                  params?.type;
                this.service.productCategoryName = params?.name
                  ? params.name.replace(/ /g, "").toLowerCase()
                  : "";
              }
              this.service.updateProductCategory();

              this.service.getProducts(true, true);
            });
          }
        }
      }
    });
    // service.totalProductsFound.subscribe((totalProducts) => {
    //   this.totalProducts = totalProducts;
    // });

    service.productCategory.subscribe((categoryLabel) => {
      this.categoryLabel = categoryLabel;
    });
    service.products$.subscribe((products: any) => {
      this.pagination = products?.pagination;
      this.selectedFilters = [];
      this.dataList = [];

      if (products?.breadcrumbs) {
        this.getSelectedFilter(products?.breadcrumbs);
        this.updateRouteParams(products?.breadcrumbs);
      }

      this.filterList = [];
      this.filterList = products?.facets || [];
      this.productList = [];
      this.dataList = products?.products || [];

      // this.dataList.forEach((element:any) => {
      //   element.code=element.product.firstVariantCode   || ""
      // });
      this.dataList.forEach((element: any, index: number) => {
        if (index < Math.round(this.dataList.length / 2))
          element["type"] = "soft";
        else {
          element["type"] = "hard";
        }
      });
      this.totalProducts = products?.pagination?.totalResults; //this.dataList?.products?.length;
      // for (let product of products) {
      //   // this.productList.push({
      //   //   name: "Neutral Shift",
      //   //   image:
      //   //     "https://s7d4.scene7.com/is/image/MohawkResidential/O_28074_717?wid=800&hei=800&cropN=0.3%2c0.3%2c0.4%2c0.4&op_sharpen=1",
      //   //   id: "PM395",
      //   //   type: "12 Colors",
      //   //   category: "Residential Broadloom",
      //   //   price: "$4.99 / sq. ft.",
      //   //   code: product.firstVariantCode || "",
      //   // });
      //   this.dataList[0].code = product.firstVariantCode || "";
      // }
    });
    this.getQueryParamFromUrl();
    this.service.sort = "relevance";
  }
  postModificationOrders: any;
  errorMessage = "";
  getOrderIdDetails() {
    this.orderService
      .getOrderDetails(this.order_number)
      .subscribe((res: any) => {
        // this. = false;
        if (res && res.body && res.body?.errorCode == "error") {
          this.errorMessage = res.body?.errorMessage;
        } else {
          this.errorMessage =
            res.body?.orderHistoryData?.submitOrderError || "";
          this.postModificationOrders = res.body.orderHistoryData[0];
        }
      });
  }
  getSelectedFilter(queryParams: any) {
    let query = queryParams;

    queryParams.forEach((element: any) => {
      this.selectedFilters = [
        ...this.selectedFilters,
        ...element?.facetValueCode?.split(","),
      ];
    });
  }
  updateRouteParams(queryParams: any) {
    let updateQueryParams: any = [];
    queryParams.forEach((element: any) => {
      let data = {
        facetCode: element.facetCode,
        facetValueCode: element.facetValueCode,
      };
      updateQueryParams.push(data);
    });
    let finalQuery: any;
    if (updateQueryParams.length) {
      finalQuery = {
        ...this.activeRoute.snapshot.queryParams,
        ...{ selectedFilter: JSON.stringify(updateQueryParams) },
      };
    } else {
      finalQuery = this.activeRoute.snapshot.queryParams;
    }

    this.router.navigate([], {
      relativeTo: this.activeRoute,
      queryParams: finalQuery,
      queryParamsHandling: "merge", // remove to replace all query params by provided
    });
  }
  ngOnDestroy(): void {
    this.currentComponent = "";
    this.routerSubscriber.unsubscribe();
    this.scrollerElement?.removeEventListener("scroll", (ev: any) => {});
  }
  ngOnInit(): void {
    // this.getPlpDetails();
    // this.breadcrumbItems.p
    setTimeout(() => {
      this.scrollerElement =
        document.querySelectorAll(".custom-scrollbar");
      this.scrollerElement = document.getElementById("mainPage");

      this.scrollerElement.addEventListener("scroll", (ev: any) => {
        if (this.currentComponent === "PLP") {
          this.getNextProducts(ev);
        }
      });
    }, 0);
  }

  ngAfterViewInit() {
    // this.breadcrumbItems.push({
    //   name: this.pageName.replace("%20", " "),
    //   path: "/",
    //   active: true,
    // },)
  }

  getQueryParamFromUrl() {
    this.activeRoute.queryParams.subscribe((params) => {
      this.breadCumName = params[`search`] ? "Search" : params[`name`];
      this.pageName = params[`search`] ? params[`search`] : params[`page`];
      let path =
        "residential/products?name={name}&page=View All {name}&type={type}";
      path = path.replace("{name}", this.breadCumName);
      path = path.replace("{name}", this.breadCumName);
      path = path.replace(
        "{type}",
        this.breadCumName.toUpperCase().replace(" ", "")
      );
      this.breadcrumbItems[2] = {
        name: decodeURIComponent(this.breadCumName),
        path: path,
        active: false,
      };
      this.breadcrumbItems[3] = {
        name: decodeURIComponent(this.pageName),
        path: "",
        active: true,
      };
    });
  }

  clearFilter(e: any) {
    if (this.service.filters.size > 0) {
      let filter: any = JSON.parse(
        JSON.stringify(this.activeRoute.snapshot.queryParams)
      );
      if (filter?.selectedFilter) {
        delete filter["selectedFilter"];
      }
      this.service.sort = "relevance";
      this.service.filters.clear();
      this.router.navigate(["/residential/products"], {
        relativeTo: this.activeRoute,
        queryParams: filter,
        // queryParamsHandling: "merge", // remove to replace all query params by provided
      });
      this.getPlpData();
    }
  }
  getPlpData() {
    this.service.getProducts(false);
  }
  // getPlpDetails() {
  //   const queryParam = {
  //     category: "FLOORINGNASOFTPRODUCT",
  //   };
  //   this.productService.getPlpData(queryParam).subscribe(
  //     (res) => {

  //       this.plpDetails = res.body;
  //       this.productList = [];
  //       // for (let product of res.body.products) {
  //       //   this.productList.push({
  //       //     name: "Neutral Shift",
  //       //     image:
  //       //       "https://s7d4.scene7.com/is/image/MohawkResidential/O_28074_717?wid=800&hei=800&cropN=0.3%2c0.3%2c0.4%2c0.4&op_sharpen=1",
  //       //     id: "PM395",
  //       //     type: "12 Colors",
  //       //     category: "Residential Broadloom",
  //       //     price: "$4.99 / sq. ft.",
  //       //     code: product.firstVariantCode || "",
  //       //   });
  //       // }
  //     },
  //     (err) => {}
  //   );
  // }

  searchPlpRecords() {
    const queryParam = {};
    this.productService.searchPlpRecords(queryParam).subscribe(
      (res) => {
        this.plpDetails = res.body;
        this.productList = [];
        for (let product of res.body.products) {
          this.productList.push({
            name: "Neutral Shift",
            image:
              "https://s7d4.scene7.com/is/image/MohawkResidential/O_28074_717?wid=800&hei=800&cropN=0.3%2c0.3%2c0.4%2c0.4&op_sharpen=1",
            id: "PM395",
            type: "12 Colors",
            category: "Residential Broadloom",
            price: "$4.99 / sq. ft.",
            code: product.firstVariantCode || "",
          });
        }
      },
      (err) => {}
    );
  }
  colorFilter(color: any) {
    this.productList.filter((item: any) => {
      return;
    });
  }
  backingFilter(backing: any) {
    this.productList.filter((item: any) => {
      return;
    });
  }
  sizeFilter(size: any) {
    this.productList.filter((item: any) => {
      return;
    });
  }
  // @HostListener("document:scroll", ["$event"])
  getNextProducts(ev: any) {
    if (this.pagination?.currentPage + 1 < this.pagination?.totalPages) {
      if (
        ev.target.scrollHeight - 11 <
        ev.target.scrollTop + ev.target.offsetHeight
      )
        if (this.router.url.includes("search")) {
          this.activeRoute.queryParams.subscribe((params: any) => {
            this.service.getNexSearchtProductsList(params?.search);
          });
        } else if (!this.service.productListLoading$.getValue()) {
          this.service.getNextProductsList();
        }
    }
  }

  clearIndividualFilter(item: any) {
    let filters: any = this.activeRoute.snapshot.queryParams;
    let newFilters: any = [];
    if (filters?.selectedFilter) {
      JSON.parse(filters?.selectedFilter).forEach((element: any) => {
        if (element.facetValueCode.split(",").includes(item)) {
          let k = element.facetValueCode.split(",");
          const val = k.indexOf(item);
          k.splice(val, 1);
          k = k.join(",");
          element.facetValueCode = k;
        }

        newFilters.push(element);
      });
    }

    let finalFilter = newFilters.filter((elemnt: any) => {
      return elemnt?.facetValueCode != "";
    });

    let finalQuery: any;
    if (finalFilter.length) {
      finalQuery = {
        ...this.activeRoute.snapshot.queryParams,
        ...{ selectedFilter: JSON.stringify(finalFilter) },
      };
      this.router.navigate(["/residential/products"], {
        relativeTo: this.activeRoute,
        queryParams: finalQuery,
        // queryParamsHandling: "merge", // remove to replace all query params by provided
      });

      this.service.filters.forEach((element: any, index: number) => {
        if (element.includes(item)) {
          const val = element.indexOf(item);

          let k = element;

          k.splice(val, 1);

          if (k.length) {
            element = k.join(",");
          } else {
            element = k;
          }

          if (element.length == 0) {
            this.service.filters.delete(index);
          } else {
            this.service.filters.set(index, [element]);
          }
        }
      });

      // this.service.getProducts(true, true);
    } else {
      let filter: any = JSON.parse(
        JSON.stringify(this.activeRoute.snapshot.queryParams)
      );

      if (filter?.selectedFilter) {
        delete filter["selectedFilter"];
      }
      this.service.filters.clear();
      this.service.getProducts(true, true);

      finalQuery = filter;
      this.router.navigate(["/residential/products"], {
        relativeTo: this.activeRoute,
        queryParams: finalQuery,
        // queryParamsHandling: "merge", // remove to replace all query params by provided
      });
      return;
    }
  }
}
