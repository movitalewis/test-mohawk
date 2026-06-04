import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
  ViewChild,
  ElementRef,
  TemplateRef,
  AfterViewChecked,
  Renderer2,
  NgZone
} from "@angular/core";
import { ApiService } from "src/app/features/http-services/api.service";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { menuType } from "../../constants/menu/menu.type";
import { MenuConfigService } from "../services/menu-config.service";
import { SidenavService } from "../services/sidenav.service";
import { Router, NavigationEnd, ActivatedRoute } from "@angular/router";
import { debounce, debounceTime, distinctUntilChanged, filter, switchMap, take } from "rxjs/operators";
import { MashupService } from "src/app/features/http-services/mashup.service";
import { combineLatest, fromEvent, of, Subscription } from "rxjs";
import { UserService } from "../../user/services/user.service";
import { OwlOptions } from "ngx-owl-carousel-o";
import { StorageService } from "src/app/features/http-services/storage.service";
import { XchangeDataLayerService } from "src/app/features/http-services/data-layer.service";
import { permissionsList } from "src/app/features/shared/constants/PERMISSIONS_CONSTANTS";

@Component({
    selector: "app-main-layout",
    templateUrl: "./main-layout.component.html",
    styleUrls: ["./main-layout.component.scss"],
    standalone: false
})
export class MainLayoutComponent
  implements OnInit, AfterViewChecked
{
  accountInfoSet: boolean = false;
  _opened: boolean = false;
  @ViewChild("appHeader") appHeader!: ElementRef;
  height: number = 0;
  minHeight: number = 0;
  uid: any = "";
  isCommercial: boolean = false;
  spinnerLoading = false;
  salesTeamData: any = [];
  menuType!: string;
  screenWidth: number = window.innerWidth;
  screenHeight: number = window.innerHeight;
  @ViewChild("sidebarContent") sidebarContentRef: ElementRef | any;
  @ViewChild("sidebar") sidebar: ElementRef | any;
  showCarousel = true;

  sidenavConfig: any = {
    dock: false,
    mode: "push",
    sidebarClass: "main-side-nav",
    showBackdrop: true,
    dockedSize: "0",
    backdropClass: "main-side-nav-backdrop",
    closeOnClickBackdrop: true,
  };

  hideSideBar = false;
  isMashupSub!: Subscription;
  accountInfoSetSub!: Subscription;
  isShipToUserSub!: Subscription;
  sliderOptionsForCustomerMsg: OwlOptions = {
    loop: false,
    navText: ["", ""],
    autoWidth: true,
    autoHeight: true,
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
  isCustomer: boolean = false;
  showCustomerMessages: boolean = true;
  onResizeSub?:Subscription;
  public isCSR: boolean = false;

  customerMessageAlerts = [
    // {
    //   msg: "Valued customer - latest news on Coronavirus.",
    //   src: "/assets/icons/feather-alert-octagon.svg",
    // },
    // {
    //   msg: "The FSC (Fuel Surcharge) for this week is 55%",
    //   src: "/assets/icons/awesome-gas-pump.svg",
    // },
    {
      msg: "For quick order status updates, text your Mohawk Order Reference or Purchase Order Number to (520)-277-9937 to  receive brief, up-to-date order status information.",
      src: "/assets/icons/zocial-call.svg",
    },
    {
      msg: "Truck tracking now available by clicking on Today’s Shipments.",
      src: "/assets/icons/awesome-truck.svg",
    },
    // {
    //   msg: "Mohawk Residential import Freight Surcharge Revision Effective 10.3.22",
    //   src: "/assets/icons/awesome-box.svg",
    // },
  ];
  modalRef!: BsModalRef;
  salePersonNotifications: any = [];
  allSalePersonNotifications: any = [];

  constructor(
    private sideNav: SidenavService,
    public modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private cd: ChangeDetectorRef,
    private menuConfig: MenuConfigService,
    public router: Router,
    private mashupService: MashupService,
    public userService: UserService,
    private storageService: StorageService,
    private elRef: ElementRef,
    private renderer: Renderer2,
    private apiService: ApiService,
    private dataLayer: XchangeDataLayerService,
    private zone: NgZone
  ) {
    document.body.classList.add("add-scroll");

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        distinctUntilChanged(
          (prev, curr) =>
            (prev as NavigationEnd).urlAfterRedirects ===
            (curr as NavigationEnd).urlAfterRedirects
        ),
        switchMap((event) =>
          combineLatest([
            of(event as NavigationEnd),
            this.storageService.getItem("userInfo"),
            this.storageService.getItem("accountData"),
          ]).pipe(take(1))
        )
      )
      .subscribe(([event, userInfo, accountData]) => {
        if (event instanceof NavigationEnd) {
          const scroll = document.querySelectorAll(".custom-scrollbar");
          scroll.forEach((element) => {
            const elem = element as HTMLElement;
            elem.scrollTop = 0;
          });
        }
        const user_type = [
          userInfo?.b2bAdmin && "b2bAdmin",
          userInfo?.isCSR && "CSR",
          userInfo?.isCSRSuperAdmin && "CSRSuperAdmin",
          userInfo?.isCustomer && "Customer",
          userInfo?.isFinancialSuperAdmin && "FinancialSuperAdmin",
          userInfo?.isFinancialUser && "FinancialUser",
          userInfo?.isIsAdmin && "IsAdmin",
          userInfo?.isProductManager && "ProductManager",
          userInfo?.isSalesOps && "SalesOps",
          userInfo?.isSalesPerson && "SalesPerson",
          userInfo?.isShipToUser && "ShipToUser",
        ]
          .filter(Boolean)
          .join("|");
        this.dataLayer.pageView(
          this.router?.url?.split("/")[2]?.split("?")[0] || "Home",
          {
            user_id: userInfo?.uuid || "",
            user_type: user_type || "",
            email: userInfo?.uid || "",
          },
          {
            account_id:
              accountData?.customerNumber || userInfo?.orgUnit?.uid || "",
            account_type: userInfo?.orgUnit?.accountType || "",
          }
        );
      });
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        this.filterNotificationsByCompany();
        if (
          this.router.url.includes("residential/account/search") ||
          this.router.url.includes("commercial/account/search") ||
          this.router.url.includes("residential/post-modification") ||
          this.router.url.includes("commercial/post-modification") ||
          this.router.url.includes("commercial/account/multi-account") ||
          this.router.url.includes("residential/account/multi-account")
        ) {
          this.hideSideBar = true;

          //   this.sidebar.close();
        } else {
          this.hideSideBar = false;
        }
        this.isMashupSub = mashupService.isMashup.subscribe((isMashup) => {
          if (isMashup) {
            if (
              this.router.url !== "/residential" &&
              this.router.url !== "/commercial"
            ) {
              this.hideSideBar = true;
            }
          }
        });
        this.accountInfoSetSub = this.userService.accountInfoSet.subscribe(
          (accountInfoSet) => {
            this.accountInfoSet = accountInfoSet;
            if (this.isCSR) {
              this.hideSideBar = !accountInfoSet;
            } 
          }
        );

        // if (this.router.url.includes("post-modification")) {
        //   this.showCustomerMessages = false;
        //   const scrollerElement = document.getElementsByClassName(
        //     "ng-sidebar__content"
        //   )[0];
        //   if (scrollerElement) {
        //     this.renderer.setStyle(scrollerElement, "padding", "unset");
        //   }
        // } else {
        if (window.innerWidth > 993) {
          let showNotifications = localStorage.getItem("showSalesNotification");
          if (showNotifications == "false") {
            this.showCustomerMessages = false;
          } else {
            this.showCustomerMessages = true;
          }
          const scrollerElement = document.getElementsByClassName(
            "ng-sidebar__content"
          )[0];
          if (this.hideSideBar == false) {
            if (scrollerElement) {
              this.renderer.setStyle(
                scrollerElement,
                "padding",
                "0px 0px 0px 80px"
              );
            }
          } else {
            if (scrollerElement) {
              this.renderer.setStyle(scrollerElement, "padding", "unset");
            }
          }
        }

        // }
      }
      // this.isShipToUserSub = this.userService.isShipToUser.subscribe(
      //   (shipToUser) => {
      //     if (shipToUser) this.hideSideBar = false;
      //   }
      // );
      
    });
  }

  @HostListener("window:scroll", ["$event"])
  doSomething(event: any) {
    // see András Szepesházi's comment below
  }

  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    this.screenWidth = event.target.innerWidth;
    this.screenHeight = window.innerHeight;
    this.updateConfig(this.screenWidth);
    this.minHeight = this.calculateMinHeight(this.appHeader.nativeElement);
   
  }

  ngOnInit(): void {
    const scrollerElement = document.getElementsByClassName(
      "ng-sidebar__content"
    )[0];
    if (scrollerElement) {
      this.renderer.setStyle(scrollerElement, "overflow", "hidden");
    }
    this.updateConfig(window.innerWidth);
    this.storageService.getItem("userInfo").subscribe((response: any) => {
      this.isCustomer =
        !response?.isCSR &&
        !response?.isCSRSuperAdmin &&
        !response?.isProductManager &&
        !response?.isSalesOps &&
        !response?.isSalesPerson &&
        !response?.isFinancialSuperAdmin &&
        !response?.isFinancialUser &&
        !response?.isIsAdmin
          ? true
          : false;
    });
    this.userService.isCSR.subscribe((isCSR: boolean) => {
      this.isCSR = isCSR;
    });
    this.userService.getSalePersonNotification().subscribe((response: any) => {
      this.allSalePersonNotifications = response.filter(
        (alert: any) => alert.display == "true"
      );
      this.filterNotificationsByCompany();
    }, (error) => {
      console.error('Error fetching notifications:', error);
    });
    let showNotifications = localStorage.getItem("showSalesNotification");
    if (showNotifications == "false") {
      this.showCustomerMessages = false;
    }
    if (this.router.url.includes("post-modification")) {
      this.showCustomerMessages = false;
    }
    this.onResizeSub = fromEvent(window, 'resize').pipe(debounceTime(300)).subscribe(() => {
    this.showCarousel = false;
    setTimeout(() => {
      this.zone.run(() => {
        this.showCarousel = true;
        this.cd.detectChanges();
      })
    }, 0);
    });
  }
  customerSupport(template3: TemplateRef<any>) {
      this.uid = this.storageService.uid;
      this.isCommercial = this.uid?.split("_")[3] === "82";
      this.spinnerLoading = true;
    this.apiService.getSalesTeam(this.uid).subscribe((data: any) => {
      this.spinnerLoading = false;
      this.salesTeamData = data?.custSalesPersonList;
    });
    this.modalRef = this.modalService.show(template3, {
      id: "customer-service",
      class: "modal-lg modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }
  setDynamicAlertHeight(): void {
    const alerts = document.querySelectorAll('.owl-item .alert');
    if (alerts.length > 0) {
      let maxHeight = 0;
      alerts.forEach((alert) => {
        const height = alert.getBoundingClientRect().height;
        maxHeight = Math.max(maxHeight, height);
      });
      alerts.forEach((alert) => {
        (alert as HTMLElement).style.height = `${maxHeight}px`;
      });
    }
  }
  
  ngAfterViewInit() {
    this.setDynamicAlertHeight()
    this.minHeight = this.calculateMinHeight(this.appHeader.nativeElement);
    this.menuConfig.currentState.subscribe((_menuType) => {
      this.menuType = _menuType;
      this.sidenavConfig["dock"] =
        this.menuType === menuType.sideNav && this.screenWidth > 993
          ? true
          : false;
      this.sidenavConfig["dockedSize"] =
        this.menuType === menuType.sideNav ? "80px" : "0px";
    });
    this.sideNav.currentState.subscribe((open) => (this._opened = open));
    this.cd.detectChanges();
  }

  updateConfig(screenWidth: number) {
    if (screenWidth <= 993) {
      this.sidenavConfig.dock = false;
    } else {
      this.sidenavConfig.dock = true;
    }
  }

  ngOnDestroy(): void {
    this.isMashupSub.unsubscribe();
    this.onResizeSub?.unsubscribe();
  }

  hideSidebar() {
    this.sideNav.hide();
  }

  toggleSidebar() {
    this._opened = !this._opened;
  }

  calculateMinHeight(el: HTMLElement): number {
    const minHeight = this.screenHeight - el.offsetHeight;
    localStorage.setItem("minHeight", String(minHeight));
    return minHeight;
  }
  ngAfterViewChecked(): void {
    this.setDynamicAlertHeight()
    const currentHeight = this.appHeader.nativeElement.offsetHeight;
    if (currentHeight !== this.height) {
      this.height = currentHeight;
      // Defer updates to avoid NG0100
      setTimeout(() => {
        this.minHeight = this.screenHeight - currentHeight;
        localStorage.setItem("minHeight", String(this.minHeight));
        this.menuConfig.headerOffSetHeight.next(currentHeight);
      });
    }
  }
  closeSidebar(event: any) {
    this._opened = false;
  }

  hideCustomerMsg() {
    this.showCustomerMessages = false;
    localStorage.setItem("showSalesNotification", "false");
  }

  showCustomerMsg() {
    this.showCustomerMessages = true;
    localStorage.setItem("showSalesNotification", "true");
  }

  onDismissAlert(dismissedAlert: any): void {
    this.allSalePersonNotifications = this.allSalePersonNotifications.filter(
      (message: any) => message !== dismissedAlert
    );
    this.salePersonNotifications = this.salePersonNotifications.filter(
      (message: any) => message !== dismissedAlert
    );
    if (this.salePersonNotifications?.length == 0) {
      this.showCustomerMessages = false;
      localStorage.setItem("showSalesNotification", "false");
    }
    this.cd.detectChanges();
    this.setDynamicAlertHeight();
  }

  filterNotificationsByCompany(): void {
    const companyKey = this.router.url.includes("commercial") ? "C" : "R";
    this.salePersonNotifications = this.allSalePersonNotifications.filter(
      (alert: any) => !alert.company || alert.company.includes(companyKey)
    );
  }

  get hasOrderPermissions(): boolean {
    const perms: string[] = this.storageService?.userInfo?.userPermissions || [];
    return [
      permissionsList[7],   // Check Product Availability
      permissionsList[14],  // Existing Order Inquiry
      permissionsList[29],  // Product Order Entry (Create, Edit & Cancel)
      permissionsList[36],  // Special Goods
      permissionsList[39],  // View, Create, Extend & Delete Reserves
    ].some(p => perms.includes(p));
  }

}
