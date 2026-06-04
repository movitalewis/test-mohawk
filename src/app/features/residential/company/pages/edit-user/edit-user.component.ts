import {
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChildren,
  ViewChild,
  HostListener,
  AfterViewInit,
} from "@angular/core";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import { ManagementService } from "../../services/management.service";
import { Router, ActivatedRoute } from "@angular/router";
import { User } from "src/app/features/shared/interfaces/company-user.interface";
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";

import { ConfirmedValidator } from "../../../../shared/form-control-components/confirmed.validator";
import { toArray } from "rxjs";
import { TabHeadingDirective } from "ngx-bootstrap/tabs";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { ConfirmationDialogComponent } from "src/app/features/shared/components/confirmation-dialog/confirmation-dialog.component";
import { StorageService } from "src/app/features/http-services/storage.service";
@Component({
    selector: "app-edit-user",
    templateUrl: "./edit-user.component.html",
    styleUrls: ["./edit-user.component.scss"],
    standalone: false
})
export class EditUserComponent implements OnInit {
  showEntireSiteTooltip = false;
  searchaccount: any;
  breadcrumbItems: BreadcrumbItems = [
    {
      name: "Home",
      path: "/residential",
      active: false,
    },

    {
      name: "My Company",
      path: "/residential/company/manage-users",
      active: false,
    },
    {
      name: "Manage Users",
      path: "/residential/company/manage-users",
      active: false,
    },
    {
      name: "",
      path: "",
      active: false,
    },
    {
      name: "Edit",
      path: "/",
      active: true,
    },
  ];
  // @ViewChildren("")
  loading: boolean = false;
  entireSiteNotifyAll: boolean = false;
  hasShipToAccount: boolean = false;
  isUSCustomer: any;
  isZMSHAccountSelected: boolean = false;
  entireSiteDisable:boolean = false;
  ordersNotifyAll: boolean = false;
  claimsNotifyAll: boolean = false;
  quotesNotifyAll: boolean = false;
  reservesNotifyAll: boolean = false;
  financeNotifyAll: boolean = false;
  adminPermitAll: boolean = false;
  finacialPermitAll: boolean = false;
  customRugPermitAll: boolean = false;
  pricingPermitAll: boolean = false;
  productPermitAll: boolean = false;
  mohawkPermitAll: boolean = false;
  samplePermitAll: boolean = false;
  claimsPermitAll: boolean = false;
  isDisabled: boolean = true;
  userNumber: any = "";
  storeNumber: any = "";
  userId: any;
  userDetails: any;
  isUserCSR: boolean = false;

  @ViewChild("scrollToTop", { read: ElementRef }) scrollToTop: any;
  hasMohawkEmail: boolean = false;
  hasEmptyResponse: boolean = false;
  constructor(
    private fb: FormBuilder,
    private service: ManagementService,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    public modalService: BsModalService,
    public storageService: StorageService
  ) {}
  editUserForm!: FormGroup;
  count = 0;
  selectAllValues: boolean = false;
  primaryRole: any = "";
  titles: any = [
    { value: "mr", name: "Mr." },
    { value: "mrs", name: "Mrs." },
    { value: "dr", name: "Dr." },
    { value: "rev", name: "Rev." },
    { value: "miss", name: "Miss" },
    { value: "ms", name: "Ms." },
  ];
  roles: any = [
    { value: "accountgroup", name: "Accounts Payable / Receivable" },
    { value: "managergroup", name: "Manager" },
    { value: "marketinggroup", name: "Marketing" },
    { value: "operationsgroup", name: "Operations" },
    { value: "ownergroup", name: "Owner" },
    { value: "purchaseinggroup", name: "Purchasing" },
    { value: "salesassociategroup", name: "Sales Associate" },
    { value: "specifiergroup", name: "Specifier/Estimator" },
  ];
  languages: any = ["English"];
  notifications: any = {
    order: {
      columns: [
        {
          key: "orderNotification",
          title: "ORDER NOTIFICATIONS",
          checked: false,
          value: "allOrders",
        },
      ],
      rows: [
        {
          checked: false,
          orderNotification: "Order Confirmation",
          value: "emailOrderNotificationEnabled",
          key: "orderConfirmation",
        },
        {
          checked: false,
          orderNotification: "Planned Arrival & Delivery/Pick-Up Update",
          value: "emailDeliveryPickupNotificationEnabled",
          key: "plannedArrivalAndDeliveryOrPickUpUpdate",
        },
        {
          checked: false,
          orderNotification: "Load Leaves the Mill to Shipping Warehouse",
          value: "emailLoadLeavesNotificationEnabled",
          key: "loadLeavesTheMillToShippingWarehouse",
        },
        {
          checked: false,
          orderNotification: "Load Arrives at the Shipping Warehouse",
          value: "emailLoadArrivesNotificationEnabled",
          key: "loadArrivesAtTheShippingWarehouse",
        },
        {
          checked: false,
          orderNotification: "Out for Delivery",
          value: "emailOutForDeliveryNotificationEnabled",
          key: "outForDelivery",
        },
        {
          checked: false,
          orderNotification: "Sign me up for any pricing announcements",
          value: "emailPaymentConfirmNotificationEnabled",
          key: "signMeUpForAnyPricingAnnouncements",
        },
        {
          checked: false,
          orderNotification: "Advance Ship Notification",
          value: "emailAdvanceShipNotificationEnabled",
          key: "advanceShipNotification",
        },
        {
          checked: false,
          orderNotification: "Daily Status Report - All Orders",
          value: "emailOrderUpdatesNotificationEnabled",
          key: "orderUpdates",
        },
      ],
    },
    // quote: {
    //   columns: [
    //     {
    //       key: "quoteNotification",
    //       title: "QUOTE NOTIFICATIONS",
    //       checked: false,
    //       value: "allQuotes",
    //     },
    //   ],
    //   rows: [
    //     {
    //       checked: false,
    //       quoteNotification: "Quote Submitted / Offered",
    //       value: "emailQuoteConfirmationNotificationEnabled",
    //     },
    //     {
    //       checked: false,
    //       quoteNotification: "Quote Cancelled",
    //       value: "emailQuoteCancelledNotificationEnabled",
    //     },
    //     {
    //       checked: false,
    //       quoteNotification: "Quote Expiry",
    //       value: "emailQuoteExpiryNotificationEnabled",
    //     },
    //   ],
    // },
    claims: {
      columns: [
        {
          key: "claimsNotification",
          title: "CLAIMS NOTIFICATIONS",
          checked: false,
          value: "allClaims",
        },
      ],
      rows: [
        {
          checked: false,
          claimsNotification: "New Claims Confirmation",
          value: "emailClaimConfirmNotificationEnabled",
        },
        {
          checked: false,
          claimsNotification: "Claim Status Update",
          value: "emailClaimStatusNotificationEnabled",
        },
        {
          checked: false,
          claimsNotification: "Customer Action Required",
          value: "emailCustActionNotificationEnabled",
        },
        {
          checked: false,
          claimsNotification: "Claims Process Complete",
          value: "emailClaimProcessNotificationEnabled",
        },
        {
          checked: false,
          claimsNotification: "Draft Claims Expiry",
          value: "emailClaimExpiryNotificationEnabled",
        },
        {
          checked: false,
          claimsNotification: "Return Authorization",
          value: "emailReturnAuthNotificationEnabled",
        },
        {
          checked: false,
          claimsNotification: "Claim Comments",
          value: "emailClaimCommentsNotificationEnabled",
        },
      ],
    },
    financial: {
      columns: [
        {
          key: "financialNotification",
          title: "FINANCIAL NOTIFICATIONS",
          checked: false,
        },
      ],
      rows: [
        {
          checked: false,
          financialNotification: "New Invoices (PDF via email)",
          value: "emailNewInvoiceNotificationEnabled",
          // disabled:
          //   this.storageService.userInfo?.orgUnit?.paybillFlag == "EMPTY" ||
          //   this.storageService.userInfo?.orgUnit?.paybillFlag == "Y",
        },
        {
          checked: false,
          financialNotification: "Payment Schedule Confirmation",
          value: "emailPaymentConfirmNotificationEnabled",
        },
      ],
    },
    reserve: {
      columns: [
        {
          key: "reserveNotification",
          title: "RESERVE NOTIFICATIONS",
          checked: false,
          value: "allReserves",
        },
      ],
      rows: [
        {
          checked: false,
          reserveNotification: "Reserve is about to Expire",
          value: "emailReserveExpireNotificationEnabled",
        },
      ],
    },
  };

  notificationData = {
    allClaims: false,
    allOrders: false,
    allQuotes: false,
    allReserves: false,
    allFinance: false,
    emailAdvanceShipNotificationEnabled: false,
    emailClaimConfirmNotificationEnabled: false,
    emailClaimProcessNotificationEnabled: false,
    emailClaimStatusNotificationEnabled: false,
    emailCustActionNotificationEnabled: false,
    emailDeliveryPickupNotificationEnabled: false,
    emailLoadArrivesNotificationEnabled: false,
    emailLoadLeavesNotificationEnabled: false,
    emailNewInvoiceNotificationEnabled: false,
    emailOrderNotificationEnabled: false,
    emailOrderUpdatesNotificationEnabled: false,
    emailOutForDeliveryNotificationEnabled: false,
    emailPaymentConfirmNotificationEnabled: false,
    emailQuoteCancelledNotificationEnabled: false,
    emailQuoteConfirmationNotificationEnabled: false,
    emailQuoteExpiryNotificationEnabled: false,
    emailReserveExpireNotificationEnabled: false,
    faxAdvanceShipNotificationEnabled: false,
    faxClaimConfirmNotificationEnabled: false,
    faxClaimProcessNotificationEnabled: false,
    faxClaimStatusNotificationEnabled: false,
    faxCustActionNotificationEnabled: false,
    faxDeliveryPickupNotificationEnabled: false,
    faxLoadArrivesNotificationEnabled: false,
    faxLoadLeavesNotificationEnabled: false,
    faxNewInvoiceNotificationEnabled: false,
    faxOrderNotificationEnabled: false,
    faxOrderUpdatesNotificationEnabled: false,
    faxOutForDeliveryNotificationEnabled: false,
    faxPaymentConfirmNotificationEnabled: false,
    faxQuoteCancelledNotificationEnabled: false,
    faxQuoteConfirmationNotificationEnabled: false,
    faxQuoteExpiryNotificationEnabled: false,
    faxReserveExpireNotificationEnabled: false,
    salesforceClaimConfirmNotificationEnabled: false,
    salesforceClaimProcessNotificationEnabled: false,
    salesforceClaimStatusNotificationEnabled: false,
    salesforceDeliveryPickupNotificationEnabled: false,
    salesforceLoadArrivesNotificationEnabled: false,
    salesforceLoadLeavesNotificationEnabled: false,
    salesforceOrderNotificationEnabled: false,
    salesforceOrderUpdatesNotificationEnabled: false,
    salesforceOutForDeliveryNotificationEnabled: false,
    salesforceQuoteCancelledNotificationEnabled: false,
    salesforceQuoteConfirmationNotificationEnabled: false,
    salesforceQuoteExpiryNotificationEnabled: false,
    salesforceReserveExpireNotificationEnabled: false,
    textAdvanceShipNotificationEnabled: false,
    textClaimConfirmNotificationEnabled: false,
    textClaimProcessNotificationEnabled: false,
    textClaimStatusNotificationEnabled: false,
    textCustActionNotificationEnabled: false,
    textDeliveryPickupNotificationEnabled: false,
    textLoadArrivesNotificationEnabled: false,
    textLoadLeavesNotificationEnabled: false,
    textNewInvoiceNotificationEnabled: false,
    textOrderNotificationEnabled: false,
    textOrderUpdatesNotificationEnabled: false,
    textOutForDeliveryNotificationEnabled: false,
    textPaymentConfirmNotificationEnabled: false,
    textQuoteCancelledNotificationEnabled: false,
    textQuoteConfirmationNotificationEnabled: false,
    textQuoteExpiryNotificationEnabled: false,
    textReserveExpireNotificationEnabled: false,
    emailClaimExpiryNotificationEnabled: false,
    faxClaimExpiryNotificationEnabled: false,
    textClaimExpiryNotificationEnabled: false,
    emailReturnAuthNotificationEnabled: false,
    faxReturnAuthNotificationEnabled: false,
    textReturnAuthNotificationEnabled: false,
    emailClaimCommentsNotificationEnabled: false,
  };
productOrderManagementDisable = false;
  permissions: any = {
    websiteSecurityAdmin: {
      columns: [
        {
          key: "title",
          title: "WEBSITE SECURITY ADMIN",
          checked: false,
        },
      ],
      rows: [
        {
          checked: false,
          title: "Administrator",
          value: "b2badmingroup",
        },
      ],
    },
    financials: {
      columns: [{ key: "title", title: "FINANCIALS", checked: false }],
      rows: [
        {
          checked: false,
          title: "Invoice Inquiry",
          value: "invoiceInquiryGroup",
        },
        {
          checked: false,
          title: "Receivables Inquiry",
          value: "receivablesInquiryGroup",
        },
        {
          checked: false,
          title: "Pay Bills",
          value: "payBillsGroup",
        },
        {
          checked: false,
          title: "Bank Account Setup",
          value: "bankAccountSetupGroup",
          // disabled: this.storageService.userInfo?.priceLabel === 'USD',
        },
        // {
        //   checked: false,
        //   title: "Earning Statements",
        //   value: "earningStatementsGroup",
        // },
        {
          checked: false,
          title: "Account Statements",
          value: "accountStatementsGroup",
        },
        {
          checked: false,
          title: "Recent Payments",
          value: "viewPaymentsGroup",
        },
      ],
    },
    customRugProgram: {
      columns: [
        {
          key: "title",
          title: "CUSTOM RUG PROGRAM",
          checked: false,
        },
      ],
      rows: [
        {
          checked: false,
          title: "Custom Rug Quote",
          value: "customRugQuoteGroup",
        },
        {
          checked: false,
          title: "Custom Rug Order Entry",
          value: "customRugOrderEntryGroup",
        },
      ],
    },
    pricing: {
      columns: [{ key: "title", title: "PRICING", checked: false }],
      rows: [
        {
          checked: false,
          title: "Pricing Visibility & Inquiry",
          value: "pricingVisibilityAndInquiryGroup",
        },
        {
          checked: false,
          title: "Pricing Download",
          value: "pricingDownloadGroup",
        },
        // {
        //   checked: false,
        //   title: "Pricing Download Setup",
        //   value: "pricingDownloadSetupGroup",
        // },
      ],
    },
    productOrderManagement: {
      columns: [
        {
          key: "title",
          title: "PRODUCT ORDER MANAGEMENT",
          checked: false,
        },
      ],
      rows: [
        {
          checked: false,
          title: "Existing Order Inquiry",
          value: "existingOrderInquiryGroup",
        },
        {
          checked: false,
          title: "Check Product Availability",
          value: "checkProductAvailabilityGroup",
        },
        {
          checked: false,
          title: "View, Create, Extend & Delete Reserves",
          value: "changeReservesGroup",
        },
        {
          checked: false,
          title: "Product Order Entry (Create, Edit & Cancel)",
          value: "changeProductOrderEntryGroup",
        },
        {
          checked: false,
          title: "Special Goods",
          value: "specialGoodsGroup",
        },
      ],
    },
    mohawkToday: {
      columns: [{ key: "title", title: "MOHAWK TODAY", checked: false }],
      rows: [
        {
          checked: false,
          title: "Co-op",
          value: "coopGroup",
        },
        {
          checked: false,
          title: "Manage Leads & Lead Center",
          value: "manageLeadsAndLeadCenterGroup",
        },
        {
          checked: false,
          title: "Retail Storefront Locator",
          value: "retailStorefrontLocatorGroup",
        },
        {
          checked: false,
          title: "Mohawk Infinite Rewards",
          value: "mohawkInfiniteRewardsGroup",
        },
        {
          checked: false,
          title: "Promotions",
          value: "promotionsGroup",
        },
      ],
    },
    sampleOrderManagement: {
      columns: [
        {
          key: "title",
          title: "SAMPLE ORDER MANAGEMENT",
          checked: false,
        },
      ],
      rows: [
        {
          checked: false,
          title: "Existing Sample Order Inquiry",
          value: "existingSampleOrderInquiryGroup",
        },
        {
          checked: false,
          title: "Sample Order Entry",
          value: "sampleOrderEntryGroup",
        },
      ],
    },
    claimsManagement: {
      columns: [{ key: "title", title: "CLAIMS MANAGEMENT", checked: false }],
      rows: [
        {
          checked: false,
          title: "Claims Entry",
          value: "claimsEntryGroup",
        },
        {
          checked: false,
          title: "Existing Claims Inquiry",
          value: "existingClaimsInquiryGroup",
        },
      ],
    },
  };
  public data: any = [];
  public existingEmail: any = [];
  public emailExists: string = "";
  public accountsList: any = [];
  public selectedSuffixAccounts: any = [];
  public suffixList: any = [];
  alertData: any = {
    message: "success",
  };
  alertType: any = "success";
  alertTrigger: any = false;
  defaultAccountsList: any = [];

  permissionsData: Set<string> = new Set<string>();
  ngOnInit(): void {
    this.permissions = {
    websiteSecurityAdmin: {
      columns: [
        {
          key: "title",
          title: "WEBSITE SECURITY ADMIN",
          checked: false,
        },
      ],
      rows: [
        {
          checked: false,
          title: "Administrator",
          value: "b2badmingroup",
        },
      ],
    },
    financials: {
      columns: [{ key: "title", title: "FINANCIALS", checked: false }],
      rows: [
        {
          checked: false,
          title: "Invoice Inquiry",
          value: "invoiceInquiryGroup",
        },
        {
          checked: false,
          title: "Receivables Inquiry",
          value: "receivablesInquiryGroup",
        },
        {
          checked: false,
          title: "Pay Bills",
          value: "payBillsGroup",
        },
        {
          checked: false,
          title: "Bank Account Setup",
          value: "bankAccountSetupGroup",
          disabled: this.storageService.userInfo?.priceLabel === 'USD',
        },
        // {
        //   checked: false,
        //   title: "Earning Statements",
        //   value: "earningStatementsGroup",
        // },
        {
          checked: false,
          title: "Account Statements",
          value: "accountStatementsGroup",
        },
        {
          checked: false,
          title: "Recent Payments",
          value: "viewPaymentsGroup",
        },
      ],
    },
    customRugProgram: {
      columns: [
        {
          key: "title",
          title: "CUSTOM RUG PROGRAM",
          checked: false,
        },
      ],
      rows: [
        {
          checked: false,
          title: "Custom Rug Quote",
          value: "customRugQuoteGroup",
        },
        {
          checked: false,
          title: "Custom Rug Order Entry",
          value: "customRugOrderEntryGroup",
        },
      ],
    },
    pricing: {
      columns: [{ key: "title", title: "PRICING", checked: false }],
      rows: [
        {
          checked: false,
          title: "Pricing Visibility & Inquiry",
          value: "pricingVisibilityAndInquiryGroup",
        },
        {
          checked: false,
          title: "Pricing Download",
          value: "pricingDownloadGroup",
        },
        // {
        //   checked: false,
        //   title: "Pricing Download Setup",
        //   value: "pricingDownloadSetupGroup",
        // },
      ],
    },
    productOrderManagement: {
      columns: [
        {
          key: "title",
          title: "PRODUCT ORDER MANAGEMENT",
          checked: false,
        },
      ],
      rows: [
        {
          checked: false,
          title: "Existing Order Inquiry",
          value: "existingOrderInquiryGroup",
        },
        {
          checked: false,
          title: "Check Product Availability",
          value: "checkProductAvailabilityGroup",
        },
        {
          checked: false,
          title: "View, Create, Extend & Delete Reserves",
          value: "changeReservesGroup",
        },
        {
          checked: false,
          title: "Product Order Entry (Create, Edit & Cancel)",
          value: "changeProductOrderEntryGroup",
        },
        {
          checked: false,
          title: "Special Goods",
          value: "specialGoodsGroup",
        },
      ],
    },
    mohawkToday: {
      columns: [{ key: "title", title: "MOHAWK TODAY", checked: false }],
      rows: [
        {
          checked: false,
          title: "Co-op",
          value: "coopGroup",
        },
        {
          checked: false,
          title: "Manage Leads & Lead Center",
          value: "manageLeadsAndLeadCenterGroup",
        },
        {
          checked: false,
          title: "Retail Storefront Locator",
          value: "retailStorefrontLocatorGroup",
        },
        {
          checked: false,
          title: "Mohawk Infinite Rewards",
          value: "mohawkInfiniteRewardsGroup",
        },
        {
          checked: false,
          title: "Promotions",
          value: "promotionsGroup",
        },
      ],
    },
    sampleOrderManagement: {
      columns: [
        {
          key: "title",
          title: "SAMPLE ORDER MANAGEMENT",
          checked: false,
        },
      ],
      rows: [
        {
          checked: false,
          title: "Existing Sample Order Inquiry",
          value: "existingSampleOrderInquiryGroup",
        },
        {
          checked: false,
          title: "Sample Order Entry",
          value: "sampleOrderEntryGroup",
        },
      ],
    },
    claimsManagement: {
      columns: [{ key: "title", title: "CLAIMS MANAGEMENT", checked: false }],
      rows: [
        {
          checked: false,
          title: "Claims Entry",
          value: "claimsEntryGroup",
        },
        {
          checked: false,
          title: "Existing Claims Inquiry",
          value: "existingClaimsInquiryGroup",
        },
      ],
    },
  };
    this.isUSCustomer = this.storageService.userInfo?.priceLabel === 'USD';
    this.service.progressShow('userDetail')
    this.isUserCSR = this.userService.isCSR.getValue();
    this.userId = this.route.snapshot.paramMap.get("id");
    if(this.storageService.userInfo.isCSR){
      this.permissions.productOrderManagement.rows.push({
          checked: false,
          title: "Restrict Place Order",
          value: "restrictPlaceOrderGroup",
        });
    }
    this.service.getAccountList().subscribe((res) => {
      this.accountsList = res.body.filter(
        (accounts: any) => accounts.company === "C"
      );
      this.defaultAccountsList = this.accountsList;
    });
   
    this.service.updateUserDisplay(this.userId).subscribe((res) => {
     this.service.progressHide()
      this.userDetails = res.body;
      this.userDetails.workPhone = this.userDetails.workPhone ? this.userDetails.workPhone.replace(/[^0-9]/g, '') : this.userDetails.workPhone;
      this.userDetails.mobilePhone =  this.userDetails.mobilePhone ? this.userDetails.mobilePhone.replace(/[^0-9]/g, '') : this.userDetails.mobilePhone;
      this.notificationData = this.userDetails?.notificationData;
      // this.suffixList = this.userDetails?.selectedAccountList;
      this.breadcrumbItems[this.breadcrumbItems.length - 2].name = this.userId;
      this.formDataBind();
      this.checkForShipTo();
      this.checkForDisableState();
    }, () => {  this.service.progressHide() });
    this.formVaildation();
  }

  formVaildation() {
    this.editUserForm = this.fb.group(
      {
        title: null,
        firstName: [
          "",
          [Validators.required, Validators.pattern(/^[a-zA-Z0-9 -]*$/)],
          ],
        lastName: [
          "",
          [Validators.required, Validators.pattern(/^[a-zA-Z0-9 -()]*$/)],
        ],
        email: [{ value: "", disabled: true }, [Validators.required]],
        workPhone: ["", [
          Validators.required
        ]],
        extension: ["", [Validators.pattern("^(0|[1-9][0-9]*)$")]],
        mobilePhone: ["",[]],
        // fax: ["", [Validators.pattern("^(0|[1-9][0-9]*)$")]],
        language: null,
        primaryRole: [null, [Validators.required]],
        accountList: null,
        SuffixAccounts: null,
        selectedSuffixAccounts: [null],
      },
      { validator: ConfirmedValidator("password", "confirmPassword") }
    );

    this.setLangDefault();
  }

  formDataBind() {
    this.editUserForm
      .get("title")
      ?.setValue(
        this.userDetails?.titleCode &&
          this.userDetails?.titleCode.charAt(0).toUpperCase() +
            this.userDetails?.titleCode.slice(1) +
            "."
      );
    this.editUserForm.get("firstName")?.setValue(this.userDetails?.firstName);
    this.editUserForm.get("lastName")?.setValue(this.userDetails?.lastName);
    this.editUserForm.get("email")?.setValue(this.userDetails?.email);
    this.editUserForm.get("workPhone")?.setValue(this.userDetails?.workPhone);
    this.editUserForm.get("extension")?.setValue(this.userDetails?.extension);
    this.editUserForm
      .get("mobilePhone")
      ?.setValue(this.userDetails?.mobilePhone);
    // this.editUserForm.get("fax")?.setValue(this.userDetails?.fax);
    this.editUserForm
      .get("primaryRole")
      ?.setValue(this.convertPrimaryRole(this.userDetails?.primaryRole));
    this.primaryRole = this.convertPrimaryRole(this.userDetails?.primaryRole);
    if (this.userDetails.userPermissions) {
      if (
        this.userDetails?.userPermissions.find(
          (item: any) => item === "B2B Admin Group"
        )
      ) {
        this.permissions.websiteSecurityAdmin.columns[0].checked = true;
        this.permissions.websiteSecurityAdmin.rows[0].checked = true;
      }
      if (
        this.userDetails?.userPermissions.find((item: any) => item === "Coop")
      ) {
        this.permissions.mohawkToday.rows[0].checked = true;
      }
      if (
        this.userDetails?.userPermissions.find(
          (item: any) => item === "View Payment Group"
        ) && this.permissions.financials.rows?.length > 5
      ) {
        const index = this.permissions.financials.rows.findIndex((res: any) => res.value === "viewPaymentsGroup");

        this.permissions.financials.rows[index] = {...this.permissions.financials.rows[index],...{checked:true}};
      }
    }

    for (const property in this.permissions) {
      this.permissions[property]?.rows.map((res: any) => {
        if (
          this.userDetails?.userPermissions &&
          this.userDetails?.userPermissions.indexOf(res.title) > -1
        ) {
          res.checked = true;
          if (
            this.userDetails.userPermissions.find(
              (item: any) => item === "B2B Admin Group"
            )
          ) {
            this.permissionsData.add("Administrator" + "~" + res.value);
          } else if (
            this.userDetails.userPermissions.find(
              (item: any) => item === "View Payment Group"
            )
          ) {
            this.permissionsData.add("Recent Payments" + "~" + res.value);
          } else if (
            this.userDetails.userPermissions.find(
              (item: any) => item === "Coop"
            )
          ) {
            this.permissionsData.add("Co-op" + "~" + res.value);
          } else {
            this.permissionsData.add(res.title + "~" + res.value);
          }
        }
      });
    }

    for (const property in this.notifications) {
      this.notifications[property]?.rows.map((res: any) => {
        if (
          res?.value &&
          this.userDetails?.notificationData &&
          this.userDetails?.notificationData[res.value] == true
        ) {
          res.checked = true;
        }
      });
    }
    if (this.userDetails?.selectedAccountList) {
      this.userDetails?.selectedAccountList.map((account: any) => {
        if (account.accountNumber !== " ") {
          this.selectedSuffixAccounts.push(account);
        }
      });
    }

    this.handlePermissionsPreCheck();
  }

  setLangDefault() {
    this.editUserForm.patchValue({ language: this.languages[0] });
  }

  public getUsers(formValues: any) {
    this.service.getCustomerList().subscribe((res: any) => {
      this.data = res.body?.users;
      let useremails = this.data?.map((user: any) => user.email);
      if (useremails != undefined)
        this.existingEmail = useremails?.filter(
          (a: any) => a == this.emailExists
        );
    });
  }

  checkForMhkEmail(e: any) {
    let val = e.target.value;
    this.hasMohawkEmail = val.includes("mohawkind.com");
  }
  onParentChecked(e: any) {
    const isChecked = e.target.checked;
    for (const property in this.permissions) {
      this.permissions[property].columns[0].checked = isChecked;
      this.permissions[property]?.rows?.map((res: any) => {
        if (isChecked) {
          this.permissionsData.add(
            this.permissions[property].columns[0].title + "~" + res.value
          );
        } else {
          this.permissionsData.clear();
        }
        if(res.value !== "restrictPlaceOrderGroup"){
        res.checked = isChecked;
        }
        return res.value;
      });
    }
    this.handlePermissionsPreCheck();
  }

  convertPrimaryRole(val: string) {
    let convertedRole = "";
    const current = this.roles.find((role: any) => val === role.name);
    convertedRole = current?.value || '';
    return convertedRole;
  }

  onSubmit(formValues: any) {
    this.service.progressShow('updateUser')
    const selectedPermissions: string[] = [];
    for (let key in this.permissions) {
      this.permissions[key].rows.forEach((item: any) => {
        if (item.checked == true) {
          selectedPermissions.push(item.value);
        }
        if(item.checked == true && item.value === 'restrictPlaceOrderGroup'){
          selectedPermissions.push(this.permissions[key].rows[0].value);
          selectedPermissions.push(this.permissions[key].rows[1].value);
          selectedPermissions.push(this.permissions[key].rows[2].value);  
          selectedPermissions.push(this.permissions[key].rows[3].value);
        }
      });
    }
    let accountList: any = [];
    this.selectedSuffixAccounts.map((account: any) => {
      accountList.push(account?.uid);
    });

    const updatedUser: User = {
      accountList: accountList.join(","),
      active: true,
      confirmPassword: formValues.confirmPassword,
      displayUid: this.userDetails?.email.toLowerCase(),
      email: this.userDetails?.email.toLowerCase(),
      extension: formValues.extension,
      fax: "",
      firstName: formValues.firstName,
      jobTitle: "",
      lastName: formValues.lastName,
      mobilePhone: this.getPhoneNumber(formValues.mobilePhone),
      notificationData: this.notificationData,
      password: formValues.password,
      primaryRole: formValues.primaryRole,
      selectedSuffixAccounts: accountList?.join(","),
      storeLocationCode: "lppl",
      titleCode:
        formValues.title == null
          ? ""
          : formValues.title.toLowerCase().replace(".", ""),
      uid: this.userDetails?.email.toLowerCase(),
      userPermissions: selectedPermissions,
      workPhone: this.getPhoneNumber(formValues.workPhone),
    };

   
    this.service.updateUserSubmit(this.userId, updatedUser).subscribe({
      next: (res) => {
        this.service.progressHide()
        if (res.body.errorCode === "0001") {
          this.alertData = {
            message: res.body.errorMessage
              ? res.body.errorMessage
              : "There was a problem editing the user",
          };
          this.alertType = "danger";
          this.alertTrigger = true;
          this.scrollToTop.nativeElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest",
          });
        } else {
          this.alertData = {
            message: "User updated Successfully",
          };
          this.alertType = "success";
          this.alertTrigger = true;
          this.scrollToTop.nativeElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest",
          });
          this.service.isUserUpdated = true;
          this.navigateToCompanyList();
          // setTimeout(() => {
          //   this.navigateToCompanyList();
          // }, 3000);
        }
      },

      error: (err) => {
        this.service.progressHide()
        this.alertData = {
          message: err.error
            ? err.error
            : "There was a problem editing the user",
        };
        this.alertType = "danger";
        this.alertTrigger = true;
        this.scrollToTop.nativeElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
      },
    });
  }

  onChangePermissionSelection(e: any, category: any, permissionGroupName = '') {
    let selectedItems = new Set();
    if (e?.selectedItems) {
      selectedItems = e.selectedItems;
      if (
        e.changedItem !== "All" &&
        e.changedItem.value === "restrictPlaceOrderGroup"
      ) {
        if (e.changedItem.checked == true) {
           this.openConfirmationModal({
            title: "Confirmation",
            content: `Warning: Enabling Restrict Place Order will remove all Product Order Management selections. <br />Would you like to Proceed Anyway?`,
            primaryActionLabel: "Yes",
            secondaryActionLabel: "No",
            onPrimaryAction: () => {
              selectedItems.clear();
              category.rows[5].checked = true;
              this.permissions.productOrderManagement.rows.map((item: any) => {
                if (item.value !== "restrictPlaceOrderGroup") {
                  item.disabled = true;
                  item.checked = false;
                }
              });
              // this.permissions.productOrderManagement.columns[0].checked = false;
              this.productOrderManagementDisable = true;
              this.selectAllValues = false;
              this.entireSiteDisable = true;
              this.modalService.hide();
            },
            onSecondaryAction: () => {
              selectedItems.delete(5);
              category.rows[5].checked = false;
              this.permissions.productOrderManagement.rows.map((item: any) => {
                if (item.value !== "restrictPlaceOrderGroup") {
                  item.disabled = false;
                }
              });
              this.productOrderManagementDisable = false;
              this.entireSiteDisable = false;
              this.modalService.hide();
            },
          });
        } else {  
        if (permissionGroupName === "productOrderManagement") {
            this.permissions.productOrderManagement.rows.map((item: any) => {
              if (item.value !== "restrictPlaceOrderGroup") {
                item.disabled = false;
              }
            });
            this.productOrderManagementDisable = false;
            this.entireSiteDisable = false;

            selectedItems.delete(5);
            category.rows[5].checked = false;
          }
        }
      } else if (
        e.changedItem === "All" &&
        permissionGroupName === "productOrderManagement"
      ) {
        selectedItems.delete(5);
        category.rows[5].checked = false;
      }
    } else {
      selectedItems = e;
    }
    if (selectedItems.size > 0) {
      category.rows.forEach((row: any) => {
        if (selectedItems.has(category.rows.indexOf(row))) {
          this.permissionsData.add(row.title + "~" + row.value);
        } else {
          this.permissionsData.delete(row.title + "~" + row.value);
        }
      });
    } else {
      this.permissionsData.forEach((permission: any) => {
        if (permission.includes(category.columns[0].title)) {
          this.permissionsData.delete(permission);
        }
      });
    }
    this.handlePermissionsPreCheck();
  }

  handlePermissionsPreCheck() {
    this.permissions.websiteSecurityAdmin.columns[0].checked =
      this.permissions.websiteSecurityAdmin.rows.every(
        (res: any) => res.checked
      );
      if (this.isUSCustomer) {
        const filterData = this.permissions.financials.rows
        .filter((res: any) => !res.disabled);
        this.permissions.financials.columns[0].checked = filterData.every((res: any) => res.checked);
      } else {
        this.permissions.financials.columns[0].checked =
          this.permissions.financials.rows.every((res: any) => res.checked);
      }  
    this.permissions.customRugProgram.columns[0].checked =
      this.permissions.customRugProgram.rows.every((res: any) => res.checked);
    this.permissions.pricing.columns[0].checked =
      this.permissions.pricing.rows.every((res: any) => res.checked);
    const productOrderManagementRows = this.permissions.productOrderManagement.rows.filter(
      (res: any) => res.value !== "restrictPlaceOrderGroup"
    );
    this.permissions.productOrderManagement.columns[0].checked =
      productOrderManagementRows.every((res: any) => res.checked);
    
    // this.permissions.productOrderManagement.columns[0].checked =
    //   this.permissions.productOrderManagement.rows.every(
    //     (res: any) => res.checked
    //   );
    this.permissions.mohawkToday.columns[0].checked =
      this.permissions.mohawkToday.rows.every((res: any) => res.checked);
    this.permissions.sampleOrderManagement.columns[0].checked =
      this.permissions.sampleOrderManagement.rows.every(
        (res: any) => res.checked
      );
    this.permissions.claimsManagement.columns[0].checked =
      this.permissions.claimsManagement.rows.every((res: any) => res.checked);

    this.permissions.websiteSecurityAdmin.columns[0].checked &&
    this.permissions.financials.columns[0].checked &&
    this.permissions.customRugProgram.columns[0].checked &&
    this.permissions.pricing.columns[0].checked &&
    this.permissions.productOrderManagement.columns[0].checked &&
    this.permissions.mohawkToday.columns[0].checked &&
    this.permissions.sampleOrderManagement.columns[0].checked &&
    this.permissions.claimsManagement.columns[0].checked
      ? (this.selectAllValues = true)
      : (this.selectAllValues = false);
  }

  onChangeNotificationSelection(e: any, category: any) {
    this.notifications.claims.columns[0].checked =
      this.notifications.claims.rows.every((res: any) => res.checked);
    this.notifications.financial.columns[0].checked =
      this.notifications.financial.rows.every((res: any) => res.checked);
    this.notifications.order.columns[0].checked =
      this.notifications.order.rows.every((res: any) => res.checked);
    // this.notifications.quote.columns[0].checked =
    //   this.notifications.quote.rows.every((res: any) => res.checked);
    this.notifications.reserve.columns[0].checked =
      this.notifications.reserve.rows.every((res: any) => res.checked);

    let x: any[];
    let y: any[];

    let quoteConfirmation: boolean = false;
    let quoteCancelled: boolean = false;
    let quoteExpiry: boolean = false;
    let orderConfirmation: boolean = false;
    let plannedArrivalAndDeliveryOrPickUpUpdate: boolean = false;
    let loadLeavesMillToShippingWarehouse: boolean = false;
    let loadArrivesAtShippingWarehouse: boolean = false;
    let outforDelivery: boolean = false;
    let orderUpdates:boolean = false;
    let advanceShipNotification: boolean = false;
    let signMeUpForPricingAnnouncements: boolean = false;
    let newClaimsConfirmation: boolean = false;
    let claimStatusUpdate: boolean = false;
    let customerActionRequired: boolean = false;
    let claimsProcessComplete: boolean = false;
    let newInvoices: boolean = false;
    let paymentConfirmation: boolean = false;
    let reserveAboutToExpire: boolean = false;
    let draftClaimExpiry: boolean = false;
    let returnAuthorization: boolean = false;
    let claimComments: boolean = false;

    x = [
      quoteConfirmation,
      quoteCancelled,
      quoteExpiry,
      orderConfirmation,
      plannedArrivalAndDeliveryOrPickUpUpdate,
      loadLeavesMillToShippingWarehouse,
      loadArrivesAtShippingWarehouse,
      outforDelivery,
      advanceShipNotification,
      signMeUpForPricingAnnouncements,//index 9
      newClaimsConfirmation,
      claimStatusUpdate,
      customerActionRequired,
      claimsProcessComplete,
      newInvoices,
      paymentConfirmation,
      reserveAboutToExpire,
      draftClaimExpiry,
      returnAuthorization,
      claimComments,
      orderUpdates,
    ];

    y = [
      "Quote Submitted / Offered",
      "Quote Cancelled",
      "Quote Expiry",
      "Order Confirmation",
      "Planned Arrival & Delivery/Pick-Up Update",
      "Load Leaves the Mill to Shipping Warehouse",
      "Load Arrives at the Shipping Warehouse",
      "Out for Delivery",
      "Advance Ship Notification",
      "Sign me up for any pricing announcements",//index 9
      "New Claims Confirmation",
      "Claim Status Update",
      "Customer Action Required",
      "Claims Process Complete",
      "New Invoices (PDF via email)",
      "Payment Schedule Confirmation",
      "Reserve is about to Expire",
      "Draft Claims Expiry",
      "Return Authorization",
      "Claim Comments",
      "Daily Status Report - All Orders"
    ];

    x.forEach((xval, index) => {
      this.notifications?.quote?.rows?.forEach((res: any) => {
        if (res.quoteNotification === y[index]) {
          x[index] = res.checked;
        }
      });
      this.notifications?.financial?.rows?.forEach((res: any) => {
        if (res.financialNotification === y[index]) {
          x[index] = res.checked;
        }
      });
      this.notifications?.order?.rows?.forEach((res: any) => {
        if (res.orderNotification === y[index]) {
          x[index] = res.checked;
        }
      });
      this.notifications?.claims?.rows?.forEach((res: any) => {
        if (res.claimsNotification === y[index]) {
          x[index] = res.checked;
        }
      });
      this.notifications?.reserve?.rows?.forEach((res: any) => {
        if (res.reserveNotification === y[index]) {
          x[index] = res.checked;
        }
      });
    });

    this.notificationData = {
      ...this.notificationData,
      allClaims: this.notifications?.claims?.columns[0].checked,
      allOrders: this.notifications?.order?.columns[0].checked,
      allQuotes: this.notifications?.quote?.columns[0].checked,
      allReserves: this.notifications?.reserve?.columns[0].checked,
      allFinance: this.notifications?.financial?.columns[0].checked,

      emailQuoteConfirmationNotificationEnabled: x[0],
      emailQuoteCancelledNotificationEnabled: x[1],
      emailQuoteExpiryNotificationEnabled: x[2],
      emailOrderNotificationEnabled: x[3],
      emailDeliveryPickupNotificationEnabled: x[4],
      emailLoadLeavesNotificationEnabled: x[5],
      emailLoadArrivesNotificationEnabled: x[6],
      emailOutForDeliveryNotificationEnabled: x[7],
      emailAdvanceShipNotificationEnabled: x[8],
      emailOrderUpdatesNotificationEnabled: x[20],
      emailClaimConfirmNotificationEnabled: x[10],
      emailClaimStatusNotificationEnabled: x[11],
      emailCustActionNotificationEnabled: x[12],
      emailClaimProcessNotificationEnabled: x[13],
      emailNewInvoiceNotificationEnabled: x[14],
      emailPaymentConfirmNotificationEnabled: x[15],
      emailReserveExpireNotificationEnabled: x[16],
      emailClaimExpiryNotificationEnabled: x[17],
      emailReturnAuthNotificationEnabled: x[18],
      emailClaimCommentsNotificationEnabled: x[19],
    };
  }

  navigateToCompanyList() {
    this.router.navigate([
      `residential/company/manage-users/${this.userDetails?.uid}`,
    ]);
  }

  getSuffixList(accountNumber: any) {
    this.suffixList = [];
    if (accountNumber) {
      this.editUserForm.patchValue({
        accountList: accountNumber,
      });
      if (!!this.suffixData.length) {
        const hasDuplicate = this.accountsList.some(
          (item: { accountNumber: any }) =>
            item.accountNumber === this.suffixData[0].accountNumber
        );
        if (!hasDuplicate) {
          this.accountsList.push(this.suffixData[0]);
        }
      }
      this.service.getAccountById(accountNumber).subscribe((res) => {
        res.body.length === 0
          ? (this.hasEmptyResponse = true)
          : (this.hasEmptyResponse = false);
        this.suffixList = res.body;
      },(err)=>{
        this.service.progressHide()
      });
    }
  }

  addAccountsSufix() {
    let accNumbers = this.editUserForm.value.SuffixAccounts;

    this.suffixList.map((suffix: any) => {
      if (accNumbers?.includes(suffix.uid)) {
        if (this.selectedSuffixAccounts.length == 0) {
          this.selectedSuffixAccounts.push(suffix);
        } else {
          const ind = this.selectedSuffixAccounts.findIndex(
            (item: any) => item.accountType == suffix.accountType
          );
          if (ind == -1) {
            this.openConfirmationModal({
              title: "Restriction",
              content: "Different account type is not allowed",
              primaryActionLabel: "",
              secondaryActionLabel: "OK",
              onSecondaryAction: () => this.modalService.hide(),
            });
          } else {
            this.selectedSuffixAccounts.push(suffix);
          }
        }
      }
    });
    this.checkForShipTo();
    this.onPrimaryRoleChange(this.primaryRole);
    this.selectedSuffixAccounts = [
      ...new Map(
        this.selectedSuffixAccounts.map((item: any) => [item["uid"], item])
      ).values(),
    ];

    this.suffixList = this.suffixList.filter((elem: any) => {
      return accNumbers.every((ele: any) => {
        return ele != elem.uid;
      });
    });
  }

  checkForShipTo() {
    this.hasShipToAccount = this.selectedSuffixAccounts.some(
      (accounts: any) => accounts.accountType === "ZMSH"
    );
    const zmshInd = this.selectedSuffixAccounts.findIndex(
      (item: any) => item.accountType == "ZMSH"
    );
    this.isZMSHAccountSelected = zmshInd !== -1;
    for (let key in this.permissions) {
      this.permissions[key].rows.map((item: any) => {
        // if (this.isZMSHAccountSelected) {
        //   item.checked = false;
        // }
        
        // if (
        //   key == "productOrderManagement" &&
        //   item.value == "existingOrderInquiryGroup"
        // ) {
        //   item.checked = true;
        // }

        // item.disabled = this.isZMSHAccountSelected;

        if(key == "productOrderManagement" && (item.value == "checkProductAvailabilityGroup" || 
                item.value == "changeProductOrderEntryGroup")){
          item.disabled = false;
        }
        else if(
          (item.value == "payBillsGroup" || item.value == "receivablesInquiryGroup" || item.value == "accountStatementsGroup" || item.value == "viewPaymentsGroup")
          ){
             if(this.isZMSHAccountSelected)
              {
                item.disabled = true;
                item.checked = false;
              }
          }
      });
    }

    for (let key in this.notifications) {
      this.notifications[key].rows.map((item: any) => {
        // if (this.isZMSHAccountSelected) {
        //   item.checked = false;
        // }
        // item.disabled = this.isZMSHAccountSelected;
        // if (
        //   key == "order" &&
        //   (item?.key == "loadArrivesAtTheShippingWarehouse" ||
        //     item?.key == "loadLeavesTheMillToShippingWarehouse" ||
        //     item?.key == "outForDelivery" ||
        //     item?.key == "advanceShipNotification")
        // ) {
        //   item.disabled = false;
        // } else 
        if (
          key == "financial" &&
          item?.value == "emailNewInvoiceNotificationEnabled"
        ) {
          item.disabled =
            this.storageService.userInfo?.orgUnit?.paybillFlag == "EMPTY" ||
            this.storageService.userInfo?.orgUnit?.paybillFlag == "Y" 
        }
        else if(
          key == "reserve" &&
          (item?.value == "emailReserveExpireNotificationEnabled" )) {
          if(this.isZMSHAccountSelected)
            {
              item.disabled = true;
              item.checked = false;
            }
        }
      });
    }
  }
  checkForDisableState() {
    if(this.isUSCustomer)
    {
    for (let key in this.permissions) {
      this.permissions[key].rows.map((item: any) => {
        if (
          key == "financials" &&
          item.value == "bankAccountSetupGroup" && item.checked == false
        ) {
          // item.checked = false;
          item.disabled = this.isUSCustomer;
          }
        });
      }
    }
  }
  openConfirmationModal(data = {}) {
    const initialState: ModalOptions = {
      backdrop: true,
      ignoreBackdropClick: true,
      initialState: {
        ...data,
      },
    };
    this.modalService.show(
      ConfirmationDialogComponent,
      Object.assign(initialState, {
        id: "confirmationModal",
        class: "modal-md modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }

  removeAccountsSufix() {
    let accNumbers = this.editUserForm.value.selectedSuffixAccounts;
        if(accNumbers==null) {
        return
        }
    this.selectedSuffixAccounts.map((suffix: any) => {
      if (accNumbers?.includes(suffix.uid)) {
        this.suffixList.push(suffix);
      }
    });

    this.selectedSuffixAccounts = this.selectedSuffixAccounts.filter(
      (elem: any) => {
        return accNumbers.every((ele: any) => {
          return ele != elem.uid;
        });
      }
    );
    const zmshInd = this.selectedSuffixAccounts.findIndex(
      (item: any) => item.accountType == "ZMSH"
    );
    this.isZMSHAccountSelected = zmshInd !== -1;
    if (!this.isZMSHAccountSelected) {
      this.onPrimaryRoleChange(this.primaryRole);
    }

    // this.suffixList = this.suffixList.filter((elem: any) => {
    //   return accNumbers.some((ele: any) => {
    //     return ele != elem.uid;
    //   });
    // });
  }

  // accountListChanged(e: any) {
  //   const SuffixAccounts: FormArray = this.editUserForm.get(
  //     "SuffixAccounts"
  //   ) as FormArray;
  //   if (e.state === true) {
  //     SuffixAccounts.push(new FormControl(e.value));
  //   } else {
  //     let i = 0;
  //     SuffixAccounts.controls.forEach((account: any) => {
  //       if (account.value === e.value) {
  //         SuffixAccounts.removeAt(i);
  //         return;
  //       }
  //     });
  //   }
  // }

  onPrimaryRoleChange(role: any) {
    this.primaryRole = role;
    if (!this.isZMSHAccountSelected) {
      role === "ownergroup"
        ? (this.selectAllValues = true)
        : (this.selectAllValues = false);
      for (const property in this.permissions) {
        this.permissions[property].rows.map((res: any) => {
          res.checked = false;
          this.permissionsData.delete(res.title + "~" + res.value);
          if((role === "salesassociategroup" || role === 'specifiergroup' || role === "operationsgroup") && res.value == "pricingDownloadGroup"){
            res.checked = false;
            res.disabled = true;
          }
          if(role === "operationsgroup" && res.value == "pricingVisibilityAndInquiryGroup"){
            res.checked = false;
            res.disabled = true;
          }
          if (
            (res.value == "b2badmingroup" ||
              res.value == "retailStorefrontLocatorGroup") &&
            (role === "ownergroup" || role === "managergroup")
          ) {
            res.checked = true;
            this.permissionsData.add(res.title + "~" + res.value);
          }
          if (
            res.value == "existingOrderInquiryGroup" ||
            res.value == "mohawkInfiniteRewardsGroup" ||
            res.value == "promotionsGroup"
          ) {
            res.checked = true;
            this.permissionsData.add(res.title + "~" + res.value);
          }
          if (
            role != "accountgroup" &&
            (res.value == "customRugOrderEntryGroup" ||
              res.value == "customRugQuoteGroup" ||
              res.value == "sampleOrderEntryGroup" ||
              res.value == "existingSampleOrderInquiryGroup" ||
              res.value == "checkProductAvailabilityGroup" ||
              res.value == "changeReservesGroup" ||
              res.value == "changeProductOrderEntryGroup" ||
              res.value == "specialGoodsGroup")
          ) {
            res.checked = true;
            this.permissionsData.add(res.title + "~" + res.value);
          }
          if (role != "specifiergroup" && res.value == "invoiceInquiryGroup") {
            res.checked = true;
            this.permissionsData.add(res.title + "~" + res.value);
          }

          if (
            (role === "ownergroup" ||
              role === "managergroup" ||
              role === "accountgroup") &&
            (res.value == "receivablesInquiryGroup" ||
              res.value == "accountStatementsGroup" ||
              res.value == "viewPaymentsGroup")
          ) {
            res.checked = true;
            this.permissionsData.add(res.title + "~" + res.value);
          }

          if (
            role === "ownergroup" ||
            (role === "accountgroup" &&
              (res.value == "payBillsGroup" ||
                res.value == "bankAccountSetupGroup" ||
                // res.value == "earningStatementsGroup" ||
                res.value == "dailyPaymentReportGroup"))
          ) {
            res.checked = true;
            this.permissionsData.add(res.title + "~" + res.value);
          }

          if (
            role != "operationsgroup" &&
            res.value == "pricingVisibilityAndInquiryGroup"
          ) {
            res.checked = true;
            this.permissionsData.add(res.title + "~" + res.value);
          }

          if (
            (role === "ownergroup" ||
              role === "managergroup" ||
              role === "accountgroup" ||
              role === "purchaseinggroup") &&
            (res.value == "pricingDownloadGroup" ||
              res.value == "pricingDownloadSetupGroup")
          ) {
            res.checked = true;
            this.permissionsData.add(res.title + "~" + res.value);
          }

          if (role === "ownergroup" && res.value == "coopGroup") {
            res.checked = true;
            this.permissionsData.add(res.title + "~" + res.value);
          }

          if (
            role != "ownergroup" &&
            (res.value == "claimsEntryGroup" ||
              res.value == "existingClaimsInquiryGroup")
          ) {
            res.checked = true;
            this.permissionsData.add(res.title + "~" + res.value);
          }

          if (
            role != "operationsgroup" &&
            res.value == "manageLeadsAndLeadCenterGroup"
          ) {
            res.checked = true;
            this.permissionsData.add(res.title + "~" + res.value);
          }
          if (role === "ownergroup" &&
            property === "productOrderManagement" &&
            res.value === "restrictPlaceOrderGroup") {
            res.disabled = false;
            res.checked = false;
             this.productOrderManagementDisable = false;
            this.permissions.productOrderManagement.columns[0].checked = true;
            // this.selectAllValues = false;
          }
        });
      }
    }
    else if (this.isZMSHAccountSelected) {
      for (const property in this.permissions) {
        this.permissions[property].rows.forEach((res: any) => {
          res.checked = false;
        });
      }
      this.selectAllValues = false;
    }
  }

  phonePattern:any = "[0-9]{10}";
  checkWorkPhoneValidation(e: any) {
    let val = e?.target?.value ? e.target.value : "";
    const phoneCharLength = val.slice(0,1) === '+' ? 12 : 10;
    this.phonePattern = val.slice(0,1) === '+' ?  /^\+?\d{11}$/ : "[0-9]{10}";
    const maxLength = val.slice(0,1) === '+' ? 17 : 14;
    if (
      val.length == phoneCharLength &&
      this.editUserForm.controls["workPhone"].valid
    ) {
      this.editUserForm.controls["workPhone"].clearValidators();
      this.editUserForm.controls["workPhone"].updateValueAndValidity();
      this.editUserForm.patchValue({
        workPhone: this.convertToUsPhoneFormat(val),
      });

      this.editUserForm.controls["workPhone"].setValidators([
        Validators.required,
      ]);
      this.editUserForm.controls["workPhone"].updateValueAndValidity();
    } else {
      let onlyNumbers = this.clearSpeacialCharsFromPhoneNumber(val);
      if (onlyNumbers.length == phoneCharLength) {
        this.editUserForm.patchValue({
          workPhone: this.convertToUsPhoneFormat(onlyNumbers),
        });
        this.editUserForm.controls["workPhone"].setValidators([
          Validators.required,
        ]);
      } else {
        this.editUserForm.patchValue({
          workPhone: onlyNumbers,
        });
        this.editUserForm.controls["workPhone"].setValidators([
          Validators.required,
          Validators.pattern(this.phonePattern),
        ]);
      }
      this.editUserForm.controls["workPhone"].updateValueAndValidity();
    }
  }
  formateWorkPhone(event:any){
    let value = event.target.value;
    if(this.phonePattern != "[0-9]{10}" && !this.phonePattern.test(value)){
    value = value.replace(/[^0-9+]/g,'');
    if(value.lastIndexOf('+') > 0){
      let val = value.slice(1,value.length);
      val = val.replace(/\+/g,'');
      value = value.slice(0,1)+val;
    }
    }else if(value.slice(0,1) !== '+'){
      value = value.replace(/[^0-9]/g, '')
    }
    event.target.value = value;
  }
  checkMobilePhoneValidation(e: any) {
    // const phoneCharLength = 10;
    // let val = e?.target?.value ? e.target.value : e;
    let val = e?.target?.value ? e.target.value : "";
    const phoneCharLength = val.slice(0,1) === '+' ? 12 : 10;
    this.phonePattern = val.slice(0,1) === '+' ?  /^\+?\d{11}$/ : "[0-9]{10}";
    if(val === ""){
      this.editUserForm.controls["workPhone"].setValidators([]);
    }
    const maxLength = val.slice(0,1) === '+' ? 17 : 14;
    if (
      val.length == phoneCharLength &&
      this.editUserForm.controls["mobilePhone"].valid
    ) {
      this.editUserForm.controls["mobilePhone"].clearValidators();
      this.editUserForm.controls["mobilePhone"].updateValueAndValidity();
      this.editUserForm.patchValue({
        mobilePhone: this.convertToUsPhoneFormat(val),
      });

      this.editUserForm.controls["mobilePhone"].updateValueAndValidity();
    } else {
      let onlyNumbers = this.clearSpeacialCharsFromPhoneNumber(val);
      if (onlyNumbers.length == phoneCharLength) {
        this.editUserForm.patchValue({
          mobilePhone: this.convertToUsPhoneFormat(onlyNumbers),
        });
      } else {
        this.editUserForm.patchValue({
          mobilePhone: onlyNumbers,
        });
        this.editUserForm.controls["mobilePhone"].setValidators([
          Validators.pattern(this.phonePattern),
        ]);
      }
      this.editUserForm.controls["mobilePhone"].updateValueAndValidity();
    }
  }

  convertToUsPhoneFormat(val: any) {
    if(val?.slice(0,1) === '+'){
      let formatedValue =val?.substring(0, 2) + " "
      formatedValue +=  "(" + val?.substring(2, 5) + ") ";
      formatedValue += val?.substring(5, 8) + " ";
      formatedValue += val?.substring(8, 12);
      return formatedValue;
    }else
    if (val?.length) {
      let formatedValue = "(";
      formatedValue += val?.substring(0, 3) + ") ";
      formatedValue += val?.substring(3, 6) + " ";
      formatedValue += val?.substring(6, 10);
      return formatedValue;
    } else {
      return "";
    }
  }

  clearSpeacialCharsFromPhoneNumber(val: any) {
    val = this.removeChar(val, " ");
    val = this.removeChar(val, " ");
    val = this.removeChar(val, "(");
    val = this.removeChar(val, ")");
    return val;
  }
  removeChar(val: any, char: any) {
    let index = val.indexOf(char);
    return index >= 0 ? val.slice(0, index) + val.slice(index + 1) : val;
  }
  searchText: string = "";
  suffixData: any = [];
  setSuffixData: boolean = false;
  checkvalue: boolean = false;
  getsearchaccount(value: any) {
    if (value) {
      this.service.getSearchAccount(value).subscribe((res: any) => {
        if (res.ok == true) {
          this.setSuffixData = true;
          this.suffixData = res.body.reduce((arr: any[], current: any) => {
            if (
              !arr.find(
                (item: any) => item.accountNumber === current.accountNumber
              )
            ) {
              arr.push(current);
            }
            this.accountsList = [...this.defaultAccountsList, ...arr];
            this.accountsList = this.removeSameAccountNumber(this.accountsList);
            return arr;
          }, []);
        } else {
          this.setSuffixData = false;
          this.checkvalue = true;
          this.stopAlert();
        }
      });
    }
  }
  stopAlert() {
    setTimeout(() => {
      this.checkvalue = false;
    }, 3000);
  }

  onSearchClear(event: any) {
    if (!event.target) {
      this.suffixList = [];
      this.suffixData = [];
      this.setSuffixData = false;
      this.checkvalue = false;
    }
  }
  @HostListener("document:click")
  clicked() {
    this.setSuffixData = false;
  }

  getPhoneNumber(value: any) {
    if (value?.length) {
      value = value?.replace(/[^0-9]+/ig, "");
      value = value?.length > 10 ? value.slice(-10) : value;
      return value;
    } else {
      return "";
    }
  }

  removeSameAccountNumber(data: any) {
    const ids = data.map(({ accountNumber }:any) => accountNumber);
    const filtered = data.filter(
        ({ accountNumber }:any, index:number) => !ids.includes(accountNumber, index + 1)
    );
    return filtered;
  }
}
