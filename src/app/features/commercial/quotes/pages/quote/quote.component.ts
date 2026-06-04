import { style } from "@angular/animations";
import { Component, OnInit } from "@angular/core";
import { Columns, Config, DefaultConfig } from "ngx-easy-table";
import { StorageService } from "src/app/features/http-services/storage.service";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { QuotesService } from "../../services/quotes.service";
import { ProgressModalComponent } from "src/app/features/shared/components/progress-modal/progress-modal.component";
import { BsModalService, BsModalRef, ModalOptions } from "ngx-bootstrap/modal";
import { MESSAGE_CONSTANTS } from "src/app/features/shared/constants/MESSAGE-CONSTANTS";
@Component({
    selector: "app-quote",
    templateUrl: "./quote.component.html",
    styleUrls: ["./quote.component.scss"],
    standalone: false
})
export class QuoteComponent implements OnInit {
  breadcrumbItems: BreadcrumbItems = [
    {
      name: "Home",
      path: "/commercial",
      active: false,
    },
    {
      name: "Quotes",
      path: "commercial/quotes/quote",
      active: true,
    },
  ];
  modalRef?: BsModalRef;
  public configuration!: Config;
  public columns!: Columns[];
  searchByList!: Person[];
  SearchData = [];
  data: any[] = [];
  searchBy: string = "";
  quoteStatus: string = "";
  searchValue: string = "";
  showSuccessForCartHistory = false;
  showCancelQuoteMessage: string = "";
  createdQuoteNumber = 0;
  quoteCreated = false;
  totlRecords: any;
  allquoteData: any;
  tableLoading = false;
  searchText = "";
  searchedFlag = false;
  priceLabel: any;
  constructor(
    private quotesService: QuotesService,
    private userService: UserService,
    private storageService: StorageService,
    private modalService: BsModalService,
    public bsModalRef: BsModalRef
  ) {}

  ngOnInit(): void {
    this.stopAlert();
    this.getQuoteList(0);
    this.configuration = { ...DefaultConfig };
    this.configuration.checkboxes = false;
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;
    this.userService.getCurrentUserDetail().subscribe((response: any) => {
      this.priceLabel = response.body.priceLabel;
    });
    this.storageService.getItem("showSuccessForCartHistory").subscribe(
      (res) => {
        this.showSuccessForCartHistory = res;
      }
    );

    this.storageService.getItem("showCancelQuoteMessage").subscribe(
      (response) => {
        this.showCancelQuoteMessage = response;
      }
    );

    if (this.quotesService.isQuoteCreated) {
      this.quotesService.isQuoteCreated = false;
      this.createdQuoteNumber = this.quotesService.lastCreatedCode;
      this.quoteCreated = true;
      setTimeout(() => {
        this.quoteCreated = false;
      }, 10000);
    }

    this.columns = [
      {
        key: "states",
        title: "Status",
        orderEventOnly: true,
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      {
        key: "code",
        title: "Quote #",
        orderEventOnly: true,
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      {
        key: "name",
        title: "End User",
        width: "18%",
        orderEventOnly: true,
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      {
        key: "description",
        title: "Quote Description",
        width: "18%",
        orderEnabled: true,
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      {
        key: "jobLoc",
        title: "Job Location",
        orderEventOnly: true,
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      {
        key: "expirationTime",
        title: "Expiration",
        width: "10%",
        orderEventOnly: true,
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      {
        key: "Total",
        title: "Total " + this.priceLabel,
        orderEventOnly: true,
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
    ];

    function getMockPeople() {
      return [
        {
          id: "code",
          index: 2,
          name: "Quote #",
          status: "All Quotes",
          statusValue: "",
        },
        {
          id: "endUser",
          index: 2,
          name: "End User",
          status: "Submitted Quotes",
          statusValue: "BUYER_SUBMITTED",
        },
        {
          id: "description",
          index: 2,
          name: "Quote Description",
          status: "Offered Quotes",
          statusValue: "BUYER_OFFER",
        },
        {
          id: "stylename",
          index: 2,
          name: "Style Name",
          status: "Rejected Quotes",
          statusValue: "BUYER_REJECTED",
        },
        {
          id: "stylenumber",
          index: 2,
          name: "Style Number",
          status: "Expired Quotes",
          statusValue: "EXPIRED",
        },
      ];
    }
    let items = getMockPeople();
    this.searchByList = items;
    // this.quotesService
    //   .getQuotes(this.userService.getUserEmail().toLowerCase())
    //   .subscribe((res: any) => {
    //     this.data = res.body?.quotes ? res.body?.quotes : [];
    //   });
  }

  onStatusChange(event: any): void {
    const value = event?.statusValue == undefined ? "" : event?.statusValue;
    this.param.status = value;
    this.param.sortCode = "desc";
    //this.param.sortby = "";
    this.pageIndex = 1;
    this.param.currentPage = 0;
    this.getQuoteList(0);
  }

  onSearchBY(event: any): void {
    const value = event?.id;
    this.param.searchValue = "";
    this.searchText = "";
    this.param.sortCode = "desc";
    //this.param.sortby = "";
    this.param.searchBy = event?.id;
    this.searchedFlag = false;
    if (value == undefined) {
      this.param.searchBy = "";
      this.pageIndex = 1;
      this.param.currentPage = 0;
      this.getQuoteList(0);
    }
  }

  onSearchQuotes(inputValue: any): void {
    this.param.searchValue = inputValue ? inputValue.trim() : inputValue;
    this.searchText = this.param.searchValue;
    this.param.sortCode = "desc";
    this.param.currentPage = 0;
    this.searchedFlag = true;
    this.pageIndex = 1;
    this.getQuoteList(0);
  }

  pageIndex: number = 1;
  tableItemsSize: number = 10;
  startValue: number =
    this.pageIndex * this.tableItemsSize - (this.tableItemsSize - 1);
  lastValue: number = this.startValue + this.tableItemsSize - 1;

  onTableDataChange(event: any) {
    this.pageIndex = event;
    this.startValue =
      this.pageIndex * this.tableItemsSize - (this.tableItemsSize - 1);
    this.lastValue = this.startValue + this.tableItemsSize - 1;
    this.lastValue =
      this.lastValue > this.data.length ? this.data.length : this.lastValue;
  }
  stopAlert() {
    setTimeout(() => {
      this.storageService.setItem("showSuccessForCartHistory", false);
      this.storageService.setItem("showCancelQuoteMessage", "");
    }, 5000);
  }
  param = {
    searchBy: "",
    searchValue: "",
    status: "",
    sortby: "code",
    sortCode: "DESC",
    fields: "QUOTELANDING",
    pageSize: 10,
    currentPage: 0,
  };
  formatMoney(amount: number) {
    return "$" + amount.toFixed(2);
  }

  getQuoteList(event: any) {
    this.progressShow("QuoteList");
    this.quotesService.getQuoteList(this.param).subscribe({
      next: (res) => {
        this.tableLoading = false;
        this.progressHide();
        this.allquoteData = res.quotes || [];
        this.totlRecords = res.pagination?.totalResults || 0;
      },
      error: (err: any) => {
        this.progressHide();
        this.tableLoading = false;
      },
    });
  }
  onTablePageChange(event: any) {
    this.param.currentPage = event - 1;
    this.pageIndex = event;
    this.getQuoteList(event - 1);
  }
  sortingByColumns(e: any) {
    if (e.event === "onOrder") {
      this.param.sortby = e?.value?.key;
      if (e?.value?.key == "name") {
        this.param.sortby = "endUser";
      }
      this.param.sortCode = e?.value?.order?.toUpperCase();
      this.param.currentPage = 0;
      this.pageIndex = 1;
      this.getQuoteList(0);
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
  progressShow(msgType: any) {
    const messageConstants = MESSAGE_CONSTANTS?.quotes?.[msgType];
    this.openProgressModal({
      modalHeaderText: messageConstants?.headerText,
      progressText: messageConstants?.bodyText,
      progressBarText: messageConstants?.barText,
    });
  }

  progressHide() {
    this.modalService.hide("progressModal");
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

export interface Person {
  id: string;
  name: string;
  status: string;
}
