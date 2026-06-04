import { XchangeSalesTeamComponent } from "./../../../components/xchange-sales-team/xchange-sales-team.component";
import { DOCUMENT } from "@angular/common";
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import {
  faAngleDown,
  faAngleRight,
  faAngleUp,
  faBars,
  faEllipsisVertical,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { ModalOptions, BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { menuType } from "../../../constants/menu/menu.type";
import { MenuConfigService } from "../../services/menu-config.service";
import { SidenavService } from "../../services/sidenav.service";
import { StorageService } from "src/app/features/http-services/storage.service";
import { TokenService } from "src/app/features/http-services/token.service";
import { residentialMenuIsCSR } from "../../../constants/menu/residential.config";
import { commercialMenuIsCSR } from "../../../constants/menu/commercial.config";
import { ApiService } from "src/app/features/http-services/api.service";
import { environment } from "src/environments/environment";
import { API_CONSTANTS } from "../../../constants/API-CONSTANTS";
import { UserService } from "../../../user/services/user.service";
import { combineLatest, skip, Subscription } from "rxjs";
import { MashupService } from "src/app/features/http-services/mashup.service";
import { SessionService } from "src/app/features/http-services/session.service";
import {
  commercialDropdownAccountSelected,
  commercialDropdownNoAccountSelected,
} from "../../../constants/user-dropdown/commercial-dropdown";
import {
  residentialDropdownAccountSelected,
  residentialDropdownNoAccountSelected,
} from "../../../constants/user-dropdown/residential-dropdown";
import { PermissionsService } from "src/app/features/http-services/permissions.service";
import { AsmService } from "../../../components/asm/services/asm.service";
import { ConfirmationDialogComponent } from "../../../components/confirmation-dialog/confirmation-dialog.component";
import { CommercialSiteSelectorService } from "src/app/features/http-services/commercial-site-selector.service";
@Component({
    selector: "app-site-header",
    templateUrl: "./site-header.component.html",
    styleUrls: ["./site-header.component.scss"],
    providers: [BsModalService],
    standalone: false
})
export class SiteHeaderComponent implements OnInit, OnDestroy {
  menuList: Array<any> = [];
  project: string = "";
  menuType!: string;
  accountInfo: any = "";
  cartCount: any = 0;
  cartData: any;
  modalRef!: BsModalRef;
  @Input() hideSideBar: boolean = false;
  accountDropdownItems: Array<any> = [];

  @ViewChild("collapse") mobileTopNavbarCollapses!: any;
  menuState!: boolean;
  mobileSearchCollapse: boolean = true;
  url: string = "";
  faAngleRight: any = faAngleRight;
  faAngleUp: any = faAngleUp;
  mobileDropdownLabel!: string ;
  logoType: string = "residential";
  logo: string = "";
  screenWidth!: number;
  isCsr = false;
  accountInfoSet = false;
  hideNavigation = false;
  miniCartSub!: Subscription;
  uidSub!: Subscription;
  accountActiveStateSub!: Subscription;
  mashupSub!: Subscription;
  userSubject!: Subscription;
  uidSubject!: Subscription;
  selectedAccountSubject!: Subscription;
  isBuilderXchnage: boolean = false;
  selectedAccountSubscription!: Subscription;
  clearunitSubject!: Subscription;
  isSalesPerson = false;
  isALCBDM = false;
  isResidentialManager = false;
  isSalesOps = false;
  salesAccountSelected = false;
  isMultiAccountCustomer = false;
  isProductManager: any;
  indextab: any;
  menuLeftt: any = [];
  mobilemenuLeft: any = [];
  isFinanceUser: any;
  @HostListener("window:resize")
  onWindowResize() {
    this.screenWidth = window.innerWidth;
  }

  showSideNav: string = menuType.sideNav;
  showTopNav: string = menuType.topNav;

  faBars = faBars;
  currentUserInfo: any = {};
  diableExitIf: any = [
    "/residential/account/search",
    "/commercial/account/search",
  ];
  profileChanges: Subscription;
  selectedAccountData: any = "";
  advncSearchFlag: boolean = false;
  backendEnvironment: any;
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private cd: ChangeDetectorRef,
    private ar: ActivatedRoute,
    private sideNav: SidenavService,
    private menuConfig: MenuConfigService,
    private modalService: BsModalService,
    public storageService: StorageService,
    private apiService: ApiService,
    private userService: UserService,
    private mashupService: MashupService,
    private router: Router,
    private tokenService: TokenService,
    private sessionService: SessionService,
    private permissionService: PermissionsService,
    private AsmService: AsmService,
    private renderer: Renderer2,
    public commercialSiteSelectorService:CommercialSiteSelectorService,
  private zone: NgZone
  ) {
     this.mobileDropdownLabel = this.router.url.includes("commercial")
    ? "Mohawk Group"
    : "Mohawk Flooring";
    this.backendEnvironment = environment?.backendEnvironment;
    this.clearunitSubject = this.storageService.triggerClearUnit.subscribe(
      (rs) => {
        if (this.storageService?.userInfo?.isSalesPerson === true) {
          this.navigateToSalesAccounts();
        } else {
          this.navigateToUserSearch();
        }
        this.exitEvent.emit();
      }
    );
    this.storageService.getItem("userInfo").subscribe(res=>{
      this.isSalesPerson = res?.isSalesPerson;
      this.isSalesOps = res?.isSalesOps;
    })
      this.isFinanceUser = this.storageService.userInfo?.isFinancialUser;

    this.profileChanges = this.userService.currentUserDetails.subscribe(
      (data: any) => {
        if (data != null) {
          this.isBuilderXchnage = data?.body?.orgUnit?.builderMigrated;
          const commercialMenu = {
            name: "Mohawk Group",
            link: "/commercial",
            linkWithCustomer: "/commercial/account/search",
            isActive: true,
            menuName: "commercial",
          };
          const resedentialMenu = {
            name: "Mohawk Flooring",
            link: "/residential",
            linkWithCustomer: "/residential/account/search",
            isActive: true,
            menuName: "residential",
          };
          if (
            data?.body?.isSalesPerson == true ||
            data?.body?.isSalesOps == true
          ) {
            if (
              data?.body?.salesPersonAvailableSites?.length == 1 &&
              data?.body?.salesPersonAvailableSites != undefined
            ) {
              if (data?.body?.salesPersonAvailableSites[0] == "R") {
                this.menuLeft = [resedentialMenu];
              }
              if (data?.body?.salesPersonAvailableSites[0] == "C") {
                this.menuLeft = [commercialMenu];
              }
            } else {
              if(data?.body?.isALCBDM || data?.body?.isResidentialManager){
                this.menuLeft = [resedentialMenu];
              }else{
                this.menuLeft = [resedentialMenu, commercialMenu];
              }
            }
          } else if (
            data?.body?.accounts?.length > 0 &&
            data?.body.isCSR == false &&
            data?.body.isFinancialSuperAdmin == false &&
            data?.body.isFinancialUser == false &&
            data?.body.isIsAdmin == false
          ) {
            const index1 = data?.body?.accounts.findIndex(
              (a: any) => a.company == "R"
            );
            const index2 = data?.body?.accounts.findIndex(
              (b: any) => b.company == "C"
            );
            this.menuLeft = [];
            if (index1 > -1) {
              this.menuLeft.push(resedentialMenu);
            }
            if (index2 > -1) {
              this.menuLeft.push(commercialMenu);
            }
          } else if (data?.body?.isMohawkOneuser) {
            this.menuLeft = [commercialMenu];
          } else {
            this.menuLeft = [resedentialMenu, commercialMenu];
          }
          if (this.menuLeft.length == 1) {
            this.project = this.menuLeft[0]?.linkWithCustomer;
            this.setEnvironment(this.menuLeft[0]);
            // this.router.navigateByUrl(this.menuLeft[0]?.linkWithCustomer);
          }
        }
        this.currentUserInfo = data?.body;
        localStorage.setItem("uid", data?.body?.uid);
        localStorage.setItem("customerName", data?.body?.name);
        this.getDataFromLocal();
      }
    );
    // this.storageService.getItem("userInfo").subscribe((res: any) => {
    //   if (
    //     res?.salesPersonAvailableSites?.length == 1 &&
    //     res?.salesPersonAvailableSites != undefined
    //   ) {
    //     if (res?.salesPersonAvailableSites[0] == "R") {
    //       this.menuLeft = [
    //         {
    //           name: "Mohawk Flooring",
    //           link: "/residential",
    //           linkWithCustomer: "/residential/account/search",
    //           isActive: true,
    //           menuName: "residential",
    //         },
    //       ];
    //     }
    //     if (res?.salesPersonAvailableSites[0] == "C") {
    //       this.menuLeft = [
    //         {
    //           name: "Mohawk Group",
    //           link: "/commercial",
    //           linkWithCustomer: "/commercial/account/search",
    //           isActive: true,
    //           menuName: "commercial",
    //         },
    //       ];
    //     }
    //   } else {
    //     this.menuLeft = [
    //       {
    //         name: "Mohawk Flooring",
    //         link: "/residential",
    //         linkWithCustomer: "/residential/account/search",
    //         isActive: true,
    //         menuName: "residential",
    //       },
    //       {
    //         name: "Mohawk Group",
    //         link: "/commercial",
    //         linkWithCustomer: "/commercial/account/search",
    //         isActive: false,
    //         menuName: "commercial",
    //       },
    //     ];
    //   }
    // });
  }
  ngOnDestroy(): void {
    // this.accountData?.unsubscribe();
    if (this.userInfo) {
      this.userInfo.unsubscribe();
    }
    if (this.selectedAccountSubject) {
      this.selectedAccountSubject.unsubscribe();
    }
    this.profileChanges.unsubscribe();
    this.miniCartSub.unsubscribe();
    this.uidSub.unsubscribe();
    this.accountActiveStateSub.unsubscribe();
    this.mashupSub.unsubscribe();
    // if (this.uidSubject) {
    //   this.uidSubject.unsubscribe();
    // }
    if (this.userSubject) {
      this.userSubject.unsubscribe();
    }
    if (this.clearunitSubject) {
      this.clearunitSubject.unsubscribe();
    }
  }
  showAllItems = false;

  toggleMenu() {
    this.showAllItems = !this.showAllItems;
  }

  isResidential: boolean = false;
  faEllipsisVertical: any = faEllipsisVertical;
  faTimes: any = faTimes;
  updateMenuForWindowSize() {
    if (window.innerWidth <= 820) {
      const currentURL = window.location.href;
      this.isResidential = currentURL.includes("/residential");
      this.menuLeftt = this.menuLeft;
      this.mobilemenuLeft = this.isResidential
        ? this.menuLeftt
        : this.menuLeftt.reverse();
    }
  }
  cssModification() {
    const dynamicPadding = document.querySelectorAll(".mobile-top-bar");
    dynamicPadding.forEach((element) => {
      const elem = element as HTMLElement;
      let paddingValue = "";

      if (this.mobilemenuLeft.length > 1) {
        paddingValue = this.accountInfoSet ? "9px 0 22px 0 " : "5px 0";
      } else {
      }
      elem.style.padding = paddingValue;
    });
  }
  modificationAfterRoute() {
    const { deviceType } = this.userService.getDeviceType();
    if (
      deviceType === "mobile" ||
      deviceType === "air" ||
      deviceType === "mini"
    ) {
      this.cssModification();
    }
  }

  ngOnInit(): void {
   
    this.updateMenuForWindowSize();

    //   if (window.innerWidth <= 820) {
    //       const currentURL = window.location.href
    //       this.isResidential = currentURL.includes("/residential")
    //       this.menuLeftt = this.menuLeft
    // this.mobilemenuLeft = this.isResidential ? this.menuLeftt : this.menuLeftt.reverse()
    //   }

    // if(currentURL.includes("/residential")){
    //   this.indextab = 0
    // } else  if(currentURL.includes("/commercial")){
    //   this.indextab = 1

    //   const selectedItemIndex = this.menuLeft.findIndex(item => item.link === '/commercial');
    //   console.log(selectedItemIndex);

    //   if (selectedItemIndex !== -1) {
    //     console.log('coming here');

    //     const selectedItem = this.menuLeft[selectedItemIndex];
    //     this.menuLeft.splice(selectedItemIndex, 1);
    //     this.menuLeft.unshift(selectedItem);
    this.advncSearchFlag = this.router?.url
      ?.toString()
      .includes("post-modification");
    this.router.events.subscribe((event) => {
      //this.setEnvironment(this.menuLeft[0]);
      this.advncSearchFlag = this.router?.url
        ?.toString()
        .includes("post-modification");
      if (event instanceof NavigationEnd) {
        this.url = this.router.url;
        this.modificationAfterRoute();
        if(this.url.includes('residential')){
          this.resetSelectedSiteForStorage();
        }
      }
    });
    this.url = this.router.url;

    if (this.userService.isMultiAccountCustomer.getValue())
      this.isMultiAccountCustomer = true;

    this.miniCartSub = this.storageService
      .getItem("miniCartCount")
      .subscribe((result) => {
        this.zone.run(() => {
             this.cartCount = result?.totalItems || 0;
             this.cartData = result;
      this.cd.detectChanges();
    });
      });
    this.uidSub = this.storageService.getItem("uid").subscribe((res) => {
      this.accountInfo = res;
      this.modificationAfterRoute();
    });
    const shipTo = this.storageService.userInfo?.orgUnit?.accountType;
    this.isProductManager = this.storageService.userInfo?.isProductManager;

    this.accountActiveStateSub = combineLatest([
      this.userService.accountInfoSet,
      this.userService.isCSR,
      this.userService.isSalesPerson,
      this.userService.isSalesOps,
      this.userService.isCustomer,
      this.userService.isFinancialSuperAdmin,
      this.userService.isFinancialUser,
      this.userService.isMultiAccountCustomer,
      this.userService.isIsAdmin,
      this.storageService.getItem("commercialSite")
    ]).subscribe(
      ([
        accountInfo,
        isCSR,
        isSalesPerson,
        isSalesOps,
        isCustomer,
        isFinancialSuperAdmin,
        isFinancialUser,
        isMultiAccountCustomer,
        isIsAdmin,
        selectedSite,
      ]) => {
        if (
          isCSR ||
          isCustomer ||
          isFinancialSuperAdmin ||
          isFinancialUser ||
          isMultiAccountCustomer ||
          isIsAdmin
        ) {
          this.accountInfoSet = accountInfo;

          if (isCustomer) {
            const moduleName = this.url.includes("commercial") ? "C" : "R";
            this.accountInfoSet =
              this.currentUserInfo?.accounts?.filter(
                (item: any) => item.company === moduleName
              ).length > 0 && !this.url.includes("multi-account");
          }
        } else {
          this.accountInfoSet = true;
          if (isSalesPerson) {
            this.isSalesPerson = true;
            this.salesAccountSelected = accountInfo;
          }
          if (isSalesOps) {
            this.isSalesOps = true;
            this.salesAccountSelected = accountInfo;
          }
        }
        this.project = this.ar.snapshot.data["project"];
        this.setAccountDropdown(this.project);
        this.logoType = this.project;
        // if (isSalesPerson && this.project === "residential") {
        //   this.accountDropdownItems = this.accountDropdownItems.filter(
        //     (item: any) => item.name !== "Mohawk Today"
        //   );
        // }
        if (isSalesPerson && this.project === "residential") {
          this.accountDropdownItems = this.accountDropdownItems.filter(
            (item: any) => item.name !== "Mohawk Sales Team"
          );
          this.resetDivider();

        }

        if(this.currentUserInfo?.isResidentialManager){
          this.accountDropdownItems = this.accountDropdownItems.filter(
            (item: any) => (item.name !== "Entitlement Manager" && item.name !== "Sample Budget" 
                && item.name !== "Sample Expense Recovery" && item.name !== "Sample Budget Transaction History" && item.name !== "Mohawk Sales Team")
          );
        }
        if(this.currentUserInfo?.isALCBDM){
          this.accountDropdownItems = this.accountDropdownItems.filter(
            (item: any) => (item.name !== "Entitlement Manager" && item.name !== "Mohawk Sales Team")
          );
        }
        if(this.project === "commercial" &&(this.commercialSiteSelectorService?.selectedSite == 'I' || this.commercialSiteSelectorService?.selectedSite == 'H')){
          this.accountDropdownItems = this.accountDropdownItems.filter(
            (item: any) => (item.name !== "Product Catalog" )
          );
          this.resetDivider();
        }
        if(this.currentUserInfo?.isMtMarketing){
          this.accountDropdownItems = this.accountDropdownItems.filter(
            (item: any) => (item.name !== "Product Catalog" && item.name !== "My Profile")
          );
        }
      }
    );
    this.mashupSub = this.mashupService.isMashup.subscribe((isMashup) => {
      if (isMashup) {
        this.hideNavigation = true;
      }
    });
    this.screenWidth = window.innerWidth;
    this.url = this.router.url;
    // this.logoType = this.url.includes("commercial")
    //   ? "commercial"
    //   : "residential";
    this.project = this.ar.snapshot.data["project"];
    this.menuList =
      this.project === "residential"
        ? residentialMenuIsCSR
        : commercialMenuIsCSR;
    this.changeFavIcon();
    this.project = this.ar.snapshot?.data["project"];
    this.updateData();
    this.cd.detectChanges();
    // this.getCartDetails();
    this.userService.userAddress.subscribe((res) => {
      localStorage.setItem("customerAddress", res);
      this.getDataFromLocal();
    });
    this.selectedAccountSubject = this.userService.currentUserDetails.subscribe(
      (res: any) => {
        if (res == null || this.selectedAccountData === res) {
          return;
        }
        this.selectedAccountData = res;
        if (res) {
          this.getCartDetails(res);
          this.getDataFromLocal();
          this.updateData();
        }
        // this.userService.getCurrentUserDetail().subscribe((data: any) => {
        //   this.currentUserInfo = data?.body;
        //   localStorage.setItem("uid", data?.body?.uid);
        //   localStorage.setItem("customerName", data?.body?.name);
        //   // localStorage.setItem("accountNumber", data?.body?.uid);
        //   // this.storageService.setItem("loginUserData", data?.body);
        //   this.getDataFromLocal();
        // });
        // }
      }
    );
  }
  setAccountDropdown(project: string) {
    this.accountDropdownItems = this.permissionService.getProfileDropdown(
      this.isSalesPerson || this.isSalesOps
        ? this.salesAccountSelected
        : this.accountInfoSet,
      project
    );
    // if ((this.isSalesPerson || this.isSalesOps) && this.salesAccountSelected) {
    //   this.accountDropdownItems = this.accountDropdownItems.filter(
    //     (item: any) => item.name !== "Sales Dashboard"
    //   );
    // }
    this.resetDivider();
  }
  
  resetDivider(){
    this.accountDropdownItems.forEach((item,ind)=>{
      if(item?.divider || item?.salesDivider){
        const index = ind;
        if(this.accountDropdownItems[index+1]?.divider){
          this.accountDropdownItems.splice(index+1,1);
          this.resetDivider();
          return;
        }
      }
    })
  }
  accountData: any;
  getCartDetails(data?: any) {
    this.getCartCount(data);
    /*   if (data) {
      this.getCartCount(data);
    } else {
      this.accountData = this.storageService
        .getItem("accountData")
        .subscribe((res: any) => {

          if (res) {
            this.getCartCount(res);
          }
        });
    }*/
  }
  userInfo: any;
  uid: any;
  previousUid = "";
  getCartCount(data: any) {
    // if (this.uidSubject) {
    //   this.uidSubject.unsubscribe();
    // }
    if (this.userSubject) {
      this.userSubject.unsubscribe();
    }
    // this.uidSubject = this.storageService
    //   .getItem("uid")
    //   .subscribe((res: any) => {
    //     this.uid = res;
    //   });
    // this.uid = this.storageService.uid;

    // if (this.uid == undefined) {
    //   return;
    // }
    // if (this.uidSubject) {
    //   this.uidSubject.unsubscribe();
    // }
    this.userSubject = this.storageService
      .getItem("userInfo")
      .subscribe((res: any) => {
        if (res) {
          if (this.previousUid === res?.orgUnit?.uid) {
            return;
          }
          this.userSubject.unsubscribe();
          this.uid = res?.orgUnit?.uid;
          this.previousUid = res?.orgUnit?.uid;
          let url = API_CONSTANTS.miniCart.replace(
            "{customerNumber}",
            res?.orgUnit?.uid
          );
          url = url.replace("{uid}", res?.uid);

          this.apiService.getMiniCartData(`${url}`).subscribe({
            next: (result: any) => {
              this.storageService.setItem("miniCartCount", result);
              this.cartCount = result?.totalItems || 0;
            },
            error: (error: any) => {
              this.cartCount = 0;
              this.storageService.setItem("miniCartCount", "");
            },
          });
        }
      });
  }

  @HostListener("window:resize")
  onResize() {
    this.mobileSearchCollapse = true;
    this.updateMenuForWindowSize();
    const { deviceType } = this.userService.getDeviceType();
    if (
      deviceType === "mobile" ||
      deviceType === "air" ||
      deviceType === "mini"
    ) {
      // console.log(deviceType);
      this.cssModification();
    } else {
      this.unset();
    }
  }
  unset() {
    const dynamicPadding = document.querySelectorAll(".mobile-top-bar");
    dynamicPadding.forEach((element) => {
      const elem = element as HTMLElement;
      let paddingValue = "";

      if (this.mobilemenuLeft.length > 1) {
        // console.log("hi", this.accountInfoSet);
        paddingValue = "unset";
      }
      elem.style.padding = paddingValue;
    });
  }
  updateData() {
    // if (this.userInfo) {
    //   this.userInfo?.unsubscribe();
    // }
    // this.userInfo = this.storageService
    //   .getItem("userInfo")
    //   .subscribe((res: any) => {
    //     if (res) {
    // this.userService.getCurrentUserDetail().subscribe((data: any) => {
    //   this.currentUserInfo = data?.body;
    //   localStorage.setItem("uid", data?.body?.uid);
    //   localStorage.setItem("customerName", data?.body?.name);
    //   // this.userService.getAddress(data?.body?.orgUnit?.uid).subscribe((data) => {
    //   //   localStorage.setItem(
    //   //     "customerAddress",
    //   //     data?.body[0]?.addresses[0]?.formattedAddress
    //   //   );
    //   // });
    //   // localStorage.setItem("accountNumber", data?.body?.uid);
    //   // this.storageService.setItem("loginUserData", data?.body);
    //   this.getDataFromLocal();
    // });
  }

  ngAfterViewInit() {
    this.menuConfig.currentState.subscribe(
      (_menuType) => (this.menuType = _menuType)
    );
    this.sideNav.currentState.subscribe((open) => (this.menuState = open));
    this.cd.detectChanges();
  }

  menuLeft: Array<any> = [];
  menuRight: Array<any> = [];
  displayCustomerNumber: any;
  displayCustomerAddress: any;

  faAngleDown = faAngleDown;
  setActive(menuName: string) {
    let className = "";
    const path: any = this.router.url.split("?");
    if (path[0].includes(menuName)) {
      className = "active";
    }
    return className;
  }
  toggleDropdown(id: string) {
    const el: any = this.document.getElementById(id);
    if (el && this.screenWidth <= 992) {
      el.classList.toggle("show");
      this.cd.detectChanges();
    }
  }

  showMenu() {
    this.sideNav.show();
  }

  hideMenu() {
    this.sideNav.hide();
  }

  getLogoRouterLink(){
    //isSalesPerson ? '/' + logoType+'/salesperson':'/' + logoType
    let routerLink = '/' + this.logoType;
    if( this.storageService.userInfo?.isALCBDM || this.storageService.userInfo?.isResidentialManager || this.storageService.userInfo?.isSalesPerson|| this.storageService.userInfo?.isSalesOps){
      routerLink = '/' + this.logoType+'/salesperson';
    }else if(this.storageService.userInfo?.isProductManager){
      routerLink = '/' + this.logoType+'/product-owner';
    }
    return routerLink;
  }

  logout() {
    //  this.storageService.removeItem('miniCartCount');
    // this.storageService.removeItem('uid');
    //this.storageService.removeItem('userInfo');
    if (sessionStorage.getItem("startSession")) {
      this.AsmService.stopSession().subscribe({
        next: (res) => {
          this.sessionService.logout();
        },
      });
    } else {
      // let tokenId = sessionStorage.getItem("token");
      // this.sessionService.authRevoke({ token: tokenId }).subscribe((res: any) => {        
      this.sessionService.logout();
      // },
      // (error)=>{});
    }
  }

  toggleMobileTopNav() {
    this.mobileTopNavbarCollapses.isTransitioning = true;
    this.mobileTopNavbarCollapses.isCollapsed =
      !this.mobileTopNavbarCollapses.isCollapsed;
  }
  commercialSalesTeam = [
    {
      name: "Danny JOHINDES",
      title: "Flooring North America",
      address:
        "Aladdin Commercial, Mohawk Aligned Ss, Mohawk Residential, Mohawk and Mohawk Color Center Brands",
      mobile: "(410) 424-1040",
      email: "Danny_Johnidesa@Mohawkind.com",
    },
    {
      name: "Stephen HAYES",
      title: "Flooring North America",
      address:
        "Pergo, Floor Care Essential, Moahawk Hard Surface, Mohawk Ceramic, Mohawk Aligned Hs and Direct Import Resil Brands",
      mobile: "",
      email: "stephen_hayesa@Mohawkind.com",
    },
    {
      name: "Annetta WHITE",
      title: "Flooring North America",
      address:
        "Karastan Wool, Karastan Gallery Des, Karastan. Godfrey Hrst Na and Karastan Hard Surface Brands",
      mobile: "",
      email: "Annetta_White@Mohawkind.com",
    },
  ];
  residentialSalesTeam = [
    {
      name: "Danny JOHINDES",
      title: "Flooring North America",
      address:
        "Aladdin Commercial, Mohawk Aligned Ss, Mohawk Residential, Mohawk and Mohawk Color Center Brands",
      mobile: "(410) 424-1040",
      email: "Danny_Johnidesa@Mohawkind.com",
    },
    {
      name: "Stephen HAYES",
      title: "Flooring North America",
      address:
        "Pergo, Floor Care Essential, Moahawk Hard Surface, Mohawk Ceramic, Mohawk Aligned Hs and Direct Import Resil Brands",
      mobile: "",
      email: "stephen_hayesa@Mohawkind.com",
    },
    {
      name: "Annetta WHITE",
      title: "Flooring North America",
      address:
        "Karastan Wool, Karastan Gallery Des, Karastan. Godfrey Hrst Na and Karastan Hard Surface Brands",
      mobile: "",
      email: "Annetta_White@Mohawkind.com",
    },
  ];
  bsModalRef!: BsModalRef;
  openSalesModal() {
    const initialState: ModalOptions = {
      initialState: {
        data: this.router.url?.split("?")[0].includes("commercial")
          ? this.commercialSalesTeam
          : this.residentialSalesTeam,
      },
    };
    this.bsModalRef = this.modalService.show(
      XchangeSalesTeamComponent,
      Object.assign(initialState, {
        id: "salesTeam",
        class: "modal-xl modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
    this.bsModalRef.content.cardsData = this.router.url
      ?.split("?")[0]
      .includes("commercial")
      ? this.commercialSalesTeam
      : this.residentialSalesTeam;
  }

  changeFavIcon() {
    const favIcon = this.document.getElementById("appFavicon");
    if (this.project === "residential") {
      favIcon?.setAttribute("href", "/assets/icons/commercial-favicon.ico");
    } else {
      favIcon?.setAttribute("href", "/assets/icons/residential-favicon.png");
    }
    this.cd.detectChanges();
  }

  navigateToCart() {
    if (this.project.includes("residential")) {
      this.router.navigate(["/residential/cart"]);
    } else if (this.project === "residential") {
      this.router.navigate(["/residential/cart"]);
    } else if (this.project === "commercial" && !this.cartData.isQuote) {
      this.router.navigate(["/commercial/cart"]);
    } else if (this.project === "commercial" && this.cartData.isQuote) {
      if (this.cartData.quoteStatus === "BUYER_DRAFT") {
        this.router.navigateByUrl(
          "/commercial/quotes/request-quote/" + this.cartData?.quoteNumber
        );
      } else {
        this.router.navigate(["/commercial/cart"]);
      }
    } else if (this.project.includes("commercial")) {
      this.router.navigate(["/commercial/cart"]);
    }
  }
  navigateToAdvanceSearch() {
    if (this.project.includes("residential")) {
      this.router.navigate(["/residential/advance-search"]);
    } else {
      this.router.navigate(["/commercial/advance-search"]);
    }
  }
  @Output() exitEvent = new EventEmitter();
  exitClick() {
    localStorage.setItem("customerAddress",'');
    localStorage.setItem("accountNumber",'');
    if (this.cartCount > 0) {
      if (
        this.storageService?.userInfo?.isSalesPerson &&
        !this.storageService?.userInfo?.isSalesOps
      ) {
        this.handleSalesPersonCartValidation();
      } else {
        this.handleCartValidation();
      }
    } else if (this.storageService?.userInfo?.isSalesPerson) {
      if (
        this.storageService?.userInfo?.isSalesPerson &&
        this.storageService?.userInfo?.orgUnit?.inHouseAccount
      ) {
        this.navigateToSalesAccountsInCaseOfInhouseAccount(
          this.storageService?.userInfo?.orgUnit?.uid
        );
      } else {
        this.navigateToSalesAccounts();
      }
    } else {
      this.navigateToUserSearch();
      this.hideMenu();
    }
  }

  handleCartValidation() {
    this.openConfirmationModal({
      title: "Did you forget something?",
      content: `You have items in your cart.
      Would you like to save this session to return later?`,
      primaryActionLabel: "SAVE",
      secondaryActionLabel: "CANCEL",
      onPrimaryAction: () => {
        this.modalService.hide("cartValidationConfirmation");
        this.navigateToUserSearch();
        this.hideMenu();
      },
      onSecondaryAction: () => {
        this.clearCart(false);
      },
    });
  }
  handleSalesPersonCartValidation() {
    this.openConfirmationModal({
      title: "Did you forget something?",
      content: `You have items in your cart.
      Would you like to save this session to return later?`,
      primaryActionLabel: "SAVE",
      secondaryActionLabel: "CANCEL",
      onPrimaryAction: () => {
        this.modalService.hide("cartValidationConfirmation");
        this.navigateToSalesAccounts();
      },
      onSecondaryAction: () => {
        this.clearCart(true);
      },
    });
  }

  openConfirmationModal(data = {}) {
    const initialState: ModalOptions = {
      backdrop: true,
      ignoreBackdropClick: true,
      initialState: {
        ...data,
      },
    };
    this.modalRef = this.modalService.show(
      ConfirmationDialogComponent,
      Object.assign(initialState, {
        id: "cartValidationConfirmation",
        class: "modal-md modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }

  clearCart(isSalesPerson = false) {
    this.userService
      .cancelCart(this.cartData?.code || "123456")
      .subscribe((res) => {
        this.modalService.hide("cartValidationConfirmation");
        if (isSalesPerson) {
          this.navigateToSalesAccounts();
        } else {
          this.navigateToUserSearch();
        }
        this.hideMenu();
      });
  }

  navigateToUserSearch() {
    const scrollerElement = document.getElementsByClassName(
      "ng-sidebar__content"
    )[0];
    if (scrollerElement) {
      this.renderer.setStyle(scrollerElement, "padding", "unset");
    }
    if (this.storageService.cartData?.code) {
      const cartId = this.storageService.cartData?.code;
      const selectedEnvironment = this.userService.environmentForCartModal;
      if (this.storageService.userInfo?.isCustomer) {
        this.userService.showCartModal(cartId, selectedEnvironment);
      }
    }
    const baseUrlPath = this.router.url.split("?")[0].includes("commercial")
      ? "commercial"
      : "residential";
      let selectedSiteForCommercial:any;
      if(baseUrlPath === "commercial"){
        selectedSiteForCommercial = this.commercialSiteSelectorService.storedSiteId;
      }
    this.storageService.clear();
    if(baseUrlPath === "commercial"){
        this.commercialSiteSelectorService.setSelectedSite(selectedSiteForCommercial);
      }
    // localStorage.removeItem("customerAddress");
    // localStorage.setItem("accountNumber", "");
    this.userService.setAccountInfoState(false);
    this.menuRight[1].name = "";
    this.getDataFromLocal();
    localStorage.setItem("customerAddress", "");
    this.userService.clearB2BUnit().subscribe(() => {
      this.resetSelectedSiteForStorage();
      if (!this.currentUserInfo?.isCustomer) {
        this.router.navigate(["/" + baseUrlPath + "/account/search"]);
      } else {
        this.router.navigate(["/" + baseUrlPath + "/account/multi-account"]);
      }
    });
    const showPopup = this.document.querySelector(".show-pop-menu");
    showPopup?.classList.remove("show-pop-menu");
    const backdropElement: any = document.getElementsByClassName(
      "ng-sidebar__backdrop"
    );
    if (backdropElement && backdropElement.length > 0) {
      backdropElement[0].classList.remove("ng-sidebar__backdrop");
    }
    this.exitEvent.emit(true);
  }

  resetSelectedSiteForStorage(){
    this.commercialSiteSelectorService.resetSelectedSiteForStorage();
  }

  navigateToSalesAccounts() {
    // this.userService.setUnit("").subscribe();
    this.storageService.skipMultilogin = true;
    this.storageService.setItem("userInfo", null);
    this.userService
      .setUnit(this.storageService?.userInfo?.orgUnit?.uid || "")
      .subscribe((res) => {
        this.userService.setAccountInfoState(false);
        this.storageService.setselectedAccount(null);
        this.userService.currentUserDetails.next(null);
        // this.resetSelectedSiteForStorage();
        const baseUrlPath = this.router.url.split("?")[0].includes("commercial")
          ? "commercial"
          : "residential";
        // this.router.navigate(["/" + baseUrlPath + "/salesperson/view-accounts"]);
        this.router.navigate(["/" + baseUrlPath + "/account/search"]);

      });
  }

  navigateToSalesAccountsInCaseOfInhouseAccount(uid: any) {
    this.storageService.skipMultilogin = true;
    this.storageService.setItem("userInfo", null);
    this.userService.setUnit("?unitUid=" + uid).subscribe((res) => {
      this.userService.setAccountInfoState(false);
      this.storageService.setselectedAccount(null);
      this.userService.currentUserDetails.next(null);
        // this.resetSelectedSiteForStorage();
      const baseUrlPath = this.router.url.split("?")[0].includes("commercial")
        ? "commercial"
        : "residential";
      this.router.navigate(["/" + baseUrlPath + "/salesperson"]);
    });
  }
  // navigateToCustomerAccounts() {
  //   const baseUrlPath = this.router.url.split("?")[0].includes("commercial")
  //     ? "commercial"
  //     : "residential";
  //   this.router.navigate(["/" + baseUrlPath + "/account/multi-account"]);
  // }

  setSelected() {
    return this.accountInfo;
  }
  private setLogo(name: any) {
    if (name != null) {
      let index = name.indexOf(" ");
      this.logo = name.substring(0, 1) + name.substring(index + 1, index + 2);
    }
  }

  setExitItem() {
    const module = this.url.includes("commercial") ? "C" : "R";
    if (
      this.storageService.userInfo?.isCSR ||
      this.storageService.userInfo?.isFinancialSuperAdmin ||
      this.storageService.userInfo?.isFinancialUser ||
      this.storageService.userInfo?.isIsAdmin ||
      (this.storageService.userInfo?.isCustomer &&
        this.currentUserInfo?.accounts?.filter(
          (item: any) => item.company === module
        ).length > 1 &&
        !this.url.includes("multi-account"))
    )
      return true;
    return false;
  }

  getDataFromLocal() {
    if (this.menuRight.length > 1) {
      this.menuRight[2] = {
        name:
          localStorage.getItem("customerAddress") == "undefined" ||
          localStorage.getItem("customerAddress") == undefined
            ? ""
            : localStorage.getItem("customerAddress"),
        isShow: this.setExitItem(),
      };
    }
    if (this.currentUserInfo == undefined) {
      return;
    }
    // this.currentUserInfo = this.storageService.userInfo;
    if (this.currentUserInfo) {
      if (
        this.currentUserInfo?.orgUnit?.uid == " " ||
        this.currentUserInfo?.orgUnit?.uid == undefined ||
        this.currentUserInfo?.orgUnit?.uid == null
      ) {
        this.displayCustomerNumber = "EMPTY_B2BUNIT";
        localStorage.setItem("customerAddress", "");
      } else {
        this.displayCustomerNumber = this.currentUserInfo?.orgUnit?.uid
          ? isNaN(this.currentUserInfo?.orgUnit?.uid.split("_")[0])
            ? this.currentUserInfo?.orgUnit?.uid
            : this.currentUserInfo?.orgUnit?.uid.split("_")[0] * 1
          : ""; // or any fallback value like ""
      }
    } else {
      this.displayCustomerNumber = localStorage.getItem("accountNumber");
    }

    this.displayCustomerAddress = localStorage.getItem("customerAddress");

    /* while (
      this.displayCustomerNumber.length > 1 &&
      this.displayCustomerNumber.startsWith("0")
    ) {
      this.displayCustomerNumber = this.displayCustomerNumber.slice(1);
    }*/

    const name = localStorage.getItem("customerName");
    const name1 = this.currentUserInfo?.orgUnit?.name;
    this.menuRight = [
      {
        name:
          this.currentUserInfo?.isCSR === true ||
          this.currentUserInfo?.isSalesPerson === true ||
          this.currentUserInfo?.isSalesOps === true
            ? this.currentUserInfo?.orgUnit?.name
            : localStorage.getItem("customerName"),
        icon: this.currentUserInfo?.isCSR === true ? false : true,
        link: "",
      },
      {
        name: this.displayCustomerNumber,
      },
      {
        name:
          localStorage.getItem("customerAddress") == "undefined" ||
          localStorage.getItem("customerAddress") == undefined
            ? ""
            : this.displayCustomerAddress,
        isShow: this.setExitItem(),
      },
    ];
    // this.setLogo(this.currentUserInfo.name);
    this.setLogo(this.currentUserInfo?.orgUnit?.name || '');


  }
  setEnvironment(menu: any) {
    this.userService.setEnvironment(menu.menuName);
  }
  selectedItem: any; // Assuming this variable holds the selected item's link
  showItems = false;

  toggleItems() {
    this.showItems = !this.showItems;
  }
  selectItem(item: any) {
    this.router.navigateByUrl(item.link);
  }

  salesDashboardClick() {
    if (
      this.storageService.userInfo?.orgUnit.inHouseAccount === false &&
      (this.storageService.userInfo?.isSalesPerson === true ||
        this.storageService.userInfo?.isSalesOps === true || this.storageService.userInfo?.isALCBDM === true || this.storageService.userInfo?.isResidentialManager === true)
    ) {
      this.exitClick();
    } else {
      this.router.navigateByUrl(this.logoType + "/salesperson");
    }
  }

  exitSite(){
    this.commercialSiteSelectorService.openSiteSelectionModal({
                  onPrimaryAction: (value: any) => {
                    this.commercialSiteSelectorService.setSelectedSite(value);
                  },
                });
  }

  checkIsASMSessionStarted(){
    return sessionStorage.getItem("startSession")
  }
}
