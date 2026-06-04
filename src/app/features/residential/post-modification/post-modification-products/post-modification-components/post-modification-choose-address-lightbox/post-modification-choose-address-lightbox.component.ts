import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { Config, Columns, DefaultConfig } from "ngx-easy-table";
import { ProductAddressService } from "src/app/features/residential/products/components/services/product-address.service";
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { StorageService } from "src/app/features/http-services/storage.service";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { Router } from "@angular/router";
import { XchangeAddAccessoriesLightboxComponent } from "src/app/features/shared/components/xchange-add-accessories-lightbox/xchange-add-accessories-lightbox.component";
import { API_CONSTANTS } from "src/app/features/shared/constants/API-CONSTANTS";
import { ApiService } from "src/app/features/http-services/api.service";
import { ConfirmationDialogComponent } from "src/app/features/shared/components/confirmation-dialog/confirmation-dialog.component";
import { DatePipe } from "@angular/common";
import { STATES } from "src/app/features/shared/constants/States";
import { PostModificationProductService } from "../../post-modification-pages/post-modification-services/post-modification-product.service";
import { OrderService } from "src/app/features/residential/orders/services/order.service";
import { PostModificationChangeShippingAddressComponent } from "../post-modification-change-shipping-address/post-modification-change-shipping-address.component";
import { PostModificationAddCompanionProductsComponent } from "../post-modification-add-companion-products/post-modification-add-companion-products.component";
@Component({
    selector: "app-post-modification-choose-address-lightbox",
    templateUrl: "./post-modification-choose-address-lightbox.component.html",
    styleUrls: ["./post-modification-choose-address-lightbox.component.scss"],
    standalone: false
})
export class PostModificationChooseAddressLightboxComponent implements OnInit {
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
  atpCheckData: any = {};
  setAddress: any;
  states = [...STATES[0]?.states, ...STATES[1]?.states];

  spinnerLoading: boolean = false;
  @Input() pdpdata: any;
  @Input() isAtpCheck: any;
  isError: boolean = false;

  addtoCartFailed: boolean = false;
  addtoCartErrorMessage: any = [];

  modalRef?: BsModalRef;
  productNumber = "";
  currentDate = new Date();
  constructor(
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private defaultAddress: ProductAddressService,
    private formBuilder: FormBuilder,
    private ProductService: PostModificationProductService,
    private storageService: StorageService,
    private userService: UserService,
    private router: Router,
    private apiService: ApiService,
    private orderService: OrderService,
    private datePipe: DatePipe,
    private cdr: ChangeDetectorRef
  ) {
    this.isError = false;
    this.getUrlparams();
    router.events.subscribe((url: any) => {});
    let n = router.url.lastIndexOf("/");
    this.productNumber = router.url.substring(n + 1);
    this.getShippingAddress();
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
  // [
  //   { value: "MA", label: "Mohawk Arranged" },
  //   { value: "CA", label: "Customer Arranged" },
  //   { value: "PS", label: "Pickup at satellite" },
  //   { value: "PM", label: "Pick up at mill" },
  // ];

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
  ngOnInit(): void {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    this.userService.getCurrentUserDetail().subscribe((res: any) => {
      this.uid = res?.body?.orgUnit?.uid;
      this.cdr.detectChanges();
    });
    // this.cartData = this.storageService.cartData;
    this.reactiveForm = this.formBuilder.group({
      name: [""],
      streetAddress: [""],
      city: [""],
      streetAddress2: [""],
      state: [""],
      zipCode: [""],
      Claim: [""],
      ShipVia: [""],
      replacementReason: [""],
      PO: [""],
      Order: [""],
      Invoice: [""],
      ContactName: [""],
      Phone: [""],
      Location: [""],
      hasClaimSubmitted: null,
      replacementOrder: false,
      oneTimeShippingAddress: false,
      siteInfo: "",

      notification: null,
      loading: null,
      offloading: null,
      accomodate: null,
      acknowledge: null,
      rdd: [new Date()],

      // new Variables

      jobsiteDelivery: null,
      appoinment: null,
      liftGate: null,
      palletJack: null,
      // insideDelivery: null,
      // whiteGloveDelivery: null,
      // multipleStops: null,
      storeNumber: "",
      lastestacceptDate: new Date(),
      truckSize: null,
    });
    this.reactiveForm.controls["ShipVia"].disable();
    // this.getShippingAddress();
    this.configuration = { ...DefaultConfig };
    this.configuration.checkboxes = false;

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
    this.initialState = this.modalService.config.initialState;

    this.storageService.getItem("defaultAddres").subscribe((res: any) => {
      this.atpCheckData = res?.entries || [];
      this.cdr.detectChanges();
    });
    this.userService.getCurrentUserDetail().subscribe((res: any) => {
      this.uid = res?.body?.orgUnit?.uid;
      this.cdr.detectChanges();
    });
    //this.getOrderDates();
  }
  getOrderDates() {
    this.orderService.getDeliveryDate("?shipToUnit=" + "").subscribe({
      next: (res) => {
        this.datesEnabled = res.body;

        this.datesEnabled = this.datesEnabled.map((el: any) => {
          return new Date(this.changeDateFormat(el));
        });

        this.daysToBeEnabled = this.datesEnabled;
      },
      error: (err) => {},
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
      this.reactiveForm.controls["replacementReason"].patchValue("");
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
        // Data to  popup
      },
    };
    this.modalRef = this.modalService.show(
      PostModificationChangeShippingAddressComponent,
      Object.assign(initialState, {
        id: "ChangeShippingAddressComponent",
        class: "modal-lg modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
    this.modalRef.content.messageEvent.subscribe((data: any) => {
      this.shippingAddress = data;
      this.setDefaultAddressData();
      this.setAddress = this.shippingAddress.line1;
    });
  }

  chooseSolutionModal() {
    this.reactiveForm.value.shippingAddressID = "";
    let address: any;
    if (this.selectedTab == 1) {
      this.reactiveForm.value.oneTimeShippingAddress = false;
      address = this.shippingAddress;
      address.rdd = this.reactiveForm.value?.rdd;
      address.replacementOrder = this.reactiveForm.value.replacementOrder;
      address.hasClaimSubmitted = this.reactiveForm.value.hasClaimSubmitted;
      address.claimNumber = this.reactiveForm.value.Claim;
      address.replacementReason = this.reactiveForm.value.replacementReason;
      address.purchaseOrderNumber = this.reactiveForm.value.PO;
      address.orderNumber = this.reactiveForm.value.Order;
      address.invoiceNumber = this.reactiveForm.value.Invoice;
    } else {
      this.reactiveForm.value.oneTimeShippingAddress = true;
      address = this.reactiveForm.value;
      address.rdd = this.reactiveForm.value?.rdd;
      address.replacementOrder = this.reactiveForm.value.replacementOrder;
      address.hasClaimSubmitted = this.reactiveForm.value.hasClaimSubmitted;
      address.claimNumber = this.reactiveForm.value.Claim;
      address.replacementReason = this.reactiveForm.value.replacementReason;
      address.purchaseOrderNumber = this.reactiveForm.value.PO;
      address.orderNumber = this.reactiveForm.value.Order;
      address.invoiceNumber = this.reactiveForm.value.Invoice;
      address.addressCity = this.reactiveForm.value.city;
      address.addressLine1 = this.reactiveForm.value.streetAddress;
      address.addressLine2 = this.reactiveForm.value.streetAddress2;
      address.addressPostalCode = this.reactiveForm.value.zipCode;
      address.addressState = this.reactiveForm.value.state;

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
        ", " +
        address?.zipCode;
    }

    const initialState: ModalOptions = {
      initialState: {
        solutions: [this.initialState?.selectedProduct],
        openFromaddressModal: true,
        shippingAddress: address,
        cartData: this.initialState?.cartData,
        feetyardForm: this.initialState?.feetyardForm,
        productType: this.initialState?.productType,
        aptCheckEntrie: this.initialState?.aptCheckEntrie,
        multiCutIndication: this.initialState?.multiCutIndication,
        viewInventory: this.initialState?.viewInventory,
        oneTimeShippingFlag: this.reactiveForm.value.oneTimeShippingAddress,
        //  subProductType:this.initialState.solution[0].subProductType,
      },
    };
    this.modalRef = this.modalService.show(
      PostModificationAddCompanionProductsComponent,
      Object.assign(initialState, {
        class: "modal-xl modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );

    this.modalRef.content.solutions = [this.initialState?.selectedProduct];
  }

  onHideModal(id: any) {
    this.modalService.hide(id);
  }
  shippingAddress: any;
  getShippingAddress() {
    this.defaultAddress
      .getDefaultShippingAddress(this.userService.getUserEmail().toLowerCase())
      .subscribe((res) => {
        this.shippingAddress = res.body;

        this.setDefaultAddressData();
        this.cdr.detectChanges();
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
    if (this.reactiveForm.valid) {
      this.storageService.setItem("shippingAddress", this.shippingAddress);
      this.chooseSolutionModal();
    }
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
    this.ProductService.validateAddress(payload).subscribe({
      next: (res) => {
        if (res?.errorCode) {
          if (res.errorCode === "0000") {
            this.validateAddressModal(this.isAtpCheck, res?.errorMessage);
          } else {
            this.scrollPageToTop();
            this.errorMessage = res?.errorMessage;
          }
        } else {
          this.onSubmitOnetimeShipping(true);
        }
      },
      error: (err) => {},
    });
  }
  validateAddressOnFormChange() {
    if (
      this.reactiveForm.controls["streetAddress"].valid &&
      this.reactiveForm.controls["city"].valid &&
      this.reactiveForm.controls["state"].valid &&
      this.reactiveForm.controls["zipCode"].valid
    ) {
      this.shippingMethodDropdownData = [];
      this.reactiveForm.controls["ShipVia"].disable();
      this.reactiveForm.controls["ShipVia"].setValue("");
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
      this.ProductService.validateAddress(payload).subscribe({
        next: (res) => {
          this.spinnerLoading = false;
          const EvStatus = res?.d?.EvStatus;
          const EvMessage = res?.d?.EvMessage;
          if(EvStatus == "S"){
            this.validateAddressModal(this.isAtpCheck, "Valid Address");
          } else {
            this.scrollPageToTop();
            let EsAddress = res?.d?.EsAddress;
            let suggestedAddress = `Suggested Address: ${EsAddress?.Addressline || ""}, 
                                    ${EsAddress?.Politicaldivision2 || ""}, ${EsAddress?.Politicaldivision1 || ""}, 
                                    ${EsAddress?.Postcodeprimarylow || ""}`;
            this.errorMessage = EvMessage == "Suggested Address" ? suggestedAddress : EvMessage;
          }
        },
        error: (err) => {
          this.spinnerLoading = false;
        },
      });
    }
  }
  getShippingAddressMethods() {
    this.ProductService.getShippingMethod(
      true,
      this.reactiveForm.value.zipCode
    ).subscribe((res: any) => {
      this.shippingMethodDropdownData = [];
      for (let key in res?.body) {
        this.shippingMethodDropdownData.push({
          value: key,
          label: res?.body[key],
        });
      }
      if (this.shippingMethodDropdownData.length > 0) {
        this.reactiveForm.controls["ShipVia"].enable();
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
    let url = API_CONSTANTS?.shippingAddressValidate;
    url = url.replace("{uid}", this.userService.getUserEmail().toLowerCase());
    url = url.replace("{cartNumber}", cartNumber);
    this.apiService.post(url, payload).subscribe({
      next: (result: any) => {
        (EvAddressType = result.EvAddressType),
          (EvMessage = result.EvMessage),
          (EvStatus = result.EvStatus);
      },
    });

    if (
      EvAddressType != "R" &&
      EvMessage != "Invalid Address" &&
      EvStatus == "S" &&
      isAtp
    ) {
      if (this.reactiveForm.valid) {
        this.storageService.setItem("shippingAddress", this.shippingAddress);
        this.chooseSolutionModal();
      }
    }
    if (
      EvAddressType != "R" &&
      EvMessage != "Invalid Address" &&
      EvStatus == "S" &&
      !isAtp
    ) {
      this.addTCart();
    } else {
      this.validateAddressModal(
        isAtp,
        " It seems you have provided a residential address. Your order will be reviewed to ensure proper delivery."
      );
    }
  }
  validateAddressModal(isAtp: boolean, errMsg: string) {
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
    // if (this.reactiveForm.valid && isAtp) {
    //   this.chooseSolutionModal();
    // }
    // if (!isAtp) {
    //   this.addTCart();
    // }
  }
  viewCartButton = true;
  addTCart() {
    this.spinnerLoading = true;
    const data: any = this.initialState;

    const payLoad = {
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
        ? this.reactiveForm?.value.Claim
        : "",
      hasClaimSubmitted: this.reactiveForm.value.hasClaimSubmitted
        ? this.reactiveForm.value.hasClaimSubmitted
        : false,
      invoiceNumber: this.reactiveForm?.value.Invoice
        ? this.reactiveForm?.value.Invoice
        : "",
      shipToUnit: this.shippingAddress?.shippingAddressID
        ? this.shippingAddress?.shippingAddressID
        : this.shippingAddress?.id,
      item: [
        {
          dyeLot: this.initialState?.feetyardForm?.dye,
          feet:
            this.initialState?.productType === "Hard_Surface" ||
            (this.initialState.productType === "Soft_Surface" &&
              this.initialState.selectedProduct.subProductType ===
                "CARPETPRODUCT_CARPET_TILE")
              ? Number(0)
              : Number(this.initialState?.feetyardForm?.feet),
          inches:
            this.initialState?.productType === "Hard_Surface" ||
            (this.initialState.productType === "Soft_Surface" &&
              this.initialState.selectedProduct.subProductType ===
                "CARPETPRODUCT_CARPET_TILE")
              ? Number(0)
              : Number(this.initialState?.feetyardForm?.inches),
          productCode: this.productNumber,
          requestedUOM:
            data?.aptCheckEntrie.length != 0
              ? "LF"
              : this.initialState?.feetyardForm?.unit,
          requestedQty: this.initialState?.feetyardForm?.requestedQty
            ? this.initialState?.feetyardForm?.requestedQty
            : this.initialState?.feetyardForm?.feet,
          maxFeet: 0,
          maxInches: 0,
          minFeet: 0,
          minInches: 0,
          rollPrices: true,
          solution: [],
        },
      ],
      noPrice: this.shippingAddress?.noPrice
        ? this.shippingAddress?.noPrice
        : true,
      oneTimeShippingAddress: this.shippingAddress?.oneTimeShippingAddress
        ? this.shippingAddress?.oneTimeShippingAddress
        : false,
      orderNumber: this.reactiveForm.value.Order
        ? this.reactiveForm.value.Order
        : "",
      pdpProductCode: this.productNumber,
      phoneNumber: this.reactiveForm.value?.Phone
        ? this.reactiveForm.value.Phone
        : "1234567890",
      purchaseOrderNumber: this.reactiveForm.value.PO
        ? this.reactiveForm.value.PO
        : "",
      replacementOrder: this.reactiveForm.value.replacementOrder,
      replacementReason: this.reactiveForm.value.replacementReason
        ? this.reactiveForm.value.replacementReason
        : "",
      requestedDeliveryDate: this.datePipe.transform(
        this.reactiveForm.value.rdd,
        "MM/dd/yyyy"
      ),
      sampleProduct: this.shippingAddress?.sampleProduct
        ? this.shippingAddress?.sampleProduct
        : false,
      sampleType: this.shippingAddress?.sampleType
        ? this.shippingAddress?.sampleType
        : "",
      shipVia: this.reactiveForm.value?.ShipVia
        ? this.reactiveForm.value.ShipVia
        : "",
      orderSamples: this.shippingAddress?.orderSamples
        ? this.shippingAddress?.orderSamples
        : [],
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
            forkLiftRequired: this.reactiveForm.value.storeNumber,
            jobSiteDelivery: this.reactiveForm.value.jobsiteDelivery,
            largestTruckSize: this.reactiveForm.value.truckSize,
            liftGateAndPallet: this.reactiveForm.value.liftGate,
            loadingDock: this.reactiveForm.value.loading,
            location: this.reactiveForm.value.Location,
            palletJack: this.reactiveForm.value.palletJack,
            poleLiftRequired: this.reactiveForm.value.storeNumber,
            requireNotification: this.reactiveForm.value.notification,
            siteContactName: this.reactiveForm.value.ContactName,
            siteContactPhone: this.reactiveForm.value.Phone,
            storeNumber: this.reactiveForm.value.storeNumber,
          },
      /*   shippingInfo: this.shippingAddress?.shippingInfo
        ? this.shippingAddress?.shippingInfo*/
    };

    this.storageService.setItem("atpCheckData", this.atpCheckData);

    this.cartData = this.storageService.cartData;
    const cartNumber = this.cartData?.code || null;
    this.ProductService.addToCart(
      this.userService.getUserEmail().toLowerCase(),
      cartNumber,
      payLoad
    ).subscribe({
      next: (res) => {
        if (
          !res?.body?.errorMessages &&
          !(res?.body?.messages[0]?.status === "Error"
            ? res?.body?.messages[0]?.status
            : res?.body?.messages[1]?.status === "Error")
        ) {
          this.spinnerLoading = false;
          this.ProductService.getLatestMiniCart(this.uid);

          if (res.body.cartNumber && cartNumber == null) {
            let cartData = {
              code: res.body.cartNumber,
              entries: res.body.entries,
            };
            this.cartData = cartData;
            this.storageService.setItem("miniCartCount", cartData);
          }
          const data: any = this.modalService.config.initialState;
          const initialState: ModalOptions = {
            initialState: {
              // Data to  popup
              cartData: data?.cartData,
              postOrder:true,
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
        } else {
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });

          this.addtoCartErrorMessage =  (res?.body?.messages || []).filter((err:any)=> err?.status && err?.message);
          this.addtoCartFailed = true;
          this.spinnerLoading = false;
        }
      },
      error: (err) => {
        this.spinnerLoading = false;
      },
    });
  }
  onReset(): void {
    this.submitted = false;
    this.reactiveForm.patchValue({
      name: "",
      streetAddress: "",
      city: "",
      streetAddress2: "",
      state: "",
      zipCode: "",
      Claim: "",
      ShipVia: "",
      replacementReason: "",
      PO: "",
      Order: "",
      Invoice: "",
      ContactName: "",
      Phone: "",
      Location: "",
      hasClaimSubmitted: null,
      replacementOrder: false,
      oneTimeShippingAddress: false,
      siteInfo: false,

      notification: null,
      loading: null,
      offloading: null,
      accomodate: null,
      acknowledge: null,
      jobsiteDelivery: null,
      appoinment: null,
      liftGate: null,
      palletJack: null,
      // insideDelivery: null,
      // whiteGloveDelivery: null,
      // multipleStops: null,
      storeNumber: "",
      truckSize: null,
      lastestacceptDate: new Date(),
    });
  }
  validateNo(e: any) {
    const charCode = e.which ? e.which : e.keyCode;
    if (
      (charCode > 31 && (charCode < 48 || charCode > 57)) ||
      e.target.value.length == 13
    ) {
      return false;
    }
    return true;
  }
  validatePO(e: any) {
    return /^[a-z,A-Z,0-9 ]$/i.test(e.key);
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
    this.selectedTab = index;
    this.errorMessage = "";
    if (index == 1) {
      this.onReset();
      this.reactiveForm.patchValue({
        oneTimeShippingAddress: false,
      });
      this.clearValidation();
    } else if (index == 2) {
      this.onReset();
      this.reactiveForm.patchValue({
        oneTimeShippingAddress: true,
      });
      this.clearValidation();

      this.changeValidatorsRequired("name");
      this.changeValidatorsRequired("streetAddress");
      this.changeValidatorsRequired("city");
      this.changeValidatorsRequired("state");
      this.changeValidatorsRequired("zipCode");
      this.changeValidatorsRequired("ContactName");
      this.reactiveForm.controls["Phone"].setValidators([
        Validators.required,
        Validators.pattern(this.phonePattern),
      ]);
      this.reactiveForm.controls["Phone"].updateValueAndValidity();
      this.changeValidatorsRequired("notification");
      this.changeValidatorsRequired("loading");
      this.changeValidatorsRequired("offloading");
      this.changeValidatorsRequired("accomodate");
      this.changeValidatorsRequired("acknowledge");

      this.changeValidatorsRequired("jobsiteDelivery");
      this.changeValidatorsRequired("appoinment");
      this.changeValidatorsRequired("liftGate");
      this.changeValidatorsRequired("palletJack");
      // this.changeValidatorsRequired("insideDelivery");
      // this.changeValidatorsRequired("whiteGloveDelivery");
      // this.changeValidatorsRequired("multipleStops");
      // this.changeValidatorsRequired("storeNumber");
      this.changeValidatorsRequired("lastestacceptDate");
      this.changeValidatorsRequired("acknowledge");
      this.changeValidatorsRequired("truckSize");
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
  changeValidatorsNull(key: string) {
    let controls = this.reactiveForm.controls[key];
    controls.clearValidators();
    controls.updateValueAndValidity();
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
        ? this.reactiveForm.value.Claim
        : "",
      distributionChannel: "01",
      division: "02",

      hasClaimSubmitted: this.reactiveForm.value.hasClaimSubmitted,
      invoiceNumber: this.reactiveForm.value.Invoice
        ? this.reactiveForm.value.Invoice
        : "",
      oneTimeShippingAddress: this.reactiveForm.value.oneTimeShippingAddress,
      orderNumber: this.reactiveForm.value.Order
        ? this.reactiveForm.value.Order
        : "",
      purchaseOrderNumber: this.reactiveForm.value.PO
        ? this.reactiveForm.value.PO
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
        requireNotification: this.reactiveForm.value.oneTimeShippingAddress
          ? this.reactiveForm.value.notification
          : "",
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
      soldTo: this.uid,
      newShippingAddress:
        this.selectedTab == 1 ? this.shippingAddress : this.reactiveForm.value,
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
}
