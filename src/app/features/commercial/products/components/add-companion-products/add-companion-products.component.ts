import { DatePipe, formatDate } from "@angular/common";
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
import { FormControl } from "@angular/forms";
import { Router } from "@angular/router";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { Config, Columns, DefaultConfig } from "ngx-easy-table";
import { ApiService } from "src/app/features/http-services/api.service";
import { StorageService } from "src/app/features/http-services/storage.service";
import { ConfirmationDialogComponent } from "src/app/features/shared/components/confirmation-dialog/confirmation-dialog.component";
import { ErrorModalComponent } from "src/app/features/shared/components/error-modal/error-modal.component";
import { XchangeAddAccessoriesLightboxComponent } from "src/app/features/shared/components/xchange-add-accessories-lightbox/xchange-add-accessories-lightbox.component";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { ProductService } from "../../pages/services/product.service";
import { ProgressModalComponent } from "src/app/features/shared/components/progress-modal/progress-modal.component";
import { OrderService } from "../../../orders/services/order.service";
import { SAP_CAMS_PLAN } from "src/app/features/shared/constants/SAP_CAMS_PLANT_MAPPING";
import { take } from "rxjs";

@Component({
    selector: "commercial-add-companion-products",
    templateUrl: "./add-companion-products.component.html",
    styleUrls: ["./add-companion-products.component.scss"],
    standalone: false
})
export class AddCompanionProductsComponent implements OnInit, AfterViewChecked {
  // @ViewChild("toggleLengthTemplate", { static: false })
  // toggleLengthTemplate!: TemplateRef<any>;
  modalRef?: BsModalRef;
  disableAddCart = false;
  @Input() pdpdata: any;
  @Input() solutions: any = [];
  @Input() openFromaddressModal = false;
  @Input() quantityChangeModal = false;
  @Input() showContinue = false;
  atpCheckFromCart: Function = () => {};
  toggleLengthColumn: boolean = false;
  solutionType: any = "";
  aptCheckEntrie: any = [];
  productNumber: string;
  addtoCartErrorMessage: any = "";
  oneTimeShippingFlag: boolean = false;
  initialState: any;
  atpUserUom: any = "";
  columnsInventoryHs: Columns[] = [];
  atpUserQty: any = "";
  reATPChangeSource:boolean=false;
  backorderSolutions: any = [];
  availableSolutions: any = [];
  isLoading = false;
  savingLabel: boolean = false;
  shippingOptions: any;
  lineShipComplete: boolean = false;
  isCompleteCart: boolean = false;
  userSelectedQty: any;
  userSelectedUOM: any;
  selectedColor: any;
  sameDyeLot: any;
  selectedSolution: any;
  columns: Columns[] = [];
  columnsRoll: Columns[] = [];
  columnsInventory: Columns[] = [];
  columnsPad: Columns[] = [];
  columnsHSCarpetTile:Columns[]=[];
  bkcolumnsHSCarpetTile:Columns[]=[];
  bkcolumnsPad: Columns[] = [];
  atpFromCart: boolean = false;
  miniCartInfo: any;
  atpUniqueId: any;
  priceDetails: any;
  selectedPDPTab: any = "";
  cartDataForShippingInfo:any;
  requestedPrice:any;
  priceComment:any;
  noCharge:boolean=false;
  userInfoCust:any;
  noChargeReasonCode:any;
  noFreight:boolean=false;
  sideMark:any;
 poNumber:any;
  /*columns: Columns[] = [
    { key: "action", title: "" },
    { key: "type", title: "Type" },
    { key: "lengthLF", title: "Length(LF)" },
    { key: "rollAssignedInSF", title: "Length(SqFt)", headerActionTemplate: this.toggleLengthTemplate },
    { key: "dyeLot", title: "Dye Lot" },
    { key: "rollID", title: "Roll # " },
    { key: "plant", title: "Plant" },
    { key: "estimatedDeliveryDate", title: "Estimated Delivery Date" },
  ];

  bkcolumns: Columns[] = [
    { key: "action", title: "" },
    // { key: "type", title: "Type" },
    { key: "lengthLF", title: "Length(LF)" },
    { key: "rollAssignedInSF", title: "Length(SqFt)", headerActionTemplate: this.toggleLengthTemplate },
    { key: "minsize", title: "Min. Size" },
    { key: "maxsize", title: "Max. Size" },
    { key: "estimatedProdDate", title: "Estimated Production Date" },
  ];*/
  shippingInfoFromCart: any;
  shippingInfoFromDefaultAddress:any;
  checkBoxControl = new FormControl();
  bkcolumns: Columns[] = [];
  bkcolumnsHS: Columns[] = [];
  bkcolumnsRoll: Columns[] = [];
  columnsHS: Columns[]=[];
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
  fromViewInventory: boolean = false;
  soldToAccount:any = "";
  isShipToUser:boolean = false;
  erpProductCategory:any;
  requestedQty:any;
  atpResponseData:any;

  constructor(
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    public storageService: StorageService,
    public productService: ProductService,
    private userService: UserService,
    private orderService: OrderService,
    private router: Router,
    private apiService: ApiService,
    private datePipe: DatePipe
  ) {
    router.events.subscribe((url: any) => {});
    var n = router.url.lastIndexOf("/");
    if (router.url.includes("cart")) {
      this.atpFromCart = true;
    }
    if (this.atpFromCart) {
      this.storageService.getItem("atpCheckFromCart").subscribe((res: any) => {
        this.shippingInfoFromCart = res;
      });
    }
    this.productNumber = router.url.substring(n + 1);
  }
  ngAfterViewChecked(): void {
    const setagain = document.querySelectorAll(".xchange-loader");
    setagain.forEach((element) => {
      const elem = element as HTMLElement;
      elem.style.top = `${0}px`;
      elem.style.height = `${177}vh`;
    });
    const spinner = document.querySelectorAll(".custom-spinner");
    spinner.forEach((element) => {
      const elem = element as HTMLElement;
      elem.style.position = `absolute`;
      elem.style.top = `${28}%`;
    });
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
  multicutValue: any;
  cartQuoteNumber:any ="";
  feetYardFormData: any;
  multicutIndicator: boolean = false;
  viewInventory: boolean = false;
  uid: any;
  shippingAddressId: any;
  miniCartCountAddress: any = "";
  reATP: boolean = false;  
  hasClaimSubmitted!: any;
  solSubProductType: any;
  camsOrderNumber:any;
  camsLineNumber:any;
  camsCartId:any;
  defaultMiniCartShippingDesc:any;
  preferredStock:boolean = false;
  solutionObjectKeys:any = Object.keys;
  ngOnInit(): void {
    this.columns = [
      { key: "action", title: "" },
      { key: "type", title: "Type" },
      { key: "lengthLF", title: "Length(LF)" },
      {
        key: "rollAssignedInSY",
        title: "Length(SqYd)",
        // headerActionTemplate: this.toggleLengthTemplate,
        // cssClass: { includeHeader: true, name: "alignToggle" },
      },
      { key: "dyeLot", title: "Dye Lot" },
      { key: "rollID", title: "Roll # " },
      { key: "plant", title: "Plant" },
      // { key: "savings", title: "Savings" },
      { key: "estimatedDeliveryDate", title: "Estimated Availability Date" },
    ];
    this.columnsRoll = [
      { key: "action", title: "" },
      { key: "type", title: "Type" },
      { key: "lengthLF", title: "Length(LF)" },
      { key: "dyeLot", title: "Dye Lot" },
      { key: "rollID", title: "Roll # " },
      { key: "plant", title: "Plant" },
      // { key: "savings", title: "Savings" },
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
      // { key: "type", title: "Type" },
      //   { key: "rollAssignedInSY", title: "Order Qty(LF)" },
      { key: "minsize", title: "Min. Size" },
      { key: "maxsize", title: "Max. Size" },
      { key: "estimatedProdDate", title: "Estimated Availability Date" },
    ];

    this.columnsHSCarpetTile = [
      { key: "action", title: "" },
      //{ key: "type", title: "Type" },
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
      { key: "rollAssignedInSY", title: "Sq. Yd." },
      { key: "estimatedProdDate", title: "Estimated Availability Date" },
    ];

    this.columnsHS = [
      { key: "action", title: "" },
      //{ key: "type", title: "Type" },
      { key: "quantity", title: "Quantity" },
      { key: "rollAssignedInSY", title: "Sq. Yd." },
      { key: "dyeLot", title: "Dye Lot" },
      { key: "plant", title: "Plant" },
      { key: "estimatedDeliveryDate", title: "Estimated Availability Date" },
    ];


    this.cartData = this.storageService.cartData;
    const data: any = this.modalService.config.initialState;
    this.initialState = data;
    this.selectedPDPTab = data?.selectedPDPTab;

    this.getProductMedias(
      data?.solutions[0]?.code ||
        data?.solutions[0]?.product?.code ||
        data?.solutions[0].entries[0]?.productCode
    );

    if (this.openFromaddressModal) {
      this.shippingAddress = data?.shippingAddress;
    } else {
       this.userService.getCurrentUserDetail().subscribe((res: any) => {
      this.uid = res.body.orgUnit?.uid;
         this.productService
            .getMiniCartData(this.uid)
            .subscribe((res: any) => {
              this.storageService.setItem("miniCartCount", res?.body || res);
            


            this.shippingAddress = res?.body?.deliveryAddress || res?.deliveryAddress || {};
             this.storageService.setItem("defaultAddres", res?.body?.deliveryAddress || res?.deliveryAddress || {});
              
       // this.shippingAddress = res;
      });
    });
    }
    this.reATPChangeSource = data?.reATPChangeSource;
    this.shippingOptions = data?.shippingOptions || {};
    this.requestedQty = data.requestedQty;
    this.fromViewInventory = data?.viewInventory ? data?.viewInventory : data?.viewInventoryHS;
    this.feetYardFormData = data?.feetyardForm || {};
    this.feetYardFormData.requestedQty = +this.feetYardFormData?.requestedQty;
    this.feetYardFormData.feet = +this.feetYardFormData?.feet;
    this.solutionType = data?.feetyardForm?.unit || "";
    this.shippingOptions = data?.shippingOptions || {};
    this.isCompleteCart = data?.isCompleteCart || false;
    this.multicutIndicator = data?.multiCutIndication || false;
    this.viewInventory = data?.viewInventory || false;
    this.cartQuoteNumber = data?.quoteNumber || "";
    this.priceDetails = data?.priceDetails || {};
    this.oneTimeShippingFlag = data?.oneTimeShippingFlag || false;
    this.sameDyeLot = this.initialState?.sameDyeLot;
    this.requestedPrice = this.initialState?.requestedPrice ||"";
    this.priceComment = this.initialState?.priceComment || "";
    this.noCharge = this.initialState?.noCharge || false;
    this.noFreight = this.initialState?.noFreight || false;
    this.sideMark = this.initialState?.sideMark ||"";
    this.noChargeReasonCode = this.initialState?.noChargeReasonCode ||"";
    this.poNumber = this.initialState?.poNumber ||"";
    this.solSubProductType = data?.solutions[0]?.subProductType;
    this.preferredStock = this.initialState?.preferredStock || false;
    if (data?.oneTimeShippingFlag) {
      this.shippingAddress = data?.address?.shippingAddress;
    }
    this.configuration = { ...DefaultConfig };
    this.configuration.checkboxes = false;
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;
    this.configuration.isLoading = true;
    /* this.columns = [
      { key: "#", title: "" },
      { key: "lenght", title: "Length(LF)" },
      { key: "sqyd", title: "Sq. Yds" },
      { key: "dyelot", title: "Dye Lot" },
      { key: "roll", title: "Roll #" },
      { key: "warehouse", title: "Warehouse" },
      { key: "type", title: "Type" },
      { key: "edt", title: "Estimated Delivery Date" },
    ];*/

    this.storageService.getItem("pdpOptionsData").subscribe((res: any) => {
      this.pdpDataOptions = res;
    });

    this.storageService.getItem("sizeBackingData").subscribe((res: any) => {
      this.sizeBackingData = res;
    });
    this.storageService.getItem("defaultAddres").subscribe((res: any) => {
      this.atpCheckData = res?.entries || {};
      this.shippingAddressId = res?.shippingAddressID;
      this.shippingInfoFromDefaultAddress = res?.shippingInfo
    });
    this.storageService.getItem("miniCartCount").subscribe((res: any) => {
      this.miniCartCountAddress = res;
      if(res?.totalItems > 0){
        this.camsOrderNumber = res?.camsReferenceOrderNumber;
      }
      this.camsLineNumber = res?.totalItems ? +res?.totalItems + 1 : undefined;
      if (this.shippingAddressId === "" || this.shippingAddressId === null) {
        this.shippingAddressId = res.shipTo;
      }
    });

    this.storageService.getItem("userInfo").pipe(take(1)).subscribe((res) => {
      this.isShipToUser = res?.isShipToUser;
      this.soldToAccount = res?.orgUnit?.soldTo || "";
    });

    this.userService.getCurrentUserDetail().subscribe((res: any) => {
      this.uid = res?.body?.orgUnit?.uid;
      this.userInfoCust = res?.body;
      
      this.productService.getMiniCartData(this.uid).subscribe((res: any) => {
        this.miniCartInfo = res?.body || res;
        this.storageService.setItem("miniCartCount", this.miniCartInfo);
        if(this.miniCartInfo?.code){
          this.camsCartId = this.miniCartInfo?.code;
        }
        if(this.reATP == false){
          this.defaultMiniCartShippingDesc = this.miniCartInfo?.shippingConditionDesc;
          if(this.erpProductCategory == "S"){
            if(this.miniCartInfo?.hardProductShippingData && 
              Object.keys(this.miniCartInfo?.hardProductShippingData).length > 1){
                this.shippingOptions.defaultIncoTerms = this.miniCartInfo?.hardProductShippingData?.incoTerms;
                this.shippingOptions.defaultShipVia = this.miniCartInfo?.hardProductShippingData?.shipVia;
                this.shippingOptions.defaultShippingMethod = this.miniCartInfo?.hardProductShippingData?.shippingCondition;
                this.shippingOptions.defaultShippingWarehouse = this.miniCartInfo?.hardProductShippingData?.shippingWarehouse;
                this.shippingOptions.originalDefaultShippingMethod = this.userInfoCust.isCustomer  || this.userInfoCust.isSalesPerson || this.userInfoCust.isSalesOps ? this.miniCartInfo?.hardProductShippingData?.originalShippingCondition  : this.miniCartInfo?.hardProductShippingData?.shippingCondition;
            } else if(this.miniCartInfo?.softProductShippingData && 
              Object.keys(this.miniCartInfo?.softProductShippingData).length > 1){
                this.shippingOptions.defaultIncoTerms = this.miniCartInfo?.softProductShippingData?.incoTerms;
                this.shippingOptions.defaultShipVia = this.miniCartInfo?.softProductShippingData?.shipVia;
                this.shippingOptions.defaultShippingMethod = this.miniCartInfo?.softProductShippingData?.shippingCondition;
                this.shippingOptions.defaultShippingWarehouse = this.miniCartInfo?.softProductShippingData?.shippingWarehouse;
                 this.shippingOptions.originalDefaultShippingMethod = this.userInfoCust.isCustomer  || this.userInfoCust.isSalesPerson || this.userInfoCust.isSalesOps ? this.miniCartInfo?.softProductShippingData?.originalShippingCondition  : this.miniCartInfo?.softProductShippingData?.shippingCondition;
              }else{
                this.shippingOptions.defaultIncoTerms = this.miniCartInfo?.deliveryAddress?.defaultIncoTerms || this.shippingOptions?.defaultIncoTerms;
                this.shippingOptions.defaultShipVia = this.miniCartInfo?.deliveryAddress?.defaultShipVia || this.shippingOptions?.defaultShipVia;
                this.shippingOptions.defaultShippingMethod = this.miniCartInfo?.deliveryAddress?.defaultShippingMethod || this.shippingOptions?.defaultShippingMethod;
                this.shippingOptions.defaultShippingWarehouse = this.miniCartInfo?.deliveryAddress?.defaultShippingWarehouse || this.shippingOptions?.defaultShippingWarehouse;
              //   this.shippingOptions.originalDefaultShippingMethod = this.userInfoCust.isCustomer  || this.userInfoCust.isSalesPerson || this.userInfoCust.isSalesOps ? this.miniCartInfo?.deliveryAddress?.originalDefaultShippingMethod  : this.miniCartInfo?.deliveryAddress?.defaultShippingMethod || this.shippingOptions?.defaultShippingMethod;
              }
          } else if(this.erpProductCategory == "B"){
            if(this.miniCartInfo?.softProductShippingData && 
              Object.keys(this.miniCartInfo?.softProductShippingData).length > 1){
                this.shippingOptions.defaultIncoTerms = this.miniCartInfo?.softProductShippingData?.incoTerms;
                this.shippingOptions.defaultShipVia = this.miniCartInfo?.softProductShippingData?.shipVia;
                this.shippingOptions.defaultShippingMethod = this.miniCartInfo?.softProductShippingData?.shippingCondition;
                this.shippingOptions.defaultShippingWarehouse = this.miniCartInfo?.softProductShippingData?.shippingWarehouse;
              //  this.shippingOptions.originalDefaultShippingMethod = this.miniCartInfo?.softProductShippingData?.shippingCondition;
                 this.shippingOptions.originalDefaultShippingMethod = this.userInfoCust.isCustomer  || this.userInfoCust.isSalesPerson || this.userInfoCust.isSalesOps ? this.miniCartInfo?.softProductShippingData?.originalShippingCondition  : this.miniCartInfo?.softProductShippingData?.shippingCondition;
            } else if(this.miniCartInfo?.hardProductShippingData && 
              Object.keys(this.miniCartInfo?.hardProductShippingData).length > 1){
                this.shippingOptions.defaultIncoTerms = this.miniCartInfo?.hardProductShippingData?.incoTerms;
                this.shippingOptions.defaultShipVia = this.miniCartInfo?.hardProductShippingData?.shipVia;
                this.shippingOptions.defaultShippingMethod = this.miniCartInfo?.hardProductShippingData?.shippingCondition;
                this.shippingOptions.defaultShippingWarehouse = this.miniCartInfo?.hardProductShippingData?.shippingWarehouse;
                this.shippingOptions.originalDefaultShippingMethod = this.miniCartInfo?.hardProductShippingData?.shippingCondition;
                 this.shippingOptions.originalDefaultShippingMethod = this.userInfoCust.isCustomer  || this.userInfoCust.isSalesPerson || this.userInfoCust.isSalesOps ? this.miniCartInfo?.hardProductShippingData?.originalShippingCondition  : this.miniCartInfo?.hardProductShippingData?.shippingCondition;
              }else{
                this.shippingOptions.defaultIncoTerms = this.miniCartInfo?.deliveryAddress?.defaultIncoTerms || this.shippingOptions?.defaultIncoTerms;
                this.shippingOptions.defaultShipVia = this.miniCartInfo?.deliveryAddress?.defaultShipVia || this.shippingOptions?.defaultShipVia;
                this.shippingOptions.defaultShippingMethod = this.miniCartInfo?.deliveryAddress?.defaultShippingMethod || this.shippingOptions?.defaultShippingMethod;
                this.shippingOptions.defaultShippingWarehouse = this.miniCartInfo?.deliveryAddress?.defaultShippingWarehouse || this.shippingOptions?.defaultShippingWarehouse;
              //  this.shippingOptions.originalDefaultShippingMethod = this.userInfoCust.isCustomer  || this.userInfoCust.isSalesPerson || this.userInfoCust.isSalesOps ? this.miniCartInfo?.deliveryAddress?.originalDefaultShippingMethod  : this.miniCartInfo?.deliveryAddress?.defaultShippingMethod || this.shippingOptions?.defaultShippingMethod;
              }
          }else{
            this.shippingOptions.defaultIncoTerms = this.miniCartInfo?.deliveryAddress?.defaultIncoTerms || this.shippingOptions?.defaultIncoTerms;
                this.shippingOptions.defaultShipVia = this.miniCartInfo?.deliveryAddress?.defaultShipVia || this.shippingOptions?.defaultShipVia;
                this.shippingOptions.defaultShippingMethod = this.miniCartInfo?.deliveryAddress?.defaultShippingMethod || this.shippingOptions?.defaultShippingMethod;
                this.shippingOptions.defaultShippingWarehouse = this.miniCartInfo?.deliveryAddress?.defaultShippingWarehouse || this.shippingOptions?.defaultShippingWarehouse;
                 this.shippingOptions.originalDefaultShippingMethod = this.userInfoCust.isCustomer  || this.userInfoCust.isSalesPerson || this.userInfoCust.isSalesOps ? this.miniCartInfo?.deliveryAddress?.originalDefaultShippingMethod  : this.miniCartInfo?.deliveryAddress?.defaultShippingMethod || this.shippingOptions?.defaultShippingMethod;
          }
        }
        this.checkAtp();
      });
    });

    this.columns = this.columns.filter((column: any) => {
      return column.title === "Savings" ? !this.fromViewInventory : true;
    });
    this.columnsRoll = this.columnsRoll.filter((column: any) => {
      return column.title === "Savings" ? !this.fromViewInventory : true;
    });
    this.config.rows =
      this.availableSolutions?.length > this.backorderSolutions?.length
        ? this.availableSolutions?.length
        : this.backorderSolutions?.length;
    if (localStorage.getItem("selectedProductTab") == "Roll") {
      let maxRoll = localStorage.getItem("MaxRollLength");
      let minRoll = localStorage.getItem("MinRollLength");

      if (maxRoll && minRoll) {
        this.maxInches = maxRoll.includes(".") ? maxRoll.split(".")[1] : "00";
        this.minInches = minRoll.includes(".") ? minRoll.split(".")[1] : "00";
        this.maxFeet = maxRoll.includes(".") ? maxRoll.split(".")[0] : maxRoll;
        this.minFeet = minRoll.includes(".") ? minRoll.split(".")[0] : minRoll;
      }
    }
  }
  maxInches: any = "00";
  minInches: any = "00";
  maxFeet: any = "00";
  minFeet: any = "00";

  requestedUOMproductType: string = "";
  inventorySolutions: any = [];


  checkAtp() {
    if (
      this.productNumber == undefined ||
      this.productNumber == null ||
      this.productNumber == "cart"
    ) {
      this.productNumber = this.solutions[0].code;
    }
    // this.isLoading = true;
    this.productService.progressShow('atpCheck', 'atpCheckId');
    const data: any = this.modalService.config.initialState;
    this.requestedUOMproductType = data.productType;

    if (this.openFromaddressModal) {
      this.shippingAddress = data?.shippingAddress;
    } else {
      this.storageService.getItem("shippingAddress").subscribe((res) => {
        this.shippingAddress = res;
      });
      // this.shippingAddress = this.productService.getDefaulAddress();
    }

    let targetLength = this.feetYardFormData?.targetLength || this.initialState?.standardRollLength || "0";

    let entriesData: any = this.modalService.config.initialState;
    const payload = {
      multiCutIndication: this.multicutIndicator,
      addressCity:  this.shippingAddress?.oneTimeShippingAddress ||  this.shippingAddress?.oneTimeShippingFlag ||
      this.shippingAddress?.isOneTimeShipTo ?  this.shippingAddress?.city || this.shippingAddress?.addressCity  || this.shippingAddress?.town || "": this.shippingAddress?.addressCity || this.shippingAddress?.city || this.shippingAddress?.town|| "",
      addressCountry:
        this.shippingAddress?.oneTimeShippingAddress ||  this.shippingAddress?.oneTimeShippingFlag ||
        this.shippingAddress?.isOneTimeShipTo
          ?  this.shippingAddress?.addressCountry || this.shippingAddress.country?.isocode 
          : this.shippingAddress.country || this.shippingAddress?.addressCountry,
      addressLine1: this.shippingAddress?.oneTimeShippingAddress ||  this.shippingAddress?.oneTimeShippingFlag ||
                this.shippingAddress?.isOneTimeShipTo ? this.shippingAddress?.streetAddress || this.shippingAddress?.addressLine1 || this.shippingAddress?.line1 :this.shippingAddress?.addressLine1 || this.shippingAddress?.line1 || this.shippingAddress?.streetAddress,
      addressLine2: this.shippingAddress?.oneTimeShippingAddress 
                || this.shippingAddress?.oneTimeShippingFlag || this.shippingAddress?.isOneTimeShipTo ? this.shippingAddress?.streetAddress2 || this.shippingAddress?.addressLine2 || this.shippingAddress?.line2 :this.shippingAddress?.addressLine2 || this.shippingAddress?.line2 || this.shippingAddress?.streetAddress2,
      addressName: this.shippingAddress?.addressName || this.shippingAddress?.companyName,
      addressPostalCode: this.shippingAddress?.addressPostalCode || this.shippingAddress?.postalCode ||  "",
      addressState:(this.shippingAddress?.oneTimeShippingAddress ||
            this.shippingAddress?.isOneTimeShipTo) ?
            (this.shippingAddress?.region?.isocodeShort ||
              this.shippingAddress?.addressState ||
              this.shippingAddress?.region ||
              "") :
            (this.shippingAddress?.addressState ||
            this.shippingAddress?.region ||
            ""),
      viewInventory: this.viewInventory,
      rollPrice: this.initialState?.priceDetails?.rollPriceSY,
      cutPrice: this.initialState?.priceDetails?.cutPriceSY,
      zipCode:
        this.shippingAddress?.postalCode || this.shippingAddress?.zipCode,
      oneTimeShippingAddress:
        this.shippingAddress?.oneTimeShippingAddress ||
        this.shippingAddress?.isOneTimeShipTo ||
        false,
      shippingCondition:
        this.userInfoCust.isCustomer === true || this.userInfoCust.isSalesPerson === true || this.userInfoCust.isSalesOps === true? this.shippingOptions?.originalDefaultShippingMethod || this.shippingOptions?.defaultShippingMethod ||
        this.cartData?.shippingCondition ||
        "":this.shippingOptions?.defaultShippingMethod ||
        this.cartData?.shippingCondition ||
        "",
      incoTerms:
        this.shippingOptions?.defaultIncoTerms ||
        this.cartData?.incoTerms ||
        "",
      shippingWarehouse:
        this.shippingOptions?.defaultShippingWarehouse ||
        this.cartData?.shippingWarehouse ||
        "",
      shipVia:
        this.shippingOptions?.defaultShipVia ||
        this.cartData?.defaultShipVia ||
        this.cartData?.shipVia ||
        "",
        claimNumber: this.shippingAddress?.claimNumber
        ? this.shippingAddress?.claimNumber
        : "",
      invoiceNumber: this.shippingAddress?.invoiceNumber
          ? this.shippingAddress?.invoiceNumber
          : "",
      purchaseOrderNumber: this.shippingAddress?.purchaseOrderNumber
        ? this.shippingAddress?.purchaseOrderNumber
        : "",
      replacementReason: this.shippingAddress?.replacementReason
        ? this.shippingAddress?.replacementReason
        : "",
      replacementOrder:
        this.cartData?.replacementOrder ||
        this.shippingAddress?.replacementOrder ||
        false,
      replacementOrderNumber: this.shippingAddress?.orderNumber
          ? this.shippingAddress?.orderNumber
          : "",
      entries: [
        {
          dyeLot: this.feetYardFormData?.dye || "",
          feet: Number(this.feetYardFormData?.feet) || "",
          inches: Number(this.feetYardFormData?.inches) || "",
          productCode:
            this.feetYardFormData?.productCode || this.productNumber || "",
          requestUOM: this.feetYardFormData?.unit || "",
          requestedQty: this.feetYardFormData?.requestedQty || "",
          requestedYdkQty: this.initialState?.requestedYdkQty || "",
          targetLength: targetLength.toString(),
          maxFeet:
            localStorage.getItem("selectedProductTab") == "Roll"
              ? this.maxFeet
              : this.feetYardFormData?.maxFeet || "",
          maxInches:
            localStorage.getItem("selectedProductTab") == "Roll"
              ? this.maxInches
              : this.feetYardFormData?.maxInches || "",
          minFeet:
            localStorage.getItem("selectedProductTab") == "Roll"
              ? this.minFeet
              : this.feetYardFormData?.minFeet || "",
          minInches:
            localStorage.getItem("selectedProductTab") == "Roll"
              ? this.minInches
              : this.feetYardFormData?.minInches || "",
        },
      ],
      shipTo: this.shippingAddressId
        ? this.shippingAddressId
        : this.shippingAddress?.id || this.uid,
      shippingAddressID: this.shippingAddressId
        ? this.shippingAddressId
        : this.shippingAddress?.id || this.uid,
      reqDeliveryDate: this.shippingAddress?.rdd
        ? this.datePipe.transform(this.shippingAddress?.rdd, "MM/dd/yyyy")
        : this.initialState?.rdd, //"2022-12-24"

      soldTo: this.isShipToUser ? this.soldToAccount : this.uid,
      ...(this.atpFromCart === true
        ? { reInspect: entriesData?.isReinspect || false }
        : this.shippingOptions?.replacementOrder == true
        ? { reInspect: true }
        : {}),
      sameDyeLot: this.sameDyeLot,
      camsOrderNumber: this.camsOrderNumber,
      camsLineNumber: this.camsLineNumber,
      cartId: this.camsCartId || "",
      siteContactName: this.shippingAddress?.oneTimeShippingAddress || this.shippingAddress?.isOneTimeShipTo ? this.shippingAddress?.ContactName || this.shippingAddress?.siteContactName || this.shippingInfoFromDefaultAddress?.siteContactName || "":"",
      siteContactPhone: this.shippingAddress?.oneTimeShippingAddress || this.shippingAddress?.isOneTimeShipTo ? this.shippingAddress?.Phone || this.shippingAddress?.siteContactPhone  || this.shippingInfoFromDefaultAddress?.siteContactPhone || "":"",    
      // shippingInfo: entriesData?.oneTimeShippingFlag
      //   ? {
      //       acceptDate: this.shippingAddress?.lastestacceptDate
      //         ? this.datePipe.transform(
      //             this.shippingAddress?.lastestacceptDate,
      //             "MM/dd/yyyy"
      //           )
      //         : "",
      //       apptNeeded: this.shippingAddress?.appoinment,
      //       forkLiftRequired: this.shippingAddress?.accomodate,
      //       jobSiteDelivery: this.shippingAddress?.jobsiteDelivery,
      //       largestTruckSize: this.shippingAddress?.truckSize || "",
      //       liftGateAndPallet: this.shippingAddress?.liftGateAndPallet,
      //       loadingDock: this.shippingAddress?.loading,
      //       location: this.shippingAddress?.Location || "",
      //       palletJack: this.shippingAddress?.palletJack,
      //       poleLiftRequired: this.shippingAddress?.poleLift,
      //       requireNotification: this.shippingAddress?.notification,
      //       siteContactName: this.shippingAddress?.ContactName || "",
      //       siteContactPhone: this.shippingAddress?.Phone || "",
      //       storeNumber: this.shippingAddress?.storeNumber || "",
      //     }
      //   : (!this.shippingAddress?.isOneTimeShipTo) ? null : this.cartDataForShippingInfo?.shippingInfo,
    };

    if (
      entriesData.aptCheckEntrie !== undefined &&
      entriesData?.aptCheckEntrie?.length != 0
    ) {
      payload.entries = entriesData?.aptCheckEntrie;
      payload.multiCutIndication = entriesData?.multiCutIndication;
    }
    // if (!this.openFromaddressModal && !this.atpFromCart) {
    //   delete payload?.incoTerms;
    // }
    // if (!this.openFromaddressModal && this.atpFromCart) {
    //   const data: any = this.modalService?.config?.initialState;

    //   if (payload && data["incoTerms"] !== undefined) {
    //     payload.incoTerms = data["incoTerms"];
    //   }
    //   if (payload && data["shippingCondition"] !== undefined) {
    //     payload.shippingCondition = data["shippingCondition"];
    //   }
    //   if (payload && data["shippingware"] !== undefined) {
    //     payload.incoTerms = data["incoTerms"];
    //   }
    //   if (payload && data["shippingCondition"] !== undefined) {
    //     payload.shippingCondition = data["shippingCondition"];
    //   }
    //   if (payload && data["shippingWareHouse"] !== undefined) {
    //     payload.shippingWarehouse = data["shippingWareHouse"];
    //   }
    //   if (payload && data["shipVia"] !== undefined) {
    //     payload.shipVia = data["shipVia"];
    //   }
    //   if (payload && data["rdd"] !== undefined) {
    //     payload.reqDeliveryDate = data["rdd"];
    //   }
    // }
    this.productService.checkAvailabilityForProduct(payload).subscribe({
      next: (result) => {
        if (
          result &&
          result.body != undefined &&
          result?.body?.solution?.length
        ) {
          this.productService.progressHide('atpCheckId');
          this.requestedOrderQuantityLabel = `
          ${this.feetYardFormData?.requestedQty} ${this.feetYardFormData?.unit} 
        `;
          this.atpUniqueId = result?.body?.atpUniqueId;
          this.camsOrderNumber =  result?.body?.camsOrderNumber;
          this.atpResponseData = result?.body;
          this.storageService.setItem("atpCart",result?.body);
          const [backorderSolutions, availableSolutions] = (
            result?.body?.solution || []
          ).reduce(
            (acc: any, item: any) => {
              acc[item.backOrder === true ? 0 : 1].push(item);
              return acc;
            },
            [[], []]
          );
          this.userSelectedQty = this.atpUserQty;
          this.userSelectedUOM = this.atpUserUom;

          this.backorderSolutions = backorderSolutions.reduce(
            (acc: any, item: any) => {
              const index = acc.findIndex(
                (entry: any) => entry.solutionID === item.solutionID
              );
              if (index > -1) {
                this.savingLabel =
                  this.savingLabel == true
                    ? this.savingLabel
                    : item.saving === "0.00"
                    ? false
                    : true;
                acc[index].solutionEntries.push(item);
              } else {
                this.savingLabel =
                  this.savingLabel == true
                    ? this.savingLabel
                    : item.saving === "0.00"
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
          // this.columns.map((item: any) => {
          //   if (item.key === "rollAssignedInSY") {
          //     item.headerActionTemplate = this.toggleLengthTemplate;
          //   }
          // });
          this.availableSolutions = availableSolutions.reduce(
            (acc: any, item: any) => {
              const index = acc.findIndex(
                (entry: any) => entry.solutionID === item.solutionID && entry.solutionType == item.solutionType
              );

              if (index > -1) {
                acc[index].solutionEntries.push(item);
              } else {
                acc.push({
                  solutionID: item.solutionID,
                  solutionType: item.solutionType,
                  solutionEntries: [item],
                });
              }
              return acc;
            },
            []
          );
          
          this.availableSolutions = this.availableSolutions.reduce(
            (solution:any, currentValue:any) => { 
              (solution[currentValue['solutionType']] = solution[currentValue['solutionType']] || []).push(currentValue);
              return solution;
            }, {});
            
          this.productService.getMiniCartData(this.uid).subscribe((res: any) => {
            this.productService.progressHide();
            let mincartData = res?.body || res;
            if(mincartData?.code){
              this.camsCartId = mincartData?.code;
              if((mincartData?.totalItems == 0 || mincartData?.totalItems == null) && 
                (this.shippingAddress?.oneTimeShippingAddress || this.shippingAddress?.isOneTimeShipTo)
                && (this.initialState?.isSuggestedAddress || this.initialState?.isInvalidAddress)){
                this.addressReqHistory();
              }
            }
          });
          this.configuration.isLoading = false;
          this.isLoading = false;
          this.productService.progressHide('atpCheckId');
        } else {
          this.productService.progressHide('atpCheckId');
          this.aptCheckEntrie = [];
          this.configuration.isLoading = false;
          this.isLoading = false;
          const err =
            result?.status == 200
              ? result?.body?.messages[0]?.message
              : result?.body?.error?.message;
          this.failedCase(err);
        }
      },
      error: () => {
        this.productService.progressHide('atpCheckId');
      }
    });
  }

  addressReqHistory(){
    let userAddress = this.userEnteredAddress();
    let payload = {                                                                                                     
      "RequestType": "modify",                                                                            
      "OrderNumber": +this.atpResponseData?.hybrisOrderNumber || '',                                                                               
      "CartNumber": "",                                                                                
      "UserId": this.isShipToUser ? this.soldToAccount : this.uid,                                                                                
      "EmailId": this.userService.getUserEmail().toLowerCase() || '',
      "IsInvalidAddress": this.initialState?.isInvalidAddress || false,
      "IsSuggestedAddress": this.initialState?.isSuggestedAddress || false,
      "UserEnteredAddress": userAddress,
      "SystemSuggestedAddress": this.initialState?.isSuggestedAddress ? this.initialState?.addressErrorMsg : "",
      "SystemError": this.initialState?.isInvalidAddress ? this.initialState?.addressErrorMsg : "",
      "Website": "Xchange",
      "AccountType": "C"
    }
    this.productService.addressReqHistory(payload).subscribe({
      next: (res: any) => {
      },
      error: (err: any) => {
      }
    });
  }

 userEnteredAddress() {
    const addr = this.shippingAddress;
    if (!addr) return '';

    const line1 = addr?.addressLine1 || addr?.line1;
    const line2 = addr?.addressLine2 || addr?.line2;
    const city = addr?.city;
    const state = addr?.addressState || addr?.region;
    const zip = addr?.zipCode;

    const street = [line1, line2].filter(Boolean).join(', ');
    const location = `${city ? city + ', ' : ''}${state || ''} ${zip || ''}`;
    return `${street ? street + ', ' : ''}${location}`;
  }

   groupSolutions(array: any, key: any) {
    return array.reduce((result:any, current:any) => {
      const value = current[key];
      if (result[value] === undefined) {
        result[value] = [];
      }
      result[value].push(current);
      return result;
    }, {});
  }
  
  groupByCreatedAt(data: any, key: any) {
    return data.reduce(function (x: any, y: any) {
      (x[y[key]] = x[y[key]] || []).push(y);
      return x;
    }, {});
  }
  async addToCart() {
    if (this.storageService.cartData?.sampleOrder == true) {
      this.openConfirmationModal({
        title: "Headsup!",
        content:
          "Looks like a sample cart is active, adding this product to the cart will remove all the samples in your current cart. Are you sure want to continue?",
        primaryActionLabel: "Continue",
        secondaryActionLabel: "Cancel",
        onPrimaryAction: () => this.clearCartAndAdd(),
        onSecondaryAction: () => {
          this.modalService.hide("confirmationModal");
        },
      });
    } else {
      let isDifferentDyeLot = false;
      const dyeLotValues = new Set();
      for (const item of this.selectedSolution?.solutionEntries) {
        dyeLotValues.add(item.dyeLot);
        if (dyeLotValues.size > 1) {
          isDifferentDyeLot = true;
          break;
        }
      }
      if (isDifferentDyeLot) {
        this.openConfirmationModal({
          title: "Information!",
          content:
            "Please Note: Solution contains multiple dyelots. Would like to continue with assignments?",
          primaryActionLabel: "Continue",
          secondaryActionLabel: "Cancel",
          onPrimaryAction: () => this.continueToAdd(),
          onSecondaryAction: () => {
            this.modalService.hide("confirmationModal");
          },
        });
      } else {
        this.cartData = this.storageService.cartData;
        this.addTocartHandler();
      }
    }
  }
  continueToAdd() {
    this.modalService.hide("confirmationModal");

    this.cartData = this.storageService.cartData;
    this.addTocartHandler();
  }
  clearCartAndAdd() {
    this.modalService.hide("confirmationModal");
    this.spinnerLoading = true;
    this.productService
      .removeAllFromCart(
        this.storageService.cartData?.cartNumber ||
          this.storageService.cartData?.code
      )
      .subscribe((res: any) => {
        if (res.status == 200) {
          this.storageService.getItem("uid").subscribe((res) => {
            this.uid = res;
          });
          this.productService
            .getMiniCartData(this.uid)
            .subscribe((res: any) => {
              this.storageService.setItem("miniCartCount", res?.body || res);
              this.cartData = res?.body || res;
              this.storageService.cartData = this.cartData;
              this.addTocartHandler();
            });
        } else {
          this.addtoCartErrorMessage = res?.body || res?.error;
          this.spinnerLoading = false;
        }
      });
  }
  addTocartHandler() {
    let sol = this.aptCheckEntrie.find((x: any) => x.selected == true);
    let selectedSol: any = [];
    let finalSolutions: any = [];
    if (sol) {
      selectedSol = this.aptCheckEntrie.filter((element: any) => {
        if (element.solutionID == sol.solutionID) {
          return element;
        }
      });
    }

    this.cartData = this.storageService.cartData;
    this.productService.progressShow('addToCart', 'addToCartId');
    if (this.cartData?.code) {
      this.productService
        .getCartData(this.cartData?.code)
        .subscribe((res: any) => {
          if (!this.initialState.rddFlag) {
            let rdd = res?.body?.requestedDeliveryDate ? res?.body?.requestedDeliveryDate : new Date();
            rdd = (rdd != "See line details." ? rdd : this.datePipe.transform(new Date(), "MM/dd/yyyy"));
            this.shippingAddress = { ...this.shippingAddress, rdd: rdd, requestedDeliveryDate: rdd };
            this.storageService.setItem("shipping-address", this.shippingAddress);
            this.storageService.setItem("shippingAddress", this.shippingAddress);
          }
          if (res?.body?.totalItems == 0 || res?.body?.totalItems == null) {
            this.lineShipComplete = this.reATP == true ? (this.reATPChangeSource ===true)? true :this.isCompleteCart : true;
            finalSolutions = JSON.parse(JSON.stringify(selectedSol));

            // this.shippingAddress = this.productService.getDefaulAddress();

            this.addtoCartBeforeOpen(this.selectedSolution?.solutionEntries);
          }
          if (res?.body?.totalItems != 0) {
            this.cartDataForShippingInfo = res?.body;
            if (res?.body?.shipComplete == false) {
              this.lineShipComplete = false;
            }
            if (res?.body?.shipComplete == true) {
              if (
                (res.body?.shipVia === this.shippingOptions?.defaultShipVia ||
                  res.body?.shipVia === this.shippingOptions?.shipVia) &&
                (res?.body?.shippingConditions ===
                  this.shippingOptions?.defaultShippingCondition ||
                  res?.body?.shippingConditions ===
                    this.shippingOptions?.defaultShippingMethod) &&
                (res?.body?.shippingWarehouse ===
                  this.shippingOptions?.shippingWarehouse ||
                  res?.body?.shippingWarehouse ===
                    this.shippingOptions?.defaultShippingWarehouse) &&
                (res?.body?.incoTerms ===
                  this.shippingOptions?.defaultIncoTerms ||
                  res?.body?.incoTerms === this.shippingOptions?.incoTerms)
              ) {
                this.lineShipComplete = true;
              } else {
                this.lineShipComplete = false;
              }
            }
            finalSolutions = JSON.parse(JSON.stringify(selectedSol));

            // this.shippingAddress = this.productService.getDefaulAddress();
            this.hasClaimSubmitted = res?.body?.replacementOrderInfo?.hasClaimSubmitted;
            this.addtoCartBeforeOpen(this.selectedSolution?.solutionEntries);
          }
        }, () => { this.productService.progressHide("addToCartId"); });
    } else {
      this.lineShipComplete = this.reATP == true ? (this.reATPChangeSource ===true)? true :this.isCompleteCart : true;
      finalSolutions = JSON.parse(JSON.stringify(selectedSol));

      // this.shippingAddress = this.productService.getDefaulAddress();

      this.addtoCartBeforeOpen(this.selectedSolution?.solutionEntries);
    }
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
        id: "confirmationModal",
        class: "modal-md modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }

  onHideModal(id?: any) {
    if(this.atpResponseData?.solution) {
        let payload:any = {
          "shipTo": this.userInfoCust?.orgUnit?.uid,
          "soldTo": this.userInfoCust?.orgUnit?.soldTo,
          "oneTimeShippingAddress": this.shippingAddress?.oneTimeShippingAddress || this.shippingAddress?.isOneTimeShipTo || false,
          "erpOrderID": this.atpResponseData?.solution[0]?.erpOrderID,
          "erpOrderLineNumber": this.atpResponseData?.solution[0]?.erpOrderLineNumber,
          "productCode": this.productNumber,
          "hybrisOrderNumber": this.atpResponseData?.hybrisOrderNumber,
          "hybrisLineNumber": this.atpResponseData?.hybrisLineNumber,
        }
        
        this.spinnerLoading = true;
        this.productService.removeATPCartEntry(payload).subscribe((resp)=>{
          if(resp.status === "200" || resp.status === 200){
            if(resp.body.status === "SUCCESS"){
            this.spinnerLoading = false;
            this.storageService.removeItem("atpCart");
           
            }
          }
         
        });
    }
    this.modalService.hide(id);
  }
 

  rowSelected(item: any, selectedIndex: number) {
    this.data.forEach((row: any, index) => {
      row.selected = false;
      if (selectedIndex == index && item.state == true) {
        row.selected = item.state;

        this.storageService.setItem("solutionsValue", item.value);
      } else {
        row.selected = false;
      }
    });
  }
  checkBoxChange(ev: any) {
    this.aptCheckEntrie.map((item: any) => {
      if (item.productCode == ev.value) {
        item.selected = !item.selected;
      }
    });
    this.disableAddCart =
      this.aptCheckEntrie.filter((item: any) => item.selected == true) == 0;
  }

  checkBoxChangeSelect(item: any, selectedIndex: number) {
    this.aptCheckEntrie.forEach((row: any, index: number) => {
      row.selected = false;
      if (selectedIndex == index && item.state == true) {
        row.selected = item.state;
      } else {
        row.selected = false;
      }
    });
    this.disableAddCart = this.aptCheckEntrie.filter(
      (item: any) => (item.selected == true) == true
    );
  }

  spinnerLoading = false;
  addtoCartBeforeOpen(sol?: any) {
    sol.forEach((element: any) => {
      element.selected = true;
      delete element.ShowCheckbox;
    });

  
    
    const entriesItems: any = [];
    let entriesData: any = this.initialState;

    let lfItems: any[] = [];
    //debugger
    // Iterate through the solutions and create an item for each solution
    // sol.forEach((element: any) => {
   
      const item = {
        dyeLot: this.feetYardFormData?.dye,
        feet: Number(this.feetYardFormData?.feet),
        inches: Number(this.feetYardFormData?.inches),
        productCode: sol && sol[0]?.substitutionSKU ? sol[0]?.substitutionSKU : this.productNumber,
        productPriceData: this.initialState.priceDetails,
        requestedUOM:
          entriesData?.aptCheckEntrie?.length !== 0
            ? "LF"
            : this.feetYardFormData?.unit,
        requestedQty:
          this.multicutIndicator === true
            ? "1"
            : this.feetYardFormData?.requestedQty
            ? this.feetYardFormData?.requestedQty
            : this.feetYardFormData?.feet,
        maxFeet: this.feetYardFormData?.maxFeet,
        maxInches: this.feetYardFormData?.maxInches,
        minFeet: this.feetYardFormData?.minFeet,
        minInches: this.feetYardFormData?.minInches,
        rollPrices: true,
        solution: sol,
         shippingCondition:
        this.userInfoCust.isCustomer  || this.userInfoCust.isSalesPerson || this.userInfoCust.isSalesOps ? this.shippingOptions?.originalDefaultShippingMethod || this.shippingOptions?.defaultShippingMethod ||
        "":this.shippingOptions?.defaultShippingMethod  || "",
        shipVia:
          this.shippingOptions?.defaultShipVia ||
          this.shippingOptions?.shipVia ||
          "",
        shippingWarehouse:
          this.shippingOptions?.defaultShippingWarehouse || this.shippingOptions?.shippingWarehouse || "",
        incoTerms:
          this.shippingOptions?.defaultIncoTerms ||
          this.shippingOptions?.incoTerms ||
          "",

        requestedDeliveryDate: this.shippingAddress?.rdd
          ? this.datePipe.transform(this.shippingAddress?.rdd, "MM/dd/yyyy")
          : this.initialState?.rdd,
        atpUniqueId: this.atpUniqueId ? this.atpUniqueId : "",
        ...(this.atpFromCart === true
          ? { reInspect: entriesData?.isReinspect || false }
          : this.shippingOptions?.replacementOrder == true
          ? { reInspect: true }
          : {}),
        sameDyeLot: this.sameDyeLot,
        viewInventory: this.viewInventory,
        requestedPrice:this.requestedPrice,
        priceComment:this.priceComment,
        noCharge:this.noCharge,
        noChargeReasonCode:this.noChargeReasonCode,
        noFreight:this.noFreight,
        sideMark:this.sideMark,
        //  shipComplete: this.lineShipComplete,
        ...(this.atpFromCart === true
          ? { reInspect: entriesData?.isReinspect || false }
          : this.shippingOptions?.replacementOrder == true
          ? { reInspect: true }
          : {}),
      };

      // if (item.requestedUOM === "LF") {
      //   lfItems.push(item);
      // } else {
      entriesItems.push(item);
   

    this.spinnerLoading = true;
    // let entriesData: any = this.modalService.config.initialState;
    let phoneNumber =
      this.shippingAddress?.Phone ||
      this.shippingAddress?.phoneNumber ||
      "1234567890";
    phoneNumber = phoneNumber
      .replace("(", "")
      .replace(")", "")
      .replace(/ /g, "");
    // this.productService.createCart().subscribe((res: any) => {
    const payLoad: any = {
      addressCity:  this.shippingAddress?.oneTimeShippingAddress ||  this.shippingAddress?.oneTimeShippingFlag ||
      this.shippingAddress?.isOneTimeShipTo ?  this.shippingAddress?.city || this.shippingAddress?.addressCity  || this.shippingAddress?.town || "": this.shippingAddress?.addressCity || this.shippingAddress?.city || this.shippingAddress?.town|| "",
      addressCountry:
        this.shippingAddress?.oneTimeShippingAddress ||  this.shippingAddress?.oneTimeShippingFlag ||
        this.shippingAddress?.isOneTimeShipTo
          ?  this.shippingAddress?.addressCountry || this.shippingAddress.country?.isocode 
          : this.shippingAddress.country || this.shippingAddress?.addressCountry,
      addressLine1: this.shippingAddress?.oneTimeShippingAddress ||  this.shippingAddress?.oneTimeShippingFlag ||
                this.shippingAddress?.isOneTimeShipTo ? this.shippingAddress?.streetAddress || this.shippingAddress?.addressLine1 || this.shippingAddress?.line1 :this.shippingAddress?.addressLine1 || this.shippingAddress?.line1 || this.shippingAddress?.streetAddress,
      addressLine2: this.shippingAddress?.oneTimeShippingAddress 
                || this.shippingAddress?.oneTimeShippingFlag || this.shippingAddress?.isOneTimeShipTo ? this.shippingAddress?.streetAddress2 || this.shippingAddress?.addressLine2 || this.shippingAddress?.line2 :this.shippingAddress?.addressLine2 || this.shippingAddress?.line2 || this.shippingAddress?.streetAddress2,
      addressName: this.shippingAddress?.addressName || this.shippingAddress?.companyName,
      addressPostalCode:
        this.shippingAddress?.addressPostalCode ||
        this.shippingAddress?.postalCode ||
        "",
      addressState:(this.shippingAddress?.oneTimeShippingAddress ||
          this.shippingAddress?.isOneTimeShipTo) ?
          (this.shippingAddress?.region?.isocodeShort ||
            this.shippingAddress?.addressState ||
            this.shippingAddress?.region ||
            "") :
          (this.shippingAddress?.addressState ||
          this.shippingAddress?.region ||
          ""),
      carrierNumber: this.shippingAddress?.carrierNumber,
      satellite: this.shippingAddress?.satellite?.code,
      claimNumber: this.shippingAddress?.claimNumber
        ? this.shippingAddress?.claimNumber
        : "",
      hasClaimSubmitted:  this.hasClaimSubmitted ? (this.hasClaimSubmitted == true) : (this.shippingAddress?.hasClaimSubmitted
        ? this.shippingAddress?.hasClaimSubmitted
        : false),
      invoiceNumber: this.shippingAddress?.invoiceNumber
        ? this.shippingAddress?.invoiceNumber
        : "",
      shipToUnit: this.shippingAddress?.oneTimeShippingAddress || this.shippingAddress?.isOneTimeShipTo
        ? "" : this.shippingAddressId || this.shippingAddress?.id || this.uid,
      item: entriesItems,
      noPrice: this.shippingAddress?.noPrice
        ? this.shippingAddress?.noPrice
        : true,
      oneTimeShippingAddress:
        this.shippingAddress?.oneTimeShippingAddress ||
        this.shippingAddress?.isOneTimeShipTo ||
        false,
      replacementOrderNumber: this.shippingAddress?.orderNumber
        ? this.shippingAddress?.orderNumber
        : "",
      pdpProductCode: sol && sol[0]?.substitutionSKU ? sol[0]?.substitutionSKU : this.productNumber,
      phoneNumber: phoneNumber,
      purchaseOrderNumber: this.shippingAddress?.purchaseOrderNumber
        ? this.shippingAddress?.purchaseOrderNumber
        : "",
      replacementOrder:
        this.cartData?.replacementOrder ||
        this.shippingAddress?.replacementOrder ||
        false,
      replacementReason: this.shippingAddress?.replacementReason
        ? this.shippingAddress?.replacementReason
        : "",
      requestedDeliveryDate: this.shippingAddress?.rdd
        ? this.datePipe.transform(this.shippingAddress?.rdd, "MM/dd/yyyy")
        : this.initialState?.rdd,
        orderPlacedSite: "xchange",
      sampleProduct: this.shippingAddress?.sampleProduct
        ? this.shippingAddress?.sampleProduct
        : false,
      sampleType: this.shippingAddress?.sampleType
        ? this.shippingAddress?.sampleType
        : "",
      viewInventory: this.viewInventory,
      poNumber:this.poNumber,
      shipComplete: this.lineShipComplete,
      ...(
        { quoteNumber: this.cartQuoteNumber || "" }
        ),
      // shippingCondition:
      //   this.shippingAddress?.defaultShippingCondition ||
      //   this.shippingAddress?.defaultShippingMethod ||
      //   "",
      // shipVia: this.shippingAddress?.defaultShipVia || "",
      // shippingWarehouse: this.shippingAddress?.defaultShippingWarehouse || "",

      // incoTerms: this.shippingAddress?.defaultIncoTerms || "",
      orderSamples: this.shippingAddress?.orderSamples
        ? this.shippingAddress?.orderSamples
        : [],
      isMultiCut: false,
      ...(this.atpFromCart === true
        ? { reInspect: entriesData?.isReinspect || false }
        : this.shippingOptions?.replacementOrder == true
        ? { reInspect: true }
        : {}),
      soldTo: this.isShipToUser ? this.soldToAccount : this.uid,
      shippingInfo: this.shippingAddress?.oneTimeShippingAddress || this.shippingAddress?.isOneTimeShipTo
          ? {
            acceptDate: this.shippingAddress?.lastestacceptDate
              ? this.datePipe.transform(
                  this.shippingAddress?.lastestacceptDate,
                  "MM/dd/yyyy"
                )
              : ( this.shippingAddress?.acceptDate
                ? this.datePipe.transform(
                    this.shippingAddress?.acceptDate,
                    "MM/dd/yyyy"
                  ) : ""),
            apptNeeded: this.shippingAddress?.appoinment || this.shippingAddress?.apptNeeded,
            forkLiftRequired: this.shippingAddress?.accomodate || this.shippingAddress?.forkLiftRequired,
            jobSiteDelivery: this.shippingAddress?.jobsiteDelivery || this.shippingAddress?.jobSiteDelivery,
            largestTruckSize: this.shippingAddress?.truckSize || this.shippingAddress?.largestTruckSize || "",
            liftGateAndPallet: this.shippingAddress?.liftGateAndPallet,
            loadingDock: this.shippingAddress?.loading || this.shippingAddress?.loadingDock,
            location: this.shippingAddress?.Location || this.shippingAddress?.location || "",
            palletJack: this.shippingAddress?.palletJack,
            poleLiftRequired: this.shippingAddress?.poleLift || this.shippingAddress?.poleLiftRequired,
            requireNotification: this.shippingAddress?.notification || this.shippingAddress?.requireNotification,
            siteContactName: this.shippingAddress?.ContactName || this.shippingAddress?.siteContactName || "",
            siteContactPhone: this.shippingAddress?.Phone || this.shippingAddress?.siteContactPhone || "",
            storeNumber: this.shippingAddress?.storeNumber || "",
          }
        :  (!this.shippingAddress?.isOneTimeShipTo)
        ? ""
        : this.cartDataForShippingInfo.shippingInfo,
      camsOrderNumber: this.camsOrderNumber
    };
    if (
      entriesData?.aptCheckEntrie?.length != 0 &&
      this.viewInventory === false
    ) {
      payLoad.item = [
        {
          dyeLot: "",
          feet: 0,
          inches: 0,
          maxFeet: 0,
          maxInches: 0,
          minFeet: 0,
          minInches: 0,
          productCode: sol && sol[0]?.substitutionSKU ? sol[0]?.substitutionSKU : this.productNumber,
          requestedQty: this.feetYardFormData?.requestedQty,
          requestedUOM: "LF",
          rollPrices: true,
          solution: sol,
          productPriceData: this.initialState.priceDetails,
          shippingCondition:
        this.userInfoCust.isCustomer  || this.userInfoCust.isSalesPerson || this.userInfoCust.isSalesOps ? this.shippingOptions?.originalDefaultShippingMethod || this.shippingOptions?.defaultShippingMethod ||
        "":this.shippingOptions?.defaultShippingMethod  || "",
          shipVia: this.shippingOptions?.defaultShipVia || "",
          shippingWarehouse:
            this.shippingOptions?.defaultShippingWarehouse || "",

          incoTerms: this.shippingOptions?.defaultIncoTerms || "",
          requestedDeliveryDate: this.shippingAddress?.rdd
            ? this.datePipe.transform(this.shippingAddress?.rdd, "MM/dd/yyyy")
            : this.initialState?.rdd,
          atpUniqueId: this.atpUniqueId ? this.atpUniqueId : "",
          ...(this.atpFromCart === true
            ? { reInspect: entriesData?.isReinspect || false }
            : this.shippingOptions?.replacementOrder == true
            ? { reInspect: true }
            : {}),
          viewInventory: this.viewInventory,
          shipComplete: this.lineShipComplete,
          sameDyeLot: this.initialState?.sameDyeLot,
          requestedPrice:this.requestedPrice,
          priceComment:this.priceComment,
          noCharge:this.noCharge,
          noChargeReasonCode:this.noChargeReasonCode,
          noFreight:this.noFreight,
          sideMark: this.sideMark,
          reInspect: entriesData?.isReinspect || false
        },
      ];
      payLoad.isMultiCut = true;
     
    }
    

    if (entriesData?.isQuoteCart) {
      payLoad.isQuoteCart = true;
    }
    payLoad.reAtp = this.atpFromCart;
    payLoad.termsCode = this.initialState?.termsCode || "";
    payLoad.comment=this.initialState?.comment || "";
    payLoad.internalComment=this.initialState?.internalComment || "";
    payLoad.poNumber=this.initialState?.poNumber ||"";
    payLoad.marketSegment=this.initialState?.marketSegment || "";
    payLoad.jobLocation=this.initialState?.jobLocation || "";
    payLoad.submittedFor=this.initialState?.submittedFor || "";
    payLoad.endUserCode=this.initialState?.endUserCode || "";
    payLoad.creUserCode=this.initialState?.creUserCode || "";
    payLoad.gpoUserCode=this.initialState?.gpoUserCode || "";
    payLoad.adUserCode=this.initialState?.adUserCode || "";
    payLoad.deliveryGrouping=this.initialState?.deliveryGrouping || false;
    let cartNumber = this.camsCartId || this.cartData?.code || null;
    payLoad.modelRoom=this.initialState?.modelRoom || "";
    if((payLoad?.oneTimeShippingAddress || this.shippingAddress?.isOneTimeShipTo) && payLoad?.shippingInfo==""){
      payLoad.shippingInfo = this.cartDataForShippingInfo?.shippingInfo || this.shippingInfoFromDefaultAddress
    }
    if((payLoad?.oneTimeShippingAddress || this.shippingAddress?.isOneTimeShipTo) && (this.shippingOptions?.defaultShippingCondition ==='PA' ||
      this.shippingOptions?.defaultShippingMethod  === 'PA')){
        payLoad.shippingInfo = [];
    }
    if(this.initialState?.bundleProduct){
      payLoad.bundleProduct = this.initialState?.bundleProduct;
    }
    // this.productService.progressShow('addToCart', 'addToCartId');
    this.productService
      .addToCart(this.userService.getUserEmail().toLowerCase(), cartNumber, payLoad)
      .subscribe(
        (res) => {
          this.productService.progressHide('addToCartId');
          this.spinnerLoading = false;
          localStorage.setItem("selectedProductTab", "");
          if (res?.body?.errorMessages || res?.body?.messages?.length) {
            if (
              res?.body?.errorMessages === "Error" ||
              res?.body?.messages[0]?.status === "Error" ||
              res?.body?.messages[0]?.status === "Failed" ||
              res?.body?.messages[1]?.status === "Error"
            ) {
              this.failedCase(res?.body?.messages[0]?.message);
            } else {
              if (this.atpFromCart && this.isCompleteCart) {
                let entryNumber: any =
                  this.modalService?.config?.initialState?.["entryLength"];
                entryNumber = entryNumber + 1;
                this.atpCheckFromCart(entryNumber);
                this.successCase(res);
              } else {
                this.successCase(res);
              }
            }
          } else {
            if (this.atpFromCart && this.isCompleteCart) {
              let entryNumber: any =
                this.modalService?.config?.initialState?.["entryLength"];
              entryNumber = entryNumber + 1;
              this.atpCheckFromCart(entryNumber);
              this.successCase(res);
            } else {
              this.successCase(res);
            }
          }
        },
        (err: any) => {
          this.productService.progressHide('addToCartId');
          this.spinnerLoading = false;
          this.addtoCartFailed = true;
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }
      );
    // });
  }

  failedCase(msg?: any) {
    // this.spinnerLoading = false;
    this.addtoCartFailed = true;
    this.scrollPageToTop();
    this.addtoCartErrorMessage = msg;
    this.scrollPageToTop();
  }
  @ViewChild("scrollToTop", { read: ElementRef }) scrollToTop: any;
  scrollPageToTop() {
    this.scrollToTop?.nativeElement?.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest",
    });
  }
  successCase(res?: any) {
    // this.modalService.hide("AddCompanionProductsComponent");
    let cartNumber = this.cartData?.code || null;
    this.spinnerLoading = false;
    // if (cartNumber == null) {
    //   let cartData = {
    //     code: res.body?.cartNumber,
    //     entries: res.body?.entries,
    //   };
    //   this.cartData = cartData;
    //   // this.storageService.setItem("miniCartCount", cartData);
    // }
    this.storageService.getItem("uid").subscribe((res) => {
      this.uid = res;
    });
    this.storageService.removeItem("atpCart");
    this.atpResponseData=[];
    this.productService.getMiniCartData(this.uid).subscribe((res) => {
      this.cartData = res?.body || res;
      this.storageService.setItem("miniCartCount", this.cartData);

      const data: any = this.modalService.config.initialState;
      const initialState: ModalOptions = {
        initialState: {
          // Data to  popup
          cartData: data?.cartData,
          postOrder: false,
          sameDyeLot: this.initialState?.sameDyeLot,
        },
      };
      if (!this.atpFromCart) {
        this.modalRef = this.modalService.show(
          XchangeAddAccessoriesLightboxComponent,
          Object.assign(initialState, {
            class:
              "modal-xl modal-dialog-centered xchangeaddaccessorieslightbox",
            backdrop: "static",
            keyboard: false,
          })
        );
        this.bsModalRef.content.type = 2;
      }
      this.modalService.hide("changeShippingOptionsModal");
      this.modalService.hide("AddCompanionProductsComponent");
    //  this.modalService.hide();
    });
    // this.modalService.hide("changeShippingOptionsModal");
    // this.modalService.hide("AddCompanionProductsComponent");
    // this.modalService.hide();
  }

  //getProductMedias
  getProductMedias(productCode: any) {
    this.productService.getProductMedias(productCode).subscribe((res: any) => {
      this.solutions[0].img = res?.body?.productImageURL;
    });
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
  continueFromOrders() {
    const data: any = this.modalService.config.initialState;

    const payload = {
      orderCode: this.productNumber,
      lineItems: [
        {
          lineNumber: data?.selectedProduct?.entryNumber,
          productCode: data?.selectedProduct?.product?.code,
          solution: this.selectedSolution.solutionEntries,
        },
      ],
    };
    this.productService.continueFromOrdres(payload).subscribe((res: any) => {
      this.onHideModal();
    });
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
  // handleColumnToggle = (evt: any) => {
  //   this.bkcolumns = this.bkcolumns.map((item) => {
  //     const isLenghtColumn =
  //       item.key === "rollAssignedInSF" || item.key === "rollAssignedInSY";
  //     return {
  //       ...item,
  //       key: isLenghtColumn
  //         ? evt
  //           ? "rollAssignedInSY"
  //           : "rollAssignedInSF"
  //         : item.key,
  //       title: isLenghtColumn
  //         ? evt
  //           ? "Length(SqFt)"
  //           : "Length(SqYd)"
  //         : item.title,
  //     };
  //   });
  //   this.columns = this.columns.map((item) => {
  //     const isLenghtColumn =
  //       item.key === "rollAssignedInSF" || item.key === "rollAssignedInSY";
  //     return {
  //       ...item,
  //       key: isLenghtColumn
  //         ? evt
  //           ? "rollAssignedInSY"
  //           : "rollAssignedInSF"
  //         : item.key,
  //       title: isLenghtColumn
  //         ? evt
  //           ? "Length(SqFt)"
  //           : "Length(SqYd)"
  //         : item.title,
  //     };
  //   });
  // };

  handleMultiSelect(evt: any, row: any, balanceTemplate: TemplateRef<any>) {
    const isChecked = evt?.target?.checked;
    let solutionEntries = [
      ...(this.selectedSolution?.solutionEntries || []),
    ].filter((item: any) => item.solutionType !== "BACKORDER");
    if (isChecked) {
      solutionEntries.push(...row.solutionEntries);
      this.selectedSolution = {
        solutionEntries,
      };
    } else {
      this.selectedSolution = {
        solutionEntries: solutionEntries.filter(
          (item) => item.solutionID !== row.solutionID
        ),
      };
    }
    this.balance = row.solutionEntries[0].saving;
    if (this.balance > 0) {
      this.modalRef = this.modalService.show(balanceTemplate, {
        id: "balanceModal",
        class: "modal-md modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      });
    }
  }

  openProgressModal(data = {}, size: any = "md") {
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
        id: "progressModal",
        class: `modal-${size} modal-dialog-centered 123`,
      })
    );
  }

  getPlantCode(InvWhse:any){
    let warehouseData =  SAP_CAMS_PLAN.filter((element: any) => {
      if (element.cams_plant == InvWhse) {
        return element;
      }
    });
    return warehouseData.length > 0 && warehouseData[0].sap_plant || "";
  }

  get solutionKeys() {
  return Object.keys(this.availableSolutions || {});
}

getSolutionEntries(key: string) {
  return this.availableSolutions?.[key]?.[0]?.solutionEntries || [];
}
}
