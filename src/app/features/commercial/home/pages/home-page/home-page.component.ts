import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { TabsetComponent } from "ngx-bootstrap/tabs";
import { OwlOptions } from "ngx-owl-carousel-o";
import { CommercialSiteSelectorService } from "src/app/features/http-services/commercial-site-selector.service";
import { StorageService } from "src/app/features/http-services/storage.service";
import { CommercialSiteSelectorComponent } from "src/app/features/shared/components/commercial-site-selector/commercial-site-selector.component";
import { permissionsList } from "src/app/features/shared/constants/PERMISSIONS_CONSTANTS";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { ProgressModalComponent } from "src/app/features/shared/components/progress-modal/progress-modal.component";
import { MESSAGE_CONSTANTS } from "src/app/features/shared/constants/MESSAGE-CONSTANTS";
import { Subject, takeUntil  } from "rxjs";
@Component({
    selector: "app-home-page",
    templateUrl: "./home-page.component.html",
    styleUrls: ["./home-page.component.scss"],
    standalone: false
})
export class HomePageComponent implements OnInit, OnDestroy {
  destroySubject: Subject<void> = new Subject();
  saleValue = 180000;
  modalRef?: BsModalRef;
  mainSliderOptions: OwlOptions = {
    loop: true,
    navText: ["", ""],
    responsive: {
      0: {
        items: 1,
      },
      400: {
        items: 1,
      },
      740: {
        items: 1,
      },
      940: { items: 1 },
    },
    nav: true,
  };

  sliderOptions: OwlOptions = {
    loop: false,
    navText: ["", ""],
    dots: false,
    responsive: {
      0: {
        items: 1,
      },
      400: {
        items: 1,
      },
      740: {
        items: 2,
      },
      940: { items: 3 },
    },
    nav: false,
    margin: 15,
  };

  searchText: any;
  isCustomer: any;
  userInfoSub: any;
  productFeaturesList:any= [];
  productFeaturesListItems: Array<any> = [
    {
      name: "Open Product Orders",
      key: "open_orders",
      icon: "open-product-order",
      iconExt: ".svg",
      link: "/commercial/orders",
      queryParams: { page: 0 },
      value: 0,
      allowedSites: ["I", "C", "H"],
    },
    {
      name: "Today’s Shipment",
      key: "today_shipment",
      icon: "todays-shipment",
      iconExt: ".svg",
      link: "/commercial/orders",
      queryParams: { page: 1 },
      value: 0,
      allowedSites: ["C"],
    },
    {
      name: "Open Sample Orders",
      key: "sample_orders",
      icon: "open-sample-orders",
      iconExt: ".svg",
      link: "/commercial/orders",
      queryParams: { page: 2 },
      value: 0,
      allowedSites: ["C"],
    },
    {
      name: "Open Claims",
      key: "claims",
      icon: "open-claim",
      iconExt: ".svg",
      link: "/commercial/claims/history",
      value: 0,
      permissions: {
        is: [[permissionsList[13]]],
        not: [[permissionsList[28]], [permissionsList[41]]],
      },
      allowedSites: ["I", "C"],
    },
    // {
    //   name: "Recent Invoices",
    //   key: "recent_invoices",
    //   icon: "active-quotes",
    //   iconExt: ".svg",
    //   link: "/commercial/finance/invoices",
    //   value: 0,
    // },
    {
      name: "Active Quotes",
      key: "quotes_count",
      icon: "active-quotes",
      iconExt: ".svg",
      link: "/commercial/quotes/quote",
      value: 0,
      allowedSites: ["C"],
    },
    {
      name: "Active Reserves",
      key: "current_reserve",
      icon: "current-reserve",
      iconExt: ".svg",
      link: "/commercial/orders/reserves",
      value: 0,
      allowedSites: ["C"],
    },
    {
      name: "Claims Approval",
      key: "claims_approval",
      icon: "claims-approval-icon",
      iconExt: ".svg",
      link: "/commercial/claims/approval-list",
      value: 0,
      permissions: {
        is: [[permissionsList[13]]],
        not: [
          [permissionsList[28]],
          [permissionsList[41]],
          [permissionsList[3]],
          [permissionsList[4]],
          [permissionsList[5]],
          [permissionsList[6]],
        ],
      },
      allowedSites: ["C"],
    },
  ];
  bsModalRef?: BsModalRef;
  uid = '';
  isSalesPerson: boolean = false;
  isImpersonate:boolean = false;
  constructor(
    private route: Router,
    private userService: UserService,
    private modalService: BsModalService, 
    public storageService: StorageService,
    public commercialSiteSelectorService: CommercialSiteSelectorService,
    private activatedRoute:ActivatedRoute
  ) {
    window.scrollTo({
      top: 0,
    });
    this.isProductManager = this.storageService.userInfo?.isProductManager;
  }

  ngOnInit(): void {
    /* TODO document why this method 'ngOnInit' is empty */
    // this.userService.currentUserDetails.next(null);
    this.applyPermissions();
    const messageConstants = MESSAGE_CONSTANTS.LandingPage["Commercial"];
    this.openProgressModal({
      modalHeaderText: messageConstants?.headerText,
      progressText: messageConstants?.bodyText,
      progressBarText: messageConstants?.barText,
    });
    setTimeout(() => {
      this.modalService.hide("progressModal");
    }, 2000);
    this.storageService.getItem("commercialSite")
      .pipe(takeUntil(this.destroySubject))
      .subscribe((siteId: any) => {
          this.applyPermissions();
          if (siteId) {
            this.commercialSiteSelectorService.setStoredSite(siteId);
            return;
          }
      },(err)=>{
        this.modalService.hide("progressModal");
      });
    this.storageService
      .getItem("userInfo")
      .pipe(takeUntil(this.destroySubject))
      .subscribe((userInfo: any) => {
        if (this.uid !== userInfo?.orgUnit?.uid && (userInfo?.orgUnit?.uid.includes('_82') || userInfo?.orgUnit?.uid == 'EMPTY_B2BUNIT')) {
          this.uid = userInfo?.orgUnit?.uid;
          this.isSalesPerson = userInfo?.isSalesPerson;
          this.isImpersonate = sessionStorage.getItem("startSession") === "true";
          if (userInfo?.isCustomer) {
            const commercialAccounts = userInfo?.accounts?.filter(
              (acc: any) => acc.company === "C"
            );
            if (commercialAccounts && commercialAccounts.length == 1 && this.commercialSiteSelectorService.storedSiteId == undefined) {
              this.commercialSiteSelectorService.resetSelectedSiteForStorage();
            }
          }
          if (
            this.route.url.includes("commercial")
          ) {
            if (userInfo?.orgUnit?.companies?.length > 1 || userInfo?.isSalesOps) {
              const modals = this.modalService["loaders"].filter(
                (modalInst: any) =>
                  modalInst.instance.id === "commercialSelector"
              );
              if (
                this.commercialSiteSelectorService.storedSiteId == undefined &&
                modals.length === 0
              ) {
                if (this.isSalesPerson && this.isImpersonate) {
                  this.productFeaturesList = [];
                  this.commercialSiteSelectorService.setSelectedSite("C");
                } else {
                  this.commercialSiteSelectorService.openSiteSelectionModal({
                    companiesList: userInfo?.orgUnit?.companies,
                    onPrimaryAction: (value: any) => {
                      this.productFeaturesList = [];
                      this.commercialSiteSelectorService.setSelectedSite(value);
                    },
                  });
                }
              }
            }else if(userInfo?.orgUnit?.companies?.length === 1 && !userInfo?.orgUnit?.companies.includes('R')) {
              this.commercialSiteSelectorService.setSelectedSite(
                userInfo?.orgUnit?.companies[0]
              );
            }
          }
        }
      },(err)=>{
        this.modalService.hide("progressModal");
      });
  }
  applyPermissions() {
    this.isCustomer = this.storageService?.userInfo?.isCustomer;
    this.productFeaturesList = [...this.productFeaturesListItems];
    this.productFeaturesList.forEach((element:any) => {
      if (element.hasOwnProperty("permissions")) {
        let isHave = false;
        for (let item of element.permissions.is) {
          if (this.storageService?.userInfo?.userPermissions?.includes(item[0])) {
            isHave = true;
            break;
          }
        }
        if (isHave === true && element.hasOwnProperty("allowedSites")) {
          isHave = element.allowedSites.includes(
            this.commercialSiteSelectorService.selectedSite
          );
        }

        let isNotHave = false;
        for (let notItem of element.permissions.not) {
          if (
            this.storageService?.userInfo?.userPermissions?.includes(notItem[0])
          ) {
            isNotHave = true;
            break;
          }
        }
        if (isHave === true && isNotHave === false) {
          element.isShow = true;
        } else {
          element.isShow = false;
        }
      } else {
        element.isShow = true;
        if (element.hasOwnProperty("allowedSites")) {
          element.isShow = element.allowedSites.includes(
            this.commercialSiteSelectorService.selectedSite
          );
        }
      }
    });
    this.productFeaturesList = this.productFeaturesList.filter(
      (item:any) => item.isShow == true
    );
    this.productFeaturesList.forEach((element:any) => {
      if (element.name === "Claims Approval" && this.isCustomer) {
        element.isShow = false;
      }
    });
  }

  onSearchTextEntered(searchValue: any) {
    if (searchValue.searchText.trim().length > 2) {
      if (searchValue?.type == "commercialNewOrder") {
        this.route.navigate(["/commercial/products"], {
          queryParams: { search: searchValue?.searchText },
        });
      } else if (searchValue?.type == "commercialOrder") {
        this.route.navigate(["/commercial/orders"], {
          queryParams: { page: 0, searchText: searchValue?.searchText },
        });
      } else if (searchValue?.type == "commercialInvoices") {
        this.route.navigate(["/commercial/finance/invoices"], {
          queryParams: { searchText: searchValue?.searchText },
        });
      }
    }
  }

  navigateToCatalog() {
    this.route.navigate(["/commercial/product-owner"]);
  }
  //bool for setting product manager dashboard
  isProductManager : any;
  @ViewChild("salesTabs", { static: false }) salesTabs?: TabsetComponent;

  selectTab(tabId: any) {
    // this.salesTabs.tabs[tabId].active = tabId==0;

    if (tabId == 1 || tabId == 2) {
      let aTag = document.createElement("a");
      aTag.href = "https://mohawktoday.com/";
      aTag.target = "_blank";
      aTag.click();
      aTag.remove();
    }
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

    ngOnDestroy(): void {
    this.destroySubject.next();
    }
}
