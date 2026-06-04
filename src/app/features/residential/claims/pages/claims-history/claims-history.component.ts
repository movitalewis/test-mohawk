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
import { take } from "rxjs";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { MESSAGE_CONSTANTS } from "src/app/features/shared/constants/MESSAGE-CONSTANTS";
import { ProgressModalComponent } from "src/app/features/shared/components/progress-modal/progress-modal.component";
import { CLAIM_TYPE_OPTIONS } from "src/app/features/shared/constants/CLAIMS-CONSTANTS";


@Component({
    selector: "app-claims-history",
    templateUrl: "./claims-history.component.html",
    styleUrls: ["./claims-history.component.scss"],
    standalone: false
})
export class ClaimsHistoryComponent implements OnInit, OnDestroy {
  maxDate = new Date();
  @ViewChild("claim", { static: true })
  claim!: APIDefinition;
  daterange1: any;
  claimDetails: any = [];
  tempClaimsData: any = [];
  public salesHierarchyList: any = [];
  public hierachyCode: any;
  spinnerLoading: boolean = false;
  public data = [];
  salesHierarchyCode: any = "";
  totalLength: any = 0;
  maxSize: any;
  salesManRole: any;
  userInfoSub:any;
  modalRef?: BsModalRef;
  messageConstants: any = ""
  selectedHierarchyValue: any;
  claimTypes = CLAIM_TYPE_OPTIONS;

  constructor(
    private router: Router,
    private activateRoute: ActivatedRoute,
    private claimsService: ClaimsService,
    private datePipe: DatePipe,
    private accountService: AccountService,
    public storageService: StorageService,
    private userService: UserService,
    private modalService: BsModalService
  ) {
    this.activateRoute.queryParams.subscribe((params: any) => {
      this.selectedStatus = params?.status || "";
    });
  }

  breadcrumbItems: BreadcrumbItems = [
    {
      name: "Home",
      path: "/residential",
      active: false,
    },
    {
      name: "Claims History",
      path: "/claim-history",
      active: false,
    },
  ];

  public configuration1!: Config;
  public columns1!: Columns[];
  public redirectionObj: any = [];
  salesPersonInHouseFlag: any;

  navigateToClaimDetail(eventId: any) {
    this.router.navigateByUrl("residential/claims/details?claim=" + eventId);
  }
  accountColumns = false;
  
   ngOnInit(): void {
      this.columns1 = []
    this.maxSize = this.userService.updateMaxSize();
    this.claimsService.selectedInvoiceLines = {};
    this.userInfoSub = this.storageService.getItem("userInfo").pipe(take(1)).subscribe((response: any) => {
      this.salesPersonInHouseFlag = 
          response?.isSalesPerson == true &&
          response?.isSalesOps == false &&
          response?.orgUnit?.inHouseAccount == true;
      if (response?.isSalesPerson || response?.isSalesOps) {
        // this.spinnerLoading = true;
        this.salesManRole = response?.salesManRole;
        let isSalesPerson = response?.isSalesOps ? response?.isSalesOps : false;
        if (this.salesPersonInHouseFlag) {
          // let messageConstants = MESSAGE_CONSTANTS.claims['claimHistory'];
          // this.openProgressModal({
          //   modalHeaderText: messageConstants?.headerText,
          //   progressText: messageConstants?.bodyText,
          //   progressBarText: messageConstants?.barText
          // });
          this.accountService
            .getSalesHierarchyForUser(isSalesPerson)
            .subscribe((response) => {
              this.modalService.hide("progressModal");
              if (response?.body) {
                let roles = ["SVP", "RVP", "DM", "TM", "TEAM"];
                let salesHierarchyMap =
                  response?.body?.salesHierarchyMap || [];
                      let foundRole = false;
                    roles.forEach((role) => {
                      if (role === this.salesManRole) {
                        this.selectedFilter[role] = 'All';
                        foundRole = true;
                      } else if (foundRole) {
                        this.selectedFilter[role] = undefined;
                      }
                    });
                salesHierarchyMap.sort(function (a: any, b: any) {
                  return roles.indexOf(a.key) - roles.indexOf(b.key);
                });

                this.salesHierarchyList = response?.body?.salesHierarchyMap;
                if (
                  this.salesManRole == "TM" ||
                  this.salesManRole == "TEAM"
                ) {
                  this.salesManRole = "TM";
                }
              } else {
                this.salesHierarchyList = [];
              }
              this.spinnerLoading = false;
              if (this.salesHierarchyList?.length > 0) {
                const filterItem = this.salesHierarchyList.filter(
                  (item: any) => item.key === this.salesManRole
                );
                 if (filterItem.length > 0) {
    if (this.selectedFilter[this.salesManRole] === 'All') {
      this.salesHierarchyCode = "";
    } else {
      this.salesHierarchyCode = filterItem[0].value?.salesHierarchyUserAssignmentList[0]?.salesHierarchyCode;
    }
  }
              }
              this.getClaimsHistory(0, this.tableItemsSize);
            }, () => {
              this.spinnerLoading = false;
              // this.modalService.hide("progressModal");
            });
        }
      }
  
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
      if (response?.isSalesPerson === true || response?.orgUnit?.inHouseAccount === true) {
        const accountColumns = [];
        accountColumns.push(
          {
            key: "accountName",
            title: "Account Name",
            cssClass: { includeHeader: true, name: "sorting-arrow" }
          },
          {
            key: "accountNumber",
            title: "Account Number",
            cssClass: { includeHeader: true, name: "sorting-arrow" }
          }
        );
      
        this.columns1 = [...accountColumns, ...this.columns1];
        this.accountColumns = true;
      }
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
    });
    this.configuration1 = { ...DefaultConfig };
    this.configuration1.checkboxes = false;
    this.configuration1.tableLayout.striped = true;
    this.configuration1.tableLayout.hover = false;
    this.configuration1.paginationRangeEnabled = false;
    this.configuration1.paginationEnabled = false;

  }

 

  searchText: any = "";
  selectedStatus: any = "status-INPROCESS";
  selectedClaim: any = "";
  searchBy: any = "";
  orderby: string = "";
  sortBy: string = "";
selectedFilter: any = [];
  getSalesList(value: any, name: any) {
    if (value) {
     this.salesHierarchyCode = value === "All" ? "" : value;
     this.selectedHierarchyValue = value;
     this.pageIndex = 1;
      this.getClaimsHistory(0, this.tableItemsSize);
    }
  }

  getClaimsHistory(pageIndex: any, pageSize: any) {
    let payload : any = {
      salesHierarchyCode:
      this.salesPersonInHouseFlag ? (this.salesHierarchyCode == undefined ? "" : this.salesHierarchyCode) : "",
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
      sort: this.sortBy == 'sideMark' ? 'sidemark' : this.sortBy,
      currentPage: pageIndex?.toString(),
    };
    if (this.selectedHierarchyValue === "All" || this.selectedHierarchyValue === undefined) {
      payload.salesHierarchyRole = this.salesManRole;
    }
    
    if (this.searchBy != undefined && this.searchBy != null && this.searchBy != "") {
      payload = this.handeleSearchBy(payload);
    } else {
      payload.searchText = this.searchText;
    }
    // this.spinnerLoading = true;
    this.claimDetails = [];
    let messageConstants = MESSAGE_CONSTANTS.claims['claimHistory'];
    this.openProgressModal({
      modalHeaderText: messageConstants?.headerText,
      progressText: messageConstants?.bodyText,
      progressBarText: messageConstants?.barText
    });
    this.claimsService.getClaimsHistory(payload, pageIndex, pageSize).subscribe(
      (res) => {
        // this.spinnerLoading = false;
        this.modalService.hide("progressModal");
        this.totalLength = res.body.totalResults || 0;

        this.startValue =
          this.pageIndex * this.tableItemsSize - (this.tableItemsSize - 1);
        this.lastValue = this.startValue + this.tableItemsSize - 1;
        this.lastValue =
          this.lastValue > this.totalLength ? this.totalLength : this.lastValue;
        this.claimDetails = res.body.claimsData || [];
      },
      (err) => {
        // this.spinnerLoading = false;
        this.modalService.hide("progressModal");
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

  ngOnDestroy(): void {
    this.userInfoSub.unsubscribe();
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
