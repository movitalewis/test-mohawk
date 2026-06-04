import { Component, Inject, OnInit, TemplateRef } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { of } from "rxjs";
import { take } from "rxjs/operators";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { Columns } from "ngx-easy-table";
import { StorageService } from "src/app/features/http-services/storage.service";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import { DOCUMENT } from "@angular/common";

@Component({
    selector: "app-schedule-payment-confirmation",
    templateUrl: "./schedule-payment-confirmation.component.html",
    styleUrls: ["./schedule-payment-confirmation.component.scss"],
    standalone: false
})
export class SchedulePaymentConfirmationComponent implements OnInit {
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
      name: "Scheduled Payment Confirmation",
      path: "/",
      active: true,
    },
  ];

  // Payment Information
  accountNumber: any;
  address: string | undefined;
  currentDate: Date = new Date();
  confirmationNumber: string | undefined;
  totalAmount!: number;
  bankAccountNumber: string = "";

  // Receivables Table
  receivables: any;
  public columns!: Columns[];
  public data$ : any;
  priceLabel: string = "";

  // Pagination Controls
  totalLength!: number;
  pageIndex1: number = 1;
  tableItemsSize: number = 10;
  startValue: number =
    this.pageIndex1 * this.tableItemsSize - (this.tableItemsSize - 1);
  lastValue: number = this.startValue + this.tableItemsSize - 1;

  // View Deductions Modal
  modalRef?: BsModalRef;
  selectedDeductions: any;

  constructor(
    private modalService: BsModalService,
    private storageService: StorageService,
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    @Inject(DOCUMENT) private document: Document
  ) {
    // Populate Confirmation Number
    this.activatedRoute.queryParamMap.subscribe((res: any) => {
      this.confirmationNumber = res?.params?.confirmationNumber;
    });
  }

  ngOnInit(): void {
    this.data$ = this.storageService.getItem("selectedReceivables") || of([]);
    // Populate Bank Account Number
    this.storageService
      .getItem("selectedAccountDetail")
      .pipe(take(1))
      .subscribe((res: any) => {
        this.bankAccountNumber = res.accountNumber;
      });

    // Populate Receivables and Total Values
    this.data$.pipe(take(1)).subscribe((res: any) => {
      this.totalAmount = this.totalScheduledAmount(res);
      this.totalLength = res?.length;
      this.receivables = res;
      this.storageService.removeItem("selectedReceivables");
    });

    // Populate Table Columns and Address
    this.storageService
      .getItem("userInfo")
      .pipe(take(1))
      .subscribe(({ priceLabel, orgUnit }) => {
        this.priceLabel = priceLabel;
        this.accountNumber = orgUnit?.uid || "";
        this.columns = [
          { key: "company", title: "Company" },
          { key: "status", title: "Status" },
          {
            key: "documentNumber",
            title: "Document#",
            cssClass: { includeHeader: false, name: "color-red" },
          },
          { key: "documentDate", title: "Document Date" },
          { key: "openAmount", title: `Open Amount (${priceLabel})` },
          {
            key: "discountAmount",
            title: `Discount Amount (${priceLabel})`,
          },
          { key: "scheduledAmount", title: `Schedule Amount (${priceLabel})` },
          { key: "poNumber", title: "PO#" },
          { key: "deductionsData", title: "Deductions" },
        ];
        this.userService.getAddress(orgUnit?.uid).subscribe(({ body }) => {
          this.address = body[0]?.addresses[0]?.formattedAddress;
        });
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
   * Display the View Deductions Modal.
   *
   * @param {TemplateRef<any>} viewDeductions - the template reference for displaying deductions
   * @param {any[]} deductions - an array of deductions from the receivable
   */
  viewDeductions(viewDeductions: TemplateRef<any>, deductions: any) {
    this.selectedDeductions = deductions.map((deduction: any) => {
      return {
        amount: deduction.deductionAmount,
        description: deduction.deductionDescription,
        comments: deduction.comments || "None",
      };
    });
    this.modalRef = this.modalService.show(viewDeductions, {
      id: 1,
      class: "modal-xl modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }

  printPage() {
    let printContents: any, popupWin: any;
    this.showElementForPdf(false);
    printContents = this.document.getElementById("print-content")?.innerHTML;
    popupWin = window.open("", "_blank", "top=0,left=0,height=100%,width=auto");
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
        <title>${window.location.href}</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
        <link rel="stylesheet" href="/styles.css" crossorigin="anonymous">
        <link rel="stylesheet" href="/assets/print/order-details-print.css" crossorigin="anonymous">
        <style>
          @media print {
            .print-ignore {
              display: none !important;
            }
            .print-only {
              display: block !important;
            }
            .text-danger: {
              color: black !important;
            }
            .text-bold {
              font-weight: bolder;
            }
          }
        </style>
        </head>
        <body onload="window.print();window.close()">
        <img src="/assets/images/logo-residential-dark.png" width=250 style="margin:10px 0px">
        ${printContents}
        </body>
      </html>`);
    popupWin.document.close();
  }

  showElementForPdf(bool: boolean) {
    this.document.querySelectorAll(".print-element").forEach((element: any) => {
      element.style.display = bool == true ? "block" : "none";
    });
  }
}
