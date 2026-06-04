import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { TabsetComponent } from "ngx-bootstrap/tabs";
import { OwlOptions } from "ngx-owl-carousel-o";
import { StorageService } from "src/app/features/http-services/storage.service";
import { ProgressModalComponent } from "src/app/features/shared/components/progress-modal/progress-modal.component";
import { MESSAGE_CONSTANTS } from "src/app/features/shared/constants/MESSAGE-CONSTANTS";
import { permissionsList } from "src/app/features/shared/constants/PERMISSIONS_CONSTANTS";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { CommercialSiteSelectorService } from "src/app/features/http-services/commercial-site-selector.service";

@Component({
    selector: "app-home-page",
    templateUrl: "./home-page.component.html",
    styleUrls: ["./home-page.component.scss"],
    standalone: false
})
export class HomePageComponent implements OnInit, OnDestroy {
  modalRef?: BsModalRef;
  saleValue = 80000;
  userInfoSub:any;
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

  productFeaturesList: Array<any> = [];

  searchText: any;
  salesManRole: any;
  salesOps: any;
  isSalesPerson: any;
  isCSR: any;
  isCustomer: any;
  inHouseAccount: any;
  orgAccountType: any;
  isAccountTypeEmpty: any;
  isMultiAccCustomer: any;
  isALCBDM: any;
  isResidentialManager: any;
  isMtMarketing: any;
  show: boolean = false;
  spinnerLoading: boolean = false;
  selectedDashboardData: any;
  claimApprovalLoading = false;
  priceLabel: any;
  dashboardData = {
    SHIP_TO_ONLY: {
      mohawkXchange: [
        {
          name: "Orders",
          icon: "Xchange_Orders_icon.png",
          path: "/residential/orders",
          isShow: true,
        },
        {
          name: "Claims",
          icon: "Xchange_Claims_icon.png",
          path: "/residential/claims/history",
          isShow: true,
        },
        {
          name: "Today's Shipment",
          icon: "Xchange_Today’s Shipments_icon.png",
          path: "/residential/orders",
          queryParams: { page: 1 },
          isShow: true,
        },
        {
          name: "Invoices",
          icon: "Xchange_Invoices_icon.png",
          path: "/residential/finance/invoices",
          isShow: true,
          permissions: {
            is: [[permissionsList[20]]],
            not: [[permissionsList[28]], [permissionsList[41]]],
          },
          personas: {
            isShipToUser: true,
          },
        },
        {
          name: "Credit Memos",
          icon: "Xchange_credit_memo_icon.svg",
          path: "/residential/finance/credit-memos",
          isShow: true,
          permissions: {
            is: [[permissionsList[20]]],
            not: [[permissionsList[28]], [permissionsList[41]]],
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
          name: "Price search",
          icon: "Xchange_Price Search_icon.png",
          path: "/residential/pricing/price-search",
          isShow: true,
          permissions: {
            is: [[permissionsList[26]]],
            not: [[permissionsList[28]],[permissionsList[41]]],
          },
          personas: {
            isShipToUser: true,
          },
        },
        {
          name: "Karastan Custom Rugs",
          icon: "Xchange_Notifications Preferences_icon.png",
          path: "https://ssoexternal.mohawkind.com/proxy/XUI/?realm=connector&ForceAuth=true&service=Azure_oidc&goto=https://www.made-to-orderstudio.com/sso/login/callback#login/details",
        },
      ],
    },
    CSR: {           
      mohawkXchange: [
        {
          name: "Accounts",
          icon: "Xchange_Accounts_icon.png",
          path: "/residential/account/accounts-list",
          isShow: true,
        },
        {
          name: "Orders",
          icon: "Xchange_Orders_icon.png",
          path: "/residential/orders",
          /* queryParams: { page: 0, status: "OPEN" }, */
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
            not: [[permissionsList[28]],[permissionsList[41]]],
          },
          personas: {
            isShipToUser: true,
          },
        },
        {
          name: "Today's Shipment",
          icon: "Xchange_Today’s Shipments_icon.png",
          path: "/residential/orders",
          queryParams: { page: 1 },
          isShow: true,
          permissions: {
            is: [
              [permissionsList[14]],
              [permissionsList[15]],
              [permissionsList[39]],
            ],
            not: [[permissionsList[28]]],
          },
        },
        {
          name: "Invoices",
          icon: "Xchange_Invoices_icon.png",
          path: "/residential/finance/invoices",
          isShow: true,
          permissions: {
            is: [[permissionsList[20]]],
            not: [[permissionsList[28]], [permissionsList[41]]],
          },
          personas: {
            isShipToUser: true,
          },
        },
        {
          name: "Credit Memos",
          icon: "Xchange_credit_memo_icon.svg",
          path: "/residential/finance/credit-memos",
          isShow: true,
          permissions: {
            is: [[permissionsList[20]]],
            not: [[permissionsList[28]], [permissionsList[41]]],
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
          name: "My Company",
          icon: "Xchange_My Company_icon.png",
          path: "/residential/company/manage-users",
        },
        {
          name: "Make a Payment",
          icon: "Xchange_Make a Payment_icon.png",
          path: "/residential/finance/payments/receivables",
          permissions: {
            is: [
              [permissionsList[24]],
              [permissionsList[31]],
              [permissionsList[38]],
            ],
            not: [
              [permissionsList[28]],
              [permissionsList[33]],
              [permissionsList[34]],
              [permissionsList[41]]
            ],
          },
          personas: {
            isShipToUser: false,
          },
        },
        {
          name: "Price search",
          icon: "Xchange_Price Search_icon.png",
          path: "/residential/pricing/price-search",
          isShow: true,
          permissions: {
            is: [[permissionsList[26]]],
            not: [[permissionsList[28]],[permissionsList[41]]],
          },
          personas: {
            isShipToUser: true,
          },
        },
        {
          name: "Update Billing Address",
          icon: "Xchange_Update Billing Address_icon.png",
          path: "/residential/my-profile/billing-address",
        },
        {
          name: "Notification Preferences",
          icon: "Xchange_Notifications Preferences_icon.png",
          path: "/residential/my-profile/notification-preferences",
        },
        {
          name: "Karastan Custom Rugs",
          icon: "Xchange_Notifications Preferences_icon.png",
          path: "https://ssoexternal.mohawkind.com/proxy/XUI/?realm=connector&ForceAuth=true&service=Azure_oidc&goto=https://www.made-to-orderstudio.com/sso/login/callback#login/details",
        },
      ],
    },
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
          icon: "a_claims-approval-circle.png",
          path: "/residential/claims/approval-list",
          isShow: true,
          count:"",
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
          isShow: true,
          permissions: {
            is: [[permissionsList[26]], [permissionsList[25]]],
            not: [[permissionsList[28]]],
          },
          personas: {
            isShipToUser: true,
          },
        },
        {
          name: "Karastan Custom Rugs",
          icon: "Xchange_Notifications Preferences_icon.png",
          path: "https://ssoexternal.mohawkind.com/proxy/XUI/?realm=connector&ForceAuth=true&service=Azure_oidc&goto=https://www.made-to-orderstudio.com/sso/login/callback#login/details",
        },
      ],
    },
    SVP_RVP: {
      mohawkXchange: [
        {
          name: "Account",
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
          name: "Sample Budget",
          icon: "Xchange_Sample Budget_icon.png",
          path: "/residential/sample-budget",
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
          name: "Claims Approval",
          icon: "a_claims-approval-circle.png",
          path: "/residential/claims/approval-list",
          isShow: true,
          count:"",
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
          isShow: true,
          permissions: {
            is: [[permissionsList[26]], [permissionsList[25]]],
            not: [[permissionsList[28]]],
          },
          personas: {
            isShipToUser: true,
          },
        },
        {
          name: "Karastan Custom Rugs",
          icon: "Xchange_Notifications Preferences_icon.png",
          path: "https://ssoexternal.mohawkind.com/proxy/XUI/?realm=connector&ForceAuth=true&service=Azure_oidc&goto=https://www.made-to-orderstudio.com/sso/login/callback#login/details",
        },
      ],
    },
    SALESOPS: {
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
          /* queryParams: { page: 0, status: "OPEN" }, */
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
          name: "Sample Budget",
          icon: "Xchange_Sample Budget_icon.png",
          path: "/residential/sample-budget",
          isShow: true,
        },
        // {
        //   name: "Claims Approval",
        //   icon: "a_claims-approval-circle.png",
        //   path: "/residential/claims/approval-list",
        //   isShow: true,
        //   count:"",
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
          permissions: {
            is: [[permissionsList[26]], [permissionsList[25]]],
            not: [[permissionsList[28]]],
          },
          personas: {
            isShipToUser: true,
          },
        },
        {
          name: "Karastan Custom Rugs",
          icon: "Xchange_Notifications Preferences_icon.png",
          path: "https://ssoexternal.mohawkind.com/proxy/XUI/?realm=connector&ForceAuth=true&service=Azure_oidc&goto=https://www.made-to-orderstudio.com/sso/login/callback#login/details",
        },
      ],
    },
    MULTI_ACCOUNT_CUSTOMER: {
      mohawkXchange: [
        {
          name: "Accounts",
          icon: "Xchange_Accounts_icon.png",
          path: "/residential/account/accounts-list",
          isShow: true,
        },
        {
          name: "Orders",
          icon: "Xchange_Orders_icon.png",
          path: "/residential/orders",
          /* queryParams: { page: 0, status: "OPEN" }, */
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
          name: "Today's Shipment",
          icon: "Xchange_Today’s Shipments_icon.png",
          path: "/residential/orders",
          queryParams: { page: 1 },
          isShow: true,
          permissions: {
            is: [
              [permissionsList[14]],
              [permissionsList[15]],
              [permissionsList[39]],
            ],
            not: [[permissionsList[28]]],
          },
        },
        {
          name: "Invoices",
          icon: "Xchange_Invoices_icon.png",
          path: "/residential/finance/invoices",
          isShow: true,
          permissions: {
            is: [[permissionsList[20]]],
            not: [[permissionsList[28]], [permissionsList[41]]],
          },
          personas: {
            isShipToUser: true,
          },
        },
        {
          name: "Credit Memos",
          icon: "Xchange_credit_memo_icon.svg",
          path: "/residential/finance/credit-memos",
          isShow: true,
          permissions: {
            is: [[permissionsList[20]]],
            not: [[permissionsList[28]], [permissionsList[41]]],
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
          name: "My Company",
          icon: "Xchange_My Company_icon.png",
          path: "/residential/company/manage-users",
        },
        {
          name: "Make a Payment",
          icon: "Xchange_Make a Payment_icon.png",
          path: "/residential/finance/payments/receivables",
          permissions: {
            is: [
              [permissionsList[24]],
              [permissionsList[31]],
              [permissionsList[38]],
            ],
            not: [
              [permissionsList[28]],
              [permissionsList[33]],
              [permissionsList[34]],
            ],
          },
          personas: {
            isShipToUser: false,
          },
        },
        {
          name: "Price search",
          icon: "Xchange_Price Search_icon.png",
          path: "/residential/pricing/price-search",
          isShow: true,
          permissions: {
            is: [[permissionsList[26]]],
            not: [[permissionsList[28]],[permissionsList[41]]],
          },
          personas: {
            isShipToUser: true,
          },
        },
        {
          name: "Update Billing Address",
          icon: "Xchange_Update Billing Address_icon.png",
          path: "/residential/my-profile/billing-address",
        },
        {
          name: "Notification Preferences",
          icon: "Xchange_Notifications Preferences_icon.png",
          path: "/residential/my-profile/notification-preferences",
        },
        {
          name: "Karastan Custom Rugs",
          icon: "Xchange_Notifications Preferences_icon.png",
          path: "https://ssoexternal.mohawkind.com/proxy/XUI/?realm=connector&ForceAuth=true&service=Azure_oidc&goto=https://www.made-to-orderstudio.com/sso/login/callback#login/details",
        },
      ],
    },
    SINGLE_ACCOUNT_CUSTOMER: {
      mohawkXchange: [
        {
          name: "Accounts",
          icon: "Xchange_Accounts_icon.png",
          path: "/residential/salesperson/view-accounts",
          // isShow:
            // this.storageService?.userInfo?.isSalesPerson &&
            // !this.storageService?.userInfo?.orgUnit?.inHouseAccount,
        },
        {
          name: "Orders",
          icon: "Xchange_Orders_icon.png",
          path: "/residential/orders",
          /* queryParams: { page: 0, status: "OPEN" }, */
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
          name: "Today's Shipment",
          icon: "Xchange_Today’s Shipments_icon.png",
          path: "/residential/orders",
          queryParams: { page: 1 },
          isShow: true,
          permissions: {
            is: [
              [permissionsList[14]],
              [permissionsList[15]],
              [permissionsList[39]],
            ],
            not: [[permissionsList[28]]],
          },
        },
        {
          name: "Invoices",
          icon: "Xchange_Invoices_icon.png",
          path: "/residential/finance/invoices",
          isShow: true,
          permissions: {
            is: [[permissionsList[20]]],
            not: [[permissionsList[28]], [permissionsList[41]]],
          },
          personas: {
            isShipToUser: true,
          },
        },
        {
          name: "Credit Memos",
          icon: "Xchange_credit_memo_icon.svg",
          path: "/residential/finance/credit-memos",
          isShow: true,
          permissions: {
            is: [[permissionsList[20]]],
            not: [[permissionsList[28]], [permissionsList[41]]],
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
          name: "My Company",
          icon: "Xchange_My Company_icon.png",
          path: "/residential/company/manage-users",
        },
        {
          name: "Make a Payment",
          icon: "Xchange_Make a Payment_icon.png",
          path: "/residential/finance/payments/receivables",
          permissions: {
            is: [
              [permissionsList[24]],
              [permissionsList[31]],
              [permissionsList[38]],
            ],
            not: [
              [permissionsList[28]],
              [permissionsList[33]],
              [permissionsList[34]],
            ],
          },
          personas: {
            isShipToUser: false,
          },
        },
        {
          name: "Price search",
          icon: "Xchange_Price Search_icon.png",
          path: "/residential/pricing/price-search",
          isShow: true,
          permissions: {
            is: [[permissionsList[26]]],
            not: [[permissionsList[28]],[permissionsList[41]]],
          },
          personas: {
            isShipToUser: true,
          },
        },
        {
          name: "Update Billing Address",
          icon: "Xchange_Update Billing Address_icon.png",
          path: "/residential/my-profile/billing-address",
        },
        {
          name: "Notification Preferences",
          icon: "Xchange_Notifications Preferences_icon.png",
          path: "/residential/my-profile/notification-preferences",
        },
        {
          name: "Karastan Custom Rugs",
          icon: "Xchange_Notifications Preferences_icon.png",
          path: "https://ssoexternal.mohawkind.com/proxy/XUI/?realm=connector&ForceAuth=true&service=Azure_oidc&goto=https://www.made-to-orderstudio.com/sso/login/callback#login/details",
        },
      ],
    },
    SALESPERSON_NONIHOUSE: {
      mohawkXchange: [
        {
          name: "Accounts",
          icon: "Xchange_Accounts_icon.png",
          path: "/residential/salesperson/view-accounts",
          // isShow:
          //   this.storageService?.userInfo?.isSalesPerson &&
          //   !this.storageService?.userInfo?.orgUnit?.inHouseAccount,
        },
        {
          name: "Orders",
          icon: "Xchange_Orders_icon.png",
          path: "/residential/orders",
          /* queryParams: { page: 0, status: "OPEN" }, */
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
          name: "Today's Shipment",
          icon: "Xchange_Today’s Shipments_icon.png",
          path: "/residential/orders",
          queryParams: { page: 1 },
          isShow: true,
          permissions: {
            is: [
              [permissionsList[14]],
              [permissionsList[15]],
              [permissionsList[39]],
            ],
            not: [[permissionsList[28]]],
          },
        },
        {
          name: "Invoices",
          icon: "Xchange_Invoices_icon.png",
          path: "/residential/finance/invoices",
          isShow: true,
          permissions: {
            is: [[permissionsList[20]]],
            not: [[permissionsList[28]], [permissionsList[41]]],
          },
          personas: {
            isShipToUser: true,
          },
        },
        {
          name: "Credit Memos",
          icon: "Xchange_credit_memo_icon.svg",
          path: "/residential/finance/credit-memos",
          isShow: true,
          permissions: {
            is: [[permissionsList[20]]],
            not: [[permissionsList[28]], [permissionsList[41]]],
          },
          personas: {
            isShipToUser: true,
          },
        },
        {
          name: "Claims Approval",
          icon: "a_claims-approval-circle.png",
          path: "/residential/claims/approval-list",
          isShow: true,
          count:"",
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
          name: "My Company",
          icon: "Xchange_My Company_icon.png",
          path: "/residential/company/manage-users",
        },
        {
          name: "Make a Payment",
          icon: "Xchange_Make a Payment_icon.png",
          path: "/residential/finance/payments/receivables",
          permissions: {
            is: [
              [permissionsList[24]],
              [permissionsList[31]],
              [permissionsList[38]],
            ],
            not: [
              [permissionsList[28]],
              [permissionsList[33]],
              [permissionsList[34]],
            ],
          },
          personas: {
            isShipToUser: false,
          },
        },
        {
          name: "Price search",
          icon: "Xchange_Price Search_icon.png",
          path: "/residential/pricing/price-search",
          isShow: true,
          permissions: {
            is: [[permissionsList[26]]],
            not: [[permissionsList[28]],[permissionsList[41]]],
          },
          personas: {
            isShipToUser: true,
          },
        },
        {
          name: "Update Billing Address",
          icon: "Xchange_Update Billing Address_icon.png",
          path: "/residential/my-profile/billing-address",
        },
        {
          name: "Notification Preferences",
          icon: "Xchange_Notifications Preferences_icon.png",
          path: "/residential/my-profile/notification-preferences",
        },
        {
          name: "Karastan Custom Rugs",
          icon: "Xchange_Notifications Preferences_icon.png",
          path: "https://ssoexternal.mohawkind.com/proxy/XUI/?realm=connector&ForceAuth=true&service=Azure_oidc&goto=https://www.made-to-orderstudio.com/sso/login/callback#login/details",
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
          /* queryParams: { page: 0, status: "OPEN" }, */
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
          name: "Credit Memos",
          icon: "Xchange_credit_memo_icon.svg",
          path: "/residential/finance/credit-memos",
          isShow: true,
          permissions: {
            is: [[permissionsList[20]]],
            not: [[permissionsList[28]], [permissionsList[41]]],
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
          permissions: {
            is: [[permissionsList[26]], [permissionsList[25]]],
            not: [[permissionsList[28]]],
          },
          personas: {
            isShipToUser: true,
          },
        },
        {
          name: "Karastan Custom Rugs",
          icon: "Xchange_Notifications Preferences_icon.png",
          path: "https://ssoexternal.mohawkind.com/proxy/XUI/?realm=connector&ForceAuth=true&service=Azure_oidc&goto=https://www.made-to-orderstudio.com/sso/login/callback#login/details",
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
          /* queryParams: { page: 0, status: "OPEN" }, */
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
          name: "Credit Memos",
          icon: "Xchange_credit_memo_icon.svg",
          path: "/residential/finance/credit-memos",
          isShow: true,
          permissions: {
            is: [[permissionsList[20]]],
            not: [[permissionsList[28]], [permissionsList[41]]],
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
        //   icon: "a_claims-approval-circle.png",
        //   path: "/residential/claims/approval-list",
        //   isShow: true,
        //   count:"",
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
          permissions: {
            is: [[permissionsList[26]], [permissionsList[25]]],
            not: [[permissionsList[28]]],
          },
          personas: {
            isShipToUser: true,
          },
        },
        {
          name: "Karastan Custom Rugs",
          icon: "Xchange_Notifications Preferences_icon.png",
          path: "https://ssoexternal.mohawkind.com/proxy/XUI/?realm=connector&ForceAuth=true&service=Azure_oidc&goto=https://www.made-to-orderstudio.com/sso/login/callback#login/details",
        },
      ],
    },
    Marketing:
    {
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
    }
  };
  username: any;

  constructor(
    private route: Router,
    private userService: UserService,
    public storageService: StorageService,
    private modalService: BsModalService, 
    public commercialSiteSelectorService: CommercialSiteSelectorService,
    private cdr: ChangeDetectorRef, private zone: NgZone
  ) {
    window.scrollTo({
      top: 0,
    });
  }

  ngOnInit(): void {
    this.isProductManager = this.storageService?.userInfo?.isProductManager;
     this.dashboardData = {
    SHIP_TO_ONLY: {
      mohawkXchange: [
        {
          name: "Orders",
          icon: "Xchange_Orders_icon.png",
          path: "/residential/orders",
          isShow: true,
        },
        {
          name: "Claims",
          icon: "Xchange_Claims_icon.png",
          path: "/residential/claims/history",
          isShow: true,
        },
        {
          name: "Today's Shipment",
          icon: "Xchange_Today’s Shipments_icon.png",
          path: "/residential/orders",
          queryParams: { page: 1 },
          isShow: true,
        },
        {
          name: "Invoices",
          icon: "Xchange_Invoices_icon.png",
          path: "/residential/finance/invoices",
          isShow: true,
          permissions: {
            is: [[permissionsList[20]]],
            not: [[permissionsList[28]], [permissionsList[41]]],
          },
          personas: {
            isShipToUser: true,
          },
        },
        {
          name: "Credit Memos",
          icon: "Xchange_credit_memo_icon.svg",
          path: "/residential/finance/credit-memos",
          isShow: true,
          permissions: {
            is: [[permissionsList[20]]],
            not: [[permissionsList[28]], [permissionsList[41]]],
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
          name: "Price search",
          icon: "Xchange_Price Search_icon.png",
          path: "/residential/pricing/price-search",
          isShow: true,
          permissions: {
            is: [[permissionsList[26]]],
            not: [[permissionsList[28]],[permissionsList[41]]],
          },
          personas: {
            isShipToUser: true,
          },
        },
        {
          name: "Karastan Custom Rugs",
          icon: "Xchange_Notifications Preferences_icon.png",
          path: "https://ssoexternal.mohawkind.com/proxy/XUI/?realm=connector&ForceAuth=true&service=Azure_oidc&goto=https://www.made-to-orderstudio.com/sso/login/callback#login/details",
        },
      ],
    },
    CSR: {           
      mohawkXchange: [
        {
          name: "Accounts",
          icon: "Xchange_Accounts_icon.png",
          path: "/residential/account/accounts-list",
          isShow: true,
        },
        {
          name: "Orders",
          icon: "Xchange_Orders_icon.png",
          path: "/residential/orders",
          /* queryParams: { page: 0, status: "OPEN" }, */
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
            not: [[permissionsList[28]],[permissionsList[41]]],
          },
          personas: {
            isShipToUser: true,
          },
        },
        {
          name: "Today's Shipment",
          icon: "Xchange_Today’s Shipments_icon.png",
          path: "/residential/orders",
          queryParams: { page: 1 },
          isShow: true,
          permissions: {
            is: [
              [permissionsList[14]],
              [permissionsList[15]],
              [permissionsList[39]],
            ],
            not: [[permissionsList[28]]],
          },
        },
        {
          name: "Invoices",
          icon: "Xchange_Invoices_icon.png",
          path: "/residential/finance/invoices",
          isShow: true,
          permissions: {
            is: [[permissionsList[20]]],
            not: [[permissionsList[28]], [permissionsList[41]]],
          },
          personas: {
            isShipToUser: true,
          },
        },
        {
          name: "Credit Memos",
          icon: "Xchange_credit_memo_icon.svg",
          path: "/residential/finance/credit-memos",
          isShow: true,
          permissions: {
            is: [[permissionsList[20]]],
            not: [[permissionsList[28]], [permissionsList[41]]],
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
          name: "My Company",
          icon: "Xchange_My Company_icon.png",
          path: "/residential/company/manage-users",
        },
        {
          name: "Make a Payment",
          icon: "Xchange_Make a Payment_icon.png",
          path: "/residential/finance/payments/receivables",
          permissions: {
            is: [
              [permissionsList[24]],
              [permissionsList[31]],
              [permissionsList[38]],
            ],
            not: [
              [permissionsList[28]],
              [permissionsList[33]],
              [permissionsList[34]],
              [permissionsList[41]]
            ],
          },
          personas: {
            isShipToUser: false,
          },
        },
        {
          name: "Price search",
          icon: "Xchange_Price Search_icon.png",
          path: "/residential/pricing/price-search",
          isShow: true,
          permissions: {
            is: [[permissionsList[26]]],
            not: [[permissionsList[28]],[permissionsList[41]]],
          },
          personas: {
            isShipToUser: true,
          },
        },
        {
          name: "Update Billing Address",
          icon: "Xchange_Update Billing Address_icon.png",
          path: "/residential/my-profile/billing-address",
        },
        {
          name: "Notification Preferences",
          icon: "Xchange_Notifications Preferences_icon.png",
          path: "/residential/my-profile/notification-preferences",
        },
        {
          name: "Karastan Custom Rugs",
          icon: "Xchange_Notifications Preferences_icon.png",
          path: "https://ssoexternal.mohawkind.com/proxy/XUI/?realm=connector&ForceAuth=true&service=Azure_oidc&goto=https://www.made-to-orderstudio.com/sso/login/callback#login/details",
        },
      ],
    },
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
          icon: "a_claims-approval-circle.png",
          path: "/residential/claims/approval-list",
          isShow: true,
          count:"",
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
          isShow: true,
          permissions: {
            is: [[permissionsList[26]], [permissionsList[25]]],
            not: [[permissionsList[28]]],
          },
          personas: {
            isShipToUser: true,
          },
        },
        {
          name: "Karastan Custom Rugs",
          icon: "Xchange_Notifications Preferences_icon.png",
          path: "https://ssoexternal.mohawkind.com/proxy/XUI/?realm=connector&ForceAuth=true&service=Azure_oidc&goto=https://www.made-to-orderstudio.com/sso/login/callback#login/details",
        },
      ],
    },
    SVP_RVP: {
      mohawkXchange: [
        {
          name: "Account",
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
          name: "Sample Budget",
          icon: "Xchange_Sample Budget_icon.png",
          path: "/residential/sample-budget",
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
          name: "Claims Approval",
          icon: "a_claims-approval-circle.png",
          path: "/residential/claims/approval-list",
          isShow: true,
          count:"",
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
          isShow: true,
          permissions: {
            is: [[permissionsList[26]], [permissionsList[25]]],
            not: [[permissionsList[28]]],
          },
          personas: {
            isShipToUser: true,
          },
        },
        {
          name: "Karastan Custom Rugs",
          icon: "Xchange_Notifications Preferences_icon.png",
          path: "https://ssoexternal.mohawkind.com/proxy/XUI/?realm=connector&ForceAuth=true&service=Azure_oidc&goto=https://www.made-to-orderstudio.com/sso/login/callback#login/details",
        },
      ],
    },
    SALESOPS: {
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
          /* queryParams: { page: 0, status: "OPEN" }, */
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
          name: "Sample Budget",
          icon: "Xchange_Sample Budget_icon.png",
          path: "/residential/sample-budget",
          isShow: true,
        },
        // {
        //   name: "Claims Approval",
        //   icon: "a_claims-approval-circle.png",
        //   path: "/residential/claims/approval-list",
        //   isShow: true,
        //   count:"",
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
          permissions: {
            is: [[permissionsList[26]], [permissionsList[25]]],
            not: [[permissionsList[28]]],
          },
          personas: {
            isShipToUser: true,
          },
        },
        {
          name: "Karastan Custom Rugs",
          icon: "Xchange_Notifications Preferences_icon.png",
          path: "https://ssoexternal.mohawkind.com/proxy/XUI/?realm=connector&ForceAuth=true&service=Azure_oidc&goto=https://www.made-to-orderstudio.com/sso/login/callback#login/details",
        },
      ],
    },
    MULTI_ACCOUNT_CUSTOMER: {
      mohawkXchange: [
        {
          name: "Accounts",
          icon: "Xchange_Accounts_icon.png",
          path: "/residential/account/accounts-list",
          isShow: true,
        },
        {
          name: "Orders",
          icon: "Xchange_Orders_icon.png",
          path: "/residential/orders",
          /* queryParams: { page: 0, status: "OPEN" }, */
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
          name: "Today's Shipment",
          icon: "Xchange_Today’s Shipments_icon.png",
          path: "/residential/orders",
          queryParams: { page: 1 },
          isShow: true,
          permissions: {
            is: [
              [permissionsList[14]],
              [permissionsList[15]],
              [permissionsList[39]],
            ],
            not: [[permissionsList[28]]],
          },
        },
        {
          name: "Invoices",
          icon: "Xchange_Invoices_icon.png",
          path: "/residential/finance/invoices",
          isShow: true,
          permissions: {
            is: [[permissionsList[20]]],
            not: [[permissionsList[28]], [permissionsList[41]]],
          },
          personas: {
            isShipToUser: true,
          },
        },
        {
          name: "Credit Memos",
          icon: "Xchange_credit_memo_icon.svg",
          path: "/residential/finance/credit-memos",
          isShow: true,
          permissions: {
            is: [[permissionsList[20]]],
            not: [[permissionsList[28]], [permissionsList[41]]],
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
          name: "My Company",
          icon: "Xchange_My Company_icon.png",
          path: "/residential/company/manage-users",
        },
        {
          name: "Make a Payment",
          icon: "Xchange_Make a Payment_icon.png",
          path: "/residential/finance/payments/receivables",
          permissions: {
            is: [
              [permissionsList[24]],
              [permissionsList[31]],
              [permissionsList[38]],
            ],
            not: [
              [permissionsList[28]],
              [permissionsList[33]],
              [permissionsList[34]],
            ],
          },
          personas: {
            isShipToUser: false,
          },
        },
        {
          name: "Price search",
          icon: "Xchange_Price Search_icon.png",
          path: "/residential/pricing/price-search",
          isShow: true,
          permissions: {
            is: [[permissionsList[26]]],
            not: [[permissionsList[28]],[permissionsList[41]]],
          },
          personas: {
            isShipToUser: true,
          },
        },
        {
          name: "Update Billing Address",
          icon: "Xchange_Update Billing Address_icon.png",
          path: "/residential/my-profile/billing-address",
        },
        {
          name: "Notification Preferences",
          icon: "Xchange_Notifications Preferences_icon.png",
          path: "/residential/my-profile/notification-preferences",
        },
        {
          name: "Karastan Custom Rugs",
          icon: "Xchange_Notifications Preferences_icon.png",
          path: "https://ssoexternal.mohawkind.com/proxy/XUI/?realm=connector&ForceAuth=true&service=Azure_oidc&goto=https://www.made-to-orderstudio.com/sso/login/callback#login/details",
        },
      ],
    },
    SINGLE_ACCOUNT_CUSTOMER: {
      mohawkXchange: [
        {
          name: "Accounts",
          icon: "Xchange_Accounts_icon.png",
          path: "/residential/salesperson/view-accounts",
          isShow:
            this.storageService?.userInfo?.isSalesPerson &&
            !this.storageService?.userInfo?.orgUnit?.inHouseAccount,
        },
        {
          name: "Orders",
          icon: "Xchange_Orders_icon.png",
          path: "/residential/orders",
          /* queryParams: { page: 0, status: "OPEN" }, */
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
          name: "Today's Shipment",
          icon: "Xchange_Today’s Shipments_icon.png",
          path: "/residential/orders",
          queryParams: { page: 1 },
          isShow: true,
          permissions: {
            is: [
              [permissionsList[14]],
              [permissionsList[15]],
              [permissionsList[39]],
            ],
            not: [[permissionsList[28]]],
          },
        },
        {
          name: "Invoices",
          icon: "Xchange_Invoices_icon.png",
          path: "/residential/finance/invoices",
          isShow: true,
          permissions: {
            is: [[permissionsList[20]]],
            not: [[permissionsList[28]], [permissionsList[41]]],
          },
          personas: {
            isShipToUser: true,
          },
        },
        {
          name: "Credit Memos",
          icon: "Xchange_credit_memo_icon.svg",
          path: "/residential/finance/credit-memos",
          isShow: true,
          permissions: {
            is: [[permissionsList[20]]],
            not: [[permissionsList[28]], [permissionsList[41]]],
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
          name: "My Company",
          icon: "Xchange_My Company_icon.png",
          path: "/residential/company/manage-users",
        },
        {
          name: "Make a Payment",
          icon: "Xchange_Make a Payment_icon.png",
          path: "/residential/finance/payments/receivables",
          permissions: {
            is: [
              [permissionsList[24]],
              [permissionsList[31]],
              [permissionsList[38]],
            ],
            not: [
              [permissionsList[28]],
              [permissionsList[33]],
              [permissionsList[34]],
            ],
          },
          personas: {
            isShipToUser: false,
          },
        },
        {
          name: "Price search",
          icon: "Xchange_Price Search_icon.png",
          path: "/residential/pricing/price-search",
          isShow: true,
          permissions: {
            is: [[permissionsList[26]]],
            not: [[permissionsList[28]],[permissionsList[41]]],
          },
          personas: {
            isShipToUser: true,
          },
        },
        {
          name: "Update Billing Address",
          icon: "Xchange_Update Billing Address_icon.png",
          path: "/residential/my-profile/billing-address",
        },
        {
          name: "Notification Preferences",
          icon: "Xchange_Notifications Preferences_icon.png",
          path: "/residential/my-profile/notification-preferences",
        },
        {
          name: "Karastan Custom Rugs",
          icon: "Xchange_Notifications Preferences_icon.png",
          path: "https://ssoexternal.mohawkind.com/proxy/XUI/?realm=connector&ForceAuth=true&service=Azure_oidc&goto=https://www.made-to-orderstudio.com/sso/login/callback#login/details",
        },
      ],
    },
    SALESPERSON_NONIHOUSE: {
      mohawkXchange: [
        {
          name: "Accounts",
          icon: "Xchange_Accounts_icon.png",
          path: "/residential/salesperson/view-accounts",
          isShow:
            this.storageService?.userInfo?.isSalesPerson &&
            !this.storageService?.userInfo?.orgUnit?.inHouseAccount,
        },
        {
          name: "Orders",
          icon: "Xchange_Orders_icon.png",
          path: "/residential/orders",
          /* queryParams: { page: 0, status: "OPEN" }, */
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
          name: "Today's Shipment",
          icon: "Xchange_Today’s Shipments_icon.png",
          path: "/residential/orders",
          queryParams: { page: 1 },
          isShow: true,
          permissions: {
            is: [
              [permissionsList[14]],
              [permissionsList[15]],
              [permissionsList[39]],
            ],
            not: [[permissionsList[28]]],
          },
        },
        {
          name: "Invoices",
          icon: "Xchange_Invoices_icon.png",
          path: "/residential/finance/invoices",
          isShow: true,
          permissions: {
            is: [[permissionsList[20]]],
            not: [[permissionsList[28]], [permissionsList[41]]],
          },
          personas: {
            isShipToUser: true,
          },
        },
        {
          name: "Credit Memos",
          icon: "Xchange_credit_memo_icon.svg",
          path: "/residential/finance/credit-memos",
          isShow: true,
          permissions: {
            is: [[permissionsList[20]]],
            not: [[permissionsList[28]], [permissionsList[41]]],
          },
          personas: {
            isShipToUser: true,
          },
        },
        {
          name: "Claims Approval",
          icon: "a_claims-approval-circle.png",
          path: "/residential/claims/approval-list",
          isShow: true,
          count:"",
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
          name: "My Company",
          icon: "Xchange_My Company_icon.png",
          path: "/residential/company/manage-users",
        },
        {
          name: "Make a Payment",
          icon: "Xchange_Make a Payment_icon.png",
          path: "/residential/finance/payments/receivables",
          permissions: {
            is: [
              [permissionsList[24]],
              [permissionsList[31]],
              [permissionsList[38]],
            ],
            not: [
              [permissionsList[28]],
              [permissionsList[33]],
              [permissionsList[34]],
            ],
          },
          personas: {
            isShipToUser: false,
          },
        },
        {
          name: "Price search",
          icon: "Xchange_Price Search_icon.png",
          path: "/residential/pricing/price-search",
          isShow: true,
          permissions: {
            is: [[permissionsList[26]]],
            not: [[permissionsList[28]],[permissionsList[41]]],
          },
          personas: {
            isShipToUser: true,
          },
        },
        {
          name: "Update Billing Address",
          icon: "Xchange_Update Billing Address_icon.png",
          path: "/residential/my-profile/billing-address",
        },
        {
          name: "Notification Preferences",
          icon: "Xchange_Notifications Preferences_icon.png",
          path: "/residential/my-profile/notification-preferences",
        },
        {
          name: "Karastan Custom Rugs",
          icon: "Xchange_Notifications Preferences_icon.png",
          path: "https://ssoexternal.mohawkind.com/proxy/XUI/?realm=connector&ForceAuth=true&service=Azure_oidc&goto=https://www.made-to-orderstudio.com/sso/login/callback#login/details",
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
          /* queryParams: { page: 0, status: "OPEN" }, */
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
          name: "Credit Memos",
          icon: "Xchange_credit_memo_icon.svg",
          path: "/residential/finance/credit-memos",
          isShow: true,
          permissions: {
            is: [[permissionsList[20]]],
            not: [[permissionsList[28]], [permissionsList[41]]],
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
          permissions: {
            is: [[permissionsList[26]], [permissionsList[25]]],
            not: [[permissionsList[28]]],
          },
          personas: {
            isShipToUser: true,
          },
        },
        {
          name: "Karastan Custom Rugs",
          icon: "Xchange_Notifications Preferences_icon.png",
          path: "https://ssoexternal.mohawkind.com/proxy/XUI/?realm=connector&ForceAuth=true&service=Azure_oidc&goto=https://www.made-to-orderstudio.com/sso/login/callback#login/details",
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
          /* queryParams: { page: 0, status: "OPEN" }, */
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
          name: "Credit Memos",
          icon: "Xchange_credit_memo_icon.svg",
          path: "/residential/finance/credit-memos",
          isShow: true,
          permissions: {
            is: [[permissionsList[20]]],
            not: [[permissionsList[28]], [permissionsList[41]]],
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
        //   icon: "a_claims-approval-circle.png",
        //   path: "/residential/claims/approval-list",
        //   isShow: true,
        //   count:"",
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
          permissions: {
            is: [[permissionsList[26]], [permissionsList[25]]],
            not: [[permissionsList[28]]],
          },
          personas: {
            isShipToUser: true,
          },
        },
        {
          name: "Karastan Custom Rugs",
          icon: "Xchange_Notifications Preferences_icon.png",
          path: "https://ssoexternal.mohawkind.com/proxy/XUI/?realm=connector&ForceAuth=true&service=Azure_oidc&goto=https://www.made-to-orderstudio.com/sso/login/callback#login/details",
        },
      ],
    },
    Marketing:
    {
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
    }
  };
    this.commercialSiteSelectorService.resetSelectedSiteForStorage();
    /* TODO document why this method 'ngOnInit' is empty */
    // this.userService.currentUserDetails.next(null);
    // this.storageService.getItem("userInfo").subscribe((res) => {
    let res = this.storageService.userInfo;
    this.priceLabel = res?.priceLabel;
    this.checkRoles();
    this.productFeaturesList = [
      {
        name: "Open Product Orders",
        key: "open_orders",
        icon: "open-product-order",
        iconExt: ".svg",
        link: "/residential/orders",
        queryParams: { page: 0, status: "OPEN" },
        value: 0,
        isShow: true,
      },
      {
        name: "Today’s Shipment",
        key: "today_shipment",
        icon: "todays-shipment",
        iconExt: ".svg",
        link: "/residential/orders",
        queryParams: { page: 1 },
        value: 0,
        isShow: true,
      },
      {
        name: "Open Sample Orders",
        key: "sample_orders",
        icon: "open-sample-orders",
        iconExt: ".svg",
        link: "/residential/orders",
        queryParams: { page: 2, status: "OPEN" },
        value: 0,
        isShow: true,
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
        name: "Recent Invoices",
        key: "recent_invoices",
        icon: "active-quotes",
        iconExt: ".svg",
        link: "/residential/finance/invoices",
        value: 0,
        isShow: !(
          this.storageService?.userInfo?.orgUnit?.accountType === "ZMSH"
        ),
      },
      {
        name: "Current Reserves",
        key: "current_reserve",
        icon: "current-reserve",
        iconExt: ".svg",
        link: "/residential/orders/reserves",
        value: 0,
        isShow: !(
          this.storageService?.userInfo?.orgUnit?.accountType === "ZMSH"
        ),
      },
    ];
    // });
   
   setTimeout(() => {
    this.modalService.hide("homePageProgressModal");
    this.zone.run(() => {
      this.cdr.detectChanges();
    });
   }, 2000);
   
  }

  checkRoles() {
    this.userInfoSub = this.storageService.getItem("userInfo").subscribe((response: any) => {
       this.modalService.hide("homePageProgressModal");
      let userInfo = { ...response };
      let isMultiAccountCustomer = false;
      if (userInfo?.isCustomer) {
        const currentCompany = this.route.url.includes("commercial")
          ? "C"
          : "R";
        let filteredAccounts = userInfo?.accounts?.filter(
          (account: any) => account.company === currentCompany
        );
        if (filteredAccounts?.length > 1) {
          isMultiAccountCustomer = true;
        }
      }

      this.salesManRole = userInfo?.salesManRole;
      this.salesOps = userInfo?.isSalesOps;
      this.isSalesPerson = userInfo?.isSalesPerson;
      this.isCustomer = userInfo?.isCustomer;
      this.isCSR = userInfo?.isCSR;
      this.isALCBDM = userInfo?.isALCBDM;
      this.isResidentialManager = userInfo?.isResidentialManager;
      this.isMtMarketing = userInfo?.isMtMarketing;
      this.inHouseAccount = userInfo?.orgUnit?.inHouseAccount;
      this.orgAccountType = userInfo?.orgUnit?.accountType;
      this.isAccountTypeEmpty =
        this.orgAccountType == "" ||
        this.orgAccountType == undefined ||
        userInfo?.orgUnit?.uid == "EMPTY_B2BUNIT"
          ? true
          : false;
      this.isMultiAccCustomer = this.isCustomer && isMultiAccountCustomer;
      this.username = userInfo?.name;
      // ShipToOnly
      if (this.storageService?.userInfo?.orgUnit?.accountType === "ZMSH") {
        this.selectedDashboardData = this.dashboardData.SHIP_TO_ONLY;
      }
      // ALC_BDM scenarios
      else if (this.isALCBDM) {
        this.selectedDashboardData = { ...this.dashboardData.ALC_BDM };
      }
      // Residential Sales Manager scenarios
      else if (this.isResidentialManager) {
        this.selectedDashboardData = {
          ...this.dashboardData.Residential_Manager,
        };
      }
      // SalesPerson
      else if (
        this.isSalesPerson &&
        this.inHouseAccount &&
        (this.salesManRole == "TM" || this.salesManRole == "DM")
      ) {
        this.selectedDashboardData = { ...this.dashboardData.TM_DM };
      } else if (
        this.isSalesPerson &&
        this.inHouseAccount &&
        (this.salesManRole == "RVP" || this.salesManRole == "SVP")
      ) {
        this.selectedDashboardData = { ...this.dashboardData.SVP_RVP };
      } else if (this.isSalesPerson && !this.inHouseAccount) {
        this.selectedDashboardData = {
          ...this.dashboardData.SALESPERSON_NONIHOUSE,
        };
      }
      //salesOps
      else if (this.salesOps && this.isAccountTypeEmpty) {
        this.selectedDashboardData = { ...this.dashboardData.SALESOPS };
      } else if (this.salesOps && !this.isAccountTypeEmpty) {
        this.selectedDashboardData = {
          ...this.dashboardData.SINGLE_ACCOUNT_CUSTOMER,
        };
      }
      else if (this.isMtMarketing) {
        this.selectedDashboardData = {
          ...this.dashboardData.Marketing,
        };
      }
      //single account customer scenarios
      else if (this.isCustomer && !this.isMultiAccCustomer) {
        this.selectedDashboardData = {
          ...this.dashboardData.SINGLE_ACCOUNT_CUSTOMER,
        };
      }
      // Multi account customer scenarios
      else if (this.isCustomer && this.isMultiAccCustomer) {
        this.selectedDashboardData = {
          ...this.dashboardData.MULTI_ACCOUNT_CUSTOMER,
        };
      } else {
        this.selectedDashboardData = { ...this.dashboardData.CSR };
      }
      let makePaymentLink: any;
      if (this.selectedDashboardData?.quickLinks) {
        makePaymentLink = this.selectedDashboardData?.quickLinks.find(
          (item: any) => item.name == "Make a Payment"
        );
        if (
          !(
            userInfo?.userPermissions?.includes("Pay Bills") ||
            userInfo?.userPermissions?.includes("Receivables Inquiry") ||
            userInfo?.userPermissions?.includes("View Payment Group")
          ) &&
          makePaymentLink != undefined
        ) {
          this.selectedDashboardData.quickLinks =
            this.selectedDashboardData?.quickLinks.filter(
              (item: any) => item.name != "Make a Payment"
            );
        } else if (
          userInfo?.isCustomer &&
          (userInfo?.priceLabel == "USD" ||
            !userInfo?.orgUnit?.uid?.includes("8122")) &&
          !userInfo?.userPermissions?.includes("Pay Bills")
        ) {
          this.selectedDashboardData.quickLinks =
            this.selectedDashboardData?.quickLinks.filter(
              (item: any) => item.name != "Make a Payment"
            );
        } else if (
          !userInfo?.isCustomer &&
          (userInfo?.priceLabel == "USD" ||
            !userInfo?.orgUnit?.uid?.includes("8122"))
        ) {
          this.selectedDashboardData.quickLinks =
            this.selectedDashboardData?.quickLinks.filter(
              (item: any) => item.name != "Make a Payment"
            );
        } else {
          this.selectedDashboardData.quickLinks =
            this.selectedDashboardData?.quickLinks;
        }
      }

      this.selectedDashboardData?.mohawkXchange?.map((item: any) => {
        if (
          item.path !== "/residential/orders" &&
          !this.isSalesPerson &&
          item.name !== "Accounts" &&
          item.name !== "Claims" &&
          item.name != "Today's Shipment" &&
          item.name != "Invoices"
        ) {
          item.isShow = !(userInfo?.orgUnit?.accountType === "ZMSH");
        } else if (this.isSalesPerson) {
          if (item.name == "Accounts") {
            item.isShow = true;
            item.path = "/residential/salesperson/view-accounts";
          }
        } else if (this.isCustomer && this.isMultiAccCustomer) {
          if (item.name == "Accounts") {
            item.isShow = true;
            // this.exitClick();
            item.path = "/residential/account/multi-account";
          }
        } else if (this.isCustomer && item.name == "Accounts") {
          item.isShow = false;
        }
        if (this.salesOps) {
          if (item.name == "Accounts") {
            item.isShow = true;
            item.path = "/residential/salesperson/view-accounts";
          }
        }
      });
      this.shouldShow();
      this.validatePermissonsPesonas();
      if (this.isSalesPerson)
      this.updateClaimApprovalCount();
    },(err)=>{
      this.modalService.hide("homePageProgressModal");
    });
///modal 
let messageRoleKey: string = 'CSR';
if (this.storageService?.userInfo?.orgUnit?.accountType === "ZMSH") {
  messageRoleKey = 'SHIP_TO_ONLY';
} else if (this.isALCBDM) {
  messageRoleKey = 'ALC_BDM';
} else if (this.isResidentialManager) {

  
  messageRoleKey = 'Residential_Manager';
} else if (
  this.isSalesPerson &&
  this.inHouseAccount &&
  (this.salesManRole === 'TM' || this.salesManRole === 'DM')
) {
  messageRoleKey = 'TM_DM';
} else if (
  this.isSalesPerson &&
  this.inHouseAccount &&
  (this.salesManRole === 'RVP' || this.salesManRole === 'SVP')
) {
  messageRoleKey = 'SVP_RVP';
} else if (this.isSalesPerson && !this.inHouseAccount) {
  messageRoleKey = 'SALESPERSON_NONIHOUSE';
} else if (this.salesOps && this.isAccountTypeEmpty) {
  messageRoleKey = 'SALESOPS';
} else if (
  (this.salesOps && !this.isAccountTypeEmpty) ||
  (this.isCustomer && !this.isMultiAccCustomer)
) {
  messageRoleKey = 'SINGLE_ACCOUNT_CUSTOMER';
} else if (this.isCustomer && this.isMultiAccCustomer) {
  messageRoleKey = 'MULTI_ACCOUNT_CUSTOMER';
}
const messageConstants = MESSAGE_CONSTANTS.LandingPage[messageRoleKey] || {
  headerText: 'Welcome',
  bodyText: 'Welcome to Mohawk Xchange!',
  barText: 'Loading...'
};

this.openProgressModal({
  modalHeaderText: messageConstants?.headerText,
  progressText: messageConstants?.bodyText,
  progressBarText: messageConstants?.barText
});

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
        (err: any) => { this.modalService.hide("homePageProgressModal");}  
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
      this.selectedDashboardData[menu]?.map((item: any) => {
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
    let canAccess = false;
    for (let permissionGroup of node.permissions.is) {
      let passesAllPermissionsInAGroup = true;
      if (permissionGroup === undefined) return true;
      for (let permission of permissionGroup) {
        if (!userPermissions?.includes(permission)) {
          passesAllPermissionsInAGroup = false;
          // break;
        }
      }
      if (passesAllPermissionsInAGroup) {
        canAccess = true;
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
  shouldShow() {
    if (this.isSalesPerson && this.salesOps) {
      this.show = true;
    } else if (this.isSalesPerson && this.salesManRole === undefined) {
      this.show = true;
    }
  
  }

  onSearchTextEntered(searchValue: any) {
    if (searchValue?.type == "residentialNewOrder") {
      this.route.navigate(["/residential/products"], {
        queryParams: { search: searchValue?.searchText },
      });
    } else if (searchValue?.type == "residentialOrder") {
      this.route.navigate(["/residential/orders"], {
        queryParams: { page: 0, searchText: searchValue?.searchText },
      });
    } else if (searchValue?.type == "residentialInvoices") {
      this.route.navigate(["/residential/finance/invoices"], {
        queryParams: { searchText: searchValue?.searchText },
      });
    }
  }

  //bool for setting product manager dashboard
  isProductManager!: boolean;
  @ViewChild("salesTabs", { static: false }) salesTabs?: TabsetComponent;

  selectTab(tabId: any) {
    // this.salesTabs.tabs[tabId].active = tabId==0;
    let allTabs: any = this.salesTabs;
    if (tabId == 1 || tabId == 2) {
      setTimeout(() => {
        allTabs.tabs[tabId].active = false;
        allTabs.tabs[0].active = true;
      }, 0);
      let aTag = document.createElement("a");
      aTag.href = "https://mohawktoday.com/";
      aTag.target = "_blank";
      aTag.click();
      aTag.remove();
    }
  }

  ngOnDestroy(): void {
    if(this.userInfoSub){
      this.userInfoSub.unsubscribe();
    }
  }
  checkUserTypePermissions(node: any){
    if (
      (node.name === "Make a Payment") &&
      this.storageService?.userInfo?.isCustomer &&
      (this.storageService?.userInfo?.priceLabel == "USD" ||
        !this.storageService?.userInfo?.orgUnit?.uid.includes("8122")) &&
      !this.storageService?.userInfo?.userPermissions.includes("Pay Bills")
    ) {
      return false;
    }
    else if (
      node.name === "Make a Payment" &&
      !this.storageService?.userInfo?.isCustomer &&
      (this.storageService?.userInfo?.priceLabel == "USD" ||
        !this.storageService?.userInfo?.orgUnit?.uid.includes("8122"))
    ) {
      return false;
    }
    else {
      return true;
    }
  }
  openProgressModal(data = {}, size: any = "md", modalId = "homePageProgressModal") {
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
