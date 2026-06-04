import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import { ProductService } from "../services/product.service";
import { ProductListService } from "src/app/features/commercial/products/services/product-list.service";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import {  filter, startWith } from "rxjs";
import { PRODUCTS_LIST } from "./plp-facets.constants";
import { StorageService } from "src/app/features/http-services/storage.service";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { ProgressModalComponent } from "src/app/features/shared/components/progress-modal/progress-modal.component";
import { MESSAGE_CONSTANTS } from "src/app/features/shared/constants/MESSAGE-CONSTANTS";
import { ChangeDetectorRef, NgZone } from '@angular/core';

@Component({
    selector: "app-plp",
    templateUrl: "./plp.component.html",
    styleUrls: ["./plp.component.scss"],
    standalone: false
})
export class PlpComponent implements OnInit, AfterViewInit, OnDestroy {
   modalRef?: BsModalRef;
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
      path: "/residential/product-owner",
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
  totalProductsFlag: boolean = false;
  categoryLabel: any = "";
  sort: any = "ascending";
  routerSubscriber: any;
  pagination: any;
  selectedFilters: any = [];
  currentUrl: any;
  scrollerElement: any;
  currentComponent = "PLP";
  productsSubject: any;
  priceLabel: any = "";
  loadingSub: any;
  constructor(
    private productService: ProductService,
    public service: ProductListService,
    private activeRoute: ActivatedRoute,
    private router: Router,
    private storageService: StorageService,
    private modalService: BsModalService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    this.storageService.getItem("userInfo").subscribe((res: any) => {
      this.priceLabel = res?.priceLabel;
    });
    let queryParam: any = this.activeRoute.snapshot.queryParams;
    this.service.currentPage = 0;
    if (queryParam?.selectedFilter) {
      // this.getSelectedFilter();
      this.service.filters.clear();
      this.setFilters(queryParam);
    } else {
    }
    this.routerSubscriber = this.router.events.pipe(
    filter((event: any) => event instanceof NavigationEnd),
    startWith(this.router) // Use startWith to process the initial route immediately
  ).subscribe((event: any) => {
      const activeRoute: any = this.activeRoute;
      if (
        (event instanceof NavigationEnd ||
          (event?.snapshot?.component?.name === "PlpComponent" || activeRoute?.snapshot?.component?.name === "PlpComponent")) &&
          (event?.url?.includes("products") || event?.routerEvent?.url?.includes("products") || this.router.url.includes("products"))
      ) {
        const url = event?.url || event?.routerEvent?.url || activeRoute?._routerState.snapshot?.url || this.router.url;
        if (!url) return;
        
        if (url.includes("search")) {
          let searchStr = url.split("?")[1]?.split("=")[1];
          if (searchStr) {
            this.clearProductList();
            this.service.getSearchProducts(searchStr);
          }
        } else if (url.includes("products") && !url.includes("search")) {
          const urlPath = url.split("?")[0];
          if (this.currentUrl != urlPath) {
            this.currentUrl = urlPath;
            this.activeRoute.queryParams.subscribe(() => this.loadPlpFromCurrentRoute());
          }
        }
      }
    });

    // service.totalProductsFound.subscribe((totalProducts) => {
    //   this.totalProducts = totalProducts;
    // });

    service.productCategory.subscribe((categoryLabel) => {
      this.categoryLabel = categoryLabel;
    },(err)=>{ this.modalService.hide('progressModal');});
    this.productsSubject = service.products$.subscribe((products: any) => {
      this.dataList = [];
      this.totalProducts = 0;
      if (Object.keys(products).length == 0) {
        this.totalProductsFlag = false;
          
        return;
      }
      this.pagination = products?.pagination;
      this.selectedFilters = [];

      if (products?.breadcrumbs) {
        this.getSelectedFilter(products?.breadcrumbs);
        this.updateRouteParams(products?.breadcrumbs);
      } else if (Object.keys(products)?.length != 0) {
        this.getSelectedFilter([]);
        this.updateRouteParams([]);
      }
        

      this.filterList = [];
      let selectedProductType = this.breadCumName
        ?.toUpperCase()
        .replace(" ", "_");
      let relevantProducts: any = [];
      if (selectedProductType == "SOFT_SURFACE") {
        relevantProducts = PRODUCTS_LIST["SOFT_SURFACE"] || [];
      }
      if (selectedProductType == "HARD_SURFACE") {
        relevantProducts = PRODUCTS_LIST["HARD_SURFACE"] || [];
      }
      if (selectedProductType == "TILE") {
        relevantProducts = PRODUCTS_LIST["TILE"] || [];
      }
      if (selectedProductType == "INDOOR/OUTDOOR") {
        relevantProducts = PRODUCTS_LIST["INDOOROUTDOOR"] || [];
      }
      if (selectedProductType == "ACCESSORIES") {
        relevantProducts = PRODUCTS_LIST["ACCESSORIES"] || [];
      }
      if (selectedProductType == "MERCHANDISING") {
        relevantProducts = PRODUCTS_LIST["MERCHANDISING"] || [];
      }

      const matchingFilter = relevantProducts.find(
        (filter: any) => filter.type === this.pageName
      );

      let facetList = products?.facets || [];

      if (matchingFilter) {
        // Filter the list based on matching facets
        this.filterList = facetList.filter((facet: any) => {
          return matchingFilter.facets.some(
            (constantFacet: any) => facet.code === constantFacet
          );
        });
      } else {
      }
      const queryParamaps: any = this.activeRoute.snapshot.queryParams;
      if (this.filterList.length === 0 && queryParamaps?.search != "") {
        this.filterList = [...facetList];
      }

      // this.productList = [];
      this.ngZone.run(() => {
         this.dataList = products?.products || [];
      const slicedProducts = products?.products?.slice(
        products?.pagination.currentPage * products?.pagination.pageSize,
        this.dataList.length
      );
      this.cdr.detectChanges();
    });
     
      // this.dataList.forEach((item: any) => {
      //   // item.isLoading = true;
      // });
      // this.getProductStyles(slicedProducts);
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
      this.totalProductsFlag = true;
       this.ngZone.run(() => {
       
      });
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
    },(err)=>{ this.modalService.hide('progressModal');});
    this.getQueryParamFromUrl();
    // this.service.sort = "newest";
    this.service.sort = "relevance";
  }
  setFilters(queryParam: any) {
    JSON.parse(queryParam?.selectedFilter).forEach((element: any) => {
      let keyName = Object.keys(element)[0];
      if (!this.service.filters.has(keyName)) {
        this.service.filters.set(keyName, element[keyName].split());
      } else {
        let newArray = this.service.filters.get(keyName);
        newArray.push(...element[keyName].split());
        this.service.filters.set(keyName, newArray);
      }
    });
  }
  clearProductList() {
    this.service.products$.next({});
    this.service.filters.clear();
  }

  loadPlpFromCurrentRoute(): void {
    const params: any = this.activeRoute.snapshot.queryParams;
    if (params?.name && params?.type) {
      this.service.selctedCommercialPlpTypes =
        this.service.ResidentialPlpTypes[params?.type] || params?.type;
      this.service.productCategoryName = params?.name
        ? params.name.replace(/ /g, "").toLowerCase()
        : "";
    }
    this.service.updateProductCategory();
    this.service.sort = "relevance";
    const isSearchUrl = typeof window !== "undefined" && window.location.href.includes("search");
    if (this.service.productListLoading$.getValue() === false && !isSearchUrl) {
      this.clearProductList();
      const queryParam = this.activeRoute.snapshot.queryParams;
      if (queryParam?.["selectedFilter"]) {
        this.setFilters(queryParam);
      }
      this.service.getProducts(true, true);
    }
  }

  // getProductStyles(products: any) {
  //   let styleDetails: any = [];
  //   products?.forEach((item: any) => {
  //     const itemVal = {
  //       styleNumber: item.styleId,
  //       productCategory: item.subCategoryCode,
  //       sizeCode: "",
  //       backingCode: "",
  //       sellingGroup: "",
  //       styleName: "",
  //       code: item.code,
  //     };
  //     styleDetails.push(itemVal);
  //   });
  //   const payload = {
  //     collection: "",
  //     promoFlg: "0",
  //     sortBy: "",
  //     orderOfSort: "",
  //     isDownloadable: false,
  //     futurePrice: false,
  //     currentPage: this.service.currentPage,
  //     recordsPerPage: this.service.pageSize,
  //     startRow: "",
  //     endRow: "",
  //     styleDetails: styleDetails,
  //   };
  //   this.productService.getPlpPriceSearch(payload).subscribe((res: any) => {
  //     this.dataList.filter((el: any) => {
  //       let priceTag: any;
  //       res.body?.result?.filter((item: any) => {
  //         if (item.code === el.code) {
  //           if (item?.minPrice >= 0 && item?.maxPrice > 0) {
  //             item.minPrice = item?.minPrice.toFixed(2);
  //             item.maxPrice = item?.maxPrice.toFixed(2);
  //             let price =
  //               item?.minPrice == item?.maxPrice
  //                 ? item?.minPrice
  //                 : item?.minPrice + " - " + item?.maxPrice;
  //             if (item?.uom == "YDK") {
  //               priceTag = `${this.priceLabel} ${price} / sq. yd.`;
  //             } else if (item?.uom == "FTK") {
  //               priceTag = `${this.priceLabel} ${price} / sq. ft.`;
  //             } else if (item?.uom == "EA") {
  //               priceTag = `${this.priceLabel} ${price} / ea.`;
  //             }
  //           }
  //         }
  //       });
  //       el.priceTag = priceTag ? priceTag : "Pricing N/A";
  //       el.isLoading = false;
  //     });
  //   });
  // }
  @ViewChild("scrollToTop", { read: ElementRef }) scrollToTop: any;
  scrollPageToTop() {
    document.getElementById("mainPage")?.scrollIntoView(true);
  }
  // getSelectedFilter(queryParams: any) {
  //   let query = queryParams;

  //   queryParams.forEach((element: any) => {
  //     this.selectedFilters = [
  //       ...this.selectedFilters,
  //       ...element?.facetValueCode?.split(","),
  //     ];
  //   });
  // }
  getSelectedFilter(queryParams: any) {
    if (queryParams.length > 0) {
      queryParams.forEach((element: any) => {
        this.selectedFilters = [
          ...this.selectedFilters,
          ...element?.facetValueCode?.split(",").map((ele: any) => {
            return {
              name:
                element?.facetValueCode?.split(",")?.length < 2
                  ? element?.facetValueName
                  : ele,
              value: ele,
            };
          }),
        ];
      });
    } else {
      this.selectedFilters = [];
    }
  }
  updateRouteParams(queryParams: any) {
    let updateQueryParams: any = [];
    queryParams.forEach((element: any) => {
      // let data = {
      //   facetCode: element.facetCode,
      //   facetValueCode: element.facetValueCode,
      // };
      let data: any = {};
      (data[element.facetCode] = element.facetValueCode),
        updateQueryParams.push(data);
    });
    let finalQuery: any;
    if (updateQueryParams.length) {
      finalQuery = {
        ...this.activeRoute.snapshot.queryParams,
        ...{ selectedFilter: JSON.stringify(updateQueryParams) },
      };
      this.router.navigate([], {
        relativeTo: this.activeRoute,
        queryParams: finalQuery,
        queryParamsHandling: "merge", // remove to replace all query params by provided
      });
    } else {
      this.clearFilter(true);
    }
  }
  ngOnDestroy(): void {
    this.loadingSub?.unsubscribe();
    this.currentComponent = "";
    this.routerSubscriber?.unsubscribe();
    this.productsSubject?.unsubscribe();
    this.modalService.hide("progressModal");
    this.service.productListLoading$.next(false);
    this.service.products$.next({});
    this.scrollerElement?.removeEventListener("scroll", (ev: any) => {});
  }
  componentInitialized = false;
  ngOnInit(): void {
    this.loadingSub = this.service.productListLoading$.subscribe((isLoading: boolean) => {
      if (isLoading) {
        this.openProgressModal({
          modalHeaderText: this.plpMessages?.headerText,
          progressText: this.plpMessages?.bodyText,
          progressBarText: this.plpMessages?.barText
        });
      } else {
        this.modalService.hide('progressModal');
      }
    },(err)=>{ this.modalService.hide('progressModal');});
    localStorage.removeItem("plpUrl");
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        // Scroll to the top of the page
        window.scrollTo(0, 0);
        this.scrollPageToTop();
      });
    // this.getPlpDetails();
    // this.breadcrumbItems.p
    setTimeout(() => {
      this.scrollerElement =

      document.querySelectorAll(".custom-scrollbar");
      this.scrollerElement = document.getElementById("mainPage");

      this.scrollerElement.addEventListener("scroll", (ev: any) => {
        if (this.currentComponent === "PLP") {
          this.getNextProducts(ev);
          this.componentInitialized = true;
        }
      });
    }, 0);

   
    const url = this.router.url;
    if (url.includes("products") && !url.includes("search")) {
      const params = this.activeRoute.snapshot.queryParams;
      if (params?.["name"] && params?.["type"]) {
        setTimeout(() => this.loadPlpFromCurrentRoute(), 0);
      }
    }
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
        this.breadCumName?.toUpperCase().replace(" ", "")
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
      // this.service.sort = "newest";
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
    this.service.currentPage = 0;
    this.service.getProducts(false);
    this.cdr.detectChanges();

  }

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
      (err) => {this.modalService.hide('progressModal')}
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
        let keyName = Object.keys(element)[0];
        if (element[keyName].split(",").includes(item)) {
          let k = element[keyName].split(",");
          const val = k.indexOf(item);
          k.splice(val, 1);
          k = k.join(",");
          element[keyName] = k;
        }

        newFilters.push(element);
      });
    }

    let finalFilter = newFilters.filter((elemnt: any) => {
      let keyName = Object.keys(elemnt)[0];
      return elemnt[keyName] != "";
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

      this.service.getProducts(true, true);
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
    plpMessages = MESSAGE_CONSTANTS?.plp;
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
