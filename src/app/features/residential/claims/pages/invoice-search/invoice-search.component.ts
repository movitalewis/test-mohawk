import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { Router } from "@angular/router";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { Columns, Config, DefaultConfig } from "ngx-easy-table";
import { CommentModalComponent } from "src/app/features/shared/components/comment-modal/comment-modal.component";
import { ClaimsService } from "../../services/claims.service";
import { InvoiceSearchPopupComponent } from "../invoice-search-popup/invoice-search-popup.component";
import { SelectInvoicePopupComponent } from "../select-invoice-popup/select-invoice-popup.component";
import { NgForm } from "@angular/forms";
import { ConfirmationDialogComponent } from "src/app/features/shared/components/confirmation-dialog/confirmation-dialog.component";
import { faMessage, faTimes } from "@fortawesome/free-solid-svg-icons";
import { CLAIM_TYPE_DESC, CLAIM_TYPE_MAP, FREIGHT_RELATED } from "src/app/features/shared/constants/URL-PERMISSIONS-CONSTANTS";
import { LABOR_ELIGIBLE_CLAIMTYPES, CLAIM_PATH_NAMES, CLAIM_TYPES } from "src/app/features/shared/constants/CLAIMS-CONSTANTS";
import { ClaimLineTypeComponent } from "src/app/features/shared/components/claim-line-type/claim-line-type.component";
import { StorageService } from "src/app/features/http-services/storage.service";

@Component({
    selector: "residential-invoice-search",
    templateUrl: "./invoice-search.component.html",
    styleUrls: ["./invoice-search.component.scss"],
    standalone: false
})
export class InvoiceSearchComponent implements OnInit, OnDestroy {
  faTimes: any = faTimes;
  faMessage: any = faMessage;
  selectProductLineSubject: any;
  frightColourChange: boolean = false;
  @Output() commentsChanged = new EventEmitter();  
  @Output() scrollToLaborDetails = new EventEmitter<void>();
  changecolourCondition: boolean = false;
  errorMessage = "";
  markAsTouchedFlag: boolean = false;
  claimTypes = CLAIM_PATH_NAMES;
  claimLineTypeModalClaims = LABOR_ELIGIBLE_CLAIMTYPES;
  constructor(
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    public claimsService: ClaimsService,
    private router: Router,
    private storageService: StorageService
  ) {
    this.selectProductLineSubject =
      this.claimsService.selectedProductLines.subscribe((res: any) => {
        this.replaceCurrency();
      });
  }
  ngOnDestroy(): void {
    if (this.selectProductLineSubject) {
      this.selectProductLineSubject.unsubscribe();
    }
    this.claimsService.expectedUnitPriceQuotedBy = "";
  }
  claimType: any = "";
  @Input() claimColumns: any = [];
  @ViewChild("expectedUnitForm")
  expectedUnitForm!: NgForm;
  @ViewChild("invoiceSelectedLineForm")
  invoiceSelectedLineForm!: NgForm;
  @ViewChild("nonProductlineForm")
  nonProductlineForm!: NgForm;
  @Input() isLaborClaim: boolean = false;
  @Input() claimTypeFromLaborClaim: any = "";
  @Input() existingClaimData: any;
  @Output() removeLineItem = new EventEmitter <any>();

  public configuration!: Config;
  public columns!: Columns[];
  public totalAdjutmentAmount = 0;
  public columnsSecondTable!: Columns[];
  public column1!: Columns[];
  isCollapseArr: boolean[] = [];
  selectedLines: any[] = [];
  invoicesLines: any[] = [];
  disableAddItem: boolean = false;
  showDisputeCaseId = false;
  claimTypeMap:any = CLAIM_TYPE_MAP;
  claimTypeDesc:any = CLAIM_TYPE_DESC;
  freightMap: any = FREIGHT_RELATED;
  showPostedComments = false;
  showSalesComments = false;
  ngOnInit(): void {
    if (!this.isLaborClaim) {
      this.claimType = String(this.router.url.split("/").pop());
    } else {
      this.claimType = this.claimTypeFromLaborClaim;
    }
    this.column1 = [
      { key: "invoiceSeq", title: "Line Number" },
      { key: "component", title: "Type" },
      { key: "styleName", title: "Style #/Desc" },
      { key: "colorName", title: "Color #/Desc" },
      { key: "shipQuantity", title: "Invoice Qty" },
      { key: "claimAmount", title: "Claim Amount" },
    ];
    if (this.claimsService.selectedInvoiceLines?.isFromClaimHistory) {
      this.claimsService.selectedInvoiceLines.line = [
        ...[],
        ...this.claimsService.selectedInvoiceLines.line,
      ];
      this.isCollapseArr = [];
      this.claimsService.selectedInvoiceLines.line.map((item: any) => {
        item.selectedLines.map((ln: any) => {
          if (ln.component == "PRODUCT") {
            let collapse = ln?.isRemovedLine === true ? true : false;
            this.isCollapseArr.push(collapse);
          }
        });
      });
      if (
        this.claimsService.selectedInvoiceLines?.claimData?.claimStatus.toUpperCase() ==
        "DRAFT"
      ) {
        this.columns = [
          ...[],
          ...this.claimColumns,
        ];
      } else {
        this.columns = [...[], ...this.claimColumns];
      }
    } else {
      this.columns = [
        ...[],
        ...this.claimColumns,
      ];
      this.claimsService.selectedInvoiceLines = {};
    }
    this.configuration = { ...DefaultConfig };
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;

    this.disableRow();
    this.checkValidity();
    this.replaceCurrency();
    if (
      (this.claimType == this.claimTypes.FREIGHT &&
      this.claimsService.selectedInvoiceLines.isFromClaimHistory &&
      !this.claimsService.selectedInvoiceLines.nonProductLinesFlag)
    ) {
      this.columns = this.claimsService.selectedInvoiceLines.columns;
    }
    this.showDisputeCaseId =
      this.claimColumns.filter((item: any) => item.key === "disputeCaseId")
        ?.length > 0;
  }
  replaceCurrency() {
    this.claimColumns.map((col: any) => {
      if (col.title.includes("(USD)")) {
        col.title = col.title.replace(
          "USD",
          this.claimsService?.selectedInvoiceLines?.line[0]?.selectedLines[0]
            ?.currency || "USD"
        );
      }
    });
    this.columns = [...[], ...this.claimColumns];
    this.claimsService?.selectedInvoiceLines?.line?.forEach((item:any,ind:any)=>{
      if ((item.selectedLines.filter((it: any) => it.standaloneLine === true || it.component === "LABOR")).length > 0) {
        this.isCollapseArr[ind] = true;
      } else { 
        this.isCollapseArr[ind] = false;
      }
    })
  }
  openModal() {
    const initialState: ModalOptions = {
      initialState: {},
    };
    this.bsModalRef = this.modalService.show(
      InvoiceSearchPopupComponent,
      Object.assign(initialState, {
        id: "InvoiceSearchPopupComponent",
        class: "modal-lg modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }
  removeItem(row: any, rowIndex: any, invoiceLine: any) {
    this.errorMessage =  "";
    if (this.showAllProductLines && row.standaloneLine == undefined) {
      const standaloneLines = this.claimsService.selectedInvoiceLines.line.filter(
        (item: any) => item?.standaloneLine === true && item.selectedLines.length > 0
      );
      if (standaloneLines.length > 0) {
        const productLines = this.claimsService.selectedInvoiceLines.line.filter(
          (item: any) =>
            item.standaloneLine === undefined && item.selectedLines.length > 0
        );
        if (productLines.length === 1) {
          this.errorMessage = "At least one product line needs to be added.";
          return;
        } 
      }
    }
    const initialState: ModalOptions = {
      backdrop: true,
      ignoreBackdropClick: true,
      initialState: {
        title: "Confirmation",
        content: "Are you sure you want to remove this line item?",
        primaryActionLabel: "Yes",
        secondaryActionLabel: "No",
        onPrimaryAction: () => {
          this.claimsService.selectedInvoiceLines.disabledAddItemCTA = false;
          if(row?.component !== "LABOR"){
          this.claimsService.selectedInvoiceLines.isAllLinesAdded = false;
          }
          if (this.claimsService.selectedInvoiceLines.isFromClaimHistory == true && !row?.selected) {
            this.claimsService.selectedInvoiceLines.line?.filter((ln: any, lineIndex: any) => {
              ln.selectedLines = ln?.selectedLines?.filter((item: any, itemIndex: any) => {
                if (
                  row?.component !== "PRODUCT" &&
                  this.showAllProductLines
                ) {
                  return (rowIndex != itemIndex)
                } else {
                  if (row?.invoiceSeq == item?.invoiceSeq && item?.component == "PRODUCT") {
                    this.removeLineItem.emit({ lineIndex: lineIndex, itemIndex: itemIndex, component: row?.component });
                  }
                  return !(
                    row?.invoiceSeq == item?.invoiceSeq
                  );
                }
              });
              this.checkValidity();
            });
          } else {
            row.selected = !row.selected;
            this.claimsService.selectedInvoiceLines.line?.filter((ln: any, lineIndex: number) => {
              ln?.invoices?.filter((inv: any) => { inv.selected = (row?.invoiceSeq == inv?.invoiceSeq) ? !inv.selected : inv.selected; });
              ln.selectedLines = ln?.selectedLines?.filter(
                (item: any, itemIndex: number) => {
                  if (
                    row?.component !== "PRODUCT" &&
                    this.showAllProductLines
                  ) {
                    return (rowIndex != itemIndex)
                  } else {
                    if (
                      row?.invoiceSeq == item?.invoiceSeq &&
                      item?.component == "PRODUCT"
                    ) {
                      this.removeLineItem.emit({
                        lineIndex: lineIndex,
                        itemIndex: itemIndex,
                        component: row?.component
                      });
                    }
                    if (row?.component !== "LABOR") {
                      if (row?.invoiceSeq == item?.invoiceSeq) {
                        item.selected = !item.selected;
                      }
                      return !(row?.invoiceSeq == item?.invoiceSeq);
                    } else {
                      return item.component === "LABOR" ? false : true;
                    }
                  }
                },
              );
              this.checkValidity();
            });
          }
          this.modalService.hide();
          if (row.component === "LABOR") {
            this.claimsService.selectedInvoiceLines.isAllSelected = false;
            // If user is on add-labor-claim flow, redirect to add-labor-claim page
            if (this.router.url.includes('/residential/claims/add-labor-claim?claim=')) {
              this.router.navigateByUrl("residential/claims/details?claim=" + this.existingClaimData.claimNumber);

            } else if (this.router.url.includes('/residential/claims/add-labor-claim')) {
              this.router.navigate(['/residential/claims/createclaim']);
            }
          }
          this.claimsService.selectedProductLines.next(this.claimsService.selectedInvoiceLines.line);
          this.claimsService.formMarkAsDirty.next(true);
        },
        onSecondaryAction: () => {
          this.modalService.hide();
        },
      },
    };
    this.modalService.show(
      ConfirmationDialogComponent,
      Object.assign(initialState, {
        id: "removeLineItemModal",
        class: "modal-md modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }
  addLaborLine(){
    const initialState: ModalOptions = {
      initialState: {
        isLaborClaim: true,
        claimData: this.existingClaimData,
        claimType: this.existingClaimData.claimType,
        selectedInvoiceData: this.claimsService.selectedInvoiceLines?.line[0],
        selectedRecords: [
          ...[],
          ...this.claimsService.selectedInvoiceLines?.line,
        ],
      },
    };
    this.bsModalRef = this.modalService.show(
      SelectInvoicePopupComponent,
      Object.assign(initialState, {
        id: "SelectInvoicePopupComponent",
        class: "modal-xl modal-dialog-centered select-invoice-popup ",
        backdrop: "static",
        keyboard: false,
      })
    );
  }
  
  addItemToClaim() {
    this.checkValidity();
    if (this.claimLineTypeModalClaims.includes(this.claimType)) {
      const initialState: ModalOptions = {
        backdrop: true,
        ignoreBackdropClick: true,
        initialState: {
          isAllSelected:
            this.claimsService.selectedInvoiceLines.isAllSelected ||
            this.claimsService.selectedInvoiceLines.isAllLinesAdded,
          claimsService: this.claimsService,
          onPrimaryAction: (selectedType: any) => {
            if (selectedType === "1") {
              this.selectInvoiceModal();
            } else {
              if (
                this.claimsService.selectedInvoiceLines?.claimData?.claimStatus.toUpperCase() ==
                "IN PROCESS"
              ) {
                this.existingClaimData = JSON.parse(JSON.stringify(this.claimsService.selectedInvoiceLines?.claimData));
                this.checkClaimType(this.existingClaimData);
                this.existingClaimData.claimNumber = this.claimsService.selectedInvoiceLines.claimNumber;
                this.addLaborLine();
              } else {
                const initialState: ModalOptions = {
                  initialState: {
                    addLaborLine: true,
                    selectedInvoiceData:
                      this.claimsService.selectedInvoiceLines?.line[0],
                    selectedRecords: [
                      ...[],
                      ...this.claimsService.selectedInvoiceLines?.line,
                    ],
                  },
                };
                this.bsModalRef = this.modalService.show(
                  SelectInvoicePopupComponent,
                  Object.assign(initialState, {
                    id: "SelectInvoicePopupComponent",
                    class:
                      "modal-xl modal-dialog-centered select-invoice-popup ",
                    backdrop: "static",
                    keyboard: false,
                  }),
                );
              }
            }
          },
        },
      };
      this.bsModalRef = this.modalService.show(
        ClaimLineTypeComponent,
        Object.assign(initialState, {
          id: "claimLineTypeComponent",
          class: "modal-lg modal-dialog-centered",
          backdrop: "static",
          keyboard: false,
        })
      );
    
    } else {
      this.selectInvoiceModal();
    }
  }
  selectInvoiceModal() {
    const initialState: ModalOptions = {
      initialState: {
        selectedInvoiceData: this.claimsService.selectedInvoiceLines?.line[0],
        selectedRecords: [
          ...[],
          ...this.claimsService.selectedInvoiceLines?.line,
        ],
      },
    };
    this.bsModalRef = this.modalService.show(
      SelectInvoicePopupComponent,
      Object.assign(initialState, {
        id: "SelectInvoicePopupComponent",
        class: "modal-xl modal-dialog-centered select-invoice-popup ",
        backdrop: "static",
        keyboard: false,
      })
    );
  }

  expectedUnitPriceChange(e: any, row: any) {
    this.claimsService.formMarkAsDirty.next(true);
    for (let key in row) {
      row[key] = row[key]?.toString().replace("$", "")?.replace(",", "");
    }
    e.preventDefault();
    const pricePerUnit = row.pricePerUnit.replace("$", "");
    row.adjustmentAmount =
    ((row.expectedUnitPrice != "") && row.expectedUnitPrice >= 0)
        ? (
        (Number(pricePerUnit) - Number(row.expectedUnitPrice)) *
          Number(row.shipQtyInPriceUOM || row?.shipQuantity)
        ).toFixed(2)
        : "";
    let arr: any = [];
    this.claimsService.selectedInvoiceLines.line?.map((ln: any) => {
      ln?.selectedLines?.map((inv: any) => {
        if (inv.component == "PRODUCT") {
          arr.push(inv.adjustmentAmount);
        }
      });
    });
    this.claimsService.totalAdjutmentAmount = arr.reduce(
      (a: any, b: any) => Number(a) + Number(b)
    );

    if (row.expectedUnitPrice != null) {
      this.claimsService.expectedUnitPrice = row.expectedUnitPrice;
    } else {
      this.claimsService.expectedUnitPrice = "";
    }
    this.checkValidity();
  }
  keyPressAlphaWithSpace(event: any, elementRef: any) {
    elementRef.classList.remove("errorBorder");
    elementRef.classList.remove("is-invalid");


    var inp = String.fromCharCode(event.keyCode);
    // Allow alpahbets, space
    if (/[a-zA-Z- ]/.test(inp)) {
      return true;
    } else {
      event.preventDefault();
      return false;
    }
  }
  openCommentModal(row: any) {
    const initialState: ModalOptions = {
      initialState: { additionalInfoNotes: row.additionalInfoNotes },
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
    this.bsModalRef.content.comments.subscribe((data: any) => {
      row.additionalInfoNotes = data;
    });
  }
  showAllProductLines: boolean = false;
  showProductLines: boolean = false;
  showNonProductLines: boolean = false;

  disableRow(row?: any) {
    if (this.claimType == this.claimTypes.FREIGHT) {
      this.showNonProductLines = true;
      return (
        row &&
        (row.component == "FREIGHT" ||
          row.component == "FUEL_SURCHARGE" ||
           row?.component == "JOB_SITE_DELIVERY" ||
            row?.component == "LIFT_GATE_CHARGE" ||
            row?.component == "PALLET_JACK_CHARGE"|| 
            row.component == "LABOR" )
      );
    } else if (this.claimType == this.claimTypes.TAX) {
      this.showNonProductLines = true;
      return row && (row.component == "TAX" || row.component == "LABOR");
    } else if (this.claimType == this.claimTypes.CANCELLATION_FEE) {
      this.showNonProductLines = true;
      return row && (row?.component == "CANCELLATION_FEE" || row?.component == "CALIFORNIA_CARE_FEE" ||row.component == "LABOR");
    } else if (
      this.claimType == this.claimTypes.CUSTOMER_SATISFACTION ||
      this.claimType == this.claimTypes.MOHAWK_ORDER_ERROR ||
      this.claimType == this.claimTypes.DEFECTIVE_PRODUCT ||
      this.claimType == this.claimTypes.WRONG_PRODUCT ||
      this.claimType == this.claimTypes.DAMAGED ||
      this.claimType == this.claimTypes.WRONG_QUANTITY_SHORTAGE
    ) {
      this.showAllProductLines = true;
      return (
        row &&
        (row.component == "FREIGHT" ||
          row.component == "TAX" ||
          row.component == "MISC" ||
          row.component == "PRODUCT" ||
          row.component == "LABOR" ||
          row.component == "FUEL_SURCHARGE")
      );
    } else if (
      this.claimType === this.claimTypes.PRICING ||
      this.claimType === this.claimTypes.ACCOMMODATION_RETURN
    ) {
      this.showProductLines = false;
      if (row?.component == "LABOR") {
        this.showAllProductLines = true;
        return true;
      } else {
        this.showProductLines = true;
      }
      return row && row.component == "PRODUCT";
    }
    if(this.showAllProductLines){
      this.checkProductLinesAvailable();
    }
  }
  checkProductLinesAvailable(){
    let missedProductLines:any = [];
    this.claimsService.selectedInvoiceLines.line.selectedLines.forEach((item:any) =>{
      if(item.component !== 'PRODUCT' && this.claimsService.selectedInvoiceLines.line.selectedLines.filter((inv:any) => (inv.component === 'PRODUCT' && inv.invoiceSeq === item.invoiceSeq)).length === 0){
        if(!missedProductLines.includes(item.invoiceSeq)){
          missedProductLines.push(item.invoiceSeq);
        }
      }
    });
    missedProductLines.forEach((product:any)=>{
      this.claimsService.selectedInvoiceLines.line.selectedLines.unshift({component : "PRODUCT", invoiceSeq:product, isRemovedLine:true})
    })
    if(missedProductLines.length > 0){
      this.claimsService.selectedInvoiceLines.line.selectedLines.sort((a:any,b:any)=> a.invoiceSeq - b.invoiceSeq);
      const removedLines = this.claimsService.selectedInvoiceLines.line.selectedLines.filter((item:any) => item.isRemovedLine === true);
      this.claimsService.selectedInvoiceLines.line.selectedLines.forEach((item:any,i:any)=>{
        if(item?.isRemovedLine === true){
          this.isCollapseArr[i] = true;
        }
      })
    }
  }

  checkValidity(fromInputField: boolean = false) {
    this.invoicesLines = [];
    this.selectedLines = [];
    this.claimsService.selectedInvoiceLines.line?.forEach((item: any) => {
      const laborLines = item?.selectedLines.filter((it: any) => it.component === "LABOR");
      if (laborLines.length > 0) {
        this.claimsService.selectedInvoiceLines.hasLaborLine = true;
      }else{
        this.claimsService.selectedInvoiceLines.hasLaborLine = false;
      }
      item?.selectedLines.filter((it: any) => {
        this.selectedLines.push(it);
      });
      item?.invoices?.filter((it: any) => {
        if (this.disableRow(it)) {
          this.invoicesLines.push(it);
        }
      });
    });
    if (!this.claimsService.selectedInvoiceLines.disabledAddItemCTA && !this.claimsService.selectedInvoiceLines.isAllLinesAdded) {
      this.claimsService.selectedInvoiceLines.isAllSelected =
        this.invoicesLines.length == this.selectedLines?.filter((line: any) => line.component != "LABOR").length;
    }
    if (this.selectedLines.length == 0) {
      this.claimsService.selectedInvoiceLines.line = [];
    }
    if (
      this.claimType != this.claimTypes.FREIGHT &&
      this.claimType != "freight-claim" &&
      this.claimType != this.claimTypes.TAX &&
      this.claimType != "tax-billing-error" &&
      this.claimType != this.claimTypes.CANCELLATION_FEE &&
      this.claimType != "cancellation-fees"
    ) {
      let a = this.selectedLines.filter((ln: any) => (ln.component == "PRODUCT"  && ln.isRemovedLine === undefined));
      this.claimsService.invoiceFieldsValid = a.every(
        (f: any) =>
          this.claimType == this.claimTypes.PRICING ? f.expectedUnitPrice >= 0 : f.expectedUnitPrice > 0 || f.claimQuantity > 0 || f.claimAmount > 0
      );
    } else if (
      this.claimType == this.claimTypes.CANCELLATION_FEE ||
      this.claimType == "cancellation-fees"
    ) {
      let a = this.selectedLines.filter((ln: any) => 
        ln.component == "CANCELLATION_FEE" || ln.component == "CALIFORNIA_CARE_FEE");
      this.claimsService.invoiceFieldsValid = a.every(
        (f: any) =>
          this.claimType == this.claimTypes.PRICING ? f.expectedUnitPrice >= 0 : f.expectedUnitPrice > 0 || f.claimQuantity > 0 || f.claimAmount > 0
      );
    } else if (
      this.claimType == this.claimTypes.TAX ||
      this.claimType == "tax-billing-error"
    ) {
      let a = this.selectedLines.filter((ln: any) => ln.component == "TAX");
      this.claimsService.invoiceFieldsValid = a.every(
        (f: any) => f.claimAmount > 0
      );
    } else if (
      this.claimType == this.claimTypes.FREIGHT ||
      this.claimType == "freight-claim"
    ) {
      let a = this.selectedLines.filter(
        (ln: any) =>
          ln.component == "FREIGHT" || ln.component == "FUEL_SURCHARGE"
      );
      this.claimsService.invoiceFieldsValid = a.every(
        (f: any) => f.claimAmount > 0
      );
    } else {
      this.claimsService.invoiceFieldsValid = true;
    }
    this.claimsService.selectedInvoiceLines.line?.filter((ln: any) => {
      if (ln.selectedLines?.length == 0) {
        ln.invoices?.filter((inv: any) => { inv.selected = false; });
      }
    });
    if (fromInputField) {
      this.claimsService.formMarkAsDirty.next(true);
    }
  }
                            
  quantityPaste(event:any, inv:any, maxVal:any, type=""){
    maxVal = maxVal?.toString().replace("$", "")?.replace(",", "");
    const clipboardEvent = event as ClipboardEvent;
    if (clipboardEvent.clipboardData) {
      const pastedData = clipboardEvent.clipboardData.getData("text");
      const pastedNumber:any = Number(pastedData);
      if(pastedData.includes(' ') || Number.isNaN(pastedNumber) || maxVal < pastedNumber ){
        if (type == "pricing") {
          inv.expectedUnitPrice = "";
          this.expectedUnitPriceChange(event, inv);
        } else if (type == "shipQuantity") {
          inv.claimQuantity = "";
        } else {
          inv.claimAmount = "";
        }
        event.currentTarget.value = "";
        clipboardEvent.preventDefault();
      } else {
        if (type == "pricing") {
          inv.expectedUnitPrice = "";
          inv.expectedUnitPrice = pastedNumber;
          this.expectedUnitPriceChange(event, inv);
        } else if (type == "shipQuantity") {
          inv.claimQuantity = "";
          inv.claimQuantity = pastedNumber;
          event.preventDefault();
        } else {
          inv.claimAmount = "";
          inv.claimAmount = pastedNumber;
          event.preventDefault();
        }
      }
    }
  }
  onInputBlur(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let value = inputElement.value;
    if (value.endsWith('.')) {
      value = value.slice(0, -1);
    }
    if (isNaN(Number(value))) {
      value = '';
    }
    inputElement.value = value;
    inputElement.dispatchEvent(new Event('input'));
  }
  
  quantityKey(keyEvent: any, maxVal: any, uom: any, elementRef: any) {
    elementRef.classList.remove("errorBorder");
    elementRef.classList.remove("is-invalid");
    maxVal = maxVal?.toString().replace("$", "")?.replace(",", "");
    if (
      keyEvent.target.value + keyEvent.key == "." 
    ) {
      keyEvent.target.value = 0 + keyEvent.target.value;
      return true;
    }
    if (
      isNaN(keyEvent.target.value + keyEvent.key) ||
      Number(maxVal) == Number(keyEvent.target.value) || keyEvent.key === ' '
    ) {
      return false;
    }
    let str = "";
    if ((uom !== "ZCT" && uom !== "EA") || this.claimType === this.claimTypes.PRICING) {
      if (
        keyEvent.target.selectionStart == null ||
        keyEvent.target.selectionEnd == null
      ) {
        str = keyEvent.target.value + keyEvent.key;
      } else {
        str =
          keyEvent.target.value.slice(0, keyEvent.target.selectionStart) +
          keyEvent.key +
          keyEvent.target.value.slice(
            keyEvent.target.selectionEnd,
            keyEvent.target.value.length
          );
      }
      if (
        str.indexOf(".") &&
        str.slice(str.indexOf("."), str.length).length > 3
      ) {
        return false;
      }
    } else {
      let patt = /^([0-9])$/;
      str = keyEvent.target.value + keyEvent.key;
      if (!patt.test(keyEvent.key) && str.indexOf(".")) {
        return false;
      }
    }
    if (Number(str) > maxVal || str == "00") {
      return false;
    }
    return true;
  }

  lineComment = "";
  selectedInvLine: any;
  openommentModal(template: TemplateRef<any>, inv: any) {
    this.lineComment = inv?.additionalInfoNotes;
    inv.uniqRefId =  Math.random() * 6;
    this.selectedInvLine = inv;
    this.bsModalRef = this.modalService.show(
      template,
      Object.assign(
        {},
        {
          class: "modal-xl modal-dialog-centered",
        }
      )
    );
  }

  onHideModal() {
    this.modalService.hide();
  }

  addComment() {
    if (this.lineComment) {
      this.claimsService.selectedInvoiceLines?.line?.filter((inv: any) => {
        if (inv?.selectedLines.length > 0) {
          inv?.selectedLines.filter((ln: any) => {
            if (
              this.selectedInvLine.component == ln.component &&
              this.selectedInvLine?.invoiceSeq == ln?.invoiceSeq &&
              this.selectedInvLine?.uniqRefId == ln?.uniqRefId && ln?.uniqRefId
            ) {
              ln.additionalInfoNotes = this.lineComment;
              this.commentsChanged.emit(ln);
              this.claimsService.formMarkAsDirty.next(true);
              this.modalService.hide();
              delete ln.uniqRefId;
            }
          });
        }
      });
    }
  }
  exptdFlag: boolean = false;
  validateExptd(e: any) {
    if (
      e.target.value == "0" ||
      e.target.value == "0." ||
      e.target.value == "0.0" ||
      e.target.value == "0.00"
    ) {
      this.exptdFlag = true;
    } else {
      this.exptdFlag = false;
    }
  }

  uploadhereClick() {
    const nativeElement =
      document.querySelectorAll(".custom-scrollbar")[0];
    nativeElement.scrollTo(0, nativeElement.scrollHeight);
    this.onHideModal();
  }
  NonLinesBgValidation(lines: any, inv: any) {
    let value = 0;
    lines?.filter((ln: any) => {
      if (ln.invoiceSeq == inv.invoiceSeq && ln?.component == "PRODUCT") {
        value = ln?.claimQuantity;
      }
    });
    return value > 0;
  }
  hasNonProdLines(standaloneLine: any) {
    return standaloneLine?.filter((line: any) => line.component !== "PRODUCT")?.length > 0;
  }
  
  hasLaborLine(selectedLines: any) {
    return selectedLines.some((line: any) => line.component === 'LABOR');
  }
  scrollToLaborDiv() {
    this.scrollToLaborDetails.emit();
  }
  checkAlreadyAddedLabor(){
    if(this.claimsService.selectedInvoiceLines?.line?.length === 1 && this.claimsService.selectedInvoiceLines?.line[0]?.selectedLines?.filter((line:any) => line.component === 'LABOR').length > 0){
      return true;
    }else{
      return false;
    }
  }
  checkClaimType(claimDetails: any){ 
    const claimType = claimDetails?.claimType.toLowerCase();
    switch (claimType) {
      case "freight billing error":
        this.claimType = this.claimTypes.FREIGHT;
        break;
      case "pricing billing error":
        this.claimType = this.claimTypes.PRICING;
        break;
      case "tax billing error":
        this.claimType = this.claimTypes.TAX;
        break;
      case "accommodation return":
        this.claimType = this.claimTypes.ACCOMMODATION_RETURN;
        break;
      case "assurance warranty claim":
        this.claimType = this.claimTypes.CUSTOMER_SATISFACTION;
        break;
      case "order error claim":
        this.claimType = this.claimTypes.MOHAWK_ORDER_ERROR;
        break;
      case "defective product claim":
        this.claimType = this.claimTypes.DEFECTIVE_PRODUCT;
        break;
      case "wrong product claim":
        this.claimType = this.claimTypes.WRONG_PRODUCT;
        break;
      case "damage claim":
        this.claimType = this.claimTypes.DAMAGED;
        break;
      case "quantity claim":
        this.claimType = this.claimTypes.WRONG_QUANTITY_SHORTAGE;
        break;
      case "cancellation fees":
        this.claimType = this.claimTypes.CANCELLATION_FEE;
        break;
    }
    claimDetails.claimType = this.claimType;
  }
}
