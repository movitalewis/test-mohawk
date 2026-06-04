import { Component, OnInit } from '@angular/core';
import { Config, Columns, DefaultConfig } from 'ngx-easy-table';
import { StorageService } from 'src/app/features/http-services/storage.service';
import { BreadcrumbItems } from 'src/app/features/shared/interfaces';
import { RecentPaymentsService } from '../../services/recent-payments.service';
import { take } from 'rxjs/operators';
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { MESSAGE_CONSTANTS } from "src/app/features/shared/constants/MESSAGE-CONSTANTS";
import { ProgressModalComponent } from "src/app/features/shared/components/progress-modal/progress-modal.component";

@Component({
    selector: 'app-recent-payments',
    templateUrl: './recent-payments.component.html',
    styleUrls: ['./recent-payments.component.scss'],
    standalone: false
})
export class RecentPaymentsComponent implements OnInit {
  breadcrumbItems: BreadcrumbItems = [
    {
      name: 'Home',
      path: '/residential',
      active: false,
    },
    {
      name: 'Finance',
      path: ' ',
      active: false,
    },
    {
      name: 'Recent Payments',
      path: '/',
      active: true,
    },
  ];

  public configuration!: Config;
  public columns!: Columns[];
  errorMessage: any;
  sortDataBy: any;
  sortBy = 'desc';
  sortByData = [
    { value: 'Check #', key: 'paymentType' },
    { value: 'Amount', key: 'paymentAmount' },
    { value: 'Currency', key: 'currency' },
    { value: 'Payment Date', key: 'paymentDate' },
  ];
  sortDirectionData = [
    { value: 'Ascending', key: 'asc' },
    { value: 'Descending', key: 'desc' },
  ];
  priceLabel: string = "";
  totalNumberOfResults: number = 0;
  pageSize: number = 10;
  currentPage: number = 1;
  pageIndex: number = 1;
  tableItemsSize: number = 10;
  totalLength: any = 0;
  startValue: number =
    this.pageIndex * this.tableItemsSize - (this.tableItemsSize - 1);
  lastValue: number = this.startValue + this.tableItemsSize - 1;
  modalRef?: BsModalRef;
  messageConstants: any = "";
  constructor(
    private service: RecentPaymentsService,
    private storageService: StorageService,
    private modalService: BsModalService
  ) {}
  paymentsData: any;
  tableData: any = [];
  paymentsData1: any;
  itemsPerPage: number = 10;
  errorHandlingArray: any = [];
  ngOnInit(): void {
    this.priceLabel = this.storageService.userPriceLabel;
    this.recentPayments(0,this.pageSize);
    this.configuration = { ...DefaultConfig };
    this.configuration.checkboxes = false;
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;
    this.configuration.rows = this.itemsPerPage;
    this.columns = [
      { key: 'paymentType', title: 'Check #', cssClass: { includeHeader: true, name: "sorting-arrow" } },
      { key: 'paymentAmount', title: 'Amount', cssClass: { includeHeader: true, name: "sorting-arrow" } },
      { key: 'currency', title: 'Currency', cssClass: { includeHeader: true, name: "sorting-arrow" } },
      { key: 'paymentDate', title: 'Payment Date', cssClass: { includeHeader: true, name: "sorting-arrow" } },
    ];
  }

  recentPayments(pageNumber: any, pageSize: any) {
    let messageConstants = MESSAGE_CONSTANTS.finance["recentPaymentHistory"];
    this.openProgressModal({
      modalHeaderText: messageConstants?.headerText,
      progressText: messageConstants?.bodyText,
      progressBarText: messageConstants?.barText,
    });
    this.service
      .getRecentPayments(
        this.storageService.userInfo.orgUnit.uid,
        this.sortBy,
        this.sortDataBy,
        pageNumber,
        pageSize
      )
      .subscribe({
        next: (res) => {
          this.modalService.hide("progressModal");
          this.paymentsData = res;
          if (res.recentPaymentDataList != undefined) {
            this.tableData = res.recentPaymentDataList;
            this.totalLength = res.totalNumberOfResults || 0;
            this.startValue =
              this.pageIndex * this.tableItemsSize - (this.tableItemsSize - 1);
            this.lastValue = this.startValue + this.tableItemsSize - 1;
            this.lastValue =
              this.lastValue > this.totalLength
                ? this.totalLength
                : this.lastValue;
          } else {
            this.tableData = this.errorHandlingArray;
          }
          this.paymentsData1 = res.recentPaymentDataList;
        },
        error: (e) => {
          this.modalService.hide("progressModal");
          this.errorMessage = e.message;
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        },
      });
  }
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
    this.recentPayments(this.pageIndex - 1, this.tableItemsSize);
  }

  previousKey = {
    active: '',
    direction: 'asc',
  };
  sortData(name: string, direction: string) {
    const sort = {
      active: name,
      direction: direction,
    };

    const data = this.tableData.slice();
    if (!sort.active || sort.direction === '') {
      this.tableData = data;
      return;
    }
    this.tableData = data.sort((a: any, b: any) => {
      const isAsc = sort.direction === 'asc';
      return this.compare(a[sort.active], b[sort.active], isAsc);
    });
  }
  pageChanged(event: number) {
    console.log(event);
    
    this.currentPage = event;
    this.recentPayments(this.currentPage, this.itemsPerPage);
  }
  compare(a: number | string, b: number | string, isAsc: boolean) {
    if (typeof a === 'number' && typeof b === 'number') {
      return isAsc ? a - b : b - a;
    } else {
      const aStr = String(a).toLowerCase();
      const bStr = String(b).toLowerCase();
      return isAsc ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    }
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
  selectedValues(data: any) {
    if (data.event === 'onOrder') {
      this.sortDataBy = data.value.key;
      this.sortBy = data.value.order;
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
    }
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
