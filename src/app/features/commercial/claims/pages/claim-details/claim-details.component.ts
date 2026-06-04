import {
  Component,
  OnInit,
  OnDestroy,
  TemplateRef,
  ViewChildren,
  QueryList,
  Inject,
} from "@angular/core";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import { Config, Columns, DefaultConfig } from "ngx-easy-table";
import { ClaimsService } from "../../services/claims.service";
import { ActivatedRoute, Router } from "@angular/router";
import { CommentModalComponent } from "src/app/features/shared/components/comment-modal/comment-modal.component";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { StorageService } from "src/app/features/http-services/storage.service";
import { DOCUMENT, Location } from "@angular/common";
import { ConfirmationDialogComponent } from "src/app/features/shared/components/confirmation-dialog/confirmation-dialog.component";
import { faMessage } from "@fortawesome/free-solid-svg-icons";
import { CLAIM_TYPE_DESC, CLAIM_TYPE_MAP, FREIGHT_RELATED } from "src/app/features/shared/constants/URL-PERMISSIONS-CONSTANTS";
import { CreditMemoListService } from "../../../finance/credit-memos/services/credit-memos-list.service";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { jsPDF } from "jspdf";
import  html2canvas  from "html2canvas";
import { ShareViaEmailLightboxComponent } from "../../../products/components/share-via-email-lightbox/share-via-email-lightbox.component";
import { CLAIM_PATH_NAMES, CLAIM_TYPES, LABOR_ELIGIBLE_CLAIMTYPES } from "src/app/features/shared/constants/CLAIMS-CONSTANTS";
import { ClaimComments } from "src/app/features/shared/components/claim-comments/claim-comments";
@Component({
    selector: "app-claim-details",
    templateUrl: "./claim-details.component.html",
    styleUrls: ["./claim-details.component.scss"],
    standalone: false
})
export class ClaimDetailsComponent implements OnInit, OnDestroy {
  faMessage: any = faMessage;
  @ViewChildren("hidden") hidden: QueryList<ClaimDetailsComponent> | undefined;
  isCollapsed = true;
  claimTypes = CLAIM_PATH_NAMES;
  claimDetails: any = [];
  claimNumber: string = "";
  currency = "";
  claimNumberMasked: string = "";
  breadcrumbItems: BreadcrumbItems = [
    {
      name: "Home",
      path: "/commercial",
      active: false,
    },
    {
      name: "Claims History",
      path: "/commercial/claims/history",
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
  claimLineTypeModalClaims = LABOR_ELIGIBLE_CLAIMTYPES;
  constructor(
    private claimsService: ClaimsService,
    private router: ActivatedRoute,
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private storageService: StorageService,
    private route: Router,
    private _location: Location,
    @Inject(DOCUMENT) private document: Document,
    private creditMemoListService: CreditMemoListService,
    private userService: UserService
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
      { key: "additionalInfoNotes", title: "Add / View Comments" },
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
      { key: "approvalPendingWith", title: "Approval Pending With" },
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
      { key: "approvalPendingWith", title: "Approval Pending With" },
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
  claimTypeMap:any = CLAIM_TYPE_MAP;
  claimTypeDesc:any = CLAIM_TYPE_DESC;
  freightMap: any = FREIGHT_RELATED;
  value: any;
  isClaimDraft = false;
  spinnerLoading: boolean = false;
  errorMessage: any;
  showAuthHeader: boolean = false;
  showPendingWithHeader: boolean = false;
  commentFlag: boolean = false;
  errorMessageClaim = "";
  nonProductLinesFlag: boolean = false;
  disputeCaseIdForOpenComments:any;
  getQueryParamFromUrl() {
    this.router.queryParams.subscribe((params) => {
      const claim = params[`claim`];
      this.disputeCaseIdForOpenComments = params[`disputeCaseId`] || params['disputecaseid'];
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
    this.userService.progressShow('claimDetails');
    this.claimsService
      .getClaimsDetails("?claimNumber=" + this.claimNumber, {})
      .subscribe(
        (res) => {
          this.userService.progressHide('claimDetails');
          this.claimsService.selectedInvoiceLines.claimNumber = this.claimNumber;
          this.spinnerLoading = false;
          this.claimDetails = res.body;          
          this.claimDetails.invoice = this.setInvoiceItems(this.claimDetails?.invoice);
          this.processDataForRowspan();
          const currencyFilter = this.claimDetails?.invoice.filter((item:any)=> item?.currency != '');
          this.currency = currencyFilter?.length > 0 ? currencyFilter[0].currency : '';
          this.checkClaimType();
          if(this.showAllProductLines){
            this.checkProductLinesAvailable();
          }
          if (this.claimDetails.claimStatus == "DRAFT") {
            this.claimNumberMasked = this.claimDetails.claimStatus;
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
          this.showPendingWithHeader = false;
          this.showPendingWithHeader = this.claimDetails?.invoice?.some((item: any) => item?.approvalPendingWith != undefined && item?.approvalPendingWith != 'NA' && item?.approvalPendingWith != '');
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
          this.checkClaimType();
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
          };
          if (this.claimDetails?.invoiceNumber) {
            this.getInvoiceDetails(this.claimDetails?.invoiceNumber);
          }
          if(this.disputeCaseIdForOpenComments){
            const line = this.claimDetails?.invoice?.find((inv: any) => inv.disputeCaseId == this.disputeCaseIdForOpenComments);
            if(line){
            this.openInvoiceCommentModal(line)
            }
          }
        },
        (err) => {
          this.userService.progressHide('claimDetails');
          this.spinnerLoading = false;
          this.errorMessageClaim = err.error;
        }
      );
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
      const removedLines = this.claimDetails?.invoice.filter((item:any) => item.isRemovedLine === true);
      this.claimDetails?.invoice.forEach((item:any,i:any)=>{
        if(item?.isRemovedLine === true){
          this.isCollapseArr[i] = true;
        }
      })
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
    if(this.claimDetails?.readOnly === true){
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
        ln[obj] = ln[obj] == "NA" ? "" : ln[obj];
        if (obj == "claimAmount") {
          ln[obj] = ln[obj]?.replace(",", "")?.replace("$", "");
        }
      }
      if (data.findIndex((i: any) => i.invoiceSeq == ln.invoiceSeq) == -1) {
        if (
          ln.component == "PRODUCT" ||
          this.claimType == this.claimTypes.FREIGHT
        ) {
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
            isRemovedLine: ln?.isRemovedLine || undefined
          });
        }
        if (
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
            isRemovedLine: ln?.isRemovedLine || undefined
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
    this.claimsService.selectedInvoiceLines.columns = this.columns.filter((item: any) =>
      item.key != 'creditMemoAmount' &&
      item.key != 'creditMemoNumber' &&
      item.key != 'creditMemoDate' &&
      item.key != 'approvalPendingWith' &&
      item?.key != 'additionalInfoNotes'
    );
    this.claimsService.selectedInvoiceLines.isFromClaimHistory = true;
    this.route.navigateByUrl("/commercial/claims/" + this.claimType);
  }

  goBack() {
    this._location.back();
  }

  bto() {
    this.route.navigate(["commercial/claims/history"]);
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
          this.userService.progressHide()
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
    const claimType = this.claimDetails?.claimType;
    switch (claimType.toLowerCase()) {
      case "freight billing error":
        this.claimType = this.claimTypes.FREIGHT;
        this.showNonProductLines = true;
        break;
      case "pricing billing error":
        this.claimType = this.claimTypes.PRICING;
        this.showProductLines = false;
        const filterData = this.claimDetails.invoice.filter(
          (item: any) => item.component.toUpperCase() === "LABOR"
        );
        filterData.length > 0
          ? (this.showAllProductLines = true)
          : (this.showProductLines = true);
        break;
      case "tax billing error":
        this.claimType = this.claimTypes.TAX;
        this.showNonProductLines = true;
        break;
      case "accommodation return":
        this.claimType = this.claimTypes.ACCOMMODATION_RETURN;
        this.showProductLines = false;
        const filterDataAccomodation = this.claimDetails.invoice.filter(
          (item: any) => item.component.toUpperCase() === "LABOR"
        );
        filterDataAccomodation.length > 0
          ? (this.showAllProductLines = true)
          : (this.showProductLines = true);
        break;
      case "assurance warranty claim":
        this.claimType = this.claimTypes.CUSTOMER_SATISFACTION;
        this.showAllProductLines = true;
        break;
      case "order error claim":
        this.claimType = this.claimTypes.MOHAWK_ORDER_ERROR;
        this.showAllProductLines = true;
        break;
      case "defective product claim":
        this.claimType = this.claimTypes.DEFECTIVE_PRODUCT;
        this.showAllProductLines = true;
        break;
      case "wrong product claim":
        this.claimType = this.claimTypes.WRONG_PRODUCT;
        this.showAllProductLines = true;
        break;
      case "damage claim":
        this.claimType = this.claimTypes.DAMAGED;
        this.showAllProductLines = true;
        break;
      case "quantity claim":
        this.claimType = this.claimTypes.WRONG_QUANTITY_SHORTAGE;
        this.showAllProductLines = true;
        break;
      case "cancellation fees":
        this.claimType = this.claimTypes.CANCELLATION_FEE;
        this.showNonProductLines = true;
        break;
    }
  }
  sourceData: any = "";
  downloadFile(id: any, filename: any) {
    if (id) {
      this.userService.progressShow('fileDownload');
      this.claimsService.downloadFile(id).subscribe((res: any) => {
        const result = res.body;
        let reader = new FileReader();
        reader.onload = (eve)=> {
          const convertedFile: any = eve.target?.result;
          let link = document.createElement("a");
          link.href = convertedFile;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          this.userService.progressHide('fileDownload');
        };
        reader.onerror = () => {
          this.userService.progressHide('fileDownload');
        };
        reader.readAsDataURL(result);
      },
      () => {
        this.userService.progressHide('fileDownload');
      });
    }
  }
  selectedLineNumber = "";
  newComment = "";
  selectedLine: any;
    openInvoiceCommentModal(inv: any) {
      if (inv) {
        this.selectedLine = inv;
      }
      this.selectedLineNumber = inv?.invoiceSeq;
      const initialState: ModalOptions = {
        backdrop: true,
        ignoreBackdropClick: true,
        initialState: {
          selectedLine: this.selectedLine,
          claimsService: this.claimsService,
          claimNumber: this.claimNumber,
          selectedLineNumber: this.selectedLineNumber,
          onPrimaryAction: (selectedType: any) => {
            this.commentFlag = true;
            if(!this.disputeCaseIdForOpenComments){
              this.getClaimsHistory();
            }          },
          onHideAction: (selectedType: any) => {
          if (this.disputeCaseIdForOpenComments) {
            this.route.navigate([], {
              relativeTo: this.router,
              queryParams: {
                disputeCaseId: null,
                disputecaseid: null,
              },
              queryParamsHandling: "merge",
            });
            this.disputeCaseIdForOpenComments = null;
          }
        },
        },
      };
      this.modalRef = this.modalService.show(
        ClaimComments,
        Object.assign(initialState, {
          id: "addInvoiceCommentPopupModal",
          class: "modal-xl modal-dialog-centered",
          backdrop: "static",
          keyboard: false,
        }),
      );
    }

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

  authNumberClick(line: any) {
    this.downloadFile(line.returnAuthFileId, line?.returnAuthFileName);
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
    if (this.claimDetails?.claimType == this.claimTypes.DEFECTIVE_PRODUCT ||
      this.claimDetails?.claimType == CLAIM_TYPES.DEFECTIVE_PRODUCT
    ) {
      value = 3;
    } else if (
      this.claimDetails?.claimType == this.claimTypes.CUSTOMER_SATISFACTION ||
      this.claimDetails?.claimType == CLAIM_TYPES.CUSTOMER_SATISFACTION ||
      this.claimDetails?.claimType == this.claimTypes.MOHAWK_ORDER_ERROR ||
      this.claimDetails?.claimType == CLAIM_TYPES.MOHAWK_ORDER_ERROR ||
      this.claimDetails?.claimType == this.claimTypes.WRONG_PRODUCT ||
      this.claimDetails?.claimType == CLAIM_TYPES.WRONG_PRODUCT ||
      this.claimDetails?.claimType == this.claimTypes.DAMAGED ||
      this.claimDetails?.claimType == CLAIM_TYPES.DAMAGED ||
      this.claimDetails?.claimType == this.claimTypes.PRICING ||
      this.claimDetails?.claimType == CLAIM_TYPES.PRICING ||
      this.claimDetails?.claimType == this.claimTypes.ACCOMMODATION_RETURN ||
      this.claimDetails?.claimType == CLAIM_TYPES.ACCOMMODATION_RETURN
    ) {
      value = 1;
    } else if (this.claimDetails?.claimType == this.claimTypes.WRONG_QUANTITY_SHORTAGE ||
      this.claimDetails?.claimType == CLAIM_TYPES.WRONG_QUANTITY_SHORTAGE) {
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
  creditNumber(line:any){
    this.viewPdf(line);
  }

  viewPdf(selectedListItem: any) {
    if (selectedListItem.hasOwnProperty("source") === false) {
      this.errorMessageClaim = "Invalid source";
      setTimeout(() => {
        this.errorMessageClaim = "";
      }, 4000);
    }
    if (selectedListItem?.source === "S4") {
      this.spinnerLoading = true;
      if (
        !!selectedListItem?.creditMemoPdfFileId &&
        selectedListItem?.creditMemoPdfFileId !== ""
      ) {
        this.creditMemoListService
          .downloadFile(selectedListItem.creditMemoPdfFileId)
          .subscribe(
            (res: any) => {
              this.spinnerLoading = false;
              let fileURL = "";
              if (window?.webkitURL) {
                fileURL = window.webkitURL.createObjectURL(res.body);
              } else {
                fileURL = URL.createObjectURL(res.body);
              }
              let a = document.createElement("a");
              a.href = fileURL;
              const isMobile = window.innerWidth > 1024;
              if (!isMobile) {
                a.download = "Invoice-" + selectedListItem?.invoiceNumber + ".pdf";
              } else {
                a.target = "_blank";
              }
              a.click();
              a.remove();
            },
            () => {
                this.userService.progressHide()
              this.spinnerLoading = false;
            }
          );
      } else {
        this.spinnerLoading = false;
        this.errorMessageClaim = "Unable to find credit memo PDF File ID.";
        setTimeout(() => {
          this.errorMessageClaim = "";
        }, 4000);
      }
    } else if (selectedListItem?.source === "CAMS") {
      this.spinnerLoading = true;
      const inputDate = selectedListItem.invoiceDate;
      const dateParts = inputDate.split("/");
      const year = dateParts[2];
      const month = dateParts[0].padStart(2, "0");
      const day = dateParts[1].padStart(2, "0");
      const convertedDate = `${year}${month}${day}`;
      let payload = {
        customer: selectedListItem?.customerNumber,
        invoice: selectedListItem.invoiceNumber,
        invsdte: convertedDate,
        invedte: convertedDate,
        onddoctype: "INVMH",
        company: "R",
      };
      const reportName = "Invoice_" + payload.invoice + ".pdf";
      this.creditMemoListService.getCreditMemoPdf(payload).subscribe(
        (res) => {
          this.spinnerLoading = false;
          if (res.body.errorCode == "0000") {
            const blob = this.b64toBlob(res?.body?.File, "application/pdf");
            const fileURL = URL.createObjectURL(blob);
            const a = document.createElement("a");
            const isMobile = window.innerWidth > 1024;
            if (!isMobile) {
              a.download = reportName;
              a.href = fileURL;
            } else {
              a.target = "_blank";
              a.href = fileURL;
            }

            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          } else {
            this.errorMessageClaim = res.body.errorMessage;
          }
        },
        (error) => {
            this.userService.progressHide()
          this.spinnerLoading = false;
          this.errorMessageClaim = "Unable to retrieve data";
        }
      );
    }
  }

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
  
  isOnlyNonProductLine(line: any) {
    return !this.claimDetails?.invoice?.filter((item: any)=>line.invoiceSeq == item.invoiceSeq && item?.component !=line?.component && item?.component == 'PRODUCT' && !item?.isRemovedLine).length;
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
  
  addItemToClaim() {
    this.route.navigateByUrl("commercial/claims/add-labor-claim?claim=" + this.claimNumber);
  }
  getInvoiceDetails(invoiceNumber: any) {
    this.claimsService.invoiceDetails(invoiceNumber).subscribe((res: any) => {
      let invoiceLines = (res?.body?.invoicesLines || [])?.flatMap((lines: any) => lines?.invoices || []);
      let claimDetailsLines = (this.claimDetails?.invoice || [])?.filter((line: any) => line?.component != 'LABOR');
      if (this.showAllProductLines || this.showProductLines) {
        invoiceLines = invoiceLines?.filter((line: any) => line?.component == 'PRODUCT');
        claimDetailsLines = claimDetailsLines?.filter((line: any) => line?.component == 'PRODUCT');
      } else if (this.showNonProductLines) {
        invoiceLines = invoiceLines?.filter((line: any) => line?.component != 'PRODUCT');
        claimDetailsLines = claimDetailsLines?.filter((line: any) => line?.component != 'PRODUCT');
      }
      const allLinesAdded = invoiceLines?.length == claimDetailsLines?.length;
      const isLaborLineAdded = (this.claimDetails?.invoice || [])?.filter((line: any) => line?.component == 'LABOR')?.length > 0;

      this.claimsService.selectedInvoiceLines.disabledAddItemCTA = this.claimLineTypeModalClaims.includes(this.claimType) ? (this.claimDetails?.laborLineExists ? isLaborLineAdded : false) : allLinesAdded;
      this.claimsService.selectedInvoiceLines.isAllLinesAdded = allLinesAdded;
    });
  }
}
