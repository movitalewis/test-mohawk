import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { formatDate } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { take } from "rxjs/operators";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { Config, Columns, DefaultConfig } from "ngx-easy-table";
import { MakePaymentService } from "../../services/make-payment.service";
import { StorageService } from "src/app/features/http-services/storage.service";
import { ConfirmationDialogComponent } from "src/app/features/shared/components/confirmation-dialog/confirmation-dialog.component";
import { XchangeSearchControlComponent } from "./../../../../../shared/form-control-components/xchange-search-control/xchange-search-control.component";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
    selector: "app-receivables",
    templateUrl: "./receivables.component.html",
    styleUrls: ["./receivables.component.scss"],
    standalone: false
})
export class ReceivablesComponent implements OnInit {
  loadingFlag: boolean = false;
  @ViewChild("scrollToTop", { read: ElementRef }) scrollToTop: any;
  // Breadcrumbs
  breadcrumbItems: BreadcrumbItems = [
    {
      name: "Home",
      path: "/commercial",
      active: false,
    },
    {
      name: "Finance",
      path: " ",
      active: false,
    },
    {
      name: "Make A Payment/Open Recievables",
      path: "/",
      active: true,
    },
  ];

  // Modals
  modalRef?: BsModalRef;
  public legendConfiguration: Config = {
    ...DefaultConfig,
    checkboxes: false,
    tableLayout: {
      ...DefaultConfig.tableLayout,
      striped: true,
      hover: false,
    },
    paginationRangeEnabled: false,
    paginationEnabled: false,
  };
  public legendTransactionColumns: Columns[] = [
    { key: "transaction", title: "Transaction Type" },
    { key: "description2", title: "Description" },
  ];
  public legendAbbreviationColumns: Columns[] = [
    { key: "abbreviation", title: "Abbreviation" },
    { key: "description", title: "Description" },
  ];
  public legendAbbreviationData = [
    {
      abbreviation: "ACHPY",
      description: "Unapplied payment NOT AVAILABLE FOR CUSTOMER USE",
    },
    {
      abbreviation: "ARI",
      description: "Unapplied payment NOT AVAILABLE FOR CUSTOMER USE",
    },
    {
      abbreviation: "CLCR",
      description: "Deduction for CARE assessment",
    },
    {
      abbreviation: "ER",
      description: "Remittance detail does not add correctly",
    },
  ];
  public legendTransactionData = [
    {
      transaction: "C/B or D/M",
      description2: "Chargeback",
    },
    {
      transaction: "C/M",
      description2: "Credit Item",
    },
    {
      transaction: "INT",
      description2: "Interest",
    },
    {
      transaction: "INV",
      description2: "Invoice",
    },
    {
      transaction: "INV",
      description2:
        "Payment posted but not yet applied to specific obligations. NOT AVAILABLE FOR CUSTOMER USE",
    },
  ];
  CreditData: any;

  // Alerts
  confirmationNumber: string | undefined;
  errorMessage: boolean | any;
  successMessage: string | undefined;

  // Receivables Data
  receivablesData: any;
  tableData: Array<Array<any>> = [];

  // Filtering / Sorting
  filter: any = {
    company: "",
    type: "",
  };
  public orderby = "ASC";
  public sortBy = "finalDueDate";
  previousKey = {
    active: "",
    direction: "asc",
  };

  // Search
  @ViewChild("searchInput") searchInput!: XchangeSearchControlComponent;
  public searchTextBy = "";
  public searchKeyword = "";
  selectSearchType: any;
  searchKeyValue: any = "";

  // Receivables Table
  public columns: Columns[] = [];
  showCheckboxes: boolean = false;
  public tableConfig: Config = {
    ...DefaultConfig,
    checkboxes: false,
    tableLayout: {
      ...DefaultConfig.tableLayout,
      striped: false,
      hover: false,
    },
    paginationRangeEnabled: false,
    paginationEnabled: false,
  };

  // Pagination
  public pagination = {
    limit: 10,
    offset: 0,
    count: -1,
  };
  pageIndex: number = 1;
  tableItemsSize: number = 10;
  startValue: number =
    this.pageIndex * this.tableItemsSize - (this.tableItemsSize - 1);
  lastValue: number = this.startValue + this.tableItemsSize - 1;
  public page = 0;

  // User Info
  accountNumber: any = "";
  public payBillFlag: string = "";
  public payBillsPermission: boolean = false;
  public priceLabel: string = "";

  // Selection
  selectedAmount: any;
  public selected: Array<any> = [];
  public preselected: any;
  maxSize: any;
  ebillExpressURL!: SafeResourceUrl;
  @ViewChild("termsAndConditions")
  termsAndConditions!: TemplateRef<any>;
  
  constructor(
    private service: MakePaymentService,
    private modalService: BsModalService,
    private storageService: StorageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private sanitizer: DomSanitizer,
  ) {
    // Get Selected Receivables
    this.storageService
      .getItem("selectedReceivables")
      .subscribe((selectedReceivables: any) => {
        if (
          selectedReceivables != undefined &&
          selectedReceivables.length > 0
        ) {
          this.preselected = selectedReceivables;
        } else {
          this.preselected = [];
        }
      });
    // Get URL Param Values
    this.activatedRoute.queryParamMap.subscribe((res: any) => {
      this.confirmationNumber = res?.params?.confirmationNumber;
      this.errorMessage = res?.params?.errorMessage;
      this.successMessage = res?.params?.successMessage;
      if (this.confirmationNumber || this.errorMessage || this.successMessage) {
        setTimeout(() => {
          this.confirmationNumber = undefined;
          this.errorMessage = undefined;
          this.successMessage = undefined;
          this.router.navigate(["commercial/finance/payments/receivables"]);
        }, 4000);
      }
    });
    // Get Price Label, Account Number, Credit Data, and Pay Bill Flag
    this.storageService
      .getItem("userInfo")
      .pipe(take(1))
      .subscribe(({ priceLabel, orgUnit }) => {
        this.priceLabel = priceLabel;
        if((this.payBillsPermission && (orgUnit?.paybillFlag === 'Z'|| orgUnit?.paybillFlag === 'EMPTY'))){
          this.signUpBillPayModal(this.termsAndConditions);
        }
        this.columns = [
          {
            key: "company",
            title: "Company",
            cssClass: { includeHeader: true, name: this.getSortingClass("company") },
          },
          {
            key: "type",
            title: "Type",
            cssClass: { includeHeader: true, name: this.getSortingClass("type") },
          },
          {
            key: "status",
            title: "Status",
            cssClass: { includeHeader: true, name: this.getSortingClass("status") },
          },
          {
            key: "documentNumber",
            title: "Document",
            cssClass: { includeHeader: false, name: "color-red" },
          },
          {
            key: "poNumber",
            title: "PO",
            cssClass: { includeHeader: true, name: this.getSortingClass("poNumber") },
          },
          {
            key: "documentDate",
            title: "Document Date",
            cssClass: { includeHeader: true, name: this.getSortingClass("documentDate") },
          },
          {
            key: "finalDueDate",
            title: "Final Due Date",
            cssClass: { includeHeader: true, name: this.getSortingClass("finalDueDate") },
          },
          {
            key: "openAmount",
            title: `Open Amount (${priceLabel})`,
            cssClass: { includeHeader: true, name: this.getSortingClass("openAmount") },
          },
          {
            key: "discountAmount",
            title: `Discount Amount (${priceLabel})`,
            cssClass: { includeHeader: true, name: this.getSortingClass("discountAmount") },
          },
          {
            key: "netAmount",
            title: `Net Amount (${priceLabel})`,
            cssClass: { includeHeader: true, name: this.getSortingClass("netAmount") },
          },
          {
            key: "scheduledAmount",
            title: `Scheduled Amount (${priceLabel})`,
            cssClass: { includeHeader: true, name: this.getSortingClass("scheduledAmount")},
          },
        ];
        this.accountNumber = orgUnit?.uid;
        this.service
          .getCreditAnalyst(
            { accountNumber: this.accountNumber },
            this.accountNumber
          )
          .subscribe((res: any) => {
            this.CreditData = res.body;
          });
        this.payBillFlag = orgUnit?.paybillFlag;
        this.showCheckboxes =
          this.payBillFlag === "H" || this.payBillFlag === "V";
        if (this.showCheckboxes) {
          this.columns.unshift({ key: "checkbox", title: "", width: "5%" });
        }
        this.getReceivables();
      },(err)=>{
        this.service.progressHide();
      });
  }

  ngOnInit(): void {
    this.maxSize = this.userService.updateMaxSize();
    if (
      this.storageService?.userInfo?.userPermissions?.find(
        (item: any) => item === "Pay Bills"
      )
    ) {
      this.payBillsPermission = true;
    } else {
      this.payBillsPermission = false;
    }
  }

  /**
   * Calculates the total scheduled amount from the given scheduled amount data.
   *
   * @param {any[]} scheduledAmountData - The array of scheduled amount data.
   * @return {string} - The total scheduled amount as a string with 2 decimal places.
   */
  totalScheduledAmount(scheduledAmountData: any) {
    return scheduledAmountData
      .map((receivable: any) => {
        return receivable.scheduledAmount;
      })
      .reduce((a: number, b: number) => a + b, 0)
      .toFixed(2);
  }

  /**
   * Handles a change in the Search By value.
   *
   * @param {any} $event - the event fired by the Search By field
   * @return {void} this function does not return a value
   */
  searchByChanged($event: any) {
    if (!$event) {
      this.performSearch($event);
    }
  }

  /**
   * Performs a search based on the provided event.
   *
   * @param {any} event - the event that triggered the search
   * @return {void} - no return value
   */
  performSearch(event: any) {
    this.searchKeyValue = event || "";
    this.searchTextBy = this.searchKeyValue !== null ? this.searchKeyValue : "";
    this.searchKeyword =
      this.selectSearchType !== null ? this.selectSearchType : "";
    this.page = 0;
    this.getReceivables();
  }

  /**
   * Retrieves the receivables data from the server.
   *
   * @return {void} This function does not return anything.
   */
  tableLoading : boolean = false;
  getReceivables(pageNumber: any = "") {
    this.tableLoading = true
    if (pageNumber != "") {
      this.page = +pageNumber;
    }
    this.storageService
      .getItem("selectedReceivables")
      .subscribe((data: any) => {
        if (this.selected.length === 0) {
          this.selected = data || [];
        }
      });
    this.service.progressShow('makeAPaymentList');
    this.service
      .getOpenReceivables({
        accountNumber: this.accountNumber,
        cancelFlag: false,
        fieldsFlag: "DEFAULT",
        orderBy: this.orderby,
        page: this.page,
        sortBy: this.sortBy,
        searchTextBy: this.searchTextBy,
        searchKeyword: this.searchKeyword ? this.searchKeyword : "poNumber",
        companySelected:
          this.filter.company !== null ? this.filter.company : "",
        type: this.filter.type !== null ? this.filter.type : "",
      })
      .subscribe({
        next: (res) => {
          this.service.progressHide();
          this.receivablesData = res;
          this.pagination.count = res.totalNumberOfResults;
          res.openReceivablesData = (res.openReceivablesData || [])?.map(
            (receivable: any) => {
              receivable.documentDate = !!receivable.documentDate
                ? formatDate(
                    receivable.documentDate || "",
                    "MM/dd/yyyy",
                    "en-US"
                  ) || "NA"
                : "NA";
              receivable.finalDueDate = !!receivable.finalDueDate
                ? formatDate(
                    receivable.finalDueDate || "",
                    "MM/dd/yyyy",
                    "en-US"
                  ) || "NA"
                : "NA";
              receivable.discountAmount = Math.abs(receivable.discountAmount);
              if (
                this.selected?.find(
                  (resItem: any) =>
                    resItem.documentNumber === receivable.documentNumber
                )
              ) {
                receivable.checked = true;
              } else {
                receivable.checked = false;
              }
              if (receivable["deductionEntries"]) {
                return { ...receivable };
              } else {
                return { ...receivable, deductionEntries: [] };
              }
            }
          );
          this.tableData[this.page] = res.openReceivablesData;
          this.tableLoading = false
        },
        error: (e) => {
          this.service.progressHide();
          this.errorMessage = e.message;
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        },
      });
  }

  /**
   * Sorts the table based on the provided data.
   *
   * @param {any} data - The data used for sorting the table.
   */
  tableSort(data: any) {
    if (data.event === "onOrder" && data.value?.key !== "checkbox") {
      this.orderby = data.value.order;
      this.sortBy = data.value.key;
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
      this.getReceivables();
    }
  }

  /**
   * Selects a receivable based on the provided data.
   *
   * @param {any} data - The data used to select receivables.
   * @return {void} - This function does not return anything.
   */
  selectReceivable(data: any) {
    if (data.checked === true) {
      this.selected.push(data);
    } else {
      this.selected = this.selected.filter(
        (selectedReceivable) => selectedReceivable.pk !== data.pk
      );
    }
    this.selectedAmount =
      this.selected?.length > 0
        ? this.selected
            .map((selectedReceivable) => selectedReceivable.openAmount)
            .reduce((prev, next) => prev + next)
        : [];
  }

  /**
   * Checks if a row is preselected.
   *
   * @param {any} row - The row to check.
   * @return {boolean} Returns true if the row is preselected, false otherwise.
   */
  isRowPreselected(row: any) {
    return this.preselected?.some((item: any) => item.pk === row.pk);
  }

  /**
   * Downloads and views the PDF invoice for the provided document.
   *
   * @param {any} row - The row object representing the document.
   */
  viewPDF(row: any) {
    this.service.progressShow("fetchpdf")
    this.loadingFlag = true;
    const isMobile = window.innerWidth <= 1024;
  
    if (!row?.source) {
      this.loadingFlag = false;
      this.errorMessage = "Invalid source";
      this.scrollPageToTop();
      this.stopAlert();
      return;
    }
  
    if (row?.source === "S4") {
      if (!!row?.invoicepdfFileId) {
        this.service.getInvoicePdfFromS4(row.invoicepdfFileId).subscribe({
          next: (res: any) => {
            this.loadingFlag = false;
            const blob = res.body;
            const fileURL = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = fileURL;
  
            if (isMobile) {
              a.download = "Invoice-" + row.documentNumber + ".pdf";
            } else {
              a.target = "_blank";
            }
            a.click();
            a.remove();
            this.service.progressHide()
          },
          error: () => {
            this.loadingFlag = false;
            this.errorMessage = "Unable to retrieve S4 PDF";
            this.scrollPageToTop();
            this.stopAlert();
            this.service.progressHide()
          },
        });
      } else {
        this.loadingFlag = false;
        this.errorMessage = "Missing S4 PDF File ID.";
        this.scrollPageToTop();
        this.stopAlert();
        this.service.progressHide()
      }
    }
  
    else if (row?.source === "CAMS") {
      const inputDate = row.documentDate;
      const [month, day, year] = inputDate.split("/");
      const convertedDate = `${year}${month.padStart(2, "0")}${day.padStart(2, "0")}`;
  
      const payload = {
        customer: this.accountNumber,
        invoice: row.documentNumber,
        invsdte: convertedDate,
        invedte: convertedDate,
        onddoctype: "INVMH",
        company: "R",
      };
  
      this.service.getInvoicePdfFromCAMS(payload).subscribe({
        next: (res) => {
          this.loadingFlag = false;
          if (res.body.errorCode === "0000") {
            const base64 = res.body.File;
            const blob = this.b64toBlob(base64, "application/pdf");
            const fileURL = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = fileURL;
  
            if (isMobile) {
              a.download = "Invoice-" + row.documentNumber + ".pdf";
            } else {
              a.target = "_blank";
            }
  
            a.click();
            a.remove();
            this.service.progressHide()
          } else {
            this.errorMessage = res.body.errorMessage;
            this.scrollPageToTop();
            this.stopAlert();
            this.service.progressHide()
          }
        },
        error: () => {
          this.loadingFlag = false;
          this.errorMessage = "Unable to retrieve CAMS PDF";
          this.scrollPageToTop();
          this.stopAlert();
          this.service.progressHide()
        },
      });
    }
  }
  /**
   * Converts a base64 encoded string to a Blob object.
   *
   * @param {any} b64Data - The base64 encoded string to convert.
   * @param {string} contentType - The MIME type of the resulting Blob object. Defaults to an empty string.
   * @return {Blob} The Blob object representing the converted data.
   */
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

  /**
   * Store the selected receivables.
   *
   * @return {void}
   */
  storeSelected() {
    this.storageService.setItem("selectedReceivables", [
      ...this.selected.map((selectedReceivable: any) => {
        const selectionInPreselected = this.preselected.filter(
          (item: any) => item.pk === selectedReceivable.pk
        )[0];
        if (!!selectionInPreselected) {
          return {
            ...selectedReceivable,
            deductionEntries: selectionInPreselected.deductionEntries,
            checked: false,
          };
        } else {
          return {
            ...selectedReceivable,
            checked: false,
          };
        }
      }),
    ]);
    this.selected = [];
    this.storageService.setItem("selectedBankAccount", null);
  }

  /**
   * Handles the change event of the pagination.
   *
   * @param {any} event - The event object representing the pagination change.
   */
  onPaginationChange(event: any) {
    this.pageIndex = event;
    this.page = event - 1;
    this.getReceivables();
    this.startValue =
      this.pageIndex * this.tableItemsSize - (this.tableItemsSize - 1);
    this.lastValue = this.startValue + this.tableItemsSize - 1;
    this.lastValue =
      this.lastValue > this.tableData[this.page]?.length
        ? this.tableData[this.page]?.length
        : this.lastValue;
  }

  /**
   * Opens a modal with the given template.
   *
   * @param {TemplateRef<any>} template - The template to be displayed in the modal.
   * @return {void}
   */
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      id: 1,
      class: "modal-lg modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }

  /**
   * Opens the initial Sign up for bill pay modal.
   *
   * @param {TemplateRef<any>} termsAndConditions - The template reference for the terms and conditions.
   */
  signUpBillPayModal(termsAndConditions: TemplateRef<any>) {
    this.modalRef = this.modalService.show(
      ConfirmationDialogComponent,
      Object.assign(
        {
          backdrop: true,
          ignoreBackdropClick: true,
          initialState: {
            title: "Bill Pay",
            content: "Would you like to Signup for Bill Pay?",
            primaryActionLabel: "CONTINUE",
            secondaryActionLabel: "CANCEL",
            onPrimaryAction: () =>
              this.showTermsAndConditions(termsAndConditions),
            onSecondaryAction: () => {
              this.modalRef?.hide();
              this.router.navigate(['commercial/']);
            },
          },
        },
        {
          id: "confirmationModal",
          class: "modal-md modal-dialog-centered",
          backdrop: "static",
          keyboard: false,
        }
      )
    );
  }

  /**
   * Show the terms and conditions modal.
   *
   * @param {TemplateRef<any>} template - The template reference for the modal.
   */
  showTermsAndConditions(template: TemplateRef<any>) {
    this.modalService.hide("confirmationModal");
    this.modalRef = this.modalService.show(template, {
      id: "termsAndCondition",
      class: "modal-lg modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }

  closeTermsModal(){
    this.modalRef?.hide();
    this.router.navigate(['commercial/']);
  }

  /**
   * Opts out of showing the terms and conditions again.
   * NOTE: This is backend functionality, not sure how to implement this as of now.
   *
   * @param {type} event - the event fired by the opt out checkbox
   * @return {type} description of return value
   */
  optOutOfTermsAndConditions(event: any) {}

  /**
   * Accepts the terms and conditions.
   *
   * @return {type} description of return value
   */
  acceptTermsAndConditions() {
    this.modalService.hide("termsAndCondition");

    this.router.navigate([
      "commercial/finance/payments/receivables/select-users", {
        queryParams: {
          payBillSignup: "true",
        },
      }
    ]);
  }
   timeoutId: any;

  stopAlert() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.timeoutId = setTimeout(() => {
      this.errorMessage = false;
    }, 6000);
  }
  scrollPageToTop() {
    this.scrollToTop.nativeElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest",
    });
  }
  orderbyMap: { [key: string]: string } = {};
  getSortingClass(columnKey: string): string {
    const order = this.orderbyMap[columnKey] || "ASC";
    if (this.sortBy === columnKey) {
      return order === "ASC" ?  "sorting-arrow-active" : "sorting-arrow-down-icon";;
    }
    return "sorting-arrow";
  }
}
