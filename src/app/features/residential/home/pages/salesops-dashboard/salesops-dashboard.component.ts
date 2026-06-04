import { Component, Input, OnInit, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import {
  CarouselComponent,
  OwlOptions,
  SlidesOutputData,
} from "ngx-owl-carousel-o";
import { TabService } from "src/app/features/residential/orders/services/tab.service";
import { StorageService } from "src/app/features/http-services/storage.service";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { MakePaymentService } from "../../../finance/payments/services/make-payment.service";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { ProgressModalComponent } from "src/app/features/shared/components/progress-modal/progress-modal.component";
   import { MESSAGE_CONSTANTS } from 'src/app/features/shared/constants/MESSAGE-CONSTANTS';
import { permissionsList } from "src/app/features/shared/constants/PERMISSIONS_CONSTANTS";
import { filter, Subject, take, takeUntil } from "rxjs";
@Component({
    selector: "app-salesops-dashboard",
    templateUrl: "./salesops-dashboard.component.html",
    styleUrls: ["./salesops-dashboard.component.scss"],
    standalone: false
})
export class SalesopsDashboardComponent implements OnInit, OnDestroy {
  @Input() dashboardData!: any;
  @Input()name!:any
  loadingFlag = false;
  errorMessage ="";
  customOptions: OwlOptions = {
    loop: false,
    autoWidth: false,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    navText: [
      '<i class="fa fa-angle-left" aria-hidden="true"></i>',
      '<i class="fa fa-angle-right" aria-hidden="true"></i>',
    ],
    margin: 25,
    responsive: {
      0: {
        items: 2,
      },
      400: {
        items: 2,
        margin:5
      },
      740: {
        items: 5,
      },
      940: {
        items: 5,
      },
    },
    nav: true,
    stagePadding: 27,
  };
  selectedValue: any;
  modalRef?: BsModalRef;
    destroySubject: Subject<void> = new Subject();
  constructor(private router: Router, private tabService: TabService, 
    public storageService: StorageService, public userService:UserService,
      private makePaymentService: MakePaymentService,
      private modalService: BsModalService, 
  ) { 
    this.showProgress();
  }
  currentDate!: string;
  ngOnInit(): void {
    this.storageService.getItem("userInfo")
      .pipe(takeUntil(this.destroySubject))
      .subscribe((res) => {
        console.log("User Info from StorageService:", res);
        if((res === null || !res) && this.userService?.modalRef?.id !== "SALESOPSProgressModal"){
          this.showProgress();
        }else if(res?.userPermissions && this.userService?.modalRef?.id === "SALESOPSProgressModal" && this.hasOrderPermissions){
          this.hideProgress();
        }
      })
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      month: "long",
      day: "numeric",
    };
    this.currentDate = today.toLocaleDateString("en-US", options);
       
  //  setTimeout(() => {
  //   this.hideProgress();
  //  }, 2000);
  }

  routerTo(item: any) {
    sessionStorage.removeItem("tabId");
    if(item.path.includes('payments/receivables') && this.userService?.isWellsFargo()){
      this.handleMakeAPayment()
    }else
    if (item?.path.startsWith("http") || item?.path.startsWith("www")) {
      window.open(item?.path, "_blank");
    } else {
      if (item?.queryParams) {
        this.router.navigate([item?.path], {
          queryParams: item?.queryParams,
        });
        this.tabService.setActiveTabIndex(item?.queryParams.page);
      } else {
        this.router.navigate([item?.path]).catch((err) => {
          console.error("Navigation error:", err);
        });
      }
    }
 
  }
  handleMakeAPayment(){
    this.loadingFlag = true;
    this.errorMessage = "";
      this.makePaymentService.ebillExpressAuthentication().subscribe((res: any) => {
        this.loadingFlag = false;
        if(res?.body){
          let ebillUrl = res.body?.url || 'https://demo.e-billexpress.com/ebpp/MohawkTest/?ssotoken=601d0b02-568f-4460-9243-563cedbc2d85';
          // window.open(ebillUrl, "_blank");
          let newTab = window.open(ebillUrl, "_blank");
          if (!newTab || newTab.closed || typeof newTab.closed === "undefined") {
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
          this.errorMessage ="Popup blocked! Please allow popups for this site.";
          }
        }
      },(err)=>{
        this.loadingFlag = false;
        this.errorMessage ="Service failed, please retry!";

      });
  }

  onSelectChanged(value:any){
    this.selectedValue = value;
  }
  
  onSearchTextEntered(searchValue: any) {
    if (searchValue.searchText.trim().length > 2) {
      if (searchValue?.type == "residentialNewOrder") {
        this.router.navigate(["/residential/products"], {
          queryParams: { search: searchValue?.searchText },
        });
      } else if (this.selectedValue == "order") {
        this.router.navigate(["/residential/orders"], {
          queryParams: { page: 0, searchText: searchValue?.searchText },
        });
      } else if (this.selectedValue == "invoice") {
        this.router.navigate(["/residential/finance/invoices"], {
          queryParams: { searchText: searchValue?.searchText },
        });
      }
      else if (this.selectedValue == "claims") {
        this.router.navigate(["/residential/claims/history"], {
          queryParams: { searchText: searchValue?.searchText },
        });
      }
    }
  }

  checkDisplayItems(dashboardMenu:any){
    const displayItems = dashboardMenu.filter((item:any)=> item?.isShow === true);
    return displayItems.length > 0;
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

  showProgress(){
       this.userService.progressShow("SALESOPS");
       
  }

   ngOnDestroy(): void {
    this.destroySubject.next();
    this.destroySubject.complete();
    this.hideProgress();
  }

  hideProgress(){
    this.userService.progressHide("SALESOPS");
  }

}