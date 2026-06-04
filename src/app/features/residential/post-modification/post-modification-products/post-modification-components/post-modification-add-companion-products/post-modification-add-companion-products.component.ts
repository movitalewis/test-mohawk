import { DatePipe } from "@angular/common";
import {
  AfterViewChecked,
  Component,
  DebugElement,
  ElementRef,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { Router } from "@angular/router";
import { ElementContainer } from "html2canvas/dist/types/dom/element-container";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { Config, Columns, DefaultConfig } from "ngx-easy-table";
import { CartComponent } from "src/app/features/commercial/cart/pages/cart/cart.component";
import { ApiService } from "src/app/features/http-services/api.service";
import { StorageService } from "src/app/features/http-services/storage.service";
import { XchangeAddAccessoriesLightboxComponent } from "src/app/features/shared/components/xchange-add-accessories-lightbox/xchange-add-accessories-lightbox.component";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { PostModificationProductService } from "../../post-modification-pages/post-modification-services/post-modification-product.service";
import { ConfirmationDialogComponent } from "src/app/features/shared/components/confirmation-dialog/confirmation-dialog.component";

@Component({
    selector: "residential-post-modification-add-companion-products",
    templateUrl: "./post-modification-add-companion-products.component.html",
    styleUrls: ["./post-modification-add-companion-products.component.scss"],
    standalone: false
})
export class PostModificationAddCompanionProductsComponent
  implements OnInit, AfterViewChecked
{
  // @ViewChild("toggleLengthTemplate", { static: false })
  // toggleLengthTemplate!: TemplateRef<any>;
  modalRef?: BsModalRef;
  disableAddCart = false;
  @Input() pdpdata: any;
  @Input() solutions: any = [];
  @Input() openFromaddressModal = false;
  @Input() showContinue = false;
  @Input() quantityChangeModal = false;
  atpCheckFromCart: Function = () => {};
  toggleLengthColumn: boolean = false;
  aptCheckEntrie: any = [];
  productNumber: string;
  addtoCartErrorMessage: any = [];
  oneTimeShippingFlag: boolean = false;
  atpUserUom: any = "";
  atpUserQty: any = "";
  backorderSolutions: any = [];
  availableSolutions: any = [];
  isLoading = false;
  userSelectedQty: any;
  userSelectedUOM: any;
  selectedPDPTab: any = "";
  selectedColor: any;
  savingLabel: boolean = false;
  selectedSolution: any;
  forReshippingReATP: boolean = false;
  fromViewInventory: boolean = false;
  solSubProductType: any;

  columns: Columns[] = [
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
    { key: "savings", title: "Savings" },
    { key: "estimatedDeliveryDate", title: "Material Availability Date" },
  ];
  columnsRoll: Columns[] = [
    { key: "action", title: "" },
    { key: "type", title: "Type" },
    { key: "lengthLF", title: "Length(LF)" },
    { key: "dyeLot", title: "Dye Lot" },
    { key: "rollID", title: "Roll # " },
    { key: "plant", title: "Plant" },
    { key: "savings", title: "Savings" },
    { key: "estimatedDeliveryDate", title: "Material Availability Date" },
  ];
  bkcolumns: Columns[] = [
    { key: "action", title: "" },
    { key: "type", title: "Type" },
    { key: "lengthLF", title: "Length(LF)" },
    {
      key: "rollAssignedInSF",
      title: "Length(SqYd)",
      // cssClass: { includeHeader: true, name: "alignToggle" },
      // headerActionTemplate: this.toggleLengthTemplate,
    },
    // { key: "minsize", title: "Min. Size" },
    // { key: "maxsize", title: "Max. Size" },
    { key: "estimatedProdDate", title: "Estimated Production Date" },
  ];
  columnsPad: Columns[] = [
    { key: "action", title: "" },
    { key: "type", title: "Type" },
    { key: "lengthLF", title: "Length(SqYd)" },
    { key: "dyeLot", title: "Dye Lot" },
    { key: "rollID", title: "Roll # " },
    { key: "plant", title: "Plant" },
    { key: "savings", title: "Savings" },
    { key: "estimatedDeliveryDate", title: "Material Availability Date" },
  ];
  bkcolumnsPad: Columns[] = [
    { key: "action", title: "" },
    { key: "type", title: "Type" },
    {
      key: "rollAssignedInSF",
      title: "Length(SqYd)",
    },
    { key: "estimatedProdDate", title: "Estimated Production Date" },
  ];
  bkcolumnsRoll: Columns[] = [
    { key: "action", title: "" },
    { key: "type", title: "Type" },
    { key: "orderQty", title: "Order Qty" },
    // { key: "type", title: "Type" },
    //   { key: "rollAssignedInSY", title: "Order Qty(LF)" },
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
  constructor(
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    public storageService: StorageService,
    public productService: PostModificationProductService,
    private userService: UserService,
    private router: Router,
    private apiService: ApiService,
    private datePipe: DatePipe
  ) {
    router.events.subscribe((url: any) => {});
    var n = router.url.lastIndexOf("/");
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
  isCustomer: boolean = false;
  isSalesPerson:boolean = false;
  sizeBackingData: any;
  atpCheckData: any;
  cartData: any;
  shippingCondition: any;
  shippingConditionDesc: any;
  feetYardFormData: any;
  multicutIndicator: boolean = false;
  viewInventory: boolean = false;
  uid: any;
  shippingAddressId: any;
  shippingConditions:any;
  solutionType: any = "";
  initialData: any;
  originalDefaultShippingMethod:any;
  ngOnInit(): void {
    this.cartData = this.storageService.cartData;

    const data: any = this.modalService.config.initialState;
    // debugger
    this.initialData = this.modalService.config.initialState;
    this.shippingConditions = this.initialData.shippingConditions;
    this.selectedPDPTab = data?.selectedPDPTab;
    this.forReshippingReATP = this.initialData?.forShippingReATP;
    this.shippingCondition = data?.shippingConditions?.defaultShippingCondition;
    this.shippingConditionDesc =
      data?.shippingConditions?.defaultShippingConditionDesc;
    this.getProductMedias(
      data?.solutions[0]?.code || data?.solutions[0]?.product?.code
    );
    this.shippingAddress = data?.shippingAddress;
    // debugger

    this.feetYardFormData = data?.feetyardForm || {};
    this.multicutIndicator = data?.multiCutIndication || false;
    this.viewInventory = data?.viewInventory || false;
    this.solutionType = data?.feetyardForm?.unit || "";
    this.oneTimeShippingFlag = data?.oneTimeShippingFlag || false;
    this.solSubProductType = data?.solutions[0]?.subProductType;
    this.configuration = { ...DefaultConfig };
    this.configuration.checkboxes = false;
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;
    this.configuration.isLoading = true;
    this.originalDefaultShippingMethod =data?.originalDefaultShippingMethod || "";
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
    });
    this.storageService.getItem("miniCartCount").subscribe((res: any) => {
      if (this.shippingAddressId === "" || this.shippingAddressId === null) {
        this.shippingAddressId = res.shipTo;
      }
    });

    this.userService.getCurrentUserDetail().subscribe((res: any) => {
      this.isCustomer = res?.body?.isCustomer;
      this.isSalesPerson = res?.body?.isSalesPerson || res?.body?.isSalesOps;
      this.uid = res.body.orgUnit?.uid;
      this.checkAtp();
    });
    this.columns = this.columns.filter((column: any) => {
      return column.title === "Savings" ? !this.fromViewInventory : true;
    });
    this.columnsRoll = this.columnsRoll.filter((column: any) => {
      return column.title === "Savings" ? !this.fromViewInventory : true;
    });
  }
  requestedUOMproductType: string = "";
  checkAtp() {
    this.isLoading = true;
    const data: any = this.modalService.config.initialState;

    this.requestedUOMproductType = data.productType;

    let entriesData: any = this.modalService?.config?.initialState;
    this.fromViewInventory = data.viewInventory;
    let currentDate = this.datePipe.transform(new Date(), "MM/dd/yyyy");
    const payload: any = {
      atpUniqueId: data.atpUniqueId,
      ...(this.initialData.reInspect
        ? { reInspect: this.initialData?.reInspect || data?.reInspect || false }
        : data?.orderDetails?.replacementOrder == true ||
          data?.orderData?.replacementOrder == true
        ? { reInspect: true }
        : {}),
      rollPrice: this.initialData.productPriceDetails?.rollPriceSY,
      cutPrice: this.initialData.productPriceDetails?.cutPriceSY,
      orderCode: data?.orderDetails?.orderCode,
      multiCutIndication: this.multicutIndicator,
      viewInventory: this.viewInventory, //this.feetYardFormData?.maxFeet != "" ? true : false,
      zipCode:
        this.shippingAddress?.postalCode || this.shippingAddress?.zipCode,
      // defaultAddres?.addressPostalCode || "30144"
      oneTimeShippingAddress:
        this.shippingAddress?.oneTimeShippingAddress ||
        this.shippingAddress?.isOneTimeShipTo ||
        false,
      shippingCondition: this.forReshippingReATP
        ? this.isCustomer  || this.isSalesPerson  ? this.originalDefaultShippingMethod || data.shippingCondition || "":data.shippingCondition || ""
        : this.isCustomer  || this.isSalesPerson ? this?.originalDefaultShippingMethod || data?.shippingConditions?.defaultShippingCondition:data?.shippingConditions?.defaultShippingCondition,
      
      incoTerms: this.forReshippingReATP
        ? data.incoTerms || ""
        : data?.shippingConditions?.defaultIncoTerms,
      shippingWarehouse: this.forReshippingReATP
        ? data?.shippingWarehouse || ""
        : data?.shippingConditions?.defaultShippingWarehouse,
      requestedDeliveryDate: currentDate || "",
      shipVia: this.forReshippingReATP
        ? data?.shipVia || ""
        : data?.shippingConditions?.defaultShipVia,
      ...(data.specifiedDyeLot === true
        ? { specifiedDyeLot: data.specifiedDyeLot }
        : {}),
      entries: [
        {
          dyeLot: this.feetYardFormData?.dyeLot || "",
          feet: Number(this.feetYardFormData?.feet) || "",
          inches: Number(this.feetYardFormData?.inches) || "",
          productCode:
            this.feetYardFormData?.productCode || this.productNumber || "",
          requestUOM: this.feetYardFormData?.unit || "",
          // this.feetYardFormData?.unit
          requestedQty: this.feetYardFormData?.requestedQty || "",
          maxFeet: this.feetYardFormData?.maxFeet || "",
          maxInches: this.feetYardFormData?.maxInches || "",
          minFeet: this.feetYardFormData?.minFeet || "",
          minInches: this.feetYardFormData?.minInches || "",
        },
      ],
      shipTo: this.shippingAddressId
        ? this.shippingAddressId
        : this.shippingAddress?.id || this.uid,
      // this.shippingAddress?.shippingAddressID
      //   ? this.shippingAddress?.shippingAddressID
      //   : this.shippingAddress?.shippingAddressID == ""
      //   ? this.shippingAddress?.shippingAddressID
      //   : this.shippingAddress?.id,
      shippingAddressID: this.shippingAddressId
        ? this.shippingAddressId
        : this.shippingAddress.id || this.uid,

      reqDeliveryDate: currentDate || "",
      soldTo: this.uid,
      sameDyeLot: data?.lineProduct?.sameDyeLot || data?.sameDyeLot,
    };

    //debugger
    if (
      entriesData.aptCheckEntrie !== undefined &&
      entriesData?.aptCheckEntrie?.length != 0
    ) {
      payload.entries = entriesData?.aptCheckEntrie;
      payload.multiCutIndication = entriesData?.multiCutIndication;
      payload.sameDyeLot = this.initialData.sameDyeLot;
    }

    this.productService.checkAvailabilityForProduct(payload).subscribe({
      next: (result) => {
        if (
          result &&
          result.body != undefined &&
          result?.body?.solution?.length
        ) {
          // this.columns.map((item: any) => {
          //   if (item.key === "rollAssignedInSY") {
          //     item.headerActionTemplate = this.toggleLengthTemplate;
          //   }
          // });

          this.requestedOrderQuantityLabel = `
          ${this.feetYardFormData?.requestedQty} ${this.feetYardFormData?.unit} 
        `;

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
          // this.availableSolutions = availableSolutions.reduce(
          //   (acc: any, item: any) => {
          //     const index = acc.findIndex(
          //       (entry: any) => entry.solutionID === item.solutionID
          //     );

          //     if (index > -1) {
          //       acc[index].solutionEntries.push(item);
          //     } else {
          //       acc.push({
          //         solutionID: item.solutionID,
          //         solutionEntries: [item],
          //       });
          //     }
          //     return acc;
          //   },
          //   []
          // );
          // this.availableSolutions.forEach((item: any) => {
          //   let feetVal = 0;
          //   let inchToFeet = 0;
          //   item.solutionEntries.forEach((solution: any) => {
          //     let rollAssignedInFeet = solution.rollAssignedInFeet;
          //     rollAssignedInFeet = rollAssignedInFeet.replace("'", "");
          //     rollAssignedInFeet = rollAssignedInFeet.replace('"', "");
          //     let rollFetInches = rollAssignedInFeet.split(" ");
          //     feetVal = feetVal + Number(rollFetInches[0]);
          //     inchToFeet = inchToFeet + Number(rollFetInches[1]);
          //   });
          //   let coverted = String(
          //     feetVal + Number((inchToFeet / 12).toFixed(2))
          //   );
          //   coverted = coverted.replace(".", "' ");
          //   item.convertedRollAssignedInFeet = coverted + "'";
          // });
          this.availableSolutions = availableSolutions.reduce(
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

          this.availableSolutions.forEach((item: any) => {
            let feetVal = 0;
            let inchToFeet = 0;
            item.solutionEntries.forEach((solution: any) => {
              let rollAssignedInFeet = solution.rollAssignedInFeet;
              rollAssignedInFeet = rollAssignedInFeet.replace("'", "");
              rollAssignedInFeet = rollAssignedInFeet.replace('"', "");
              let rollFetInches = rollAssignedInFeet.split(" ");
              feetVal = feetVal + Number(rollFetInches[0]);
              inchToFeet = inchToFeet + Number(rollFetInches[1]);
            });

            let coverted, inches;
            if (inchToFeet < 12) {
              inches = inchToFeet;
              coverted = feetVal;
            } else {
              coverted = String(feetVal + Math.floor(inchToFeet / 12));
              inches = inchToFeet % 12;
            }

            item.convertedRollAssignedInFeet =
              coverted + "'" + " " + inches + "''";
          });
          // this.columns = this.columns.filter((column: any) => {
          //   return column.title === "Savings" ? !this.fromViewInventory : true;
          // });
          // this.columnsRoll = this.columnsRoll.filter((column: any) => {
          //   return column.title === "Savings" ? !this.fromViewInventory : true;
          // });
          this.configuration.isLoading = false;
          this.isLoading = false;
          this.spinnerLoading = false;
        } else {
          this.aptCheckEntrie = [];
          this.configuration.isLoading = false;
          this.isLoading = false;

          this.failedCase({
            body: {
              messages: [
                {
                  message:
                    result?.status == 200
                      ? result?.body?.messages.length > 0
                        ? result?.body?.messages[0].message
                        : result?.body?.error?.message
                      : result?.body?.error,
                },
              ],
            },
          });
        }
      },
    });
  }
  addToCart() {
    if (
      this.initialData?.orderDetails?.sampleOrder === true &&
      this.initialData?.orderDetails?.merchandisingProduct === false
    ) {
      this.openConfirmationModal({
        title: "Restriction Alert",
        content: "Sample products cannot be added to standard orders.",
        primaryActionLabel: "Back to Order Details",
        secondaryActionLabel: "",
        onPrimaryAction: () => {
          this.modalService.hide("confirmationModal");
          this.router.navigate([
            "/residential/orders/orders-history-details/" +
              this.initialData?.orderDetails.orderCode,
          ]);
          this.onHideModal();
        },
      });
    } else {
      this.addToLine();
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
  addToLine() {
    this.isLoading = true;
    let currentDate = this.datePipe.transform(new Date(), "MM/dd/yyyy");
    const data: any = this.modalService.config.initialState;
    if (this.initialData.forShippingReATP) {
      let payload = {
        orderCode: this.initialData.orderCode,

        // shippingCondition:
        //   this.initialData.orderData.shippingConditions ===
        //   this.initialData.shippingCondition
        //     ? ""
        //     : this.initialData.shippingCondition,
        // shippingWarehouse:
        //   this.initialData.orderData.shippingWarehouse ===
        //   this.initialData.shippingWarehouse
        //     ? ""
        //     : this.initialData.shippingWarehouse,
        // shipVia:
        //   this.initialData.orderData.shipVia === this.initialData.shipVia
        //     ? ""
        //     : this.initialData.shipVia,
        // incoTerms:
        //   this.initialData.orderData.incoTerms === this.initialData.incoTerms
        //     ? ""
        //     : this.initialData.incoTerms,

        // reInspect:this.initialData?.reInspect || false,

        // incoTerms: this.initialData.incoTerms,
        lineItems: [
          {
            lineNumber: this.initialData.entryNumber,
            ...(this.initialData.reInspect
              ? { reInspect: this.initialData?.reInspect || false }
              : this.initialData?.orderDetails?.replacementOrder == true
              ? { reInspect: true }
              : {}),
            ...(this.feetYardFormData.dyeLot
              ? { dyeLot: this.feetYardFormData.dyeLot }
              : {}),
            atpUniqueId: this.initialData.atpUniqueId,
            postOrderIndicator: "POST",
            shippingCondition:
              this.initialData.lineProduct.shippingCondition ===
              this.initialData.shippingCondition
                ? ""
                : this.isCustomer  || this.isSalesPerson ? this.originalDefaultShippingMethod :this.initialData.shippingCondition,
            shippingWarehouse:
              this.initialData.lineProduct.shippingWarehouse ===
              this.initialData.shippingWarehouse
                ? ""
                : this.initialData.shippingWarehouse,
            shipVia:
              this.initialData.lineProduct.shipVia === this.initialData.shipVia
                ? ""
                : this.initialData.shipVia,
            incoTerms:
              this.initialData.lineProduct.incoTerms ===
              this.initialData.incoTerms
                ? ""
                : this.initialData.incoTerms,
            solution: this.selectedSolution.solutionEntries,
            productPriceData: this.initialData.productPriceDetails,
            sameDyeLot: this.initialData?.sameDyeLot,

            //  postOrderIndicator: this.initialData.postOrderIndicator,
          },
        ],
      };

      this.productService.updatePostOrder(payload).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.statusText === "Unknown Error" || res.ok === false) {
            this.addtoCartFailed = true;
            this.scrollPageToTop();
            this.addtoCartErrorMessage[0] = "Add to Cart Failed with Timeout";
            this.isLoading = false;
          } else if (
            res?.body?.messages &&
            res.body.messages.length > 0 &&
            res?.body?.messages[0]?.status == "Error"
          ) {
            this.addtoCartFailed = true;
            this.scrollPageToTop();
            this.addtoCartErrorMessage[0] = this.isCustomer
              ? "Action could not be completed. Sales document is currently being processed."
              : "Action could not be completed. " +
                res?.body?.messages[0].message;
          } else {
            let entryNumber: any =
              this.modalService?.config?.initialState?.["entryNumber"];
            let entryLength: any =
              this.modalService?.config?.initialState?.["entryLength"];
            if (entryNumber < entryLength) {
              this.atpCheckFromCart(entryNumber);
              this.onHideModal();
            } else {
              this.router.navigate([
                "/residential/orders/orders-history-details/" +
                  this.initialData.orderCode,
              ]);
              window.location.reload();
              this.onHideModal();
            }
          }
        },
        error: (err) => {
          this.isLoading = false;
        },
      });
    } else {
      let payLoad = {
        orderCode: this.initialData.orderDetails.orderCode,
        shipComplete: this.initialData.shipComplete ?? true,
        lineItems: [
          {
            lineNumber: "",
            ...(this.feetYardFormData.dye
              ? { dyeLot: this.feetYardFormData.dye }
              : {}),
            shippingCondition:
            this.isCustomer  || this.isSalesPerson ?  this.originalDefaultShippingMethod :
              data?.shippingConditions?.defaultShippingCondition || "",
            incoTerms: data?.shippingConditions?.defaultIncoTerms || "",
            shippingWarehouse:
              data?.shippingConditions?.defaultShippingWarehouse || "",
            shipVia: data?.shippingConditions?.defaultShipVia || "",
            requestedDeliveryDate: currentDate || "",
            productCode: this.initialData?.productCode,
            productPriceData: this.initialData.productPriceDetails,
            solution: this.selectedSolution?.solutionEntries,
            requestedQty: this.initialData?.feetyardForm.requestedQty,
            requestedUOM: this.initialData?.feetyardForm.unit,
            sameDyeLot: this.initialData?.sameDyeLot,
            // postOrderIndicator: "POST",
          },
        ],
      };
      this.productService.addLineOrAccessories(payLoad).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (
            res?.body?.messages &&
            res.body.messages.length > 0 &&
            res?.body?.messages[0]?.status == "Error"
          ) {
            this.addtoCartFailed = true;
            this.scrollPageToTop();
            this.addtoCartErrorMessage[0] = this.isCustomer
              ? "Action could not be completed. Sales document is currently being processed."
              : "Action could not be completed. " +
                res?.body?.messages[0].message;
          } else {
            this.router.navigate([
              "/residential/orders/orders-history-details/" +
                res?.body?.orderCode,
            ]);
            this.onHideModal();
          }
        },
        error: (err) => {
          this.isLoading = false;
        },
      });
      // this.productService.addLineOrAccessories(payLoad).subscribe({
      //   next: (res) => {
      //     console.log("res is ---->",res)
      //     this.isLoading = false;
      //     if (res?.body?.messages[0].status == "Error") {
      //      // this.addtoCartFailed = true;
      //       this.scrollPageToTop();
      //       this.addtoCartErrorMessage = res?.body?.messages;
      //     } else {
      //       this.router.navigate([
      //         "/residential/orders/orders-history-details/" +
      //           this.initialData.orderCode,
      //       ]);
      //       window.location.reload();

      //       this.onHideModal();
      //     }
      //   },
      //   error: (err) => {
      //     this.isLoading = false;
      //   },
      // });
    }
  }

  onHideModal() {
    this.bsModalRef.hide();
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

  spinnerLoading = false;

  failedCase(res?: any) {
    this.spinnerLoading = false;
    this.addtoCartFailed = true;
    this.scrollPageToTop();
    this.addtoCartErrorMessage[0] = this.isCustomer
      ? "Action could not be completed. Sales document is currently being processed."
      : "Action could not be completed. " + res?.body.messages[0].message;
  }
  @ViewChild("scrollToTop", { read: ElementRef }) scrollToTop: any;
  scrollPageToTop() {
    this.scrollToTop.nativeElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest",
    });
  }

  //getProductMedias
  getProductMedias(productCode: any) {
    this.productService.getProductMedias(productCode).subscribe((res: any) => {
      this.solutions[0].img = res?.body?.productImageURL;
    });
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
  updatePostModification() {
    this.modalService.hide();
    this.onPrimaryAction(this.selectedSolution);
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
            : "Length(SqTd)"
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

  balance: any;
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
}
