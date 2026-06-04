import { formatDate } from "@angular/common";
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  TemplateRef,
} from "@angular/core";
import { ActivatedRoute, Data, Router } from "@angular/router";
import { TabsetComponent } from "ngx-bootstrap/tabs";
import { Columns, Config, DefaultConfig } from "ngx-easy-table";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import { OrderSearchReq } from "src/app/features/shared/interfaces/orders.interface";
import { OrderService } from "../../services/order.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Subject, debounceTime, take, takeUntil } from "rxjs";
import { AccountService } from "../../../account/services/account.service";
import { StorageService } from "src/app/features/http-services/storage.service";
import { TabService } from "../../services/tab.service";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { ProgressModalComponent } from "src/app/features/shared/components/progress-modal/progress-modal.component";
import { MESSAGE_CONSTANTS } from "src/app/features/shared/constants/MESSAGE-CONSTANTS";
import { error } from "pdf-lib";

@Component({
    selector: "app-invoices-page",
    templateUrl: "./orders-page.component.html",
    styleUrls: ["./orders-page.component.scss"],
    standalone: false
})
// AfterViewChecked,
export class OrdersPageComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  orderMessages = MESSAGE_CONSTANTS?.orderPage;
  @ViewChild("staticTabs", { static: false }) staticTabs?: TabsetComponent;
  //mobile tab code starts here
  isMobile: boolean = false;
  showTab: boolean = true;
  menuState: boolean = false;
  //mobile tab code ends here

  ordersNameList: any[] = [];
  orderStatusList: any[] = [];
  searchByList: any[] = [];
  sampleSearchByList: any[] = [];
  productTypeList: any[] = [];
  tempproducts: any[] = [];
  orderStatus: any;
  productType: string = "";
  subProductType: string = "";
  searchText: string = "";
  orderDateRange: string = "";
  searchBy: any;
  //productValue: string = "";
  searchValue: string = "";
  shipmentsOrdersObj: any;
  shipmentsOrdersData: any = [];
  sampleOrdersObj: any;
  sampleOrdersData: any = [];
  sampleOrdersNameList: any[] = [];
  sampleOrderStatusList: any[] = [];
  sampleProductTypeList: any[] = [];
  currentProductTypeList: any[] = [];
  subProductTypeList: any[] = [];
  sampleOrderStatus: string = "";
  sampleProductType: string = "";
  sampleSubProductType: string = "";
  sampleSearchText: string = "";
  sampleDateValue: any;
  sampleSearchBy: any = null;
  ordersObj: any;
  dateValue: any;
  todayShipSearchText: string = "";

  totalOrdersLength: number = 0;
  totalShipmentsLength: number = 0;
  totalSampleOrdersLength: number = 0;
  tabId: any;
  preTabInd: any;
  loadCount = 0;
  destroySubject: Subject<void> = new Subject();

  public salesHierarchyList: any = [];
  salesHierarchyCode: any = "";
  maxDate = new Date();
  payload: any = {
    code: "",
    colorName: "",
    colorNumber: "",
    dateRange: "",
    isSampleOrder: false,
    poNumber: "",
    productType: undefined,
    subProductType: undefined,
    searchText: "",
    sidemark: "",
    sortOrderBy: "placed",
    status: "",
    styleName: "",
    styleNumber: "",
    salesHierarchyCode: "",
    salesHierarchyRole:"",
    type: "",
    accountExecutive: "",
    builderNumber: "",
    isBuilderOrders: false
  };

  payloadShip: any = {
    salesHierarchyCode: "",
    salesHierarchyRole: "",
    code: "",
    sortOrderBy: ""
  };

  samplePayload: any = {
    code: "",
    colorName: "",
    colorNumber: "",
    dateRange: "",
    isSampleOrder: true,
    poNumber: "",
    productType: undefined,
    subProductType: undefined,
    searchText: "",
    sidemark: "",
    sortOrderBy: "placed",
    status: "",
    styleName: "",
    styleNumber: "",
    salesHierarchyCode: "",
    salesHierarchyRole: "",
    type: "",
    accountExecutive: "",
    builderNumber: "",
    isBuilderOrders: false,
  };
  spinnerLoading: boolean = false;
  currentSortCode = "desc";
  shipmentSortCode = "desc";
  sampleSortCode = "desc";
  modalRef?: BsModalRef;
  trackingURL: SafeResourceUrl;
  maxSize: any;
  isShipToUser: boolean = false;

  constructor(
    private orderService: OrderService,
    private fb: FormBuilder,
    private activateRoute: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private router: Router,
    private accountService: AccountService,
    public storageService: StorageService,
    private tabService: TabService,
    private modalService: BsModalService,
    private sanitizer: DomSanitizer,
    private userService: UserService
  ) {
    this.trackingURL = this.sanitizer.bypassSecurityTrustResourceUrl(
      "https://cloud.samsara.com/o/56758/fleet/viewer/job/IsMewPq8jLcMb4CpgRKs"
    );
  }

  ngAfterViewInit(): void {
    const storedTabId = Number(sessionStorage.getItem("tabId"));
    if(this.staticTabs?.hasOwnProperty('tabs') && this.staticTabs!.tabs?.length > 0){
      this.staticTabs!.tabs[storedTabId].active = true;
    }    
    if (storedTabId) {
      this.selectTab(storedTabId); 
      sessionStorage.removeItem("tabId");
    } 
    else {
      let queryParam: any = this.activateRoute.snapshot.queryParams;
  
      if (queryParam?.page == 2 || queryParam?.page == 1) {
        this.staticTabs!.tabs[queryParam?.page].active = true;
        // this.selectTab(queryParam?.page); 
      } 
      else {
        if (this.tabId !== undefined && this.tabId > -1 && this.staticTabs?.tabs[this.tabId]) {
          const selectedTabId = this.tabService.getSelectedTabId();
          this.selectTab(selectedTabId); 
        } 
        else {
          this.selectTab(0);
        }
      }
    }
  }
  
  selectTab(tabId: number) {
    if (tabId == 0) {
      this.payload.isSampleOrder = false;
    }
    if (this.preTabInd === tabId) return;
    this.preTabInd = tabId;
    this.tabId = tabId;
    if (this.salesManRole == "SVP") {
      this.selectedFilter["RVP"] = undefined;
      this.selectedFilter["DM"] = undefined;
      this.selectedFilter["TM"] = undefined;
    } else if (this.salesManRole == "RVP") {
      this.selectedFilter["DM"] = undefined;
      this.selectedFilter["TM"] = undefined;
    } else if (this.salesManRole == "DM") {
      this.selectedFilter["TM"] = undefined;
    }
    this.subProductTypeList = [];
    this.payload.salesHierarchyCode = this.salesHierarchyCode;
    this.samplePayload.salesHierarchyCode = this.salesHierarchyCode;
    this.orderSearchHelperMsg = "";
    this.searchOrderError = false;
    const pageIndices = [
      this.pageIndex || 1,
      this.pageIndex2 || 1,
      this.pageIndex3 || 1,
    ];
    const tabActions = [
      {
        name: "Orders",
        selectedTab: "currentOrders",
        action: () => {
          this.payload.salesHierarchyRole = this.salesManRole;
          this.onOrderSearch(
            this.payload,
            pageIndices[0] - 1,
            this.sampleSortCode
          );
        },
      },
      {
        name: "Today's Shipments",
        selectedTab: "shipmentsOrders",
        action: () => {
          this.payloadShip.salesHierarchyCode = "";
          this.payloadShip.salesHierarchyRole = this.salesManRole;
          this.onShipmentOrders(
            this.payloadShip,
            pageIndices[1] - 1,
            this.shipmentSortCode
          );
        },
      },
      {
        name: "Samples",
        selectedTab: "sampleOrders",
        action: () => {
          this.samplePayload.salesHierarchyRole = this.salesManRole;
          this.onSampleOrderSearch(
            this.samplePayload,
            pageIndices[2] - 1,
            this.sampleSortCode
          );
        },
      },
    ];
    if (tabActions[tabId]) {
      this.breadcrumbItems[1].name = tabActions[tabId].name;
      this.selectedTab = tabActions[tabId].selectedTab;
      tabActions[tabId].action();
    }

    if (this.staticTabs) {
      // this.staticTabs.tabs[tabId].active = true;
    }
  }

  //orders: any;

  breadcrumbItems: BreadcrumbItems = [
    {
      name: "Home",
      path: "/residential",
      active: false,
    },
    {
      name: "Orders",
      path: "/",
      active: true,
    },
  ];

  public configuration!: Config;
  public alertData = {
    showAlert: false,
    message: "",
    type: "danger",
  };
  public columns!: Columns[];
  public scolumns!: Columns[];
  // public ship!: Config;
  public shipcolumns!: Columns[];
  // public sample!: Config;
  public samplecolumns!: Columns[];
  public searchParams: string = "";

  public data: any = [];
  //public searchForm!: FormGroup;
  selectedFilter: any = [];
  salesManRole: any;
  pageNumber: any;
  salesPersonInHouseFlag: any;

  ngOnInit(): void {
    let tab = Number(sessionStorage.getItem("tabId"));
    this.tabId = tab ? tab : this.tabService.getSelectedTabId();
    let selectedTab: string | null = null;
    let searchQuery: any;
    
    this.activateRoute.queryParams.subscribe((params: any) => {
      const pageNumber = params.pageNumber ? +params.pageNumber : 1; 
      const selectedTab = params["selectedTab"];
      const searchQuery = params["searchQuery"] ? JSON.parse(params["searchQuery"]) : {};
      const pageIndexMap: Record<string, () => void> = {
        currentOrders: () => (this.pageIndex = pageNumber),
        sampleOrders: () => (this.pageIndex3 = pageNumber),
        shipmentsOrders: () => (this.pageIndex2 = pageNumber),
      };
      pageIndexMap[selectedTab]?.();
    
      const setDateRange = (dateRange: string) => {
        if (dateRange) {
          const [startDateString, endDateString] = dateRange.split("-");
          const startDate = new Date(formatDate(startDateString, "MMM d, y", "en-US").toString());
          const endDate = new Date(formatDate(endDateString, "MMM d, y", "en-US").toString());
          this.dateValue = [startDate, endDate];
        }
      };
      const tabActions: Record<string, () => void> = {
        currentOrders: () => {
          this.selectedTab = "currentOrders";
          this.payload = { ...this.payload, ...searchQuery };
          this.orderStatus = this.payload?.status;
          setDateRange(this.payload?.dateRange);
         // this.onOrderSearch(this.payload, 0, this.sampleSortCode);
        },
        sampleOrders: () => {
          this.selectedTab = "sampleOrders";
          this.samplePayload = { ...this.samplePayload, ...searchQuery };
          this.sampleProductType = this.samplePayload?.productType;
          setDateRange(this.samplePayload?.dateRange);
          //this.onSampleOrderSearch(this.samplePayload, 0, this.sampleSortCode);
        },
      };
      tabActions[selectedTab]?.();
    });
    this.maxSize = this.userService.updateMaxSize();
    this.configuration = { ...DefaultConfig };
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;
    //this.configuration.rows = 15;

    this.columns = [
      {
        key: "camsAccountNumber",
        title: "Old Account Number",
        orderEventOnly: true,
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      {
        key: "companyCode",
        title: "Account Number",
        orderEventOnly: true,
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      {
        key: "companyName",
        title: "Account Name",
        orderEventOnly: true,
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      {
        key: "orderCode",
        title: "Order #",
        cssClass: { includeHeader: true, name: "sorting-arrow" },
        orderEventOnly: true,
      },
      /* {
        key: "oldOrderCode",
        title: "Old Order #",
        orderEnabled: false,
      }, */
      {
        key: "placed",
        title: "Order Date",
        cssClass: { includeHeader: true, name: "sorting-arrow" },
        orderEventOnly: true,
      },
      {
        key: "poNumber",
        title: "PO #",
        orderEventOnly: true,
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      // {
      //   key: "requestedDeliveryDate",
      //   title: "Requested Delivery / Pickup Date",
      //   orderEnabled: false,
      //   // orderEventOnly: true,
      // },
      // {
      //   key: "eddMessage",
      //   title: "Estimated Delivery Date / Available to Pick-up",
      //   orderEnabled: false,
      //   // orderEventOnly: true,
      // },
      // {
      //   key: "status",
      //   title: "Order Status",
      //   cssClass: { includeHeader: true, name: "sorting-arrow" },
      //   //orderEnabled:false,
      //   orderEventOnly: true,
      // },
      {
        key: "sideMark",
        title: "Sidemark",
        cssClass: { includeHeader: true, name: "sorting-arrow" },
        orderEventOnly: true,
      },
    ];
    this.scolumns = [
      // {
      //   key: "companyCode",
      //   title: "Account Number",
      //   orderEventOnly: true,
      //   cssClass: { includeHeader: true, name: "sorting-arrow" },
      // },
      // {
      //   key: "companyName",
      //   title: "Account Name",
      //   orderEventOnly: true,
      //   cssClass: { includeHeader: true, name: "sorting-arrow" },
      // },
      // {
      //   key: "orderCode",
      //   title: "Order #",
      //   orderEventOnly: true,
      //   cssClass: { includeHeader: true, name: "sorting-arrow" },
      // },
      // {
      //   key: "placed",
      //   title: "Order Date",
      //   orderEventOnly: true,
      //   cssClass: { includeHeader: true, name: "sorting-arrow" },
      // },
      {
        key: "companyCode",
        title: "Account Number",
        orderEventOnly: true,
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      {
        key: "companyName",
        title: "Account Name",
        orderEventOnly: true,
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      {
        key: "orderCode",
        title: "Order #",
        orderEventOnly: true,
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      {
        key: "placed",
        title: "Order Date",
        orderEventOnly: true,
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      {
        key: "poNumber",
        title: "PO #",
        orderEventOnly: true,
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      // {
      //   key: "requestedDeliveryDate",
      //   title: "Requested Delivery / Pickup Date",
      //   orderEnabled: false,
      //   // orderEventOnly: true,
      // },
      // {
      //   key: "eddMessage",
      //   title: "Estimated Delivery Date / Available to Pick-up",
      //   orderEnabled: false,
      //   // orderEventOnly: true,
      // },
      {
        key: "submittedFor",
        title: "Submitted For",
        cssClass: { includeHeader: true, name: "sorting-arrow" },
        orderEventOnly: true,
      },
      {
        key: "sideMark",
        title: "Sidemark",
        cssClass: { includeHeader: true, name: "sorting-arrow" },
        orderEventOnly: true,
      },
      {
        key: "status",
        title: "Order Status",
        cssClass: { includeHeader: true, name: "sorting-arrow" },
        //orderEnabled:false,
        orderEventOnly: true,
      },
    ];
    
    this.shipcolumns = [
      {
        key: "orderCode",
        title: "Order #",
        orderEventOnly: true,
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      {
        key: "placed",
        title: "Order Date",
        orderEventOnly: true,
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      {
        key: "poNumber",
        title: "PO#",
        orderEventOnly: true,
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      // {
      //   key: "eddMessage",
      //   title: "Estimated Delivery Date / Available to Pick-up",
      //   orderEnabled: false,
      //   orderEventOnly: true,
      //   cssClass: { includeHeader: true, name: "sorting-arrow" },
      // },

      {
        key: "submittedFor",
        title: "Submitted For",
        // orderEnabled:false,
        orderEventOnly: true,
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      {
        key: "sideMark",
        title: "Sidemark",
        orderEventOnly: true,
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      // {
      //   key: "status",
      //   title: "Status",
      //   orderEventOnly: true,
      //   cssClass: { includeHeader: true, name: "sorting-arrow" },
      //   // orderEnabled:false
      // },
    ];
    this.samplecolumns = [
      {
        key: "camsAccountNumber",
        title: "Old Account Number",
        orderEventOnly: true,
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      {
        key: "companyCode",
        title: "Account Number",
        orderEventOnly: true,
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      {
        key: "companyName",
        title: "Account Name",
        orderEventOnly: true,
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      {
        key: "orderCode",
        title: "Order #",
        cssClass: { includeHeader: true, name: "sorting-arrow" },
        orderEventOnly: true,
      },
      /* {
        key: "oldOrderCode",
        title: "Old Order #",
        // orderEventOnly: true,
        orderEnabled: false,
        cssClass: { includeHeader: false, name: "sorting-arrow" },
      }, */
      {
        key: "placed",
        title: "Order Date",
        orderEventOnly: true,
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      {
        key: "poNumber",
        title: "PO#",
        orderEventOnly: true,
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      // {
      //   key: "status",
      //   title: "Status",
      //   orderEventOnly: true,
      //   cssClass: { includeHeader: true, name: "sorting-arrow" },
      //   // orderEnabled:false
      // },
      {
        key: "submittedFor",
        title: "Submitted For",
        // orderEnabled:false,
        orderEventOnly: true,
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      {
        key: "sideMark",
        title: "Sidemark",
        orderEventOnly: true,
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
    ];

    this.orderStatusList = [
      {
        id: "",
        name: "All Orders",
      },
      {
        id: "OPEN",
        name: "Open Orders",
      },
      // {
      //   id: "OPEN-MA",
      //   name: "Open Orders - Mohawk Arrange",
      // },
      // {
      //   id: "OPEN-CA",
      //   name: "Open Orders - Customer Arrange",
      // },
      {
        id: "SHIPPED",
        name: "Shipped Orders",
      },
      {
        id: "CANCELLED",
        name: "Cancelled Orders",
      },
    ];

    this.currentProductTypeList = [
      {
        id: "SOFTSURFACE",
        name: "Soft Surface",
      },
      {
        id: "HARDSURFACE",
        name: "Hard Surface",
      },
      {
        id: "TILE",
        name: "Tile",
      },
      {
        id: "INDOOROUTDOOR",
        name: "Indoor/Outdoor",
      },
      {
        id: "ACCESSORIES",
        name: "Accessories",
      },
    ];
    this.sampleProductTypeList = [
      {
        id: "SOFTSURFACE",
        name: "Soft Surface",
      },
      {
        id: "HARDSURFACE",
        name: "Hard Surface",
      },
      {
        id: "TILE",
        name: "Tile",
      },
      {
        id: "INDOOROUTDOOR",
        name: "Indoor/Outdoor",
      },
      {
        id: "ACCESSORIES",
        name: "Accessories",
      },
      {
        id: "MERCHANDISING",
        name: "Merchandising",
      },
    ];

    this.searchByList = [
      {
        id: "code",
        name: "Order #",
      },
      {
        id: "oldOrderCode",
        name: "Old Order #",
      },
      {
        id: "styleName",
        name: "Style Name",
      },
      {
        id: "styleNumber",
        name: "Style#",
      },
      {
        id: "colorName",
        name: "Color Name",
      },
      {
        id: "colorNumber",
        name: "Color#",
      },
      {
        id: "poNumber",
        name: "PO",
      },
      {
        id: "sidemark",
        name: "Side Mark",
      },
    ];

    this.sampleSearchByList = [
      {
        id: "code",
        name: "Order #",
      },
      {
        id: "oldOrderCode",
        name: "Old Order #",
      },
      {
        id: "styleName",
        name: "Style Name",
      },
      {
        id: "styleNumber",
        name: "Style#",
      },
      {
        id: "colorName",
        name: "Color Name",
      },
      {
        id: "colorNumber",
        name: "Color#",
      },
      {
        id: "poNumber",
        name: "PO",
      },
      // {
      //   id: "sidemark",
      //   name: "Side Mark",
      // },
    ];
    if (this.storageService.userInfo?.isSalesPerson != true && this.storageService.userInfo?.isSalesOps != true) {
      this.samplecolumns.splice(0, 3);
      this.scolumns.splice(0, 2);
      this.columns.splice(0, 3);
    }
    
    this.storageService
      .getItem("userInfo")
      .pipe(take(1),takeUntil(this.destroySubject))
      .subscribe((response: any) => {
        this.salesPersonInHouseFlag =
          response?.isSalesPerson == true &&
          response?.isSalesOps == false &&
          response?.orgUnit?.inHouseAccount == true;
        this.isShipToUser = response?.orgUnit?.accountType === "ZMSH";
        if (response?.isSalesPerson || response?.isSalesOps) {
       this.openProgressModal({
            modalHeaderText: MESSAGE_CONSTANTS.home?.welcomeTitle,
            progressText: MESSAGE_CONSTANTS.home?.welcomeMessage,
            progressBarText: MESSAGE_CONSTANTS.home?.welcomeBarText
          });
          this.salesManRole = response?.salesManRole;
          let isSalesPerson = response?.isSalesOps
            ? response?.isSalesOps
            : false;
          if (this.salesPersonInHouseFlag) {
            this.accountService
              .getSalesHierarchyForUser(isSalesPerson)
              .pipe(take(1),takeUntil(this.destroySubject))
              .subscribe((response) => {
                this.modalService.hide();
                if (response?.body) {
                  let roles = ["SVP", "RVP", "DM", "TM"];
                  let salesHierarchyMap =
                    response?.body?.salesHierarchyMap || [];

                  salesHierarchyMap?.sort(function (a: any, b: any) {
                    return roles.indexOf(a.key) - roles.indexOf(b.key);
                  });

                  this.salesHierarchyList = response?.body?.salesHierarchyMap;
                  roles.forEach((role: any) => {
                    let roleHierarchy = this.salesHierarchyList.find(
                      (hierarchy: any) => hierarchy.key === role
                    );
                    if (
                      roleHierarchy &&
                      roleHierarchy.value?.salesHierarchyUserAssignmentList
                        ?.length
                    ) {
                      let hierarchyLength =
                        roleHierarchy.value?.salesHierarchyUserAssignmentList
                          ?.length;
                      let hierarchyCode =
                        roleHierarchy.value.salesHierarchyUserAssignmentList[0]
                          .salesHierarchyCode;
                      this.selectedFilter[role] =
                        hierarchyLength == 1 ? hierarchyCode : "All";
                      if (
                        this.salesManRole == "TM" ||
                        this.salesManRole == "TEAM"
                      ) {
                        this.salesManRole = "TM";
                      }
                      if (role === this.salesManRole) {
                        this.payload.salesHierarchyCode =
                          hierarchyLength == 1 ? hierarchyCode : "";
                        this.samplePayload.salesHierarchyCode =
                          hierarchyLength == 1 ? hierarchyCode : "";
                        this.salesHierarchyCode =
                          hierarchyLength == 1 ? hierarchyCode : "";
                        this.salesPersonDefaultSelection(
                          this.salesHierarchyCode,
                          this.salesManRole
                        );
                      }
                    }

                    if (this.salesManRole == "SVP") {
                      this.selectedFilter["RVP"] = undefined;
                      this.selectedFilter["DM"] = undefined;
                      this.selectedFilter["TM"] = undefined;
                    } else if (this.salesManRole == "RVP") {
                      this.selectedFilter["DM"] = undefined;
                      this.selectedFilter["TM"] = undefined;
                    } else if (this.salesManRole == "DM") {
                      this.selectedFilter["TM"] = undefined;
                    }

                    if (isSalesPerson) {
                      this.selectedFilter["SVP"] = undefined;
                    }
                  });
                } else {
                  this.salesHierarchyList = [];
                }
              },(err:any)=>{
                this.modalService.hide();
              });
          }
        }
      });

    let params: any = this.activateRoute.snapshot.queryParams;

    if (Object.keys(params).length) {
      if (params?.searchText) {
        this.searchText = params?.searchText;
        this.searchBy = "code";
        this.payload.sortOrderBy = "";
        this.onOrderSearch(this.payload, 0, this.currentSortCode);
      }
    }

    // this.tabId = Number(sessionStorage.getItem("tabId"));
    this.activateRoute.queryParams.subscribe((params: any) => {
      if (params?.page) {
        this.tabId = Number(params?.page);
      }
      if (this.tabId == 0 && !selectedTab) {
        this.payload.status = params?.status || "";
      }
      if (this.tabId == 2 && !selectedTab) {
        this.samplePayload.status = params?.status || "";
      }
      // this.payload.status = params?.status || "";
      if (!this.selectedTab) {
        this.selectTab(this.tabId);
      }
    });
   
    if (sessionStorage.getItem("reloadOrders")) {
      let pload: any = sessionStorage.getItem("ordersPayload");
      if (pload && this.tabId == 0) {
        this.payload = JSON.parse(pload);
        this.searchByList.filter((res: any) => {
          if (this.payload[res.id]) {
            this.searchBy = res.id;
            this.searchText = this.payload[res.id];
          }
        });
        this.getSubProductTypeList(this.payload.productType);
      } else if (pload && this.tabId == 2) {
        this.samplePayload = JSON.parse(pload);
        this.sampleSearchByList.filter((res: any) => {
          if (this.samplePayload[res.id]) {
            this.sampleSearchBy = res.id;
            this.sampleSearchText = this.samplePayload[res.id];
          }
        });
        this.getSubProductTypeList(this.samplePayload.productType);
      }
      sessionStorage.removeItem("reloadOrders");
    } else {
      sessionStorage.removeItem("ordersPayload");
      // sessionStorage.removeItem("tabId");
    }
  }

  navigateToHistoryDetails(orderId: any, pageNumber: any) {
    this.tabService.setSelectedTabId(this.tabId, true);
    let additionalParams: { [key: string]: any } = {
      selectedTab: this.selectedTab,
    };
    let searchQueryObj: any = {};
    for (let key in this.searchQuery) {
      if (this.searchQuery[key] != "") {
        searchQueryObj[key] = this.searchQuery[key];
      }
    }
    if (this.searchQuery) {
      additionalParams["searchQuery"] = JSON.stringify(searchQueryObj);
    }
    if (pageNumber) {
      additionalParams["pageNumber"] = pageNumber;
    }
    additionalParams["page"] = this.tabId;
    this.router.navigate(
      ["residential/orders/orders-history-details/" + orderId],
      { queryParams: additionalParams }
    );
  }

  searchQuery: any;
  selectedTab: any;
  onStatusChange(value: any, orderType: string): void {
    this.selectedTab = orderType;
    if (orderType == "currentOrders") {
      this.orderStatus = value?.id;
      this.payload.status = value?.id;
      this.payload.sortOrderBy = "";
      this.pageIndex = 1;
      this.searchQuery = this.payload;
      this.onOrderSearch(this.payload, 0, this.currentSortCode);
    } else if (orderType == "sampleOrders") {
      this.sampleOrderStatus = value?.id;
      this.samplePayload.status = value ? value?.id : "";
      this.samplePayload.sortOrderBy = "";
      this.pageIndex3 = 1;
      this.searchQuery = this.samplePayload;
      this.onSampleOrderSearch(this.samplePayload, 0, this.sampleSortCode);
    }
  }

  onProductTypeChange(event: any, orderType: string): void {
    this.selectedTab = orderType;
    if (orderType == "currentOrders") {
      this.payload.productType = event?.id;
      this.productType = event?.id;
      this.payload.sortOrderBy = "";
      this.payload.subProductType = undefined;
      this.pageIndex = 1;
      this.searchQuery = this.payload;
      this.onOrderSearch(this.payload, 0, this.currentSortCode);
    } else if (orderType == "sampleOrders") {
      this.samplePayload.productType = event?.id;
      this.sampleProductType = event?.id;
      this.samplePayload.sortOrderBy = "";
      this.samplePayload.subProductType = undefined;
      this.pageIndex3 = 1;
      this.searchQuery = this.samplePayload;
      this.onSampleOrderSearch(this.samplePayload, 0, this.sampleSortCode);
    }

    this.getSubProductTypeList(event?.id);
  }

  getSubProductTypeList(productType: any){
    this.orderService
      .getSubProductTypeList(productType)
      .subscribe((res: any) => {
        if (res?.body) {
          this.subProductTypeList = [];
          for (let key in res.body) {
            let name = this.toTitleCase(res?.body[key]) //.replace("_", " ");
            this.subProductTypeList.push({ id: res?.body[key], name: name });
          }
          this.subProductTypeList.sort((a, b) => a.name.localeCompare(b.name));
        }
      });
  }

  toTitleCase(str: string): string {
    return str
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  onSubProductTypeChange(event: any, orderType: string): void {
    this.selectedTab = orderType;
    if (orderType == "currentOrders") {
      this.payload.subProductType = event?.id;
      this.subProductType = event?.id;
      this.payload.sortOrderBy = "";
      this.pageIndex = 1;
      this.searchQuery = this.payload;
      this.onOrderSearch(this.payload, 0, this.currentSortCode);
    } else if (orderType == "sampleOrders") {
      this.samplePayload.subProductType = event?.id;
      this.sampleSubProductType = event?.id;
      this.samplePayload.sortOrderBy = "";
      this.pageIndex3 = 1;
      this.searchQuery = this.samplePayload;
      this.onSampleOrderSearch(this.samplePayload, 0, this.sampleSortCode);
    }
  }

  dateRangeCreated($event: any, orderType: string) {
    let startDate = $event[0].toJSON().split("T")[0];
    let endDate = $event[1].toJSON().split("T")[0];
    this.data = this.tempproducts.filter(
      (m: any) =>
        new Date(m.orderDate) >= new Date(startDate) &&
        new Date(m.orderDate) <= new Date(endDate)
    );
    if (orderType == "currentOrders") {
      this.payload.dateRange =
        formatDate(startDate, "MMM d, y", "en-US") +
        "-" +
        formatDate(endDate, "MMM d, y", "en-US");
      this.orderDateRange =
        formatDate(startDate, "MMM d, y", "en-US") +
        "-" +
        formatDate(endDate, "MMM d, y", "en-US");
      this.payload.sortOrderBy = "";
      this.pageIndex = 1;
      this.onOrderSearch(this.payload, 0, this.currentSortCode);
    } else if (orderType == "sampleOrders") {
      this.sampleDateValue = startDate + "-" + endDate;
      this.samplePayload.dateRange =
        formatDate(startDate, "MMM d, y", "en-US") +
        "-" +
        formatDate(endDate, "MMM d, y", "en-US");
      this.samplePayload.sortOrderBy = "";
      this.pageIndex3 = 1;
      this.onSampleOrderSearch(this.samplePayload, 0, this.sampleSortCode);
    }
  }

  onSearchBy(event: any, orderType: string) {
    this.searchBy = undefined;
    this.sampleSearchBy = undefined;
    if (orderType == "currentOrders") {
      this.payload[this.searchBy] = "";
      this.searchText = "";
      this.searchBy = event ? event : "";
      this.orderNumSearchMsg();
      if (!this.searchBy) {
        this.searchBy = undefined;
        delete this.payload["null"];
        this.onSearch(this.searchText, "currentOrders");
      }
    } else if (orderType == "sampleOrders") {
      this.sampleSearchText = "";
      this.samplePayload[this.sampleSearchBy] = "";
      this.sampleSearchBy = event ? event : "";
      this.orderNumSearchMsg();
      if (!this.sampleSearchBy) {
        this.sampleSearchBy = undefined;
        delete this.samplePayload["null"];
        this.onSearch(this.sampleSearchText, "sampleOrders");
      }
    } else if (orderType == "todayShipments") {
      this.todayShipSearchText = event;
      this.payloadShip.sortOrderBy = "";
      this.pageIndex2 = 1;
      this.onShipmentOrders(this.payloadShip, 0, this.shipmentSortCode);
    }
  }

  orderSearchHelperMsg:string="";
  searchOrderError:boolean = false;
  orderNumSearchMsg(){
    this.orderSearchHelperMsg = "";
    if(this.searchBy == 'code' || this.sampleSearchBy == 'code'){
      this.orderSearchHelperMsg = "Full order # required";
    }else if(this.searchBy == 'oldOrderCode' || this.sampleSearchBy == 'oldOrderCode'){
      this.orderSearchHelperMsg = "Full old order # required";
    }
  }

  onSearch(value: any, orderType: string): void {
    this.selectedTab = orderType;
    this.searchOrderError = false;
    value = value && value.trim();
    if (orderType == "currentOrders") {
      this.searchText = value;
      this.payload.sortOrderBy = "";
      this.pageIndex = 1;
      this.searchQuery = this.payload;
      if(value && !(value?.length > 8 && value?.length <= 10) && this.searchBy == 'code'){
        return;
      }
      if(value && value.length != 7 && this.searchBy == 'oldOrderCode'){
        return;
      }
      this.onOrderSearch(this.payload, 0, this.currentSortCode);
      this.columns.map((item: any) => {
        item.cssClass = {
          ...{},
          ...{ includeHeader: true, name: "sorting-arrow" },
        };
      });
    } else if (orderType == "sampleOrders") {
      this.sampleSearchText = value;
      this.samplePayload.sortOrderBy = "";
      this.pageIndex3 = 1;
      this.searchQuery = this.samplePayload;
      if(value && !(value?.length > 8 && value?.length <= 10) && this.sampleSearchBy == 'code'){
        return;
      }
      if(value && value.length != 7 && this.sampleSearchBy == 'oldOrderCode'){
        return;
      }
      this.onSampleOrderSearch(this.samplePayload, 0, this.sampleSortCode);
      this.samplecolumns.map((item: any) => {
        item.cssClass = {
          ...{},
          ...{ includeHeader: true, name: "sorting-arrow" },
        };
      });
    } else if (orderType == "todayShipments") {
      this.todayShipSearchText = value;
      this.payloadShip.sortOrderBy = "";
      this.pageIndex2 = 1;
      this.onShipmentOrders(this.payloadShip, 0, this.shipmentSortCode);
      this.scolumns.map((item: any) => {
        console.log("item isss---->", item);
        item.cssClass = {
          ...{},
          ...{ includeHeader: true, name: "sorting-arrow" },
        };
      });
    }
  }

  searchTextValidation(event: any){
    let searchValue:any = (event.target as HTMLInputElement).value?.trim() || '';
    this.searchOrderError = false;
    if (searchValue) {
      if(this.searchBy == 'code' || this.sampleSearchBy == 'code'){
        const len = searchValue.length;
        if (len <= 8 || len > 10) {
          this.searchOrderError = true;
        }
      } else if (this.searchBy == 'oldOrderCode' || this.sampleSearchBy == 'oldOrderCode') {
        if (searchValue.length !== 7) {
          this.searchOrderError = true;
        }
      }
    }
  }

  handleSearchBy(payload: any, orderType: string) {
    if (orderType == "currentOrders") {
      if (this.searchBy != undefined || null || "") {
        let searchBy = this.searchBy;
        payload[searchBy] = this.searchText;
        return payload;
      }
    } else if (orderType == "sampleOrders") {
      if (this.searchBy != undefined || null || "") {
        let searchBy = this.sampleSearchBy;
        payload[searchBy] = this.sampleSearchText;
        return payload;
      }
    }
  }

  pageIndex: number = 1;
  tableItemsSize: number = 10;
  startValue: number =
    this.pageIndex * this.tableItemsSize - (this.tableItemsSize - 1);
  lastValue: number = this.startValue + this.tableItemsSize - 1;

  onTableDataChange(event: any) {
    this.configuration.isLoading = true;
    this.pageIndex = event;
    if (0 == event) {
      this.pageIndex = 1;
    }
    this.startValue =
      this.pageIndex * this.tableItemsSize - (this.tableItemsSize - 1);
    this.lastValue = this.startValue + this.tableItemsSize - 1;
    this.lastValue =
      this.lastValue > this.totalOrdersLength
        ? this.totalOrdersLength
        : this.lastValue;
    this.onOrderSearch(this.payload, this.pageIndex - 1, this.currentSortCode);
  }

  pageIndex2: number = 1;
  tableItemsSize2: number = 10;
  startValue2: number =
    this.pageIndex2 * this.tableItemsSize2 - (this.tableItemsSize2 - 1);
  lastValue2: number = this.startValue2 + this.tableItemsSize2 - 1;

  onTableDataChange2(event: any) {
    this.configuration.isLoading = true;
    this.pageIndex2 = event;
    if (0 == event) {
      this.pageIndex2 = 1;
    }
    this.startValue2 =
      this.pageIndex2 * this.tableItemsSize2 - (this.tableItemsSize2 - 1);
    this.lastValue2 = this.startValue2 + this.tableItemsSize2 - 1;
    this.lastValue2 =
      this.lastValue2 > this.totalShipmentsLength
        ? this.totalShipmentsLength
        : this.lastValue2;
    this.onShipmentOrders(
      this.payloadShip,
      this.pageIndex2 - 1,
      this.shipmentSortCode
    );
  }

  pageIndex3: number = 1;
  tableItemsSize3: number = 10;
  startValue3: number =
    this.pageIndex3 * this.tableItemsSize3 - (this.tableItemsSize3 - 1);
  lastValue3: number = this.startValue3 + this.tableItemsSize3 - 1;

  onTableDataChange3(event: any) {
    this.configuration.isLoading = true;
    this.pageIndex3 = event;
    if (0 == event) {
      this.pageIndex3 = 1;
    }
    this.startValue3 =
      this.pageIndex3 * this.tableItemsSize3 - (this.tableItemsSize3 - 1);
    this.lastValue3 = this.startValue3 + this.tableItemsSize3 - 1;
    this.lastValue3 =
      this.lastValue3 > this.totalSampleOrdersLength
        ? this.totalSampleOrdersLength
        : this.lastValue3;
    this.onSampleOrderSearch(
      this.samplePayload,
      this.pageIndex3 - 1,
      this.sampleSortCode
    );
  }

  onOrderSearch(pload: any, pageIndex: number, sortCode: any) {
    let payload = {
      ...pload,
    };
    payload.searchText = this.searchText;
    if (this.searchBy) {
      payload[this.searchBy] = this.searchText;
    }
    //  this.data = [];
    this.selectedTab = "currentOrders";
    this.searchQuery = payload;
    this.openProgressModal({
      modalHeaderText: this.orderMessages.headerText,
      progressText: this.orderMessages.bodyText,
      progressBarText: this.orderMessages.barText
    });
    
    this.orderService.getOrderHistory(payload, pageIndex, sortCode).subscribe(
      (res: any) => {
        this.modalService.hide();
        this.data = res.body?.orderHistoryData
          ? res.body?.orderHistoryData
          : [];
        this.scrollToTop();
        this.totalOrdersLength = res.body.totalNumberOfResults;
        this.startValue =
          this.pageIndex * this.tableItemsSize - (this.tableItemsSize - 1);
        this.lastValue = this.startValue + this.tableItemsSize - 1;
        this.lastValue =
          this.lastValue > this.totalOrdersLength
            ? this.totalOrdersLength
            : this.lastValue;
        this.configuration.isLoading = false;
        if (res.body?.errorCode === "error") {
          this.alertData.message = res.body?.errorMessage;
          this.alertData.showAlert = true;
        }
      },
      (err) => {
        this.modalService.hide();
        this.spinnerLoading = false;
        this.configuration.isLoading = false;
        this.alertData.message = err?.message;
        this.alertData.showAlert = true;
        this.scrollToTop();
      }
    );
  }

  showSoldToOders(event: any, type:any){
    if(type == "currentOrders"){
      this.pageIndex = 1;
      this.payload.showAllSoldTo = event?.state;
      this.onOrderSearch(this.payload, 0, this.currentSortCode);
    }else if(type == "todayShipments"){
      this.pageIndex2 = 1;
      this.payloadShip.showAllSoldTo = event?.state;
      this.onShipmentOrders(this.payloadShip, 0, this.shipmentSortCode);
    }else if(type == "sampleOrders"){
      this.pageIndex3 = 1;
      this.samplePayload.showAllSoldTo = event?.state;
      this.onSampleOrderSearch(this.samplePayload, 0, this.sampleSortCode);
    }
  }

  scrollToTop() {
    const orderHistory = document.getElementById("orderHistory");
    if (orderHistory) {
      orderHistory.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  onSampleOrderSearch(pload: any, pagIndex: number, sortCode: any) {
    let payload = {
      ...pload,
    };
    payload.searchText = this.sampleSearchText;
    if (this.sampleSearchBy) {
      payload[this.sampleSearchBy] = this.sampleSearchText;
    }
    this.sampleOrdersData = [];
    this.selectedTab = "sampleOrders";
    this.searchQuery = payload;
    this.openProgressModal({
      modalHeaderText: this.orderMessages.headerText,
      progressText: this.orderMessages.bodyText,
      progressBarText: this.orderMessages.barText
    });
    this.orderService
      .getSampleOrdersHistory(payload, pagIndex, sortCode)
      .subscribe(
        (res: any) => {
          this.modalService.hide();
          this.configuration.isLoading = false;
          this.sampleOrdersData = res.body?.orderHistoryData
            ? res.body?.orderHistoryData
            : [];
          this.scrollToTop();
          this.totalSampleOrdersLength = res.body?.totalNumberOfResults;
          this.startValue3 =
            this.pageIndex3 * this.tableItemsSize3 - (this.tableItemsSize3 - 1);
          this.lastValue3 = this.startValue3 + this.tableItemsSize3 - 1;
          this.lastValue3 =
            this.lastValue3 > this.totalSampleOrdersLength
              ? this.totalSampleOrdersLength
              : this.lastValue3;

          if (res.body?.errorCode === "error") {
            this.alertData.message = res.body?.errorMessage;
            this.alertData.showAlert = true;
            this.scrollToTop();
          }
        },
        (err) => {
          this.modalService.hide();
          this.spinnerLoading = false;
          this.configuration.isLoading = false;
          this.alertData.message = err?.message;
          this.alertData.showAlert = true;
          this.scrollToTop();
        }
      );
  }

  onShipmentOrders(pload: any, pageIndex: number, sortCode: any) {
    let payload = {
      ...pload,
    };
    payload.searchText = this.todayShipSearchText;
    payload["code"] = this.todayShipSearchText;
    //  this.shipmentsOrdersData = [];
    this.shipmentsOrdersObj = [];
    this.selectedTab = "shipmentsOrders";
    this.openProgressModal({
      modalHeaderText: this.orderMessages.headerText,
      progressText: this.orderMessages.bodyText,
      progressBarText: this.orderMessages.barText
    });
    this.orderService
      .getTodaysShipments(payload, pageIndex, sortCode)
      .subscribe(
        (res: any) => {
          this.modalService.hide();
          this.configuration.isLoading = false;
          this.shipmentsOrdersObj = res.body;
          this.totalShipmentsLength = res.body?.totalNumberOfResults;
          this.shipmentsOrdersData = res.body?.orderHistoryData
            ? res.body?.orderHistoryData
            : [];
          this.scrollToTop();
          this.startValue2 =
            this.pageIndex2 * this.tableItemsSize2 - (this.tableItemsSize2 - 1);
          this.lastValue3 = this.startValue2 + this.tableItemsSize2 - 1;
          this.lastValue3 =
            this.lastValue3 > this.totalShipmentsLength
              ? this.totalSampleOrdersLength
              : this.lastValue3;
          // if (this.totalShipmentsLength > 0) {
          //   for (let order of res.body?.orderHistoryData) {
          //     this.shipmentsOrdersData.push({
          //       order: order.orderCode,
          //       orderDate: formatDate(order.placed, "MM/dd/yyyy", "en-US"),
          //       poNumber: order.poNumber,
          //       requestedDelivery: order.requestedDeliveryDate
          //         ? formatDate(order.requestedDeliveryDate, "MM/dd/yyyy", "en-US")
          //         : "",
          //       estimatedDelivery: order.estimatedDelivery
          //         ? order.estimatedDelivery
          //         : "",
          //       // estimatedDelivery: formatDate(
          //       //   order.eddMessage,
          //       //   "MM/dd/yyyy",
          //       //   "en-US"
          //       // ),
          //       orderStatus: order.status,
          //       Sidemark: order.sideMark,
          //     });
          //   }
          // }

          if (res.body?.errorCode === "error") {
            this.alertData.message = res.body?.errorMessage;
            this.alertData.showAlert = true;
            this.scrollToTop();
          }
        },
        (err) => {
          this.modalService.hide();
          this.spinnerLoading = false;
          this.configuration.isLoading = false;
          this.alertData.message = err?.message;
          this.alertData.showAlert = true;
          this.scrollToTop();
        }
      );
  }

  clearSearchBy(orderType: string): void {
    if (orderType == "currentOrders") {
      if (!this.searchBy && this.searchText.length > 0) {
        this.searchBy = "";
        this.searchText = "";
        this.payload.sortOrderBy = "";
        this.pageIndex = 1;
        this.onOrderSearch(this.payload, 0, this.currentSortCode);
      }
    } else if (orderType == "sampleOrders") {
      if (!this.sampleSearchBy && this.sampleSearchText.length > 0) {
        this.sampleSearchBy = "";
        this.sampleSearchText = "";
        this.samplePayload.sortOrderBy = "";
        this.pageIndex3 = 1;
        this.onSampleOrderSearch(this.samplePayload, 0, this.sampleSortCode);
      }
    }
  }

  onSearchClear(event: any, orderType: any) {
    if (!event.target) {
      if (orderType == "currentOrders") {
        this.searchText = "";
        this.payload.sortOrderBy = "";
        this.pageIndex = 1;
        this.onOrderSearch(this.payload, 0, this.currentSortCode);
      } else if (orderType == "sampleOrders") {
        this.sampleSearchText = "";
        this.samplePayload.sortOrderBy = "";
        this.pageIndex3 = 1;
        this.onSampleOrderSearch(this.samplePayload, 0, this.sampleSortCode);
      }
    }
  }
  clearDate(r: string) {
    if (r === "currentOrders") {
      this.dateValue = "";
      this.payload.dateRange = "";
      this.payload.sortOrderBy = "";
      this.pageIndex = 1;
      this.onOrderSearch(this.payload, 0, this.currentSortCode);
    } else if (r === "sampleOrders") {
      this.sampleDateValue = "";
      this.samplePayload.dateRange = "";
      this.samplePayload.sortOrderBy = "";
      this.pageIndex3 = 1;
      this.onSampleOrderSearch(this.samplePayload, 0, this.sampleSortCode);
    }
  }

  getSalesFilterData(value: any, orderType: any, name: any) {
    if (value) {
      let hierachyCode = value == "All" ? "" : value;
      if (name == "SVP") {
        this.selectedFilter["RVP"] = undefined;
        this.selectedFilter["DM"] = undefined;
        this.selectedFilter["TM"] = undefined;
      } else if (name == "RVP") {
        this.selectedFilter["DM"] = undefined;
        this.selectedFilter["TM"] = undefined;
      } else if (name == "DM") {
        this.selectedFilter["TM"] = undefined;
      }
      this.accountService.getChildHierarchy(hierachyCode, name).subscribe(
        (response) => {
          if (response?.error) {
            this.configuration.isLoading = false;
          } else {
            let updatedSalesHierarchyList = response?.body?.salesHierarchyMap;
            if (updatedSalesHierarchyList) {
              updatedSalesHierarchyList.map((sales: any) => {
                this.salesHierarchyList.find((list: any, index: any) => {
                  if (name != list.key && sales.key == list.key) {
                    this.selectedFilter[name] = value;
                    this.salesHierarchyList[index].value = sales.value;
                  }
                });
              });
            } else {
              this.configuration.isLoading = false;
            }
            this.getSalesList(value, orderType, name);
          }
        },
        (error) => {
          this.configuration.isLoading = false;
        }
      );
    }
  }

  getSalesList(value: any, orderType: any, role:any) {
    if (value) {
      //this.salesHierarchyCode = value == "All" ? "" : value;
      if (orderType == "currentOrders") {
        this.payload.salesHierarchyCode = value == "All" ? "" : value;
        this.payload.salesHierarchyRole = role;
        this.payload.sortOrderBy = "";
        this.onOrderSearch(this.payload, this.pageIndex - 1 , this.currentSortCode);
      } else if (orderType == "sampleOrders") {
        this.samplePayload.salesHierarchyCode = value == "All" ? "" : value;
        this.samplePayload.salesHierarchyRole = role;
        this.samplePayload.sortOrderBy = "";
        this.onSampleOrderSearch(this.samplePayload, this.pageIndex3 -1, this.sampleSortCode);
      }
    }
  }
  salesPersonDefaultSelection(tmValue: any, role: any) {
    if (this.tabId == 0) {
      this.getSalesList(tmValue, "currentOrders", role);
    }
    if (this.tabId == 2) {
      this.getSalesList(tmValue, "sampleOrders", role);
    }
  }
  ngOnDestroy() {
    this.destroySubject.next();
    this.destroySubject.complete();
  }

  sortingByColumns(e: any, orderType: any) {
    if (e.event === "onOrder") {
      if (orderType == "currentOrders") {
        this.payload.sortOrderBy = e?.value?.key;
        this.currentSortCode = e?.value?.order == "desc" ? "asc" : "desc";
        this.pageIndex = 1;
        this.onOrderSearch(this.payload, 0, this.currentSortCode);
        this.columns.map((item: any) => {
          if (item.key === e?.value?.key && item.hasOwnProperty("cssClass")) {
            if (e?.value?.order == "asc") {
              item.cssClass = {
                ...{},
                ...{ includeHeader: true, name: "sorting-arrow-active" },
              };
            } else if (e?.value?.order == "desc") {
              item.cssClass = {
                ...{},
                ...{ includeHeader: true, name: "sorting-arrow-down-icon" },
              };
            }
          } else if (item.hasOwnProperty("cssClass")) {
            item.cssClass = {
              ...{},
              ...{ includeHeader: true, name: "sorting-arrow" },
            };
          }
        });
      } else if (orderType == "todayShipments") {
        console.log("this.payloadShip---->", this.payloadShip);
        // this.payloadShip.sortOrderBy = e?.value?.key;
        // if (e?.value?.key == "orderCode") {
        //   this.payloadShip.sortOrderBy = "ORDERCODE";
        // } else if (e?.value?.key == "submittedFor") {
        //   this.payloadShip.sortOrderBy = "SUBMITTEDFOR";
        // } else if (e?.value?.key == "Sidemark") {
        //   this.payloadShip.sortOrderBy = "SIDEMARK";
        // } else if (e?.value?.key == "orderStat") {
        //   this.payloadShip.sortOrderBy = "STATUS";
        // } else if (e?.value?.key == "orderDate") {
        //   this.payloadShip.sortOrderBy = "PLACED";
        // } else if (e?.value?.key == "po") {
        //   this.payloadShip.sortOrderBy = "PONUMBER";
        // }
        this.payloadShip.sortOrderBy = e?.value?.key;
        this.shipmentSortCode = e?.value?.order == "desc" ? "asc" : "desc";
        /* this.shipmentSortCode =
          e?.value?.order == undefined ? "asc" : e?.value?.order; */
        this.pageIndex2 = 1;
        this.onShipmentOrders(this.payloadShip, 0, this.shipmentSortCode);
        this.scolumns.map((item: any) => {
          console.log("item issss--->", item);
          if (item.key === e?.value?.key && item.hasOwnProperty("cssClass")) {
            if (e?.value?.order == "asc") {
              item.cssClass = {
                ...{},
                ...{ includeHeader: true, name: "sorting-arrow-active" },
              };
            } else if (e?.value?.order == "desc") {
              item.cssClass = {
                ...{},
                ...{ includeHeader: true, name: "sorting-arrow-down-icon" },
              };
            }
          } else if (item.hasOwnProperty("cssClass")) {
            item.cssClass = {
              ...{},
              ...{ includeHeader: true, name: "sorting-arrow" },
            };
          }
        });
      } else if (orderType == "sampleOrders") {
        this.samplePayload.sortOrderBy = e?.value?.key;
        this.sampleSortCode = e?.value?.order == "desc" ? "asc" : "desc";
        /* this.sampleSortCode =
          e?.value?.order == undefined ? "desc" : e?.value?.order; */
        this.pageIndex3 = 1;
        this.onSampleOrderSearch(this.samplePayload, 0, this.sampleSortCode);
        this.samplecolumns.map((item: any) => {
          if (item.key === e?.value?.key && item.hasOwnProperty("cssClass")) {
            if (e?.value?.order == "asc") {
              item.cssClass = {
                ...{},
                ...{ includeHeader: true, name: "sorting-arrow-active" },
              };
            } else if (e?.value?.order == "desc") {
              item.cssClass = {
                ...{},
                ...{ includeHeader: true, name: "sorting-arrow-down-icon" },
              };
            }
          } else if (item.hasOwnProperty("cssClass")) {
            item.cssClass = {
              ...{},
              ...{ includeHeader: true, name: "sorting-arrow" },
            };
          }
        });
      }
    }
  }

  trackingRequestModal(template: TemplateRef<any>, url: any) {
    this.trackingURL = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    window.open(url, "_blank");

    // this.modalRef = this.modalService.show(template, {
    //   id: "trackingModal",
    //   class: "modal-lg modal-dialog-centered",
    // });
  }

  dateConvert(d: any) {
    return new Date(d).toISOString().slice(0, 10);
  }

  setHierachyValue(value: any, list: any, name: any) {}

  toggleSideMark(row: any) {
    row.showFullSideMark = !row.showFullSideMark;
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
