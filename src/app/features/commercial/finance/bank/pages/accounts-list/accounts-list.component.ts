import { Component, OnInit, TemplateRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Config, Columns, DefaultConfig } from "ngx-easy-table";
import { StorageService } from "src/app/features/http-services/storage.service";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import { BankAccountService } from "../../services/bank-account.service";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";

@Component({
    selector: "app-accounts-list",
    templateUrl: "./accounts-list.component.html",
    styleUrls: ["./accounts-list.component.scss"],
    standalone: false
})
export class AccountsListComponent implements OnInit {
  breadcrumbItems: BreadcrumbItems = [
    {
      name: "Home",
      path: "/commercial",
      active: false,
    },
    {
      name: "Finance",
      path: "/",
      active: false,
    },
    {
      name: "Bank Accounts",
      path: "/",
      active: true,
    },
  ];
  orderby: string = "DESC";
  sortBy: string = "";
  modalRef?: BsModalRef;
  rowToDelete: any;

  constructor(
    private bankAccountService: BankAccountService,
    private router: Router,
    private storageService: StorageService,
    private route: ActivatedRoute,
    private userService: UserService,
    private modalService: BsModalService
  ) {}

  public configuration!: Config;
  public columns!: Columns[];
  public data: any = [];
  public errorMessage = "";
  public successMessage = "";
  public showErrorMessage: boolean = false;
  public showSuccessMessage: boolean = false;
  public loadingFlag: boolean = false;
  public isAdmin: boolean = false;
  totalAccountsLength: number = 0;
  userAccountNumber: any;

  ngOnInit(): void {
    this.errorMessage = "";
    this.successMessage = "";
    const queryParams: any = this.route.snapshot.queryParams;
    this.userService.getCurrentUserDetail().subscribe((res: any) => {
      if (
        res.body?.userPermissions.find(
          (item: any) => item === "Bank Account Setup"
        )
      ) {
        this.isAdmin = true;
      } else {
        this.isAdmin = false;
      }
    });
    if (this.router.url.includes("error")) {
      this.showErrorMessage = true;
      this.errorMessage = this.route.snapshot.queryParams["error"];
    }
    if (this.router.url.includes("message")) {
      this.showSuccessMessage = true;
      this.successMessage = this.route.snapshot.queryParams["message"];
    }
    this.configuration = { ...DefaultConfig };
    this.configuration.checkboxes = false;
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;
    this.columns = [
      {
        key: "accountName",
        title: "Name on Account",
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      {
        key: "accountAlias",
        title: "Financial Institution",
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      {
        key: "accountType",
        title: "Account Type",
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      {
        key: "currencyIsocode",
        title: "Currency",
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      {
        key: "routingNumber",
        title: "Bank Routing #",
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      {
        key: "accountNumber",
        title: "Bank Account #",
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
    ];
    if (this.isAdmin) {
      this.columns.push({ key: "action", title: "", orderEnabled: false });
    }
    this.userAccountNumber = this.storageService.uid;
    this.storageService.getItem("uid").subscribe((res: any) => {
      if (res) {
        this.userAccountNumber = res;
      } else {
        this.userAccountNumber = localStorage.getItem("accountNumber");
      }
    });
    this.pageIndex = 1;
    this.getBankAccounts();
  }

  getBankAccounts() {
    this.loadingFlag = true;
    this.bankAccountService
      .getBankAccounts(this.userAccountNumber, this.orderby, this.sortBy)
      .subscribe(
        (res: any) => {
          this.loadingFlag = false;
          this.data = res.body?.custBankAccData || [];
          this.totalAccountsLength =
            res?.body?.totalNumberOfResults || this.data.length;
          this.startValue =
            this.pageIndex * this.tableItemsSize - (this.tableItemsSize - 1);
          this.lastValue = this.startValue + this.tableItemsSize - 1;
          this.lastValue =
            this.lastValue > this.totalAccountsLength
              ? this.totalAccountsLength
              : this.lastValue;

          if (this.data.length == 0) {
            this.router.navigate(["/commercial/finance/bank/add-account"]);
          }
        },
        (err) => {
          this.loadingFlag = false;
        }
      );
  }

  deleteBankAccount(item: any) {
    this.modalRef?.hide();
    this.loadingFlag = true;
    const payload = {
      accountName: item?.accountName,
      accountNumber: item?.accountNumber,
      accountType: item?.accountType,
      currencyIsocode: item?.currencyIsocode,
      pk: item?.pk,
      routingNumber: item?.routingNumber,
      token: item?.token,
    };
    this.bankAccountService.deleteBankAccount(payload).subscribe({
      next: (res: any) => {
        this.loadingFlag = false;
        if (!!res.body?.errorCode) {
          if (res?.body?.errorCode === "0000") {
            this.successMessage =
              res.body?.message || "Account removed Sucessfully";
            this.showSuccessMessage = true;
          } else {
            this.errorMessage = res.body?.message;
            this.showErrorMessage = true;
          }
        }
        this.pageIndex = 1;
        this.getBankAccounts();
      },
      error: (res: any) => {
        this.loadingFlag = false;
        this.pageIndex = 1;
        this.getBankAccounts();
      },
    });
  }

  bankAccountClick(item: any) {
    this.storageService.setItem("bankAccountDetails", item);
    this.router.navigate(["commercial/finance/bank/edit-account"]);
  }
  selectedValues(data: any) {
    if (data.event === "onOrder") {
      this.sortBy = data?.value?.key;
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
      this.orderby =
        data?.value?.order == undefined
          ? "DESC"
          : data?.value?.order?.toUpperCase();
      this.pageIndex = 1;
    }
  }

  showDeleteAccModal(
    deleteAccTemplate: TemplateRef<any>,
    row: any,
    unsettledPaymentModal: TemplateRef<any>
  ) {
    this.bankAccountService.unsettledPayment(row?.token).subscribe((d: any) => {
      if (d?.body == false) {
        this.rowToDelete = row;
        this.modalRef = this.modalService.show(deleteAccTemplate, {
          id: 1,
          class: "modal-xl modal-dialog-centered",
          backdrop: "static",
          keyboard: false,
        });
      } else {
        this.modalRef = this.modalService.show(
          unsettledPaymentModal,
          Object.assign({
            id: "unsettledPaymentModal",
            class: "modal-md modal-dialog-centered",
            backdrop: "static",
            keyboard: false,
          })
        );
      }
    });
  }

  pageIndex: number = 1;
  tableItemsSize: number = 10;
  startValue: number =
    this.pageIndex * this.tableItemsSize - (this.tableItemsSize - 1);
  lastValue: number = this.startValue + this.tableItemsSize - 1;

  onTableDataChange(event: any) {
    this.pageIndex = event;
    if (0 == event) {
      this.pageIndex = 1;
    }
    this.startValue =
      this.pageIndex * this.tableItemsSize - (this.tableItemsSize - 1);
    this.lastValue = this.startValue + this.tableItemsSize - 1;
    this.lastValue =
      this.lastValue > this.totalAccountsLength
        ? this.totalAccountsLength
        : this.lastValue;
  }
}
