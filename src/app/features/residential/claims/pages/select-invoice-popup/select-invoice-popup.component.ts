import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { Config, Columns, DefaultConfig } from "ngx-easy-table";
import { ClaimsService } from "../../services/claims.service";
import { StorageService } from "src/app/features/http-services/storage.service";
import {
  CLAIM_TYPE_DESC,
  CLAIM_TYPE_MAP,
  STANDALONE_NONPROD,
} from "src/app/features/shared/constants/URL-PERMISSIONS-CONSTANTS";
import { ProgressModalComponent } from "src/app/features/shared/components/progress-modal/progress-modal.component";
import { MESSAGE_CONSTANTS } from "src/app/features/shared/constants/MESSAGE-CONSTANTS";
import { UserService } from "src/app/features/shared/user/services/user.service";
import {
  CLAIM_PATH_NAMES,
  CLAIM_TYPES,
  LABOR_ELIGIBLE_CLAIMTYPES,
} from "src/app/features/shared/constants/CLAIMS-CONSTANTS";
import { faBullseye } from "@fortawesome/free-solid-svg-icons";

@Component({
    selector: "app-select-invoice-popup",
    templateUrl: "./select-invoice-popup.component.html",
    styleUrls: ["./select-invoice-popup.component.scss"],
    standalone: false
})
export class SelectInvoicePopupComponent implements OnInit {
  isCollapsed = false;
  isCollapseArr: boolean[] = [];
  public configuration!: Config;
  public columns!: Columns[];
  public columns1!: Columns[];
  public columnsSecondTable!: Columns[];
  public claimType: string = "";
  showSecondTable = false;
  public claimTypes = CLAIM_PATH_NAMES;
  claimTypeMap: any = CLAIM_TYPE_MAP;
  standAloneNonProd: any = STANDALONE_NONPROD;
  claimTypeDesc: any = CLAIM_TYPE_DESC;
  public data: any;
  modalRef?: BsModalRef;
  initialData: any;
  lastUrlSection: string = "";
  globalAllselect: boolean = false;
  selectAll: boolean = false;
  globalDiasbled: boolean = false;
  spinnerLoading: boolean = false;
  nonProdTypes: any[] = [];
  errorMessage = "";
  onCloseAction: Function = () => {};
  onPrimaryAction: Function = () => {};
  constructor(
    public modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private claimsService: ClaimsService,
    private router: Router,
    private storageService: StorageService,
    private userService: UserService
  ) {
    // this.getData();
  }
  selectedRecords: any = [];
  isLaborClaim: boolean = false;
  claimData: any;
  addLaborLine: boolean = false;
  oldSelectedLines: any[] = [];
  laborElgibleClaims = LABOR_ELIGIBLE_CLAIMTYPES;
  onCancel: () => void = () => {};
  getData() {
    // this.spinnerLoading = true;
    this.oldSelectedLines = [];
    this.claimsService.selectedInvoiceLines?.line?.filter((ln: any) => {
      if (ln?.selectedLines?.length > 0) {
        ln.selectedLines?.filter((sl: any) => {
          this.oldSelectedLines.push(sl);
        });
      }
    });
    this.initialData = this.modalService.config.initialState;
    const invoiceData = this.initialData?.selectedInvoiceData;
    this.isLaborClaim = this.initialData?.isLaborClaim || false;
    this.addLaborLine = this.initialData?.addLaborLine || false;
    this.claimData = this.initialData.claimData || null;
    this.selectedRecords = [];
    this.userService.progressShow("invoiceLines");
    this.claimsService.invoiceDetails(invoiceData?.invoiceNumber).subscribe(
      (res: any) => {
        this.spinnerLoading = false;
        this.userService.progressHide("invoiceLines");
        const inovoiceLines = res.body.invoicesLines;
        if (this.isLaborClaim && !this.addLaborLine) {
          inovoiceLines.forEach((invLine: any) => {
            const lineInvoice: any[] = [];
            invLine.invoices.forEach((invoice: any) => {
              this.claimData.invoice.forEach((line: any) => {
                if (
                  invLine.invoiceSeq === line.invoiceSeq &&
                  invoice.component === line.component
                ) {
                  invoice.claimAmount = line?.claimAmount
                    ?.replace("$", "")
                    .replace(",", "");
                  invoice.claimQuantity = line?.claimQuantity;
                  invoice.expectedUnitPrice = line?.expectedUnitPrice
                    ?.replace("$", "")
                    .replace(",", "");
                  lineInvoice.push(invoice);
                }
              });
            });
            invLine.invoices = [...lineInvoice];
          });
        }
        this.data = inovoiceLines;
        this.isCollapseArr = [];
        this.initialData.alreadySelectedLines = [];
        this.initialData.alreadySelectedLaborLine = [];
        this.data?.forEach(
          (item: any) => {
            this.currencyForHeader = `(${item?.currency})`;

            this.isCollapseArr.push(false);
            item?.invoices?.forEach((line: any) => {
              for (let obj in line) {
                if (obj == "claimAmount") {
                  line[obj] = line[obj]?.replace("$", "").replace(",", "");
                }
              }
              line.invoiceSeq = item.invoiceSeq;
              line.disabled = false;
              line.selected = false;
              line.currency = item.currency;
              if (this.initialData.selectedRecords?.length > 0) {
                this.initialData.selectedRecords?.forEach((el: any) => {
                  if (line?.invoiceSeq === el?.invoiceSeq) {
                    el.selectedLines.map((itm: any) => {
                      if (itm?.component == line?.component) {
                        this.initialData.alreadySelectedLines.push(line);
                        line.disabled = (this.isLaborClaim || this.addLaborLine) ? false : true;
                        line.selected = true;
                        if ((this.isLaborClaim || this.addLaborLine) &&
                          el?.selectedLines?.some((l: any) => l.component === "LABOR")) {
                          line.isSelected = true;
                          this.initialData.alreadySelectedLaborLine.push(line);
                        }
                      }
                    });
                  }
                });
              } else {
                line.disabled = false;
                line.selected = false;
              }
            });
          },
          (err: any) => {
            this.spinnerLoading = false;
            this.userService.progressHide("invoiceLines");
          }
        );
        this.invoiceLines = [];
        this.data?.filter((line: any) => {
          line?.invoices?.filter((inv: any) => {
            if (
              this.claimType == this.claimTypes.FREIGHT &&
              (inv?.component == "FREIGHT" ||
                inv?.component == "FUEL_SURCHARGE" ||
                inv?.component == "JOB_SITE_DELIVERY" ||
                inv?.component == "LIFT_GATE_CHARGE" ||
                inv?.component == "PALLET_JACK_CHARGE")
            ) {
              this.invoiceLines.push(inv);
            } else if (
              this.claimType == this.claimTypes.TAX &&
              inv?.component == "TAX"
            ) {
              this.invoiceLines.push(inv);
            } else if (
              this.claimType == this.claimTypes.CANCELLATION_FEE &&
              (inv?.component == "CANCELLATION_FEE" ||
                inv?.component == "CALIFORNIA_CARE_FEE")
            ) {
              this.invoiceLines.push(inv);
            } else if (
              (this.claimType == this.claimTypes.CUSTOMER_SATISFACTION ||
                this.claimType == this.claimTypes.MOHAWK_ORDER_ERROR ||
                this.claimType == this.claimTypes.DEFECTIVE_PRODUCT ||
                this.claimType == this.claimTypes.WRONG_PRODUCT ||
                this.claimType == this.claimTypes.DAMAGED ||
                this.claimType == this.claimTypes.WRONG_QUANTITY_SHORTAGE ||
                this.claimType === this.claimTypes.PRICING ||
                this.claimType === this.claimTypes.ACCOMMODATION_RETURN) &&
              inv?.component == "PRODUCT"
            ) {
              this.invoiceLines.push(inv);
            }
          });
        });
        this.setSelectedRecords();
        if (this.invoiceLines.length === 0) {
          this.globalAllselect = false;
        }
      },
      (err: any) => {
        this.spinnerLoading = false;
        this.userService.progressHide("invoiceLines");
      }
    );
  }
  invoiceLines: any = [];
  selectedLine: any[] = [];
  setSelectedRecords(c?: any) {
    this.selectedLine = [];
    this.selectedRecords = [];
    let invoicesArray: any[] = [];
    let disableArray: any[] = [];
    this.data?.forEach((item: any) => {
      let s = item?.invoices?.filter(
        (line: any) => line.isSelected == true || line.selected === true || line.disabled == true
      );
      s = s?.length > 0 ? s : [];
      if (s.length > 0) {
        s.map((sItem: any): any => {
          sItem.id = `${item?.invoiceNumber}-${item?.invoiceSeq}-${sItem?.component}`;
          sItem.requestedClaimAmount = this.isLaborClaim
            ? sItem.requestedClaimAmount
            : "";
          sItem.expectedUnitPrice = this.isLaborClaim
            ? sItem.expectedUnitPrice
            : "";
          sItem.adjustmentAmount = this.isLaborClaim
            ? sItem.adjustmentAmount
            : "";
          sItem.productPrice = sItem.productPrice ? sItem.productPrice : "";
          sItem.additionalInfoNotes = this.isLaborClaim
            ? sItem.additionalInfoNotes
            : "";
          sItem.claimQuantity = this.isLaborClaim ? sItem.claimQuantity : "";
          sItem.invoiceSeq = item?.invoiceSeq;
          if (sItem?.standaloneLine === true) {
            item.standaloneLine = true;
          }
        });
        const itemExist = this.selectedRecords.findIndex(
          (x: any) => x.invoiceSeq === item?.invoiceSeq
        );
        this.selectedLine.push(s);
      }
      this.selectedRecords.push({ selectedLines: [...[], ...s], ...item });
    });
    this.data?.filter((ln: any) =>
      ln?.invoices?.filter((inv: any) => {
        if (this.disabledCheckbox(inv)) {
          invoicesArray.push(inv);
        }
      })
    );
    this.globalAllselect = invoicesArray.every(
      (r: any) => r.selected || r.disabled
    );
  }
  currencyForHeader = "";
  ngOnInit(): void {
    this.getData();
    this.showSecondTable = false;
    if (!this.isLaborClaim) {
      this.claimType = String(this.router.url.split("/").pop());
    } else {
      this.claimType =
        this.initialData?.claimType || String(this.router.url.split("/").pop());
    }
    this.configuration = { ...DefaultConfig };
    this.configuration.checkboxes = false;
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;
    this.columns = [
      { key: "invoiceSeq", title: "Line Number" },
      { key: "component", title: "Type" },
      { key: "styleName", title: "Style #/Desc" },
      { key: "colorName", title: "Color #/Desc" },
      { key: "dyeLot", title: "Dye Lot" },
      { key: "rollNumber", title: "Roll #" },
      { key: "partNumber", title: "Part #" },
      { key: "shipQuantity", title: "Invoice Qty" },
      { key: "pricePerUnit", title: "Invoice Unit Price" },
      {
        key: "productPrice",
        title: "Invoice Amount",
      },
      {
        key: "subTotal",
        title: "Sub Total",
      },
    ];
    this.columns1 = [
      { key: "invoiceSeq", title: "Line Number" },
      { key: "component", title: "Type" },
      { key: "styleName", title: "Style #/Desc" },
      { key: "colorName", title: "Color #/Desc" },
      { key: "shipQuantity", title: "Invoice Qty" },
    ];
    this.disabledCheckbox();
    for (let t in CLAIM_TYPE_MAP) {
      this.nonProdTypes.push(t);
    }
  }
  addLaborToClaim() {
     this.claimsService.selectedInvoiceLines.hasLaborLine = false;
     let cliamInvoiceLines:any = [];
    if (this.isLaborClaim && !this.addLaborLine) {
      cliamInvoiceLines = [...this.claimsService.selectedInvoiceLines.line];
      this.claimsService.selectedInvoiceLines.line = [];
    }else{
          this.claimsService.selectedInvoiceLines.line.forEach((item: any) => {
      item.selectedLines = item.selectedLines.filter(
        (ln: any) => ln.component !== "LABOR"
      );
    })
    }
    this.selectedRecords.forEach((item: any) => {
      item.selectedLines = item.selectedLines.filter(
        (ln: any) => ln.isSelected === true
      );
      if (
        item.selectedLines.filter(
          (line: any) => line.isSelected === true && line.component === "PRODUCT"
        ).length > 0
      ) {
         this.claimsService.selectedInvoiceLines.hasLaborLine = true;
         let disputeCaseId = "";
         if(cliamInvoiceLines.length > 0){
          const productLine = item.selectedLines.find((line: any) => line.component === "PRODUCT");
          disputeCaseId = cliamInvoiceLines.find((line: any) => line.invoiceSeq === productLine.invoiceSeq && productLine.component === "PRODUCT")?.disputeCaseId;
        productLine.disputeCaseId = disputeCaseId;
        } 
        item.selectedLines.push({
          component: "LABOR",
          invoiceSeq: item.selectedLines[0].invoiceSeq,
          isForLaborClaim: true,
          isRemovedLine: true,
          selected: true,
          // disputeCaseId: disputeCaseId
        });
      }
    });
    if (this.claimsService.selectedInvoiceLines?.line?.length > 0) {
      let filteredSelectedRecords = this.selectedRecords.filter((item: any) => item.selectedLines?.length > 0);
      const isNewLine = this.claimsService.selectedInvoiceLines?.line?.some((item: any) => (item.invoiceSeq == filteredSelectedRecords[0]?.invoiceSeq));
      if (!isNewLine) {
        this.claimsService.selectedInvoiceLines.line.push(filteredSelectedRecords[0]);
      } else {
        this.claimsService.selectedInvoiceLines?.line?.forEach((item: any) => {
          item.selectedLines = item.selectedLines.filter(
            (ln: any) => ln.component !== "LABOR"
          );
          if (filteredSelectedRecords[0]?.invoiceSeq == item.invoiceSeq) {
            item.selectedLines = filteredSelectedRecords[0]?.selectedLines;
            // item.selectedLines.push({
            //   component: "LABOR",
            //   invoiceSeq: item.selectedLines[0].invoiceSeq,
            //   isForLaborClaim: true,
            //   isRemovedLine: true,
            //   selected: true,
            // });
          }
        });
      }
    }
    this.addToClaim();
  }
  addToClaim() {
    this.claimsService.selectedInvoiceLines.invoiceTotal =
      this.initialData.selectedInvoiceData.invoiceTotal;
    this.claimsService.selectedInvoiceLines.invoiceNumber =
      this.initialData.selectedInvoiceData.invoiceNumber;
    this.claimsService.selectedInvoiceLines.invoiceDate =
      this.initialData.selectedInvoiceData.invoiceDate;
    this.claimsService.selectedInvoiceLines.businessArea =
      this.data[0].businessArea;
    this.claimsService.selectedInvoiceLines.salesOrg =
      this.data[0].erpCompanyCode;
    this.claimsService.selectedInvoiceLines.orderNumber =
      this.initialData.selectedInvoiceData?.orderNumber;
    this.selectedRecords.map((item: any) => {
      item.invoiceTotal = item.invoiceSubTotal;
      item.invoiceDate = item.invoiceDate?.includes("/")
        ? item.invoiceDate?.split("/").pop()
        : "";
    });
    if ((this.isLaborClaim || this.addLaborLine)) {
      if (this.claimsService.selectedInvoiceLines.line?.length > 0) {
        this.claimsService.selectedInvoiceLines.line = [
          ...[],
          ...this.claimsService.selectedInvoiceLines.line,
        ];
      } else {
        this.selectedRecords?.forEach((ln: any) => {
          this.claimsService.selectedInvoiceLines.line?.forEach((sln: any) => {
            if (ln.invoiceSeq === sln.invoiceSeq && sln.selectedLines?.length > 0) {
              ln.selectedLines = [...sln.selectedLines];
            }
          });
        });
        this.claimsService.selectedInvoiceLines.line = [
          ...[],
          ...this.selectedRecords,
        ];
      }
    } else {
      let laborLine:any; 
      for(let a=0; a < this.claimsService.selectedInvoiceLines.line?.length; a++){
        laborLine = this.claimsService.selectedInvoiceLines.line[a].selectedLines.find(
          (ln: any) => ln.component === "LABOR"
        );
        if(laborLine){
          break;
        }
      }
      
      if(laborLine){
        this.selectedRecords.forEach((ln:any) => {
          if(ln.invoiceSeq === laborLine.invoiceSeq){
            ln.selectedLines.push(laborLine);
          }
        });
      }
      this.claimsService.selectedInvoiceLines.line = [
        ...[],
        ...this.selectedRecords,
      ];
    }
    this.claimsService.selectedInvoiceLines.line?.filter((ln: any) => {
      ln.selectedLines?.filter((itm: any) => {
        itm = this.setInvoiceLineValues(itm);
      });
    });
    this.claimsService.selectedProductLines.next(
      this.claimsService.selectedInvoiceLines.line
    );
    this.modalService.hide();
    this.claimsService.selectedInvoiceLines.isAllSelected =
      this.globalAllselect;
    this.claimsService.invoiceFieldsValid = false;
    this.claimsService.totalAdjutmentAmount = 0;
    this.claimsService.formMarkAsDirty.next(true);
  }

  selectLineInvoices(e: any, line: any) {
    if (this.isLaborClaim || this.addLaborLine) {
      this.data.forEach((ln: any) => {
        ln?.invoices.forEach((inv: any) => {
          inv.isSelected = false;
          inv.selected = false;
        });
      });
      this.initialData.currentSelectedLine = line;
    }
    this.data.filter((ln: any) => {
      if (ln.invoiceSeq == line.invoiceSeq) {
        ln?.invoices.filter((inv: any) => {
          if (this.isLaborClaim || this.addLaborLine) {
            inv.isSelected = e.target.checked;
            inv.selected = e.target.checked;
          } else {
            inv.selected = e.target.checked;
          }
        });
      } else {
        let selectedStandalone = ln?.invoices?.filter(
          (inv: any) => (inv.selected === true && inv?.standaloneLine === true) || (inv.isSelected === true && inv?.standaloneLine === true)
        );
        if (selectedStandalone.length > 0) {
          ln?.invoices?.filter((inv: any) => {
          if (this.isLaborClaim || this.addLaborLine) {
            inv.isSelected = true;
            inv.selected = true;
          } else {
            inv.selected = true;
          }
          });
        }
      }
    });
    this.setSelectedRecords("allLines");
  }

  globalSelect(e: any, c: any) {
    this.data?.filter((ln: any) => {
      ln?.invoices?.forEach((inv: any) => {
        if (this.disabledCheckbox(inv)) {
          if (!inv.disabled) {
            inv.selected = e.target.checked;
          }
        }
      });
    });
    this.setSelectedRecords(c);
  }

  disabledGlobalCheckbox: boolean = false;
  showAllProductLines: boolean = false;
  showProductLines: boolean = false;
  showNonProductLines: boolean = false;
  disabledCheckbox(row?: any) {
    if (this.claimType == this.claimTypes.FREIGHT) {
      this.showNonProductLines = true;
      return (
        row &&
        (row?.component == "FREIGHT" ||
          row?.component == "FUEL_SURCHARGE" ||
          row?.component == "JOB_SITE_DELIVERY" ||
          row?.component == "LIFT_GATE_CHARGE" ||
          row?.component == "PALLET_JACK_CHARGE")
      );
    } else if (this.claimType == this.claimTypes.TAX) {
      this.showNonProductLines = true;
      return row && row?.component == "TAX";
    } else if (this.claimType == this.claimTypes.CANCELLATION_FEE) {
      this.showNonProductLines = true;
      return (
        row &&
        (row?.component == "CANCELLATION_FEE" ||
          row?.component == "CALIFORNIA_CARE_FEE")
      );
    } else if (
      this.claimType == this.claimTypes.CUSTOMER_SATISFACTION ||
      this.claimType == this.claimTypes.MOHAWK_ORDER_ERROR ||
      this.claimType == this.claimTypes.DEFECTIVE_PRODUCT ||
      this.claimType == this.claimTypes.WRONG_PRODUCT ||
      this.claimType == this.claimTypes.DAMAGED ||
      this.claimType == this.claimTypes.WRONG_QUANTITY_SHORTAGE
    ) {
      this.showAllProductLines = true;
      this.checkProductLinesAvailable();
      return (
        row &&
        (this.nonProdTypes.some((type: any) => type == row?.component) ||
          row?.component == "PRODUCT")
      );
    } else if (
      this.claimType === this.claimTypes.PRICING ||
      this.claimType === this.claimTypes.ACCOMMODATION_RETURN
    ) {
      this.showProductLines = true;
      return row && row?.component == "PRODUCT";
    }
    if (this.showAllProductLines) {
      this.checkProductLinesAvailable();
    }
  }
  checkProductLinesAvailable() {
    let missedProductLines: any = [];
    this.data?.forEach((item: any, ind: any) => {
      if (
        item?.component !== "PRODUCT" &&
        item?.invoices?.filter(
          (inv: any) =>
            inv.component === "PRODUCT" && inv.invoiceSeq === item.invoiceSeq
        ).length === 0
      ) {
        if (!missedProductLines.includes(item.invoiceSeq)) {
          item.invoices.unshift({
            component: "PRODUCT",
            invoiceSeq: item.invoiceSeq,
            isRemovedLine: true,
            standaloneLine: true,
          });
          item?.invoices?.forEach((it: any, i: any) => {
            it.invoiceSeq = item.invoiceSeq;
            if (it?.isRemovedLine === true) {
              this.isCollapseArr[ind] = true;
            } else {
              it.isRemovedLine = true;
              it.standaloneLine = true;
            }
          });
        }
      }
    });
  }

  selectRecord(i: any, type: any) {
    if (type == "nonProductLine" || type == "productLine") {
      this.data?.forEach((item: any) => {
        let s = item?.invoices?.filter((line: any) => {
          if (
            line.invoiceSeq == i.invoiceSeq &&
            line.component == i.component
          ) {
            line.selected = !line.selected;
            this.setSelectedRecords("");
          }
        });
      });
    } else if (type == "allProducts") {
      this.data.forEach((ln: any) => {
        if (ln.invoiceSeq == i.invoiceSeq) {
          ln?.invoices.filter((inv: any) => {
            inv.selected = inv.selected ? false : true;
            this.setSelectedRecords("");
          });
        }
      });
    }
  }
  nonProductlength(data: any, ln: any) {
    if (ln?.component == "PRODUCT") {
      let a = data?.invoices?.filter(
        (it: any) => it.invoiceSeq == ln.invoiceSeq && it.component != "PRODUCT"
      );
      return a.length;
    }
  }
  checkStandaloneWithProduct() {
    this.errorMessage = "";
    if (this.showAllProductLines) {
      const standaloneLines = this.selectedRecords?.filter(
        (item: any) =>
          item?.standaloneLine === true && item.selectedLines.length > 0
      );
      if (standaloneLines.length > 0) {
        const productLines = this.selectedRecords?.filter(
          (item: any) =>
            item.standaloneLine === undefined && item.selectedLines.length > 0
        );
        if (productLines.length === 0) {
          this.errorMessage = "At least one product line needs to be added.";
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  checkLineAlreadySelected() {
    if (this.isLaborClaim || this.addLaborLine) {
      if (this.initialData?.alreadySelectedLaborLine?.length > 0 && this.initialData?.currentSelectedLine?.invoiceSeq) {
        const alreadySelectedLaborLine = this.initialData.alreadySelectedLaborLine[0].invoiceSeq;
        const currentSelectedLine = this.initialData?.currentSelectedLine?.invoiceSeq;
        if (alreadySelectedLaborLine === currentSelectedLine) {
          return true;
        } else {
          return false;
        }
      } else {
        return this.initialData?.alreadySelectedLaborLine?.length > 0 ? true : false;
      }
    } else {
      if (this.initialData?.alreadySelectedLines?.length > 0 && this.initialData?.currentSelectedLine?.invoiceSeq) {
        const alreadySelectedLines = this.initialData.alreadySelectedLines[0].invoiceSeq;
        const currentSelectedLine = this.initialData?.currentSelectedLine?.invoiceSeq;
        if (alreadySelectedLines === currentSelectedLine) {
          return true;
        } else {
          return false;
        }
      } else {
        return this.initialData?.alreadySelectedLines?.length > 0 ? true : false;
      }
    }
  }
  onHideModal() {
    this.modalService.hide("SelectInvoicePopupComponent");
    this.onCancel();
  }
  setInvoiceLineValues(line: any) {
    this.oldSelectedLines.forEach((ln: any) => {
      if (line.component === ln?.component && line.invoiceSeq === ln?.invoiceSeq) {
        line.requestedClaimAmount = ln?.requestedClaimAmount;
        line.claimQuantity = ln?.claimQuantity;
        line.expectedUnitPrice = ln?.expectedUnitPrice;
        line.adjustmentAmount = ln?.adjustmentAmount;
        line.additionalInfoNotes = ln?.additionalInfoNotes;
        line.productPrice = ln?.productPrice ? ln.productPrice : "";
        line.affectedQuantity = ln?.affectedQuantity;
        line.expectedQuantity = ln?.expectedQuantity;
        line.receivedQuantity = ln?.receivedQuantity;
        line.amountProductAffected = ln?.amountProductAffected;
      }
    });
    return line;
  }
}
