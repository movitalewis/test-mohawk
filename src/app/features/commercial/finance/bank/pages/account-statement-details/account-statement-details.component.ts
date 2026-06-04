import {
  Component,
  DOCUMENT,
  Inject,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { Config, Columns, DefaultConfig, Pagination } from "ngx-easy-table";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import { BsModalService, BsModalRef, ModalOptions } from "ngx-bootstrap/modal";
import { LegendPopupComponent } from "../components/legend-popup/xchange-legend-popup.component";
import { ActivatedRoute } from "@angular/router";
import { BankAccountService } from "../../services/bank-account.service";
import { StorageService } from "src/app/features/http-services/storage.service";
import { DatePipe, formatDate } from "@angular/common";
import { MESSAGE_CONSTANTS } from "src/app/features/shared/constants/MESSAGE-CONSTANTS";
import { ProgressModalComponent } from "src/app/features/shared/components/progress-modal/progress-modal.component";
import jsPDF from "jspdf";
import "jspdf-autotable";
import html2canvas from "html2canvas";
import { ShareViaEmailLightboxComponent } from "src/app/features/residential/products/components/share-via-email-lightbox/share-via-email-lightbox.component";

@Component({
  selector: "app-account-statement-details",
  templateUrl: "./account-statement-details.component.html",
  styleUrls: ["./account-statement-details.component.scss"],
  standalone: false,
})
export class AccountStatementDetailsComponent implements OnInit {
  @ViewChild("table2") table2: any;
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
      name: "Statements",
      path: "/",
      active: true,
    },
  ];

  public configuration!: Config;
  public columns: Columns[] = [];
  public configuration1!: Config;
  public columns1: Columns[] = [];
  public data: any = [];
  public data1: any = [];
  modalRef?: BsModalRef;
  spinnerLoading: boolean = false;
  tableItemsSize: number = 10;
  pageSizes: number[] = [];
  pageIndex: any = 1;
  constructor(
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private route: ActivatedRoute,
    private accountsService: BankAccountService,
    private storageService: StorageService,
    @Inject(DOCUMENT) private document: Document,
    private datePipe: DatePipe,
  ) {}

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      id: 1,
      class: "modal-lg modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }

  xchangeLegendModal() {
    const initialState: ModalOptions = {
      initialState: {},
    };
    this.bsModalRef = this.modalService.show(
      LegendPopupComponent,
      Object.assign(initialState, {
        class: "modal-lg modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      }),
    );
  }
  public statementDate: any;
  public uid: any;
  public priceLabel: any;

  ngOnInit(): void {
    this.uid = localStorage.getItem("accountNumber");
    let statementDate = this.route.snapshot.paramMap.get("id") || "";
    this.storageService.getItem("userInfo").subscribe(
      (response: any) => {
        this.priceLabel = response?.priceLabel;
        this.configuration = { ...DefaultConfig };
        this.configuration.checkboxes = false;
        this.configuration.tableLayout.hover = false;
        this.configuration.paginationRangeEnabled = false;
        this.configuration.paginationEnabled = false;
        this.columns = [
          { key: "currentDue", title: `Current (${this.priceLabel})` },
          { key: "past30Due", title: "1-30" },
          { key: "past60Due", title: "31-60" },
          { key: "past90Due", title: "61-90" },
          { key: "past240Due", title: "91-240" },
          { key: "past241Due", title: "Over 240" },
          { key: "totalDue", title: "Total" },
        ];

        this.configuration1 = { ...DefaultConfig };
        this.configuration1.checkboxes = false;
        this.configuration1.tableLayout.striped = true;
        this.configuration1.tableLayout.hover = false;
        this.configuration1.paginationRangeEnabled = false;
        this.configuration1.paginationEnabled = false;
        this.pageSizes = this.getPageSizes();
        if (this.table2) {
          this.table2.limit = this.tableItemsSize;
        }
        this.columns1 = [
          {
            key: "documentNumber",
            title: "Document",
            cssClass: { includeHeader: true, name: "sorting-arrow" },
          },
          {
            key: "accountStatementType",
            title: "Type",
            cssClass: { includeHeader: true, name: "sorting-arrow" },
          },
          {
            key: "documentDate",
            title: "Document Date",
            cssClass: { includeHeader: true, name: "sorting-arrow" },
          },
          {
            key: "finalDueDate",
            title: "Due date",
            cssClass: { includeHeader: true, name: "sorting-arrow" },
          },
          {
            key: "openAmount",
            title: `Open Amount (${this.priceLabel})`,
            cssClass: { includeHeader: true, name: "sorting-arrow" },
          },
        ];
      },
      (err: any) => {
        this.modalService.hide("progressModal");
      },
    );
    const date = new Date(statementDate).toISOString().slice(0, 10);
    this.statementDate = formatDate(date, "MM/dd/yyyy", "en-US");
    this.getAccountDetails();
  }
  public getAccountDetails() {
    // this.spinnerLoading = true;
    let messageConstants = MESSAGE_CONSTANTS.finance["accountStatementDetails"];
    this.openProgressModal({
      modalHeaderText: messageConstants?.headerText,
      progressText: messageConstants?.bodyText,
      progressBarText: messageConstants?.barText,
    });
    this.accountsService
      .getAccountStatementDetails(this.uid, this.statementDate)
      .subscribe({
        next: (res: any) => {
          this.modalService.hide("progressModal");
          this.spinnerLoading = false;
          if (res && res.body) {
            const { accountStatements, companies, ...remainingData } = res.body;
            this.data1 = accountStatements;
            let headerData = remainingData;
            this.data = [headerData];
          }
        },
        error: (err: any) => {
          this.modalService.hide("progressModal");
          this.data1 = [];
          this.spinnerLoading = false;
        },
      });
  }

  tableSort(data: any) {
    if (data.event === "onOrder" && data.value?.key !== "checkbox") {
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
          }
        } else if (item.hasOwnProperty("cssClass")) {
          item.cssClass = {
            ...{},
            ...{ includeHeader: true, name: "sorting-arrow" },
          };
        }
      });
      this.pageIndex = 1;
    }
  }

  getPageSizes(): number[] {
    return [10, 25, 50, 100, 200, 300, 400];
  }

  onTableDataChange(e: any) {
    this.pageIndex = Number(e);
  }

  onPageSizeChange(e: any) {
    let value = e?.value;
    this.pageIndex = 1;
    this.tableItemsSize = Number(value);
    this.table2.limit = this.tableItemsSize;
  }

  openProgressModal(data = {}, modalId = "progressModal", size: any = "md") {
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
      }),
    );
  }
  hideProgressModal(modalId = "progressModal") {
    this.modalService.hide(modalId || "progressModal");
  }
  private delayPrint(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  printPage() {
    this.openProgressModal("printOrder", "printOrderId");
    const tableSize = this.tableItemsSize;
    this.table2.limit = this.data1.length;
    this.configuration1.rows = this.data1?.length || 0;
    this.tableItemsSize = this.data1.length;
    // this.showDetailsFlag = true;
    console.log("Printing...");
    this.delayPrint(3000).then(() => {
      console.log("Printing... done:::::::");
      let printContents: any, popupWin: any;
      // this.showDetailsFlag = true;
      // this.hidelement(true);
      let printSection = this.document.getElementById("print-area");
      printContents = printSection?.innerHTML;
      popupWin = window.open(
        "",
        "_blank",
        "top=0,left=0,height=100%,width=auto",
      );
      popupWin.document.open();
      popupWin.document.write(`
      <html>
        <head>
          <title>&nbsp;</title>
          <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ngx-easy-table@15.7.0/style.css">
          <link rel="stylesheet" href="/assets/print/account-statement-details-print.css" crossorigin="anonymous">
        </head>
        <body onload="window.print()" style="background-color: #fff;">
          <div id="pdfClaimContent" class="container">
            <img src="/assets/images/logo-residential-dark.png" width=250 style="margin:30px 0px">
            ${printContents}
          </div>
        </body>
      </html>`);
      popupWin.document.close();
      popupWin.onafterprint = () => {
        // this.showDetailsFlag = false;
        popupWin.close();
      };
      this.table2.limit = tableSize;
      this.configuration1.rows = tableSize;
      this.tableItemsSize = tableSize;
      console.log("tableItemsSize--: ", this.tableItemsSize);

      this.hideProgressModal("printOrderId");
    });
  }
  openShareViaEmailModal(pdfContent: any) {
    let mailSubject = `Mohawk Account Statement for ${this.statementDate}`;
    const initialState: ModalOptions = {
      initialState: {
        mailSubject: mailSubject,
        content: pdfContent,
        pdfName: "account-statement",
        mailBody: "Attached account statement details"
        // senderInfo: this.userInfo,
      },
    };

    this.modalRef = this.modalService.show(
      ShareViaEmailLightboxComponent,
      Object.assign(initialState, {
        class: "modal-lg modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      }),
    );
  }

  // viewPdf(from = "") {
  //   // this.spinnerLoading = true;
  //   this.openProgressModal("viewPdf", "viewPdfId");
  //   const tableSize = this.tableItemsSize;
  //   this.table2.limit = this.data1.length;
  //   this.configuration1.rows = this.data1?.length || 0;
  //   this.tableItemsSize = this.data1.length;
  //   this.delayPrint(3000).then(async () => {
  //     const element = document.getElementById("print-area");
  //     if (!element) return;

  //     const clone = element.cloneNode(true) as HTMLElement;

  //     const container = document.createElement("div");
  //     container.style.position = "fixed";
  //     container.style.top = "-9999px";
  //     container.style.width = "1200px";
  //     container.style.background = "#fff";

  //     const link = document.createElement("link");
  //     link.rel = "stylesheet";
  //     link.href = "/assets/print/account-statement-details-print.css";
  //     clone.prepend(link);

  //     container.appendChild(clone);
  //     document.body.appendChild(container);

  //     try {

  //       const pdf = new jsPDF("p", "mm", "a4");

  //       const pageWidth = pdf.internal.pageSize.getWidth();
  //       const pageHeight = pdf.internal.pageSize.getHeight();

  //       const marginLeft = 10;
  //       const marginTop = 20;

  //       const usableWidth = pageWidth - 20;
  //       const usableHeight = pageHeight - 30;

  //       const children = Array.from(clone.children);

  //       let currentPageCanvas = document.createElement("canvas");
  //       let currentHeight = 0;

  //       const processElement = async (index: number) => {

  //         if (index >= children.length) {
  //           finalize();
  //           return;
  //         }

  //         const el = children[index] as HTMLElement;

  //         const canvas = await html2canvas(el, {
  //           scale: 2,
  //           useCORS: true,
  //           windowWidth: 1200
  //         });

  //         const ctx = currentPageCanvas.getContext("2d");

  //         const scale = usableWidth / canvas.width;
  //         const scaledHeight = canvas.height * scale;

  //         // initialize canvas if empty
  //         if (!currentPageCanvas.width) {
  //           currentPageCanvas.width = canvas.width;
  //           currentPageCanvas.height = 0;
  //         }

  //         // if page overflow → flush page
  //         if (currentHeight + scaledHeight > usableHeight * (canvas.width / usableWidth)) {

  //           const pageImg = currentPageCanvas.toDataURL("image/png");

  //           pdf.addImage(pageImg, "PNG", marginLeft, marginTop, usableWidth, usableHeight);

  //           pdf.addPage();

  //           currentPageCanvas = document.createElement("canvas");
  //           currentHeight = 0;
  //         }

  //         const tempCanvas = document.createElement("canvas");
  //         tempCanvas.width = canvas.width;
  //         tempCanvas.height = canvas.height;

  //         const tempCtx = tempCanvas.getContext("2d");

  //         if (tempCtx) {
  //           tempCtx.drawImage(canvas, 0, 0);
  //         }

  //         // merge logic simplified (safe approach: just append pages instead of complex stitching)
  //         const pageImg = tempCanvas.toDataURL("image/png");

  //         if (index === 0) {
  //           pdf.addImage(
  //             "/assets/images/logo-residential-dark.png",
  //             "PNG",
  //             marginLeft,
  //             8,
  //             50,
  //             12
  //           );
  //         }

  //         pdf.addImage(pageImg, "PNG", marginLeft, marginTop, usableWidth, usableHeight);

  //         processElement(index + 1);
  //       };

  //       const finalize = () => {
  //         document.body.removeChild(container);

  //         if (from === "share") {
  //           const pdfData = pdf.output("datauristring");
  //           const base64 = pdfData.split(",")[1];
  //           this.openShareViaEmailModal(base64);
  //         } else {
  //           const blob = pdf.output("blob");
  //           const url = URL.createObjectURL(blob);
  //           window.open(url, "_blank");

  //           setTimeout(() => URL.revokeObjectURL(url), 10000);
  //         }
  //         // this.spinnerLoading = false;
  //         this.table2.limit = tableSize;
  //         this.configuration1.rows = tableSize;
  //         this.tableItemsSize = tableSize;
  //         this.hideProgressModal("viewPdfId");
  //       };

  //       await processElement(0);

  //     } catch (err) {
  //       console.error(err);
  //       document.body.removeChild(container);
  //       // this.spinnerLoading = false;
  //         this.table2.limit = tableSize;
  //         this.configuration1.rows = tableSize;
  //         this.tableItemsSize = tableSize;
  //       this.hideProgressModal("viewPdfId");
  //     }
  //   });
  // }
  viewPdf(from = "") {
    this.openProgressModal("printOrder", "printOrderId");
    const tableSize = this.tableItemsSize;
    this.table2.limit = this.data1.length;
    this.configuration1.rows = this.data1?.length || 0;
    this.tableItemsSize = this.data1.length;
    // this.showDetailsFlag = true;
    console.log("Printing...");
    this.delayPrint(3000).then(() => {
      console.log("Printing... done:::::::");
      let printContents: any, popupWin: any;
      // this.showDetailsFlag = true;
      // this.hidelement(true);/22/26, 9:53 PM
      let printSection = this.document.getElementById("print-area");
      printContents = printSection?.innerHTML;
      const dateLabel = formatDate(new Date(), "MM/dd/yyyy hh:mm a", "en-US");

      popupWin = window.open(
        "",
        "_blank",
        "top=0,left=0,height=100%,width=auto",
      );
      popupWin.document.open();
      popupWin.document.write(`
      <html>
        <head>
          <title>&nbsp;</title>
          <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
          <link rel="stylesheet" href="/styles.css" crossorigin="anonymous">
          <link rel="stylesheet" href="/assets/print/account-statement-details-print.css" crossorigin="anonymous">
        </head>
        <body style="background-color: #fff;">
 <section class="xchange-loader"  style="background-color:rgba(0, 0, 0, 0.5); top:0">
          <div class="custom-spinner" style="background-color:rgba(0, 0, 0, 0.5)"></div>
        </section>
          <div id="pdfClaimContent">
            <img src="/assets/images/logo-residential-dark.png" width=250 style="margin:30px 0px">
            ${printContents}
          </div>
        </body>
      </html>`);
      popupWin.document.close();
      popupWin.onload = () => {
        this.table2.limit = tableSize;
        this.configuration1.rows = tableSize;
        this.tableItemsSize = tableSize;
        const content = popupWin.document.getElementById("pdfClaimContent");
        html2canvas(content, {
          scale: from === "share" ? 2 : 1,
          useCORS: true,
        }).then((canvas: any) => {
          const data = canvas.toDataURL("image/jpeg");
          const pdf = new jsPDF("p", "mm", "a4", true);
          const props = pdf.getImageProperties(data);
          const padding = 5;
          const pageWidth = pdf.internal.pageSize.getWidth() - padding * 2;
          const pageHeight = pdf.internal.pageSize.getHeight();
          const imgProps = {
            width: pageWidth,
            height: (canvas.height * pageWidth) / canvas.width,
          };
          const totalPdfPages = Math.ceil(imgProps.height / pageHeight);
          for (let page = 0; page < totalPdfPages; page++) {
            const sourceY = (pageHeight * page * canvas.width) / pageWidth;
            const pageCanvas = document.createElement("canvas");
            pageCanvas.width = canvas.width;
            pageCanvas.height = pageHeight * (canvas.width / pageWidth);
            const ctx: any = pageCanvas.getContext("2d");
            ctx.canvas.style.border = "none";
            if (ctx) {
              ctx.drawImage(
                canvas,
                0,
                sourceY,
                canvas.width,
                pageCanvas.height,
                0,
                0,
                canvas.width,
                pageCanvas.height,
              );
            }
            const pageImageData = pageCanvas.toDataURL("image/png");
            if (page > 0) {
              pdf.addPage();
            }
            if (page == 0) {
              pdf.addImage(
                pageImageData,
                "JPEG",
                5,
                5,
                pageWidth,
                pageHeight - 20,
              );
              pdf.setFontSize(8);
              pdf.text(`${dateLabel}`, 5, 5, { align: "left" });
            } else {
              pdf.addImage(
                pageImageData,
                "JPEG",
                5,
                20,
                pageWidth,
                pageHeight - 20,
              );
              pdf.setFontSize(8);
              pdf.text(`${dateLabel}`, 5, 5, { align: "left" });
              pdf.setFontSize(9);
              pdf.text("Document", 7.5, 15);
              pdf.text("Type", 47, 15);
              pdf.text("Document Date", 86, 15);
              pdf.text("Due Date", 126, 15);
              pdf.text("Open Amount USD", 166, 15);
            }
          }
          if (from === "share") {
            let pdfContent = pdf.output("datauristring");
            let PDFData = pdfContent.split(",");
            this.spinnerLoading = false;
            this.openShareViaEmailModal(PDFData[1]);
          } else {
            const blob = pdf.output("blob");
            const url = URL.createObjectURL(blob);
            window.open(url, "_blank");
          }

          popupWin.close();
          this.hideProgressModal("printOrderId");
        });
      };

      console.log("tableItemsSize--: ", this.tableItemsSize);
    });
  }
}
