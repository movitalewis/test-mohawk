import {
  Component,
  Inject,
  OnInit,
  OnDestroy,
  TemplateRef,
  ViewChildren,
  QueryList,
} from "@angular/core";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import { Config, Columns, DefaultConfig } from "ngx-easy-table";
import { ClaimsService } from "../../services/claims.service";
import { ActivatedRoute, Router } from "@angular/router";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { CommentModalComponent } from "src/app/features/shared/components/comment-modal/comment-modal.component";
import { StorageService } from "src/app/features/http-services/storage.service";
import { DOCUMENT, Location } from "@angular/common";
import { ConfirmationDialogComponent } from "src/app/features/shared/components/confirmation-dialog/confirmation-dialog.component";
import { faMessage } from "@fortawesome/free-solid-svg-icons";
import { CLAIM_TYPE_DESC, CLAIM_TYPE_MAP, FREIGHT_RELATED } from "src/app/features/shared/constants/URL-PERMISSIONS-CONSTANTS";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { ShareViaEmailLightboxComponent } from "../../../products/components/share-via-email-lightbox/share-via-email-lightbox.component";
import { jsPDF } from "jspdf";
import  html2canvas  from "html2canvas";
import { CLAIM_TYPES } from "src/app/features/shared/constants/CLAIMS-CONSTANTS";


@Component({
    selector: "app-claim-approval-details",
    templateUrl: "./claim-approval-details.component.html",
    styleUrls: ["./claim-approval-details.component.scss"],
    standalone: false
})
export class ClaimApprovalDetailsComponent implements OnInit, OnDestroy {
    bulkMessages:any = [];
    claimModalSpinner= false
  faMessage: any = faMessage;
  @ViewChildren("hidden") hidden:
    | QueryList<ClaimApprovalDetailsComponent>
    | undefined;
  claimTypes = CLAIM_TYPES;
  isCollapsed = true;
  claimDetails: any = [];
  claimNumber: string = "";
  currency = "";
  claimNumberMasked: string = "";
  actionRequiredOptions = [
    { label: 'Approve', value: 'approve' },
    { label: 'Reject', value: 'reject' }
  ];
  
  breadcrumbItems: BreadcrumbItems = [
    {
      name: "Home",
      path: "/commercial",
      active: false,
    },
    {
      name: "Claims Approval List",
      path: "/commercial/claims/approval-list",
      active: false,
    },
  ];
  public commentData: any = [];
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
  modalRef!: BsModalRef;
  claimNumSub: any;
  claimApproveStatus = null;
  constructor(
    private claimsService: ClaimsService,
    private router: ActivatedRoute,
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private storageService: StorageService,
    private route: Router,
    private _location: Location,
    private userService : UserService,
    @Inject(DOCUMENT) private document: Document
  ) {}
  trackByInvoiceSeq = (_: number, item: any) => item?.invoiceSeq ?? _;
  trackByKey = (_: number, item: any) => item?.key ?? _;

  ngOnDestroy() {
    if (this.claimNumSub) {
      this.claimNumSub.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.getQueryParamFromUrl();
    this.configuration = { ...DefaultConfig };
    this.configuration.checkboxes = false;
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;
    this.columns = [
      { key: "additionalInfoNotes", title: "Approve / Reject" },
      { key: "returnAuthNumber", title: "Return Auth Number" },
      { key: "invoiceSeq", title: "Invoice Line Number" },
      { key: "disputeCaseId", title: "Claim Line Number" },
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
      { key: "invoiceSubTotal", title: "Sub Total (USD)" },
      { key: "claimQuantity", title: "Claim Quantity" },
      { key: "affectedQuantity", title: "Affected Qty" },
      { key: "amountProductAffected", title: "Product Affected" },
      { key: "expectedQuantity", title: "Expected Qty" },
      { key: "receivedQuantity", title: "Received Qty" },
      { key: "priceQuoted", title: "expected Unit Price (USD)" },
      { key: "disputeAmount", title: "Adjustment Amount (USD)" },
      { key: "creditMemoAmount", title: "Credit Memo Amount (USD)" },
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
      { key: "returnAuthNumber", title: "Return Auth Number" },
      { key: "invoiceSeq", title: "Invoice Line Number" },
      { key: "disputeCaseId", title: "Claim Line Number" },
      { key: "salesmanName", title: "Sales man Name" },
      { key: "claimStatusDetail", title: "Line Status" },
      { key: "component", title: "Type" },
      { key: "styleName", title: "Style #/Desc" },
      { key: "colorName", title: "Color #/Desc" },
      { key: "shipQuantity", title: "Invoice Quantity" },
      { key: "freightCharge", title: `Charge (USD)` },
      { key: "taxAmount", title: `Tax Amount (USD)` },
      { key: "miscCharge", title: `Misc Charge (USD)` },
      { key: "claimAmount", title: `Claim Amount (USD)` },
      { key: "amountProductAffected", title: "Amount of Product Affected" },
      { key: "creditMemoAmount", title: `Credit Memo Amount (USD)` },
      { key: "creditMemoNumber", title: "Credit Memo" },
      { key: "creditMemoDate", title: "Credit Memo Date" },
    ];
    this.commentData = [
      {
        comment:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed malesuada auctor turpis, in efficitur nisl placerat sit amet. Nullam vel orci quam. Aenean vulputate purus id quam tincidunt, id fermentum turpis sollicitudin.",
        analystName: "Bill Smith",
        timeStamp: "03-02-2023 1:23PM",
      },
      {
        comment:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed malesuada auctor turpis, in efficitur nisl placerat sit amet. Nullam vel orci quam.",
        analystName: "Sarah Tims",
        timeStamp: "03-01-2023 1:23PM",
      },
    ];
  }
  claimTypeMap: any = CLAIM_TYPE_MAP;
  claimTypeDesc: any = CLAIM_TYPE_DESC;
  freightMap: any = FREIGHT_RELATED;

  value: any;
  isClaimDraft = false;
  spinnerLoading: boolean = false;
  errorMessage: any;
  showAuthHeader: boolean = false;
  commentFlag: boolean = false;
  errorMessageClaim = "";
  alertType: any = "danger";
  nonProductLinesFlag: boolean = false;
  getQueryParamFromUrl() {
    this.router.queryParams.subscribe((params) => {
      const claim = params[`claim`];
      if (claim == "draft") {
        this.isClaimDraft = true;
        if (this.claimNumSub) {
          this.claimNumSub.unsubscribe();
        }
        this.claimNumSub = this.storageService
          .getItem("claimNumber")
          .subscribe((res) => {
            if (this.claimNumber != res) {
              this.claimNumber = res;
              this.getClaimsHistory();
            }
          },(err)=>{
            this.userService.progressHide()
          });
      } else {
        this.isClaimDraft = false;
        this.claimNumber = params[`claim`];
        this.getClaimsHistory();
      }
    });
  }

  getClaimsHistory() {
    // this.spinnerLoading = true;
    this.userService.progressShow('claimApprovalDetails');
    this.claimsService
      .getClaimsDetails("?claimNumber=" + this.claimNumber, {})
      .subscribe(
        (res) => {
          this.userService.progressHide('claimApprovalDetails');
          this.claimsService.selectedInvoiceLines.claimNumber =
            this.claimNumber;
          this.spinnerLoading = false;
          this.claimDetails = res.body;
          this.processDataForRowspan();
          this.claimDetails.invoice = this.setInvoiceItems(this.claimDetails?.invoice);
          const currencyFilter = this.claimDetails?.invoice.filter(
            (item: any) => item?.currency != ""
          );
          this.claimDetails.isApprovalRequiredFlag = this.claimDetails?.invoice?.some(
            (item: any) => item?.isApprovalRequired == true
          );
          this.currency =
            currencyFilter?.length > 0 ? currencyFilter[0].currency : "";
          this.checkClaimType();
          if (this.showAllProductLines) {
            this.checkProductLinesAvailable();
          }
          if (this.claimDetails.claimStatus == "DRAFT") {
            this.claimNumberMasked = this.claimDetails.claimStatus;
            const claimNumber = "Claim # - " + this.claimNumberMasked;
            const exists = this.breadcrumbItems.some(item => item.name === claimNumber);
            if (!exists) {
              this.breadcrumbItems.push({
                name: claimNumber,
                path: "/",
                active: true,
              });
            }
          } else {
            this.claimNumberMasked = this.claimNumber;
            const claimNumber = "Claim # - " + this.claimNumberMasked;
            const exists = this.breadcrumbItems.some(item => item.name === claimNumber);    
            if (!exists) {
              this.breadcrumbItems.push({
                name: claimNumber,
                path: "/",
                active: true,
              });
            }
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
            if (
              item?.returnAuthFileId &&
              item?.returnAuthFileId !== "" &&
              this.showAuthHeader == false
            ) {
              this.showAuthHeader = true;
            }
            item.isNonProductLine = !this.checkInvoiceLIne(item, this.claimDetails?.invoice);
          });
          if (!this.showAuthHeader && !this.commentFlag) {
            if (this.columns.some((col: any)=> col?.key == 'returnAuthNumber')) {
              this.columns.splice(1, 1);
            } if (this.columns1.some((col: any)=> col?.key == 'returnAuthNumber')) {
              this.columns1.splice(0, 1);
            }
          }
          this.nonProductLinesFlag = this.claimDetails?.invoice?.every((item: any) => item?.component != 'PRODUCT');
          if (this.nonProductLinesFlag && this.claimType == this.claimTypes.FREIGHT) {
            this.columns = this.columns.filter((item: any) =>
              item.key != 'priceQuoted' &&
              item.key != 'receivedQuantity' &&
              item.key != 'expectedQuantity' &&
              item.key != 'amountProductAffected' &&
              item.key != 'affectedQuantity' &&
              item.key != 'disputeAmount' &&
              item.key != 'claimQuantity'
            );
          }
        },
        (err) => {
          this.userService.progressHide('claimApprovalDetails');
          this.spinnerLoading = false;
          this.errorMessageClaim = err.error;
        }
      );
  }
  checkProductLinesAvailable() {
    let missedProductLines: any = [];
    this.claimDetails?.invoice.forEach((item: any) => {
      if (
        item.component !== "PRODUCT" &&
        this.claimDetails?.invoice.filter(
          (inv: any) =>
            inv.component === "PRODUCT" && inv.invoiceSeq === item.invoiceSeq
        ).length === 0
      ) {
        if (!missedProductLines.includes(item.invoiceSeq)) {
          missedProductLines.push(item.invoiceSeq);
        }
      }
    });
    missedProductLines.forEach((product: any) => {
      this.claimDetails?.invoice.unshift({
        component: "PRODUCT",
        invoiceSeq: product,
        isRemovedLine: true,
      });
    });
    if (missedProductLines.length > 0) {
      this.claimDetails?.invoice.sort(
        (a: any, b: any) => a.invoiceSeq - b.invoiceSeq
      );
      const removedLines = this.claimDetails?.invoice.filter(
        (item: any) => item.isRemovedLine === true
      );
      this.claimDetails?.invoice.forEach((item: any, i: any) => {
        if (item?.isRemovedLine === true) {
          this.isCollapseArr[i] = true;
        }
      });
    }
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
    if (this.claimDetails?.readOnly === true) {
      return;
    }
    this.claimsService.selectedInvoiceLines.businessArea =
      this.claimDetails?.businessArea;
    this.claimsService.selectedInvoiceLines.salesOrg =
      this.claimDetails?.erpCompanyCode;
    this.claimsService.selectedInvoiceLines.totalLines =
      this.claimDetails?.invoice?.length;
    this.claimsService.selectedInvoiceLines.invoiceNumber =
      this.claimDetails?.invoiceNumber;
    this.claimsService.selectedInvoiceLines.invoiceTotal =
      this.claimDetails?.invoiceTotal;
    this.claimsService.selectedInvoiceLines.invoiceDate =
      this.claimDetails?.invoiceDate;
    this.claimsService.selectedInvoiceLines.invoiceYear =
      this.claimDetails?.invoiceDate?.includes("/")
        ? this.claimDetails?.invoiceDate?.split("/").pop()
        : "";
    this.claimsService.selectedInvoiceLines.isFromClaimHistory = true;
    this.claimsService.selectedInvoiceLines.claimData = this.claimDetails;
    this.claimsService.selectedInvoiceLines.nonProductLinesFlag = this.nonProductLinesFlag;
    let data: any = [];
    this.claimDetails?.invoice?.map((ln: any) => {
      for (let obj in ln) {
        if (obj == "claimAmount") {
          ln[obj] = ln[obj]?.replace(",", "")?.replace("$", "");
        }
      }
      if (data.findIndex((i: any) => i.invoiceSeq == ln.invoiceSeq) == -1) {
        if (ln.component == "PRODUCT") {
          let newLine: any = [];
          this.claimDetails?.invoice?.filter((inv: any) => {
            if (ln.invoiceSeq == inv.invoiceSeq) newLine.push(inv);
          });
          data.push({
            invoiceNumber: this.claimDetails?.invoiceNumber,
            invoiceSeq: ln?.invoiceSeq,
            invoiceTotal: ln?.invoiceTotal,
            disputeCaseId: ln?.disputeCaseId,
            selectedLines: [...newLine],
            isRemovedLine: ln?.isRemovedLine || undefined,
          });
        }
        if (
          this.claimType == this.claimTypes.FREIGHT ||
          this.claimType == this.claimTypes.CANCELLATION_FEE ||
          this.claimType == this.claimTypes.TAX
        ) {
          let newLine: any = [];
          this.claimDetails?.invoice?.filter((inv: any) => {
            if (ln.invoiceSeq == inv.invoiceSeq) newLine.push(inv);
          });
          data.push({
            invoiceNumber: this.claimDetails?.invoiceNumber,
            invoiceSeq: ln?.invoiceSeq,
            invoiceTotal: ln?.invoiceTotal,
            selectedLines: [...newLine],
            isRemovedLine: ln?.isRemovedLine || undefined,
          });
        }
      }
      this.claimsService.selectedInvoiceLines.invoiceTotal = ln?.invoiceTotal;
    });
    this.claimsService.selectedInvoiceLines.line = data;
    this.claimsService.selectedProductLines.next(
      this.claimsService.selectedInvoiceLines.line
    );
    let arr: any = [];
    let pList: any = [];
    this.claimsService.selectedInvoiceLines?.line?.map((ln: any) => {
      ln?.selectedLines?.map((item: any) => {
        item.requestedClaimAmount = item.claimQuantity;
        item.expectedUnitPrice = item.priceQuoted?.replace("$", "");
        item.adjustmentAmount = item.claimAmount;
        item.invoiceUnitPrice = item.pricePerUnit;
        item.additionalInfoNotes = "";
        this.claimsService.expectedUnitPriceQuotedBy = item?.priceQuotedBy;
        if (item.component == "PRODUCT") {
          arr.push(item?.adjustmentAmount);
          pList.push(item);
        }
      });
    });
    this.claimsService.invoiceFieldsValid = pList.every(
      (f: any) => f.expectedUnitPrice || f.claimQuantity
    );

    this.checkClaimType();
    if (this.claimType == this.claimTypes.PRICING) {
      this.claimsService.totalAdjutmentAmount = arr.reduce(
        (a: any, b: any) => Number(a) + Number(b)
      );
    }
    this.route.navigateByUrl("/commercial/claims/" + this.claimType);
  }

  goBack() {
    this._location.back();
  }

  bto() {
    this.route.navigate(["commercial/claims/approval-list"]);
  }

  openConfirmationModal(data = {}) {
    const initialState: ModalOptions = {
      backdrop: true,
      ignoreBackdropClick: true,
      initialState: {
        ...data,
      },
    };
    this.modalRef = this.modalService.show(
      ConfirmationDialogComponent,
      Object.assign(initialState, {
        id: "confirmation",
        class: "modal-md modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }

  discardClaim() {
    this.openConfirmationModal({
      title: "Delete Claim",
      content: `Are you sure to delete claim #${this.claimNumberMasked}`,
      primaryActionLabel: "YES",
      secondaryActionLabel: "NO",
      onPrimaryAction: () => this.deleteClaim(),
      onSecondaryAction: () => this.modalService.hide(""),
    });
  }

  deleteClaim() {
    this.claimsService.discardDraft(this.claimNumber).subscribe({
      next: (res) => {
        this.route.navigateByUrl("/commercial/claims/history");
      },
      error: (err) => {
          this.userService.progressHide();
        this.route.navigateByUrl("/commercial/claims/history");
      },
    });
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
        this.showProductLines = false;
        const filterData = this.claimDetails.invoice.filter(
          (item: any) => item.component.toUpperCase() === "LABOR"
        );
        filterData.length > 0
          ? (this.showAllProductLines = true)
          : (this.showProductLines = true);
        break;
      case "Tax Billing Error":
        this.claimType = this.claimTypes.TAX;
        this.showNonProductLines = true;
        break;
      case "Accommodation Return":
        this.claimType = this.claimTypes.ACCOMMODATION_RETURN;
        this.showProductLines = false;
        const filterDataAccomodation = this.claimDetails.invoice.filter(
          (item: any) => item.component.toUpperCase() === "LABOR"
        );
        filterDataAccomodation.length > 0
          ? (this.showAllProductLines = true)
          : (this.showProductLines = true);
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
  }
  sourceData: any = "";
  downloadFile(id: any, filename: any) {
    if (id) {
      this.claimsService.downloadFile(id).subscribe((res: any) => {
        const result = res.body;
        let reader = new FileReader();
        reader.onload = function (eve) {
          const convertedFile: any = eve.target?.result;
          let link = document.createElement("a");
          link.href = convertedFile;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
        };
        reader.readAsDataURL(result);
      });
    }
  }
  selectedLineNumber = "";
  newComment = "";
  selectedLine: any;
  
  printPage() {
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
        <body onload="window.print()">
        <img src="/assets/images/logo-residential-dark.png" width=250 style="margin:30px 0px">
        ${printContents}
        </body>
      </html>`);
    popupWin.document.close();
    popupWin.onafterprint = () => popupWin.close();
    this.hidelement(false);
    clsFlag.style.display = this.isCollapsed ? "none" : "block";
    tdFlag.style.display = "block";
    pdFlag.style.display = "none";
  }
  hidelement(result: Boolean) {
    this.hidden?.toArray().forEach((element: any) => {
      element.nativeElement.hidden = result;
    });
  }

  authNumberClick(line: any) {
    this.downloadFile(line.returnAuthFileId, line.returnAuthFileName);
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
      this.claimDetails?.claimType == this.claimTypes.DAMAGED ||
      this.claimDetails?.claimType == this.claimTypes.PRICING ||
      this.claimDetails?.claimType == this.claimTypes.ACCOMMODATION_RETURN
    ) {
      value = 1;
    } else if (this.claimDetails?.claimType == this.claimTypes.WRONG_QUANTITY_SHORTAGE) {
      value = 4;
    }
    return value;
  }

  approveClaimClick(modalTemplate: TemplateRef<any>, inv: any) {
    this.selectedLine = inv;
    this.newComment = "";
    this.claimApproveStatus = null;
    this.modalRef = this.modalService.show(modalTemplate, {
      id: "approvalClaimModal",
      class: "modal-lg modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }

  submitApprovalReject() {
    this.errorMessageClaim = "";
    this.bulkMessages = [];
    this.claimModalSpinner= true
    const payload = {
      approvalList: [] as any,
    };
    if (this.selectedLine === null) {
      this.claimDetails?.invoice?.forEach((item: any) => {
        if (item?.isApprovalRequired) {
          payload.approvalList.push({
            claimNumber: this.claimNumber,
            disputeCaseId: item?.disputeCaseId,
            additionalInfoNotes: this.newComment,
            status: this.claimApproveStatus,
          });
        }
      });
    } else {
      payload.approvalList.push({
        claimNumber: this.claimNumber,
        disputeCaseId: this.selectedLine?.disputeCaseId,
        additionalInfoNotes: this.newComment,
        status: this.claimApproveStatus,
      });
    }
    this.userService.progressShow('claimApprovalUpdate');
    this.claimsService.claimApproveReject(payload).subscribe(
      (res: any) => {
        this.userService.progressHide('claimApprovalUpdate');
        const result = res?.body;
        result?.details?.forEach((item:any)=>{
          if(item.status.toLowerCase() === "success"){
            this.bulkMessages.push({alertType : 'success', message: `${item.message} - Claim #: ${result.claimNumber} - Dispute Case ID: ${item.disputeCaseId}`});
          }else{
            this.bulkMessages.push({alertType : 'danger', message: `${item.message} - Claim #: ${result.claimNumber} - Dispute Case ID: ${item.disputeCaseId}`});
          }
        })
        
        this.getClaimsHistory();
        this.claimModalSpinner = false;
        this.scrollToTop();
        this.modalService.hide();

      },
      (err: any) => {
        this.userService.progressHide('claimApprovalUpdate');
        this.claimModalSpinner = false;
        this.modalService.hide();
        this.alertType = 'danger';
        this.errorMessageClaim = err?.error?.errors[0]?.message;
        this.scrollToTop();
      }
    );
  }
  scrollToTop() {
    this.userService.scrollToTop();
    setTimeout(() => {          
      this.alertType = 'danger';
      this.errorMessageClaim = "";
      this.bulkMessages = [];
    }, 10000);
  }
  
  viewClaimPdf(from = ''){ 
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
        el.classList.add('pdf-hTag');
      } else {
        el.classList.remove('pdf-hTag');
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
  getStatus(line: any) {
    let str = "";
    if (!line?.isApprovalRequired && line?.approvalStatus?.toLowerCase().includes('decline')) {
      str = "Rejected";
    } else if (!line?.isApprovalRequired && line?.approvalStatus?.toLowerCase().includes('review')) {
      str = "Under Review";
    } else if (line?.isApprovalRequired && (line?.approvalStatus?.toLowerCase().includes('review') || line?.approvalStatus == undefined)) {
      str = "Pending Action";
    } else if (!line?.isApprovalRequired && line?.approvalStatus?.toLowerCase().includes('approval')) {
      str = "Approved";
    }
    return str;
  }
}
