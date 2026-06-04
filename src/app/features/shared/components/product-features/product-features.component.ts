import { ChangeDetectorRef, Component, Input, NgZone, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ApiService } from "src/app/features/http-services/api.service";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { API_CONSTANTS } from "src/app/features/shared/constants/API-CONSTANTS";
import { StorageService } from "src/app/features/http-services/storage.service";
import { TabService } from "src/app/features/residential/orders/services/tab.service";
import { CommercialSiteSelectorService } from "src/app/features/http-services/commercial-site-selector.service";
@Component({
    selector: "app-product-features",
    templateUrl: "./product-features.component.html",
    styleUrls: ["./product-features.component.scss"],
    standalone: false
})
export class ProductFeaturesComponent implements OnInit, OnDestroy {
  @Input("list") list: Array<any> = [];

  currentOrdersCount: any = 0;
  claimsApprovalCount = 0;
  sampleOrdersCount: any = 0;
  claimsCount: any = 0;
  invoiceCount: any = 0;
  reserveCount: any = 0;
  todayShipmentCount: any = 0;
  quoteCount: any = 0;
  isCSR = false;
  countFlag = false;
  // subUserInfo: any;
  spinnerLoading = false;
  subscribed: any;
  prevOrgUid = '';
  constructor(
    private router: Router,
    private apiService: ApiService,
    private userService: UserService,
    private storageService: StorageService,
    private tabService: TabService,
    public commercialSiteSelectorService:CommercialSiteSelectorService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}
  ngOnDestroy(): void {
    this.subscribed.unsubscribe();
  }

  ngOnInit(): void {
    this.list.map((item: any) => {
      if (item.hasOwnProperty("isShow") === false) {
        item.isShow = true;
      }
    });
    this.spinnerLoading = true;
    this.subscribed = this.storageService.getItem("userInfo").subscribe(
      (res: any) => {
        if(this.prevOrgUid == ""|| this.prevOrgUid !== res?.orgUnit?.uid){
          this.prevOrgUid = res?.orgUnit?.uid
        if (
          (res?.isCSR ||
            res?.isCustomer ||
            (res?.isSalesPerson )|| res?.isSalesOps) 
        ) {
          this.countFlag = true;
          this.getCurrentOrdersCount();
          this.getSampleOrdersCount();
          this.getTodayShipmentCount();
          this.getClaimsCount();
          this.getInvoiceCount();
          this.getReserveCount();
          if (this.router.url === "/commercial") {
            this.getQuoteCount();
          }
        }
        if((res?.isSalesPerson))
        {
            this.getClaimsApprovalCount()
        }
        // if (res != null && this.spinnerLoading) {
        //   this.getMiniCartCount(res);
        // }
        this.zone.run(() => {
          this.spinnerLoading = false;
          this.cdr.detectChanges();
        })
        // this.subUserInfo.unsubscribe();
      }
      },
      () => {
        this.spinnerLoading = false;
      }
    );
    
  }

  navigation(item: any) {
      sessionStorage.removeItem("tabId");
    if (item?.queryParams) {
      this.router.navigate([item?.link], {
        queryParams: item?.queryParams,
      });
      this.tabService.setActiveTabIndex(item?.queryParams.page);
    } else {
      this.router.navigate([item?.link]);
    }
  }

  getCurrentOrdersCount() {
    let url = API_CONSTANTS.currentOrdersCount.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    this.apiService.getHomePageDate(url).subscribe({
      next: (result: any) => {
        this.currentOrdersCount = result;
      },
      error: (error: any) => {},
    });
  }

  getSampleOrdersCount() {
    let url = API_CONSTANTS.sampleOrderCount.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    this.apiService.getHomePageDate(url).subscribe({
      next: (result: any) => {
        this.sampleOrdersCount = result;
      },
      error: (error: any) => {},
    });
  }
  getClaimsCount() {
    let url = API_CONSTANTS.claimsCount.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    this.apiService.getHomePageDate(url).subscribe({
      next: (result: any) => {
        this.claimsCount = result;
      },
      error: (error: any) => {},
    });
  }

  getInvoiceCount() {
    let url = API_CONSTANTS.invoiceCountForUnit.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    this.apiService.getHomePageDate(url).subscribe({
      next: (result: any) => {
        this.invoiceCount = result;
      },
      error: (error: any) => {},
    });
  }

  getReserveCount() {
    let url = API_CONSTANTS.reserveCountForUnit.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    this.apiService.getHomePageDate(url).subscribe({
      next: (result: any) => {
        this.reserveCount = result;
      },
      error: (error: any) => {},
    });
  }

  getTodayShipmentCount() {
    let url = API_CONSTANTS.todayShipmentCountForUnit.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    this.apiService.getHomePageDate(url).subscribe({
      next: (result: any) => {
        this.todayShipmentCount = result;
      },
      error: (error: any) => {},
    });
  }

  getQuoteCount() {
    let url = API_CONSTANTS.quoteCount.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    this.apiService.getHomePageDate(url).subscribe({
      next: (result: any) => {
        this.quoteCount = result;
      },
      error: (error: any) => {},
    });
  }

  getCount(item: string) {
    if (item == "open_orders") {
      return typeof this.currentOrdersCount != "object"
        ? this.currentOrdersCount
        : 0;
    }
    if (item == "today_shipment") {
      return typeof this.todayShipmentCount != "object"
        ? this.todayShipmentCount
        : 0;
    }
    if (item == "sample_orders") {
      return typeof this.sampleOrdersCount != "object"
        ? this.sampleOrdersCount
        : 0;
    }
    if (item == "claims") {
      return typeof this.claimsCount != "object" ? this.claimsCount : 0;
    }
    if (item == "recent_invoices") {
      return typeof this.invoiceCount != "object" ? this.invoiceCount : 0;
    }
    if (item == "current_reserve") {
      return typeof this.reserveCount != "object" ? this.reserveCount : 0;
    }
    if (item == "quotes_count") {
      return typeof this.quoteCount != "object" ? this.quoteCount : 0;
    }
  if (item == "claims_approval") {
    return typeof this.claimsApprovalCount != "object" ? this.claimsApprovalCount : 0;
  }
  }
  getClaimsApprovalCount(){
    this.userService.getClaimApprovalCount().subscribe((res:any)=>{
     this.claimsApprovalCount = res.body;
      },(err:any)=>{
  
      })
  }
  // getMiniCartCount(res: any) {
  //   let url = API_CONSTANTS.miniCart.replace(
  //     "{customerNumber}",
  //     res?.body?.orgUnit?.uid
  //   );
  //   url = url.replace("{uid}", this.userService.getUserEmail());
  //   this.apiService.getMiniCartData(`${url}`).subscribe({
  //     next: (result: any) => {
  //       this.storageService.setItem("miniCartCount", result);
  //       this.storageService.setItem("shippingAddress", result?.deliveryAddress);
  //     },
  //     error: (error: any) => {
  //       this.storageService.setItem("miniCartCount", "");
  //       this.storageService.setItem("shippingAddress", "");
  //     },
  //   });
  // }
}
