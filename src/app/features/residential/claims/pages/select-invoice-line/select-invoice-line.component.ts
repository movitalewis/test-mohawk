import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { Config, Columns, DefaultConfig } from "ngx-easy-table";
import { ClaimsService } from "../../services/claims.service";
import { SelectInvoicePopupComponent } from "../select-invoice-popup/select-invoice-popup.component";
import { OpenClaimsComponent } from "../open-claims/open-claims.component";
import { InvoiceSearchPopupComponent } from "../invoice-search-popup/invoice-search-popup.component";
import { StorageService } from "src/app/features/http-services/storage.service";
import { InvoiceListService } from "../../../finance/invoices/services/invoice-list.service";
import { UserService } from "src/app/features/shared/user/services/user.service";
@Component({
    selector: "app-select-invoice-line",
    templateUrl: "./select-invoice-line.component.html",
    styleUrls: ["./select-invoice-line.component.scss"],
    standalone: false
})
export class SelectInvoiceLineComponent implements OnInit {
  @Output() messageEvent = new EventEmitter<string>();

  selectedRecords: any = [];
  spinnerLoading: boolean = false;
  public showAlert: boolean = false;
  public showMessage: any = "";

  pageIndex: number = 1;
  tableItemsSize: number = 10;
  totalRecords: number = 0;
  payLoad: any;
  isMobile: boolean | any;
  maxSize: any;
  constructor(
    public modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private claimsService: ClaimsService,
    public storageService: StorageService,
    private invoiceListService: InvoiceListService,
    private userService: UserService
  ) {
    this.getData();
  }

  getData() {
    this.spinnerLoading = true;
    const initialData: any = this.modalService.config.initialState;
    this.data = initialData?.invoiceData;
    this.spinnerLoading = false;
    this.totalRecords = initialData.totalRecords;
    this.payLoad = initialData?.payLoad;
  }
  openClaimsModal() {
    this.getOpenClaimsData();
  }
  selectInvoiceModal(openClaimsResponse: any) {
    const initialState: ModalOptions = {
      initialState: {
        selectedInvoiceData: this.selectedRecords[0],
        openClaimsResponse: openClaimsResponse,
      },
    };
    this.bsModalRef = this.modalService.show(
      OpenClaimsComponent,
      Object.assign(initialState, {
        id: "OpenClaimsModal",
        class: "modal-xl modal-dialog-centered ",
        backdrop: "static",
        keyboard: false,
      })
    );
  }

  getOpenClaimsData() {
    const invoiceData = this.selectedRecords[0];
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
    // this.spinnerLoading = true;
    this.userService.progressShow('openClaims');
    this.claimsService.getClaimsHistory(payload, 0, 10).subscribe(
      (res) => {
        this.spinnerLoading = false;
        this.userService.progressHide('openClaims');
        if (res.body.totalResults === 0) {
          this.selectInvoicePopup();
        } else {
          this.selectInvoiceModal(res.body);
        }
      },
      (err) => {
        this.spinnerLoading = false;
        this.userService.progressHide('openClaims');
      }
    );
  }

  selectInvoicePopup() {
    const initialState: ModalOptions = {
      initialState: {
        selectedInvoiceData: this.selectedRecords[0],
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

  public configuration!: Config;
  public columns: Columns[] = [];

  public data = [];
  orderBy = "DESC";
  sortBy = "invoiceNumber";

  ngOnInit(): void {
    this.maxSize = this.userService.updateMaxSize();
    this.configuration = { ...DefaultConfig };
    this.configuration.checkboxes = false;
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;
    this.configuration.horizontalScroll = true;
    this.columns = [
      { key: "#", title: "", width: "7%" },
      {
        key: "invoiceNumber",
        title: "Invoice #",
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      {
        key: "invoiceDate",
        title: "Invoice Date",
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      {
        key: "orderNumber",
        title: "Order #",
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      {
        key: "orderDate",
        title: "Order Date",
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      {
        key: "poNumber",
        title: "PO #",
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      {
        key: "invoiceTotal",
        title: "Invoice Total",
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      { key: "action", title: "" },
    ];
  }

  hideModal() {
    this.modalService.hide("InvoiceSearchPopupComponent");
    const initialState: ModalOptions = {
      initialState: {},
    };
    this.bsModalRef = this.modalService.show(
      InvoiceSearchPopupComponent,
      Object.assign(initialState, {
        id: "InvoiceSearchPopupComponent",
        class: "modal-lg modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
    this.modalService.hide("selectInvoiceLineComponent");
  }

  cancelModal() {
    this.modalService.hide("selectInvoiceLineComponent");
  }

  onSubmitModal(event: any, item: any, isRdioBoxClicked = true) {
    this.selectedRecords = [];
    if (isRdioBoxClicked) {
      event.value.selected = event.state;
      this.selectedRecords.push(event.value);
    } else {
      this.selectedRecords.push({
        ...item,
        selected: true,
      });
    }
  }
  hasRecordSelected(row: any) {
    return this.selectedRecords.some(
      (item: any) => item.invoiceNumber === row.invoiceNumber && item.selected
    );
  }

  startValue: number =
    this.pageIndex * this.tableItemsSize - (this.tableItemsSize - 1);
  lastValue: number = this.startValue + this.tableItemsSize - 1;
  onTableDataChange(event: any) {
    this.pageIndex = event;
    if (0 == event) {
      this.pageIndex = 1;
    }
    this.loadInvoiceData();
  }
  loadInvoiceData() {
    // this.spinnerLoading = true;
    this.userService.progressShow('invoiceSearch');
    this.claimsService
      .searchInvoice(
        this.payLoad,
        this.pageIndex - 1,
        this.orderBy,
        this.sortBy
      )
      .subscribe(
        (res: any) => {
          this.userService.progressHide('invoiceSearch');
          this.data = res.body?.invoices || [];
          this.spinnerLoading = false;
          this.totalRecords = res.body?.totalNumberOfResults;
          this.startValue =
            this.pageIndex * this.tableItemsSize - (this.tableItemsSize - 1);
          this.lastValue = this.startValue + this.tableItemsSize - 1;
          this.lastValue =
            this.lastValue > this.totalRecords
              ? this.totalRecords
              : this.lastValue;
        },
        (err: any) => {
          this.spinnerLoading = false;
          this.userService.progressHide('invoiceSearch');
        }
      );
  }

  downloadInvoicePdf(line: any) {
    if (line.hasOwnProperty("source") === false) {
      this.showAlert = true;
      this.showMessage = "Invalid source";
      setTimeout(() => {
        this.showAlert = false;
        this.showMessage = "";
      }, 4000);
    }
    if (line?.source === "S4") {
      // this.spinnerLoading = true;
      if (!!line?.invoicePdfFileId && line?.invoicePdfFileId !== "") {
        this.userService.progressShow('downloadingPdf');
    // invoicePdfFileId
        this.invoiceListService.downloadFile(line.invoicePdfFileId).subscribe(
          (res: any) => {
            this.spinnerLoading = false;
            this.userService.progressHide('downloadingPdf');
            let fileURL = "";
            if (window?.webkitURL) {
              fileURL = window.webkitURL.createObjectURL(res.body);
            } else {
              fileURL = URL.createObjectURL(res.body);
            }
            let a = document.createElement("a");
            a.href = fileURL;
            this.isMobile = window.innerWidth > 1024;
            if (!this.isMobile) {
              a.download = "Invoice-" + line.invoiceNumber + ".pdf";
            } else {
              a.target = "_blank";
            }
            a.click();
            a.remove();
          },
          () => {
            this.spinnerLoading = false;
            this.userService.progressHide('downloadingPdf');

          }
        );
      } else {
        this.spinnerLoading = false;
        this.userService.progressHide('downloadingPdf');
        this.showAlert = true;
        this.showMessage = "Unable to find Invoice PDF File ID.";
        setTimeout(() => {
          this.showAlert = false;
          this.showMessage = "";
        }, 4000);
      }
    } else if (line?.source === "CAMS") {
      // this.spinnerLoading = true;
      const inputDate = line.invoiceDate;
      const dateParts = inputDate.split("/");
      const year = dateParts[2];
      const month = dateParts[0].padStart(2, "0");
      const day = dateParts[1].padStart(2, "0");
      const convertedDate = `${year}${month}${day}`;
      let payload = {
        customer: line?.customerNumber,
        invoice: line?.invoiceNumber,
        invsdte: convertedDate,
        invedte: convertedDate,
        onddoctype: "INVMH",
        company: "R",
      };
      this.reportName = "Invoice_" + payload.invoice + ".pdf";
      this.userService.progressShow('downloadingPdf');
      this.invoiceListService.getInvoicePdf(payload).subscribe(
        (res) => {
          this.spinnerLoading = false;
          this.userService.progressHide('downloadingPdf');
          if (res.body.errorCode == "0000") {
            const blob = this.b64toBlob(res?.body?.File, "application/pdf");
            const fileURL = URL.createObjectURL(blob);
            const a = document.createElement("a");

            this.isMobile = window.innerWidth > 1024;

            if (!this.isMobile) {
              a.download = this.reportName;
              a.href = fileURL;
            } else {
              a.target = "_blank";
              a.href = fileURL;
            }
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          } else {
            this.showAlert = true;
            this.showMessage = res.body.errorMessage;
          }
        },
        (error) => {
          this.showAlert = true;
          this.spinnerLoading = false;
          this.userService.progressHide('downloadingPdf');
          this.showMessage = "Unable to retrieve data";
        }
      );
    }
  }
  base64data = "";
  reportName = ".pdf";
  public b64toBlob(b64Data: any, contentType: string) {
    contentType = contentType || "";
    let sliceSize = 512;
    var byteCharacters = atob(b64Data);
    var byteArrays = [];
    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);
      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      var byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    var blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }

  sortingByColumn(e: any) {
    if (e.event === "onOrder") {
      this.orderBy = e?.value?.order == undefined ? "DESC" : e?.value?.order;
      this.sortBy = e?.value?.key;
      this.pageIndex = 1;
      this.loadInvoiceData();
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
}
