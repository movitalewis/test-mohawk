import { Component, OnInit, TemplateRef } from "@angular/core";
import { Config, Columns, DefaultConfig } from "ngx-easy-table";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import { FormControl } from "@angular/forms";
import { DailyPaymentReportService } from "../../services/daily-payment-report.service";
import { formatDate } from "@angular/common";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";

@Component({
    selector: "app-daily-payment-report",
    templateUrl: "./daily-payment-report.component.html",
    styleUrls: ["./daily-payment-report.component.scss"],
    standalone: false
})
export class DailyPaymentReportComponent implements OnInit {
  modalRef?: BsModalRef;
  public configuration!: Config;
  public columns!: Columns[];
  public paymentsData: any;
  isCollapsed: boolean[] = [];
  tableLoading = true;
  dateSelected = new FormControl();
  accountNo: any;
  selectedDeductions: any;
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
      name: "Daily Payment Report",
      path: "/",
      active: true,
    },
  ];

  constructor(
    private service: DailyPaymentReportService,
    private modalService: BsModalService
  ) {}

  ngOnInit(): void {
    this.configuration = { ...DefaultConfig };
    this.configuration.checkboxes = false;
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;
    this.columns = [
      { key: "account", title: "AR Cust" },
      { key: "oblicationID", title: "Obligation ID" },
      { key: "openAmount", title: "Open Amount" },
      { key: "discountAmount", title: "Discount Amount" },
      { key: "netAmount", title: "Net Chrg Amount" },
      { key: "createdBy", title: "Entered By User" },
      { key: "createdDate", title: "Date Entered" },
      { key: "changedBy", title: "Last Updated User" },
      { key: "currency", title: "Currency" },
      { key: "deductions", title: "Deductions" },
    ];
    setTimeout(() => {
      this.tableLoading = false;
    }, 2000);
  }

  viewReports() {
    this.accountNo = localStorage.getItem("accountNumber");
    this.tableLoading = true;
    this.service
      .getReport(
        formatDate(this.dateSelected.value, "MM/dd/yyyy", "en-US"),
        this.accountNo
      )
      .subscribe({
        next: (res: any) => {
          if (res?.body?.financeReportDataList?.length > 0) {
            this.paymentsData = res?.body?.financeReportDataList;
            this.tableLoading = false;
          } else {
            this.paymentsData = [];
          }
          this.tableLoading = false;
        },
        error: (err: any) => {
          this.tableLoading = false;
        },
      });
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
        amount: deduction.deductionAmt,
        description: deduction.deductionDesc,
        comments: deduction.comment,
      };
    });
    this.modalRef = this.modalService.show(viewDeductions, {
      id: 1,
      class: "modal-xl modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }
}
