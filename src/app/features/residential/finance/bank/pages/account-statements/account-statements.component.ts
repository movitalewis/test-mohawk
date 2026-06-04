import { Component, OnInit } from "@angular/core";
import { Config, Columns, DefaultConfig } from "ngx-easy-table";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import { FormControl } from "@angular/forms";
import { BankAccountService } from "../../services/bank-account.service";
import { Router } from "@angular/router";
import { formatDate } from "@angular/common";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { MESSAGE_CONSTANTS } from "src/app/features/shared/constants/MESSAGE-CONSTANTS";
import { ProgressModalComponent } from "src/app/features/shared/components/progress-modal/progress-modal.component";

@Component({
    selector: "app-account-statements",
    templateUrl: "./account-statements.component.html",
    styleUrls: ["./account-statements.component.scss"],
    standalone: false
})
export class AccountStatementsComponent implements OnInit {
  years: any[] = [];
  lastYearSelected: string = "";
  tableLoading = true;
  yearSelected = new FormControl();
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
      name: "Statements",
      path: "/",
      active: true,
    },
  ];
  accountNo: any;
  modalRef?: BsModalRef;
  messageConstants: any = "";

  constructor(
    private accountsService: BankAccountService,
    private router: Router,
    private modalService: BsModalService
  ) {}

  public configuration!: Config;
  public columns!: Columns[];
  public accountStatement: any = [];
  ngOnInit(): void {
    this.configuration = { ...DefaultConfig };
    this.configuration.checkboxes = false;
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;
    this.configuration.rows = 15;
    this.columns = [
      { key: "date", title: "Date" },
      { key: "action", title: "" },
    ];
    
    let currentYear = new Date().getFullYear();
    this.yearSelected.setValue(currentYear);
    this.viewStatements();
    setTimeout(() => {
      this.tableLoading = false;
    }, 2000);
  }

  viewStatements() {
    this.accountNo = localStorage.getItem("accountNumber");
    // this.tableLoading = true;
    this.lastYearSelected = this.yearSelected.value;
    this.accountStatement = [];
    let messageConstants = MESSAGE_CONSTANTS.finance['accountStatements'];
    this.openProgressModal({
      modalHeaderText: messageConstants?.headerText,
      progressText: messageConstants?.bodyText,
      progressBarText: messageConstants?.barText
    });
    this.accountsService
      .getBankAccountStatements(this.accountNo, this.yearSelected.value)
      .subscribe({
        next: (res: any) => {
          this.modalService.hide("progressModal");
          if (res?.body?.years?.length > 0) {
            this.years = res?.body?.years;
          }
          if (res?.body?.statementDates?.length > 0) {
            this.accountStatement = !!res?.body?.statementDates
              ? res?.body?.statementDates
              : [];
            this.tableLoading = false;
          }
          this.tableLoading = false;
        },
        error: (err: any) => {
          this.modalService.hide("progressModal");
          this.tableLoading = false;
        },
      });
  }

  navigateToAccountStatementDetails(row: any) {
    this.router.navigateByUrl(
      `/residential/finance/bank/account-statement-details/${row}`
    );
  }
  dateConvert(d: any) {
     var date = new Date(d).toISOString().slice(0, 10);
        return formatDate(date, "MM/dd/yyyy", "en-US");
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
