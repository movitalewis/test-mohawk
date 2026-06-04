import {
  Component,
  OnInit,
  OnDestroy,
  TemplateRef,
  QueryList,
  ViewChildren,
  Inject,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { Columns, Config, DefaultConfig } from "ngx-easy-table";
import { StorageService } from "src/app/features/http-services/storage.service";
import { CommentModalComponent } from "src/app/features/shared/components/comment-modal/comment-modal.component";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import { ClaimsService } from "../../services/claims.service";
import { DOCUMENT, Location } from "@angular/common";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { faMessage } from "@fortawesome/free-solid-svg-icons";
import { CLAIM_TYPE_DESC, CLAIM_TYPE_MAP, FREIGHT_RELATED } from "src/app/features/shared/constants/URL-PERMISSIONS-CONSTANTS";
import { ShareViaEmailLightboxComponent } from "../../../products/components/share-via-email-lightbox/share-via-email-lightbox.component";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { CLAIM_TYPES } from "src/app/features/shared/constants/CLAIMS-CONSTANTS";
@Component({
    selector: "app-claim-confirmation",
    templateUrl: "./claim-confirmation.component.html",
    styleUrls: ["./claim-confirmation.component.scss"],
    standalone: false
})
export class ClaimConfirmationComponent implements OnInit, OnDestroy {
  faMessage : any = faMessage
  @ViewChildren("hidden") hidden:
    | QueryList<ClaimConfirmationComponent>
    | undefined;
  claimTypes = CLAIM_TYPES;
  isCollapsed = true;
  claimDetails: any = [];
  claimNumber: string = "";
  claimNumberMasked: string = "";

  breadcrumbItems: BreadcrumbItems = [
    {
      name: "Home",
      path: "/residential",
      active: false,
    },
    {
      name: "Claim",
      path: "/residential/claims/createclaim",
      active: false,
    },
  ];
  public configuration!: Config;
  public columns!: Columns[];

  public configuration1!: Config;
  public columns1!: Columns[];

  showAllProductLines: boolean = false;
  showProductLines: boolean = false;
  showNonProductLines: boolean = false;
  claimType: any;
  isCollapseArr: boolean[] = [];
  isCollapseArrCopy: boolean[] = [];
  claimTypeMap:any = CLAIM_TYPE_MAP;
  claimTypeDesc:any = CLAIM_TYPE_DESC;
  freightMap: any = FREIGHT_RELATED;
  public data = [
    {
      itemNo: "1",
      styleDiscription: "BT272 FNTAL FACTOR",
      colorDescription: "7889 WOODLAND",
      dyeLot: "T501233",
      shippedQuantity: "5 carton(s)",
      price: "$50.12",
      amount: "34 sq ft",
      claimAmount: "$50.12",
      claimStatus: "In Process",
      claimQuantity: "34 sq ft",
      returnAuthorization: "#3430034 02/10/21",
      creditMemo: "CR1",
      creditDate: "02/10/21",
      creditAmount: "$115.32",
    },
    {
      itemNo: "2",
      styleDiscription: "BT272 FNTAL FACTOR",
      colorDescription: "7889 WOODLAND",
      dyeLot: "T501233",
      shippedQuantity: "5 carton(s)",
      price: "$50.12",
      amount: "34 sq ft",
      claimAmount: "$50.12",
      claimStatus: "In Process",
      claimQuantity: "34 sq ft",
      returnAuthorization: "#3430034 02/10/21",
      creditMemo: "CR1",
      creditDate: "02/10/21",
      creditAmount: "$115.32",
    },
  ];

  public data1 = [
    {
      description: "FUEL SURCHARGE",
      reference: "FUEL SURCHARGE",
      quantity: "1.0",
      chargeUsd: "$56.10",
    },
  ];
  claimNumSub: any;
  modalRef!: BsModalRef;
  spinnerLoading: boolean = false;
  isNewClaim: string = "false";
  nonProductLinesFlag: boolean = false;
  currency = "";
  constructor(
    private claimsService: ClaimsService,
    private router: ActivatedRoute,
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private storageService: StorageService,
    private route: Router,
    private userService:UserService,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.router.queryParamMap.subscribe((res: any) => {
      this.isNewClaim = res?.params?.isNewClaim;
    });
  }
  ngOnDestroy() {
    if (this.claimNumSub) {
      this.claimNumSub.unsubscribe();
    }
  }

  ngOnInit(): void {
    if (this.claimNumSub) {
      this.claimNumSub.unsubscribe();
    }
    this.claimNumSub = this.storageService
      .getItem("claimNumber")
      .subscribe((res) => {
        if (this.claimNumber != res) {
          this.claimNumber = res;
          this.getClaimsHistory(this.claimNumber);
        }
      });
    this.configuration = { ...DefaultConfig };
    this.configuration.checkboxes = false;
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;
    this.columns = [
      { key: "additionalInfoNotes", title: "View Comments" },
      { key: "invoiceSeq", title: "Line Number" },
      { key: "salesmanName", title: "Sales man Name" },
      { key: "claimStatusDetail", title: "Line Status" },
      { key: "component", title: "Type" },
      { key: "styleName", title: "Style #/Desc" },
      { key: "colorName", title: "Color #/Desc" },
      { key: "dyeLot", title: "Dye Lot" },
      { key: "rollNumber", title: "Roll #" },
      { key: "partNumber", title: "Part #" },
      { key: "shipQuantity", title: "Invoice Qty" },
      { key: "pricePerUnit", title: "Invoice Unit Price" },
      { key: "productPrice", title: "Invoice Amount (USD)" },
      { key: "claimQuantity", title: "Claim Quantity" },
      { key: "affectedQuantity", title: "Affected Qty" },
      { key: "amountProductAffected", title: "Product Affected" },
      { key: "expectedQuantity", title: "Expected Qty" },
      { key: "receivedQuantity", title: "Received Qty" },
      { key: "invoiceSubTotal", title: "Sub Total (USD)" },
      { key: "priceQuoted", title: "expected Unit Price (USD)" },
      { key: "disputeAmount", title: "Adjustment Amount (USD)" },
      { key: "creditMemoAmount", title: "Credit Memo Amount(USD)" },
      { key: "creditMemoNumber", title: "Credit Memo" },
      { key: "creditMemoDate", title: "Credit Memo Date" },
    ];
    this.configuration1 = { ...DefaultConfig };
    this.configuration1.checkboxes = false;
    this.configuration1.tableLayout.striped = true;
    this.configuration1.tableLayout.hover = false;
    this.configuration1.paginationRangeEnabled = false;
    this.configuration1.paginationEnabled = false;
    this.columns1 = [
      { key: "invoiceSeq", title: "Line Number" },
      { key: "salesmanName", title: "Sales man Name" },
      { key: "claimStatusDetail", title: "Line Status" },
      { key: "component", title: "Type" },
      { key: "styleName", title: "Style #/Desc" },
      { key: "colorName", title: "Color #/Desc" },
      { key: "dyeLot", title: "Dye Lot" },
      { key: "rollNumber", title: "Roll #" },
      { key: "partNumber", title: "Part #" },
      { key: "shipQuantity", title: "Invoice Quanity" },
      { key: "freightCharge", title: "Charge (USD)" },
      { key: "taxAmount", title: "Tax Amount (USD)" },
      { key: "miscCharge", title: "Misc Charge (USD)" },
      { key: "invoiceSubTotal", title: "Sub Total (USD)" },
      { key: "claimAmount", title: "Claim Amount (USD)" },
      { key: "amountProductAffected", title: "Amount of Product Affected" },
      { key: "creditMemoAmount", title: "Credit Memo Amount(USD)" },
      { key: "creditMemoNumber", title: "Credit Memo" },
      { key: "creditMemoDate", title: "Credit Memo Date" },
    ];
  }
  isClaimDraft = false;
  showPostedComments = false;
  showSalesComments = false;
  getQueryParamFromUrl() {
    this.router.queryParams.subscribe((params) => {
      const claim = params[`claim`];
      if (claim == "draft") {
        this.isClaimDraft = true;
      } else {
        this.isClaimDraft = false;
        this.claimNumber = params[`claim`];
      }
    });
  }

  getClaimsHistory(claimNumber: any) {
    this.spinnerLoading = true;
    this.userService.progressShow('claimConfirmation');
    this.claimsService
      .getClaimsDetails("?claimNumber=" + this.claimNumber, {})
      .subscribe(
        (res) => {
          this.userService.progressHide('claimConfirmation');
          this.claimDetails = res.body;
          this.checkClaimType();
          this.processDataForRowspan();
          this.claimDetails.invoice = this.setInvoiceItems(this.claimDetails?.invoice);
          const currencyFilter = this.claimDetails?.invoice.filter((item:any)=> item?.currency != '');
          this.currency = currencyFilter?.length > 0 ? currencyFilter[0].currency : '';
          if (this.claimDetails.claimStatus.toUpperCase() == "DRAFT") {
            this.claimNumberMasked = this.claimDetails.claimStatus + " Claim";
            this.breadcrumbItems.push({
              name: "Claim # - " + this.claimNumberMasked,
              path: "/",
              active: true,
            });
          } else {
            this.claimNumberMasked = this.claimNumber;
            this.breadcrumbItems.push({
              name: "Claim # - " + this.claimNumber,
              path: "/",
              active: true,
            });
          }
          this.claimDetails?.invoice?.map((item: any) => {
            if (item.component == "PRODUCT") {
              this.columns.forEach((column: any) => {
                item[column.key] =
                  item[column.key] == undefined ? "NA" : item[column.key];
              });
              this.isCollapseArr.push(false);              
              this.isCollapseArrCopy.push(true);
            } else {
              this.columns1.forEach((column: any) => {
                item[column.key] =
                  item[column.key] == undefined ? "NA" : item[column.key];
              });
            }
            item.isNonProductLine = !this.checkInvoiceLIne(item, this.claimDetails?.invoice);
          });
          this.spinnerLoading = false;
          this.nonProductLinesFlag = this.claimDetails?.invoice?.every((item: any) => item?.component != 'PRODUCT');
          if (this.nonProductLinesFlag && (this.claimType = this.claimTypes.FREIGHT || "freight-claim")) {
            this.columns = this.columns.filter((item: any) =>
              item.key != 'priceQuoted' &&
              item.key != 'receivedQuantity' &&
              item.key != 'expectedQuantity' &&
              item.key != 'amountProductAffected' &&
              item.key != 'affectedQuantity' &&
              item.key != 'disputeAmount' &&
              item.key != 'claimQuantity'
            );
          };
        },
        (err) => {
          this.spinnerLoading = false;
        }
      );
  }
  openCommentModal(row: any) {
    const initialState: ModalOptions = {
      initialState: {
        additionalInfoNotes: row.additionalInfoNotes,
        isDisabled: true,
      },
    };
    this.bsModalRef = this.modalService.show(
      CommentModalComponent,
      Object.assign(initialState, {
        id: "comments",
        class: "modal-lg modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }

  claimEdit() {
    this.claimsService.selectedInvoiceLines.line = [
      ...[],
      ...this.claimDetails?.invoice?.invoiceLines,
    ];
    this.claimsService.selectedInvoiceLines.line.map((item: any) => {
      item.requestedClaimAmount = "";
      item.expectedUnitPrice = "";
      item.adjustmentAmount = "";
      item.invoiceUnitPrice = item.price.replace("$", "");
      item.additionalInfoNotes = "";
    });
    this.claimsService.selectedInvoiceLines.totalLines =
      this.claimDetails?.invoice?.invoiceLines.length;
    this.claimsService.selectedInvoiceLines.invoiceNumber =
      this.claimDetails?.invoiceNumber;
    this.claimsService.selectedInvoiceLines.invoiceTotal =
      this.claimDetails?.invoice?.invoiceTotal.replace("$", "");
    this.claimsService.selectedInvoiceLines.invoiceDate =
      this.claimsService.selectedInvoiceLines.invoiceYear =
        this.claimDetails?.invoice?.invoiceDate;
    this.claimDetails?.invoice?.invoiceDate.includes("/")
      ? this.claimDetails?.invoice?.invoiceDate.split("/").pop()
      : "";
    this.claimsService.selectedInvoiceLines.isFromClaimHistory = true;
    this.claimsService.selectedInvoiceLines.claimData = this.claimDetails;
    let claimType = "";
    this.checkClaimType();

    this.route.navigateByUrl("residential/claims/" + this.claimType);
  }
  viewDraftClaim() {
    let url = "residential/claims/details?claim=";
    url =
      this.claimDetails.claimStatus !== "DRAFT"
        ? url + this.claimNumber
        : url + "draft";
    this.storageService.setItem("claimNumber", this.claimNumber);
    this.route.navigateByUrl(url);
  }

  cancelClaim() {
    this.route.navigate(["/residential/claims/createclaim"]);
  }

  claimHistory() {
    this.route.navigate(["/residential/claims/history"]);
  }

  nonProductlength(ln: any) {
    if (ln?.component == "PRODUCT") {
      let a = this.claimDetails?.invoice?.filter(
        (it: any) => it.invoiceSeq == ln.invoiceSeq && it.component != "PRODUCT"
      );
      return a.length;
    }
  }
  checkClaimType() {
    switch (this.claimDetails?.claimType) {
      case "Freight Billing Error":
        this.claimType = this.claimTypes.FREIGHT;
        this.showNonProductLines = true;
        break;
      case "Pricing Billing Error":
        this.claimType = this.claimTypes.PRICING;
        this.showProductLines = true;
        break;
      case "Tax Billing Error":
        this.claimType = this.claimTypes.TAX;
        this.showNonProductLines = true;
        break;
      case "Accommodation Return":
        this.claimType = this.claimTypes.ACCOMMODATION_RETURN;
        this.showProductLines = true;
        break;
      case "Assurance Warranty Claim":
        this.claimType = this.claimTypes.CUSTOMER_SATISFACTION;
        this.showAllProductLines = true;
        break;
      case "Order Error Claim":
        this.claimType = this.claimTypes.MOHAWK_ORDER_ERROR;
        this.showAllProductLines = true;
        break;
      case "Defective Product Claim":
        this.claimType = this.claimTypes.DEFECTIVE_PRODUCT;
        this.showAllProductLines = true;
        break;
      case "Wrong Product Claim":
        this.claimType = this.claimTypes.WRONG_PRODUCT;
        this.showAllProductLines = true;
        break;
      case "Damage Claim":
        this.claimType = this.claimTypes.DAMAGED;
        this.showAllProductLines = true;
        break;
      case "Quantity Claim":
        this.claimType = this.claimTypes.WRONG_QUANTITY_SHORTAGE;
        this.showAllProductLines = true;
        break;
      case "Cancellation Fees":
        this.claimType = this.claimTypes.CANCELLATION_FEE;
        this.showNonProductLines = true;
        break;
    }
    if(this.showAllProductLines){
      this.checkProductLinesAvailable();
    }
  }
  checkProductLinesAvailable(){
    let missedProductLines:any = [];
    this.claimDetails?.invoice.forEach((item:any) =>{
      if(item.component !== 'PRODUCT' && this.claimDetails?.invoice.filter((inv:any) => (inv.component === 'PRODUCT' && inv.invoiceSeq === item.invoiceSeq)).length === 0){
        if(!missedProductLines.includes(item.invoiceSeq)){
          missedProductLines.push(item.invoiceSeq);
        }
      }
    });
    missedProductLines.forEach((product:any)=>{
      this.claimDetails?.invoice.unshift({component : "PRODUCT", invoiceSeq:product, isRemovedLine:true})
    })
    if(missedProductLines.length > 0){
      this.claimDetails?.invoice.sort((a:any,b:any)=> a.invoiceSeq - b.invoiceSeq);
      this.claimDetails?.invoice.forEach((item:any,i:any)=>{
        if(item?.isRemovedLine === true){
          this.isCollapseArr[i] = true;
        }
      })
    }
  }
  lineComment = "";
  selectedInvLine: any;
  openommentModal(template: TemplateRef<any>, inv: any) {
    this.lineComment = inv?.additionalInfoNotes;
    this.selectedInvLine = inv;
    this.bsModalRef = this.modalService.show(
      template,
      Object.assign(
        {},
        {
          class: "modal-lg modal-dialog-centered",
        }
      )
    );
  }
  onHideModal() {
    this.modalService.hide();
  }
  claimNumberShow = false
  async printPage() {
    this.claimNumberShow = true
    await new Promise(resolve => setTimeout(resolve, 100));
    let printContents: any, popupWin: any;
    let clsFlag: any = this.document.getElementById("collapseBasic");
    clsFlag.style.display = "block";
    let tdFlag: any = this.document.getElementById("tableData");
    tdFlag.style.display = "none";
    let pdFlag: any = this.document.getElementById("printData");
    pdFlag.style.display = "block";
    this.hidelement(true);

    printContents = this.document.getElementById("print-section")?.innerHTML;
    popupWin = window.open("", "_blank", "top=0,left=0,height=100%,width=auto");
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
        <title>&nbsp;</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
        <link rel="stylesheet" href="/styles.css" crossorigin="anonymous">
        <link rel="stylesheet" href="/assets/print/claim-details-print.css" crossorigin="anonymous">        
        </head>
         <body onload="window.print()" >
        <img src="/assets/images/logo-residential-dark.png" width=250 style="margin:30px 0px">
        ${printContents}
        </body>
      </html>`);
    popupWin.document.close();
    popupWin.onafterprint = () => popupWin.close();
    this.hidelement(false);
    this.claimNumberShow = false
    clsFlag.style.display = this.isCollapsed ? "none" : "block";
    tdFlag.style.display = "block";
    pdFlag.style.display = "none";
  }
  hidelement(result: Boolean) {
    this.hidden?.toArray().forEach((element: any) => {
      element.nativeElement.hidden = result;
    });
  }
  
  async viewClaimPdf(from = ''){ 
    this.claimNumberShow = true
    await new Promise(resolve => setTimeout(resolve, 100));
    let printContents: any, popupWin: any;
    let clsFlag: any = this.document.getElementById("collapseBasic");
    clsFlag.style.display = "block";
    let tdFlag: any = this.document.getElementById("tableData");
    tdFlag.style.display = "none";
    let pdFlag: any = this.document.getElementById("printData");
    pdFlag.style.display = "block";
    this.addOrRemoveCssClass(true);
    this.hidelement(true);
    printContents = this.document.getElementById("print-section")?.innerHTML;
    popupWin = window.open("", "_blank");
    if(from === "share" && popupWin){
      this.spinnerLoading = true;
      window.focus();
    }
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
        <title>&nbsp;</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
        <link rel="stylesheet" href="/styles.css" crossorigin="anonymous">
        <link rel="stylesheet" href="/assets/print/claim-details-print.css" crossorigin="anonymous">        
        </head>
        <body >
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
      const content = popupWin.document.getElementById('pdfClaimContent');
      html2canvas(content,{scale: from === 'share' ? 2: 1, useCORS: true}).then((canvas:any)=>{
        const data = canvas.toDataURL('image/jpeg');
        const pdf = new jsPDF("p","mm","a4",true);
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
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = pageHeight * (canvas.width / pageWidth);
          const ctx: any = pageCanvas.getContext('2d');
          ctx.canvas.style.border="none"
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
              pageCanvas.height
            );
          }
          const pageImageData = pageCanvas.toDataURL('image/png');
          if (page > 0) {
            pdf.addPage();
          }
          if (page == 0) {
            pdf.addImage(pageImageData, 'JPEG', 5, 5, pageWidth, pageHeight - 20);
          } else {
            pdf.addImage(pageImageData, 'JPEG', 5, 10, pageWidth, pageHeight - 20);
          }
        }
        if (from === 'share') {
          let pdfContent = pdf.output("datauristring");
          let PDFData = pdfContent.split(",");
          this.spinnerLoading = false;
          this.openShareViaEmailModal(PDFData[1]);
        }else{
        const blob = pdf.output("blob");
        const url = URL.createObjectURL(blob);
        window.open(url,"_blank");
        }
        
        popupWin.close();
      })   
    }
    this.claimNumberShow = false
    this.hidelement(false);
    this.addOrRemoveCssClass(false);
    clsFlag.style.display = this.isCollapsed ? "none" : "block";
    tdFlag.style.display = "block";
    pdFlag.style.display = "none";
  }
  addOrRemoveCssClass(flag: boolean) {
    let h1Tags: any = document.getElementsByTagName("h1") || [];
    let h3Tags: any = document.getElementsByTagName("h3") || [];
    let h4Tags: any = document.getElementsByTagName("h4") || [];
    let h5Tags: any = document.getElementsByTagName("h5") || [];
    let h6Tags: any = document.getElementsByTagName("h6") || [];
    let pTags: any = document.getElementsByTagName("p") || [];
    [...h1Tags, ...h3Tags, ...h4Tags, ...h5Tags, ...h6Tags, ...pTags].forEach((el: any) => {
      if (flag) {
        el.classList.add('pdf-font');
      } else {
        el.classList.remove('pdf-font');
      }
    });
  }

  openShareViaEmailModal(pdfContent: any) {
    let mailSubject = `Mohawk Claim details for ${this.claimNumber}`;
    const initialState: ModalOptions = {
      initialState: {
        mailBody: 'Attached Claim Details',
        pdfName:'claim_details.pdf',
        mailSubject: mailSubject,
        content: pdfContent,
        senderInfo: this.storageService.userInfo,
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

  convertToUsPhoneFormat(val: any) {
    if (val?.length) {
      let formatedValue = "(";
      formatedValue += val?.substring(0, 3) + ") ";
      formatedValue += val?.substring(3, 6) + " ";
      formatedValue += val?.substring(6, 10);
      return formatedValue;
    } else {
      return "";
    }
  }

  colSpanLength() {
    let value = 0;
    if (this.claimDetails?.claimType == this.claimTypes.DEFECTIVE_PRODUCT) {
      value = 3;
    } else if (
      this.claimDetails?.claimType == this.claimTypes.CUSTOMER_SATISFACTION ||
      this.claimDetails?.claimType == this.claimTypes.MOHAWK_ORDER_ERROR ||
      this.claimDetails?.claimType == this.claimTypes.WRONG_PRODUCT ||
      this.claimDetails?.claimType == this.claimTypes.DAMAGED
    ) {
      value = 1;
    } else if (this.claimDetails?.claimType == this.claimTypes.WRONG_QUANTITY_SHORTAGE) {
      value = 4;
    }
    return value;
  }
  checkInvoiceLIne(line: any, invoices: any) {
    return invoices?.some((item: any)=> (item.component == 'PRODUCT' && line?.invoiceSeq == item?.invoiceSeq)); 
  }
  processDataForRowspan() {
    let map = new Map();
    this.claimDetails?.invoice?.forEach((item: any) => {
      map.set(item.invoiceSeq, (map.get(item.invoiceSeq) || 0) + 1)
    });
    let seenInvoiceSeq = new Set();
    for (let item of this.claimDetails?.invoice) {
      if (!seenInvoiceSeq.has(item.invoiceSeq)) {
        item.rowspan = map.get(item.invoiceSeq);
        item.showRow = true;
        seenInvoiceSeq.add(item.invoiceSeq);
      } else {
        item.rowspan = 0;
        item.showRow = false;
      }
    }
  }

  setInvoiceItems(invoices: any) {
    invoices.sort((a: any, b: any) => a.invoiceSeq - b.invoiceSeq);
    let sortedInvoices = [];
    let currentInvoiceSeq = null;
    let currentGroup = [];
    for (let invoice of invoices) {
      if (invoice.invoiceSeq !== currentInvoiceSeq) {
        if (currentGroup.length > 0) {
          currentGroup.sort((a, b) => a.component === 'PRODUCT' ? -1 : 1);
          sortedInvoices.push(...currentGroup);
        }
        currentInvoiceSeq = invoice.invoiceSeq;
        currentGroup = [invoice];
      } else {
        currentGroup.push(invoice);
      }
    }
    if (currentGroup.length > 0) {
      currentGroup.sort((a, b) => a.component === 'PRODUCT' ? -1 : 1);
      sortedInvoices.push(...currentGroup);
    }
    return sortedInvoices;
  }
  setColumn(col: any, line: any) {
    if (line?.component != 'PRODUCT') {
      if (col.key == 'claimQuantity') {
        col = {
          key: 'claimAmount',
          title: `Claim Amount (${this.currency})`,
        }
      } else if (col.key == 'productPrice') {
        col = {
          key: 'productPrice',
          title: `Charge (${this.currency})`,
        }
      }
    }
    return col.title;
  }
}
