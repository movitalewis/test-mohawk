import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  ChangeDetectorRef,
  NgZone,
} from "@angular/core";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import { ProductList } from "src/app/features/shared/interfaces/product-list";
import { ProductListService } from "../../services/product-list.service";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { float } from "html2canvas/dist/types/css/property-descriptors/float";
import { Subject, filter } from "rxjs";
import { PRODUCTS_LIST } from "./plp-facets.constants";
import { StorageService } from "src/app/features/http-services/storage.service";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { ProgressModalComponent } from "src/app/features/shared/components/progress-modal/progress-modal.component";
import { MESSAGE_CONSTANTS } from "src/app/features/shared/constants/MESSAGE-CONSTANTS";
@Component({
    selector: "app-plp",
    templateUrl: "./plp.component.html",
    styleUrls: ["./plp.component.scss"],
    standalone: false
})
export class PlpComponent implements OnInit, OnDestroy, AfterViewInit {
  pageName: string = "";
  modalRef?: BsModalRef;
  breadCumName: string = "";
  productList: any[] = [];
  isWalkOff: boolean = false;
  categoryLabel: any = "";
  breadcrumbItems: BreadcrumbItems = [
    {
      name: "Home",
      path: "/commercial",
      active: false,
    },
    {
      name: "Products",
      path: "/commercial/product-owner",
      active: false,
    },
  ];
  pagination: any;
  selectedFilters: any = [];

  dataList: any = [];
  filterList: any = [];
  totalProducts = this.dataList.length;
  totalProductsFlag: boolean = false;
  currentUrl: any;
  scrollerElement: any;
  currentComponent = "PLP";
  productsSubject: any;
  priceLabel: any = "";

  constructor(
    public service: ProductListService,
    private activeRoute: ActivatedRoute,
    private element: ElementRef,
    private router: Router,
    private storageService: StorageService,
    private modalService: BsModalService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
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
    this.routerSubscriber = this.router.events.subscribe((event: any) => {
      const activeRoute: any = this.activeRoute;
      if (
        (event instanceof NavigationEnd ||
        (event?.snapshot?.component?.name === "PlpComponent" || activeRoute?.snapshot?.component?.name === "PlpComponent")) &&
        (event?.url?.includes("products") || event?.routerEvent?.url?.includes("products"))
      ) {
        const url = event?.url || event?.routerEvent?.url || activeRoute?._routerState.snapshot?.url;
        if (url.includes("search")) {
          let searchStr = url.split("?")[1].split("=")[1];
          this.clearProductList();
          this.zone.run(() => {
            this.service.getSearchProducts(searchStr);
            this.cdr.detectChanges();
          })
          // this.activeRoute.queryParams.subscribe((params: any) => {
          //   if (!this.service.productListLoading) {
          //     this.clearProductList();
          //     this.service.getSearchProducts(params?.search);
          //   }
          // });
        } else {
          if (this.currentUrl != url.split("?")[0]) {
            this.currentUrl = url.split("?")[0];
            this.activeRoute.queryParams.subscribe((params1: any) => {
              const params: any = this.activeRoute.snapshot.queryParams;
              if (params?.name && params?.type) {
                this.service.selctedCommercialPlpTypes =
                  this.service.CommercialPlpTypes[params?.type] || params?.type;
                this.service.productCategoryName = params?.name
                  ? params.name.replace(/ /g, "").toLowerCase()
                  : "";
              }
              this.service.updateProductCategory();
              this.service.sort = "relevance";
              if (this.service.productListLoading$.getValue() === false && window.location.href.includes("search") == false) {
                this.clearProductList();
                queryParam = this.activeRoute.snapshot.queryParams;
                if (queryParam.hasOwnProperty("selectedFilter")) {
                  this.setFilters(queryParam);
                }
                this.service.getProducts(true, true);
              }
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
    this.productsSubject = service.products$.subscribe((products: any) => {
      this.dataList = [];
      this.totalProducts = 0;
      if (Object.keys(products).length == 0) {
        this.zone.run(() => {
          this.totalProductsFlag = false;
          this.cdr.detectChanges();
          return;

        })
      } else {
        this.totalProductsFlag = true;
        this.totalProducts = products?.pagination?.totalResults;
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
      if (selectedProductType == "ACCESSORIES") {
        relevantProducts = PRODUCTS_LIST["ACCESSORIES"] || [];
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
   
      this.zone.run(() => {
           this.dataList = products?.products || [];
      
      const slicedProducts = products?.products?.slice(
        products?.pagination.currentPage * products?.pagination.pageSize,
        this.dataList.length
      );
      
        this.cdr.detectChanges();
      });
      // this.dataList.forEach((item: any) => {
      //   item.isLoading = true;
      // });
      // this.getProductStyles(slicedProducts);
      // this.dataList.forEach((element:any) => {
      //   element.code=element.product.firstVariantCode   || ""
      // });
     
    },(err)=>{
      this.modalService.hide('progressModal');
    });
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
  //   this.service.getPlpPriceSearch(payload).subscribe((res: any) => {
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
    this.currentComponent = "";
    this.routerSubscriber?.unsubscribe();
    this.productsSubject?.unsubscribe();
    this.loadingSub?.unsubscribe();
    this.modalService.hide("progressModal");
    this.service.productListLoading$.next(false);
    this.service.products$.next({});
    this.scrollerElement?.removeEventListener("scroll", (ev: any) => {});
  }
  clearFilter(e: any) {
    if (this.service.filters.size > 0) {
      // this.service.sort = "newest";
      this.service.sort = "relevance";
      this.service.filters.clear();
      this.getPlpData();
    }
  }
  getPlpData() {
    this.service.currentPage = 0;
    this.service.getProducts(false);
  }
  @ViewChild("productref")
  pages: ElementRef | undefined;
  routerSubscriber: any;
  componentInitialized = false;
  loadingSub: any;
  ngOnInit(): void {
   const qeryrparms = this.activeRoute.snapshot.queryParams;
   if(!qeryrparms['search']) {
     if(this.dataList.length === 0) {
       this.zone.run(() => {
         this.service.getProducts(true, true);
       })
     }
   }
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
    },(err)=>{this.modalService.hide('progressModal');});
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
  }

  ngAfterViewInit(): void {}

  getQueryParamFromUrl() {
    this.activeRoute.queryParams.subscribe((params) => {
      this.breadCumName = params[`search`] ? "Search" : params[`name`];
      this.pageName = params[`search`] ? params[`search`] : params[`page`];
      let path =
        "commercial/products?name={name}&page=View All {name}&type={type}";
      path = path.replace("{name}", this.breadCumName);
      path = path.replace("{name}", this.breadCumName);
      path = path.replace(
        "{type}",
        this.breadCumName?.toUpperCase().replace(" ", "")
      );
      if (this.breadCumName == "Walk off") {
        this.isWalkOff = true;
      } else this.isWalkOff = false;

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
      this.router.navigate(["/commercial/products"], {
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
      this.router.navigate(["/commercial/products"], {
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
