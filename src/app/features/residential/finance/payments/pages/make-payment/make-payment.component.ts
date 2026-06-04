import { Component, OnInit, TemplateRef } from "@angular/core";
import { Router } from "@angular/router";
import { take } from "rxjs/operators";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { Config, Columns, DefaultConfig } from "ngx-easy-table";
import { StorageService } from "src/app/features/http-services/storage.service";
import { BankAccountService } from "../../../bank/services/bank-account.service";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { MakePaymentService } from "../../services/make-payment.service";
@Component({
    selector: "app-make-payment",
    templateUrl: "./make-payment.component.html",
    styleUrls: ["./make-payment.component.scss"],
    standalone: false
})
export class MakePaymentComponent implements OnInit {
  loadingFlag: boolean = true;

  // Breadcrumbs
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
      name: "Make A Payment",
      path: "/",
      active: true,
    },
  ];

  // Modal Ref
  modalRef?: BsModalRef;

  // Alerts
  errorMessage: any;

  // Receivables Data
  public tableData: any = [];

  // Filtering / Sorting
  public previousKey = {
    active: "",
    direction: "asc",
  };

  // Receivables Table
  public configuration: Config = {
    ...DefaultConfig,
    checkboxes: true,
    paginationEnabled: false,
    paginationRangeEnabled: false,
    tableLayout: {
      ...DefaultConfig.tableLayout,
      striped: true,
      hover: false,
    },
  };
  public columns!: Columns[];
  public selected = new Set();
  public priceLabel: string = "";

  // Pagination
  pageIndex1: number = 1;
  tableItemsSize: number = 10;
  startValue: number =
    this.pageIndex1 * this.tableItemsSize - (this.tableItemsSize - 1);
  lastValue: number = this.startValue + this.tableItemsSize - 1;
  selectedIndex: any;

  // User Info
  accountDetails: any;
  accountNumber: any;
  selectedBankAcc: any;

  // Bottom Buttons
  preventContinue: boolean = true;
  maxSize: any;

  constructor(
    private router: Router,
    private modalService: BsModalService,
    private storageService: StorageService,
    private bankAccountService: BankAccountService,
    public bsModalRef: BsModalRef,
    private userService: UserService,
    private paymentService: MakePaymentService
  ) {}

  ngOnInit(): void {
    this.maxSize = this.userService.updateMaxSize();
    this.storageService
      .getItem("userInfo")
      .pipe(take(1))
      .subscribe(({ priceLabel }) => {
        this.priceLabel = priceLabel;
        this.columns = [
          { key: "company", title: "Company" },
          { key: "type", title: "Type" },
          { key: "status", title: "Status" },
          {
            key: "documentNumber",
            title: "Document",
            cssClass: { includeHeader: false, name: "color-red" },
          },
          { key: "poNumber", title: "PO" },
          { key: "documentDate", title: "Document Date" },
          { key: "openAmount", title: `Open Amount (${priceLabel})` },
          {
            key: "discountAmount",
            title: `Discount Amount (${priceLabel})`,
          },
          { key: "scheduledAmount", title: `Schedule Amount (${priceLabel})` },
        ];
      });
    this.paymentService.progressShow('bankAccountList');
    this.bankAccountService
      .getBankAccounts(localStorage.getItem("accountNumber"))
      .subscribe({
        next: (res: any) => {
          this.paymentService.progressHide();
          if (!!res.body?.custBankAccData) {
            this.accountDetails = res.body?.custBankAccData;
          }
          this.storageService.setItem("accountDetails", this.accountDetails);
          this.loadingFlag = false;
        },
        error: (e) => {
          this.paymentService.progressHide();
          this.errorMessage = e.message;
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        },
      });

    this.getReceivables();
    this.storageService.getItem("selectedBankAccount").subscribe((res: any) => {
      this.selectedBankAcc = res;
      this.selectedAccountDetail(res);
    });
  }

  /**
   * Opens the manage deductions modal.
   *
   * @param {TemplateRef<any>} manageDeductionsTemplate - The template reference for the manage deductions modal.
   */
  manageDeductionsModal(manageDeductionsTemplate: TemplateRef<any>) {
    this.modalRef = this.modalService.show(manageDeductionsTemplate, {
      id: 1,
      class: "modal-xl modal-dialog-centered manage-deduction",
      backdrop: "static",
      keyboard: false,
    });
  }

  /**
   * Opens the remove document modal.
   *
   * @param {TemplateRef<any>} removeDocumentTemplate - The template reference for removing the document.
   */
  removeDocumentModal(removeDocumentTemplate: TemplateRef<any>) {
    this.modalRef = this.modalService.show(removeDocumentTemplate, {
      id: 1,
      class: "modal-lg modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }

  getReceivables() {
    this.storageService
      .getItem("selectedReceivables")
      .pipe(take(1))
      .subscribe({
        next: (res: any) => {
          this.tableData = res;
          // this.dropSelection();
          if (this.tableData?.length < 1) {
            this.router.navigate(["residential/finance/payments/receivables"]);
          }
        },
        error: (e) => {
          this.paymentService.progressHide();
          this.errorMessage = e.message;
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        },
      });
  }

  selectedAccountDetail(value: any) {
    if (value) {
      this.preventContinue = false;
      this.storageService.setItem(
        "selectedAccountDetail",
        this.accountDetails.filter((acc: any) => acc.accountNumber === value)[0]
      );
    }
  }
  onClearSelectedAccount(value: any) {
    this.preventContinue = true;
    this.storageService.removeItem("selectedAccountDetail");
  }

  selectedPayment(event: any) {
    this.tableData.filter((el: any, i: number) => {
      if (el.documentNumber === event.value.documentNumber) {
        el.checked = event.state;
        this.selected.clear;
        this.selectedIndex = undefined;
        if (event.state) {
          this.selectedIndex = i;
          this.selected.add(event.value);
        }
      } else {
        el.checked = false;
      }
    });
  }

  addDocuments() {
    this.storageService.setItem("selectedReceivables", this.tableData);
    this.router.navigate(["residential/finance/payments/receivables"]);
  }

  removeDocuments() {
    this.selected.clear();
    this.storageService.setItem(
      "selectedReceivables",
      this.tableData.filter((receivable: any) => !receivable.checked)
    );
    this.modalRef?.hide();
    this.getReceivables();
  }

  onTableDataChange(event: any) {
    this.pageIndex1 = event;
    this.startValue =
      this.pageIndex1 * this.tableItemsSize - (this.tableItemsSize - 1);
    this.lastValue = this.startValue + this.tableItemsSize - 1;
    this.lastValue =
      this.lastValue > this.tableData.length
        ? this.tableData.length
        : this.lastValue;
  }

  onUpdateData(e: any) {
    this.tableData[this.selectedIndex] = e;
    this.storageService.setItem("selectedReceivables", this.tableData);
  }

  dropSelection() {
    this.storageService.removeItem("selectedReceivables");
  }

  cancelPayment() {
    this.dropSelection();
    this.router.navigate(["/residential/finance/payments/receivables"], {
      queryParams: {
        successMessage: "Payment is successfully canceled.",
      },
    });
  }

  continueToReview() {
    this.errorMessage = undefined;
    if (this.tableData && this.totalScheduledAmount(this.tableData) <= 0) {
      this.errorMessage = "Scheduled amount should be greater than 0.";
    } else if (!this.preventContinue) {
      this.storageService.setItem("selectedReceivables", this.tableData);
      this.router.navigate(["residential/finance/payments/review"]);
    } else {
      this.errorMessage = "Please select a bank account.";
    }
  }

  /**
   * Calculates the total scheduled amount from the given scheduled amount data.
   *
   * @param {any[]} scheduledAmountData - The array of scheduled amount data.
   * @return {string} - The total scheduled amount as a string with 2 decimal places.
   */
  totalScheduledAmount(scheduledAmountData: any) {
    return scheduledAmountData
      .map((receivable: any) => {
        return receivable.scheduledAmount;
      })
      .reduce((a: number, b: number) => a + b, 0)
      .toFixed(2);
  }
}
