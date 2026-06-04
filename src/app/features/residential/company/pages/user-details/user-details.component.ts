import {
  Component,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import { Config, Columns, DefaultConfig } from "ngx-easy-table";
import { faL } from "@fortawesome/free-solid-svg-icons";
import { Router, ActivatedRoute } from "@angular/router";
import { ManagementService } from "../../services/management.service";
import { TabsetComponent } from "ngx-bootstrap/tabs";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { StorageService } from "src/app/features/http-services/storage.service";

@Component({
    selector: "app-user-details",
    templateUrl: "./user-details.component.html",
    styleUrls: ["./user-details.component.scss"],
    standalone: false
})
export class UserDetailsComponent implements OnInit {
  @ViewChild("staticTabs", { static: false }) staticTabs?: TabsetComponent;
  breadcrumbItems: BreadcrumbItems = [
    {
      name: "Home",
      path: "/residential",
      active: false,
    },
    {
      name: "Your Company",
      path: "/residential/company/manage-users",
      active: false,
    },
    {
      name: "",
      path: "",
      active: true,
    },
  ];
  checkStatus: any;

  constructor(
    private managementService: ManagementService,
    private route: ActivatedRoute,
    private router: Router,
    public modalService: BsModalService,
    public storageService: StorageService
  ) {
    setTimeout(() => {
      // console.log(" Res Triggered After 15000 Sec====>");
      this.visible = false;
    }, 10000);
  }
  public configuration!: Config;
  public columns!: Columns[];
  modalRef!: BsModalRef;
  public alertBox: any;
  visible: boolean = false;
  userStatus: string = "";
  userId: any;
  userDetails: any;
  accountDetails: any;
  notifications: any;
  permissions: any;
  //notifications sort
  allClaims: boolean = false;
  allQuotes: boolean = false;
  allReserves: boolean = false;
  allOrders: boolean = false;
  advanceShip: boolean = false;
  orderUpdates: boolean = false;
  claimConfirm: boolean = false;
  claimProcess: boolean = false;
  claimStatus: boolean = false;
  custAction: boolean = false;
  deliveryPickup: boolean = false;
  loadArrives: boolean = false;
  loadLeaves: boolean = false;
  newInvoice: boolean = false;
  orderConfirmation: boolean = false;
  outForDelivery: boolean = false;
  paymentConfirm: boolean = false;
  quoteCancelled: boolean = false;
  quoteConfirmation: boolean = false;
  quoteExpire: boolean = false;
  reserveExpire: boolean = false;
  claimExpiry: boolean = false;
  returnAuth: boolean = false;
  hasPayBillFlag: boolean = false;
  alertData = { message: "", type: "success" };
  alertTrigger: boolean = false;
  showAlertWithLink: boolean = false;
  signUpPricing:boolean = false;

  ngOnInit(): void {
    if (this.managementService.isUserUpdated) {
      this.alertData.message = "User updated successfully";
      this.alertTrigger = true;
      setTimeout(() => {
        this.managementService.isUserUpdated = false;
        this.alertData.message = "";
      }, 10000);
    }
    
    if (this.managementService.isUserAdded) {
      this.alertData.message = "User added successfully";
      this.alertTrigger = true;
      setTimeout(() => {
        this.managementService.isUserAdded = false;
        this.alertData.message = "";
      }, 10000);
    }
    // this.route.queryParams.subscribe((params) => {
    //   if (
    //     params["registered"] !== undefined &&
    //     params["registered"] === "true"
    //   ) {
    //     this.alertData.message = "User added successfully";
    //     this.alertTrigger = true;
    //     // this.closeAlert();
    //   }
    // });
    this.userId = this.route.snapshot.paramMap.get("id");
    this.managementService.getUserById(this.userId).subscribe((res) => {
      this.userDetails = res.body;
      this.userDetails.workPhone = this.userDetails.workPhone ? this.userDetails.workPhone.replace(/[^0-9]/g, '') : this.userDetails.workPhone;
      this.userDetails.mobilePhone = this.userDetails.mobilePhone ? this.userDetails.mobilePhone.replace(/[^0-9]/g, '') : this.userDetails.mobilePhone;
      this.checkStatus = res.body.active;
      if (this.checkStatus) {
        this.userStatus = "Active";
        this.staticTabs!.tabs[0].active = true;
      } else {
        this.userStatus = "Inactive";
        this.staticTabs!.tabs[1].active = true;
      }

      this.notifications = res.body.notifications;
      this.hasPayBillFlag = res.body.payBillSignup;
      this.permissions = res.body.userPermissions;
      this.breadcrumbItems[this.breadcrumbItems.length - 1].name = this.userId;
      this.signUpPricing = res.body.pricingAnnouncementsSubscriptionEnabled;
      this.getAccountDetails();
      this.getNotificationDetails(this.notifications);
    });

    this.configuration = { ...DefaultConfig };
    this.configuration.checkboxes = false;
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.columns = [
      { key: "Account", title: "Account" },
      { key: "Division", title: "Division" },
    ];
  }

  fetchUser() {
    this.managementService.getUserById(this.userId).subscribe((res) => {
      this.userDetails = res.body;
      this.userDetails.workPhone = this.userDetails.workPhone?.replace(/[^0-9]/g, '');
      this.userDetails.mobilePhone = this.userDetails.mobilePhone?.replace(/[^0-9]/g, '');
      this.checkStatus = res.body.active;
      if (this.checkStatus) {
        this.userStatus = "Active";
        this.staticTabs!.tabs[0].active = true;
      } else {
        this.userStatus = "Inactive";
        this.staticTabs!.tabs[1].active = true;
      }
    });
  }

  onDisableStatus() {
    if (this.hasPayBillFlag) {
      this.showAlertWithLink = true;
      this.modalRef!.hide();
      this.fetchUser();
      return;
    }
    const user = this.userId;
    this.managementService.progressShow('disable')
    this.managementService.disableUser(user).subscribe((res: any) => {
      this.fetchUser();
      this.visible = true;
      this.alertBox = res.body.message;
      this.modalRef!.hide();
      this.managementService.progressHide()
    }),
      (err: any) => {
        if (err) {
          this.managementService.progressHide()
        }
      };
  }
  onCancelDisable() {
    this.fetchUser();
    // this.staticTabs!.tabs[1].deselect;
    this.modalRef!.hide();
  }
  onEnableStatus() {
    const user = this.userId;
    this.managementService.progressShow('enable')
    this.managementService.enableUser(user).subscribe((res: any) => {
      this.fetchUser();
      this.visible = true;
      this.alertBox = res.body.message;
      this.modalRef!.hide();
      this.managementService.progressHide()
    }),
      (err: any) => {
        if (err) {
          this.managementService.progressHide()
        }
      };
  }
  onCancelEnable() {
    this.fetchUser();
    // this.staticTabs!.tabs[0].deselect;
    this.modalRef!.hide();
  }

  onShowStatusModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      id: 1,
      class: "modal-lg modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }

  navigateToAddUser() {
    this.router.navigate(["residential/company/add-new-user"]);
  }

  navigateToCompanyList() {
    this.router.navigate(["residential/company/manage-users"]);
  }

  getAccountDetails() {
    this.managementService
      .getCompanyUserAccountList(this.userId)
      .subscribe((res) => {
        this.accountDetails = res.body;
      },(err)=>{
        this.managementService.progressHide()
      });
  }

  closeAlert() {
    setTimeout(() => {
      this.alertData.message = "";
    }, 4000);
  }

  getNotificationDetails(data: any) {
    for (const [key, val] of Object.entries(data)) {
      switch (true) {
        case key.includes("emailOrderUpdatesNotificationEnabled"): {
          val === true ? (this.orderUpdates = true) : (this.orderUpdates = false);
          break;
        }
        case key.includes("emailAdvanceShipNotificationEnabled"): {
          val === true ? (this.advanceShip = true) : (this.advanceShip = false);
          break;
        }
        case key.includes("emailClaimConfirmNotificationEnabled"): {
          val === true
            ? (this.claimConfirm = true)
            : (this.claimConfirm = false);
          break;
        }
        case key.includes("emailClaimProcessNotificationEnabled"): {
          val === true
            ? (this.claimProcess = true)
            : (this.claimProcess = false);
          break;
        }
        case key.includes("emailClaimStatusNotificationEnabled"): {
          val === true ? (this.claimStatus = true) : (this.claimStatus = false);
          break;
        }
        case key.includes("emailClaimExpiryNotificationEnabled"): {
          val === true ? (this.claimExpiry = true) : (this.claimExpiry = false);
          break;
        }
        case key.includes("emailReturnAuthNotificationEnabled"): {
          val === true ? (this.returnAuth = true) : (this.returnAuth = false);
          break;
        }
        case key.includes("emailCustActionNotificationEnabled"): {
          val === true ? (this.custAction = true) : (this.custAction = false);
          break;
        }
        case key.includes("emailDeliveryPickupNotificationEnabled"): {
          val === true
            ? (this.deliveryPickup = true)
            : (this.deliveryPickup = false);
          break;
        }
        case key.includes("emailLoadArrivesNotificationEnabled"): {
          val === true ? (this.loadArrives = true) : (this.loadArrives = false);
          break;
        }
        case key.includes("emailLoadLeavesNotificationEnabled"): {
          val === true ? (this.loadLeaves = true) : (this.loadLeaves = false);
          break;
        }
        case key.includes("emailNewInvoiceNotificationEnabled"): {
          val === true ? (this.newInvoice = true) : (this.newInvoice = false);
          break;
        }
        case key.includes("emailOutForDeliveryNotificationEnabled"): {
          val === true
            ? (this.outForDelivery = true)
            : (this.outForDelivery = false);
          break;
        }
        case key.includes("emailPaymentConfirmNotificationEnabled"): {
          val === true
            ? (this.paymentConfirm = true)
            : (this.paymentConfirm = false);
          break;
        }
        case key.includes("emailQuoteCancelledNotificationEnabled"): {
          val === true
            ? (this.quoteCancelled = true)
            : (this.quoteCancelled = false);
          break;
        }
        case key.includes("emailQuoteConfirmationNotificationEnabled"): {
          val === true
            ? (this.quoteConfirmation = true)
            : (this.quoteConfirmation = false);
          break;
        }
        case key.includes("emailQuoteExpiryNotificationEnabled"): {
          val === true ? (this.quoteExpire = true) : (this.quoteExpire = false);
          break;
        }
        case key.includes("emailReserveExpireNotificationEnabled"): {
          val === true
            ? (this.reserveExpire = true)
            : (this.reserveExpire = false);
          break;
        }
        case key.includes("emailOrderNotificationEnabled"): {
          val === true
            ? (this.orderConfirmation = true)
            : (this.orderConfirmation = false);
          break;
        }
        case key.includes("allClaims"): {
          val === true ? (this.allClaims = true) : (this.allClaims = false);

          break;
        }
        case key.includes("allOrders"): {
          val === true ? (this.allOrders = true) : (this.allOrders = false);
          break;
        }
        case key.includes("allQuotes"): {
          val === true ? (this.allQuotes = true) : (this.allQuotes = false);
          break;
        }
        case key.includes("allReserves"): {
          val === true ? (this.allReserves = true) : (this.allReserves = false);
          break;
        }
      }
    }
  }
}
