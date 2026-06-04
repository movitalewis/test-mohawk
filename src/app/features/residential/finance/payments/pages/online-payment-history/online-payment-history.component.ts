import { Component, OnInit, TemplateRef } from "@angular/core";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { Config, Columns, DefaultConfig } from "ngx-easy-table";
import { ScheduledPaymentsService } from "src/app/features/residential/finance/payments/services/scheduled-payments.service";
import { StorageService } from "src/app/features/http-services/storage.service";
import { Observable, forkJoin, take } from "rxjs";
import { Router } from "@angular/router";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { MESSAGE_CONSTANTS } from "src/app/features/shared/constants/MESSAGE-CONSTANTS";
import { ProgressModalComponent } from "src/app/features/shared/components/progress-modal/progress-modal.component";

@Component({
    selector: "app-online-payment-history",
    templateUrl: "./online-payment-history.component.html",
    styleUrls: ["./online-payment-history.component.scss"],
    standalone: false
})
export class OnlinePaymentHistoryComponent implements OnInit {
  expandedIndex: number | undefined;
  modalRef?: BsModalRef;
  selectedDeductions: any;
  onlineFlag = true;
  scheduledFlag = false;
  suspendedFlag = false;
  loadingFlag: boolean = false;
  public scheduledPaymentsData: any = [];
  public suspendedPaymentsData: any = [];
  public onlinePaymentsData: any = [];
  onlinePaymentsData1: any = [];
  suspendedPaymentsData1: any = [];
  scheduledPaymentsData1: any = [];
  suspendedSelectedData: any = [];
  scheduledSelectedData: any = [];
  onlineSelectedData: any = [];
  errorMessage: any;
  successMessage: any;
  uid: any;
  priceLabel: string = "";
  payBills: boolean = false;
  scheduledCancellationSuccessMessage: string | undefined;
  scheduledCancellationErrorMessage: string | undefined;
  suspendedCancellationSuccessMessage: string | undefined;
  suspendedCancellationErrorMessage: string | undefined;
  public pagination = {
    limit: 10,
    offset: 0,
    count: -1,
  };
  public page = 0;
  maxSize: any;
  searchText: any = "";
  intialPageLoad: boolean = true;

  constructor(
    private modalService: BsModalService,
    private scheduledService: ScheduledPaymentsService,
    private storageService: StorageService,
    private router: Router,
    private userService: UserService
  ) {}

  suspendPaymentModal(template2: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template2, {
      id: 1,
      class: "modal-lg modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }
  schedulePaymentModal(template4: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template4, {
      id: 1,
      class: "modal-lg modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }
  cancelPaymentModal(template3: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template3, {
      id: 1,
      class: "modal-lg modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }

  breadcrumbItems: BreadcrumbItems = [
    {
      name: "Home",
      path: "/residential",
      active: false,
    },
    {
      name: "Finance",
      path: " ",
      active: false,
    },
    {
      name: "Online Payment History",
      path: "/",
      active: true,
    },
  ];
  public configuration!: Config;
  public configuration1!: Config;
  public configuration2!: Config;

  public columns!: Columns[];
  public columns1!: Columns[];
  public columns2!: Columns[];
  errorHandlingArray: any = [];
  customerNumber: any;
  ngOnInit(): void {
    this.maxSize = this.userService.updateMaxSize();
    this.loadingFlag = true;
    if (
      this.storageService?.userInfo?.userPermissions?.find(
        (item: any) => item === "Pay Bills"
      )
    ) {
      this.payBills = true;
    } else {
      this.payBills = false;
    }
    this.storageService
      .getItem("userInfo").pipe(take(1))
      .subscribe(({ uid, priceLabel, orgUnit }) => {
        this.uid = uid;
        this.priceLabel = priceLabel;
        this.customerNumber = orgUnit?.uid;
        if (this.customerNumber) {
          this.refreshOnlinePayments(0);
        }
        this.configuration = { ...DefaultConfig };
        this.configuration.checkboxes = false;
        this.configuration.tableLayout.striped = true;
        this.configuration.tableLayout.hover = false;
        this.configuration.paginationRangeEnabled = false;
        this.configuration.paginationEnabled = false;
        this.columns = [
          {
            key: "status",
            title: "Status",
            cssClass: { includeHeader: true, name: "sorting-arrow" },
          },
          {
            key: "document",
            title: "Document #",
            cssClass: { includeHeader: true, name: "sorting-arrow" },
          },
          {
            key: "documentDate",
            title: "Document Date (MM/DD/YYYY)",
            cssClass: { includeHeader: true, name: "sorting-arrow" },
          },
          {
            key: "openAmount",
            title: `Open Amount (${priceLabel})`,
            cssClass: { includeHeader: true, name: "sorting-arrow" },
          },
          {
            key: "availableDiscountAmount",
            title: `Discount Amount (${priceLabel})`,
            cssClass: { includeHeader: true, name: "sorting-arrow" },
          },
          {
            key: "scheduleAmount",
            title: `Schedule Amount (${priceLabel})`,
            cssClass: { includeHeader: true, name: "sorting-arrow" },
          },
          {
            key: "po",
            title: "PO #",
            cssClass: { includeHeader: true, name: "sorting-arrow" },
          },
          {
            key: "scheduledDate",
            title: "Last Edited Date (MM/DD/YYYY)",
            cssClass: { includeHeader: true, name: "sorting-arrow" },
          },
          {
            key: "action",
            title: "Deduction #",
            cssClass: { includeHeader: true, name: "sorting-arrow" },
          },
        ];
        this.configuration1 = { ...DefaultConfig };
        this.configuration1.checkboxes = false;
        this.configuration1.tableLayout.striped = true;
        this.configuration1.tableLayout.hover = false;
        this.configuration1.paginationRangeEnabled = false;
        this.configuration1.paginationEnabled = false;
        this.columns1 = [
          {
            key: "schedulestatus",
            title: "Status",
            cssClass: { includeHeader: true, name: "sorting-arrow" },
          },
          {
            key: "scheduledocument",
            title: "Document #",
            cssClass: { includeHeader: true, name: "sorting-arrow" },
          },
          {
            key: "scheduledocumentDate",
            title: "Document Date (MM/DD/YYYY)",
            cssClass: { includeHeader: true, name: "sorting-arrow" },
          },
          {
            key: "scheduleopenAmount",
            title: `Open Amount (${priceLabel})`,
            cssClass: { includeHeader: true, name: "sorting-arrow" },
          },
          {
            key: "scheduleavailableDiscountAmount",
            title: `Discount Amount (${priceLabel})`,
            cssClass: { includeHeader: true, name: "sorting-arrow" },
          },
          {
            key: "schedulescheduleAmount",
            title: `Schedule Amount (${priceLabel})`,
            cssClass: { includeHeader: true, name: "sorting-arrow" },
          },
          {
            key: "schedulepo",
            title: "PO #",
            cssClass: { includeHeader: true, name: "sorting-arrow" },
          },
          {
            key: "scheduleaction",
            title: "Deduction #",
            cssClass: { includeHeader: true, name: "sorting-arrow" },
          },
        ];

        this.configuration2 = { ...DefaultConfig };
        this.configuration2.checkboxes = false;
        this.configuration2.tableLayout.striped = true;
        this.configuration2.tableLayout.hover = false;
        this.configuration2.paginationRangeEnabled = false;
        this.configuration2.paginationEnabled = false;
        this.columns2 = [
          {
            key: "suspendstatus",
            title: "Status",
            cssClass: { includeHeader: true, name: "sorting-arrow" },
          },
          {
            key: "suspenddocument",
            title: "Document #",
            cssClass: { includeHeader: true, name: "sorting-arrow" },
          },
          {
            key: "suspenddocumentDate",
            title: "Document Date (MM/DD/YYYY)",
            cssClass: { includeHeader: true, name: "sorting-arrow" },
          },
          {
            key: "suspendopenAmount",
            title: `Open Amount (${priceLabel})`,
            cssClass: { includeHeader: true, name: "sorting-arrow" },
          },
          {
            key: "suspendavailableDiscountAmount",
            title: `Discount Amount (${priceLabel})`,
            cssClass: { includeHeader: true, name: "sorting-arrow" },
          },
          {
            key: "suspendscheduleAmount",
            title: `Schedule Amount (${priceLabel})`,
            cssClass: { includeHeader: true, name: "sorting-arrow" },
          },
          {
            key: "suspendpo",
            title: "PO #",
            cssClass: { includeHeader: true, name: "sorting-arrow" },
          },
          {
            key: "suspendaction",
            title: "Deduction #",
            cssClass: { includeHeader: true, name: "sorting-arrow" },
          },
        ];
      });
  }

  refreshOnlinePayments(pageNumber?: number) {
    this.expandedIndex = undefined;
    this.onlineSelectedData = [];
    this.onlinePaymentsData = [];
    this.page = pageNumber || 0;
    this.loadingFlag = true;
    if (this.intialPageLoad) {
      this.intialPageLoad = false;
      let messageConstants = MESSAGE_CONSTANTS.finance['onlinePaymentHistory'];
      this.openProgressModal({
        modalHeaderText: messageConstants?.headerText,
        progressText: messageConstants?.bodyText,
        progressBarText: messageConstants?.barText
      });
    }
    this.scheduledService
      .getOnlinePayments(
        this.storageService.uid,
        pageNumber || 0,
        this.searchText
      )
      .subscribe({
        next: (res: any) => {
          this.loadingFlag = false;
          this.modalService.hide("progressModal");
          this.pagination.count = res?.body?.totalNumberOfResults;
          if (!!res.body?.onlinePaymentDataList) {
            this.onlinePaymentsData1 = res.body.onlinePaymentDataList.map(
              (v: any) => {
                return { ...v, isChecked: false };
              }
            );
          } else {
            this.onlinePaymentsData1 = this.errorHandlingArray;
          }
          this.onlinePaymentsData = this.onlinePaymentsData1;
        },
        error: (e) => {
          this.loadingFlag = false;
          this.modalService.hide("progressModal");
          this.errorMessage = e.message;
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        },
      });
  }

  refreshScheduledPayments(pageNumber?: number) {
    this.expandedIndex = undefined;
    this.scheduledSelectedData = [];
    this.scheduledPaymentsData = [];
    this.page = pageNumber || 0;
    this.loadingFlag = true;
    this.scheduledService
      .getScheduledPayments(
        this.storageService.uid,
        pageNumber || 0,
        this.searchText
      )
      .subscribe({
        next: (res: any) => {
          this.loadingFlag = false;
          this.pagination.count = res?.body?.totalNumberOfResults;
          if (res.body?.schedulePaymentDataList) {
            this.scheduledPaymentsData1 = res.body.schedulePaymentDataList.map(
              (v: any) => {
                return { ...v, isChecked: false };
              }
            );
          } else {
            this.scheduledPaymentsData1 = this.errorHandlingArray;
          }
          this.scheduledPaymentsData = this.scheduledPaymentsData1;
        },
        error: (e) => {
          this.loadingFlag = false;
          this.modalService.hide("progressModal");
          this.errorMessage = e.message;
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        },
      });
  }

  refreshSuspendedPayments(pageNumber?: number) {
    this.expandedIndex = undefined;
    this.suspendedSelectedData = [];
    this.suspendedPaymentsData = [];
    this.page = pageNumber || 0;
    this.loadingFlag = true;
    this.scheduledService
      .getSuspendedPayments(
        this.storageService.uid,
        pageNumber || 0,
        this.searchText
      )
      .subscribe({
        next: (res: any) => {
          this.loadingFlag = false;
          this.pagination.count = res?.body?.totalNumberOfResults;
          if (res.body?.suspendedPaymentDataList) {
            this.suspendedPaymentsData1 = res.body.suspendedPaymentDataList.map(
              (v: any) => {
                return { ...v, isChecked: false };
              }
            );
          } else {
            this.suspendedPaymentsData1 = this.errorHandlingArray;
          }
          this.suspendedPaymentsData = this.suspendedPaymentsData1;
        },
        error: (e) => {
          this.loadingFlag = false;
          this.modalService.hide("progressModal");
          this.errorMessage = e.message;
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        },
      });
  }

  loadOnlinePayments() {
    // this.loadingFlag = true;
    this.onlineFlag = true;
    this.scheduledFlag = false;
    this.suspendedFlag = false;
    this.expandedIndex = undefined;
    this.searchText = "";
    this.refreshOnlinePayments(0);
  }

  loadScheduledPayments() {
    // this.loadingFlag = true;
    this.onlineFlag = false;
    this.scheduledFlag = true;
    this.suspendedFlag = false;
    this.expandedIndex = undefined;
    this.searchText = "";
    this.refreshScheduledPayments(0);
  }

  loadSuspendedPayments() {
    // this.loadingFlag = true;
    this.onlineFlag = false;
    this.scheduledFlag = false;
    this.suspendedFlag = true;
    this.expandedIndex = undefined;
    this.searchText = "";
    this.refreshSuspendedPayments(0);
  }

  onSearchOnlinePayments(event: any) {
    this.searchText = event?.target?.value || "";
    if (this.searchText.length > 2 || this.searchText.length === 0) {
      this.refreshOnlinePayments(0);
    }
  }

  onSearchScheduledPayments(event: any) {
    this.searchText = event?.target?.value || "";
    if (this.searchText.length > 2 || this.searchText.length === 0) {
      this.refreshScheduledPayments(0);
    }
  }

  onSearchSuspendedPayments(event: any) {
    this.searchText = event?.target?.value || "";
    if (this.searchText.length > 2 || this.searchText.length === 0) {
      this.refreshSuspendedPayments(0);
    }
  }

  onModalCancelPayment() {
    this.removeIsChecked();
    if (this.scheduledFlag) {
      const scheduledSelectedAPICalls$: Observable<any>[] =
        this.scheduledSelectedData.map((selection: any) =>
          this.scheduledService.cancelScheduledPayment(
            selection.pk,
            this.uid,
            selection
          )
        );
      forkJoin(scheduledSelectedAPICalls$).subscribe({
        next: () => {
          this.scheduledCancellationSuccessMessage =
            "Payment is successfully canceled.";
          this.searchText = "";
          this.refreshScheduledPayments();
          this.modalRef?.hide();
          setTimeout(() => {
            this.scheduledCancellationSuccessMessage = undefined;
          }, 4000);
        },
        error: () => {
          this.modalService.hide("progressModal");
          this.scheduledCancellationErrorMessage =
            "Payment cancellation failed.";
          this.searchText = "";
          this.refreshScheduledPayments();
          this.modalRef?.hide();
          setTimeout(() => {
            this.scheduledCancellationErrorMessage = undefined;
          }, 4000);
        },
      });
    } else if (this.suspendedFlag) {
      const suspendedSelectedAPICalls$: Observable<any>[] =
        this.suspendedSelectedData.map((selection: any) =>
          this.scheduledService.cancelSuspendedPayment(
            selection.pk,
            this.uid,
            selection
          )
        );
      forkJoin(suspendedSelectedAPICalls$).subscribe({
        next: () => {
          this.suspendedCancellationSuccessMessage =
            "Payment is successfully canceled.";
          this.searchText = "";
          this.refreshSuspendedPayments();
          this.modalRef?.hide();
          setTimeout(() => {
            this.suspendedCancellationSuccessMessage = undefined;
          }, 4000);
        },
        error: () => {
          this.modalService.hide("progressModal");
          this.suspendedCancellationErrorMessage =
            "Payment cancellation failed.";
          this.refreshSuspendedPayments();
          this.modalRef?.hide();
          setTimeout(() => {
            this.suspendedCancellationErrorMessage = undefined;
          }, 4000);
        },
      });
    }
  }

  onModalScheduleToSuspend() {
    this.removeIsChecked();
    if (this.scheduledFlag) {
      const scheduledSelectedAPICalls$: Observable<any>[] =
        this.scheduledSelectedData.map((selection: any) =>
          this.scheduledService.scheduleToSuspend(
            selection.pk,
            this.uid,
            selection
          )
        );
      forkJoin(scheduledSelectedAPICalls$).subscribe({
        next: () => {
          this.scheduledCancellationSuccessMessage =
            "Payment is successfully suspended.";
          this.refreshScheduledPayments();
          this.modalRef?.hide();
          setTimeout(() => {
            this.scheduledCancellationSuccessMessage = undefined;
          }, 4000);
        },
        error: () => {
          this.modalService.hide("progressModal");
          this.refreshScheduledPayments();
          this.modalRef?.hide();
        },
      });
    } else if (this.suspendedFlag) {
      const suspendedSelectedAPICalls$: Observable<any>[] =
        this.suspendedSelectedData.map((selection: any) =>
          this.scheduledService.suspendedToSchedule(
            selection.pk,
            this.uid,
            selection
          )
        );
      forkJoin(suspendedSelectedAPICalls$).subscribe({
        next: () => {
          this.suspendedCancellationSuccessMessage =
            "Payment is successfully scheduled.";
          this.refreshSuspendedPayments();
          this.modalRef?.hide();
          setTimeout(() => {
            this.suspendedCancellationSuccessMessage = undefined;
          }, 4000);
        },
        error: (err) => {
          if (err?.status == 200) {
            this.suspendedCancellationSuccessMessage =
              "Payment is successfully scheduled.";
            setTimeout(() => {
              this.suspendedCancellationSuccessMessage = undefined;
            }, 4000);
          }
          this.refreshSuspendedPayments();
          this.modalRef?.hide();
        },
      });
    }
  }

  onSelectPayments(e: any, selectedRow: any) {
    const checked = e.state;
    const value = e.value;
    selectedRow.isChecked = checked;
    if (this.onlineFlag) {
      this.onlineSelectedData = this.onlinePaymentsData.filter(
        (payment: any) => {
          return payment.isChecked;
        }
      );
    } else if (this.scheduledFlag) {
      this.scheduledSelectedData = this.scheduledPaymentsData.filter(
        (payment: any) => {
          return payment.isChecked;
        }
      );
    } else if (this.suspendedFlag) {
      this.suspendedSelectedData = this.suspendedPaymentsData.filter(
        (payment: any) => {
          return payment.isChecked;
        }
      );
    }
  }

  removeIsChecked() {
    if (this.onlineFlag) {
      this.onlineSelectedData.forEach((obj: any) => {
        delete obj["isChecked"];
      });
    } else if (this.scheduledFlag) {
      this.scheduledSelectedData.forEach((obj: any) => {
        delete obj["isChecked"];
      });
    } else if (this.suspendedFlag) {
      this.suspendedSelectedData.forEach((obj: any) => {
        delete obj["isChecked"];
      });
    }
  }

  setDateFormat(d: Date) {
    let objectDate = new Date(d);

    let day = objectDate.getDate();
    let month = objectDate.getMonth() + 1;
    let year = objectDate.getFullYear();

    if (day < 10) {
      return `${month}/0${day}/${year}`;
    }
    if (month < 10) {
      return `0${month}/${day}/${year}`;
    }
    return `${month}/${day}/${year}`;
  }

  isDisabled(data: any) {
    if (data == undefined || data.length <= 0) {
      return true;
    } else {
      return false;
    }
  }

  setPositive(num: number) {
    return Math.abs(num);
  }
  viewDeductions(viewDeductions: TemplateRef<any>, deductions: any) {
    this.selectedDeductions = deductions.map((deduction: any) => {
      return {
        amount: deduction.deductionAmount,
        description: deduction.deductionDescription,
        comments: deduction.comment || "None",
      };
    });
    this.modalRef = this.modalService.show(viewDeductions, {
      id: 1,
      class: "modal-xl modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }

  editPayment(selectedPayment: any, requestFrom: string) {
    let selectedPaymentArray = [];

    if (requestFrom == "scheduled") {
      selectedPaymentArray = this.scheduledSelectedData;
    } else {
      selectedPaymentArray = this.suspendedSelectedData;
    }

    this.storageService.removeItem("selectedReceivables");
    this.storageService.setItem(
      "selectedReceivables",
      selectedPaymentArray.map((receivable: any) => receivable.entries).flat(1)
    );
    this.storageService.setItem(
      "selectedBankAccount",
      selectedPaymentArray[0].bankAccountNumber
    );

    this.router.navigateByUrl("/residential/finance/payments/make-payment");
  }

  expand(index: any) {
    if (index === this.expandedIndex) {
      this.expandedIndex = undefined;
    } else {
      this.expandedIndex = index;
    }
  }

  onPaginationChange(event: any) {
    this.page = event - 1;
    if (this.onlineFlag) {
      this.refreshOnlinePayments(this.page);
    }
    if (this.scheduledFlag) {
      this.refreshScheduledPayments(this.page);
    }
    if (this.suspendedFlag) {
      this.refreshSuspendedPayments(this.page);
    }
  }

  tableSort(data: any) {
    if (data.event === "onOrder") {
      this.columns.map((item: any) => {
        if (item.key === data?.value?.key && item.hasOwnProperty("cssClass")) {
          if (data?.value?.order == "asc") {
            item.cssClass = {
              ...{},
              ...{ includeHeader: true, name: "sorting-arrow-active" },
            };
          } else if (data?.value?.order == "desc") {
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
