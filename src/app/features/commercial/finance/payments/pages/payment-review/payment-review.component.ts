import { Component, OnInit, TemplateRef } from "@angular/core";
import { Router } from "@angular/router";
import { of } from "rxjs";
import { take } from "rxjs/operators";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { Config, Columns, DefaultConfig } from "ngx-easy-table";
import { StorageService } from "src/app/features/http-services/storage.service";
import { MakePaymentService } from "../../services/make-payment.service";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import { UserService } from "src/app/features/shared/user/services/user.service";

@Component({
    selector: "app-payment-review",
    templateUrl: "./payment-review.component.html",
    styleUrls: ["./payment-review.component.scss"],
    standalone: false
})
export class PaymentReviewComponent implements OnInit {
  modalRef?: BsModalRef;
  accountNumber: any;
  receivables: any;
  breadcrumbItems: BreadcrumbItems = [
    {
      name: "Home",
      path: "/commercial",
      active: false,
    },
    {
      name: "Finance",
      path: " ",
      active: false,
    },
    {
      name: "Payment Review",
      path: "/",
      active: true,
    },
  ];
  public configuration: Config = {
    ...DefaultConfig,
    checkboxes: false,
    paginationEnabled: false,
    paginationRangeEnabled: false,
    tableLayout: {
      ...DefaultConfig.tableLayout,
      striped: true,
      hover: false,
    },
  };
  public columns!: Columns[];
  public data$: any
  totalAmount!: number;
  totalLength!: number;
  priceLabel: string = "";
  accountDetails: any = {};
  pageIndex1: number = 1;
  tableItemsSize: number = 5;
  startValue: number =
    this.pageIndex1 * this.tableItemsSize - (this.tableItemsSize - 1);
  lastValue: number = this.startValue + this.tableItemsSize - 1;
  userEmail: string = "";
  maxSize: any;
  constructor(
    private modalService: BsModalService,
    private storageService: StorageService,
    private paymentService: MakePaymentService,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.data$ =  this.storageService.getItem("selectedReceivables");;
    this.maxSize = this.userService.updateMaxSize();
    this.storageService
      .getItem("selectedAccountDetail")
      .pipe(take(1))
      .subscribe((res: any) => {
        this.accountDetails = res;
      });
    this.data$ = this.storageService.getItem("selectedReceivables") || of([]);
    this.data$.subscribe((res: any) => {
      this.totalAmount = this.totalScheduledAmount(res);
      this.totalLength = res?.length;
      this.receivables = res;
    });

    this.storageService
      .getItem("userInfo")
      .pipe(take(1))
      .subscribe(({ priceLabel, uid, orgUnit }) => {
        this.priceLabel = priceLabel;
        this.userEmail = uid;
        this.accountNumber = orgUnit?.uid || "";
        this.columns = [
          { key: "type", title: "Type" },
          { key: "status", title: "Status" },
          {
            key: "documentNumber",
            title: "Document#",
            cssClass: { includeHeader: false, name: "color-red" },
          },
          { key: "poNumber", title: "PO#" },
          { key: "documentDate", title: "Document Date" },
          { key: "openAmount", title: `Open Amount (${priceLabel})` },
          { key: "scheduledAmount", title: `Schedule Amount (${priceLabel})` },
        ];
      },(err)=>{
        this.paymentService.progressHide();
      });
  }

  /**
   * Creates a scheduled payment.
   *
   * @returns {void}
   */
  createSchedulePayment() {
    this.paymentService.progressShow('schedulePayment');
    this.paymentService
      .createSchedulePayment(
        {
          accountNumber: this.accountNumber,
          token: this.accountDetails.token,
          totalScheduledAmount: this.totalAmount.toFixed(2),
          receivables: this.receivables.map((receivable: any) => {
            if (!receivable.deductionEntries) {
              receivable.deductionEntries = [];
            }
            return {
              receivablePK: receivable.pk,
              deductionEntries: receivable.deductionEntries.map(
                (entry: any, index: number) => {
                  return {
                    ...entry,
                    pk: receivable.pk,
                    comment: entry.comments,
                    index,
                  };
                }
              ),
            };
          }),
        },
        this.userEmail
      )
      .subscribe({
        next: (res: any) => {
          this.paymentService.progressHide();
          this.storageService.removeItem("accountDetails");
          this.storageService.removeItem("editingPayment");
          this.router.navigate(
            ["/commercial/finance/payments/schedule-payment-confirmation"],
            {
              queryParams: {
                confirmationNumber: res?.body?.confirmationNumber,
              },
            }
          );
        },
        error: () => {
          this.paymentService.progressHide();
          this.router.navigate(["/commercial/finance/payments/receivables"], {
            queryParams: {
              errorMessage: "Payment Creation Failed",
            },
          });
        },
      });
  }

  /**
   * Creates a suspended payment.
   *
   * @return {void}
   */
  createSuspendPayment() {
    this.paymentService.progressShow('suspendPayment');
    this.paymentService
      .createSuspendPayment(
        {
          accountNumber: this.accountNumber,
          token: this.accountDetails.token,
          totalScheduledAmount: this.totalAmount.toFixed(2),
          receivables: this.receivables.map((receivable: any) => {
            if (!receivable.deductionEntries) {
              receivable.deductionEntries = [];
            }
            return {
              receivablePK: receivable.pk,
              deductionEntries: receivable.deductionEntries.map(
                (entry: any, index: number) => {
                  return {
                    ...entry,
                    pk: receivable.pk,
                    comment: entry.comment || "",
                    comments: entry.comments || "",
                    index,
                  };
                }
              ),
            };
          }),
        },
        this.userEmail
      )
      .subscribe({
        next: () => {
          this.paymentService.progressHide();
          this.storageService.removeItem("selectedReceivables");
          this.storageService.removeItem("accountDetails");
          this.router.navigate(["/commercial/finance/payments/receivables"], {
            queryParams: {
              successMessage: "Payment is successfully suspended.",
            },
          });
        },
        error: () => {
          this.paymentService.progressHide();
          this.router.navigate(["/commercial/finance/payments/receivables"], {
            queryParams: {
              errorMessage: "Payment Creation Failed",
            },
          });
        },
      });
  }

  /**
   * Calculates the total scheduled amount from the given scheduled amount data.
   *
   * @param {any[]} scheduledAmountData - The array of scheduled amount data.
   * @return {number} The total scheduled amount.
   */
  totalScheduledAmount(scheduledAmountData: any) {
    return scheduledAmountData
      ?.map((receivable: any) => {
        return receivable.scheduledAmount;
      })
      .reduce((a: number, b: number) => a + b, 0);
  }

  /**
   * Updates the table data based on the given pagination event.
   *
   * @param {any} event - The event that triggered the table data change.
   */
  onTableDataChange(event: any) {
    this.pageIndex1 = event;
    this.startValue =
      this.pageIndex1 * this.tableItemsSize - (this.tableItemsSize - 1);
    this.lastValue = this.startValue + this.tableItemsSize - 1;
    this.lastValue =
      this.lastValue > this.totalLength ? this.totalLength : this.lastValue;
  }

  /**
   * Cancels the payment in process and performs storage cleanup actions.
   *
   * @return {void}
   */
  cancelPayment() {
    this.storageService.removeItem("selectedReceivables");
    this.storageService.removeItem("accountDetails");
    this.router.navigate(["/commercial/finance/payments/receivables"], {
      queryParams: {
        successMessage: "Payment is successfully canceled.",
      },
    });
  }

  /**
   * Opens the schedule payment modal.
   *
   * @param {TemplateRef<any>} template1 - The template reference for the modal.
   */
  schedulePaymentModal(template1: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template1, {
      id: 1,
      class: "modal-lg modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }

  /**
   * Opens the suspend payment modal.
   *
   * @param {TemplateRef<any>} template2 - The template reference for the modal.
   * @return {void} This function does not return a value.
   */
  suspendPaymentModal(template2: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template2, {
      id: 1,
      class: "modal-lg modal-dialog-centered",
    });
  }

  /**
   * Opens the payment cancellation modal.
   *
   * @param {TemplateRef<any>} template3 - The template reference to the payment cancellation modal.
   * @return {void} This function does not return any value.
   */
  cancelPaymentModal(template3: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template3, {
      id: 1,
      class: "modal-lg modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }

  /**
   * Return to the Make a Payment page after adding the selected bank account to IndexedDB.
   *
   * @return {void} No return value.
   */
  editPayment() {
    this.storageService.setItem(
      "selectedBankAccount",
      this.accountDetails?.accountNumber
    );
    this.router.navigate(["/commercial/finance/payments/make-payment"]);
  }
}
