import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { BehaviorSubject, catchError, map, Observable, ReplaySubject, throwError } from "rxjs";
import { ApiService } from "src/app/features/http-services/api.service";
import { API_CONSTANTS } from "src/app/features/shared/constants/API-CONSTANTS";
import { CommercialPlpTypes } from "src/app/features/shared/constants/menu/commercial.config";
import { ResidentialPlpTypes } from "src/app/features/shared/constants/menu/residential.config";
import { environment } from "src/environments/environment";
import { plpNavigationMap } from "./plp-navigation-map";
import { StorageService } from "src/app/features/http-services/storage.service";
import { UserService } from "src/app/features/shared/user/services/user.service";

@Injectable({
  providedIn: "root",
})
export class ProductListService {
  public productListLoading$ = new BehaviorSubject<boolean>(false);
  public searchTerm = new BehaviorSubject("");
  public filters$ = new BehaviorSubject([]);
  public products$ = new BehaviorSubject<any>({});
  public totalProductsFound = new ReplaySubject<number>(1);
  public productsAreLoading = new BehaviorSubject(true);
  public clearFilters = new BehaviorSubject(true);
  public productCategory = new ReplaySubject<string>(1);
  pageSize = 12;
  currentPage = 0;
  sort: any = "relevance";
  maxPages = 0;
  CommercialPlpTypes: any = CommercialPlpTypes;
  ResidentialPlpTypes: any = ResidentialPlpTypes;
  selctedCommercialPlpTypes: string = "";
  filters = new Map();
  endpoint: any;
  productCategoryName = "";
  constructor(
    private http: HttpClient,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private apiService: ApiService,
    private storageService: StorageService,
    private userService: UserService
  ) {
    this.activeRoute.queryParams.subscribe((params: any) => {
      if (this.router.url.split("?")[0].includes("commercial")) {
        if (params?.type && params?.name) {
          this.selctedCommercialPlpTypes =
            this.CommercialPlpTypes[params?.type] || params?.type;
          if (!this.selctedCommercialPlpTypes) {
          }

          this.productCategoryName = params?.name
            ? params.name.replace(/ /g, "").toLowerCase()
            : "";
        } else {
        }
      } else {
        if (params?.name && params?.type) {
          this.selctedCommercialPlpTypes =
            this.ResidentialPlpTypes[params?.type] || params?.type;
          if (!this.selctedCommercialPlpTypes) {
          }
          this.productCategoryName = params?.name
            ? params.name.replace(/ /g, "").toLowerCase()
            : "";
        } else {
        }
      }
    });
  }

  updateProductCategory() {
    let flooringType = this.router.url.split("/")[3];

    this.endpoint = plpNavigationMap[flooringType];

    this.endpoint = plpNavigationMap[this.productCategoryName];

    this.productCategory.next(this.endpoint?.title);
  }

  addFilter(value: string, group: string) {
    if (!this.filters.has(group)) {
      this.filters.set(group, [value]);
    } else {
      let newArray = this.filters.get(group);
      newArray.push(value);
      this.filters.set(group, newArray);
    }
    this.getNewProducts();
  }
  removeFilter(value: string, group: string) {
    if (this.filters.has(group)) {
      let newArray = this.filters.get(group);
      newArray = newArray.filter((element: string) => {
        return element !== value;
      });

      this.filters.set(group, newArray);
      this.getNewProducts();
    }
  }
  getNewProducts() {
    this.currentPage = 0;
    this.getProducts(false);
  }

  changeSort(sort: string) {
    this.sort = sort;
    this.getNewProducts();
  }
  getNextPage() {
    this.currentPage++;

    if (this.currentPage === this.maxPages) return;
    this.http
      .get(
        environment.baseAPIURl + 
        "us_b2b_commercial/categories/" +
          this.endpoint.endpoint +
          "/products?currentPage=" +
          this.currentPage +
          "&fields=FULL&pageSize=" +
          this.pageSize
      )
      .subscribe((res: any) => {
        this.products$.next(this.products$.getValue().concat(res.products));
      });
  }

  getNextProductsList() {
    this.currentPage++;

    if (this.currentPage === this.maxPages) return;
    this.getProducts(false);
  }
  getNexSearchtProductsList(searchStr: any) {
    this.currentPage++;

    if (this.currentPage === this.maxPages) return;
    this.getSearchProducts(searchStr);
  }
  getProducts(firstload: boolean, firstPageLoad: boolean = false) {
    if (firstPageLoad) {
      this.currentPage = 0;
    }
    this.productListLoading$.next(true);
    let baseUnit = this.apiService.getCommercialSiteBaseURL();
    let url = this.router.url.split("?")[0].includes("commercial")
      ? `${
          environment.baseAPIURl 
        }${baseUnit}/categories/${this.selctedCommercialPlpTypes.toUpperCase()}/products`
      : `${
          environment.baseAPIURl
        }us_b2b_residential/categories/${this.selctedCommercialPlpTypes.toUpperCase()}/products`;

    this.http
      .get(
        url +
          "?currentPage=" +
          this.currentPage +
          "&fields=FULL&pageSize=" +
          this.pageSize +
          this.getFilterString()
      )
      .subscribe({
        next: (res: any) => {
          this.productListLoading$.next(false);
          let myResult: any = res;
          const prevProducts: any = this.products$.getValue();
          const products = myResult?.products || [];
          const preProducts =
            this.currentPage == 0 ? [] : prevProducts?.products || [];
          myResult.products = [...preProducts, ...products];
          myResult.facets = myResult.facets || [];
          this.products$?.next(myResult);
          // this.products$.next(res);
          if (firstload) this.filters$.next(res.facets);
          this.totalProductsFound.next(res.pagination.totalResults);
          this.maxPages = res.pagination.totalPages;
        },
        error: (err: any) => {
          this.productListLoading$.next(false);
        },
      });
  }
  getSearchProducts(searchResultQuery: any) {
    const url = API_CONSTANTS.productSearch;
    let formatedURl: string =
      url +
      "currentPage=" +
      this.currentPage +
      "&fields=FULL" +
      "&pageSize=" +
      this.pageSize +
      "&query=" +
      searchResultQuery;
      this.productListLoading$.next(true);

    return this.apiService.getSearchResults(formatedURl).subscribe({
      next: (res: any) => {
        let myResult: any = res;
        this.productListLoading$.next(false);
        this.totalProductsFound.next(myResult.pagination.totalResults);
        this.maxPages = myResult.pagination.totalPages;
        const prevProducts: any = this.products$.getValue();
        const products = myResult?.products || [];
        const preProducts =
          this.currentPage == 0 ? [] : prevProducts?.products || [];
        myResult.products = [...preProducts, ...products];
        this.products$.next(myResult);
      },
      error: (err: any) => {
        this.productListLoading$.next(false);
      },
    });
  }

  getFilterString() {
    const encodeList = [
      { key: "$", value: "24" },
      { key: "&", value: "26" },
      { key: "+", value: "2B" },
      { key: ",", value: "2C" },
      { key: "/", value: "2F" },
      { key: ":", value: "3A" },
      { key: ";", value: "3B" },
      { key: "=", value: "3D" },
      { key: "?", value: "3F" },
      { key: "@", value: "40" },
    ];
    let q = "&query=::";
    if (this.filters.size) {
      q = "&query=:{sort}:";
      for (let filter of this.filters) {
        // q = q + filter[0] + ":";
        for (let value of filter[1]) {
          value = encodeURI(value);
          value = value.replaceAll("%", "%25");
          encodeList.forEach((item) => {
            value = value.replaceAll(item.key, "%25" + item.value);
          });
          q = q + filter[0] + ":" + value + ":";
        }
        q = q.slice(0, -1);
        q = q + ":";
      }

      q = q.slice(0, -1);

      if (this.sort) {
        q = q.replace("{sort}", this.sort);
      }
      return q;
    } else {
      if (this.sort) {
        q = q.slice(0, -1);

        q = q + `${this.sort}:`;
      }
      return q;
    }
  }

  getPlpPriceSearch(payload: any) {
    let url = API_CONSTANTS.plpPriceSearch.replace(
      "{uid}",
      this.storageService.uid
    );
    url = url.replace("{userId}", this.userService.getUserEmail().toLowerCase());
    return this.apiService.post(url, payload);
  }

  getSearchProductsForAdvanceSearch(searchResultQuery: any,currentPage:number, pageSize:number= this.pageSize ): Observable<any> {
    const url = API_CONSTANTS.productSearch;
    let formatedURl: string =url +"currentPage=" +currentPage +"&fields=FULL" +"&pageSize=" + pageSize +"&query=" +searchResultQuery;
    this.productListLoading$.next(true);
    return this.apiService.getSearchResults(formatedURl).pipe(
      map((res: any) => {
        let myResult: any = res;
        this.productListLoading$.next(false);
        return myResult;
      }),
      catchError((error) => {
        this.productListLoading$.next(false);
        console.error('Error fetching products:', error);
        return throwError(error);
      })
    );
  }
  
}
