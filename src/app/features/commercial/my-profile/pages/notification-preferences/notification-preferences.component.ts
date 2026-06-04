import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { UserService } from "../../../../shared/user/services/user.service";
import { catchError, finalize, switchMap, throwError } from "rxjs";
@Component({
    selector: "app-notification-preferences",
    templateUrl: "./notification-preferences.component.html",
    styleUrls: ["./notification-preferences.component.scss"],
    standalone: false
})
export class NotificationPreferencesComponent implements OnInit {
  orderNotifications: Array<any> = [
    {
      name: "Order Confirmation",
      checked: false,
      columns: [
        {
          checked: false,
          value: "emailOrderNotificationEnabled",
          disable: false,
        },
        // {
        //   checked: false,
        //   value: "faxOrderNotificationEnabled",
        //   disable: false,
        // },
        {
          checked: false,
          value: "textOrderNotificationEnabled",
          disable: false,
        },
      ],
    },
    {
      name: "Planned Delivery / Pickup Date Change",
      checked: false,
      columns: [
        {
          checked: false,
          value: "emailDeliveryPickupNotificationEnabled",
          disable: false,
        },
        // {
        //   checked: false,
        //   value: "faxDeliveryPickupNotificationEnabled",
        //   disable: false,
        // },
        {
          checked: false,
          value: "textDeliveryPickupNotificationEnabled",
          disable: false,
        },
      ],
    },
    {
      name: "In Transit to Shipping Warehouse",
      checked: false,
      columns: [
        {
          checked: false,
          value: "emailLoadLeavesNotificationEnabled",
          disable: false,
        },
        // {
        //   checked: false,
        //   value: "faxLoadLeavesNotificationEnabled",
        //   disable: false,
        // },
        {
          checked: false,
          value: "textLoadLeavesNotificationEnabled",
          disable: false,
        },
      ],
    },
    {
      name: "Arrived at Shipping Warehouse",
      checked: false,
      columns: [
        {
          checked: false,
          value: "emailLoadArrivesNotificationEnabled",
          disable: false,
        },
        // {
        //   checked: false,
        //   value: "faxLoadArrivesNotificationEnabled",
        //   disable: false,
        // },
        {
          checked: false,
          value: "textLoadArrivesNotificationEnabled",
          disable: false,
        },
      ],
    },
    {
      name: "Out for Delivery",
      checked: false,
      columns: [
        {
          checked: false,
          value: "emailOutForDeliveryNotificationEnabled",
          disable: false,
        },
        // {
        //   checked: false,
        //   value: "faxOutForDeliveryNotificationEnabled",
        //   disable: false,
        // },
        {
          checked: false,
          value: "textOutForDeliveryNotificationEnabled",
          disable: false,
        },
      ],
    },
    {
      name: "Advance Ship Notification",
      checked: false,
      columns: [
        {
          checked: false,
          value: "emailAdvanceShipNotificationEnabled",
          disable: false,
        },
        // {
        //   checked: false,
        //   value: "faxAdvanceShipNotificationEnabled",
        //   disable: false,
        // },
        {
          checked: false,
          value: "textAdvanceShipNotificationEnabled",
          disable: false,
        },
      ],
    },
    {
      name: "Daily Status Report - All Orders",
      checked: false,
      columns: [
        {
          checked: false,
          value: "emailOrderUpdatesNotificationEnabled",
          disable: false,
        },
        {
          checked: false,
          value: "textOrderUpdatesNotificationEnabled",
          disable: false,
        },
      ],
    },
  ];

  claimNotifications: Array<any> = [
    {
      name: "New Claim Confirmation",
      checked: false,
      columns: [
        {
          checked: false,
          value: "emailClaimConfirmNotificationEnabled",
          disable: false,
        },
        // {
        //   checked: false,
        //   value: "faxClaimConfirmNotificationEnabled",
        //   disable: false,
        // },
        {
          checked: false,
          value: "textClaimConfirmNotificationEnabled",
          disable: false,
        },
      ],
    },
    {
      name: "Claim Status Update",
      checked: false,
      columns: [
        {
          checked: false,
          value: "emailClaimStatusNotificationEnabled",
          disable: false,
        },
        // {
        //   checked: false,
        //   value: "faxClaimStatusNotificationEnabled",
        //   disable: false,
        // },
        {
          checked: false,
          value: "textClaimStatusNotificationEnabled",
          disable: false,
        },
      ],
    },
    {
      name: "Customer Action Required",
      checked: false,
      columns: [
        {
          checked: false,
          value: "emailCustActionNotificationEnabled",
          disable: false,
        },
        // {
        //   checked: false,
        //   value: "faxCustActionNotificationEnabled",
        //   disable: false,
        // },
        {
          checked: false,
          value: "textCustActionNotificationEnabled",
          disable: false,
        },
      ],
    },
    {
      name: "Return Authorization",
      checked: false,
      columns: [
        {
          checked: false,
          value: "emailClaimReturnOtherizationNotificationEnabled",
          disable: false,
        },
        // {
        //   checked: false,
        //   value: "faxReturnAuthNotificationEnabled",
        //   disable: false,
        // },
        {
          checked: false,
          value: "textClaimReturnOtherizationNotificationEnabled",
          disable: false,
        },
      ],
    },
    {
      name: "Claim Draft Expiring",
      checked: false,
      columns: [
        {
          checked: false,
          value: "emailClaimExpiryNotificationEnabled",
          disable: false,
        },
        // {
        //   checked: false,
        //   value: "faxClaimExpiryNotificationEnabled",
        //   disable: false,
        // },
        {
          checked: false,
          value: "textClaimExpiryNotificationEnabled",
          disable: false,
        },
      ],
    },
    {
      name: "Claims Process Complete",
      checked: false,
      columns: [
        {
          checked: false,
          value: "emailClaimProcessNotificationEnabled",
          disable: false,
        },
        // {
        //   checked: false,
        //   value: "faxClaimProcessNotificationEnabled",
        //   disable: false,
        // },
        {
          checked: false,
          value: "textClaimProcessNotificationEnabled",
          disable: false,
        },
      ],
    },
    {
      name: "Claim Comments",
      checked: false,
      columns: [
        {
          checked: false,
          value: "emailClaimCommentsNotificationEnabled",
          disable: false,
        },
        // {
        //   checked: false,
        //   value: "faxClaimCommentsNotificationEnabled",
        //   disable: false,
        // },
        {
          checked: false,
          value: "textClaimCommentsNotificationEnabled",
          disable: false,
        },
      ],
    },
  ];

  reserveNotifications: Array<any> = [
    {
      name: "Reserve is about to expire",
      checked: false,
      columns: [
        {
          checked: false,
          value: "emailReserveExpireNotificationEnabled",
          disable: false,
        },
        // {
        //   checked: false,
        //   value: "faxReserveExpireNotificationEnabled",
        //   disable: false,
        // },
        {
          checked: false,
          value: "textReserveExpireNotificationEnabled",
          disable: false,
        },
      ],
    },
  ];

  quoteNotifications: Array<any> = [
    {
      name: "Quote Submitted / Offered ",
      checked: false,
      columns: [
        {
          checked: false,
          value: "emailQuoteConfirmationNotificationEnabled",
          disable: false,
        },
        // {
        //   checked: false,
        //   value: "faxQuoteConfirmationNotificationEnabled",
        //   disable: false,
        // },
        {
          checked: false,
          value: "textQuoteConfirmationNotificationEnabled",
          disable: false,
        },
      ],
    },
    {
      name: "Quote Cancelled / rejected ",
      checked: false,
      columns: [
        {
          checked: false,
          value: "emailQuoteCancelledNotificationEnabled",
          disable: false,
        },
        // {
        //   checked: false,
        //   value: "faxQuoteCancelledNotificationEnabled",
        //   disable: false,
        // },
        {
          checked: false,
          value: "textQuoteCancelledNotificationEnabled",
          disable: false,
        },
      ],
    },
    {
      name: "Quote Expiry ",
      checked: false,
      columns: [
        {
          checked: false,
          value: "emailQuoteExpiryNotificationEnabled",
          disable: false,
        },
        // {
        //   checked: false,
        //   value: "faxQuoteExpiryNotificationEnabled",
        //   disable: false,
        // },
        {
          checked: false,
          value: "textQuoteExpiryNotificationEnabled",
          disable: false,
        },
      ],
    },
  ];

  financeNotifications: Array<any> = [
    {
      name: "New Invoices (PDF via email )",
      checked: false,
      columns: [
        {
          checked: false,
          value: "emailNewInvoiceNotificationEnabled",
          disable: false,
        },
        // {
        //   checked: false,
        //   value: "faxNewInvoiceNotificationEnabled",
        //   disable: false,
        // },
        {
          checked: false,
          value: "textNewInvoiceNotificationEnabled",
          disable: false,
        },
      ],
    },
    {
      name: "Payment Schedule Confirmation",
      checked: false,
      columns: [
        {
          checked: false,
          value: "emailPaymentConfirmNotificationEnabled",
          disable: false,
        },
        // {
        //   checked: false,
        //   value: "faxPaymentConfirmNotificationEnabled",
        //   disable: false,
        // },
        {
          checked: false,
          value: "textPaymentConfirmNotificationEnabled",
          disable: false,
        },
      ],
    },
  ];

  selectAllOrder: boolean = false;
  selectMyOrder: boolean = false;
  selectAllClaims: boolean = false;
  selectMyClaims: boolean = false;
  selectAllReserves: boolean = false;
  selectMyReserves: boolean = false;
  selectAllQuotes: boolean = false;
  selectMyQuotes: boolean = false;
  selectAllFinancials: boolean = false;
  selectMyFinancials: boolean = false;
  alertData: any = {
    message: "success",
  };

  allOrdersSelected: boolean = false;
  allClaimsSelected: boolean = false;
  allReservesSelected: boolean = false;
  allQuotesSelected: boolean = false;
  allFinancialsSelected: boolean = false;
  allOptionsSelected: boolean = false;

  alertType: any = "success";
  alertTrigger: any = false;
  spinnerLoading = false;
  @ViewChild("scrollToTop", { read: ElementRef }) scrollToTop: any;
  payload: any = {
    emailOrderNotificationEnabled: false,
    faxOrderNotificationEnabled: false,
    textOrderNotificationEnabled: false,
    emailDeliveryPickupNotificationEnabled: false,
    faxDeliveryPickupNotificationEnabled: false,
    textDeliveryPickupNotificationEnabled: false,
    emailLoadLeavesNotificationEnabled: false,
    faxLoadLeavesNotificationEnabled: false,
    textLoadLeavesNotificationEnabled: false,
    emailLoadArrivesNotificationEnabled: false,
    faxLoadArrivesNotificationEnabled: false,
    textLoadArrivesNotificationEnabled: false,
    emailOutForDeliveryNotificationEnabled: false,
    faxOutForDeliveryNotificationEnabled: false,
    textOutForDeliveryNotificationEnabled: false,
    emailAdvanceShipNotificationEnabled: false,
    faxAdvanceShipNotificationEnabled: false,
    textAdvanceShipNotificationEnabled: false,
    emailClaimConfirmNotificationEnabled: false,
    faxClaimConfirmNotificationEnabled: false,
    textClaimConfirmNotificationEnabled: false,
    emailClaimStatusNotificationEnabled: false,
    faxClaimStatusNotificationEnabled: false,
    textClaimStatusNotificationEnabled: false,
    emailCustActionNotificationEnabled: false,
    faxCustActionNotificationEnabled: false,
    textCustActionNotificationEnabled: false,
    emailClaimProcessNotificationEnabled: false,
    faxClaimProcessNotificationEnabled: false,
    textClaimProcessNotificationEnabled: false,
    emailReserveExpireNotificationEnabled: false,
    faxReserveExpireNotificationEnabled: false,
    textReserveExpireNotificationEnabled: false,
    emailNewInvoiceNotificationEnabled: false,
    faxNewInvoiceNotificationEnabled: false,
    textNewInvoiceNotificationEnabled: false,
    emailPaymentConfirmNotificationEnabled: false,
    faxPaymentConfirmNotificationEnabled: false,
    textPaymentConfirmNotificationEnabled: false,
    allOrders: false,
    allClaims: false,
    allReserves: false,
    allQuotes: false,
    allFinance: false,
    salesforceOrderNotificationEnabled: false,
    salesforceDeliveryPickupNotificationEnabled: false,
    salesforceLoadLeavesNotificationEnabled: false,
    salesforceLoadArrivesNotificationEnabled: false,
    salesforceOutForDeliveryNotificationEnabled: false,
    salesforceClaimConfirmNotificationEnabled: false,
    salesforceClaimStatusNotificationEnabled: false,
    salesforceClaimProcessNotificationEnabled: false,
    salesforceReserveExpireNotificationEnabled: false,
    emailQuoteConfirmationNotificationEnabled: false,
    faxQuoteConfirmationNotificationEnabled: false,
    textQuoteConfirmationNotificationEnabled: false,
    emailQuoteExpiryNotificationEnabled: false,
    faxQuoteExpiryNotificationEnabled: false,
    textQuoteExpiryNotificationEnabled: false,
    salesforceQuoteExpiryNotificationEnabled: false,
    salesforceQuoteConfirmationNotificationEnabled: false,
    emailQuoteCancelledNotificationEnabled: false,
    faxQuoteCancelledNotificationEnabled: false,
    textQuoteCancelledNotificationEnabled: false,
    salesforceQuoteCancelledNotificationEnabled: false,
    emailClaimExpiryNotificationEnabled: false,
    faxClaimExpiryNotificationEnabled: false,
    textClaimExpiryNotificationEnabled: false,
    emailClaimReturnOtherizationNotificationEnabled: false,
    faxClaimReturnOtherizationNotificationEnabled: false,
    textClaimReturnOtherizationNotificationEnabled: false,
    emailClaimCommentsNotificationEnabled: false,
    textClaimCommentsNotificationEnabled: false,
  };
  notifications: any;
  iscustomer: any;
  customerAccountType: any;
  checkDisabled: boolean | any;
  reserveDisable: boolean | any;
  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.getUserDetails();
  }

  getUserDetails() {
    this.userService.getCurrentUserDetail().subscribe((response: any) => {
      this.notifications = response?.body?.notifications;
      this.selectAllClaims = this.notifications?.allClaims;
      this.payload.allClaims = this.notifications?.allClaims;
      this.selectMyClaims = !this.notifications?.allClaims;
      this.selectAllOrder = this.notifications?.allOrders;
      this.selectMyOrder = !this.notifications?.allOrders;
      this.payload.allOrders = this.notifications?.allOrders;
      this.selectAllFinancials = this.notifications?.allFinance;
      this.payload.allFinance = this.notifications?.allFinance;
      this.selectAllQuotes = this.notifications?.allQuotes;
      this.selectMyQuotes = !this.notifications?.allQuotes;
      this.payload.allQuotes = this.notifications?.allQuotes;
      this.selectAllReserves = this.notifications?.allReserves;
      this.selectMyReserves = !this.notifications?.allReserves;
      this.payload.allReserves = this.notifications?.allReserves;
      this.setNotifications(this.orderNotifications);
      this.setNotifications(this.reserveNotifications);

      this.setNotifications(this.claimNotifications);
      this.setNotifications(this.financeNotifications);
      this.setNotifications(this.quoteNotifications);
      this.iscustomer = response?.body?.isCustomer;

      this.customerAccountType = response?.body?.orgUnit?.accountType;
      this.disablingmethod();
    },(err)=>{
      this.userService.profileProgressHide()
    });
  }
  disablingmethod() {
    if (this.iscustomer && this.customerAccountType === "ZMSH") {
      this.reserveDisable = true;
      // this.selectMyOrder = true;
      /** shiping ware house disable */
      const specificValues = [
        "emailLoadLeavesNotificationEnabled",
        "faxLoadLeavesNotificationEnabled",
        "textLoadLeavesNotificationEnabled",
        "emailLoadArrivesNotificationEnabled",
        "faxLoadArrivesNotificationEnabled",
        "textLoadArrivesNotificationEnabled",
        "emailOutForDeliveryNotificationEnabled",
        "faxOutForDeliveryNotificationEnabled",
        "textOutForDeliveryNotificationEnabled",
        "emailAdvanceShipNotificationEnabled",
        "faxAdvanceShipNotificationEnabled",
        "textAdvanceShipNotificationEnabled",
      ];

      for (const notification of this.orderNotifications) {
        for (const column of notification.columns) {
          if (specificValues.includes(column.value)) {
            column.disable = false;
          } else {
            column.disable = true;
          }
        }
      }
      /** end  */
      /** Claim Notifications */
      for (const notification of this.claimNotifications) {
        for (const column of notification.columns) {
          column.disable = false;
          this.checkDisabled = false;
        }
      }
      /** end */
      /** reserveNotifications */
      for (const notification of this.reserveNotifications) {
        for (const column of notification.columns) {
          if (specificValues.includes(column.value)) {
            column.disable = false;
          } else {
            column.disable = true;
          }
        }
      }
      /** end */
      /** quoteNotifications */
      for (const notification of this.quoteNotifications) {
        for (const column of notification.columns) {
          if (specificValues.includes(column.value)) {
            column.disable = true;
          } else {
            column.disable = true;
          }
        }
      }
      /** end */
      /** financeNotifications */
      for (const notification of this.financeNotifications) {
        for (const column of notification.columns) {
          column.disable = false;
          this.checkDisabled = false;
        }
      }
      /** */
    }
  }
  setNotifications(notifications: any) {
    for (const notification of notifications) {
      notification?.columns.map((data: any) => {
        data.checked = this.notifications[data.value];
        this.payload[data.value] = this.notifications[data.value];
      });
      notification.checked = notification?.columns.every(
        (column: any) => column.checked
      );
    }

    this.allOptionsSelected = notifications.every(
      (category: any) => category.checked
    );
    switch (notifications) {
      case this.financeNotifications:
        this.allFinancialsSelected = this.allOptionsSelected;
        break;
      case this.orderNotifications:
        this.allOrdersSelected = this.allOptionsSelected;
        break;
      case this.claimNotifications:
        this.allClaimsSelected = this.allOptionsSelected;
        break;
      case this.reserveNotifications:
        this.allReservesSelected = this.allOptionsSelected;
        break;
      case this.quoteNotifications:
        this.allQuotesSelected = this.allOptionsSelected;
        break;

      default:
        break;
    }
  }

  onSelectAllOrders(e: any) {
    this.checkAllNotifications(this.orderNotifications, e);
    this.allOrdersSelected = e.state;
  }

  onSelectAllReserves(e: any) {
    this.checkAllNotifications(this.reserveNotifications, e);
    this.allReservesSelected = e.state;
  }

  onSelectAllQuotes(e: any) {
    this.checkAllNotifications(this.quoteNotifications, e);
  }

  onSelectAllClaims(e: any) {
    this.checkAllNotifications(this.claimNotifications, e);
    this.allClaimsSelected = e.state;
  }

  onSelectAllFinancials(e: any) {
    this.checkAllNotifications(this.financeNotifications, e);
    this.allFinancialsSelected = e.state;
  }

  checkAllNotifications(notifications: any, e: any) {
    for (const notification of notifications) {
      notification?.columns.map((data: any) => {
        data.checked = e.state;
        this.payload[data.value] = e.state;
      });
    }
  }

  changeRadioOrder(e: any) {
    if (e.state) {
      switch (e.group) {
        case "All Orders":
          this.selectMyOrder = !e.state;
          this.selectAllOrder = e.state;
          this.payload.allOrders = e.state;
          break;
        case "My Orders":
          this.selectMyOrder = e.state;
          this.selectAllOrder = !e.state;
          this.payload.allOrders = !e.state;
          break;
      }
    }
  }

  changeRadioReserve(e: any) {
    if (e.state) {
      switch (e.group) {
        case "All Reserves":
          this.selectMyReserves = !e.state;
          this.selectAllReserves = e.state;
          this.payload.allReserves = e.state;
          break;
        case "My Reserves":
          this.selectMyReserves = e.state;
          this.selectAllReserves = !e.state;
          this.payload.allReserves = !e.state;
          break;
      }
    }
  }
  changeRadioQuote(e: any) {
    if (e.state) {
      switch (e.group) {
        case "All Quotes":
          this.selectMyQuotes = !e.state;
          this.selectAllQuotes = e.state;
          this.payload.allQuotes = e.state;
          break;
        case "My Quotes":
          this.selectMyQuotes = e.state;
          this.selectAllQuotes = !e.state;
          this.payload.allQuotes = !e.state;
          break;
      }
    }
  }

  changeRadioClaims(e: any) {
    if (e.state) {
      switch (e.group) {
        case "All Claims":
          this.selectMyClaims = !e.state;
          this.selectAllClaims = e.state;
          this.payload.allClaims = e.state;
          break;
        case "My Claims":
          this.selectMyClaims = e.state;
          this.selectAllClaims = !e.state;
          this.payload.allClaims = !e.state;
          break;
      }
    }
  }

  // changeRadioFinancials(e: any) {
  //   if (e.state) {
  //     switch (e.group) {
  //       case "All Financials":
  //         this.selectMyFinancials = !e.state;
  //         this.selectAllFinancials = e.state;
  //         this.FinancialToGet("All Financials");
  //         break;
  //       case "My Financials":
  //         this.selectMyFinancials = e.state;
  //         this.selectAllFinancials = !e.state;
  //         this.FinancialToGet("My Financials");
  //         break;
  //     }
  //   }
  // }

  setNotificationData(checked: any, name: any) {
    this.payload[name] = checked.state;
  }

  // FinancialToGet(value: any) {
  //   this.selectFinalFinancials = value == "All Financials" ? true : false;
  // }

  scrollPageToTop() {
    this.scrollToTop.nativeElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest",
    });
  }
  changeRadioFinancials(e: any) {
    if (e.state) {
      //     switch (e.group) {
      //       case "All Financials":
      //         this.selectMyFinancials = !e.state;
      this.selectAllFinancials = e.state;
      this.payload.allFinance = e.state;
      //         break;
      //       case "My Financials":
      //         this.selectMyFinancials = e.state;
      //         this.selectAllFinancials = !e.state;
      //         this.payload.allFinance = !e.state;
      //         break;
      //     }
    }
  }
  onSubmit() {
    this.userService.profileProgress('notifications')
    this.userService
      .updateNotifications(this.payload)
      .pipe(
        switchMap(() => {
          return this.userService.getCurrentUserDetailData(true);
        }),
        catchError((error) => {
          this.userService.profileProgressHide()
          this.alertData = {
            message: error.message || "An error occurred.",
          };
          this.alertType = "danger";
          this.alertTrigger = true;
          return throwError(() => error);
        }),
        finalize(() => {
          this.userService.profileProgressHide()
          this.scrollPageToTop();
        })
      )
      .subscribe({
        next: (response) => {
          if (response?.body) {
            this.notifications = response?.body?.notifications;
            this.selectAllClaims = this.notifications?.allClaims;
            this.selectMyClaims = !this.notifications?.allClaims;
            this.payload.allClaims = this.notifications?.allClaims;
            this.selectAllOrder = this.notifications?.allOrders;
            this.selectMyOrder = !this.notifications?.allOrders;
            this.payload.allOrders = this.notifications?.allOrders;
            this.selectAllFinancials = this.notifications?.allFinance;
            this.payload.allFinance = this.notifications?.allFinance;
            this.selectAllQuotes = this.notifications?.allQuotes;
            this.payload.allQuotes = this.notifications?.allQuotes;
            this.selectAllReserves = this.notifications?.allReserves;
            this.selectMyReserves = !this.notifications?.allReserves;
            this.selectMyQuotes = !this.notifications?.allQuotes;
            this.payload.allReserves = this.notifications?.allReserves;
            this.setNotifications(this.orderNotifications);
            this.setNotifications(this.reserveNotifications);

            this.setNotifications(this.claimNotifications);
            this.setNotifications(this.financeNotifications);
            this.setNotifications(this.quoteNotifications);

            this.iscustomer = response?.body?.isCustomer;

            this.customerAccountType = response?.body?.orgUnit?.accountType;
            this.disablingmethod();
            this.userService.profileProgressHide()
            this.alertData = {
              message:
                response?.body?.message ||
                "My Profile Notifications updated Successfully.",
            };
            this.alertType = "success";
            this.alertTrigger = true;
            this.stopAlert();
          }
        },
        error: (err) => {
          this.alertData = {
            message: err || "Failed to update notifications.",
          };
          this.alertType = "danger";
          this.alertTrigger = true;
          this.stopAlert();
          this.userService.profileProgressHide()
        },
      });
  }

  stopAlert() {
    setTimeout(() => {
      this.alertTrigger = false;
    }, 6000);
  }
}
