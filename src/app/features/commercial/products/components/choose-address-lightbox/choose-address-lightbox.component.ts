import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { Config, Columns, DefaultConfig } from "ngx-easy-table";
import { ProductAddressService } from "src/app/features/residential/products/components/services/product-address.service";
import { AddCompanionProductsComponent } from "../add-companion-products/add-companion-products.component";
import { ChangeShippingAddressComponent } from "../change-shipping-address/change-shipping-address.component";
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { ProductService } from "../../../products/pages/services/product.service";
import { StorageService } from "src/app/features/http-services/storage.service";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { Router } from "@angular/router";
import { XchangeAddAccessoriesLightboxComponent } from "src/app/features/shared/components/xchange-add-accessories-lightbox/xchange-add-accessories-lightbox.component";
import { API_CONSTANTS } from "src/app/features/shared/constants/API-CONSTANTS";
import { ApiService } from "src/app/features/http-services/api.service";
import { ConfirmationDialogComponent } from "src/app/features/shared/components/confirmation-dialog/confirmation-dialog.component";
import { OrderService } from "../../../orders/services/order.service";
import { DatePipe } from "@angular/common";
import { STATES } from "src/app/features/shared/constants/States";
import { PlpOrderSamplesComponent } from "../plp-order-samples/plp-order-samples.component";
import { CloneOrdersService } from "../../../clone-orders/services/clone-orders.service";
import { SharedService } from "src/app/features/http-services/shared.service";
import { ErrorModalComponent } from "src/app/features/shared/components/error-modal/error-modal.component";
import { take } from "rxjs";

@Component({
    selector: "app-choose-address-lightbox",
    templateUrl: "./choose-address-lightbox.component.html",
    styleUrls: ["./choose-address-lightbox.component.scss"],
    standalone: false
})
export class ChooseAddressLightboxComponent
  implements OnInit
{
  reactiveForm!: FormGroup;
  submitted = false;
  isCollapsed = true;
  isCollapsed1 = true;
  isCollapsed2 = true;
  checkboxes = true;
  checkboxes1 = true;
  selectedTab = 1;
  checkboxes2 = true;
  replacementCheck: any;
  priceDetails :any;
  atpCheckData: any = {};
  setAddress: any;
  isShipToUser:any;
  states = [...STATES[0]?.states, ...STATES[1]?.states];
  orderSampleFlag: boolean = false;
  spinnerLoading: boolean = false;
  @Input() pdpdata: any;
  @Input() selectedProduct: any;
  @Input() isAtpCheck!: boolean;
  @Input() isCloneOrders: boolean = false;
  @Input() selectedCloneOrder: any;
  @Input() productCode: any;
  @Output() cancelClick = new EventEmitter();
  @Output() continueCloneOrderFlow = new EventEmitter();
  isError: boolean = false;
  showOrderSample: boolean = false;
  // addtoCartFailed: boolean = false;
  addtoCartErrorMessage: any = [];
  isVisible: boolean = false;
  modalRef!: BsModalRef;
  totalRecords: any = 0;
  productNumber = "";
  productType = "";
  userInfo: any;
  currentDate = new Date();
  cartNumberData: any = {};
  showMessage: boolean = false;
  showValidationError: boolean = false;
  showError: boolean = false;
  validationErrorMessage: any;
  alert = "";
  shippingOptionFlag: boolean = false;
  checkConfirmation: any;
  ctaSpinnerFlag: boolean = false;
  erpProductCategory: any;
  isPoBoxFlag: boolean = false;
  viewInventoryHS:boolean = false;
  showAddtoCart:boolean = false;
  isAccessories: boolean = false;
  constructor(
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private defaultAddress: ProductAddressService,
    private formBuilder: FormBuilder,
    private ProductService: ProductService,
    public storageService: StorageService,
    private userService: UserService,
    private router: Router,
    private apiService: ApiService,
    private orderService: OrderService,
    private datePipe: DatePipe,
    private sharedService: SharedService,
    private cloneOrdersService: CloneOrdersService,
    private cdr: ChangeDetectorRef
  ) {
    this.storageService.getItem("uid").subscribe((res) => {
      this.uid = res;
    });
    this.isError = false;
    this.getUrlparams();
    router.events.subscribe((url: any) => {});
    let n = router.url.lastIndexOf("/");
    this.initialState = this.modalService.config.initialState;
    this.productNumber = router.url.substring(n + 1).includes("cloneorders")
      ? this.storageService.selectedCloneOrders?.productNumber
      : router.url.substring(n + 1);
    this.isCloneOrders = this.storageService.selectedCloneOrders?.isCloneOrders == true;
    if (this.initialState !== null && JSON.stringify(this.initialState) !== '{}') {
      this.showOrderSample = this.initialState?.showOrderSample || false;
      this.selectedProduct = this.initialState?.selectedProduct;
      this.productCode = this.initialState?.productCode;
      this.priceDetails = this.initialState?.pricedetails;
      this.productNumber = this.initialState?.productCode || this.productNumber;
      this.productType = this.initialState?.productType || "";
      this.showAddtoCart = this.selectedProduct?.classification === "Accessories" ? true : false;;
      this.isAccessories = this.selectedProduct?.classification === "Accessories"  ? true : false;
      this.showOrderSample = this.initialState?.showOrderSample || false;
    }

    // this.getShippingAddress();
  }

  addAccessoriesModal(template1: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template1, {
      id: 1,
      class: "modal-lg modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }

  public configuration!: Config;
  public columns!: Columns[];
  shippingMethodDropdownData: any = [];
  shippingWareHouseDropdownData: any = [];

  public data = [
    {
      qty: "",
      productImage: "",
      part: "FLXTB-1",
      description: "FlexLok",
      size: '7.125" X 7.5"',
      price: "80.00/ CT",
    },
    {
      qty: "",
      productImage: "",
      part: "EQ099-1	",
      description: "Flexlok Tabs	",
      size: '7.125" X 7.5"',
      price: "N/A",
    },
  ];
  datesEnabled: any = [];
  daysToBeEnabled: any = [];
  disabledDate: any = [];

  // public solutions = [
  //   {
  //     productName: "Neutral Shift PM395",
  //     color: "Crackled Glaze 717",
  //     size: "12Ft 00In",
  //     backing: "Abac - Weldlok",
  //     address: "  ",
  //     line1: "5 Maplewood Dr",
  //     linename: "Hefner Holdings Llc",
  //     lineAddress: "Douglassville, PA 19518",
  //     via: "Mohawk Truck",
  //   },
  // ];
  initialState: any;
  cartData: any;
  uid: string = "";
  phonePattern = "[0-9]{9}";
  addressSpinnerLoading: boolean = true;
  priceLabel: string = "USD";
  soldToAccount:any = "";
  shippingOptionsAPIs = new Set<string>();
  // shippingOptionsAPIs: any = ["ShippingMethod", "IncoTerms", "WareHouse", "ShipVia"];
  ngOnInit(): void {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    this.userService.getCurrentUserDetail().subscribe((res: any) => {
      this.uid = res?.body?.orgUnit?.uid;
      this.priceLabel = res.body?.priceLabel;
      this.soldToAccount = res.body?.orgUnit?.soldTo || "";
      this.cdr.detectChanges();
    });
    this.storageService.getItem("uid").subscribe((res) => {
      this.uid = res;
    });

    this.initiateForm();
    // this.cartData = this.storageService.cartData;

    // this.reactiveForm.controls["ShipVia"].disable();
    // this.getShippingAddress();
    this.configuration = { ...DefaultConfig };
    this.configuration.checkboxes = false;
    this.productType = this.initialState?.productType;

    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;
    this.columns = [
      { key: "qty", title: "Qty" },
      { key: "productImage", title: "Product Image" },
      { key: "part", title: "Part#" },
      { key: "description", title: "Description" },
      { key: "size", title: "Size" },
      { key: "price", title: "Price (USD)" },
    ];
    this.reactiveForm.valueChanges.subscribe(() => {
      this.setDefaultAddressData();
    });
    if (this.initialState !== null && JSON.stringify(this.initialState) !== '{}') {
      this.productType = this.initialState?.productType || "";
      this.initialState = this.modalService.config.initialState;
      let feetform = { requestedQty :
        +this.initialState?.feetyardForm?.requestedQty || 0,
        feet :
        +this.initialState?.feetyardForm?.feet || 0
      }
      // this.initialState.feetyardForm.requestedQty =
      //   +this.initialState?.feetyardForm?.requestedQty || 0;
      // this.initialState.feetyardForm.feet =
      //   +this.initialState?.feetyardForm?.feet;
      this.initialState.feetyardForm = {...this.initialState.feetyardForm, ...feetform};
      this.erpProductCategory = this.initialState.erpProductCategory;
      this.showOrderSample = this.initialState?.showOrderSample || false;
    }
    this.storageService.getItem("defaultAddres").subscribe((res: any) => {
      this.atpCheckData = res?.entries || [];
      this.cdr.detectChanges();
    });
    this.userService.getCurrentUserDetail().subscribe((res: any) => {
      this.uid = res?.body?.orgUnit?.uid;
      this.cdr.detectChanges();
    });
    this.storageService.getItem("uid").subscribe((res) => {
      this.uid = res;
      this.cdr.detectChanges();
    });
    this.userService.getCurrentUserDetail().subscribe((res: any) => {
      this.uid = res.body.orgUnit?.uid;
      this.userInfo = res?.body;
      this.cdr.detectChanges();
    });
    this.storageService.getItem("userInfo")
      .pipe(take(1))
      .subscribe((res) => {
        this.isShipToUser = res?.isShipToUser;
        this.cdr.detectChanges();
    });
    this.getShippingAddress();
    this.getShippingAddressTotal();
  }
  isShippingOptionsModalOpened: boolean = false;
  setLoadAPI(apiName: any, apiLength: number = 4) {
    this.shippingOptionsAPIs.add(apiName);
    if (this.shippingOptionsAPIs.size >= apiLength && !this.isShippingOptionsModalOpened) {
      this.isShippingOptionsModalOpened = true;
      this.ProductService.progressHide('getShippingOptionsId');
      this.modalRef = this.modalService.show(this.shippingOptionTemplate, {
        id: "shippingOptionsModal",
        class: "modal-lg modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      });
    }
  }
  getShippingAddressTotal() {
    this.totalRecords = 0;
    this.ctaSpinnerFlag = true;
    this.defaultAddress
      .getAddressCount(this.userService.getUserEmail().toLowerCase())
      .subscribe(
        (res) => {
          this.ProductService.progressHide('getAddressesId');
          this.ctaSpinnerFlag = false;
          const data = res.body || [];
          this.totalRecords = res.body || 0;
          this.cdr.detectChanges();
        },
        (err: any) => {
          this.ProductService.progressHide('getAddressesId');
          this.ctaSpinnerFlag = false;
          this.cdr.detectChanges();
        }
      );
  }

  initiateForm() {
    this.reactiveForm = this.formBuilder.group({
      name: [""],
      streetAddress: [""],
      carrierNumber: [null],
      city: [""],
      streetAddress2: [""],
      state: [null],
      zipCode: [""],
      Claim: [""],
      ShipVia: [null],
      IncoTerms: [null],
      shippingWareHouse: [null],
      incoTermsLoc2: [null],
      replacementReason: [null],
      PO: [""],
      Order: [""],
      Invoice: [""],
      ContactName: [""],
      Phone: [""],
      Location: [null],
      hasClaimSubmitted: null,
      replacementOrder: false,
      oneTimeShippingAddress: false,
      siteInfo: "",

      // notification: null,
      loading: null,
      offloading: null,
      poleLift: null,
      accomodate: null,
      acknowledge: null,
      rdd: [new Date(), [Validators.required]],

      // new Variables

      jobsiteDelivery: null,
      appoinment: null,
      liftGateAndPallet: null,
      // insideDelivery: null,
      // whiteGloveDelivery: null,
      // multipleStops: null,
      storeNumber: "",
      lastestacceptDate: new Date(),
      truckSize: null,
    });
  }
  getOrderDates() {
    this.orderService.getDeliveryDate("?shipToUnit=" + "").subscribe({
      next: (res) => {
        this.datesEnabled = res.body;
        this.datesEnabled = this.datesEnabled?.map((el: any) => {
          return new Date(this.changeDateFormat(el));
        });

        this.daysToBeEnabled = this.datesEnabled;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.cdr.detectChanges();
      },
    });
  }
  changeDateFormat(val: any) {
    let dateArray = val.split("");
    let year = dateArray.splice(0, 4);
    let month = dateArray.splice(0, 2);
    let date = dateArray.splice(0, 2);

    return `${month.join("")}/${date.join("")}/${year.join("")}`;
  }
  changeEvent(event: any) {
    this.reactiveForm.patchValue({
      replacementOrder: event?.state,
    });
    if (event?.state) {
      this.reactiveForm.controls["replacementReason"].setValidators(
        Validators.required
      );

      this.reactiveForm.controls["replacementReason"].updateValueAndValidity();
      this.reactiveForm.patchValue({
        hasClaimSubmitted: null,
      });
      this.reactiveForm.controls["hasClaimSubmitted"].setValidators(
        Validators.required
      );
      this.reactiveForm.controls["hasClaimSubmitted"].updateValueAndValidity();
    } else {
      this.reactiveForm.controls["replacementReason"].clearValidators();
      this.reactiveForm.controls["replacementReason"].patchValue(null);
      this.reactiveForm.controls["replacementReason"].updateValueAndValidity();
      this.reactiveForm.controls["Claim"].clearValidators();
      this.reactiveForm.controls["Claim"].patchValue("");
      this.reactiveForm.controls["PO"].patchValue("");
      this.reactiveForm.controls["Order"].patchValue("");
      this.reactiveForm.controls["Invoice"].patchValue("");
      this.reactiveForm.controls["Claim"].updateValueAndValidity();
      this.reactiveForm.updateValueAndValidity();
      this.reactiveForm.controls["hasClaimSubmitted"].clearValidators();
      this.reactiveForm.patchValue({
        hasClaimSubmitted: null,
      });
      this.reactiveForm.controls["hasClaimSubmitted"].updateValueAndValidity();
    }
  }
  changeEventClaim(
    event: any,
    num: number,
    id_first: string,
    id_second: string
  ) {
    if (this.reactiveForm.value.hasClaimSubmitted == null) {
      if (num == 1) {
        this.reactiveForm.patchValue({
          hasClaimSubmitted: true,
        });
      } else {
        this.reactiveForm.patchValue({
          hasClaimSubmitted: false,
        });
      }
    } else {
      this.reactiveForm.patchValue({
        hasClaimSubmitted: !this.reactiveForm.value.hasClaimSubmitted
          ? true
          : false,
      });
    }

    if (this.reactiveForm.value.hasClaimSubmitted) {
      this.radioButtonCheckBoxes(id_first, true);
      this.radioButtonCheckBoxes(id_second, false);
      this.reactiveForm.controls["Claim"].setValidators(Validators.required);
      this.reactiveForm.controls["Claim"].updateValueAndValidity();
      this.reactiveForm.controls["Claim"].markAsPristine();

      this.reactiveForm.controls["Claim"].markAsUntouched();
    } else {
      this.radioButtonCheckBoxes(id_first, false);
      this.radioButtonCheckBoxes(id_second, true);
      this.reactiveForm.controls["Claim"].clearValidators();
      this.reactiveForm.controls["Claim"].updateValueAndValidity();
    }
  }
  radioButtonCheckBoxes(id: string, val: boolean) {
    let element: any = document.getElementById(id) as HTMLInputElement;

    element.checked = val;
  }
  openChangeShippingAddress() {
    const initialState: ModalOptions = {
      initialState: {
        minRollLength: this.initialState?.minRollLength,
        maxRollLength: this.initialState?.maxRollLength,
        standardRollLength: this.initialState?.standardRollLength,
        productCode: this.initialState?.productCode,
        // Data to  popup
      },
    };
    this.modalRef = this.modalService.show(
      ChangeShippingAddressComponent,
      Object.assign(initialState, {
        id: "ChangeShippingAddressComponent",
        class: "modal-xl modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
    this.modalRef.content.messageEvent.subscribe((data: any) => {
      this.shippingAddress = data;
      this.setDefaultAddressData();
      this.getProductPriceDetails(this.shippingAddress?.id);
      this.addtoCartErrorMessage = [];
      this.isPoBoxFlag = false;
      let shippingMethod = this.shipViaSelectedOption || this.shippingAddress?.defaultShippingMethod;
      if ((!this.isCloneOrders && !this.showOrderSample) && this.shippingAddress?.formattedAddress?.includes("PO BOX")
       && shippingMethod != 'PS' && shippingMethod != 'PM') {
        this.isPoBoxFlag = true;
        this.addtoCartErrorMessage.push({ message: "This shipping address is not allowed, please choose other shipping address" })
        return
      }

      // this.spinnerLoading = true;
      this.ProductService.progressShow('validateAddress', 'validateAddressId');
      this.orderService
        .getShippingOptions(
          false,
          this.selectedProduct?.code || this.productNumber,
          this.shippingAddress.id,
          this.userInfo.orgUnit?.soldTo
        )
        .subscribe({
          next: (res) => {
            this.ProductService.progressHide('validateAddressId');
            this.spinnerLoading = false;
            this.defaultIncoTerms = res.body?.defaultIncoTerms;
            this.defaultIncoTermsDesc = res.body?.defaultIncoTermsDesc;
            this.defaultShipVia = res.body?.defaultShipVia;
            this.defaultShippingMethod = res.body?.defaultShippingMethod;
            this.defaultShippingWarehouse = res.body?.defaultShippingWarehouse;
            this.defaultShippingWarehouseDesc =
              res.body?.defaultShippingWarehouseDesc;
            this.defaultShippingConditionDesc =
              res.body?.defaultShippingConditionDesc;
            this.defaultShippingMethodDesc =
              res.body?.defaultShippingConditionDesc;
            this.shippingAddress.defaultShippingMethod =
              res.body?.defaultShippingMethod;
              this.defaultShippingConditionDesc = res.body.defaultShippingConditionDesc;
            this.shippingAddress.defaultShippingConditionDesc =
              res.body?.defaultShippingConditionDesc;
            this.shippingAddress.defaultShipVia = res.body.defaultShipVia;
            this.shippingAddress.defaultIncoTerms = res.body.defaultIncoTerms;
            this.shippingAddress.defaultIncoTermsDesc =
              res.body.defaultIncoTermsDesc;
            this.shippingAddress.defaultShippingWarehouse =
              res.body.defaultShippingWarehouse;
            this.shippingAddress.defaultShippingWarehouseDesc =
              res.body.defaultShippingWarehouseDesc;
              this.shippingAddress.originalDefaultShippingMethod = res?.body?.originalDefaultShippingMethod;;
              this.originalDefaultSM = res?.body?.originalDefaultShippingMethod;
            this.shippingWareHouseSelectedOption = res?.body?.defaultShippingWarehouse;
            this.incoTermsLoc2SelectedOption = res?.body?.defaultShipVia;
            this.shipViaSelectedOption = res?.body?.defaultShippingMethod;
            this.incoTermsSelectedOption = res.body?.defaultIncoTerms;
            this.cdr.detectChanges();
          },
          error: (err) => {
            this.ProductService.progressHide('validateAddressId');
            this.spinnerLoading = false;
            this.cdr.detectChanges();
          },
        });

      this.setAddress = this.shippingAddress.line1;
    });
  }

  getProductPriceDetails(shipTo: any = "") {
    this.spinnerLoading = true;
    if(this.productType != "MERCHANDISING" || this.initialState?.productType != "MERCHANDISING" ){
       this.ProductService.getProductPriceDetails(this.productCode, shipTo).subscribe(
        (res: any) => {
          this.spinnerLoading = false;
          if(res?.body){
            this.priceDetails = res?.body;
            this.initialState.pricedetails = res?.body;
          }
        },
        (err: any) => {
          this.spinnerLoading = false;
        }
      );
    }
  }

  setDefaultShippingOptions(shippingAddress:any){
    this.defaultShippingMethod= shippingAddress?.defaultShippingMethod;
    this.defaultShippingConditionDesc = shippingAddress?.defaultShippingConditionDesc;
    this.defaultShippingWarehouse = shippingAddress?.defaultShippingWarehouse;
    this.defaultShippingWarehouseDesc= shippingAddress?.defaultShippingWarehouseDesc;
    this.defaultIncoTerms = shippingAddress?.defaultIncoTerms;
    this.defaultIncoTermsDesc = shippingAddress?.defaultIncoTermsDesc;
    this.defaultShipVia = shippingAddress?.defaultShipVia;
    this.shipViaSelectedOption = shippingAddress?.defaultShippingMethod;;
    this.incoTermsLoc2SelectedOption = shippingAddress?.defaultShipVia;
    this.shippingWareHouseSelectedOption = shippingAddress?.defaultShippingWarehouse;
    this.incoTermsLoc2Options = shippingAddress?.defaultIncoTerms;
   
   this.originalDefaultSM = shippingAddress?.originalDefaultShippingMethod;
   this.originalDefaultShippingMethod = shippingAddress?.originalDefaultShippingMethod;


}
  chooseAsolutionClick() {
    // this.shippingAddress = {
    //   ...this.shippingAddress,
    //   ...this.reactiveForm.value,
    // };
    if (!this.isCloneOrders && !this.showOrderSample) {
      let val = this.reactiveForm.value?.ShipVia;
      const selectedItem = this.shippingMethodDropdownData.find(
        (item: any) => item.value === val
      );
      let valSW = this.reactiveForm.value?.shippingWareHouse;
      const selectedItemSW = this.shippingWareHouseDropdownData.find(
        (item: any) => item.value === valSW
      );

      this.shippingAddress.defaultShippingMethod = selectedItem?.value;
      this.shippingAddress.defaultShippingConditionDesc = selectedItem?.label;
      this.shippingAddress.defaultIncoTerms = this.reactiveForm.value?.IncoTerms;
      this.shippingAddress.defaultIncoTermsDesc = "";
      this.shippingAddress.defaultShippingWarehouse = selectedItemSW.value;
      this.shippingAddress.defaultShippingWarehouseDesc = selectedItemSW.label;
      this.shippingAddress.defaultShipVia = typeof this.reactiveForm.value?.incoTermsLoc2 == 'object' ? this.reactiveForm.value?.incoTermsLoc2?.label.toUpperCase() :  (this.reactiveForm.value?.incoTermsLoc2 && this.reactiveForm.value?.incoTermsLoc2.toUpperCase() || "");

    }
    this.shippingAddress.originalDefaultShippingMethod = this.originalDefaultShippingMethod;
    this.shippingAddress.addressCity = this.reactiveForm.value?.city;
    this.shippingAddress.addressLine1 = this.reactiveForm.value?.streetAddress;
    this.shippingAddress.line1 = this.reactiveForm.value?.streetAddress;
    this.shippingAddress.addressLine2 = this.reactiveForm.value?.streetAddress2;
    this.shippingAddress.line2 = this.reactiveForm.value?.streetAddress2;
    this.shippingAddress.addressPostalCode = this.reactiveForm.value?.zipCode;
    this.shippingAddress.postalCode = this.reactiveForm.value?.zipCode;
    this.shippingAddress.addressState = this.reactiveForm.value?.state;
    this.shippingAddress.region = this.reactiveForm.value?.state;
    this.shippingAddress.isOneTimeShipTo = true;
    this.shippingAddress.phone = this.reactiveForm.value?.Phone;
    this.shippingAddress.siteContactName = this.reactiveForm.value?.ContactName;
    this.shippingAddress.siteContactPhone = this.reactiveForm.value?.Phone;
    this.shippingAddress.requestedDeliveryDate = this.reactiveForm.value?.rdd;
    this.shippingAddress.formattedAddress =
      this.reactiveForm.value?.streetAddress +
      ", " +
      this.reactiveForm.value?.streetAddress2 +
      this.reactiveForm.value?.city;
    +" " + this.reactiveForm.value?.zipCode;

    delete this.shippingAddress.district;
    this.storageService.setItem("shippingAddress", this.shippingAddress);
    this.resSubmit = this.shippingAddress;
    if (this.initialState?.openAddAccessories) {
      const initialState: ModalOptions = {
        initialState: {
          cartData: {},
          itemName: {},
          postOrder: false,
          showSuccessAlert: false,
          loadAllAccessoriesDetails: true,
          shippingAddress: this.getAddressForModals(),
          selectedAccessories: this.initialState?.selectedAccessories || null,
        },
      };
      this.bsModalRef = this.modalService.show(
        XchangeAddAccessoriesLightboxComponent,
        Object.assign(initialState, {
          class: "modal-xl modal-dialog-centered xchangeaddaccessorieslightbox",
          backdrop: "static",
          keyboard: false,
        })
      );
      this.bsModalRef.content.type = 2;
    }else{
      this.chooseSolutionModal();
    }


  }
  chooseSolutionModal() {
    this.reactiveForm.value.shippingAddressID = "";

    const initialState: ModalOptions = {
      initialState: {
        fromViewInventory: this.initialState?.viewInventory,
        requestedQty:this.initialState.requestedQty,
        solutions: [this.initialState?.selectedProduct],
        openFromaddressModal: true,
        shippingAddress: this.getAddressForModals(),
        shippingOptions: this.shippingAddress,
        cartData: this.initialState?.cartData,
        feetyardForm: this.initialState?.feetyardForm,
        productType: this.initialState?.productType,
        aptCheckEntrie: this.initialState?.aptCheckEntrie,
        multiCutIndication: this.initialState?.multiCutIndication,
        viewInventory: this.initialState?.viewInventory,
        oneTimeShippingFlag: this.reactiveForm.value.oneTimeShippingAddress,
        priceDetails:this.initialState?.pricedetails,
        requestedYdkQty : this.initialState?.requestedYdkQty,
        sameDyeLot:this.initialState?.sameDyeLot,
        //  subProductType:this.initialState.solution[0].subProductType,
        selectedPDPTab: this.initialState?.selectedPDPTab,
        erpProductCategory: this.initialState?.erpProductCategory,
        viewInventoryHS: this.viewInventoryHS,
        standardRollLength: this.initialState?.standardRollLength || 0,
        preferredStock: this.initialState?.variantData?.selected?.preferredStock || this.initialState?.preferredStock,
        bundleProduct: this.initialState?.bundleProduct,
        isInvalidAddress : this.isInvalidAddress,
        isSuggestedAddress: this.isSuggestedAddress,
        addressErrorMsg: this.addressErrorMsg
      },
    };
    this.modalRef = this.modalService.show(
      AddCompanionProductsComponent,
      Object.assign(initialState, {
        id: "AddCompanionProductsComponent",
        class: "modal-xl modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );

    this.modalRef.content.solutions = [this.initialState?.selectedProduct];
  }
  orderSample() {
    const initialState: ModalOptions = {
      initialState: {
        // Data to  popup
        productCode: this.productNumber,
        shippingAddress: this.getAddressForModals(),
        feetyardForm: {
          ...this.initialState.feetyardForm,
          originProductType: this.productType,
          originSubProductType: this.initialState?.subProductType || this.initialState?.selectedProduct?.subProductType ||"" ,
        },
        isInvalidAddress : this.isInvalidAddress,
        isSuggestedAddress: this.isSuggestedAddress,
        addressErrorMsg: this.addressErrorMsg
      },
    };
    this.bsModalRef = this.modalService.show(
      PlpOrderSamplesComponent,
      Object.assign(initialState, {
        id: "PlpOrderSamplesComponent",
        class: "modal-xl modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }

  onHideModal(id: any) {
    if (this.reactiveForm.dirty) {
      this.sharedService.confirmation(this.modalService, id);
    } else {
      this.modalService.hide(id);
    }
    if (id === "ChooseAddressModal") {
      this.shippingAddress = this.cancelShippingAddress;
      this.setDefaultAddressData();
    }
    this.alert = "";
    this.cancelClick.emit(true);
  }
  shippingAddress: any;
  cancelShippingAddress: any;
  originalDefaultShippingMethod:any;
  getShippingAddress() {
    this.ProductService.progressShow('getAddresses', 'getAddressesId');
    this.defaultAddress
      .getDefaultShippingAddress(
        this.userService.getUserEmail().toLowerCase(),
        (this.showOrderSample ? this.showOrderSample : this.isCloneOrders),
        this.productNumber
      )
      .subscribe((res) => {
        this.ProductService.progressHide('getAddressesId');
        this.shippingAddress = res.body;
        this.cancelShippingAddress = res?.body;
        if(this.userInfo?.isCustomer || this.userInfo?.isSalesPerson || this.userInfo?.isSalesOps){
          this.originalDefaultShippingMethod = res?.body?.originalDefaultShippingMethod;
          this.originalDefaultSM = res?.body?.originalDefaultShippingMethod;
          
        }
        this.setDefaultAddressData();
        this.cdr.detectChanges();
      },() => {
        this.ProductService.progressHide('getAddressesId');
      });
  }
  get f(): { [key: string]: AbstractControl } {
    return this.reactiveForm.controls;
  }
  // onSubmit(): void {
  //   this.submitted = true;

  //   if (this.reactiveForm.valid) {
  //     this.chooseSolutionModal();
  //   }
  //   // this.openOrderSamplesModal();
  // }
  onSubmit(): void {
    this.submitted = true;
    if (this.initialState?.openAddAccessories) {
      const initialState: ModalOptions = {
        initialState: {
          cartData: {},
          itemName: {},
          postOrder: false,
          showSuccessAlert: false,
          loadAllAccessoriesDetails: true,
          shippingAddress: this.getAddressForModals(), // productCode="C.BC456.683.1300.AB",
          selectedAccessories: this.initialState?.selectedAccessories || null,
        },
      };
      this.bsModalRef = this.modalService.show(
        XchangeAddAccessoriesLightboxComponent,
        Object.assign(initialState, {
          class: "modal-xl modal-dialog-centered xchangeaddaccessorieslightbox",
          backdrop: "static",
          keyboard: false,
        })
      );
      this.bsModalRef.content.type = 2;
    } else if (this.reactiveForm.valid) {
      //.log("this.shippingAddress====>", this.shippingAddress);
      this.storageService.setItem("shippingAddress", this.shippingAddress);
      this.chooseSolutionModal();
    }
  }
  getAddressForModals() {
    let address: any;
    if (this.selectedTab == 1) {
      this.reactiveForm.value.oneTimeShippingAddress = false;
      address = this.shippingAddress;
      address.rdd = this.reactiveForm.value?.rdd;
      address.replacementOrder = this.reactiveForm.value.replacementOrder;
      address.hasClaimSubmitted = this.reactiveForm.value.hasClaimSubmitted;
      address.claimNumber = this.reactiveForm.value.Claim.trim();
      address.replacementReason = this.reactiveForm.value.replacementReason;
      address.purchaseOrderNumber = this.reactiveForm.value.PO.trim();
      address.orderNumber = this.reactiveForm.value.Order.trim();
      address.invoiceNumber = this.reactiveForm.value.Invoice.trim();
    } else {
      this.reactiveForm.value.oneTimeShippingAddress = true;
      address = this.reactiveForm.value;
      address.addressName = this.reactiveForm.value.name;
      address.rdd = this.reactiveForm.value?.rdd;
      address.replacementOrder = this.reactiveForm.value.replacementOrder;
      address.hasClaimSubmitted = this.reactiveForm.value.hasClaimSubmitted;
      address.claimNumber = this.reactiveForm.value.Claim.trim();
      address.replacementReason = this.reactiveForm.value.replacementReason;
      address.purchaseOrderNumber = this.reactiveForm.value.PO.trim();
      address.orderNumber = this.reactiveForm.value.Order.trim();
      address.invoiceNumber = this.reactiveForm.value.Invoice.trim();
      address.addressCity = this.reactiveForm.value.city;
      address.addressLine1 = this.reactiveForm.value.streetAddress;
      address.addressLine2 = this.reactiveForm.value.streetAddress2;
      address.addressPostalCode = this.reactiveForm.value.zipCode;
      address.addressState = this.reactiveForm.value.state;
      address.siteContactName = this.reactiveForm.value?.ContactName;
      address.siteContactPhone = this.reactiveForm.value?.Phone;
      if (!this.isCloneOrders && !this.showOrderSample) {
        address.shipVia = this.reactiveForm.value.incoTermsLoc2;
        address.defaultShipVia = this.reactiveForm.value.incoTermsLoc2;
        address.defaulthIncoTermLoc2 = this.reactiveForm.value.incoTermsLoc2;
        address.incoTermsLoc2 = this.reactiveForm.value.incoTermsLoc2;
        address.IncoTerms = this.reactiveForm.value.IncoTerms;
        address.incoTerms = this.reactiveForm.value.IncoTerms;
        address.defaultIncoTerms = this.reactiveForm.value.IncoTerms;
        address.shippingWareHouse = this.reactiveForm.value.shippingWareHouse;
        address.defaultShippingWarehouse =
          this.reactiveForm.value.shippingWareHouse;
        address.defaultShippingMethod =
          this.shippingAddress.defaultShippingMethod;
        address.defaultShippingConditionDesc =
          this.shippingAddress.defaultShippingConditionDesc;
      } else {
        address.shipVia = this.shippingAddress?.defaultShipVia ||
          this.shippingAddress?.incoTermsLoc2 ||
          this.shippingAddress?.shipVia;
        address.defaultShipVia = this.shippingAddress?.defaultShipVia ||
          this.shippingAddress?.incoTermsLoc2 ||
          this.shippingAddress?.shipVia;
        address.defaulthIncoTermLoc2 = this.shippingAddress?.defaultShipVia ||
          this.shippingAddress?.incoTermsLoc2 ||
          this.shippingAddress?.shipVia;
        address.incoTermsLoc2 = this.shippingAddress?.defaultShipVia ||
          this.shippingAddress?.incoTermsLoc2 ||
          this.shippingAddress?.shipVia;
        address.IncoTerms = this.shippingAddress?.defaultIncoTerms ||
          this.shippingAddress?.incoTerms;
        address.incoTerms = this.shippingAddress?.defaultIncoTerms ||
          this.shippingAddress?.incoTerms;
        address.defaultIncoTerms = this.shippingAddress?.defaultIncoTerms ||
          this.shippingAddress?.incoTerms;
        address.shippingWareHouse = this.shippingAddress.defaultShippingWarehouse ||
          this.shippingAddress.shippingWarehouse;
        address.defaultShippingWarehouse = this.shippingAddress.defaultShippingWarehouse ||
          this.shippingAddress.shippingWarehouse;
        address.defaultShippingMethod = this.shippingAddress.defaultShippingMethod ||
          this.shippingAddress.shippingCondition;
        address.defaultShippingConditionDesc = this.shippingAddress.defaultShippingMethod ||
          this.shippingAddress.shippingCondition;
      }
      address.carrierNumber =
        this.reactiveForm.value.carrierNumber == null
          ? undefined
          : this.reactiveForm.value.carrierNumber;
      address.satellite =
        this.satellite == "" ? undefined : this.shippingAddress?.satellite;

      const states1: any = STATES[0];
      const states2: any = STATES[1];
      let country: any;

      country = states1.states.find(
        (item: any) => item.abbreviation === this.reactiveForm.value.state
      );
      if (country) {
        address.country = {
          isocode: states1.abbreviation,
          name: states1.name,
        };
      }
      if (!country) {
        country = states2.statesfind(
          (item: any) => item.abbreviation === this.reactiveForm.value.state
        );
        address.country = {
          isocode: states2.abbreviation,
          name: states2.name,
        };
      }

      const address2 = address?.streetAddress2
        ? address?.streetAddress2 + ", "
        : "";

      address.formattedAddress =
        address?.streetAddress +
        ", " +
        address2 +
        address?.city +
        " " +
        address?.zipCode;
    }
    this.storageService.setItem("shippingAddress", address);
    return address;
  }
  errorMessage = "";
  validateAddress() {
    this.submitted = true;
    let payload = {
      address1: this.reactiveForm.value.streetAddress,
      buID: 1,
      city: this.reactiveForm.value.city,
      country: "US",
      erpId: 1,
      postalcode: this.reactiveForm.value.zipCode,
      state: this.reactiveForm.value.state,
    };
    this.ProductService.progressShow('validateAddress', 'validateAddressId');
    this.ProductService.validateAddress(payload).subscribe({
      next: (res) => {
        this.ProductService.progressHide('validateAddressId');
        if (res?.errorCode) {
          if (res.errorCode === "0000") {
            if (!(res.errorMessage === "Address is valid"))
              this.validateAddressModal(this.isAtpCheck, res?.errorMessage);
          } else {
            this.scrollPageToTop();
            this.errorMessage = res?.errorMessage;
          }
        } else {
          this.onSubmitOnetimeShipping(true);
        }
      },
      error: (err) => {
        this.ProductService.progressHide('validateAddressId');
      },
    });
  }

  isInvalidAddress:boolean = false;
  isSuggestedAddress: boolean = false;
  addressErrorMsg:any = '';
  validateAddressOnFormChange() {
    if (
      this.reactiveForm.value.streetAddress.toLowerCase().includes(" po box") ||
      this.reactiveForm.value.streetAddress.toLowerCase().includes("p.o.box") ||
     // this.reactiveForm.value.streetAddress.toLowerCase().includes(" box") ||
      this.reactiveForm.value.streetAddress.toLowerCase().includes(" po ") ||
      this.reactiveForm.value.streetAddress
        .toLowerCase()
        .includes("post office box") ||
      this.reactiveForm.value.streetAddress.toLowerCase().includes("p.o ") //||
    //  this.reactiveForm.value.streetAddress.toLowerCase().includes("post ")
    ) {
      this.reactiveForm.controls["streetAddress"].setErrors({
        incorrect: true,
      });
    } else if (this.reactiveForm.value.streetAddress.length > 0) {
      this.reactiveForm.controls["streetAddress"].setErrors(null);
    }
    if (
      this.reactiveForm.value.streetAddress2.toLowerCase().includes(" po box") ||
      this.reactiveForm.value.streetAddress2
        .toLowerCase()
        .includes(" p.o.box") ||
   //   this.reactiveForm.value.streetAddress2.toLowerCase().includes(" box") ||
      this.reactiveForm.value.streetAddress2.toLowerCase().includes(" po ") ||
      this.reactiveForm.value.streetAddress2
        .toLowerCase()
        .includes("post office box") ||
      this.reactiveForm.value.streetAddress2.toLowerCase().includes("p.o ") //||
    //  this.reactiveForm.value.streetAddress2.toLowerCase().includes("post ")
    ) {
      this.reactiveForm.controls["streetAddress2"].setErrors({
        incorrect: true,
      });
    } else if (this.reactiveForm.value.streetAddress2.length > 0) {
      this.reactiveForm.controls["streetAddress2"].setErrors(null);
    }
    if (
      this.reactiveForm.controls["streetAddress"].valid &&
      this.reactiveForm.controls["city"].valid &&
      this.reactiveForm.controls["state"].valid &&
      this.reactiveForm.controls["zipCode"].valid
    ) {
      this.shippingMethodDropdownData = [];
      this.shippingWareHouseDropdownData = [];
      if (!this.isCloneOrders && !this.showOrderSample) {
        this.reactiveForm.controls["ShipVia"].setValue(null);
        this.reactiveForm.controls["ShipVia"].setValidators([
          Validators.required,
        ]);
        this.reactiveForm.controls["ShipVia"].updateValueAndValidity();
        this.reactiveForm.controls["IncoTerms"].setValue(null);
        this.reactiveForm.controls["IncoTerms"].setValidators([
          Validators.required,
        ]);
        this.reactiveForm.controls["IncoTerms"].updateValueAndValidity();
        this.reactiveForm.controls["shippingWareHouse"].setValue(null);
        this.reactiveForm.controls["shippingWareHouse"].setValidators([
          Validators.required,
        ]);
        this.reactiveForm.controls["shippingWareHouse"].updateValueAndValidity();
        this.reactiveForm.controls["incoTermsLoc2"].setValue(null);
        this.reactiveForm.controls["incoTermsLoc2"].setValidators([
          Validators.required,
        ]);
        this.reactiveForm.controls["incoTermsLoc2"].updateValueAndValidity();
      }
      /* let payload = {
        address1: this.reactiveForm.value.streetAddress,
        address2: this.reactiveForm.value.streetAddress2,
        buID: 1,
        city: this.reactiveForm.value.city,
        country: "US",
        erpId: 1,
        postalcode: this.reactiveForm.value.zipCode,
        state: this.reactiveForm.value.state,
      }; */
      const formValues = this.reactiveForm.value;

      const payload = `(IvVstel='',` +
        `IvCity='${formValues.city}',` +
        `IvCountry='US',` +
        `IvPostalCode='${formValues.zipCode}',` +
        `IvProvideAlt=1,` +
        `IvRegion='${formValues.state}',` +
        `IvStreetLine='${encodeURIComponent(formValues.streetAddress)}')?$format=json`;

      this.spinnerLoading = true;
      this.errorMessage = "";
      this.isInvalidAddress = false;
      this.isSuggestedAddress = false;
      this.addressErrorMsg = "";
      this.ProductService.progressShow('validateAddress', 'validateAddress');
      this.ProductService.validateAddress(payload).subscribe({
        next: (res) => {
          this.ProductService.progressHide('validateAddress');
          this.spinnerLoading = false;
          const EvStatus = res?.d?.EvStatus;
          const EvMessage = res?.d?.EvMessage;
          if(EvStatus == "S"){
            this.orderSampleFlag = true;
            this.validateAddressModal(this.isAtpCheck, "Valid Address");
          }else if(EvStatus == "E" && EvMessage == "Invalid Address"){
            this.isInvalidAddress = true;
            this.invalidShippingAddress("Invalid Address. Do you want to continue with your entered address?");
            this.addressErrorMsg = "Invalid Address";
          }else if(EvStatus == "E" && EvMessage == "Suggested Address"){
            let EsAddress = res?.d?.EsAddress;
            let formatedAddress = `${EsAddress?.Addressline || ""}, ${EsAddress?.Politicaldivision2 || ""}, ${EsAddress?.Politicaldivision1 || ""}, ${EsAddress?.Postcodeprimarylow || ""}`;
            let suggestedAddress = `Suggested Address is : ${formatedAddress} \n\n <br><br>
                                      Do you want to continue with your entered address?`;
            this.invalidShippingAddress(suggestedAddress);
            this.isSuggestedAddress = true;
             this.addressErrorMsg = formatedAddress;
          }else{
            this.invalidShippingAddress("Invalid Address. Do you want to continue with your entered address?");
            this.isInvalidAddress = true;
            this.addressErrorMsg = "Invalid Address";
          }
        },
        error: (err) => {
          this.ProductService.progressHide('validateAddress');
          this.spinnerLoading = false;
        },
      });
    } else {
      this.shippingMethodDropdownData = [];
      this.shippingWareHouseDropdownData = [];
    }
  }

  invalidShippingAddress(EvMessage:any) {
    this.openConfirmationModal({
      title: "Information",
      content: EvMessage,
      primaryActionLabel: "Continue",
      secondaryActionLabel: "Cancel",
      onPrimaryAction: () => {
        if (!this.showOrderSample && !this.isCloneOrders) {
          this.getShippingAddressMethods();
          if (!this.userInfo.isCustomer && !this.userInfo.isSalesPerson && !this.userInfo?.isSalesOps) {
            this.getShippingWareHouseMethods();
          }
        }
        this.scrollPageToTop();
        this.orderSampleFlag = true;
      },
      onSecondaryAction: () => {
        this.orderSampleFlag = false;
        //this.errorMessage = EvMessage;
        this.returnChooseAddress();
      },
    });
  }

  getShippingAddressMethods() {
    console.log("this.userInfo?.isCustomer----->", this.userInfo);
    this.ProductService.getShippingMethodWithOutFlag(
      this.reactiveForm.value.zipCode,
      this.reactiveForm.value.oneTimeShippingAddress,
      this.userInfo?.isCustomer || this.userInfo?.isSalesPerson || this.userInfo?.isSalesOps,
      this.shipViaSelectedOption
    ).subscribe((res: any) => {
      this.shippingMethodDropdownData = [];
      for (let key in res?.body) {
        this.shippingMethodDropdownData.push({
          value: key,
          label: res?.body[key],
        });
      }
      // if (this.shippingMethodDropdownData.length > 0) {
      //   this.reactiveForm.controls["ShipVia"].enable();
      // }
      this.cdr.detectChanges();
    });
  }

  getShippingWareHouseMethods() {
    this.ProductService.getShippingWareHouse(
      true,
      this.reactiveForm.value.zipCode
    ).subscribe((res: any) => {
      this.shippingWareHouseDropdownData = [];
      for (let key in res?.body) {
        this.shippingWareHouseDropdownData.push({
          value: key,
          label: res?.body[key],
        });
      }
      this.cdr.detectChanges();
    });
  }

  @ViewChild("scrollToTop", { read: ElementRef }) scrollToTop: any;
  scrollPageToTop() {
    this.scrollToTop.nativeElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest",
    });
  }
  onSubmitOnetimeShipping(isAtp: boolean): void {
    console.log("isATP --->",isAtp)
    this.submitted = true;

    let payload = {
      firstName: this.reactiveForm.value.name,
      lastName: this.reactiveForm.value.name,
      line1: this.reactiveForm.value.streetAddress,
      line2: this.reactiveForm.value.streetAddress2,
      phone: this.reactiveForm.value.Phone,
      postalCode: this.reactiveForm.value.zipCode,
      town: this.reactiveForm.value.city,
      country: {
        isocode: "US",
      },
      region: {
        isocodeShort: this.reactiveForm.value.state,
      },
    };

    let cartInfo = this.storageService.cartData;
    const cartNumber = cartInfo?.code || null;
    let EvAddressType = "";
    let EvMessage = "";
    let EvStatus = "";
    if(this.initialState?.isForAddAccessories === false || this.initialState?.isForAddAccessories == undefined){
      if(this.reactiveForm.valid && this.isAtpCheck == true ){
        this.storageService.setItem("shippingAddress", this.shippingAddress);
             this.chooseSolutionModal();
      }else{
        this.addTCart();
      }
    }else{
      const initialState: ModalOptions = {
        initialState: {
          cartData: {},
          itemName: {},
          postOrder: false,
          showSuccessAlert: false,
          loadAllAccessoriesDetails: true,
          shippingAddress: this.getAddressForModals(),
          selectedAccessories: this.initialState?.selectedAccessories || null,
          // productCode="C.BC456.683.1300.AB",
        },
      };
      this.bsModalRef = this.modalService.show(
        XchangeAddAccessoriesLightboxComponent,
        Object.assign(initialState, {
          class: "modal-xl modal-dialog-centered xchangeaddaccessorieslightbox",
          backdrop: "static",
          keyboard: false,
        })
      );
      this.bsModalRef.content.type = 2;
    }
  
      // if (
      //   EvAddressType != "R" &&
      //   EvMessage != "Invalid Address" &&
      //   EvStatus == "S" &&
      //   isAtp
      // ) {
      //   if (this.reactiveForm.valid) {
      //     this.storageService.setItem("shippingAddress", this.shippingAddress);
      //     this.chooseSolutionModal();
      //   }
      // }
      // if (
      //   EvAddressType != "R" &&
      //   EvMessage != "Invalid Address" &&
      //   EvStatus == "S" &&
      //   !isAtp
      // ) {
      //   this.addTCart();
      // } else {
      //   this.addTCart();
      // }
    }
  validateAddressModal(isAtp: boolean, errMsg: string) {
    this.checkConfirmation = true;
    this.openConfirmationModal({
      title: "Information",
      content: errMsg,
      primaryActionLabel: "Continue",
      secondaryActionLabel: "",

      onPrimaryAction: () => this.addressSelected(isAtp),
      onSecondaryAction: () => this.returnChooseAddress(),
    });
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
  returnChooseAddress() {
    this.modalService.hide("confirmation");
  }

  addressSelected(isAtp: boolean) {
    this.modalService.hide("confirmation");
    this.getShippingAddressMethods();
    if (!this.userInfo.isCustomer && !this.userInfo.isSalesPerson && !this.userInfo?.isSalesOps) {
      this.getShippingWareHouseMethods();
      }
  }
  viewCartButton = true;
  cartCodeNumber: any = "";
  addTCart() {
    if (this.isCloneOrders) {
      this.cloneOrdersAddtoCart();
    } else {
      let phoneNumber =
        this.reactiveForm.value?.Phone ||
        this.reactiveForm.value?.Phone ||
        "1234567890";
      phoneNumber = phoneNumber
        .replace("(", "")
        .replace(")", "")
        .replace(/ /g, "");
      // this.spinnerLoading = true;
      const data: any = this.initialState;
      const payLoad:any = {
        addressCountry: "US",
        addressCity: !this.reactiveForm.value.oneTimeShippingAddress
          ? this.shippingAddress?.town
            ? this.shippingAddress?.town
            : ""
          : this.reactiveForm.value.city,
        addressLine1: !this.reactiveForm.value.oneTimeShippingAddress
          ? this.shippingAddress?.line1
            ? this.shippingAddress?.line1
            : ""
          : this.reactiveForm.value.streetAddress,
        addressLine2: !this.reactiveForm.value.oneTimeShippingAddress
          ? this.shippingAddress?.line2
            ? this.shippingAddress?.line2
            : ""
          : this.reactiveForm.value.streetAddress2,
        addressName: !this.reactiveForm.value.oneTimeShippingAddress
          ? this.shippingAddress?.companyName
            ? this.shippingAddress?.companyName
            : ""
          : this.reactiveForm.value.name,
        addressPostalCode: !this.reactiveForm.value.oneTimeShippingAddress
          ? this.shippingAddress?.postalCode
            ? this.shippingAddress?.postalCode
            : ""
          : this.reactiveForm.value.zipCode,
        addressState: !this.reactiveForm.value.oneTimeShippingAddress
          ? this.shippingAddress?.region?.isocodeShort
            ? this.shippingAddress?.region?.isocodeShort
            : ""
          : this.reactiveForm.value.state,
        claimNumber: this.reactiveForm.value.hasClaimSubmitted
          ? this.reactiveForm?.value.Claim && this.reactiveForm?.value.Claim.trim()
          : "",
        hasClaimSubmitted: this.reactiveForm.value.hasClaimSubmitted
          ? this.reactiveForm.value.hasClaimSubmitted
          : false,
        invoiceNumber: this.reactiveForm?.value.Invoice
          ? this.reactiveForm?.value.Invoice.trim()
          : "",
        shipToUnit: this.shippingAddress?.shippingAddressID
          ? this.shippingAddress?.shippingAddressID
          : this.shippingAddress?.id,
        reAtp:false,
        // incoTerms:
        //   this.selectedTab == 2
        //     ? this.reactiveForm.value.IncoTerms
        //     : this.shippingAddress?.IncoTerms ||
        //       this.shippingAddress?.defaultIncoTerms ||
        //       this.shippingAddress?.incoTerms,
        item: [
          {
            dyeLot: this.initialState?.feetyardForm?.dye,
            feet:
              this.initialState?.productType === "HARDSURFACE" ||
              (this.initialState.productType === "SOFTSURFACE" &&
                this.initialState.selectedProduct.subProductType ===
                  "CARPETPRODUCT_CARPET_TILE")
                ? Number(0)
                : Number(this.initialState?.feetyardForm?.feet),
            inches:
              this.initialState?.productType === "HARDSURFACE" ||
              (this.initialState.productType === "SOFTSURFACE" &&
                this.initialState.selectedProduct.subProductType ===
                  "CARPETPRODUCT_CARPET_TILE")
                ? Number(0)
                : Number(this.initialState?.feetyardForm?.inches),
            productCode: this.productNumber,
            requestedUOM:
              data?.aptCheckEntrie.length != 0
                ? "LF"
                : this.initialState?.productType === "HARDSURFACE" ||
                  (this.initialState.productType === "SOFTSURFACE" &&
                    this.initialState.selectedProduct.subProductType ===
                      "CARPETPRODUCT_CARPET_TILE") ||
                    (this.initialState.productType === "ACCESSORIES" && this.initialState?.feetyardForm?.unit =='LF')
                ? this.initialState?.inventoryUOM
                : this.initialState?.feetyardForm?.unit,
            requestedQty: this.initialState?.feetyardForm?.requestedQty
              ? this.initialState?.productType === "HARDSURFACE" ||
                (this.initialState.productType === "SOFTSURFACE" &&
                  this.initialState.selectedProduct.subProductType ===
                    "CARPETPRODUCT_CARPET_TILE") ||
                    (this.initialState.productType === "ACCESSORIES" && this.initialState?.feetyardForm?.unit =='LF')
                ? this.initialState?.inventoryUOMConvValue
                  ? this.initialState?.inventoryUOMConvValue
                  : this.initialState?.feetyardForm?.requestedQty
                : this.initialState?.feetyardForm?.requestedQty
              : this.initialState?.feetyardForm?.feet,
            maxFeet: 0,
            maxInches: 0,
            minFeet: 0,
            minInches: 0,
            rollPrices: true,
            incoTerms:
              (this.selectedTab == 2 &&  (!this.showOrderSample && !this.isCloneOrders))
                ? this.reactiveForm.value.IncoTerms
                : this.shippingAddress?.defaultIncoTerms ||
                  this.shippingAddress?.incoTerms,
                  shippingCondition:
                  (this.selectedTab == 2 && (!this.showOrderSample && !this.isCloneOrders))
                    ? this.userInfo.isCustomer === true || this.userInfo.isSalesPerson === true|| this.userInfo.isSalesOps === true ? this.shippingAddress?.originalDefaultShippingMethod || 
                    this.shippingAddress.defaultShippingMethod ||
                      this.shippingAddress.shippingCondition ||
                      "": this.reactiveForm.value.ShipVia
                    : this.userInfo.isCustomer === true || this.userInfo.isSalesPerson === true|| this.userInfo.isSalesOps === true ? this.shippingAddress?.originalDefaultShippingMethod || 
                    this.shippingAddress.defaultShippingMethod ||
                      this.shippingAddress.shippingCondition ||
                      "":this.shippingAddress.defaultShippingMethod ||
                      this.shippingAddress.shippingCondition ||
                      "" ,
            shippingWarehouse:
              (this.selectedTab == 2 && !this.showOrderSample)
                ? this.reactiveForm.value.shippingWareHouse
                : this.shippingAddress.defaultShippingWarehouse ||
                  this.shippingAddress.shippingWarehouse ||
                  "",
            shipVia:
                  (this.selectedTab == 2 && (!this.showOrderSample && !this.isCloneOrders))
                    ? (typeof this.reactiveForm.value?.incoTermsLoc2 == 'object' ? this.reactiveForm.value?.incoTermsLoc2?.label.toUpperCase() :  (this.reactiveForm.value?.incoTermsLoc2 && this.reactiveForm.value?.incoTermsLoc2.toUpperCase() || ""))
                    : this.shippingAddress?.defaultShipVia ||
                      this.shippingAddress?.incoTermsLoc2 ||
                      this.shippingAddress?.shipVia,
            solution: [],
            productPriceData:this.priceDetails,
            sameDyeLot: this.initialState?.sameDyeLot,
          },
        ],
        noPrice: this.shippingAddress?.noPrice
          ? this.shippingAddress?.noPrice
          : true,
        oneTimeShippingAddress: this.selectedTab == 1 ? false : true,
        replacementOrderNumber: this.reactiveForm.value.Order
          ? this.reactiveForm.value.Order.trim()
          : "",
        pdpProductCode: this.productNumber,

        phoneNumber: phoneNumber ? phoneNumber : "1234567890",
        purchaseOrderNumber: this.reactiveForm.value.PO
          ? this.reactiveForm.value.PO.trim()
          : "",
        replacementOrder: this.reactiveForm.value.replacementOrder,
        replacementReason: this.reactiveForm.value.replacementReason
          ? this.reactiveForm.value.replacementReason
          : "",
        requestedDeliveryDate: this.datePipe.transform(
          this.reactiveForm.value.rdd,
          "MM/dd/yyyy"
        ),
        incoTerms:
        (this.selectedTab == 2 &&  (!this.showOrderSample && !this.isCloneOrders))
          ? this.reactiveForm.value.IncoTerms
          : this.shippingAddress?.defaultIncoTerms ||
            this.shippingAddress?.incoTerms,
            shippingCondition:
            (this.selectedTab == 2 && (!this.showOrderSample && !this.isCloneOrders))
              ? this.userInfo.isCustomer === true || this.userInfo.isSalesPerson === true|| this.userInfo.isSalesOps === true ? this.shippingAddress?.originalDefaultShippingMethod || 
              this.shippingAddress.defaultShippingMethod ||
                this.shippingAddress.shippingCondition ||
                "": this.reactiveForm.value.ShipVia
              : this.userInfo.isCustomer === true || this.userInfo.isSalesPerson === true|| this.userInfo.isSalesOps === true ? this.shippingAddress?.originalDefaultShippingMethod || 
              this.shippingAddress.defaultShippingMethod ||
                this.shippingAddress.shippingCondition ||
                "":this.shippingAddress.defaultShippingMethod ||
                this.shippingAddress.shippingCondition ||
                "" ,
        shippingWarehouse:
        (this.selectedTab == 2 &&  (!this.showOrderSample && !this.isCloneOrders))
          ? this.reactiveForm.value.shippingWareHouse
          : this.shippingAddress.defaultShippingWarehouse ||
            this.shippingAddress.shippingWarehouse ||
            "",
        shipVia:
            (this.selectedTab == 2 &&  (!this.showOrderSample && !this.isCloneOrders))
              ? (typeof this.reactiveForm.value?.incoTermsLoc2 == 'object' ? this.reactiveForm.value?.incoTermsLoc2?.label.toUpperCase() :  (this.reactiveForm.value?.incoTermsLoc2 && this.reactiveForm.value?.incoTermsLoc2.toUpperCase() || ""))
              : this.shippingAddress?.defaultShipVia ||
                this.shippingAddress?.incoTermsLoc2 ||
                this.shippingAddress?.shipVia,
        sampleProduct: this.shippingAddress?.sampleProduct
          ? this.shippingAddress?.sampleProduct
          : false,
        sampleType: this.shippingAddress?.sampleType
          ? this.shippingAddress?.sampleType
          : "",
        // shippingCondition:
        //   this.shippingAddress.defaultShippingMethod ||
        //   this.shippingAddress.shippingCondition ||
        //   "",
        // shippingWarehouse:
        //   this.shippingAddress.defaultShippingWarehouse ||
        //   this.shippingAddress.shippingWarehouse ||
        //   "",
        // shipVia:
        //   this.shippingAddress?.defaultShipVia ||
        //   this.reactiveForm.value.incoTermsLoc2 ||
        //   this.shippingAddress?.shipVia,
        orderSamples: this.shippingAddress?.orderSamples
          ? this.shippingAddress?.orderSamples
          : [],
        carrierNumber:
          this.selectedTab == 1
            ? this.selectedCarrierOption == null
              ? undefined
              : this.selectedCarrierOption
            : this.reactiveForm.value.carrierNumber == null
            ? undefined
            : this.reactiveForm.value.carrierNumber,
        satellite: this.shippingAddress?.satellite?.code,
        soldTo: this.isShipToUser ? this.soldToAccount : this.uid,
        orderPlacedSite: "xchange",
        shippingInfo: !this.reactiveForm.value.oneTimeShippingAddress
          ? ""
          : {
              acceptDate: this.reactiveForm?.value.lastestacceptDate
                ? this.datePipe.transform(
                    this.reactiveForm?.value.lastestacceptDate,
                    "MM/dd/yyyy"
                  )
                : "",
              apptNeeded: this.reactiveForm.value.appoinment,
              forkLiftRequired: this.reactiveForm.value.accomodate,
              jobSiteDelivery: this.reactiveForm.value.jobsiteDelivery,
              largestTruckSize: this.reactiveForm.value.truckSize,
              liftGateAndPallet: this.reactiveForm.value.liftGateAndPallet,
              loadingDock: this.reactiveForm.value.loading,
              location: this.reactiveForm.value.Location,
              poleLiftRequired: this.reactiveForm.value.poleLift,
              // requireNotification: this.reactiveForm.value.notification,
              siteContactName: this.reactiveForm.value.ContactName,
              siteContactPhone: this.reactiveForm.value.Phone,
              storeNumber: this.reactiveForm.value.storeNumber,
            },
        isAccessoryCart: this.selectedProduct?.classification == "Accessories" ? true : false
      };
      this.storageService.setItem("atpCheckData", this.atpCheckData);
      this.storageService.setItem("shippingAddress", this.shippingAddress);
      this.cartData = this.storageService.cartData;
      const cartNumber = this.cartData?.code || null;
      this.cartCodeNumber = cartNumber;
      if(this.initialState?.bundleProduct){
        payLoad.bundleProduct = this.initialState?.bundleProduct;
      }
      this.ProductService.progressShow('addToCart', 'addToCartId');
      this.ProductService.addToCart(
        this.userService.getUserEmail().toLowerCase(),
        cartNumber,
        payLoad
      ).subscribe({
        next: (res) => {
          this.spinnerLoading = false;
          if (
            !res?.body?.errorMessages &&
            !(
              res.body.hasOwnProperty("messages") &&
              res?.body?.messages?.length > 0 &&
              (res?.body?.messages[0]?.status === "Error" ||
                res?.body?.messages[1]?.status === "Error")
            )
          ) {
            this.spinnerLoading = false;
            this.storageService.getItem("uid").subscribe((res) => {
              this.uid = res;
            });

            if (
              res?.body?.entries[0]?.hasOwnProperty("alternateProductCode") &&
              res?.body?.entries[0]?.alternateProductCode != ""
            ) {
              this.storageService.setItem(
                "addToCartSuccessInfo",
                res?.body?.messages[1]?.message
              );
              localStorage.setItem(
                "alternateProductData",
                JSON.stringify(res?.body)
              );
              this.ProductService.progressHide('addToCartId');
              this.router
                .navigateByUrl("/", { skipLocationChange: true })
                .then(() => {
                  this.router.navigateByUrl(
                    "commercial/products/details/" +
                      res?.body?.entries[0]?.alternateProductCode
                  );
                });
              this.destroyAllpoups();
            } else {
              localStorage.removeItem("alternateProductData");
              this.ProductService.getMiniCartData(this.uid).subscribe((res) => {
                this.ProductService.progressHide('addToCartId');
                this.storageService.setItem("miniCartCount", res?.body || res);

                this.cartData = res?.body || res;
                if((this.reactiveForm.value.oneTimeShippingAddress || this.selectedTab == 2) && 
                  (this.isSuggestedAddress || this.isInvalidAddress)){
                  this.addressReqHistory(res?.body?.code);
                }
                const initialState: ModalOptions = {
                  initialState: {
                    // Data to  popup
                    cartData: this.cartData,
                    selectedAccessories:
                      this.initialState?.selectedAccessories || null,
                      sameDyeLot:this.initialState?.sameDyeLot || false,
                  },
                };
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
              });

              // if (res.body.cartNumber && cartNumber == null) {
              //   let cartData = {
              //     code: res.body.cartNumber,
              //     entries: res.body.entries,
              //   };
              //   this.cartData = cartData;
              //   this.storageService.setItem("miniCartCount", cartData);
              // }
            }
          } else {
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });

            this.addtoCartErrorMessage =  (res?.body?.messages || []).filter((err:any)=> err?.status && err?.message);
            // this.addtoCartFailed = true;
            this.spinnerLoading = false;
            this.ProductService.progressHide('addToCartId');
          }
        },
        error: (err) => {
          this.ProductService.progressHide('addToCartId');
          this.addtoCartErrorMessage = err?.error;
          // this.addtoCartFailed = true;
          this.spinnerLoading = false;
        },
      });
    }
  }

  addressReqHistory(cartNumber:any){
    let userAddress = this.userEnteredAddress();
    let payload = {                                                                                                     
      "RequestType": "modify",                                                                            
      "OrderNumber": +cartNumber || '',                                                                               
      "CartNumber": "",                                                                                
      "UserId": this.isShipToUser ? this.soldToAccount : this.uid,                                                                                
      "EmailId": this.userService.getUserEmail().toLowerCase() || '',
      "IsInvalidAddress": this.isInvalidAddress || false,
      "IsSuggestedAddress": this.isSuggestedAddress || false,
      "UserEnteredAddress": userAddress,
      "SystemSuggestedAddress": this.isSuggestedAddress ? this.addressErrorMsg : "",
      "SystemError": this.isInvalidAddress ? this.addressErrorMsg : "",
      "Website": "Xchange",
      "AccountType": "C"
    }
    this.ProductService.addressReqHistory(payload).subscribe({
      next: (res: any) => {
      },
      error: (err: any) => {
      }
    });
  }

 userEnteredAddress() {
    let formattedAddress = this.reactiveForm.value?.streetAddress + ", " + this.reactiveForm.value?.streetAddress2 +
      this.reactiveForm.value?.city +", " + this.reactiveForm.value?.state +", " + this.reactiveForm.value?.zipCode;
    return formattedAddress;
 }

  cloneOrdersAddtoCart() {
    this.spinnerLoading = true;
    this.ProductService.getMiniCartForCloneOrders(
      this.storageService.selectedCloneOrders?.selectedLines[0].uid
    ).subscribe((res: any) => {
      if (res?.body?.code) {
        this.ProductService.cancelCart(
          this.cartData?.code || "123456"
        ).subscribe({
          next: (res) => {
            this.addToCartForCloneOrders();
          },
          error: (error: any) => {
            this.spinnerLoading = false;
            // this.addtoCartFailed = true;
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });

            this.cartData = {};
            this.alert = "Cancel Cart Failed";
          },
        });
      } else {
        this.addToCartForCloneOrders();
      }
    });
  }
  addToCartForCloneOrders() {
    this.spinnerLoading = true;
    const payLoad = {
      addressCountry: "US",
      addressCity: !this.reactiveForm.value.oneTimeShippingAddress
        ? this.shippingAddress?.town
          ? this.shippingAddress?.town
          : ""
        : this.reactiveForm.value.city,
      addressLine1: !this.reactiveForm.value.oneTimeShippingAddress
        ? this.shippingAddress?.line1
          ? this.shippingAddress?.line1
          : ""
        : this.reactiveForm.value.streetAddress,
      addressLine2: !this.reactiveForm.value.oneTimeShippingAddress
        ? this.shippingAddress?.line2
          ? this.shippingAddress?.line2
          : ""
        : this.reactiveForm.value.streetAddress2,
      addressName: !this.reactiveForm.value.oneTimeShippingAddress
        ? this.shippingAddress?.companyName
          ? this.shippingAddress?.companyName
          : ""
        : this.reactiveForm.value.name,
      addressPostalCode: !this.reactiveForm.value.oneTimeShippingAddress
        ? this.shippingAddress?.postalCode
          ? this.shippingAddress?.postalCode
          : ""
        : this.reactiveForm.value.zipCode,
      addressState: !this.reactiveForm.value.oneTimeShippingAddress
        ? this.shippingAddress?.region?.isocodeShort
          ? this.shippingAddress?.region?.isocodeShort
          : ""
        : this.reactiveForm.value.state,
      oneTimeShippingAddress: this.selectedTab == 1 ? false : true,
      requestedDeliveryDate: this.datePipe.transform(
        this.reactiveForm.value.rdd,
        "MM/dd/yyyy"
      ),
      shippingCondition:
              (this.selectedTab == 2 && (!this.showOrderSample && !this.isCloneOrders))
                ? this.userInfo.isCustomer === true || this.userInfo.isSalesPerson === true|| this.userInfo.isSalesOps === true ? this.shippingAddress?.originalDefaultShippingMethod || 
                this.shippingAddress.defaultShippingMethod ||
                  this.shippingAddress.shippingCondition ||
                  "": this.reactiveForm.value.ShipVia
                : this.userInfo.isCustomer === true || this.userInfo.isSalesPerson === true|| this.userInfo.isSalesOps === true ? this.shippingAddress?.originalDefaultShippingMethod || 
                this.shippingAddress.defaultShippingMethod ||
                  this.shippingAddress.shippingCondition ||
                  "":this.shippingAddress.defaultShippingMethod ||
                  this.shippingAddress.shippingCondition ||
                  "" ,
      shippingWarehouse:
        this.shippingAddress.defaultShippingWarehouse ||
        this.shippingAddress.shippingWarehouse ||
        "",
      shipVia:
        this.shippingAddress?.incoTermsLoc2 || this.shippingAddress?.shipVia,
      incoTerms:
        this.shippingAddress?.IncoTerms ||
        this.shippingAddress?.defaultIncoTerms,
      soldTo:  this.soldToAccount,
      shippingInfo: !this.reactiveForm.value.oneTimeShippingAddress
        ? ""
        : {
            acceptDate: this.reactiveForm?.value.lastestacceptDate
              ? this.datePipe.transform(
                  this.reactiveForm?.value.lastestacceptDate,
                  "MM/dd/yyyy"
                )
              : "",
            apptNeeded: this.reactiveForm.value.appoinment,
            forkLiftRequired: this.reactiveForm.value.accomodate,
            jobSiteDelivery: this.reactiveForm.value.jobsiteDelivery,
            largestTruckSize: this.reactiveForm.value.truckSize,
            liftGateAndPallet: this.reactiveForm.value.liftGateAndPallet,
            loadingDock: this.reactiveForm.value.loading,
            location: this.reactiveForm.value.Location,
            poleLiftRequired: this.reactiveForm.value.poleLift,
            // requireNotification: this.reactiveForm.value.notification,
            siteContactName: this.reactiveForm.value.ContactName,
            siteContactPhone: this.reactiveForm.value.Phone,
            storeNumber: this.reactiveForm.value.storeNumber,
            // acknowledge: this.reactiveForm.value.storeNumber,
          },
    };
    this.ProductService.progressShow('addToCart', 'addToCartId');
    this.cloneOrdersService
      .cloneOrdersAddtoCart(
        this.storageService.selectedCloneOrders?.sampleOrder,
        this.shippingAddress.id,
        payLoad
      )
      .subscribe(
        (res: any) => {
          this.ProductService.progressHide('addToCartId');
          this.spinnerLoading = false;
          if (res.status === 200) {
            if (res.body?.messages[0].status == "Error") {
              this.alert = res.body?.messages[0].message;
              this.setCloneOrdersItems();
            } else {
              this.ProductService.cloneOrderCartId = res.body?.cartNumber;
              // this.ProductService.getLatestMiniCart(this.ProductService.selectedCloneOrders?.selectedLines[0].uid);
              this.ProductService.getMiniCartData(
                this.storageService.selectedCloneOrders?.selectedLines[0].uid
              ).subscribe((res: any) => {
                this.cartData = res?.body || res;
                this.storageService.setItem("miniCartCount", this.cartData);

                this.rediretToCart();
              });
            }
          } else {
            this.alert = res?.message;
            this.setCloneOrdersItems();
          }
        },
        (error) => {
          this.ProductService.progressHide('addToCartId');
          this.spinnerLoading = false;
        }
      );
  }
  onReset(): void {
    this.submitted = false;
    this.reactiveForm.patchValue({
      name: "",
      streetAddress: "",
      city: "",
      streetAddress2: "",
      state: null,
      zipCode: "",
      Claim: "",
      ShipVia: null,
      replacementReason: null,
      PO: "",
      Order: "",
      Invoice: "",
      ContactName: "",
      Phone: "",
      Location: null,
      hasClaimSubmitted: null,
      replacementOrder: false,
      oneTimeShippingAddress: false,
      siteInfo: false,
      carrierNumber: null,
      // notification: null,
      loading: null,
      offloading: true,
      accomodate: null,
      acknowledge: null,
      jobsiteDelivery: null,
      appoinment: null,
      liftGateAndPallet: null,
      palletJack: null,
      poleLift: null,
      // insideDelivery: null,
      // whiteGloveDelivery: null,
      // multipleStops: null,
      storeNumber: "",
      truckSize: null,
      lastestacceptDate: new Date(),
      incoTermsLoc2: null,
      shippingWareHouse: null,
      rdd: new Date()
    });
  }
  validateNo(e: any, maxLength = 13) {
    const charCode = e.which ? e.which : e.keyCode;
    if (
      (charCode > 31 && (charCode < 48 || charCode > 57)) ||
      e.target.value.length == maxLength
    ) {
      return false;
    }
    return true;
  }
  validatePO(e: any) {
    return /^[a-z0-9 !@#-]$/i.test(e.key);
  }

  checkPhoneValidation(e: any) {
    const phoneCharLength = 10;
    let val = e?.target?.value ? e.target.value : e;
    if (
      val.length == phoneCharLength &&
      this.reactiveForm.controls["Phone"].valid
    ) {
      this.reactiveForm.controls["Phone"].clearValidators();
      this.reactiveForm.controls["Phone"].updateValueAndValidity();
      this.reactiveForm.patchValue({
        Phone: this.convertToUsPhoneFormat(val),
      });

      this.reactiveForm.controls["Phone"].setValidators([Validators.required]);
      this.reactiveForm.controls["Phone"].updateValueAndValidity();
    } else {
      let onlyNumbers = this.clearSpeacialCharsFromPhoneNumber(val);
      if (onlyNumbers.length == phoneCharLength) {
        this.reactiveForm.patchValue({
          Phone: this.convertToUsPhoneFormat(onlyNumbers),
        });
        this.reactiveForm.controls["Phone"].setValidators([
          Validators.required,
        ]);
      } else {
        this.reactiveForm.patchValue({
          Phone: onlyNumbers,
        });
        this.reactiveForm.controls["Phone"].setValidators([
          Validators.required,
          Validators.pattern(this.phonePattern),
        ]);
      }
      this.reactiveForm.controls["Phone"].updateValueAndValidity();
    }
  }

  clearSpeacialCharsFromPhoneNumber(val: any) {
    val = this.removeChar(val, " ");
    val = this.removeChar(val, " ");
    val = this.removeChar(val, "(");
    val = this.removeChar(val, ")");
    return val;
  }

  removeChar(val: any, char: any) {
    let index = val.indexOf(char);
    return index >= 0 ? val.slice(0, index) + val.slice(index + 1) : val;
  }

  convertToUsPhoneFormat(val: any) {
    let formatedValue = "(";
    formatedValue += val.substring(0, 3) + ") ";
    formatedValue += val.substring(3, 6) + " ";
    formatedValue += val.substring(6, 10);
    return formatedValue;
  }
  changeTab(index: number) {
    this.addtoCartErrorMessage = [];
    this.shippingAddress.carrierNumber = undefined;
    this.shippingAddress.satellite = undefined;
    this.satellite = "";
    this.selectedTab = index;
    this.carrierOptionList = [];
    this.errorMessage = "";
    if (index == 1) {
      this.onReset();
      this.getShippingAddress();
      this.getShippingAddressTotal();
      this.reactiveForm.patchValue({
        oneTimeShippingAddress: false,
      });
      this.clearValidation();
      this.changeValidatorsRequired("rdd");
    } else if (index == 2) {
      this.onReset();
      this.shippingMethodDropdownData = [];
      this.shippingWareHouseDropdownData=[];
      this.reactiveForm.patchValue({
        oneTimeShippingAddress: true,
      });
      this.clearValidation();

      this.changeValidatorsRequired("name");
      this.changeValidatorsRequired("streetAddress");
      this.changeValidatorsRequired("city");
      this.changeValidatorsRequired("state");
      this.changeValidatorsRequired("zipCode");
      this.changeValidatorsRequired("acknowledge");
      this.changeValidatorsRequired("ContactName");
      this.reactiveForm.controls["Phone"].setValidators([
        Validators.required,
        Validators.pattern(this.phonePattern),
      ]);
      this.reactiveForm.controls["Phone"].updateValueAndValidity();
      if (!this.showOrderSample && !this.isCloneOrders) {
        // this.changeValidatorsRequired("notification");
        this.changeValidatorsRequired("loading");
        this.changeValidatorsRequired("poleLift");
        this.changeValidatorsRequired("accomodate");
        this.changeValidatorsRequired("jobsiteDelivery");
        this.changeValidatorsRequired("appoinment");
        this.changeValidatorsRequired("liftGateAndPallet");
        this.changeValidatorsRequired("lastestacceptDate");
        this.changeValidatorsRequired("truckSize");
        this.changeValidatorsRequired("Location");
        this.changeValidatorsRequired("rdd");
      }
    }
    Object.keys(this.reactiveForm.controls).forEach((key) => {
      const control = this.reactiveForm.controls[key];

      control.markAsPristine();
      control.markAsUntouched();
    });
  }
  clearValidation() {
    Object.keys(this.reactiveForm.controls).forEach((key) => {
      const control = this.reactiveForm.controls[key];
      control.clearValidators();
      control.updateValueAndValidity();
      control.markAsPristine();
      control.markAsUntouched();
    });
  }
  changeValidatorsRequired(key: string) {
    this.reactiveForm.controls[key].setValidators(Validators.required);
    this.reactiveForm.controls[key].updateValueAndValidity();
  }
  changeValidatorsNull(key: string, isRemoveValue: boolean = false) {
    let controls = this.reactiveForm.controls[key];
    controls.clearValidators();
    controls.updateValueAndValidity();
    if (isRemoveValue) {
      controls.setValue(undefined);
    }
  }

  changeEventSite(
    event: any,
    num: number,
    id_first: string,
    id_second: string
  ) {
    this.reactiveForm.patchValue({
      siteInfo: !this.reactiveForm.value.siteInfo,
    });

    if (this.reactiveForm.value.siteInfo) {
      this.radioButtonCheckBoxes(id_first, true);
      this.radioButtonCheckBoxes(id_second, false);
    } else {
      this.radioButtonCheckBoxes(id_first, false);
      this.radioButtonCheckBoxes(id_second, true);
    }
  }
  changeTickMark(
    val: boolean,
    id_first: string,
    id_second: string,
    key: string
  ) {
    this.reactiveForm.controls[key].setValue(val);
    if (this.reactiveForm.value[key]) {
      this.radioButtonCheckBoxes(id_first, true);
      this.radioButtonCheckBoxes(id_second, false);
    } else {
      this.radioButtonCheckBoxes(id_first, false);
      this.radioButtonCheckBoxes(id_second, true);
    }
  }
  onSelectionChangeLargestTruck(event: any) {
    if (this.reactiveForm.value.truckSize) {
      this.showMessage = true;
    } else {
      this.showMessage = false;
    }
  }
  changeEventAcknowledge(event: any) {
    this.reactiveForm.patchValue({
      acknowledge: event?.state ? true : null,
    });
  }

  setDefaultAddressData() {
    this.atpCheckData = {
      addressCity: !this.reactiveForm.value.oneTimeShippingAddress
        ? this.shippingAddress?.town
          ? this.shippingAddress?.town
          : ""
        : this.reactiveForm.value.city,
      addressLine1: !this.reactiveForm.value.oneTimeShippingAddress
        ? this.shippingAddress?.line1
          ? this.shippingAddress?.line1
          : ""
        : this.reactiveForm.value.streetAddress,
      addressLine2: !this.reactiveForm.value.oneTimeShippingAddress
        ? this.shippingAddress?.line2
          ? this.shippingAddress?.line2
          : ""
        : this.reactiveForm.value.streetAddress2,
      addressName: !this.reactiveForm.value.oneTimeShippingAddress
        ? this.shippingAddress?.companyName
          ? this.shippingAddress?.companyName
          : ""
        : this.reactiveForm.value.name,
      addressPostalCode: !this.reactiveForm.value.oneTimeShippingAddress
        ? this.shippingAddress?.postalCode
          ? this.shippingAddress?.postalCode
          : ""
        : this.reactiveForm.value.zipCode,
      addressState: !this.reactiveForm.value.oneTimeShippingAddress
        ? this.shippingAddress?.region?.isocodeShort
          ? this.shippingAddress?.region?.isocodeShort
          : ""
        : this.reactiveForm.value.state,
      entries: this.pdpdata,
      claimNumber: this.reactiveForm.value.hasClaimSubmitted
        ? this.reactiveForm.value.Claim &&this.reactiveForm.value.Claim.trim()
        : "",
      distributionChannel: "01",
      division: "02",

      hasClaimSubmitted: this.reactiveForm.value.hasClaimSubmitted,
      invoiceNumber: this.reactiveForm.value.Invoice
        ? this.reactiveForm.value.Invoice.trim()
        : "",
      oneTimeShippingAddress: this.reactiveForm.value.oneTimeShippingAddress,
      orderNumber: this.reactiveForm.value.Order
        ? this.reactiveForm.value.Order.trim()
        : "",
      purchaseOrderNumber: this.reactiveForm.value.PO
        ? this.reactiveForm.value.PO.trim()
        : "",
      replacementOrder: this.reactiveForm.value.replacementOrder,
      replacementReason: this.reactiveForm.value.replacementReason
        ? this.reactiveForm.value.replacementReason
        : "",
      salesOrganization: "0123",
      shipTo: this.shippingAddress?.shippingAddressID
        ? this.shippingAddress?.shippingAddressID
        : this.shippingAddress?.id,
      shipVia: "",
      shippingAddressID: this.shippingAddress?.shippingAddressID
        ? this.shippingAddress?.shippingAddressID
        : this.shippingAddress?.id,
      shippingMethod: this.shippingAddress.defaultShippingMethod,
      defaultShippingMethod: this.shippingAddress?.defaultShippingMethod
        ? this.shippingAddress?.defaultShippingMethod
        : "",
      defaultShippingConditionDesc: this.shippingAddress
        ?.defaultShippingConditionDesc
        ? this.shippingAddress?.defaultShippingConditionDesc
        : "",
      defaultShippingWarehouse: this.shippingAddress?.defaultShippingWarehouse
        ? this.shippingAddress?.defaultShippingWarehouse
        : "",
      defaultShippingWarehouseDesc: this.shippingAddress
        ?.defaultShippingWarehouseDesc
        ? this.shippingAddress?.defaultShippingWarehouseDesc
        : "",
      shippingInfo: {
        jobSite: this.reactiveForm.value.oneTimeShippingAddress
          ? this.reactiveForm.value.siteInfo
          : "",
        loadingDock: this.reactiveForm.value.oneTimeShippingAddress
          ? this.reactiveForm.value.loading
          : "",
        location: this.reactiveForm.value.oneTimeShippingAddress
          ? this.reactiveForm.value.Location
          : "",
        offloadEqptRequired: this.reactiveForm.value.oneTimeShippingAddress
          ? this.reactiveForm.value.offloading
          : "",
        // requireNotification: this.reactiveForm.value.oneTimeShippingAddress
        //   ? this.reactiveForm.value.notification
        //   : "",
        siteContactName: this.reactiveForm.value.oneTimeShippingAddress
          ? this.reactiveForm.value.ContactName
          : "",
        siteContactPhone: this.reactiveForm.value.oneTimeShippingAddress
          ? this.reactiveForm.value.Phone
          : "",
        unLoadAssistance: this.reactiveForm.value.oneTimeShippingAddress
          ? this.reactiveForm.value.accomodate
          : "",
      },
      soldTo: this.isShipToUser ? this.soldToAccount : this.uid,
      newShippingAddress:
        this.selectedTab == 1 ? this.shippingAddress : this.reactiveForm.value,
      requestedDeliveryDate: this.datePipe.transform(
        this.reactiveForm.value.rdd,
        "MM/dd/yyyy"
      ),
      rdd: this.reactiveForm?.value?.rdd || "",
    };

    this.storageService.setItem("defaultAddres", this.atpCheckData);
    if (this.shippingAddress) {
      this.addressSpinnerLoading = false;
    }
  }

  // setDefault() {
  //   this.getShippingAddress();
  // }
  destroyAllpoups() {
    this.modalService.hide();
    // this.modalService.hide("XchangeAddAccessoriesLightboxComponent")
    // this.modalService.hide("AddCompanionProductsComponent")
    // this.modalService.hide("ChooseAddressLightboxComponent")
  }
  requestFrom: any = "commercial";
  getUrlparams() {
    this.requestFrom = this.router.url.split("/")[1];
  }

  rediretToCart() {
    this.destroyAllpoups();
    let navigateURL = this.requestFrom + "/cart";
    this.router.navigateByUrl(navigateURL);
  }

  nameRegix = /[a-zA-Z- ]/;
  allowOnlyAlphaAndSpaces(event: any) {
    if (this.nameRegix.test(event.keyCode)) {
      return true;
    } else {
      event.preventDefault();
      return false;
    }
  }
  closeChangeDateModal() {
    this.modalRef?.hide();
  }
  changeDateModal(changeDataTemplate: TemplateRef<any>) {
    this.modalRef = this.modalService.show(changeDataTemplate, {
      id: "changeDateModalFromAddress",
      class: "modal-md modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }
  dateChangeConfirmClick(datePickRef: any) {
    this.reactiveForm.controls["rdd"].setValue(datePickRef.value);
    this.modalRef?.hide();
  }
  keyPressForZip(e: KeyboardEvent) {
    return /^[a-z,A-Z, ,0-9]$/i.test(e.key);
  }

  shipViaSelectedOption: any = "";
  incoTermsSelectedOption: any = "";
  incoTermsOptions: any = [];
  originalDefaultSM:any='';
  changeshipViaOptions(event: any) {
    if (this.userInfo?.isCustomer || this.userInfo?.isSalesPerson || this.userInfo?.isSalesOps) {
      this.spinnerLoading = false;

      this.shippingWareHouseOptions = [];
      this.shippingWareHouseOptions.push({
        value: this.shippingAddress?.defaultShippingWarehouse,
        label: this.shippingAddress?.defaultShippingWarehouseDesc,
      });
      this.orderService
        .getShippingoptionForCustomers(
          this.shippingAddress.postalCode,
          this.shipViaSelectedOption,
          this.shippingWareHouseSelectedOption,
          this.reactiveForm.value.oneTimeShippingAddress,
          this.uid
        )
        .subscribe({
          next: (res) => {
            this.showValidationError = false;
            console.log("res---->",res);
            if(res?.body?.incoTerms || res?.body?.shipvia){
                this.spinnerLoading = false;
                this.incoTermsOptions = [];
                this.incoTermsLoc2Options = [];
                this.incoTermsOptions.push({
                  value: res.body.incoTerms,
                  label: res.body.incoTermsDesc,
                });
                this.incoTermsLoc2Options.push({
                  value: res.body.shipvia,
                  label: res.body.shipViaDesc,
                });
                this.incoTermsSelectedOption = this.incoTermsOptions[0].value;
                this.incoTermsLoc2SelectedOption = res.body.shipvia;

                this.originalDefaultSM = res?.body?.originalDefaultShippingMethod;
               


            }
            else{
                  this.spinnerLoading = false;
                  this.showValidationError = true;
                   this.validationErrorMessage = "Shipping Options are not available for customer"
                    this.addtoCartErrorMessage = [
                        ...[],
                        ...[{ message: this.validationErrorMessage }],
                    ];
                    setTimeout(() => {
                        this.addtoCartErrorMessage = [];
                    }, 8000);
                  }
          },
          error: (err) => {
            this.spinnerLoading = false;
          },
        });
    } else {
      this.shipViaSelectedOption = event;

      this.getIncoTerms(event);

      const selectedShippingWHOption = this.shippingWareHouseOptions.find(
        (item: any) => item.value === this.shippingWareHouseSelectedOption
      );
      this.incoTermsLoc2SelectedOption = null;
      this.getIncoTermsLoc2SM(selectedShippingWHOption?.value);
    }
  }

  getIncoTermsLoc2SM(shippingWareHouse: any) {
    this.incoTermsLoc2Options = [];
    // this.incoTermsLoc2Options = [
    //   { value: "CWC", label: "CWC" },
    //   { value: "GBP", label: "GBP" },
    //   { value: "BF62", label: "BF62" },
    //   { value: "UPS", label: "UPS" },
    //   { value: "UTP0", label: "UTP0" },
    //   { value: "CSC", label: "CSC" },
    //   { value: "ANC", label: "ANC" },
    //   { value: "SELF", label: "SELF" },
    //   { value: "STP0", label: "STP0" },
    //   { value: "FFE", label: "FFE" },
    //   { value: "MWC0", label: "MWC0" },
    //   { value: "UTB3", label: "UTB3" },
    //   { value: "HO11", label: "HO11" },
    //   { value: "TPU0", label: "TPU0" },
    //   { value: "CSE", label: "CSE" },
    //   { value: "MCP0", label: "MCP0" },
    // ];
    let postalCode = this.shippingAddress?.postalCode;
    if (this.shippingAddress?.postalCode.includes("-")) {
      postalCode = this.shippingAddress?.postalCode.split("-")[0];
    }
    this.incoTermsLoc2Options = [];
    const selectedShippingMethod = this.shipViaOptions.find(
      (item: any) => item.value === this.shipViaSelectedOption
    );
    this.incoTermsLoc2Options = [];
    this.orderService
      .getIncoTermsLoc2(
        postalCode,
        shippingWareHouse,
        this.shipViaSelectedOption
      )
      .subscribe({
        next: (res) => {
          const resObject = res?.body;
          const objectKeys = Object.keys(resObject).sort();
          objectKeys.forEach((key) => {
            this.incoTermsLoc2Options.push({
              value: resObject[key].shipvia,
              label: resObject[key].shipViaDesc,
              preferred: resObject[key].preferred
            });
          });
        },
        error: (err) => {},
      });
  }
  getIncoTerms(shipVia: any) {
    this.incoTermsOptions = [];
    this.orderService.getIncoTerms(shipVia).subscribe({
      next: (res) => {
        this.setLoadAPI("IncoTerms");
        const resObject = res?.body;
        const objectKeys = Object.keys(resObject).sort();
        objectKeys.forEach((key) => {
          this.incoTermsOptions.push({
            value: key,
            label: resObject[key],
          });
        });
        if (this.incoTermsOptions.length === 0) {
          this.incoTermsOptions.push({
            value: this.shippingAddress?.defaultIncoTerms,
            label: this.shippingAddress?.defaultIncoTermsDesc,
          });
        }
      },
      error: (err) => {this.setLoadAPI("IncoTerms");},
    });
  }
  changeincoTermsOptions(event: any) {
    this.incoTermsSelectedOption = event;
  }

  shippingWareHouseSelectedOption: any = "";
  incoTermsLoc2SelectedOption: any = "";
  incoTermsLoc2Options: any = [];
  changeShippingWareHouseOptions(event: any) {
    this.shippingWareHouseSelectedOption = event;
    this.getIncoTermsLoc2(event);
  }

  getIncoTermsLoc2(shippingWareHouse: any) {
    this.incoTermsLoc2Options = [];
    let zipCode = !this.reactiveForm.value.oneTimeShippingAddress
      ? this.shippingAddress?.postalCode
        ? this.shippingAddress?.postalCode
        : ""
      : this.reactiveForm.value.zipCode;

    if (zipCode.includes("-")) {
      zipCode = zipCode.split("-")[0];
    }
    let selectedShippingMethod = this.shipViaOptions.find(
      (item: any) => item.value.trim() === this.shipViaSelectedOption
    );
    if (selectedShippingMethod === undefined || selectedShippingMethod === "") {
      selectedShippingMethod = this.shipViaOptions.find(
        (item: any) => item.label.trim() === this.shipViaSelectedOption
      );
    }
    this.orderService
      .getIncoTermsLoc2(
        zipCode,
        shippingWareHouse,
        selectedShippingMethod?.value
      )
      .subscribe({
        next: (res) => {this.setLoadAPI("ShipVia");
          this.spinnerLoading = false;
          const resObject = res?.body;
          const objectKeys = Object.keys(resObject).sort();
          objectKeys.forEach((key) => {
            this.incoTermsLoc2Options.push({
              value: resObject[key].shipvia,
              label: resObject[key].shipViaDesc,
              preferred: resObject[key].preferred
            });
          });
        },
        error: (err) => {this.setLoadAPI("ShipVia");},
      });
    // this.incoTermsLoc2Options = [
    //   { value: "CWC", label: "CWC" },
    //   { value: "GBP", label: "GBP" },
    //   { value: "BF62", label: "BF62" },
    //   { value: "UPS", label: "UPS" },
    //   { value: "UTP0", label: "UTP0" },
    //   { value: "CSC", label: "CSC" },
    //   { value: "ANC", label: "ANC" },
    //   { value: "SELF", label: "SELF" },
    //   { value: "STP0", label: "STP0" },
    //   { value: "FFE", label: "FFE" },
    //   { value: "MWC0", label: "MWC0" },
    //   { value: "UTB3", label: "UTB3" },
    //   { value: "HO11", label: "HO11" },
    //   { value: "TPU0", label: "TPU0" },
    //   { value: "CSE", label: "CSE" },
    //   { value: "MCP0", label: "MCP0" },
    // ];
  }

  changeIncoTermsLoc2Options(event: any) {
    this.incoTermsLoc2SelectedOption = event;
  }

  shipViaOptions: any = [];
  shipViaType: string = "";
  shipViaModal(template: TemplateRef<any>, type: any) {
    this.shipViaOptions = [];
    this.shipViaType = type;
    this.ProductService.getShippingMethodWithOutFlag(
      this.shippingAddress?.postalCode,
      this.shippingAddress.oneTimeShippingAddress === undefined
        ? false
        : this.shippingAddress.oneTimeShippingAddress,
        this.userInfo?.isCustomer || this.userInfo?.isSalesPerson || this.userInfo?.isSalesOps,
      this.shipViaSelectedOption
    ).subscribe((res: any) => {
      if (res?.body) {
        this.shipViaOptions = [];
        for (let key of Object.entries(res?.body)) {
          this.shipViaOptions.push({
            value: key[0],
            label: key[1],
          });
        }
        // this.shipViaSelectedOption = this.shipViaOptions[0];
      }
      this.shipViaSelectedOption =
        this.shippingAddress?.defaultShippingMethod ||
        this.shipViaOptions[0].value;
      this.incoTermsSelectedOption = this.shippingAddress?.defaultIncoTerms;
      this.getIncoTerms(this.shipViaSelectedOption);
      this.modalRef = this.modalService.show(template, {
        id: "shipViaModal",
        class: "modal-md modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      });
    });
  }
  hideShipViaModal() {
    this.modalService.hide("shipViaModal");
  }

  shippingAddressess: any = "";
  shipViaModalSubmit() {
    const selectedItem = this.shipViaOptions.find(
      (item: any) =>
        item.value === this.shipViaSelectedOption ||
        item.label.trim() === this.shipViaSelectedOption.trim()
    );
    const selectedIncoTermsItem = this.incoTermsOptions.find(
      (item: any) =>
        item.value === this.incoTermsSelectedOption ||
        item.label.trim() === this.incoTermsSelectedOption
    );

    this.shippingAddress.defaultShippingMethod = selectedItem?.value;
    this.shippingAddress.defaultShippingConditionDesc = selectedItem?.label;
    this.shippingAddress.defaultIncoTerms = selectedIncoTermsItem?.value;
    this.shippingAddress.defaultIncoTermsDesc = selectedIncoTermsItem?.label;
    this.storageService.setItem("shippingAddress", this.shippingAddress);

    this.shippingAddress.carrierNumber = undefined;
    this.shippingAddress.satellite = undefined;
    this.satellite = "";
    this.selectedCarrierOption = null;
    this.reactiveForm.controls["carrierNumber"].setValue(null);
    this.carrierOptionList = [];

    if (this.shippingAddress.defaultShippingMethod == "CA") {
      let shipTo = this.shippingAddress?.shippingAddressID
        ? this.shippingAddress?.shippingAddressID
        : this.shippingAddress?.id;
      this.shippingMethodVendorAccountNumbers(shipTo, shipTo);
    }
    /* if (this.shippingAddress.defaultShippingMethod == "PS") {
      let zipCode = !this.reactiveForm.value.oneTimeShippingAddress
        ? this.shippingAddress?.postalCode
          ? this.shippingAddress?.postalCode
          : ""
        : this.reactiveForm.value.zipCode;
      this.shippingMethodZoneZipcodeDetermination(zipCode);
    } */
  }
  shippingIncoTermsData: any = [];
  shippingMethodChange() {
    let val = this.reactiveForm.value.ShipVia;
    this.shippingAddress.carrierNumber = undefined;
    this.shippingAddress.satellite = undefined;
    this.satellite = "";
    this.selectedCarrierOption = null;
    this.reactiveForm.controls["carrierNumber"].setValue(null);
    this.reactiveForm.controls["IncoTerms"].setValue(null);
    this.carrierOptionList = [];
    const selectedItem = this.shippingMethodDropdownData.find(
      (item: any) => item.value === val
    );
    if(!this.userInfo?.isCustomer && !this.userInfo?.isSalesOps && !this.userInfo?.isSalesPerson){
    this.orderService.getIncoTerms(val).subscribe({
      next: (res) => {
        this.shippingIncoTermsData = [];
        for (let key of Object.entries(res?.body)) {
          this.shippingIncoTermsData.push({
            value: key[0],
            label: key[1],
          });
        }
      },
      error: (err) => {},
    });

   
    this.shippingAddress.defaultShippingMethod = selectedItem.value;
    this.shippingAddress.defaultShippingConditionDesc = selectedItem.label;
    if (val == "CA") {
      let shipTo = this.shippingAddress?.shippingAddressID
        ? this.shippingAddress?.shippingAddressID
        : this.shippingAddress?.id;

      this.shippingMethodVendorAccountNumbers(shipTo, shipTo);
    }
    /* if (val == "PS") {
      let zipCode = !this.reactiveForm.value.oneTimeShippingAddress
        ? this.shippingAddress?.postalCode
          ? this.shippingAddress?.postalCode
          : ""
        : this.reactiveForm.value.zipCode;

      this.shippingMethodZoneZipcodeDetermination(zipCode);
    } */
    
  }
  if (this.userInfo.isCustomer || this.userInfo.isSalesPerson || this.userInfo?.isSalesOps) {
    this.spinnerLoading = false;

   
    this.orderService
      .getShippingoptionForCustomers(
        this.reactiveForm.value?.zipCode,
        this.reactiveForm.value?.ShipVia,
        '',
        this.shippingAddress.isOneTimeShipTo === undefined ? false: true,
        this.uid
      )
      .subscribe({
        next: (res) => {
          this.showValidationError = false;
          console.log("res---->",res);
          if(res?.body?.incoTerms || res?.body?.shipvia){
              this.spinnerLoading = false;
              this.shippingWareHouseDropdownData = [];
              this.shippingWareHouseDropdownData.push({
                value: res?.body?.shippingWarehouse,
                label: res?.body?.shippingWarehouseDesc,
              });

             this.shippingIncoTermsData = [];
              this.shippingIncoTermsData.push({
                value: res.body.incoTerms,
                label: res.body.incoTermsDesc,
              });
              this.shippingIncoTermsLoc2Data = [];
              this.shippingIncoTermsLoc2Data.push({
                value: res.body.shipvia,
                label: res.body.shipViaDesc,
              });
               this.originalDefaultSM = res.body?.originalDefaultShippingMethod;
               this.originalDefaultSM = res.body?.originalDefaultShippingMethod;
               this.originalDefaultShippingMethod =res?.body?.originalDefaultShippingMethod;
               this.shippingAddress.originalDefaultShippingMethod = res?.body?.originalDefaultShippingMethod;
             //  this.originalShippingMethod = res?.body?.originalDefaultShippingMethod;
              this.incoTermsSelectedOption = this.shippingIncoTermsData[0]?.value;
              this.incoTermsLoc2SelectedOption = res.body.shipvia;
              this.reactiveForm.controls["IncoTerms"].setValue(this.shippingIncoTermsData[0]?.value);
              this.reactiveForm.controls["shippingWareHouse"].setValue(this.shippingWareHouseDropdownData[0]?.value);
              


          }
          else{
                this.spinnerLoading = false;
                this.showValidationError = true;
                 this.validationErrorMessage = "Shipping Options are not available for customer"
               //  this.shippingInfoMessage = "Shipping Options are not available for customer";
                 this.incoTermsLoc2SelectedOption = "";
                 this.incoTermsSelectedOption = "";
                 
                }
        },
        error: (err) => {
          this.spinnerLoading = false;
        },
      });
  } 
  this.updateValidation(selectedItem.value);
   
  }

  carrierOptionList: any = [];
  shippingMethodVendorAccountNumbers(shipTo: any, soldTo: any) {
    soldTo = this.isShipToUser ? this.soldToAccount : soldTo;
    this.ProductService.shippingMethodVendorAccountNumbersAPI(
      shipTo,
      soldTo
    ).subscribe((res: any) => {
      this.satellite = "";
      if (res?.status == 200) {
        this.carrierOptionList = res.body;
      } else {
        this.carrierOptionList = [
          "123453",
          "123451",
          "123452",
          "123455",
          "123454",
        ];
      }
    });
  }

  satellite: string = "";
  shippingMethodZoneZipcodeDetermination(zipcode: any) {
    this.ProductService.shippingMethodZoneZipcodeDeterminationAPI(
      zipcode
    ).subscribe((res: any) => {
      this.carrierOptionList = [];
      if (res?.status == 200) {
        this.shippingAddress.satellite = res?.body;
        this.satellite = res?.body?.description;
      }
    });
  }

  selectedCarrierOption: any = null;
  getSelectedCarrierOptions($event: any) {
    this.shippingAddress.carrierNumber = $event;
  }

  shippingWareHouseOptions: any = [];
  shippingWareHouseType: string = "";
  shippingOptionTemplate!: TemplateRef<any>;
  shippingOptionsModal(template: TemplateRef<any>) {
    // this.spinnerLoading = true;
    this.shippingOptionTemplate = template;
    this.shippingOptionsAPIs.clear();
    this.shippingWareHouseOptions = [];
    this.showValidationError = false;
    this.shippingWareHouseSelectedOption =
      this.shippingAddress?.defaultShippingWarehouse || "";
    this.shipViaOptions = [];
    this.shipViaSelectedOption =
       this.shippingAddress?.defaultShippingMethod ||
        this.shipViaOptions[0].value;
    this.ProductService.progressShow('getShippingOptions', 'getShippingOptionsId');
    this.ProductService.getShippingMethodWithOutFlag(
      this.shippingAddress.postalCode,
      this.reactiveForm.value.oneTimeShippingAddress,
      (this.userInfo?.isCustomer || this.userInfo?.isSalesPerson || this.userInfo?.isSalesOps),
      this.shipViaSelectedOption
    ).subscribe((res: any) => {
      this.setLoadAPI('ShippingMethod');
      if (res?.body && Object.entries(res?.body).length > 0) {
        this.shipViaOptions = [];
        
        for (let key of Object.entries(res?.body)) {
          this.shipViaOptions.push({
            value: key[0] || this.shippingAddress?.defaultShippingMethod || this.shippingAddress?.defaultShippingCondition,
            label: key[1] || this.shippingAddress?.defaultShippingMethodDesc || this.shippingAddress?.defaultShippingConditionDesc,
          });
        }
      }else{
        this.shipViaOptions = [];
        this.shipViaOptions.push({
          value:  this.shippingAddress?.defaultShippingMethod || this.shippingAddress?.defaultShippingCondition,
          label:  this.shippingAddress?.defaultShippingMethodDesc || this.shippingAddress?.defaultShippingConditionDesc,
        });
        this.shipViaSelectedOption = this.shipViaOptions[0].value;
      }
      if (this.userInfo.isCustomer || this.userInfo.isSalesPerson || this.userInfo?.isSalesOps) {
        
        this.spinnerLoading = false;
        this.orderService
          .getShippingoptionForCustomers(
            this.shippingAddress.postalCode,
            this.shipViaSelectedOption,
            this.shippingWareHouseSelectedOption,
            this.shippingAddress.isOneTimeShipTo == undefined? false:this.shippingAddress.isOneTimeShipTo,
           this.uid
          )
          .subscribe({
            next: (res) => {
              this.setLoadAPI("ShippingMethod", 1);
              this.spinnerLoading = false;
              this.originalDefaultSM = res.body?.originalDefaultShippingMethod;

              this.shippingWareHouseOptions = [];
              this.shippingWareHouseOptions.push({
                value: res.body?.shippingWarehouse ||   this.shippingAddress?.defaultShippingWarehouse,
                label: res?.body?.shippingWarehouseDesc || this.shippingAddress?.defaultShippingWarehouseDesc,
              });
              this.shippingWareHouseSelectedOption = this.shippingWareHouseOptions[0].value

              this.incoTermsOptions = [];
              this.incoTermsOptions.push({
                value: res.body.incoTerms || this.shippingAddress?.defaultIncoTerms,
                label: res.body.incoTermsDesc || this.shippingAddress?.defaultIncoTermsDesc,
              });

              this.incoTermsLoc2Options = [];
              this.incoTermsLoc2Options.push({
                value: res.body.shipvia || this.shippingAddress?.defaultShipVia,
                label: res.body.shipViaDesc || this.shippingAddress?.defaultShipViaDesc,
              });
              this.incoTermsSelectedOption =  this.incoTermsOptions[0].value;
              this.incoTermsLoc2SelectedOption = res.body.shipvia || this.shippingAddress?.defaultShipVia;
            },
            error: (err) => {
              this.setLoadAPI("ShippingMethod", 1);
              this.spinnerLoading = false;
            },
          });
        
      }
     if (!this.userInfo.isCustomer && !this.userInfo.isSalesPerson && !this.userInfo?.isSalesOps) {
        this.shipViaSelectedOption =
          this.shippingAddress?.defaultShippingMethod ||
          this.shipViaOptions[0].value;

        this.getIncoTerms(this.shipViaSelectedOption);
       // this.incoTermsSelectedOption =this.incoTermsOptions[0].value ||  this.shippingAddress?.defaultIncoTerms;

        this.ProductService.getShippingWareHouseWithOutFlag().subscribe(
          (res: any) => {
            this.setLoadAPI("WareHouse");
            if (res?.body) {
              this.shippingWareHouseOptions = [];
              for (let key of Object.entries(res?.body)) {
                this.shippingWareHouseOptions.push({
                  value: key[0],
                  label: key[1],
                });
              }
            }

            this.incoTermsLoc2SelectedOption =
              this.shippingAddress?.defaultShipVia;
            this.getIncoTermsLoc2(this.shippingWareHouseSelectedOption);
            this.incoTermsSelectedOption =
              this.shippingAddress?.defaultIncoTerms ||
              this.incoTermsOptions[0].value;
          },()=>{
            this.setLoadAPI("WareHouse");
          }
        );
      }
      // this.modalRef = this.modalService.show(template, {
      //   id: "shippingOptionsModal",
      //   class: "modal-lg modal-dialog-centered",
      //   backdrop: "static",
      //   keyboard: false,
      // });
    },()=>{
      this.setLoadAPI("ShippingMethod");
    });
  }

  shipingWareHouseModal(template: TemplateRef<any>, type: any) {
    this.shippingWareHouseOptions = [];
    this.shippingWareHouseType = type;
    this.shippingWareHouseSelectedOption =
      this.shippingAddress?.defaultShippingWarehouse || "";
    this.ProductService.getShippingWareHouseWithOutFlag().subscribe(
      (res: any) => {
        if (res?.body) {
          this.shippingWareHouseOptions = [];
          for (let key of Object.entries(res?.body)) {
            this.shippingWareHouseOptions.push({
              value: key[0],
              label: key[1],
            });
          }
        }
        this.shipViaSelectedOption =
          this.shippingAddress?.defaultShippingWarehouse ||
          this.shippingWareHouseOptions[0].value;
        this.incoTermsLoc2SelectedOption = this.shippingAddress?.defaultShipVia;
        this.getIncoTermsLoc2(this.shipViaSelectedOption);
        this.modalRef = this.modalService.show(template, {
          id: "shipingWareHouseModal",
          class: "modal-md modal-dialog-centered",
          backdrop: "static",
          keyboard: false,
        });
      }
    );
  }
  shippingOptionModalSubmit() {
    this.shipViaModalSubmit();
    this.shippingWareHouseModalSubmit();
    this.modalService.hide("shippingOptionModal");
    this.closeShippingOptionModal();
  }

  closeShippingOptionModal() {
    this.incoTermsLoc2SelectedOption = this.shippingAddress?.defaulthSipVia;
    this.shippingWareHouseSelectedOption = this.shippingAddress?.defaultShippingWarehouse;
    this.incoTermsSelectedOption = this.shippingAddress?.defaultIncoTerms;
    this.shipViaSelectedOption = this.shippingAddress?.defaultShippingMethod;
    this.originalDefaultSM = this.originalDefaultShippingMethod ;
    this.isShippingOptionsModalOpened = false;
    this.modalService.hide("shippingOptionsModal");
  }
  closeShippingWareHouseModal() {
    this.modalService.hide("shipingWareHouseModal");
  }
  @HostListener("document:keydown.enter", ["$event"])
  handleEnterKey(event: KeyboardEvent): void {
    if (this.checkConfirmation) {
      this.addressSelected(this.isAtpCheck);
    }
  }
  shippingWareHouseModalSubmit() {
    let flag = false;
    const selectedItem = this.shippingWareHouseOptions.find(
      (item: any) => item.value === this.shippingWareHouseSelectedOption
    );
    let selectedIncoTermsItem = this.incoTermsLoc2Options.find(
      (item: any) => item.value === this.incoTermsLoc2SelectedOption
    );
    if (selectedIncoTermsItem === undefined) {
      flag = true;
      selectedIncoTermsItem = this.incoTermsLoc2SelectedOption;
    }
    this.shippingAddress.defaultShippingWarehouse = selectedItem?.value;
    this.shippingAddress.defaultShippingWarehouseDesc = selectedItem?.label;
    if (flag === true && (this.userInfo?.isCustomer || this.userInfo?.isSalesPerson  || this.userInfo?.isSalesOps)) {
      this.shippingAddress.defaultShipVia = selectedIncoTermsItem ;
      this.shippingAddress.defaultShipViaDesc = selectedIncoTermsItem ;
    } else if(flag === true && !this.userInfo?.isCustomer && !this.userInfo?.isSalesPerson && !this.userInfo?.isSalesOps){
      this.shippingAddress.defaultShipVia = typeof selectedIncoTermsItem == 'object' ? selectedIncoTermsItem?.label.toUpperCase() : selectedIncoTermsItem ;
      this.shippingAddress.defaultShipViaDesc = typeof selectedIncoTermsItem == 'object' ? selectedIncoTermsItem?.label.toUpperCase() : selectedIncoTermsItem ;
    }else {
      this.shippingAddress.defaultShipVia = selectedIncoTermsItem?.value.toUpperCase();
      this.shippingAddress.defaultShipViaDesc = selectedIncoTermsItem?.label;
    }

    this.storageService.setItem("shippingAddress", this.shippingAddress);
  }

  shippingIncoTermsLoc2Data: any = [];
  shippingWareHouseChange() {
    let val = this.reactiveForm.value.shippingWareHouse;
    const selectedItem = this.shippingWareHouseDropdownData.find(
      (item: any) => item.value === val
    );
    this.reactiveForm.controls["incoTermsLoc2"].patchValue(null);
    this.reactiveForm.controls["incoTermsLoc2"].updateValueAndValidity();
    this.shippingIncoTermsLoc2Data = [];
    let zipCode = !this.reactiveForm.value.oneTimeShippingAddress
      ? this.shippingAddress?.postalCode
        ? this.shippingAddress?.postalCode
        : ""
      : this.reactiveForm.value.zipCode;
    this.orderService
      .getIncoTermsLoc2(zipCode, val, this.reactiveForm.value.ShipVia)
      .subscribe({
        next: (res) => {
         
          const data = res?.body || [];
          data.forEach((item: any) => {
            this.shippingIncoTermsLoc2Data.push({
              value: item.shipvia,
              label: item.shipViaDesc,
              preferred: item.preferred
            });
          });
        },
        error: (err) => {},
      });
    this.shippingAddress.defaultShippingWarehouse = selectedItem?.value;
    this.shippingAddress.defaultShippingWarehouseDesc = selectedItem?.label;
  }
  continueCloneOrder() {
    this.continueCloneOrderFlow.emit(true);
  }
  setCloneOrdersItems() {
    if (this.storageService.selectedCloneOrders?.selectedLines.length > 0) {
      // this.storageService.selectedCloneOrders?.selectedLines.splice(0, 1);
      this.storageService.setItem("selectedCloneOrders", {
        sampleOrder: this.storageService.selectedCloneOrders?.sampleOrder,
        selectedLines: this.storageService.selectedCloneOrders?.selectedLines,
        module: "residential",
        productNumber: this.storageService.selectedCloneOrders.productNumber,
      });
    }
  }
  defaultIncoTerms: any;
  defaultIncoTermsDesc: any;
  defaultShipVia: any;
  defaultShippingMethod: any;
  defaultShippingMethodDesc: any;
  defaultShippingWarehouse: any;
  defaultShippingWarehouseDesc: any;
  defaultShippingConditionDesc: any;
  resSubmit: any;
  populateShippingOptions() {
    let shipViaSelectedOption =
      this.shipViaSelectedOption ||
      this.shippingAddress?.defaultShippingMethod ||
      this.shippingAddress?.defaultShippingCondition;
      let incoTermsLoc2SelectedOption =
      this.incoTermsLoc2SelectedOption?.label ||
         this.incoTermsLoc2SelectedOption 
         this.shippingAddress?.defaultShipVia;
   
         incoTermsLoc2SelectedOption = incoTermsLoc2SelectedOption ? incoTermsLoc2SelectedOption.toUpperCase() : incoTermsLoc2SelectedOption || this.shippingAddress?.defaultShipVia;
   
    let incoTermsSelectedOption =
      this.incoTermsSelectedOption || this.shippingAddress?.defaultIncoTerms;
    let shippingWareHouseSelectedOption =
      this.shippingWareHouseSelectedOption ||
      this.shippingAddress?.defaultShippingWarehouse;

    const shipViaSelectedOptionValue = this.shipViaOptions.find(
      (item: any) => item.value === shipViaSelectedOption
    );
    this.defaultShippingMethod = shipViaSelectedOption;
    this.defaultShippingConditionDesc =
      shipViaSelectedOptionValue?.label ||
      this.shippingAddress?.defaultShippingConditionDesc;
    this.defaultShippingMethodDesc =
      shipViaSelectedOptionValue?.label ||
      this.shippingAddress?.defaultShippingConditionDesc;

    let incoTermSelectedOptionValue = this.incoTermsOptions.find(
      (item: any) => item.value === incoTermsSelectedOption
    );
    this.defaultIncoTermsDesc =
      incoTermSelectedOptionValue?.label ||
      this.shippingAddress?.defaultIncoTermsDesc;
    this.defaultIncoTerms = incoTermsSelectedOption;

    if (incoTermSelectedOptionValue === undefined) {
      incoTermSelectedOptionValue = this.incoTermsOptions.find(
        (item: any) => item.label === incoTermsSelectedOption
      );
      this.defaultIncoTermsDesc =
        incoTermSelectedOptionValue != undefined
          ? incoTermSelectedOptionValue?.label ||
            this.shippingAddress?.defautIncoTermsDesc
          : this.defaultIncoTermsDesc;
      this.defaultIncoTerms =
        incoTermSelectedOptionValue != undefined
          ? incoTermSelectedOptionValue.value
          : this.defaultIncoTerms;
    }

    // this.defaultIncoTermsDesc =  incoTermSelectedOptionValue?.label || this.shippingAddress?.defaultIncoTermsDesc;
    // this.defaultIncoTerms = incoTermsSelectedOption;

    const shippingWHSelectedOptionValue = this.shippingWareHouseOptions.find(
      (item: any) => item.value === shippingWareHouseSelectedOption
    );
    this.defaultShippingWarehouseDesc =
      shippingWHSelectedOptionValue?.label ||
      this.shippingAddress?.defaultShippingWarehouseDesc;
    this.defaultShippingWarehouse = shippingWareHouseSelectedOption;

    this.defaultShipVia = incoTermsLoc2SelectedOption;

    this.defaultShipVia = incoTermsLoc2SelectedOption;
    this.shippingAddress.defaultShippingCondition = this.defaultShippingMethod;
    this.shippingAddress.defaultShippingMethod = this.defaultShippingMethod;
    this.shippingAddress.defaultShippingConditionDesc =
      this.defaultShippingConditionDesc;
    this.shippingAddress.defaultShippingMethodDesc =
      this.defaultShippingConditionDesc;

    this.shippingAddress.defaultShippingWarehouseDesc =
      this.defaultShippingWarehouseDesc;
    this.shippingAddress.defaultShippingWarehouse =
      this.defaultShippingWarehouse;

    this.shippingAddress.defaultIncoTerms = this.defaultIncoTerms;
    this.shippingAddress.defaultIncoTermsDesc = this.defaultIncoTermsDesc;

    this.shippingAddress.defaultShipVia = this.defaultShipVia;
  }

  closeShippingMethodModal() {
    this.modalService.hide("shipViaModal");
  }

  validateShipViaAddress(type: any) {
    this.addtoCartErrorMessage = [];
    this.isPoBoxFlag = false;
    let shippingMethod = this.shipViaSelectedOption || this.shippingAddress?.defaultShippingMethod;
    if ((!this.showOrderSample && !this.isCloneOrders) &&
      this.shippingAddress?.formattedAddress?.includes("PO BOX") &&
      shippingMethod != 'PS' &&
      shippingMethod != 'PM') {
      this.isPoBoxFlag = true;
      this.addtoCartErrorMessage.push({ message: "Shipping to a PO BOX is not permitted. Please select an alternative shipping address" });
      if (type == 'changeShippingOption') {
        this.populateShippingOptions()
      }
      this.closeShippingOptionModal();
      return
    }
    console.log(type);
    console.log(
      "this.shipViaSelectedOption",
      this.shipViaSelectedOption,
      this.incoTermsLoc2SelectedOption
    );
    type = (this.showAddtoCart || this.isCloneOrders) && !this.isAtpCheck ? "addTCart" : type;
    let shipViaSelectedOption =
      this.shipViaSelectedOption || this.shippingAddress?.defaultShippingMethod;
    let incoTermsLoc2SelectedOption =
      this.incoTermsLoc2SelectedOption?.label ||
      this.incoTermsLoc2SelectedOption ||
      this.shippingAddress?.defaultShipVia;
    let incoTermsSelectedOption =
      this.incoTermsSelectedOption ||
      this.defaultIncoTerms ||
      this.shippingAddress?.defaultIncoTerms;
    let shippingWareHouseSelectedOption =
      this.shippingWareHouseSelectedOption ||
      this.shippingAddress?.defaultShippingWarehouse;

      incoTermsLoc2SelectedOption = incoTermsLoc2SelectedOption ? incoTermsLoc2SelectedOption.toUpperCase() : incoTermsLoc2SelectedOption;

    if(!this.userInfo?.isCustomer && !this.userInfo?.isSalesPerson && !this.userInfo?.isSalesOps && !this.isCloneOrders){
      this.ProductService.progressShow('validateShippingOptions', 'validateShippingOptionsId');
      this.orderService
      .validateShippingOptions(
        shippingWareHouseSelectedOption,
        this.erpProductCategory,
        incoTermsLoc2SelectedOption
      )
      .subscribe({
        next: (res) => {
          this.ProductService.progressHide( 'validateShippingOptionsId');
          this.shippingOptionFlag = true;

          if (res.body.status === "success") {
            this.ProductService.progressShow('validateShipVia', 'validateShipViaId');
            this.orderService
              .validateShipVia(
                shipViaSelectedOption,
                incoTermsLoc2SelectedOption
              )
              .subscribe({
                next: (res) => {
                  this.ProductService.progressHide( 'validateShipViaId');
                  this.shippingOptionFlag = true;
                  if (res.body.status === "success") {
                    this.populateShippingOptions();
                    if (type == "chooseSolution") {
                      this.onSubmit();
                    }
                    if (type == "changeShippingOption") {
                      this.shippingOptionModalSubmit();
                    }
                    if (type == "addTCart") {
                      this.addTCart();
                      ``;
                    }
                  } else if (res.body.status === "error") {
                    // this.shippingWareHouseSelectedOption =
                    //   this.shippingAddress?.defaultShippingWarehouse || "";
                    this.spinnerLoading = false;

                    //  this.getIncoTermsLoc2(this.shippingWareHouseSelectedOption);
                    this.showValidationError = true;
                    this.validationErrorMessage = res.body.message;
                    this.addtoCartErrorMessage = [
                      ...[],
                      ...[{ message: this.validationErrorMessage }],
                    ];
                    setTimeout(() => {
                      this.addtoCartErrorMessage = [];
                    }, 8000);
                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    }); // Handle error
                  }
                },
                error: (err) => {
                  this.ProductService.progressHide( 'validateShipViaId');
                },
              });
          } else if (res.body.status === "error") {
            // this.shippingWareHouseSelectedOption =
            //   this.shippingAddress?.defaultShippingWarehouse || "";
            this.spinnerLoading = false;

            //  this.getIncoTermsLoc2(this.shippingWareHouseSelectedOption);
            this.showValidationError = true;
            this.validationErrorMessage = res.body.message;
            this.addtoCartErrorMessage = [
              ...[],
              ...[{ message: this.validationErrorMessage }],
            ];
            setTimeout(() => {
              this.addtoCartErrorMessage = [];
            }, 8000);
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            }); // Handle error
          }
        },
        error: (err) => {
          this.ProductService.progressHide( 'validateShippingOptionsId');
        },
      });
    }else{
      this.originalDefaultShippingMethod = this.originalDefaultSM;
      this.shippingAddress.originalDefaultShippingMethod = this.originalDefaultShippingMethod;
     // this.populateShippingOptions();
      if (type == "chooseSolution") {
        this.onSubmit();
      }
      if (type == "changeShippingOption") {
        this.shippingOptionModalSubmit();
      }
      if (type == "addTCart") {
        this.addTCart();
        ``;
      }
    }
    
  }

  openModalError(title: any) {
    const initialState: ModalOptions = {
      initialState: {
        title: title,
      },
    };
    this.modalRef = this.modalService.show(
      ErrorModalComponent,
      Object.assign(initialState, {
        id: "InvoiceSearchPopupComponent",
        class: "modal-lg modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }
  validateShipVia(event: any) {
    console.log(event);
    this.showValidationError = false;

    // Add your code here
  }

  validateShipViaOneTime(event: any) {
    if (event != "" && event != null  && !this.userInfo?.isCustomer && !this.userInfo?.isSalesOps && !this.userInfo?.isSalesPerson) {
     // console.log("event Savitha ---->", event);
      let shipViaSelectedOption =
        this.reactiveForm?.value.ShipVia.label ||
        this.reactiveForm?.value.ShipVia;
      let incoTermsLoc2SelectedOption =
      this.reactiveForm.value?.incoTermsLoc2?.label || this.reactiveForm.value?.incoTermsLoc2 || this.incoTermsLoc2SelectedOption?.label;
      let incoTermsSelectedOption = this.reactiveForm.value?.IncoTerms || this.reactiveForm.value?.IncoTerms?.label;
      let shippingWareHouseSelectedOption = this.reactiveForm.value?.shippingWareHouse || this.reactiveForm.value?.shippingWareHouse?.label;
      
      incoTermsLoc2SelectedOption = incoTermsLoc2SelectedOption ? incoTermsLoc2SelectedOption.toUpperCase() : incoTermsLoc2SelectedOption;

      this.orderService
      .validateShippingOptions(shippingWareHouseSelectedOption,this.erpProductCategory, incoTermsLoc2SelectedOption)
      .subscribe({
        next: (res) => {
          this.shippingOptionFlag = true;
          this.showValidationError = false;
          this.addtoCartErrorMessage = [];
          if (res.body.status === "success") {
           
            this.orderService
            .validateShipVia(shipViaSelectedOption, incoTermsLoc2SelectedOption)
            .subscribe({
              next: (res) => {
                if (res.body.status === "success") {
                } else if (res.body.status === "error") {
           
                  this.spinnerLoading = false;
            
                  //  this.getIncoTermsLoc2(this.shippingWareHouseSelectedOption);
                  this.showValidationError = true;
                  this.validationErrorMessage = res.body.message;
            
                  this.reactiveForm.value.incoTermsLoc2 = "";
                  delete this.reactiveForm.value.incoTermsLoc2;
                  delete this.incoTermsLoc2SelectedOption;
                  this.scrollPageToTop();
                  // window.scrollTo({
                  //   top: 0,
                  //   behavior: "smooth",
                  // }); 
                  this.addtoCartErrorMessage = [
                    ...[],
                    ...[{ message: this.validationErrorMessage }],
                  ];
                 
                  // setTimeout(() => {
                  //   this.addtoCartErrorMessage = [];
                  // }, 10000);
                // Handle error
                }
              },
              error: (err) => {},
            });

      
          } else if (res.body.status === "error") {
           
                  this.spinnerLoading = false;
            
                  //  this.getIncoTermsLoc2(this.shippingWareHouseSelectedOption);
                  this.showValidationError = true;
                  this.validationErrorMessage = res.body.message;
            
                  this.reactiveForm.value.incoTermsLoc2 = "";
                  delete this.reactiveForm.value.incoTermsLoc2;
                  delete this.incoTermsLoc2SelectedOption;
                  this.scrollPageToTop();
                  // window.scrollTo({
                  //   top: 0,
                  //   behavior: "smooth",
                  // }); 
                  this.addtoCartErrorMessage = [
                    ...[],
                    ...[{ message: this.validationErrorMessage }],
                  ];
                 
                  // setTimeout(() => {
                  //   this.addtoCartErrorMessage = [];
                  // }, 10000);
                // Handle error
                }
              },
              error: (err) => {},
            });
      

}
this.showValidationError = false;
    // Add your code here
  }

  validationFlag: boolean = false;
  updateValidation(value: any) {
    if (value !== "PA" && !this.validationFlag && !this.showOrderSample  && this.initialState?.selectedProduct?.productType != 'MERCHANDISING') {
      this.validationFlag = true;
      if (!this.showOrderSample && !this.isCloneOrders && this.initialState?.selectedProduct?.productType != 'MERCHANDISING') {
        this.changeValidatorsRequired("loading");
        this.changeValidatorsRequired("poleLift");
        this.changeValidatorsRequired("accomodate");
        this.changeValidatorsRequired("jobsiteDelivery");
        this.changeValidatorsRequired("appoinment");
        this.changeValidatorsRequired("liftGateAndPallet");
        this.changeValidatorsRequired("lastestacceptDate");
        this.changeValidatorsRequired("truckSize");
        this.changeValidatorsRequired("Location");
      }
    } else if (value == "PA") {
      this.validationFlag = false;
      this.changeValidatorsNull("loading", true);
      this.changeValidatorsNull("poleLift", true);
      this.changeValidatorsNull("accomodate", true);
      this.changeValidatorsNull("jobsiteDelivery", true);
      this.changeValidatorsNull("appoinment", true);
      this.changeValidatorsNull("liftGateAndPallet", true);
      this.changeValidatorsNull("storeNumber", true);
      this.changeValidatorsNull("lastestacceptDate", true);
      this.changeValidatorsNull("truckSize", true);
      this.changeValidatorsNull("Location", true);
    }

    if (value == "CA" && ((this.userInfo?.isCustomer || this.userInfo?.isSalesPerson || this.userInfo?.isSalesOps))){
      this.changeValidatorsNull("incoTermsLoc2", true);
    }else if(value == "MA" && ((this.userInfo?.isCustomer || this.userInfo?.isSalesPerson || this.userInfo?.isSalesOps))){
      this.changeValidatorsRequired("incoTermsLoc2");
    }
  }

  isShippingAddressValid(){
    let incoTerms = (this.shippingAddress?.defaultIncoTerms || this.shippingAddress?.incoTerms) ? true : false;
    let shippingCondition = (this.shippingAddress?.defaultShippingMethod || this.shippingAddress?.shippingCondition || 
                            this.shippingAddress?.originalDefaultShippingMethod) ? true : false;
    let shippingWarehouse = (this.shippingAddress?.defaultShippingWarehouse || this.shippingAddress?.shippingWarehouse) ? true : false;
    let shipVia = (this.shippingAddress?.defaultShipVia || this.shippingAddress?.incoTermsLoc2 || 
                    this.shippingAddress?.shipVia) ? true : false;
                    
    return shippingCondition && incoTerms && shippingWarehouse && shipVia;
  }
}
