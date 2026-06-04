import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Config, Columns, DefaultConfig } from "ngx-easy-table";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import { CreditMemoListService } from "../../services/credit-memos-list.service";
import { formatDate } from "@angular/common";
import { StorageService } from "src/app/features/http-services/storage.service";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { catchError, forkJoin, of } from "rxjs";
import { jsPDF } from "jspdf";
import { PDFDocument } from "pdf-lib";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { ShareViaEmailLightboxComponent } from "src/app/features/residential/products/components/share-via-email-lightbox/share-via-email-lightbox.component";
@Component({
    selector: "app-credit-memos-list",
    templateUrl: "./credit-memos-list.component.html",
    styleUrls: ["./credit-memos-list.component.scss"],
    standalone: false
})
export class CreditMemoListComponent implements OnInit {
  maxDate = new Date();
  modalRef?: BsModalRef;
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
      name: "Credit Memos",
      path: "/",
      active: true,
    },
  ];
  searchText: string = "";
  searchBy: any;
  searchByList: any[] = [];
  isViewPdf = false;
  allSelected = false;
  public configuration!: Config;
  public columns: Columns[] = [];
  public payload: any = {
    invoiceNumber: "",
    orderNumber: "",
    poNumber: "",
    projectName: "",
    billOfLandingNumber: "",
    styleNumber: "",
    styleName: "",
    rollNumber: "",
    partNumber: "",
    jobNumber: "",
    sideMark: "",
    searchType: "invoiceNumber",
    endUserName: "",
    colorDescription: "",
    colorNumber: "",
    employeeId: "",
    shipTo: "",
    orderOrPo: "",
    searchText: "",
    dateText: "",
    claimType: "",
    oneTimeCity: "",
    oneTimeState: "",
    invoiceDateFrom0: "",
    invoiceDateTo0: "",
    company: "",
    creditMemo: "",
    searchInvoicePopup: "",
  };
  public viewPdfErrors: any = [];
  public userId: any;
  public userEmail: any;
  public invoiceData: any = [];
  public dateRange: any = [];
  public totalPriceLabel: string = "";
  orderby: string = "DESC";
  sortBy: string = "invoiceDate";
  totalInvoicesLength: number = 0;
  isMobile: boolean | any;
  selectedSearchBy: any;
  userInfo : any
  ngOnInit(): void {
    this.storageService.getItem("uid").subscribe((response: any) => {
      this.userId = response;
    });
    this.storageService.getItem("userInfo").subscribe((res: any) => {
      this.userInfo = res;
    })
    this.configuration = { ...DefaultConfig };
    this.configuration.radio = true;
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;
    this.configuration.checkboxes = true;
    this.storageService.getItem("userInfo").subscribe((response: any) => {
      this.totalPriceLabel = response?.priceLabel;
      this.userEmail = response?.uid;
      this.columns = [
        {
          key: "invoiceNumber",
          title: "Document #",
          cssClass: {
            includeHeader: true,
            name: this.getSortingClass("invoiceNumber"),
          },
        },
        {
          key: "invoiceDate",
          title: "Document Date",
          cssClass: {
            includeHeader: true,
            name: this.getSortingClass("invoiceDate"),
          },
        },
        {
          key: "sideMark",
          title: "Sidemark",
          cssClass: {
            includeHeader: true,
            name: this.getSortingClass("sidemark"),
          },
        },
        {
          key: "orderNumber",
          title: "Order Number",
          cssClass: {
            includeHeader: true,
            name: this.getSortingClass("orderNumber"),
          },
        },
        {
          key: "orderDate",
          title: "Order Date",
          cssClass: {
            includeHeader: true,
            name: this.getSortingClass("orderDate"),
          },
        },
        {
          key: "invoiceDueDate",
          title: "Due Date",
          cssClass: {
            includeHeader: true,
            name: this.getSortingClass("invoiceDueDate"),
          },
        },
        {
          key: "poNumber",
          title: "PO #",
          cssClass: {
            includeHeader: true,
            name: this.getSortingClass("poNumber"),
          },
        },
        {
          key: "invoiceTotal",
          title: `Total (${response?.priceLabel})`,
          cssClass: {
            includeHeader: true,
            name: this.getSortingClass("invoiceTotal"),
          },
        },
      ];
      this.searchByList = [
        {
          id: "creditMemo",
          name: "Document #",
        },
        { id: "issuedDate", name: "Issued Date" },
        { id: "poNumber", name: "PO #" },
        { id: "sideMark", name: "Sidemark" },
        { id: "styleNumber", name: "Style #" },
        { id: "orderDate", name: "Order Created" },
        { id: "invoiceTotal", name: `Total (${response?.priceLabel})` },
      ];
    });
    let params: any = this.activateRoute.snapshot.queryParams;
    if (Object.keys(params).length) {
      if (params?.searchText) {
        this.searchText = params?.searchText;
        this.searchBy = "invoiceNumber";
        this.isViewPdf = params.hasOwnProperty("pdf");
      }
      this.pageIndex = 1;
      this.getAllCreditMemos(0, this.orderby, this.sortBy);
    } else {
      this.pageIndex = 1;
      this.getAllCreditMemos(0, this.orderby, this.sortBy);
    }
  }

  constructor(
    private creditMemoListService: CreditMemoListService,
    private activateRoute: ActivatedRoute,
    private storageService: StorageService,
    private userService: UserService,
    public bsModalRef: BsModalRef,
    private modalService: BsModalService,
  ) {}
  selectedInvoices: any = [];
  onCheckboxChange(): void {
    this.selectedInvoices = this.invoiceData.filter(
      (item: any) => item.selected === true
    );
  }
  clearDate() {
    this.dateRange = [];
    this.pageIndex = 1;
    this.getAllCreditMemos(0, this.orderby, this.sortBy);
  }
  getSortingClass(columnKey: string): string {
    const order = this.orderbyMap[columnKey] || "DESC";
    if (this.sortBy === columnKey) {
      return order === "ASC"
        ? "sorting-arrow-active"
        : "sorting-arrow-down-icon";
    }
    return "sorting-arrow";
  }

  getAllCreditMemos(pageIndex: any, orderby: any, sortby: any) {
    this.viewPdfErrors = [];
    const searchText = this.getSanitizedSearchText(this.searchText, this.searchBy);
    let payload = {
      ...this.payload,
      searchText: searchText,
      searchType: this.searchBy,
      dateText: !!this.dateRange[1]
        ? `${formatDate(this.dateRange[0], "MMM d,yyyy", "en-US")}-${formatDate(
            this.dateRange[1],
            "MMM d,yyyy",
            "en-US"
          )}`
        : "",
    };
    this.creditMemoListService.progressShow('getCreditMemos');
    // this.spinnerLoading = true;
    this.configuration.isLoading = true;
    this.invoiceData = [];
    this.creditMemoListService
      .getListOfCreditMemos(payload, pageIndex, orderby, sortby)
      .subscribe(
        (res: any) => {
          this.creditMemoListService.progressHide();
          this.configuration.isLoading = false;
          this.spinnerLoading = false;
          this.invoiceData = res?.body?.invoices || [];
          this.totalInvoicesLength =
            res?.body?.totalNumberOfResults || this.invoiceData.length;
          this.startValue =
            this.pageIndex * this.tableItemsSize - (this.tableItemsSize - 1);
          this.lastValue = this.startValue + this.tableItemsSize - 1;
          this.lastValue =
            this.lastValue > this.totalInvoicesLength
              ? this.totalInvoicesLength
              : this.lastValue;
          if (this.isViewPdf && this.invoiceData.length > 0) {
            this.viewPdf(this.invoiceData[0].invoiceNumber);
          }
          this.invoiceData.map((element: any) => {
            element.selected = false;
          });
        },
        () => {
          this.creditMemoListService.progressHide();
          this.spinnerLoading = false;
          this.configuration.isLoading = false;
        }
      );
  }

  onSearchBy(event: any) {
    this.selectedSearchBy = this.searchByList.find((item) => item.id === event);
    if (!event) {
      this.searchText = "";
      this.pageIndex = 1;
      this.getAllCreditMemos(0, this.orderby, this.sortBy);
    }
    this.searchBy = event;
  }
  public spinnerLoading: boolean = false;
  public showAlert: boolean = false;
  public showMessage: any = "";

  viewPdfBtnClick() {
    this.viewPdfErrors = [];
    this.showMessage = "";
    this.showAlert = false;
    if (this.selectedInvoices.length === 1) {
      this.viewPdf(this.selectedInvoices[0].invoiceNumber);
    } else {
      let s4Items = [];
      let camsItems = [];
      s4Items = this.selectedInvoices.filter(
        (item: any) => item.source === "S4" && item.invoicePdfFileId !== ""
      );
      let invalidSource = this.selectedInvoices.filter(
        (item: any) => item.source === "S4" && item.invoicePdfFileId === ""
      );
      camsItems = this.selectedInvoices.filter(
        (item: any) => item.source === "CAMS"
      );
      if (s4Items.length > 0 || camsItems.length > 0) {
        this.bulkPDfView(s4Items, camsItems);
      }
      invalidSource.forEach((source: any) => {

        this.viewPdfErrors.push(source.invoiceNumber + " has invalid source");
      });
    }
  }

  bulkPDfView(s4Items: any, camsItems: any, isShare: boolean = false) {
    let apiCalls: any = [];
    this.creditMemoListService.progressShow('getCreditMemoPdf');
    const allItems = [...s4Items, ...camsItems];
  
    if (s4Items.length > 0) {
      s4Items.forEach((item: any) => {
        apiCalls.push(
          this.creditMemoListService
            .downloadFile(item.invoicePdfFileId)
            .pipe(catchError(() => of({ error: true, invoice: item.invoiceNumber })))
        );
      });
    }
  
    if (camsItems.length > 0) {
      camsItems.forEach((item: any) => {
        const [month, day, year] = item.invoiceDate.split("/");
        const convertedDate = `${year}${month.padStart(2, "0")}${day.padStart(2, "0")}`;
        const payload = {
          customer: item?.customerNumber,
          invoice: item.invoiceNumber,
          invsdte: convertedDate,
          invedte: convertedDate,
          onddoctype: "INVMH",
          company: "R",
        };
  
        apiCalls.push(
          this.creditMemoListService
            .getCreditMemoPdf(payload)
            .pipe(catchError(() => of({ error: true, invoice: item.invoiceNumber })))
        );
      });
    }
  
    forkJoin(apiCalls).subscribe(
      (result: any) => {
        (async () => {
          const s4Successlist = result.filter(
            (res: any) => res?.body && !res.body?.errorCode && !res.error
          );
          const camsSuccessList = result.filter(
            (res: any) => res?.body && res.body?.errorCode === "0000"
          );
  
          const failedList = result.filter((res: any) => res?.error === true);
          const responseFailed = result.filter(
            (res: any) => res?.body?.errorCode && res.body?.errorCode !== "0000"
          );
  
          const viewPdfErrors: string[] = [];
  
          responseFailed.forEach((err: any) => {
            const invoice = err?.body?.Invoice || err?.body?.invoice || "Unknown Invoice";
            const message = err?.body?.errorMessage || "Unknown error";
            viewPdfErrors.push(`${invoice} - ${message}`);
          });
  
          failedList.forEach((err: any) => {
            const invoice = err?.invoice || "Unknown Invoice";
            viewPdfErrors.push(`${invoice} - Failed to retrieve PDF`);
          });
  
          this.viewPdfErrors = [...(this.viewPdfErrors || []), ...viewPdfErrors];
  
          const successlist = [...s4Successlist, ...camsSuccessList];
  
          if (successlist.length === 0) {
            this.spinnerLoading = false;
            this.creditMemoListService.progressHide();
            return;
          }
  
          await this.generateBulkPDFView(successlist, viewPdfErrors, isShare);
        })();
      },
      () => {
        this.spinnerLoading = false;
        this.creditMemoListService.progressHide();
      }
    );
  }
  
  
  
  async generateBulkPDFView(successlist: any, viewPdfErrors: any, isShare: boolean = false) {
    viewPdfErrors = viewPdfErrors.filter((item: any) => item != undefined);
    if (viewPdfErrors.length > 0) {
      this.viewPdfErrors = [...this.viewPdfErrors, ...viewPdfErrors];
    }
  
    const pdfDoc = await PDFDocument.create();
    const pdfBufferData = [];
  
    for (const res of successlist) {
      if (res?.body) {
        const blob = res?.body?.File
          ? this.b64toBlob(res.body.File, "application/pdf")
          : res.body;
        const blobArray = await blob.arrayBuffer();
        const loadedPdf = await PDFDocument.load(blobArray);
        const pages = await pdfDoc.copyPages(loadedPdf, loadedPdf.getPageIndices());
        pages.forEach((page: any) => pdfDoc.addPage(page));
        pdfBufferData.push(pages);
      }
    }
  
    this.spinnerLoading = false;
    const combinedPdf = await pdfDoc.save();
    const combinedBlob = new Blob([combinedPdf as BlobPart], { type: "application/pdf" });
    this.creditMemoListService.progressHide();
    if (isShare) {
      this.openShareViaEmailModal(combinedBlob);
    } else {
       this.creditMemoListService.progressHide();
      const fileURL = URL.createObjectURL(combinedBlob);
      const a = document.createElement("a");
      a.href = fileURL;
      this.isMobile = window.innerWidth > 1024;
      if (!this.isMobile) {
        a.download = "credit-memo.pdf";
      } else {
        a.target = this.isViewPdf ? "_self" : "_blank";
      }
      a.click();
      a.remove();
    }
  }
  

  viewPdf(invoiceNumber: string, isShare: boolean = false) {
    const selectedItem = this.invoiceData.find((item: any) => item.invoiceNumber === invoiceNumber);
    if (!selectedItem || !selectedItem.source) {
      this.showAlert = true;
      this.showMessage = "Invalid source";
      return;
    }
  
    if (selectedItem.source === "S4") {
      if (selectedItem.invoicePdfFileId) {
        this.creditMemoListService.progressShow('downloadCreditMemos');
        this.creditMemoListService.downloadFile(selectedItem.invoicePdfFileId).subscribe(
          (res: any) => {
            this.creditMemoListService.progressHide();
            this.spinnerLoading = false;
            if (isShare) {
              this.openShareViaEmailModal(res.body);
            } else {
              const fileURL = URL.createObjectURL(res.body);
              const a = document.createElement("a");
              a.href = fileURL;
              this.isMobile = window.innerWidth > 1024;
              if (!this.isMobile) {
                a.download = "Invoice-" + invoiceNumber + ".pdf";
              } else {
                a.target = this.isViewPdf ? "_self" : "_blank";
              }
              a.click();
              a.remove();
              this.creditMemoListService.progressHide();
            }
          },
          () => {
            this.creditMemoListService.progressHide();
            this.spinnerLoading = false;
          }
        );
      }
    } else if (selectedItem.source === "CAMS") {
      const [month, day, year] = selectedItem.invoiceDate.split("/");
      const convertedDate = `${year}${month.padStart(2, "0")}${day.padStart(2, "0")}`;
      const payload = {
        customer: selectedItem?.customerNumber,
        invoice: selectedItem.invoiceNumber,
        invsdte: convertedDate,
        invedte: convertedDate,
        onddoctype: "INVMH",
        company: "R",
      };
      this.reportName = "Invoice_" + payload.invoice + ".pdf";
  
      this.creditMemoListService.progressShow('getCreditMemoPdf');
      this.creditMemoListService.getCreditMemoPdf(payload).subscribe(
        (res) => {
          this.spinnerLoading = false;
          this.creditMemoListService.progressHide();
          if (res.body.errorCode === "0000") {
            const blob = this.b64toBlob(res.body.File, "application/pdf");
            if (isShare) {
              this.openShareViaEmailModal(blob);
            } else {
              const fileURL = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = fileURL;
              this.isMobile = window.innerWidth > 1024;
              if (!this.isMobile) {
                a.download = this.reportName;
              } else {
                a.target = "_blank";
              }
              a.click();
              a.remove();
            }
          } else {
            this.showAlert = true;
            this.showMessage = res.body.errorMessage;
          }
        },
        () => {
          this.creditMemoListService.progressHide();
          this.spinnerLoading = false;
          this.showAlert = true;
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
  onSearch(value: any): void {
    this.searchText = value;
    this.pageIndex = 1;
    this.getAllCreditMemos(0, this.orderby, this.sortBy);
  }

  private getSanitizedSearchText(searchText: string, searchBy: string): string {
    if (!searchText || searchBy !== "invoiceTotal") {
      return searchText;
    }

    return /^[^a-zA-Z0-9]/.test(searchText)
      ? searchText.substring(1)
      : searchText;
  }

  orderbyMap: { [key: string]: string } = {};
  selectedValues(data: any) {
    this.viewPdfErrors = [];
    this.showMessage = "";
    this.showAlert = false;
    if (data.event === "onOrder") {
      const columnKey = data?.value?.key;
      if (this.sortBy !== columnKey) {
        this.orderbyMap[columnKey] = "DESC";
      } else {
        this.orderbyMap[columnKey] =
          this.orderbyMap[columnKey] === "ASC" ? "DESC" : "ASC";
      }
      this.sortBy = columnKey;
      this.orderby = this.orderbyMap[columnKey];
      this.columns = this.columns.map((item) => ({
        ...item,
        cssClass: {
          includeHeader: true,
          name: this.getSortingClass(item.key),
        },
      }));

      this.pageIndex = 1;
      this.getAllCreditMemos(0, this.orderby, this.sortBy);
    }
    if(data.event === "onSelectAll"){
      let isSelected = data.value;
      this.invoiceData.map((item:any)=>{
        item.selected = isSelected;
      })
      this.onCheckboxChange()
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
      this.lastValue > this.totalInvoicesLength
        ? this.totalInvoicesLength
        : this.lastValue;
    this.getAllCreditMemos(this.pageIndex - 1, this.orderby, this.sortBy);
  }

  sharePdf() {
    this.viewPdfErrors = [];
    this.showMessage = "";
    this.showAlert = false;
  
    if (this.selectedInvoices.length === 1) {
      this.viewPdf(this.selectedInvoices[0].invoiceNumber, true); // true = isShare
    } else {
      let s4Items = this.selectedInvoices.filter(
        (item: any) => item.source === "S4" && item.invoicePdfFileId !== ""
      );
      let invalidSource = this.selectedInvoices.filter(
        (item: any) => item.source === "S4" && item.invoicePdfFileId === ""
      );
      let camsItems = this.selectedInvoices.filter(
        (item: any) => item.source === "CAMS"
      );
      if (s4Items.length > 0 || camsItems.length > 0) {
        this.bulkPDfView(s4Items, camsItems, true); // true = isShare
      }
      invalidSource.forEach((source: any) => {
        this.viewPdfErrors.push(source.invoiceNumber + " has invalid source");
      });
    }
  }
  
  preparePdfBlob(invoices: any[]) {
    const s4Items = invoices.filter(item => item.source === "S4" && item.invoicePdfFileId);
    const camsItems = invoices.filter(item => item.source === "CAMS");
  
    const apiCalls: any[] = [];
  
    s4Items.forEach(item => {
      apiCalls.push(
        this.creditMemoListService
          .downloadFile(item.invoicePdfFileId)
          .pipe(catchError(() => of(null)))
      );
    });
  
    camsItems.forEach(item => {
      const [month, day, year] = item.invoiceDate.split("/");
      const convertedDate = `${year}${month.padStart(2, "0")}${day.padStart(2, "0")}`;
      const payload = {
        customer: item.customerNumber,
        invoice: item.invoiceNumber,
        invsdte: convertedDate,
        invedte: convertedDate,
        onddoctype: "INVMH",
        company: "R",
      };
  
      apiCalls.push(
        this.creditMemoListService
          .getCreditMemoPdf(payload)
          .pipe(catchError(() => of(null)))
      );
    });
  
    forkJoin(apiCalls).subscribe(async (results) => {
      const pdfDoc = await PDFDocument.create();
  
      for (let res of results) {
        if (!res) continue;
  
        let blob: Blob;
        if (res?.body?.File) {
          blob = this.b64toBlob(res.body.File, "application/pdf");
        } else if (res?.body instanceof Blob) {
          blob = res.body;
        } else {
          continue;
        }
  
        const arrayBuffer = await blob.arrayBuffer();
        const loadedPdf = await PDFDocument.load(arrayBuffer);
        const pages = await pdfDoc.copyPages(loadedPdf, loadedPdf.getPageIndices());
        pages.forEach((page) => pdfDoc.addPage(page));
      }
  
      const combinedPdfBytes = await pdfDoc.save();
      const combinedBlob = new Blob([combinedPdfBytes as BlobPart], { type: "application/pdf" });
      this.openShareViaEmailModal(combinedBlob);
    });
  }
  blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const base64data = reader.result?.toString().split(",")[1]; // strip the data: prefix
        resolve(base64data || '');
      };
      reader.readAsDataURL(blob);
    });
  }
  
  async  openShareViaEmailModal(pdfContent: any) {
    const base64Content = await this.blobToBase64(pdfContent);
    let mailSubject = `Mohawk Credit Memo`;
    const initialState: ModalOptions = {
      initialState: {
        mailSubject: mailSubject,
        content: base64Content,
        senderInfo: this.userInfo,
         pdfName : "credit-memo",
         mailBody: "Please find the attached Credit Memo shared."
      },
    };

    this.modalRef = this.modalService.show(
      ShareViaEmailLightboxComponent,
      Object.assign(initialState, {
        class: "modal-lg modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }
}
