import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { ApiService } from "src/app/features/http-services/api.service";
import { API_CONSTANTS } from "src/app/features/shared/constants/API-CONSTANTS";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { MESSAGE_CONSTANTS } from "src/app/features/shared/constants/MESSAGE-CONSTANTS";
import { ProgressModalComponent } from "src/app/features/shared/components/progress-modal/progress-modal.component";

import { permissionsList } from "src/app/features/shared/constants/PERMISSIONS_CONSTANTS";
import { StorageService } from "src/app/features/http-services/storage.service";
import { CommercialSiteSelectorService } from "src/app/features/http-services/commercial-site-selector.service";
@Component({
    selector: "app-salesperson",
    templateUrl: "./salesperson.component.html",
    styleUrls: ["./salesperson.component.scss"],
    standalone: false
})
export class SalespersonComponent implements OnInit, OnDestroy {
  districtOption: Array<any> = [
    "User Name",
    "User Name",
    "User Name",
    "User Name",
  ];

  territoryOption: Array<any> = [
    "User Name1",
    "User Name2",
    "User Name3",
    "User Name4",
  ];

  productFeaturesList: Array<any> = [
    {
      name: "Open Sample Orders",
      icon: "open-sample-orders",
      iconExt: ".svg",
      link: "/commercial/orders",
      queryParams: { page: 2 },
      value: 0,
      allowedSites:['C'],
      key:'sample_orders'
    },
    {
      name: "View Order History",
      icon: "open-sample-orders",
      iconExt: ".svg",
      link: "/commercial/orders",
      queryParams: { page: 0 },
      value: 0,
      allowedSites:['C', 'I','H'],
      key: 'open_orders'
    },
    {
      name: "Today’s Shipment",
      icon: "todays-shipment",
      iconExt: ".svg",
      link: "/commercial/orders",
      queryParams: { page: 1 },
      value: 0,
      allowedSites:['C'],
      key: 'today_shipment'
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
          not: [[permissionsList[28]],[permissionsList[41]]],
          },
      allowedSites:['C', 'I'],
    },
    {
      name: "View Accounts",
      icon: "open-sample-orders",
      iconExt: ".svg",
      link: "/commercial/salesperson/view-accounts",
      allowedSites:['C','H'],
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
          not: [[permissionsList[28]], [permissionsList[41]]],
          },
      allowedSites:['C'],
    },
  ];

  currentOrdersCount: any = 0;
  sampleOrdersCount: any = 0;
  claimsCount: any = 0;
  invoiceCount: any = 0;
  reserveCount: any = 0;
  todayShipmentCount: any = 0;
  isInhouse = false;
  salesManRole: any = "";
  userInfoSub:any;
  modalRef?: BsModalRef;
  isSalesPerson: boolean = false;
  isImpersonate: boolean = false;
  constructor(
    private route: Router,
    private userService: UserService,
    private apiService: ApiService,
    private modalService: BsModalService,
    private storageService: StorageService,
    private commercialSiteSelectorService:CommercialSiteSelectorService
  ) {}

  ngOnInit(): void {
    // this.applyPermissions();
    this.userInfoSub = this.userService.getCurrentUserDetail().subscribe((response: any) => {
      this.salesManRole = response?.body?.salesManRole;
      this.loadwelcomeMessage();
      this.isSalesPerson = response?.body?.isSalesPerson;
      this.isImpersonate = sessionStorage.getItem("startSession") === "true";
      // if (response.body.isSalesOps) {
      //   this.route.navigate([`/commercial/salesperson/view-accounts`]);
      // } else 
      
      if (!response.body.orgUnit?.inHouseAccount) {
        this.route.navigate([`/commercial`]);
      } else {
        this.getCurrentOrdersCount();
        this.getSampleOrdersCount();
        this.getClaimsCount();
        this.getInvoiceCount();
        this.userService.isInhouseAccount.subscribe((isInhouse: boolean) => {
          this.isInhouse = isInhouse;
        });
        if (!this.isInhouse) {
          this.userService.clearB2BUnit().subscribe();
          localStorage.setItem("customerAddress", "");
        }
        if (
          response?.body?.orgUnit?.companies?.length > 1 &&
          response?.body?.orgUnit?.companies.includes("C") &&
          this.route.url.includes("commercial")
        ) {
          const modals = this.modalService["loaders"].filter(
            (modalInst: any) => modalInst.instance.id === "commercialSelector"
          );
          if (
            this.commercialSiteSelectorService.storedSiteId == undefined &&
            modals.length === 0
          ) {
            if (this.isSalesPerson && this.isImpersonate) {
              this.commercialSiteSelectorService.setSelectedSite("C");
              this.applyPermissions();
            } else {
              this.commercialSiteSelectorService.openSiteSelectionModal({
                companiesList: response?.body?.orgUnit?.companies,
                onPrimaryAction: (value: any) => {
                  this.commercialSiteSelectorService.setSelectedSite(value);
                  this.applyPermissions();
                },
              });
            }
          }
        }else if(response?.body?.orgUnit?.companies?.length == 1 &&
          this.route.url.includes("commercial")){
        this.commercialSiteSelectorService.setSelectedSite(response?.body?.orgUnit?.companies[0]);
        }
                this.applyPermissions();

      }
      setTimeout(() => {
        this.modalService.hide("progressModal");
       }, 2000);
    });
  }
loadwelcomeMessage(){
  const messageConstants = MESSAGE_CONSTANTS.LandingPage["Commercial"]
      this.openProgressModal({
        modalHeaderText: messageConstants?.headerText,
        progressText: messageConstants?.bodyText,
        progressBarText: messageConstants?.barText
      });
     
}

  applyPermissions(){
    this.productFeaturesList.forEach(element => {
      if(element.hasOwnProperty('permissions')){
        let isHave = false;
        for(let item of element.permissions.is){
          if(this.storageService?.userInfo?.userPermissions?.includes(item[0])){
            isHave = true;
            break;
          }
        }
        if(isHave === true && element.hasOwnProperty('allowedSites')){
          isHave = element.allowedSites.includes(this.commercialSiteSelectorService.selectedSite);
        }
        let isNotHave = false;
        for(let notItem of element.permissions.not){
          if(this.storageService?.userInfo?.userPermissions?.includes(notItem[0])){
            isNotHave = true;
            break;
          }
        }
        if(isHave === true && isNotHave === false){
          element.isShow = true;
        }else{
          element.isShow = false;
        }
      }else{
        element.isShow = true;
        if (element.hasOwnProperty("allowedSites")) {
          element.isShow = element.allowedSites.includes(
            this.commercialSiteSelectorService.selectedSite
          );
        }
      }
    });
    this.productFeaturesList = this.productFeaturesList.filter(item=> item.isShow == true);
  }

  navigateToOrders() {
    this.route.navigate(["/commercial/orders"]);
  }

  navigateToClaims() {
    this.route.navigate(["/commercial/claims/history"]);
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
      error: (error: any) => {
        this.modalService.hide("progressModal");
      },
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
      error: (error: any) => {
      },
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
      error: (error: any) => {
        this.modalService.hide("progressModal");
      },
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
      error: (error: any) => {
        this.modalService.hide("progressModal");
      },
    });
  }

  // getReserveCount() {
  //   let url = API_CONSTANTS.reserveCountForUnit.replace(
  //     "{userId}",
  //     this.userService.getUserEmail().toLowerCase()
  //   );
  //   this.apiService.getHomePageDate(url).subscribe({
  //     next: (result: any) => {
  //       this.reserveCount = result;
  //     },
  //     error: (error: any) => {
  
  //     },
  //   });
  // }

  getTodayShipmentCount() {
    let url = API_CONSTANTS.todayShipmentCountForUnit.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    this.apiService.getHomePageDate(url).subscribe({
      next: (result: any) => {
        this.todayShipmentCount = result;
      },
      error: (error: any) => {
        this.modalService.hide("progressModal");
      },
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
  }

  onSearchTextEntered(searchValue: any) {
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
  ngOnDestroy(): void {
    this.userInfoSub.unsubscribe();
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
}
