import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { Columns, Config, DefaultConfig } from "ngx-easy-table";
import { ClaimsService } from "../../services/claims.service";
import { SelectInvoicePopupComponent } from "../select-invoice-popup/select-invoice-popup.component";
import { UserService } from "src/app/features/shared/user/services/user.service";

@Component({
    selector: "commercial-open-claims",
    templateUrl: "./open-claims.component.html",
    styleUrls: ["./open-claims.component.scss"],
    standalone: false
})
export class OpenClaimsComponent implements OnInit {
  constructor(
    public modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private claimsService: ClaimsService,
    private router: Router,
    private userService: UserService
  ) {}
  public columns!: Columns[];
  public configuration!: Config;
  data = [];
  newData: any = [];
  totalLength: any = 0;
  spinnerLoading = false;
  ngOnInit(): void {
    this.configuration = { ...DefaultConfig };
    this.configuration.checkboxes = false;
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;
    this.columns = [
      { key: "invoiceNumber", title: "Invoice Number"  , cssClass: { includeHeader: true, name: "sorting-arrow" }  },
      { key: "claimNumber", title: "Claim Number"  , cssClass: { includeHeader: true, name: "sorting-arrow" }  },
      { key: "claimType", title: "Claim Type"  , cssClass: { includeHeader: true, name: "sorting-arrow" }  },
      {
        key: "totalClaimedAmount",
        title: "Total Claim Amount",
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      {
        key: "invoiceAmount",
        title: "Total Invoice Amount",
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },      
      { key: "submittedByName", title: "Submitted by"  , cssClass: { includeHeader: true, name: "sorting-arrow" } },
      { key: "claimStatus", title: "Claim Status"  , cssClass: { includeHeader: true, name: "sorting-arrow" } },
    ];
    const initialData: any = this.modalService.config.initialState;
    if (initialData?.openClaimsResponse) {
      this.newData = [];
      this.newData = initialData?.openClaimsResponse.claimsData || [];
      this.totalLength = initialData?.openClaimsResponse.totalResults;
    } else {
      this.getData(this.pageIndex, this.tableItemsSize);
    }
  }
  getData(pageIndex: any, pageSize: any) {
    const initialData: any = this.modalService.config.initialState;
    const invoiceData = initialData?.selectedInvoiceData;
    let payload = {
      colorName: "",
      colorNumber: "",
      consumerName: "",
      dateRange: "",
      dealerClaimDebit: "",
      invoiceNumber: invoiceData?.invoiceNumber,
      poNumber: "",
      searchText: "",
      sidemark: "",
      status: "",
      styleName: "",
      styleNumber: "",
      type: "",
    };
    this.userService.progressShow('openClaims');
    this.claimsService
      .getClaimsHistory(payload, pageIndex - 1, pageSize)
      .subscribe(
        (res) => {
          this.userService.progressHide('openClaims');
          this.newData = [];
          this.newData = res.body.claimsData || [];
          this.totalLength = res.body.totalResults;
          this.spinnerLoading = false;
        },
        (err) => {
          this.userService.progressHide('openClaims');
          this.spinnerLoading = false;
        }
      );
  }
  hideModal() {
    this.modalService.hide("OpenClaimsModal");
  }
  selectInvoiceModal() {
    const initialData: any = this.modalService.config.initialState;
    const invoiceData = initialData?.selectedInvoiceData;
    const initialState: ModalOptions = {
      initialState: {
        selectedInvoiceData: invoiceData,
      },
    };
    this.bsModalRef = this.modalService.show(
      SelectInvoicePopupComponent,
      Object.assign(initialState, {
        id: "SelectInvoicePopupComponent",
        class: "modal-xl modal-dialog-centered select-invoice-popup",
        backdrop: "static",
        keyboard: false,
      })
    );
  }
  claimNavigation(claimNumber: any) {
    // this.modalService.hide();
    this.hideModal();
    this.router.navigateByUrl(
      "/commercial/claims/details?claim=" + claimNumber
    );
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
      this.lastValue > this.totalLength ? this.totalLength : this.lastValue;

    this.getData(this.pageIndex, this.tableItemsSize);
  }
  currentSortOrder: 'asc' | 'desc' = 'asc';
  currentSortColumn: string = 'invoiceNumber';
  sorting(column: string) {
    if (this.currentSortColumn === column) {
      this.currentSortOrder = this.currentSortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSortColumn = column;
      this.currentSortOrder = 'asc';
    }
    this.data.sort((a: any, b: any) => {
      const aValue = a[column];
      const bValue = b[column];
  
      if (this.currentSortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  }
  onsort(e : any){
    this.columns.map((item: any) => {
      if (item.key === e?.value?.key && item.hasOwnProperty("cssClass")) {
        if (e?.value?.order == "asc") {
          item.cssClass = {
            ...{},
            ...{ includeHeader: true, name: "sorting-arrow-active" },
          };
        } else if (e?.value?.order == "desc") {
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
