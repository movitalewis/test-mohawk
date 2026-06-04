import { DatePipe } from "@angular/common";
import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
  Config,
  Columns,
  DefaultConfig,
  APIDefinition,
} from "ngx-easy-table";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import { AccountService } from "../../../account/services/account.service";
import { ClaimsService } from "../../services/claims.service";
import { StorageService } from "src/app/features/http-services/storage.service";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { CLAIM_TYPE_OPTIONS } from "src/app/features/shared/constants/CLAIMS-CONSTANTS";

@Component({
    selector: 'app-claim-approval-list',
    templateUrl: './claim-approval-list.component.html',
    styleUrls: ['./claim-approval-list.component.scss'],
    standalone: false
})
export class ClaimApprovalListComponent implements OnInit, OnDestroy {
  maxDate = new Date();
  @ViewChild("claim", { static: true })
  claim!: APIDefinition;
  daterange1: any;
  claimDetails: any = [];
  tempClaimsData: any = [];
  public hierachyCode: any;
  spinnerLoading: boolean = false;
  public data = [];
  salesHierarchyCode: any = "";
  totalLength: any = 0;
  maxSize: any;
  salesManRole: any;
  tableItemsSize: number = 25;
  pageSizes: number[] = [25, 50, 100,200,300,400];
  claimTypes = CLAIM_TYPE_OPTIONS;

  constructor(
    private router: Router,
    private activateRoute: ActivatedRoute,
    public claimsService: ClaimsService,
    private datePipe: DatePipe,
    private accountService: AccountService,
    public storageService: StorageService,
    private userService: UserService
  ) {
    this.activateRoute.queryParams.subscribe((params: any) => {
      this.selectedStatus = params?.status || "";
    });
  }
  ngOnDestroy() {
    this.claimsService.approveRejectSuccessMsg = "";
  }

  breadcrumbItems: BreadcrumbItems = [
    {
      name: "Home",
      path: "/residential",
      active: false,
    },
    {
      name: "Claims Approval List",
      path: "/aproval-list",
      active: false,
    },
  ];

  public configuration1!: Config;
  public columns1!: Columns[];
  public redirectionObj: any = [];
  salesPersonInHouseFlag: any;

  navigateToClaimDetail(eventId: any) {
    this.router.navigateByUrl("residential/claims/approval-details?claim=" + eventId);
  }

  ngOnInit(): void {
    this.maxSize = this.userService.updateMaxSize();
    this.claimsService.selectedInvoiceLines = {};
    this.storageService.getItem("userInfo").subscribe((response: any) => {
      this.salesPersonInHouseFlag = 
          response?.isSalesPerson == true &&
          response?.isSalesOps == false &&
          response?.orgUnit?.inHouseAccount == true;
      if (response?.isSalesPerson || response?.isSalesOps) {
        this.salesManRole = response?.salesManRole;
        let isSalesPerson = response?.isSalesOps ? response?.isSalesOps : false;
      }
    },(err)=>{
      this.userService.progressHide()
    });

    this.configuration1 = { ...DefaultConfig };
    this.configuration1.checkboxes = false;
    this.configuration1.tableLayout.striped = true;
    this.configuration1.tableLayout.hover = false;
    this.configuration1.paginationRangeEnabled = false;
    this.configuration1.paginationEnabled = false;
    this.columns1 = [
      {
        key: "claimNumber",
        title: "Claim #",
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      {
        key: "claimSubmitDate",
        title: "Claim (submit) Date",
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      {
        key: "claimType",
        title: "Claim Type",
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      {
        key: "submittedByName",
        title: "Name",
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      {
        key: "sideMark",
        title: "Sidemark",
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      {
        key: "invoiceNumber",
        title: "Invoice #",
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      {
        key: "poNumber",
        title: "PO #",
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      {
        key: "totalClaimedAmount",
        title: "Total",
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      {
        key: "claimStatus",
        title: "Status",
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
    ];
    this.redirectionObj = [
      {
        key: "claimNumber",
        redirectionLink: "residential/claims/details?claim=",
      },
    ];
    let params: any = this.activateRoute.snapshot.queryParams;

    if (Object.keys(params).length) {
      if (params?.searchText) {
        this.searchText = params?.searchText;
        this.searchBy = "claimNumber";
        this.getClaimsHistory(0, this.tableItemsSize);
      }else{
        this.getClaimsHistory(0, this.tableItemsSize);
      }
    } else {
      this.getClaimsHistory(0, this.tableItemsSize);
    }
  }

  searchText: any = "";
  selectedStatus: any = "status-INPROCESS";
  selectedClaim: any = "";
  searchBy: any = "";
  orderby: string = "";
  sortBy: string = "";

  getSalesList(value: any, name: any) {
    if (value) {
      this.salesHierarchyCode = value;
      this.pageIndex = 1;
      this.getClaimsHistory(0, this.tableItemsSize);
    }
  }
  onPageSizeChange(e: any) {
    let value = e?.value;
    this.tableItemsSize = Number(value);
    this.pageIndex = 1; 
    this.getClaimsHistory(0, this.tableItemsSize);
  }


  getClaimsHistory(pageIndex: any, pageSize: any) {
    let payload = {
      salesHierarchyCode: "",
      colorName: "",
      colorNumber: "",
      consumerName: "",
      dateRange: this.tempData == undefined ? "" : this.tempData,
      dealerClaimDebit: "",
      invoiceNumber: "",
      poNumber: "",
      searchText: "",
      sidemark: "",
      status: this.selectedStatus == undefined ? "" : this.selectedStatus,
      styleName: "",
      styleNumber: "",
      type: this.selectedClaim == undefined ? "" : this.selectedClaim,
      orderBy: this.orderby,
      sort: this.sortBy,
      currentPage: pageIndex?.toString(),
      "totalNumberOfResults": this.tableItemsSize, 
    };
    if (this.searchBy != undefined && this.searchBy != null && this.searchBy != "") {
      payload = this.handeleSearchBy(payload);
    } else {
      payload.searchText = this.searchText;
    }
    // this.spinnerLoading = true;
    this.userService.progressShow('claimsApprovalHistory');
    this.claimDetails = [];
    this.claimsService.getClaimsApprovalHistory(payload).subscribe(
      (res) => {
        this.spinnerLoading = false;
        this.userService.progressHide('claimsApprovalHistory');
        this.totalLength = res.body.totalResults || 0;

        this.startValue =
          this.pageIndex * this.tableItemsSize - (this.tableItemsSize - 1);
        this.lastValue = this.startValue + this.tableItemsSize - 1;
        this.lastValue =
          this.lastValue > this.totalLength ? this.totalLength : this.lastValue;
        this.claimDetails = res.body.claimsData || [];
      },
      (err) => {
        this.spinnerLoading = false;
        this.userService.progressHide('claimsApprovalHistory');
        this.claimDetails = [];
        this.startValue = 0;
        this.lastValue = 0;
        this.totalLength = 0;
      }
    );
  }

  tempData: any;
  datechange(event: any) {
    this.tempData =
      this.datePipe.transform(this.daterange1[0], "MMM d, y") +
      " - " +
      this.datePipe.transform(this.daterange1[1], "MMM d, y");
    this.pageIndex = 1;
    this.getClaimsHistory(0, this.tableItemsSize);
  }

  dateConversion(dateToConvert: any) {
    let startDate = new Date(dateToConvert);
    let month =
      startDate.getMonth() + 1 < 10
        ? "0" + (startDate.getMonth() + 1)
        : startDate.getMonth() + 1;
    let year = startDate.getFullYear().toString().slice(2);
    let day =
      startDate.getDate() + 1 < 10
        ? "0" + startDate.getDate()
        : startDate.getDate() + 1;
    let finalDate = month + "/" + day + "/" + year;
    return finalDate;
  }

  onSearch(value: any) {
    this.searchText = value;
    this.pageIndex = 1;
    this.getClaimsHistory(0, this.tableItemsSize);
  }

  onStatus(value: any) {
    this.selectedStatus = value == undefined ? "" : value;
    this.pageIndex = 1;
    this.getClaimsHistory(0, this.tableItemsSize);
  }

  onClaim(val: any) {
    val = val === undefined ? "" : val;
    this.selectedClaim = val;
    this.pageIndex = 1;
    this.getClaimsHistory(0, this.tableItemsSize);
  }

  onSearchBy($event: any) {
    this.searchBy = $event;
  }

  handeleSearchBy(payload: any) {
    if (this.searchBy != undefined || null || "") {
      let searchBy = this.searchBy;
      payload[searchBy] = this.searchText;
      return payload;
    }
  }

  clearSearchBy() {
    this.searchBy = "";
    this.searchText = "";
    this.pageIndex = 1;
    this.getClaimsHistory(0, this.tableItemsSize);
  }

  onSearchClear(event: any) {
    if (!event.target) {
      this.searchText = event;
      this.searchText = "";
      this.pageIndex = 1;
      this.getClaimsHistory(0, this.tableItemsSize);
    }
  }

  pageIndex: number = 1;
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
    this.getClaimsHistory(this.pageIndex - 1, this.tableItemsSize);
  }

  sortingByColumns(data: any) {
    if (data.event === "onOrder") {
      this.orderby = data?.value?.order?.toUpperCase();
      this.sortBy = data?.value?.order ? data?.value?.key : "";
      this.pageIndex = 1;
      this.getClaimsHistory(0, this.tableItemsSize);
      this.columns1.map((item: any) => {
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
          } else {
            item.cssClass = {
              ...{},
              ...{ includeHeader: true, name: "sorting-arrow" },
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
  setHierachyValue(value: any, list: any) {
    const index = list.findIndex(
      (item: any) => item.salesHierarchyCode === value
    );
    return index > -1 ? value : null;
  }
}
