import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ApiService } from "src/app/features/http-services/api.service";
import { API_CONSTANTS } from "src/app/features/shared/constants/API-CONSTANTS";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { StorageService } from "src/app/features/http-services/storage.service";
import { permissionsList } from "src/app/features/shared/constants/PERMISSIONS_CONSTANTS";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { ProgressModalComponent } from "src/app/features/shared/components/progress-modal/progress-modal.component";
import { MESSAGE_CONSTANTS } from "src/app/features/shared/constants/MESSAGE-CONSTANTS";

@Component({
    selector: "app-salesperson",
    templateUrl: "./salesperson.component.html",
    styleUrls: ["./salesperson.component.scss"],
    standalone: false
})
export class SalespersonComponent implements OnInit, OnDestroy {
  spinnerLoading: boolean = false;
  selectedDashboardData: any;
  claimApprovalLoading = false;
  userInfoSub: any;
  dashboardData = {
    TM_DM: {
      mohawkXchange: [
        {
          name: "Accounts",
          icon: "Xchange_Accounts_icon.png",
          path: "/residential/salesperson/view-accounts",
          isShow: true,
        },
        {
          name: "Orders",
          icon: "Xchange_Orders_icon.png",
          path: "/residential/orders",
          isShow: true,
          permissions: {
            is: [
              [permissionsList[14]],
              [permissionsList[15]],
              [permissionsList[39]],
            ],
            not: [[permissionsList[28]]],
          },
          personas: {
            isShipToUser: true,
          },
        },
        {
          name: "Claims",
          icon: "Xchange_Claims_icon.png",
          path: "/residential/claims/history",
          isShow: true,
          permissions: {
            is: [[permissionsList[13]]],
            not: [[permissionsList[28]]],
          },
          personas: {
            isShipToUser: true,
          },
        },
        {
          name: "Clone Samples",
          icon: "Xchange_Clone Samples_icon.png",
          path: "/residential/cloneorders",
          isShow: true,
        },
        {
          name: "Claims Approval",
          icon: "Xchange_Claims_icon.png",
          path: "/residential/claims/approval-list",
          isShow: true,
          permissions: {
            is: [[permissionsList[13]]],
            not: [[permissionsList[28]],[permissionsList[41]]],
          },
          personas: {
            isShipToUser: true,
          },
        },
      ],
      mohawkToday: [
        {
          name: "Sell Sheets",
          icon: "Xchange_Sell Sheets_icon.png",
          path: "https://mohawktoday.com/resources/sell-sheets",
        },
        {
          name: "Merchandising",
          icon: "Xchange_Merchandising_icon.png",
          path: "https://mohawktoday.com/resources/merchandising",
        },
        {
          name: "Training",
          icon: "Xchange_Training_icon.png",
          path: "https://mohawktoday.com/resources/training",
        },
        {
          name: "Warranties",
          icon: "Xchange_Warranties_icon.png",
          path: "https://mohawktoday.com/resources/warranties",
        },
        {
          name: "Ad Center",
          icon: "Xchange_Ad Center_icon.png",
          path: "https://mohawktoday.com/resources/adcenter",
        },
      ],
      edge: [
        {
          name: "Edge Overview",
          icon: "Xchange_Edge Overview_icon.png",
          path: "https://mohawktoday.com/edge/overview",
        },
        {
          name: "Edge Dashboard",
          icon: "Xchange_Edge Dashboard_icon.png",
          path: "/residential/edge-tracking-dashboard",
        },
        {
          name: "Co-Op",
          icon: "Xchange_Co-op_icon.png",
          path: "https://mohawktoday.com/advertising/advertising/co-op/overview",
        },
        {
          name: "Edge Rewards",
          icon: "Xchange_Edge Rewards_icon.png",
          path: "https://mohawktoday.com/edge/mohawk-edge-rewards",
        },
      ],
      quickLinks: [
        {
          name: "Mohawk 360",
          icon: "Xchange_Mohawk 360_icon.png",
          path: "https://my364308-sso.crm.ondemand.com/",
        },
        {
          name: "Showpad",
          icon: "Xchange_Showpad_icon.png",
          path: "https://mohawk360.showpad.biz/login",
        },
        {
          name: "Sample Budget",
          icon: "Xchange_Sample Budget_icon.png",
          path: "/residential/sample-budget",
        },
        {
          name: "Mohawk Today",
          icon: "Xchange_MohawkToday_icon.png",
          path: "https://mohawktoday.com/",
        },
        {
          name: "Pricing",
          icon: "Xchange_Price Search_icon.png",
          path: "https://pricing.mohawkxchange.com/",
        },
        {
          name: "Karastan Custom Rugs",
          icon: "Xchange_Notifications Preferences_icon.png",
          path: "https://ssoproxytst.mohawkind.com/proxy/XUI/?realm=connector&ForceAuth=true&service=Azure_oidc&goto=https://madetoorderstudio.mm-dev.agency/sso/login/callback#login/",
        },
      ],
    },
    SVP_RVP: {
      mohawkXchange: [
        {
          name: "Accounts",
          icon: "Xchange_Accounts_icon.png",
          path: "/residential/salesperson/view-accounts",
          isShow: true,
        },
        {
          name: "Clone Samples",
          icon: "Xchange_Clone Samples_icon.png",
          path: "/residential/cloneorders",
          isShow: true,
        },
        {
          name: "Claims",
          icon: "Xchange_Claims_icon.png",
          path: "/residential/claims/history",
          isShow: true,
          permissions: {
            is: [[permissionsList[13]]],
            not: [[permissionsList[28]]],
          },
          personas: {
            isShipToUser: true,
          },
        },
        {
          name: "Sample Budget",
          icon: "Xchange_Sample Budget_icon.png",
          path: "/residential/sample-budget",
          isShow: true,
        },
        {
          name: "Claims Approval",
          icon: "Xchange_Claims_icon.png",
          path: "/residential/claims/approval-list",
          isShow: true,
          permissions: {
            is: [[permissionsList[13]]],
            not: [[permissionsList[28]],[permissionsList[41]]],
          },
          personas: {
            isShipToUser: true,
          },
        },
      ],
      mohawkToday: [
        {
          name: "Sell Sheets",
          icon: "Xchange_Sell Sheets_icon.png",
          path: "https://mohawktoday.com/resources/sell-sheets",
        },
        {
          name: "Merchandising",
          icon: "Xchange_Merchandising_icon.png",
          path: "https://mohawktoday.com/resources/merchandising",
        },
        {
          name: "Training",
          icon: "Xchange_Training_icon.png",
          path: "https://mohawktoday.com/resources/training",
        },
        {
          name: "Warranties",
          icon: "Xchange_Warranties_icon.png",
          path: "https://mohawktoday.com/resources/warranties",
        },
        {
          name: "Ad Center",
          icon: "Xchange_Ad Center_icon.png",
          path: "https://mohawktoday.com/resources/adcenter",
        },
      ],
      edge: [
        {
          name: "Edge Overview",
          icon: "Xchange_Edge Overview_icon.png",
          path: "https://mohawktoday.com/edge/overview",
        },
        {
          name: "Edge Dashboard",
          icon: "Xchange_Edge Dashboard_icon.png",
          path: "/residential/edge-tracking-dashboard",
        },
        {
          name: "Co-Op",
          icon: "Xchange_Co-op_icon.png",
          path: "https://mohawktoday.com/advertising/advertising/co-op/overview",
        },
        {
          name: "Edge Rewards",
          icon: "Xchange_Edge Rewards_icon.png",
          path: "https://mohawktoday.com/edge/mohawk-edge-rewards",
        },
      ],
      quickLinks: [
        {
          name: "Mohawk 360",
          icon: "Xchange_Mohawk 360_icon.png",
          path: "https://my364308-sso.crm.ondemand.com/",
        },
        {
          name: "Showpad",
          icon: "Xchange_Showpad_icon.png",
          path: "https://mohawk360.showpad.biz/login",
        },
        {
          name: "MohawkToday",
          icon: "Xchange_MohawkToday_icon.png",
          path: "https://mohawktoday.com/",
        },
        {
          name: "Pricing",
          icon: "Xchange_Price Search_icon.png",
          path: "https://pricing.mohawkxchange.com/",
        },
        {
          name: "Karastan Custom Rugs",
          icon: "Xchange_Notifications Preferences_icon.png",
          path: "https://ssoproxytst.mohawkind.com/proxy/XUI/?realm=connector&ForceAuth=true&service=Azure_oidc&goto=https://madetoorderstudio.mm-dev.agency/sso/login/callback#login/",
        },
      ],
    },
    ALC_BDM: {
      mohawkXchange: [
        {
          name: "Accounts",
          icon: "Xchange_Accounts_icon.png",
          path: "/residential/salesperson/view-accounts",
          isShow: true,
        },
        {
          name: "Orders",
          icon: "Xchange_Orders_icon.png",
          path: "/residential/orders",
          queryParams: { page: 0, status: "OPEN" },
          isShow: true,
          permissions: {
            is: [
              [permissionsList[14]],
              [permissionsList[15]],
              [permissionsList[39]],
            ],
            not: [[permissionsList[28]]],
          },
          personas: {
            isShipToUser: true,
          },
        },
        {
          name: "Claims",
          icon: "Xchange_Claims_icon.png",
          path: "/residential/claims/history",
          isShow: true,
          permissions: {
            is: [[permissionsList[13]]],
            not: [[permissionsList[28]]],
          },
          personas: {
            isShipToUser: true,
          },
        },
        {
          name: "Invoices",
          icon: "Xchange_Invoices_icon.png",
          path: "/residential/finance/invoices",
          isShow: true,
          permissions: {
            is: [[permissionsList[20]]],
            not: [[permissionsList[28]]],
          },
          personas: {
            isShipToUser: true,
          },
        },
        {
          name: "Clone Samples",
          icon: "Xchange_Clone Samples_icon.png",
          path: "/residential/cloneorders",
          isShow: true,
        },
      ],
      mohawkToday: [
        {
          name: "Sell Sheets",
          icon: "Xchange_Sell Sheets_icon.png",
          path: "https://mohawktoday.com/resources/sell-sheets",
        },
        {
          name: "Merchandising",
          icon: "Xchange_Merchandising_icon.png",
          path: "https://mohawktoday.com/resources/merchandising",
        },
        {
          name: "Training",
          icon: "Xchange_Training_icon.png",
          path: "https://mohawktoday.com/resources/training",
        },
        {
          name: "Warranties",
          icon: "Xchange_Warranties_icon.png",
          path: "https://mohawktoday.com/resources/warranties",
        },
        {
          name: "Ad Center",
          icon: "Xchange_Ad Center_icon.png",
          path: "https://mohawktoday.com/resources/adcenter",
        },
      ],
      edge: [
        {
          name: "Edge Overview",
          icon: "Xchange_Edge Overview_icon.png",
          path: "https://mohawktoday.com/edge/overview",
        },
        {
          name: "Co-Op",
          icon: "Xchange_Co-op_icon.png",
          path: "https://mohawktoday.com/advertising/advertising/co-op/overview",
        },
        {
          name: "Edge Rewards",
          icon: "Xchange_Edge Rewards_icon.png",
          path: "https://mohawktoday.com/edge/mohawk-edge-rewards",
        },
      ],
      quickLinks: [
        {
          name: "Mohawk 360",
          icon: "Xchange_Mohawk 360_icon.png",
          path: "https://my364308-sso.crm.ondemand.com/",
        },
        {
          name: "Showpad",
          icon: "Xchange_Showpad_icon.png",
          path: "https://mohawk360.showpad.biz/login",
        },
        {
          name: "Sample Budget",
          icon: "Xchange_Sample Budget_icon.png",
          path: "/residential/sample-budget",
        },
        {
          name: "Mohawk Today",
          icon: "Xchange_MohawkToday_icon.png",
          path: "https://mohawktoday.com/",
        },
        {
          name: "Pricing",
          icon: "Xchange_Price Search_icon.png",
          path: "https://pricing.mohawkxchange.com/",
          isShow: true,
        },
        {
          name: "Karastan Custom Rugs",
          icon: "Xchange_Notifications Preferences_icon.png",
          path: "https://ssoproxytst.mohawkind.com/proxy/XUI/?realm=connector&ForceAuth=true&service=Azure_oidc&goto=https://madetoorderstudio.mm-dev.agency/sso/login/callback#login/",
        },
      ],
    },
    Residential_Manager: {
      mohawkXchange: [
        {
          name: "Accounts",
          icon: "Xchange_Accounts_icon.png",
          path: "/residential/salesperson/view-accounts",
          isShow: true,
        },
        {
          name: "Orders",
          icon: "Xchange_Orders_icon.png",
          path: "/residential/orders",
          queryParams: { page: 0, status: "OPEN" },
          isShow: true,
          permissions: {
            is: [
              [permissionsList[14]],
              [permissionsList[15]],
              [permissionsList[39]],
            ],
            not: [[permissionsList[28]]],
          },
          personas: {
            isShipToUser: true,
          },
        },
        {
          name: "Claims",
          icon: "Xchange_Claims_icon.png",
          path: "/residential/claims/history",
          isShow: true,
          permissions: {
            is: [[permissionsList[13]]],
            not: [[permissionsList[28]]],
          },
          personas: {
            isShipToUser: true,
          },
        },
        {
          name: "Invoices",
          icon: "Xchange_Invoices_icon.png",
          path: "/residential/finance/invoices",
          isShow: true,
          permissions: {
            is: [[permissionsList[20]]],
            not: [[permissionsList[28]]],
          },
          personas: {
            isShipToUser: true,
          },
        },
        {
          name: "Clone Samples",
          icon: "Xchange_Clone Samples_icon.png",
          path: "/residential/cloneorders",
          isShow: true,
        },
        // {
        //   name: "Claims Approval",
        //   icon: "Xchange_Claims_icon.png",
        //   path: "/residential/claims/approval-list",
        //   isShow: true,
        //   permissions: {
        //     is: [[permissionsList[13]]],
        //     not: [[permissionsList[28]],[permissionsList[41]]],
        //   },
        //   personas: {
        //     isShipToUser: true,
        //   },
        // },
      ],
      mohawkToday: [
        {
          name: "Sell Sheets",
          icon: "Xchange_Sell Sheets_icon.png",
          path: "https://mohawktoday.com/resources/sell-sheets",
        },
        {
          name: "Merchandising",
          icon: "Xchange_Merchandising_icon.png",
          path: "https://mohawktoday.com/resources/merchandising",
        },
        {
          name: "Training",
          icon: "Xchange_Training_icon.png",
          path: "https://mohawktoday.com/resources/training",
        },
        {
          name: "Warranties",
          icon: "Xchange_Warranties_icon.png",
          path: "https://mohawktoday.com/resources/warranties",
        },
        {
          name: "Ad Center",
          icon: "Xchange_Ad Center_icon.png",
          path: "https://mohawktoday.com/resources/adcenter",
        },
      ],
      edge: [
        {
          name: "Edge Overview",
          icon: "Xchange_Edge Overview_icon.png",
          path: "https://mohawktoday.com/edge/overview",
        },
        {
          name: "Co-Op",
          icon: "Xchange_Co-op_icon.png",
          path: "https://mohawktoday.com/advertising/advertising/co-op/overview",
        },
        {
          name: "Edge Rewards",
          icon: "Xchange_Edge Rewards_icon.png",
          path: "https://mohawktoday.com/edge/mohawk-edge-rewards",
        },
      ],
      quickLinks: [
        {
          name: "Mohawk 360",
          icon: "Xchange_Mohawk 360_icon.png",
          path: "https://my364308-sso.crm.ondemand.com/",
        },
        {
          name: "Showpad",
          icon: "Xchange_Showpad_icon.png",
          path: "https://mohawk360.showpad.biz/login",
        },
        {
          name: "Mohawk Today",
          icon: "Xchange_MohawkToday_icon.png",
          path: "https://mohawktoday.com/",
        },
        {
          name: "Pricing",
          icon: "Xchange_Price Search_icon.png",
          path: "https://pricing.mohawkxchange.com/",
          isShow: true,
        },
        {
          name: "Karastan Custom Rugs",
          icon: "Xchange_Notifications Preferences_icon.png",
          path: "https://ssoproxytst.mohawkind.com/proxy/XUI/?realm=connector&ForceAuth=true&service=Azure_oidc&goto=https://madetoorderstudio.mm-dev.agency/sso/login/callback#login/",
        },
      ],
    },
  };

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
      name: "Open Orders",
      icon: "open-sample-orders",
      iconExt: ".svg",
      link: "/residential/orders",
      queryParams: { page: 0 },
      value: 0,
      key:'open_orders'
    },
    {
      name: "Open Claims",
      key: "claims",
      icon: "open-claim",
      iconExt: ".svg",
      link: "/residential/claims/history",
      queryParams: { status: "status-INPROCESS" },
      value: 0,
    },
    {
      name: "View Account",
      icon: "open-sample-orders",
      iconExt: ".svg",
      link: "/residential/salesperson/view-accounts",
    },

    {
      name: "Clone Sample Order",
      icon: "open-claim",
      iconExt: ".svg",
      link: "/residential/cloneorders",
    },
    {
      name: "View Sample Budget",
      icon: "active-quotes",
      iconExt: ".svg",
      link: "/residential/sample-budget",
    },
  ];

  productFeaturesListRVP: Array<any> = [
    {
      name: "View Account",
      icon: "open-sample-orders",
      iconExt: ".svg",
      link: "/residential/salesperson/view-accounts",
    },

    {
      name: "View Sample Budget",
      icon: "active-quotes",
      iconExt: ".svg",
      link: "/residential/sample-budget",
    },
  ];

  currentOrdersCount: any = 0;
  sampleOrdersCount: any = 0;
  claimsCount: any = 0;
  invoiceCount: any = 0;
  reserveCount: any = 0;
  todayShipmentCount: any = 0;
  isCSR = false;
  isInhouse = false;
  salesManRole: any = "";
  username: any;
  salesOps: any;
  isSalesPerson: any;
  inHouseAccount: any;
  orgAccountType: any;
  isAccountTypeEmpty: any;

  constructor(
    private route: Router,
    private userService: UserService,
    private apiService: ApiService,
    public storageService: StorageService,
    private modalService: BsModalService
  ) {}

  ngOnInit(): void {
    this.userInfoSub = this.userService
      .getCurrentUserDetail()
      .subscribe((response: any) => {
        this.username = response?.body?.name;
        this.salesManRole = response?.body?.salesManRole;
        this.salesOps = response?.body?.isSalesOps;
        this.isSalesPerson = response?.body?.isSalesPerson;
        this.inHouseAccount = response?.body?.orgUnit?.inHouseAccount;
        this.orgAccountType = response?.body?.orgUnit?.accountType;
        this.isAccountTypeEmpty =
          this.orgAccountType == "" ||
          this.orgAccountType == undefined ||
          response?.body?.orgUnit?.uid == "EMPTY_B2BUNIT"
            ? true
            : false;
        // if (this.salesOps && this.isAccountTypeEmpty) {
        //   this.selectedDashboardData = this.dashboardData.SALESOPS;
        // }
        // ALC_BDM scenarios
        if (response.body?.isALCBDM) {
          this.selectedDashboardData = this.dashboardData.ALC_BDM;
        }
        // Residential Sales Manager scenarios
        else if (response.body?.isResidentialManager) {
          this.selectedDashboardData = this.dashboardData.Residential_Manager;
        } else if (
          this.isSalesPerson &&
          this.inHouseAccount &&
          this.salesManRole !== undefined &&
          this.salesManRole !== null &&
          (this.salesManRole == "TM" || this.salesManRole == "DM")
        ) {
          this.selectedDashboardData = this.dashboardData.TM_DM;
        } else if (
          this.isSalesPerson &&
          this.inHouseAccount &&
          this.salesManRole !== undefined &&
          this.salesManRole !== null &&
          (this.salesManRole == "RVP" || this.salesManRole == "SVP")
        ) {
          this.selectedDashboardData = this.dashboardData.SVP_RVP;
        }
        this.selectedDashboardData?.mohawkXchange.map((item: any) => {
          if (
            item.name == "Accounts" &&
            (this.salesOps === true || this.isSalesPerson === true)
          ) {
            item.isShow = true;
          } else if (item.name !== "Clone Samples") {
            this.storageService
              .getItem("userInfo")
              .subscribe((response: any) => {
                item.isShow = response?.orgUnit?.inHouseAccount;
              });
          }
          if (item.path.includes("/claims")) {
            item.isShow = !(
              this.storageService?.userInfo?.orgUnit?.accountType === "ZMSH"
            );
          }
        });
        // if (response.body.isSalesOps) {
        //   this.route.navigate([`/residential/salesperson/view-accounts`]);
        // } else
        if (
          response.body.isSalesPerson &&
          response.body.orgUnit?.inHouseAccount
        ) {
          this.route.navigate([`/residential/salesperson`]);
        } else if (!response.body.orgUnit?.inHouseAccount) {
          this.route.navigate([`/residential`]);
        } else {
          this.getCurrentOrdersCount();
          this.getSampleOrdersCount();
          this.getClaimsCount();
          this.getInvoiceCount();
          // this.getReserveCount();
          this.userService.isInhouseAccount.subscribe((isInhouse: boolean) => {
            this.isInhouse = isInhouse;
          });
          if (!this.isInhouse) {
            this.userService.clearB2BUnit().subscribe();
            localStorage.setItem("customerAddress", "");
          }
        }
        this.validatePermissonsPesonas();

        if (this.isSalesPerson) this.updateClaimApprovalCount();
        let messageRoleKey = "CSR";

        if (response.body?.isALCBDM) {
          messageRoleKey = "ALC_BDM";
        } else if (response.body?.isResidentialManager) {
          messageRoleKey = "Residential_Manager";
        } else if (
          this.isSalesPerson &&
          this.inHouseAccount &&
          (this.salesManRole === "TM" || this.salesManRole === "DM")
        ) {
          messageRoleKey = "TM_DM";
        } else if (
          this.isSalesPerson &&
          this.inHouseAccount &&
          (this.salesManRole === "RVP" || this.salesManRole === "SVP")
        ) {
          messageRoleKey = "SVP_RVP";
        } else if (this.isSalesPerson && !this.inHouseAccount) {
          messageRoleKey = "SALESPERSON_NONIHOUSE";
        } else if (this.salesOps && this.isAccountTypeEmpty) {
          messageRoleKey = "SALESOPS";
        } else if (
          (this.salesOps && !this.isAccountTypeEmpty) ||
          (response.body?.isCustomer && !response.body?.isMultiAccountCustomer)
        ) {
          messageRoleKey = "SINGLE_ACCOUNT_CUSTOMER";
        } else if (
          response.body?.isCustomer &&
          response.body?.isMultiAccountCustomer
        ) {
          messageRoleKey = "MULTI_ACCOUNT_CUSTOMER";
        }

        const messageConstants = MESSAGE_CONSTANTS.LandingPage[messageRoleKey];
        this.openProgressModal({
          modalHeaderText: messageConstants?.headerText,
          progressText: messageConstants?.bodyText,
          progressBarText: messageConstants?.barText,
        });
      });
   // this.modalService.hide("progressModal");
  }

  updateClaimApprovalCount() {
    const approvalItem = this.selectedDashboardData?.mohawkXchange?.find(
      (item: any) =>
        item.path.includes("/claims/approval-list") &&
        item.name === "Claims Approval"
    );
    if (approvalItem?.isShow === true && this.claimApprovalLoading === false) {
      this.claimApprovalLoading = true;
      this.userService.getClaimApprovalCount().subscribe(
        (res: any) => {
          this.claimApprovalLoading = false;
          // approvalItem.count = 200;
          approvalItem.count = res?.body || 0;
          
        },
        (err: any) => {this.modalService.hide("progressModal");}
      );
    }
   
  }
  validatePermissonsPesonas() {
    this.selectedDashboardData?.mohawkXchange?.map((item: any) => {
      if (item.hasOwnProperty("permissions")) {
        if (
          this.userPersonaAccess(item) === true &&
          this.userCanAccess(
            item,
            this.storageService.userInfo?.userPermissions || []
          ) === true
        ) {
          item.isShow = true;
        } else {
          item.isShow = false;
        }
      }
    });
    const mainMenu = ["mohawkToday", "edge", "quickLinks"];
    mainMenu.forEach((menu) => {
      this.selectedDashboardData?.[menu]?.map((item: any) => {
        if (item.hasOwnProperty("permissions")) {
          if (
            this.userPersonaAccess(item) === true &&
            this.userCanAccess(
              item,
              this.storageService.userInfo?.userPermissions || []
            ) === true
          ) {
            item.isShow = true;
          } else {
            item.isShow = false;
          }
        } else {
          item.isShow = true;
        }
      });
    });
    
  }
  userCanAccess(node: any, userPermissions: any): boolean {
    
    if (node.permissions === undefined) return true;
    let canAccess = true;
    for (let permissionGroup of node.permissions.is) {
      let passesAllPermissionsInAGroup = true;
      if (permissionGroup === undefined) return true;
      for (let permission of permissionGroup) {
        if (!userPermissions?.includes(permission)) {
          passesAllPermissionsInAGroup = false;
          break;
        }
      }
      if (!passesAllPermissionsInAGroup) {
        canAccess = false;
        break;
      }
    }
    if (!canAccess) return false;
    if (node.permissions.not.length === 0) return true;

    for (let permissionGroup of node.permissions.not) {
      let excludesAtLeastOneInAGroup = false;
      for (let permission of permissionGroup) {
        if (!userPermissions?.includes(permission))
          excludesAtLeastOneInAGroup = true;
      }
      if (!excludesAtLeastOneInAGroup) {
        return false;
      }
    }
    return true;
  }
  userPersonaAccess(menuItem: any) {
    let haveAccess = true;
    for (let personas in menuItem?.personas) {
      if (
        this.storageService.userInfo &&
        this.storageService.userInfo != null &&
        this.storageService.userInfo.hasOwnProperty(personas) &&
        menuItem.personas[personas] == false &&
        this.storageService.userInfo[personas] == true
      ) {
        haveAccess = false;
        break;
      }
    }
    return haveAccess;
  }
  navigateToOrders() {
    this.route.navigate(["/residential/orders"]);
  }

  navigateToClaims() {
    this.route.navigate(["/residential/claims/history"]);
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
      error: (error: any) => {this.modalService.hide("progressModal");},
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
      error: (error: any) => {this.modalService.hide("progressModal");},
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
      error: (error: any) => {this.modalService.hide("progressModal");},
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
      error: (error: any) => {this.modalService.hide("progressModal");},
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
      error: (error: any) => {this.modalService.hide("progressModal");},
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
  ngOnDestroy(): void {
    this.userInfoSub.unsubscribe();
  }
  modalRef?: BsModalRef;
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
