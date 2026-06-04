import { DatePipe } from "@angular/common";
import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { Router } from "@angular/router";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { Config, Columns, DefaultConfig } from "ngx-easy-table";
import { ApiService } from "src/app/features/http-services/api.service";
import { StorageService } from "src/app/features/http-services/storage.service";
import { ErrorModalComponent } from "src/app/features/shared/components/error-modal/error-modal.component";
import { XchangeAddAccessoriesLightboxComponent } from "src/app/features/shared/components/xchange-add-accessories-lightbox/xchange-add-accessories-lightbox.component";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { ProductService } from "../../../products/pages/services/product.service";
import { QuotesService } from "../../services/quotes.service";

@Component({
    selector: "commercial-add-companion-products",
    templateUrl: "./add-companion-products.component.html",
    styleUrls: ["./add-companion-products.component.scss"],
    standalone: false
})
export class AddCompanionProductsComponent implements OnInit, AfterViewChecked {
  alertData: any = {
    message: "success",
  };
  alertType: any = "success";
  alertTrigger: any = false;
  modalRef?: BsModalRef;
  disableAddCart = false;
  @Input() pdpdata: any;
  @Input() openFromaddressModal = false;
  @Input() quantityChangeModal = false;
  @Input() showContinue = false;
  // @ViewChild("toggleLengthTemplate", { static: true })
  // toggleLengthTemplate!: TemplateRef<any>;
  aptCheckEntrie: any = [];
  productNumber: string;
  addtoCartErrorMessage: any = [];
  oneTimeShippingFlag: boolean = false;
  oneTimeShipTo: boolean = false;
  atpUserUom: any = "";
  atpUserQty: any = "";
  backorderSolutions: any = [];
  availableSolutions: any = [];
  isLoading = false;
  userSelectedQty: any;
  userSelectedUOM: any;
  selectedColor: any;
  shippingOptions:any = {};
  selectedSolution: any;
  cartDataForShippingInfo:any;
  backOrderedSolutions = false;
  columns: Columns[] = [];
  columnsPad: Columns[] = [];
  columnsHSCarpetTile:Columns[]=[];
  bkcolumnsHSCarpetTile:Columns[]=[];
  bkcolumnsPad: Columns[] = [];
  bkcolumnsHS: Columns[] = [];
  bkcolumnsRoll: Columns[] = [];
  columnsHS: Columns[]=[];
  toggleLengthColumn: boolean = false;
  bkcolumns: Columns[] = [
    { key: "action", title: "" },
    // { key: "type", title: "Type" },
    { key: "lengthLF", title: "Length(LF)" },
    { key: "Length", title: "Length(SqYd)" },
    { key: "minsize", title: "Min. Size" },
    { key: "maxsize", title: "Max. Size" },
    { key: "estimatedProdDate", title: "Estimated Production Date" },
  ];
  requestedOrderQuantityLabel: any = "";
  config: Config = {
    ...DefaultConfig,
    // checkboxes: true,
    tableLayout: {
      ...DefaultConfig.tableLayout,
      hover: false,
      striped: false,
    },
    paginationEnabled: false,
    paginationRangeEnabled: false,
  };
  balance: number = 0;
  shippingMethod: string | undefined;
  quoteCode!: number;
  entryIndex!: number;
  solutions: any;
  shipTo: string | undefined;
  entry: any;
  spinnerLoading = false;
  isCompleteCart: boolean = false;

  payload:
    | {
        entryNumber: any;
        reserveSkipped: boolean;
        targetLength: any;
        minLengthFT: number;
        minLengthIN: number;
        maxLengthFT: number;
        maxLengthIN: number;
      }
    | any;
  requestedUom: any;
  showReserveData: string = "";

  constructor(
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    public storageService: StorageService,
    public productService: ProductService,
    private userService: UserService,
    private router: Router,
    private apiService: ApiService,
    private datePipe: DatePipe,
    private quoteService: QuotesService
  ) {
    router.events.subscribe((url: any) => {});
    var n = router.url.lastIndexOf("/");
    this.productNumber = router.url.substring(n + 1);
  }
  ngAfterViewChecked(): void {
    // this.data[0].length = this.pdpdata?.quantity;
  }
  public addtoCartFailed: boolean = false;
  public configuration!: Config;
  //public columns!: Columns[];
  public data = [
    {
      length: "1.00",
      sqyd: "1.33",
      dyelot: "A43467",
      roll: "47763882",
      warehouse: "Mill Distribution, Dalton, GA",
      type: "CUT",
      edt: "Tuesday, 09/09/2022",
    },
  ];
  pdpDataOptions: any;
  shippingAddress: any;
  sizeBackingData: any;
  atpCheckData: any;

  cartData: any;
  feetYardFormData: any;
  multicutIndicator: boolean = false;
  viewInventory: boolean = false;
  uid: any;
  shippingAddressId: any;
  product: any;
  solutionsAreFromReserves = false;
  hadReserves = false;
  solutionType: any;
  columnsRoll: Columns[] = [];
  savingLabel: boolean = false;
  backorderSolutionData: any = [];
  availableSolutionData: any = [];
  isSalesPerson:boolean = false;
  isCustomer:boolean = false;
  originalDefaultShippingMethod:any;
  solutionsResponseData:any;
  userInfo:any;

  ngOnInit(): void {
    const data: any = this.modalService.config.initialState;

    this.product = data.entry.product;
    this.oneTimeShipTo = data?.oneTimeShippingAddress || data?.oneTimeShippingFlag || false;
    this.shippingAddress = data.shippingAddress;
    this.shippingMethod = data.shippingMethod;
    this.entryIndex = data.entryIndex;
    this.quoteCode = data.quoteCode;
    this.shipTo = data.shipTo;
    this.entry = data.entry;
    this.isCompleteCart = data?.isCompleteCart || false;
    this.shippingOptions = data?.shippingOptions || {};
    this.requestedUom = data.entry.userRequestedUOM;
    this.solutionType = data.entry.checkUom;
    this.originalDefaultShippingMethod = data?.originalDefaultShippingMethod;
    


    const maxlength = data.entry?.maxLengthFT;
    const parts = maxlength?.toString().split(".");
    const maxlengthinfeet = parseInt(parts[0]); //172 //172.5
    const maxlengthinInch = parseInt(parts[1]) || "";

    const minLength = data.entry?.minLengthFT;
    const partMin = maxlength?.toString().split(".");
    const minLengthinfeet = parseInt(parts[0]);
    const minLengthinInch = parseInt(parts[1]) || "";
    this.payload = {
      entryNumber: data.entry?.entryNumber,
      reserveSkipped: false,
      targetLength: data.entry?.feet,
      minLengthFT: Math.floor(data.entry?.minLengthFT),
      minLengthIN: minLengthinInch,
      maxLengthFT: Math.floor(data.entry?.maxLengthFT),
      maxLengthIN: maxlengthinInch,
      specificDyelot: data.entry?.requestedDyelot
    };
    this.storageService.getItem("userInfo").subscribe((res) => {
      this.isCustomer = res?.isCustomer ? true:false;
      this.isSalesPerson = res?.isSalesPerson || res?.isSalesOps ? true:false;
      this.userInfo = res;
    });
    if (this.shippingMethod === "") this.shippingMethod = "N/A";
    this.getSolutions(false);
  }

  getSolutions(skipReserve: boolean) {
    // this.isLoading = true;
    if (skipReserve) {
      this.payload.reserveSkipped = true;
    }
    this.productService.progressShow('fetchingSolutions');
    this.quoteService
      .getQuoteSolutions(
        this.payload,
        this.quoteCode,
        this.entryIndex,
        skipReserve,
        false,
        false,
        true
      )
      .subscribe(
        (res) => {
          this.isLoading = false;
          this.productService.progressHide();
          if (!!res.body.messages) {
            if (res.body.messages[0].status === "Success") {
              this.solutionAdded();
              return;
            }
            if (res.body.messages[0].status === "00001") {
              this.alertData = {
                message: res.body.messages[0].message,
              };
              this.alertType = "danger";
              this.alertTrigger = true;
            }
          } else if(res?.body?.error == true){
            this.alertData = {
              message: res?.body?.message,
            };
            this.alertType = "danger";
            this.alertTrigger = true;
          }

          this.solutionsAreFromReserves = res.body.solutionFromReserve;
          this.solutionsResponseData = res?.body;
          this.solutionsResponseData.productCode = this.product?.code;
          this.storageService.setItem("solutionsQuoteData", res?.body);
          this.backOrderedSolutions =
            (res.body.solution && res.body.solution[0].backOrder) || false;

            this.columns = [
              { key: "action", title: "" },
              { key: "type", title: "Type" },
              { key: "lengthLF", title: "Length(LF)" },
              {
                key: "rollAssignedInSY",
                title: "Length(SqYd)",
              },
              { key: "dyeLot", title: "Dye Lot" },
              { key: "rollID", title: "Roll # " },
              { key: "plant", title: "Plant" },
              { key: "estimatedDeliveryDate", title: "Estimated Availability Date" },
            ];
            this.columnsRoll = [
              { key: "action", title: "" },
              { key: "type", title: "Type" },
              { key: "lengthLF", title: "Length(LF)" },
              { key: "dyeLot", title: "Dye Lot" },
              { key: "rollID", title: "Roll # " },
              { key: "plant", title: "Plant" },
              { key: "estimatedDeliveryDate", title: "Estimated Availability Date" },
            ];
            this.bkcolumns = [
              { key: "action", title: "" },
              { key: "type", title: "Type" },
              { key: "lengthLF", title: "Length(LF)" },
              {
                key: "rollAssignedInSF",
                title: "Length(SqYd)",
            
              },
              { key: "estimatedProdDate", title: "Estimated Availability Date" },
            ];
            this.columnsPad = [
              { key: "action", title: "" },
              { key: "type", title: "Type" },
              { key: "lengthLF", title: "Length(SqYd)" },
              { key: "dyeLot", title: "Dye Lot" },
              { key: "rollID", title: "Roll # " },
              { key: "plant", title: "Plant" },
              // { key: "savings", title: "Savings" },
              { key: "estimatedDeliveryDate", title: "Estimated Availability Date" },
            ];
            this.bkcolumnsPad = [
              { key: "action", title: "" },
              { key: "type", title: "Type" },
              {
                key: "rollAssignedInSF",
                title: "Length(SqYd)",
              },
              { key: "estimatedProdDate", title: "Estimated Availability Date" },
            ];
            this.bkcolumnsRoll = [
              { key: "action", title: "" },
              { key: "type", title: "Type" },
              { key: "orderQty", title: "Order Qty" },
              { key: "minsize", title: "Min. Size" },
              { key: "maxsize", title: "Max. Size" },
              { key: "estimatedProdDate", title: "Estimated Availability Date" },
            ];
        
            this.columnsHSCarpetTile = [
              { key: "action", title: "" },
              { key: "quantity", title: "Quantity" },
              { key: "rollAssignedInSY", title: "Sq. Yd." },
              { key: "dyeLot", title: "Dye Lot" },
              { key: "plant", title: "Plant" },
              { key: "estimatedDeliveryDate", title: "Estimated Availability Date" },
            ];
            this.bkcolumnsHSCarpetTile = [
              { key: "action", title: "" },
              { key: "type", title: "Type" },
              { key: "quantity", title: "Quantity" },
              { key: "rollAssignedInSY", title: "Sq. Yd." },
              { key: "estimatedProdDate", title: "Estimated Availability Date" },
            ];
            this.bkcolumnsHS = [
              { key: "action", title: "" },
              { key: "type", title: "Type" },
              { key: "quantity", title: "Quantity" },
              { key: "rollAssignedInSF", title: "Sq. Ft." },
              { key: "estimatedProdDate", title: "Estimated Availability Date" },
            ];
        
            this.columnsHS = [
              { key: "action", title: "" },
              { key: "quantity", title: "Quantity" },
              { key: "rollAssignedInSF", title: "Sq. Ft." },
              { key: "dyeLot", title: "Dye Lot" },
              { key: "plant", title: "Plant" },
              { key: "estimatedDeliveryDate", title: "Estimated Availability Date" },
            ];

          if (
            this.solutionsAreFromReserves &&
            ((this.entry?.product?.productType === "SoftSurface" &&
              this.entry?.product?.subProductType === "CARPET_TILE") ||
              this.entry?.product?.productType === "HardSurface" ||
              (this.entry?.product?.productType === "Accessories" &&
                this.entry?.product?.subProductType != "PAD_CUSHION"))
          ) {
            this.columns.splice(1, 3, {
              key: "assignedQuantity",
              title: "Order QTY",
            });
            this.columns = [
              { key: "action", title: "" },
              { key: "quantity", title: "Order QTY" },
              { key: "assignedQuantity", title: "Assigned QTY" },
              { key: "dyeLot", title: "Dye Lot" },
              { key: "plant", title: "Plant" },
            ];
            this.showReserveData = "HardSurface";
          }
          
          const [backorderSolutions, availableSolutions] = (
            res?.body?.solution || []
          ).reduce(
            (acc: any, item: any) => {
              acc[item.backOrder === true ? 0 : 1].push(item);
              return acc;
            },
            [[], []]
          );

          this.availableSolutions = res.body.solution || [];

          this.backorderSolutionData = backorderSolutions.reduce(
            (acc: any, item: any) => {
              const index = acc.findIndex(
                (entry: any) => entry.solutionID === item.solutionID
              );
              if (index > -1) {
                acc[index].solutionEntries.push(item);
              } else {
                acc.push({
                  solutionID: item.solutionID,
                  solutionEntries: [item],
                });
              }
              return acc;
            },
            []
          );

          this.availableSolutionData = availableSolutions.reduce(
            (acc: any, item: any) => {
              const index = acc.findIndex(
                (entry: any) => entry.solutionID === item.solutionID
              );

              if (index > -1) {
                this.savingLabel =
                  this.savingLabel == true
                    ? this.savingLabel
                    : item?.saving === "0.00"
                    ? false
                    : true;
                acc[index].solutionEntries.push(item);
              } else {
                this.savingLabel =
                  this.savingLabel == true
                    ? this.savingLabel
                    : item?.saving === "0.00"
                    ? false
                    : true;
                acc.push({
                  solutionID: item.solutionID,
                  solutionEntries: [item],
                });
              }

              return acc;
            },
            []
          );

        },
        (err: any) => {
          this.productService.progressHide();
          this.isLoading = false;
        }
      );
  }
  requestedUOMproductType: string = "";
  skipReserves() {
    this.hadReserves = true;
    this.getSolutions(true);
  }
  groupByCreatedAt(data: any, key: any) {
    return data.reduce(function (x: any, y: any) {
      (x[y[key]] = x[y[key]] || []).push(y);
      return x;
    }, {});
  }
  backButtonClicked() {
    if (!this.hadReserves) {
      this.removeATPEntry();
      this.bsModalRef.hide();
      return;
    }
    this.getSolutions(false);
    this.hadReserves = false;
    this.selectedSolution = undefined;
  }
  async addToQuote() {
    /* let solutionSelected = this.availableSolutions.filter(
      (solution: any) =>
        solution.solutionID === this.selectedSolution.solutionID
    )[0]; */

    let solutions = this.selectedSolution?.solutionEntries;
    let payload = {};
    if (this.solutionsAreFromReserves) {
      payload = { reserveNumber: this.selectedSolution.solutionID };
    } else {
      payload = {
        shipToUnit: this.shipTo,
        oneTimeShippingAddress: this.oneTimeShipTo,
        oneTimeShipTo: this.oneTimeShipTo,
        shippingCondition: this.isCustomer || this.isSalesPerson ? this.shippingAddress?.originalDefaultShippingMethod ||  this.originalDefaultShippingMethod || this.shippingAddress?.shippingCondition ||
        this.shippingAddress?.shippingMethod ||
        this.shippingAddress?.defaultShippingMethod ||
        this.shippingAddress?.defaultShippingCondition ||'' :
          this.shippingAddress?.shippingCondition ||
          this.shippingAddress?.shippingMethod ||
          this.shippingAddress?.defaultShippingMethod ||
          this.shippingAddress?.defaultShippingCondition ||
          "",
        shipVia:
          this.shippingAddress?.shipVia || this.shippingAddress?.defaultShipVia,
        shippingWarehouse:
          this.shippingAddress?.shippingWarehouse ||
          this.shippingAddress?.defaultShippingWarehouse ||
          this.shippingAddress?.defaultShippingWarehouseDesc ||
          "",
        incoTerms:
          this.shippingAddress?.incoTerms ||
          this.shippingAddress?.defaultIncoTerms ||
          "",
        requestedDeliveryDate: this.shippingAddress?.rdd
          ? this.datePipe.transform(this.shippingAddress?.rdd, "MM/dd/yyyy")
          : this.shippingAddress?.requestedDeliveryDate
          ? this.datePipe.transform(
              this.shippingAddress?.requestedDeliveryDate,
              "MM/dd/yyyy"
            )
          : "",
        item: [
          {
            feet: solutions[0].requestedUOM ==='Linear FT' ? solutions[0].requestedQty.toString().split(".")[0]:"",
            inches: solutions[0].requestedUOM ==='Linear FT' ? solutions[0].requestedQty.toString().split(".")[1]:"",
            dyeLot: this.entry.requestedDyelot,
            sameDyeLot:this.entry.sameDyeLot,
            productCode: this.product.code,
            requestedQty: this.entry.quantity.toString(),
            requestedUOM: this.entry.checkUom,
            shippingCondition: this.isCustomer || this.isSalesPerson ? this.shippingAddress?.originalDefaultShippingMethod || this.originalDefaultShippingMethod || this.shippingAddress?.shippingCondition ||
            this.shippingAddress?.shippingMethod ||
            this.shippingAddress?.defaultShippingMethod ||
            this.shippingAddress?.defaultShippingCondition ||'' :
              this.shippingAddress?.shippingCondition ||
              this.shippingAddress?.shippingMethod ||
              this.shippingAddress?.defaultShippingMethod ||
              this.shippingAddress?.defaultShippingCondition ||
              "",
            shipVia:
              this.shippingAddress?.shipVia ||
              this.shippingAddress?.defaultShipVia,
            shippingWarehouse:
              this.shippingAddress?.shippingWarehouse ||
              this.shippingAddress?.defaultShippingWarehouse ||
              this.shippingAddress?.defaultShippingWarehouseDesc ||
              "",
            incoTerms:
              this.shippingAddress?.incoTerms ||
              this.shippingAddress?.defaultIncoTerms ||
              "",
            requestedDeliveryDate: this.shippingAddress?.rdd
              ? this.datePipe.transform(this.shippingAddress?.rdd, "MM/dd/yyyy")
              : this.shippingAddress?.requestedDeliveryDate
              ? this.datePipe.transform(
                  this.shippingAddress?.requestedDeliveryDate,
                  "MM/dd/yyyy"
                )
              : "",
            solution: solutions,
          },
        ],
      };
    }

    // this.spinnerLoading = true;
    this.productService.progressShow('addToQuote');
    this.quoteService
      .addToQuote(this.quoteCode, this.entryIndex, payload)
      .subscribe(
        (res) => {
          this.productService.progressHide();
          this.storageService.removeItem("solutionsQuoteData");
          this.solutionsResponseData = [];
          this.spinnerLoading = false;
          if (res.body.messages[0].status === "Success" || res.body.messages[0].status === "SUCCESS") {
            this.spinnerLoading = false;
            this.solutionAdded();
            return;
          } else {
            this.spinnerLoading = false;
            this.addtoCartFailed = true;
            this.addtoCartErrorMessage = res.body.messages[0].message;
            this.quoteService.updateData.next(true);
            this.quoteService.setCheckError(true);
          }
        },
        (err: any) => {
          this.productService.progressHide();
          this.spinnerLoading = false;
          this.quoteService.updateData.next(true);
          this.quoteService.setCheckError(true);
        }
      );
  }

  onHideModal() {
    this.bsModalRef.hide();
  }

  removeATPEntry(){
    if(this.solutionsResponseData?.solution) {
      let payload:any = {
        "shipTo": this.userInfo?.orgUnit?.uid,
        "soldTo": this.userInfo?.orgUnit?.soldTo,
        "oneTimeShippingAddress": this.oneTimeShipTo || false,
        "erpOrderID": this.solutionsResponseData?.solution[0]?.erpOrderID,
        "erpOrderLineNumber": this.solutionsResponseData?.solution[0]?.erpOrderLineNumber,
        "productCode": this.product?.code,
        "hybrisOrderNumber": this.solutionsResponseData?.hybrisOrderNumber,
        "hybrisLineNumber": this.solutionsResponseData?.hybrisLineNumber,
      }
      
      this.spinnerLoading = true;
      this.productService.removeATPCartEntry(payload).subscribe((resp)=>{
        if(resp.status === "200" || resp.status === 200){
          if(resp.body.status === "SUCCESS"){
            this.spinnerLoading = false;
            this.storageService.removeItem("solutionsQuoteData");
          }
        }
       
      });
  }
  }

  solutionAdded() {
    this.quoteService.updateData.next(true);
    this.modalService.hide("ChooseAddressModal");
    this.onHideModal();
  }
  failedCase(res?: any) {
    this.spinnerLoading = false;
    this.addtoCartFailed = true;
    this.scrollPageToTop();
    this.addtoCartErrorMessage = res?.body?.messages;
  }
  @ViewChild("scrollToTop", { read: ElementRef }) scrollToTop: any;
  scrollPageToTop() {
    this.scrollToTop.nativeElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest",
    });
  }
  successCase(res?: any) {
    let cartNumber = this.cartData?.code || null;
    this.productService.getLatestMiniCart(this.uid);
    this.spinnerLoading = false;
    if (cartNumber == null) {
      let cartData = {
        code: res.body?.cartNumber,
        entries: res.body?.entries,
      };
      this.cartData = cartData;
      // this.storageService.setItem("miniCartCount", cartData);
    }

    const data: any = this.modalService.config.initialState;
    const initialState: ModalOptions = {
      initialState: {
        // Data to  popup
        cartData: data?.cartData,
        postOrder:false,
      },
    };
    this.modalRef = this.modalService.show(
      XchangeAddAccessoriesLightboxComponent,
      Object.assign(initialState, {
        class: "modal-xl modal-dialog-centered xchangeaddaccessorieslightbox",
        backdrop: "static",
        keyboard: false,
      })
    );
    this.bsModalRef.content.type = 2;
  }

  dateConvert(d: any) {
    if (!d || d.trim().toLowerCase() === 'in process') {
      return null;
    }
    else
      return new Date(d).toISOString().slice(0, 10);
  }

  getUomDesc(uom: any) {
    if (uom === "LF") return "Linear Feet";
    if (uom === "CT") {
      return "Carton";
    }
    if (uom === "YDK") {
      return "Square Yard";
    }
    if (uom === "RO") {
      return "Roll(s)";
    }
    if (uom === "SF") {
      return "Square Feet";
    }
    return "";

  }

  onPrimaryAction: Function = (payload: any) => {};
  updateQuantity() {
    this.modalService.hide();
    this.onPrimaryAction(this.selectedSolution);
  }

  openBalanceModal(raw: any, balanceTemplate: TemplateRef<any>) {
    this.selectedSolution = raw;
    this.balance = raw.solutionEntries[0].saving;
    if (this.balance > 0) {
      this.modalRef = this.modalService.show(balanceTemplate, {
        id: "balanceModal",
        class: "modal-md modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      });
    }
  }

  handleColumnToggle = (evt: any) => {
    this.bkcolumns = this.bkcolumns.map((item) => {
      const isLenghtColumn =
        item.key === "rollAssignedInSF" || item.key === "rollAssignedInSY";
      return {
        ...item,
        key: isLenghtColumn
          ? evt
            ? "rollAssignedInSY"
            : "rollAssignedInSF"
          : item.key,
        title: isLenghtColumn
          ? evt
            ? "Length(SqFt)"
            : "Length(SqYd)"
          : item.title,
      };
    });
    this.columns = this.columns.map((item) => {
      const isLenghtColumn =
        item.key === "rollAssignedInSF" || item.key === "rollAssignedInSY";
      return {
        ...item,
        key: isLenghtColumn
          ? evt
            ? "rollAssignedInSY"
            : "rollAssignedInSF"
          : item.key,
        title: isLenghtColumn
          ? evt
            ? "Length(SqFt)"
            : "Length(SqYd)"
          : item.title,
      };
    });
  };
}
