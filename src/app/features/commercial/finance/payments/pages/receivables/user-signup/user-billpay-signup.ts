import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Config, Columns, DefaultConfig } from "ngx-easy-table";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import { StorageService } from "src/app/features/http-services/storage.service";
import { MakePaymentService } from "../../../services/make-payment.service";
import { Subject, Subscription, async, take, takeUntil } from "rxjs";
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { UserService } from "src/app/features/shared/user/services/user.service";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { MESSAGE_CONSTANTS } from "src/app/features/shared/constants/MESSAGE-CONSTANTS";
import { ProgressModalComponent } from "src/app/features/shared/components/progress-modal/progress-modal.component";
import { ConfirmationDialogComponent } from "src/app/features/shared/components/confirmation-dialog/confirmation-dialog.component";

@Component({
    selector: "app-user-billpay-signup",
    templateUrl: "./user-billpay-signup.component.html",
    styleUrls: ["./user-billpay-signup.component.scss"],
    standalone: false
})
export class UserBillpaySignUpComponent implements OnInit {
  breadcrumbItems: BreadcrumbItems = [
    {
      name: "Home",
      path: "/commercial",
      active: false,
    },
    {
      name: "Finance",
      path: "/finance",
      active: false,
    },
    {
      name: "Make A Payment/Open Recievables",
      path: "/commercial/finance/payments/receivables",
      active: false,
    },
    {
      name: "Select-User",
      path: "/",
      active: true,
    },
  ];
  alertData = {
    message: "Request has been submitted. Pending Approval",
    type: "info",
  };
  messageSuccess: boolean = false;

  public configuration!: Config;
  public columns!: Columns[];
  @ViewChild("scrollToTop", { read: ElementRef }) scrollToTop: any;
  public userId: any;
  public userEmail: any;
  public selectedUsers: any = [];
  public loadingFlag: boolean = false;
  orderby: string = "";
  sortBy: string = "";
  public priceLabel: string = "";
  public selectedEmail: any;
  public payBillFlag: string = "";
  public payBillsPermission: boolean = false;
  ebillExpressURL!: SafeResourceUrl;
  isPayBillSignup: boolean = false;
  modalRef?: BsModalRef;
  messageConstants: any = "";
  allowPaybillSignup:boolean = false;
  ngOnInit(): void {
    this.activateRoute.queryParams.subscribe((params: any) => {
      this.isPayBillSignup = params?.payBillSignup ? true : false;
    });
    if (
      this.userService?.isWellsFargo() ||
      (!this.storageService.userInfo?.isCustomer &&
        (this.storageService.userInfo?.priceLabel == "USD" ||
          !this.storageService.userInfo?.orgUnit?.uid?.includes("8122")))
    ) {
      this.breadcrumbItems[2].path = "";
    }
    let uid = this.storageService.getItem("uid").subscribe((response: any) => {
      this.userId = response;
    });
    this.storageService
      .getItem("userInfo")
      .pipe(take(1))
      .subscribe(({ priceLabel, orgUnit, userPermissions }) => {
        this.priceLabel = priceLabel;
        this.payBillFlag = orgUnit?.paybillFlag;
        if (userPermissions?.find((item: any) => item === "Pay Bills")) {
          this.payBillsPermission = true;
        } else {
          this.payBillsPermission = false;
        }
      },(err)=>{
        this.modalService.hide("progressModal");
      });
    this.configuration = { ...DefaultConfig };
    this.configuration.radio = true;
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;
    this.columns = [
      { key: "customerName", title: "Name" },
      { key: "customerEmail", title: "User Emails" },
    ];

    this.getSelectBillPayUsers(uid);
  }

  constructor(
    private activateRoute: ActivatedRoute,
    private storageService: StorageService,
    private makePaymentService: MakePaymentService,
    private sanitizer: DomSanitizer,
    private userService: UserService,
    private modalService: BsModalService
  ) {}
  getSelectBillPayUsers(uid: any) {
    this.loadingFlag = true;
    let messageConstants = MESSAGE_CONSTANTS.finance["billBaySignUpList"];
    this.openProgressModal({
      modalHeaderText: messageConstants?.headerText,
      progressText: messageConstants?.bodyText,
      progressBarText: messageConstants?.barText,
    });
    this.makePaymentService.getSignUpBillPayUsers(uid).subscribe(
      (response: any) => {
        this.modalService.hide("progressModal");
        this.loadingFlag = false;
        this.allowPaybillSignup = response.body.allowPaybillSignup;
        this.selectedUsers = response.body.custSignUpInvoiceDataList;
        if (this.selectedUsers) {
          this.selectedUsers.map((item: any) => {
            if(item.isPayBillSignedup === true){
            item.checked = true;
            }else{
            item.checked = false;
            }
          });
        }
      }, () => {
        this.loadingFlag = false;
        this.modalService.hide("progressModal");
      });
  }
  onCheckboxChange(row:any, emailID: any) {
    this.selectedUsers.some((item: any) => {
      if (item.customerEmail == emailID) {
        item.checked = true;
        this.selectedEmail = row.isPayBillSignedup === true ? null :  emailID;
      } else {
        item.checked = false;
      }
    });
  }
  scrollPageToTop() {
    this.scrollToTop.nativeElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest",
    });
  }
  submitBtnClick(modalInfo:string) {
    this.openConfirmationModal({
      title: "Paybill-Signup Confirmation",
      content:modalInfo,
      primaryActionLabel: "YES",
      secondaryActionLabel: "NO",
      onPrimaryAction: () => {
        this.modalService.hide();
        this.submitBillPaySignUp();
      },
      onSecondaryAction: () => this.modalService.hide(),
    });
  }

  signUpPendingApprovalModal(modalInfo:string) {
    this.openConfirmationModal({
      title: "Pending Approval",
      content:modalInfo,
      primaryActionLabel: "OK",
      secondaryActionLabel: "",
      onPrimaryAction: () => {
        this.modalService.hide();
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
        id: "confirmationModal",
        class: "modal-md modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }
  submitBillPaySignUp() {
    // this.loadingFlag = true;
    let messageConstants = MESSAGE_CONSTANTS.finance["billBaySignUp"];
    this.openProgressModal({
      modalHeaderText: messageConstants?.headerText,
      progressText: messageConstants?.bodyText,
      progressBarText: messageConstants?.barText,
    });
    this.makePaymentService
      .submitSignUpBillPayUsers(this.selectedEmail)
      .subscribe(
        (response: any) => {
          this.modalService.hide("progressModal");
          this.scrollPageToTop();
          this.messageSuccess = true;
          this.alertData.message = response.body.message;
          this.alertData.type =
            response.body.status == "Failure" ? "danger" : "success";
          this.loadingFlag = false;
          this.userService.currentUserDetails.next(null);
          this.userService.currentUserDetails.subscribe((res) => {
            if (this.isPayBillSignup) {
              if (this.userService?.isWellsFargo()) {
                this.makePaymentService
                  .ebillExpressAuthentication()
                  .subscribe((res: any) => {
                    if (res?.body) {
                      let ebillUrl =
                        res.body?.url ||
                        "https://demo.e-billexpress.com/ebpp/MohawkTest/?ssotoken=601d0b02-568f-4460-9243-563cedbc2d85";
                      this.ebillExpressURL =
                        this.sanitizer.bypassSecurityTrustResourceUrl(ebillUrl);
                      let newTab = window.open(ebillUrl, "_blank");
                      if (
                        !newTab ||
                        newTab.closed ||
                        typeof newTab.closed === "undefined"
                      ) {
                        window.scrollTo({
                          top: 0,
                          behavior: "smooth",
                        });
                        this.messageSuccess = true;
                        (this.alertData.message =
                          "Popup blocked! Please allow popups for this site."),
                          (this.alertData.type = "warning");
                      }
                    }
                  });
              }
            }
          });
        },
        () => {
          this.loadingFlag = false;
          this.modalService.hide("progressModal");
        }
      );
  }
  handleBillPayClick(): void {
    const selectedUser = this.selectedUsers.find(
      (user: any) => user.customerEmail === this.selectedEmail
    );
    if (selectedUser) {
      if(selectedUser.isPaybillSignupPendingAprroval === true){
          let modalInfo = "This email id already requested for signup for this account, and it's currently pending approval."
          this.signUpPendingApprovalModal(modalInfo);
      }else if(this.allowPaybillSignup === false && selectedUser.isPaybillSignupPendingAprroval === false){
        let modalInfo = "You have an email id already signed up for this account, do you want to override?";
        this.submitBtnClick(modalInfo);
      }else{
        this.submitBillPaySignUp();
      }
    }
  }

  pageIndex: number = 1;
  tableItemsSize: number = 10;
  startValue: number =
    this.pageIndex * this.tableItemsSize - (this.tableItemsSize - 1);
  lastValue: number = this.startValue + this.tableItemsSize - 1;
  onTableDataChange(event: any) {
    this.pageIndex = event;
    this.startValue =
      this.pageIndex * this.tableItemsSize - (this.tableItemsSize - 1);
    this.lastValue = this.startValue + this.tableItemsSize - 1;
    this.lastValue =
      this.lastValue > this.selectedUsers.length
        ? this.selectedUsers.length
        : this.lastValue;
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