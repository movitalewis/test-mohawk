import { DatePipe } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { Columns, Config, DefaultConfig } from "ngx-easy-table";
import { ClaimsService } from "../../services/claims.service";
import { SelectInvoiceLineComponent } from "../select-invoice-line/select-invoice-line.component";
import { UserService } from "src/app/features/shared/user/services/user.service";

@Component({
    selector: "app-invoice-search-popup",
    templateUrl: "./invoice-search-popup.component.html",
    styleUrls: ["./invoice-search-popup.component.scss"],
    standalone: false
})
export class InvoiceSearchPopupComponent implements OnInit {
  @Input() modalRef?: BsModalRef;
  searchModal: any;
  @Output() recordsSelected = new EventEmitter();
  public columns1!: Columns[];
  maxDate = new Date();
  selectedRecords = [];
  searchByData = [
    { name: "Invoice #", value: "invoiceNumber" },
    { name: "Order #", value: "orderNumber" },
    { name: "PO #", value: "poNumber" },
    { name: "Sidemark", value: "sideMark" },
    { name: "Style #", value: "styleNumber" },
    { name: "Style Name", value: "styleName" },
    { name: "Color #", value: "colorNumber" },
    { name: "Color Name", value: "colorDescription" },
    { name: "Bill of Lading #", value: "billOfLandingNumber" },
    { name: "Roll #", value: "rollNumber" },
  ];
  shipToData: any[] = [];
  searchCriteria = {
    dateText: "",
    searchType: null,
    searchText: "",
    shipTo: null,
    oneTimeShipAddress: "",
  };
  invoiceData: any = [];
  public configuration1!: Config;
  public isSearchClicked = false;
  spinnerLoading: boolean = false;
  alertData = { message: "Invoice is not found." };
  alertType = "danger";

  constructor(
    public modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private datePipe: DatePipe,
    private claimsService: ClaimsService,
        private userService: UserService
  ) {}

  ngOnInit(): void {
    this.configuration1 = { ...DefaultConfig };
    this.configuration1.checkboxes = false;
    this.configuration1.tableLayout.striped = true;
    this.configuration1.tableLayout.hover = false;
    this.configuration1.paginationRangeEnabled = false;
    this.configuration1.paginationEnabled = true;
    this.columns1 = [
      { key: "invoiceNumber", title: "Invoice #" },
      { key: "invoiceDate", title: "Invoice Date" },
      { key: "erpOrderNumber", title: "Order #" },
      { key: "orderDate", title: "Order Date" },
      { key: "poNumber", title: "PO #" },
      { key: "invoiceTotal", title: "Invoice Total (USD)" },
    ];
    // this.spinnerLoading = true;
    this.userService.progressShow('shipToAddress');
    this.claimsService.shipToAddresses().subscribe(
      (res: any) => {
        this.spinnerLoading = false;
        this.userService.progressHide('shipToAddress');
        this.shipToData = res.body?.addresses;
        this.shipToData.filter((data: any) => {
          data.name = data.companyName + " - " + data.formattedAddress;
        });
      },
      () => {
        this.spinnerLoading = false;
        this.userService.progressHide('shipToAddress');
      }
    );
  }

  search(search = false) {
    // this.spinnerLoading = true;
    let payload: any = {};
    this.searchByData.forEach((item) => {
      if (this.searchCriteria.searchType === item.value) {
        payload[item.value] = this.searchCriteria.searchText;
      } else {
        payload[item.value] = "";
      }
    });
    payload.dateText = "";
    if (this.searchCriteria.dateText != "") {
      payload.dateText =
        this.datePipe.transform(this.searchCriteria.dateText[0], "MMM d,y") +
        "-" +
        this.datePipe.transform(this.searchCriteria.dateText[1], "MMM d,y");
    }

    payload = { ...this.searchCriteria, ...payload };
    this.userService.progressShow('invoiceSearch');
    
    this.claimsService.searchInvoice(payload).subscribe(
      (res: any) => {
        this.spinnerLoading = false;
        this.userService.progressHide('invoiceSearch');
        this.invoiceData = res?.body?.invoices || [];
        this.invoiceData.map((item: any) => {
          item.selected = false;
        });
        this.isSearchClicked = this.invoiceData.length === 0; 
        setTimeout(() => {
          this.isSearchClicked = false;
        }, 8000);
        if (search && this.invoiceData?.length > 0) {
          this.selectInvoiceLineModal(this.invoiceData, res?.body, payload);
        }
      },
      (err: any) => {
        this.spinnerLoading = false;
        this.userService.progressHide('invoiceSearch');
      }
    );
  }
  setSelectedRecords() {
    this.selectedRecords = this.invoiceData.filter(
      (item: any) => item.selected === true
    );
  }
  continueClick() {
    this.recordsSelected.emit(this.selectedRecords);
  }

  selectInvoiceLineModal(invoiceData: any, invoiceRes: any, payLoad: any) {
    const initialState: ModalOptions = {
      initialState: {
        invoiceData: invoiceData,
        totalRecords: invoiceRes?.totalNumberOfResults,
        totalPages: invoiceRes?.numberPagesShown,
        payLoad: payLoad,
      },
    };
    this.bsModalRef = this.modalService.show(
      SelectInvoiceLineComponent,
      Object.assign(initialState, {
        id: "selectInvoiceLineComponent",
        class: "modal-xl modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }

  onHideModal() {
    this.modalService.hide("InvoiceSearchPopupComponent");
  }

  errorTitle: boolean = false;
  closeAlert() {
    this.isSearchClicked = false;
  }

  selectSearchBy(e: any) {
    this.searchCriteria.searchText = "";
  }
}
