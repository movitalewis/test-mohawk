import { DOCUMENT } from "@angular/common";
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Inject,
  OnInit,
  Output,
  QueryList,
  Renderer2,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
  NgxNavbarCollapseComponent,
  NgxNavbarDynamicExpandDirective,
} from "ngx-bootstrap-navbar";
import { StorageService } from "src/app/features/http-services/storage.service";
import { commercialMenuIsCSR } from "../../../constants/menu/commercial.config";
import { MenuConfigService } from "../../services/menu-config.service";
import { SidenavService } from "../../services/sidenav.service";
import { residentialMenuIsCSR } from "../../../constants/menu/residential.config";
import { UserService } from "../../../user/services/user.service";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { ConfirmationDialogComponent } from "../../../components/confirmation-dialog/confirmation-dialog.component";
import { ProductListService } from "src/app/features/commercial/products/services/product-list.service";
import { MakePaymentService } from "src/app/features/commercial/finance/payments/services/make-payment.service";

@Component({
    selector: "xchange-sidenav",
    templateUrl: "./site-sidenav.component.html",
    styleUrls: ["./site-sidenav.component.scss"],
    standalone: false
})
export class SiteSidenavComponent implements OnInit {
  accountName: string | null = "";
  accountId: string | null = "";
  accountAddress: string | null = "";
  displayCustomerNumber: any;
  customerName: any;
  isSalesOps = false;
  isSalesPerson = false;
  url: string = "";
  logo: string = "";
  isMobile: boolean | any;
  minimumHeight: any;
  innerHeight: number = window.innerHeight;
  zoomLevel: number = 100;
  @Output() exitEvent = new EventEmitter();

  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    const screenWidth = window.innerWidth;
    const realScreenWidth = window.screen.width;
    this.zoomLevel = Math.round((screenWidth / realScreenWidth) * 100);
    if (!this.isMobile) {
      const scrollerElement = document.getElementsByClassName(
        "ng-sidebar__content"
      )[0];
      if (scrollerElement) {
        document.body.classList.add("add-scroll");
      }
      const xsmall = document.querySelectorAll(".main-side-bar-container");
      xsmall.forEach((element) => {
        const elem = element as HTMLElement;
        if (window.screen.width > 1024) {
          const screenHeight: number = window.innerWidth;
          elem.style.height = `${screenHeight}px`;
        } else {
          const screenHeight: number = window.innerHeight;
          elem.style.height = `${screenHeight}px`;
        }
      });
    }
    this.onResizeScreenHideMenuDropdown();
    this.isMobile = window.innerWidth < 1024;
    return this.isMobile;
  }

  @ViewChildren("collapse")
  ngxNavbarCollapses!: QueryList<NgxNavbarDynamicExpandDirective>;
  menuCurrentState!: boolean;
  menuConfig: Array<any> = []; //commercialMenuIsCSR;
  project: string = "";
  modalRef!: BsModalRef;
  localStorageRef:any;
  constructor(
    private r: Router,
    private sideNav: SidenavService,
    private cd: ChangeDetectorRef,
    @Inject(DOCUMENT) private document: Document,
    private ar: ActivatedRoute,
    public storageService: StorageService,
    private menuConfigService: MenuConfigService,
    private router: Router,
    private userService: UserService,
    private modalService: BsModalService,
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private productListService: ProductListService,
    private makePaymentService: MakePaymentService,
    
  ) {}

siteSelectionSub:any;
  ngOnInit(): void {
    this.localStorageRef = localStorage;
    this.project = this.ar.snapshot.data["project"];
    this.menuConfig = residentialMenuIsCSR;
    this.storageService.getItem("userInfo").subscribe((userData: any) => {
      this.accountName = userData?.name;
      this.isSalesPerson = userData?.isSalesPerson;
      this.isSalesOps = userData?.isSalesOps;
      this.menuConfigService
        .getMenuData(this.project, userData)
        .subscribe((menu) => {
          this.menuConfig = [...[],...menu];
        });
        if(this.siteSelectionSub){
          this.siteSelectionSub.unsubscribe();
        }
        this.siteSelectionSub = this.storageService.getItem("commercialSite").subscribe(() => {
          this.menuConfigService
            .getMenuData(this.project, userData)
            .subscribe((menu) => {
              this.menuConfig = [...[], ...menu];
            });
        });
    });
    
    this.accountId = localStorage.getItem("accountNumber");
    this.accountAddress = localStorage.getItem("customerAddress");
    // this.accountId = this.storageService.userInfo?.orgUnit?.uid?.split("_")[0];
    // this.accountAddress = localStorage.getItem("customerAddress");
    // this.companyCode = this.storageService.userInfo?.orgUnit?.name;
    // this.setLogo(this.accountName);
    this.storageService.getselectedAccount().subscribe((data: any) => {
      if (data) {
        // if (localStorage.getItem("accountNumber")) {
        //   this.displayCustomerNumber = localStorage
        //     .getItem("accountNumber")
        //     ?.split("_")[0];
        // }
        this.accountAddress = localStorage.getItem("customerAddress");

        this.setLogo(data?.name);
      }
    });
    this.storageService.getItem("userInfo").subscribe((res) => {
      this.customerName = 
      res?.isCSR === true ||
      res?.isSalesPerson === true ||
      res?.isSalesOps === true
        ? res?.orgUnit?.name
        : localStorage.getItem("customerName");
        this.setLogo(res?.name);
    });
    // this.storageService.getItem("accountData").subscribe((res: any) => {
    //   this.customerName = res?.accountName;
    //   // this.displayCustomerNumber = +res?.customerNumber?.split("_")[0];
    // });
    this.storageService.getItem('userInfo').subscribe((userInfo:any)=>{
      if (
        userInfo?.orgUnit?.uid == " " ||
        userInfo?.orgUnit?.uid == undefined ||
        userInfo?.orgUnit?.uid == null
      ) {
        this.displayCustomerNumber = "EMPTY_B2BUNIT";
        localStorage.setItem("customerAddress", "");
      } else {
        this.displayCustomerNumber = userInfo.orgUnit?.uid
          ? isNaN(userInfo?.orgUnit.uid.split("_")[0])
            ? userInfo?.orgUnit.uid
            : userInfo?.orgUnit.uid.split("_")[0] * 1
          : ""; // or any fallback value like ""

      }
    })
    this.url = this.router.url; 
  }

  ngAfterViewInit() {
    this.sideNav.currentState.subscribe((open) => {
      this.menuCurrentState = open;
      if (!open) {
        this.ngxNavbarCollapses.forEach((c: any) => {
          c.isCollapsed = true;
        });
        const buttonElements = document.querySelectorAll(".rotate90");
        for (let i = 0; i <= buttonElements.length; i++) {
          if (buttonElements[i] && buttonElements[i].classList)
            buttonElements[i].classList.remove("rotate90");
        }
      }
    });

    this.cd.detectChanges();
  }

  toggleMenu() {
    if (this.menuCurrentState) {
      if (!this.isMobile) {
        const minset: any = localStorage.getItem("minHeight");
        const setagain = document.querySelectorAll(".main-side-bar-container");
        setagain.forEach((element) => {
          const elem = element as HTMLElement;
          elem.style.height = `${minset}px`;
        });
      }
      this.sideNav.hide();
    } else {
      if (!this.isMobile) {
        const xsmall = document.querySelectorAll(".main-side-bar-container");
        xsmall.forEach((element) => {
          const elem = element as HTMLElement;
          if (window.screen.width > 1024) {
            const screenHeight: number = window.innerWidth;
            elem.style.height = `${screenHeight}px`;
          } else {
            const screenHeight: number = window.innerHeight;
            elem.style.height = `${screenHeight}px`;
          }
        });
      }
      this.sideNav.show();
    }
    return true;
  }

  expandSideNav() {
    this.sideNav.show();
  }

  navigateToRoute(
    path: string,
    e: any,
    isExternal: boolean,
    level1: any = null
  ) {
    if (!this.isMobile) {
      const scrollerElement = document.getElementsByClassName(
        "ng-sidebar__content"
      )[0];
      if (scrollerElement) {
        this.renderer.setStyle(scrollerElement, "overflow", "hidden");
      }
      const minset: any = localStorage.getItem("minHeight");
      const setagain = document.querySelectorAll(".main-side-bar-container");
      setagain.forEach((element) => {
        const elem = element as HTMLElement;
        elem.style.height = `${minset}px`;
      });

      const scroll = document.querySelectorAll(".custom-scrollbar");
      scroll.forEach((element) => {
        const elem = element as HTMLElement;
        elem.scrollTop = 0;
      });
    }
    const navEle = e.target;
    if (isExternal) {
      if (e.target.text == "EDI Setup") {
        this.openConfirmationModal({
          title: "B2B EDI Software Required",
          content: "Xchange requires B2B EDI software",
          primaryActionLabel: "Continue",
          secondaryActionLabel: "Cancel",
          onPrimaryAction: () => {
            window.open(path);
            this.modalService.hide();
          },
          onSecondaryAction: () => {
            this.modalService.hide();
          },
        });
      } else {
        window.open(path);
      }
      return;
    }

    if(path.includes('payments/receivables') && !path.includes('payments/receivables/select-users') && this.userService?.isWellsFargo()){
      this.handleMakeAPayment();
    }
    else{
      localStorage.setItem("path", path);
      this.r.navigateByUrl("/" + path);
    }

    // debugger
    const subMenu = navEle.closest(".level1-li");
    // subMenu.classList.toggle("show-pop-menu");

    subMenu.classList.remove("show-pop-menu");

    // subMenu.classList.toggle("show-pop-menu");
    subMenu.classList.remove("show-pop-menu");
    this.sideNav.hide();
    return true;
  }

  handleMakeAPayment(){
    // this.loadingFlag = true;
    // this.errorMessage = "";
      let newTab = window.open("", "_blank");
      this.makePaymentService.ebillExpressAuthentication().subscribe((res: any) => {
        // this.loadingFlag = false;
        if(res?.body){
          let ebillUrl = res.body?.url || 'https://demo.e-billexpress.com/ebpp/MohawkTest/?ssotoken=601d0b02-568f-4460-9243-563cedbc2d85';
          // window.open(ebillUrl, "_blank");
          // let newTab = window.open(ebillUrl, "_blank");
          if(newTab){
            newTab.location.href = ebillUrl;
          }
          if (!newTab || newTab.closed || typeof newTab.closed === "undefined") {
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
          // this.errorMessage ="Popup blocked! Please allow popups for this site.";
          }
        }
      },(err:any)=>{
        // this.loadingFlag = false;
        // this.errorMessage ="Error message.";

      });
  }

  handleCollapse(level: string, index: number) {
    const collapseElement = this.document.getElementById(
      level + "-collapse-" + index
    );
    const btnElement = this.document.getElementById(level + "-btn-" + index);
    if (collapseElement?.classList.contains("collapsing")) {
      btnElement?.classList.toggle("rotate90");
    }
    this.ngxNavbarCollapses.forEach((c: any) => {
      if (
        c.nativeElement.id !== level + "-collapse-" + index &&
        c.nativeElement?.id?.includes(level)
      ) {
        c.isCollapsed = true;
      }
    });
    const collapseBtnList = document.querySelectorAll(
      "[id^='" + level + "-btn-']"
    );
    collapseBtnList.forEach((btn: any) => {
      if (btn.id !== level + "-btn-" + index) {
        btn.classList.remove("rotate90");
      }
    });
    return true;
  }
  @HostListener("document:click", ["$event"])
  onClick(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      if (!this.isMobile) {
        const minset: any = localStorage.getItem("minHeight");
        const setagain = document.querySelectorAll(".main-side-bar-container");
        setagain.forEach((element) => {
          const elem = element as HTMLElement;
          elem.style.height = `${minset}px`;
        });
      }
    }
  }
  showTooltip = false;
  onShowMenu(e: any, name: any,level:any,menus:any) {
    if (!this.isMobile) {
      const scrollerElement = document.getElementsByClassName(
        "ng-sidebar__content"
      )[0];
      if (scrollerElement) {
        document.body.classList.add("add-scroll");
      }
      const xsmall = document.querySelectorAll(".main-side-bar-container");
      xsmall.forEach((element) => {
        const elem = element as HTMLElement;
        const innerHeight = window.innerHeight;
        if (this.zoomLevel <= 80) {
          const calhieght = innerHeight ;
          //elem.style.height = `${calhieght}px`;
        } else {
          //elem.style.height = `${innerHeight}px`;
        }
        const xsmall = document.querySelectorAll(".sub-menu");
        if (name === "Finance") {
        menus.forEach((menu :any, index:any) => {
          if (index > 2) {
            if (window.screen.width > 1024) {
              if (menu.subNav && menu.subNav.length > 3) {
                xsmall.forEach((element) => {
                  const elem = element as HTMLElement;
                  elem.style.top = "-68px";
                });
              }
            }
          }
        });
      }
        else{
          xsmall.forEach((element) => {
            const elem = element as HTMLElement;
          elem.style.top='0px';
          })
        }
      });
    }

    this.showTooltip = false;
    const showPopup = this.document.querySelector(".show-pop-menu");
    showPopup?.classList.remove("show-pop-menu");
    const navItem = e.target.closest(".level1-li");
    navItem.classList.toggle("show-pop-menu");
    return true;
  }

  onClickedOutsideOfMenu(name: string, i: number) {
    const navItem = this.document.querySelector("." + name + i);
    navItem?.classList.remove("show-pop-menu");

    // if (navItem && navItem.classList) {
    //   navItem.classList.remove("show-pop-menu");
    // }
  }

  onResizeScreenHideMenuDropdown() {
    const showPopup = this.document.querySelector(".show-pop-menu");
    showPopup?.classList.remove("show-pop-menu");
  }

  navigateToUserSearch() {
    this.unset()
    const baseUrlPath = this.router.url.split("?")[0].includes("commercial")
      ? "commercial"
      : "residential";
    this.storageService.clear();
    this.userService.setAccountInfoState(false);
    this.sideNav.hide();
    this.r.navigate(["/" + baseUrlPath + "/account/search"]);
    // return true;
    // this.r.navigate(["/residential/account/search"]);

  }
  private setLogo(name: any) {
    if (name != null) {
      let index = name.indexOf(" ");
      this.logo = name.substring(0, 1) + name.substring(index + 1, index + 2);
    }
  }
  ngOnDestroy() {}

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
        id: "side-nav-confirmation",
        class: "modal-md modal-dialog-centered",        
        backdrop: "static",
        keyboard: false,
      })
    );
  }
  unset(){
    const dynamicPadding = document.querySelectorAll(".mobile-top-bar");
    dynamicPadding.forEach((element) => {
      const elem = element as HTMLElement;
      let paddingValue = "";
        paddingValue =  "5px 0";
      elem.style.padding = paddingValue;
    });
  }
  exitClick(){
    this.exitEvent.emit(true);
  }
}
