import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
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
import { ChangeShippingAddressComponent } from "../../../products/components/change-shipping-address/change-shipping-address.component";
import { QuotesService } from "../../services/quotes.service";
import { AddCompanionProductsComponent } from "../add-companion-products/add-companion-products.component";
import { SharedService } from "src/app/features/http-services/shared.service";
import { ProgressModalComponent } from "src/app/features/shared/components/progress-modal/progress-modal.component";
import { MESSAGE_CONSTANTS } from "src/app/features/shared/constants/MESSAGE-CONSTANTS";
@Component({
    selector: "app-choose-address-lightbox",
    templateUrl: "./choose-address-lightbox.component.html",
    styleUrls: ["./choose-address-lightbox.component.scss"],
    standalone: false
})
export class ChooseAddressLightboxComponent implements OnInit {
  reactiveForm!: FormGroup;
  submitted = false;
  isCollapsed = true;
  isCollapsed1 = true;
  isCollapsed2 = true;
  checkboxes = true;
  checkboxes1 = true;
  oneTime: boolean = false;
  selectedTab = 1;
  checkboxes2 = true;
  replacementCheck: any;
  atpCheckData: any = {};
  setAddress: any;
  states = [...STATES[0]?.states, ...STATES[1]?.states];
  totalRecords: any = 0;
  spinnerLoading: boolean = false;
  @Input() pdpdata: any;
  @Input() isAtpCheck: any;
  @Output() cancelClick = new EventEmitter();
  isError: boolean = false;
  alert = "";
  addtoCartFailed: boolean = false;
  addtoCartErrorMessage: any = [];
  priceLabel: string = "USD";
  modalRef!: BsModalRef;
  productNumber = "";
  currentDate = new Date();
  cartNumberData: any = {};
  selectedShippingMethodAbr: any;
  selectedShippingMethod: any;
  incoTermsSelectedOption: any;
  showValidationError: boolean = false;
  incoTermsOptions: any;
  carrierOptionList: any;
  ctaSpinnerFlag: boolean = false;
  isPoBoxFlag: boolean = false;
  constructor(
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private defaultAddress: ProductAddressService,
    private formBuilder: FormBuilder,
    private ProductService: ProductService,
    private storageService: StorageService,
    private userService: UserService,
    private router: Router,
    private apiService: ApiService,
    private orderService: OrderService,
    private datePipe: DatePipe,
    private quoteService: QuotesService,
    private sharedService: SharedService,
    private cdr: ChangeDetectorRef
  ) {
    this.isError = false;
    this.getUrlparams();
    router.events.subscribe((url: any) => {});
    let n = router.url.lastIndexOf("/");
    this.productNumber = router.url.substring(n + 1);
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
  ngOnInit(): void {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    this.userService.getCurrentUserDetail().subscribe((res: any) => {
      this.uid = res.body.orgUnit?.uid;
      this.userInfo = res?.body;
      this.priceLabel = res?.body?.priceLabel;
      this.cdr.detectChanges();
    });
    this.initiateForm();
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
    this.erpProductCategory = this.initialState.entry.product.erpProductCategory;
    this.atpCheckData = this.initialState.entry;
    this.storageService.getItem("defaultAddres").subscribe((res: any) => {
      this.atpCheckData = res?.entries || [];
      this.cdr.detectChanges();
    });
    this.userService.getCurrentUserDetail().subscribe((res: any) => {
      this.uid = res.body.orgUnit?.uid;
      this.cdr.detectChanges();
    });
    this.getShippingAddress();
    this.getShippingAddressTotal();
  //  this.getOrderDates();
  }
  getShippingAddressTotal() {
    this.totalRecords = 0;
    this.ctaSpinnerFlag = true;
    this.defaultAddress
      .getAddressCount(this.userService.getUserEmail().toLowerCase())
      .subscribe(
        (res) => {
          this.ctaSpinnerFlag = false;
          this.totalRecords = res?.body || 0;
          this.cdr.detectChanges();
        },
        (err: any) => {
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

      notification: null,
      loading: null,
      offloading: null,
      poleLift: null,
      accomodate: null,
      acknowledge: null,
      rdd: [new Date()],

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
  // getOrderDates() {
  //   this.orderService.getDeliveryDate("?shipToUnit=" + "").subscribe({
  //     next: (res) => {
  //       this.datesEnabled = res.body;

  //       this.datesEnabled = this.datesEnabled.map((el: any) => {
  //         return new Date(this.changeDateFormat(el));
  //       });

  //       this.daysToBeEnabled = this.datesEnabled;
  //     },
  //     error: (err) => {},
  //   });
  // }
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
      if(this.userInfo?.isCustomer || this.userInfo?.isSalesPerson  || this.userInfo?.isSalesOps){
        this.originalDefaultShippingMethod = this.shippingAddress?.originalDefaultShippingMethod;
        this.originalDefaultSM= this.shippingAddress?.originalDefaultShippingMethod;
        
      }
      this.setDefaultShippingOptions(this.shippingAddress);
      this.setAddress = this.shippingAddress.line1;
      this.addtoCartErrorMessage = [];
      this.isPoBoxFlag = false;
      let shippingMethod = this.shipViaSelectedOption || this.shippingAddress?.defaultShippingMethod;
      if (this.shippingAddress?.formattedAddress?.includes("PO BOX") &&
        shippingMethod != 'PS' &&
        shippingMethod != 'PM') {
        this.isPoBoxFlag = true;
        this.addtoCartErrorMessage.push({ message: "This shipping address is not allowed, please choose other shipping address" })
        return
      }
    });
  }
  chooseAsolutionClick() {
    // this.shippingAddress = {
    //   ...this.shippingAddress,
    //   ...this.reactiveForm.value,
    // };
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
    this.shippingAddress.requestedDeliveryDate = this.reactiveForm.value?.rdd;
    this.shippingAddress.formattedAddress =
      this.reactiveForm.value?.streetAddress +
      ", " +
      this.reactiveForm.value?.streetAddress2 +
      this.reactiveForm.value?.city;
    +" " + this.reactiveForm.value?.zipCode;

    delete this.shippingAddress.district;
    this.storageService.setItem("shippingAddress", this.shippingAddress);

    this.chooseSolutionModal();
  }
  chooseSolutionModal(addQuote = false) {
    this.reactiveForm.value.shippingAddressID = "";

    let shipTo = this.shippingAddress?.shippingAddressID
      ? this.shippingAddress?.shippingAddressID
      : this.shippingAddress?.id;
    let address = this.getAddressForModals();
    address.region = {
      isocodeShort: address?.state,
    };
    address.id = this.shippingAddress?.shippingAddressID
      ? this.shippingAddress?.shippingAddressID
      : this.shippingAddress?.id;

    let phoneNumber =
      this.reactiveForm.value?.Phone ||
      this.reactiveForm.value?.Phone ||
      "1234567890";
    phoneNumber = phoneNumber
      .replace("(", "")
      .replace(")", "")
      .replace(/ /g, "");
    const payLoad = {
      addressCountry: address.country,
      addressCity: address.town || address.city,
      addressLine1: address?.addressLine1,
      addressLine2: address?.addressLine2,
      addressName: address?.addressName,
      addressPostalCode: address?.addressPostalCode,
      addressState: `${address?.country?.isocode}-${address?.state}`,
      shipTo: this.shippingAddress?.shippingAddressID
        ? this.shippingAddress?.shippingAddressID
        : this.shippingAddress?.id,
      oneTimeShipTo: this.selectedTab == 1 ? false : true,
      oneTimeShippingAddress: this.selectedTab == 1 ? false : true,
      phoneNumber: phoneNumber ? phoneNumber : "1234567890",
      requestedDeliveryDate:
        this.datePipe.transform(address.requestedDeliveryDate, "MM/dd/yyyy") ||
        this.datePipe.transform(address.rdd, "MM/dd/yyyy"),
      plant:
        address?.defaultShippingWarehouse || address?.shippingWarehouse || "",
      incoTerms:
        this.selectedTab == 2
          ? this.reactiveForm.value.IncoTerms || address.defaultIncoTerms
          : this.shippingAddress?.defaultIncoTerms ||
            this.shippingAddress?.incoTerms || address.defaultIncoTerms,
      shippingCondition:
        this.selectedTab == 2
          ? this.userInfo?.isCustomer || this.userInfo?.isSalesPerson  || this.userInfo?.isSalesOps ? this.shippingAddress?.originalDefaultShippingMethod || 
					this.shippingAddress.defaultShippingMethod ||
                  this.shippingAddress.shippingCondition ||
                  "" : this.reactiveForm.value.ShipVia || address.defaultShippingCondition || address.defaultShippingMethod
          : this.userInfo?.isCustomer || this.userInfo?.isSalesPerson  || this.userInfo?.isSalesOps ? this.shippingAddress?.originalDefaultShippingMethod || 
					  this.shippingAddress.defaultShippingMethod ||
                  this.shippingAddress.shippingCondition ||
                  "" : this.shippingAddress.defaultShippingMethod ||
            this.shippingAddress.shippingCondition || address.defaultShippingCondition || address.defaultShippingMethod || "",
      shippingWarehouse:
        this.selectedTab == 2
          ? this.reactiveForm.value.shippingWareHouse || address.shippingWareHouse || address.defaultShippingWarehouse
          : this.shippingAddress.defaultShippingWarehouse ||
            this.shippingAddress.shippingWarehouse || address.shippingWareHouse || address.defaultShippingWarehouse ||
            "",
      shipVia:
        this.selectedTab == 2
          ? (typeof this.reactiveForm.value?.incoTermsLoc2 == 'object' ? this.reactiveForm.value?.incoTermsLoc2?.label.toUpperCase() :  (this.reactiveForm.value?.incoTermsLoc2 && this.reactiveForm.value?.incoTermsLoc2.toUpperCase() || this.incoTermsLoc2SelectedOption?.label || ""))
          : this.shippingAddress?.defaultShipVia ||
            this.shippingAddress?.incoTermsLoc2 ||
            this.shippingAddress?.shipVia || address.shipVia || "",
            shippingInfo: !this.reactiveForm.value.oneTimeShippingAddress
            ? ""
            : {
                acceptDate: this.reactiveForm?.value.lastestacceptDate
                  ? this.datePipe.transform(
                      this.reactiveForm?.value.lastestacceptDate,
                      "MM/dd/yyyy"
                    )
                  :address?.lastestacceptDate ? this.datePipe.transform(
                    address?.lastestacceptDate,
                    "MM/dd/yyyy"
                  ) :"",
                apptNeeded: this.reactiveForm.value.appoinment || address?.appoinment,
                forkLiftRequired: this.reactiveForm.value.accomodate|| address?.accomodate,
                jobSiteDelivery: this.reactiveForm.value.jobsiteDelivery || address?.jobsiteDelivery,
                largestTruckSize: this.reactiveForm.value.truckSize || address?.truckSize,
                liftGateAndPallet: this.reactiveForm.value.liftGateAndPallet || address?.liftGateAndPallet,
                loadingDock: this.reactiveForm.value.loading 
                || address?.loading,
                location: this.reactiveForm.value.Location || address?.Location,
                poleLiftRequired: this.reactiveForm.value.poleLift || address?.poleLift,
                requireNotification: this.reactiveForm.value.notification || address?.notification,
                siteContactName: this.reactiveForm.value.ContactName || address?.ContactName,
                siteContactPhone: this.reactiveForm.value.Phone|| address?.Phone,
                storeNumber: this.reactiveForm.value.storeNumber || address?.storeNumber,
              },
      // shippingInfo: this.shippingAddress?.shippingInfo
      //   ? this.shippingAddress?.shippingInfo
    };
    this.storageService.setItem("shippingAddress", address);
    // this.spinnerLoading = true;
    this.progressShow('updateShippingAddress');
    this.quoteService
      .updateShippingAddress(this.initialState.quoteCode, payLoad)
      .subscribe((res: any) => {
        this.spinnerLoading = false;
        this.progressHide();
        if ((res.body.status = "success")) {
          if (!addQuote) {
            if (this.initialState?.isAtpCheck) {
              const initialState: ModalOptions = {
                initialState: {
                  openFromaddressModal: true,
                  shipTo: shipTo,
                  quoteCode: this.initialState?.quoteCode,
                  entry: this.initialState.entry,
                  shippingOptions: this.shippingAddress,
                  shippingAddress: address,
                  entryIndex: this.initialState.entryIndex,
                  productType: this.initialState?.productType,
                  aptCheckEntrie: this.initialState?.aptCheckEntrie,
                   oneTimeShippingAddress: this.selectedTab == 1 ? false : true,
                  oneTimeShippingFlag:
                    this.reactiveForm.value.oneTimeShippingAddress,
                  originalDefaultShippingMethod: this.originalDefaultShippingMethod,
                  //  subProductType:this.initialState.solution[0].subProductType,
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

              this.modalRef.content.solutions = [
                this.initialState?.selectedProduct,
              ];
            } else {
              this.addTCart();
            }
          } else {
            this.addToQuote();
          }
        } else {
          this.addtoCartFailed = true;
          this.addtoCartErrorMessage = [];
          this.addtoCartErrorMessage.push({
            message: res.body.message,
          });
        }
      }, () => {
        this.progressHide();
      });
  }
  // chooseSolutionModal() {
  //   this.reactiveForm.value.shippingAddressID = "";
  //   let address: any;
  //   if (this.selectedTab == 1) {
  //     this.reactiveForm.value.oneTimeShippingAddress = false;
  //     address = this.shippingAddress;
  //     address.rdd = this.reactiveForm.value?.rdd;
  //     address.replacementOrder = this.reactiveForm.value.replacementOrder;
  //     address.hasClaimSubmitted = this.reactiveForm.value.hasClaimSubmitted;
  //     address.claimNumber = this.reactiveForm.value.Claim;
  //     address.replacementReason = this.reactiveForm.value.replacementReason;
  //     address.purchaseOrderNumber = this.reactiveForm.value.PO;
  //     address.orderNumber = this.reactiveForm.value.Order;
  //     address.invoiceNumber = this.reactiveForm.value.Invoice;
  //   } else {
  //     this.reactiveForm.value.oneTimeShippingAddress = true;
  //     address = this.reactiveForm.value;
  //     address.rdd = this.reactiveForm.value?.rdd;
  //     address.replacementOrder = this.reactiveForm.value.replacementOrder;
  //     address.hasClaimSubmitted = this.reactiveForm.value.hasClaimSubmitted;
  //     address.claimNumber = this.reactiveForm.value.Claim;
  //     address.replacementReason = this.reactiveForm.value.replacementReason;
  //     address.purchaseOrderNumber = this.reactiveForm.value.PO;
  //     address.orderNumber = this.reactiveForm.value.Order;
  //     address.invoiceNumber = this.reactiveForm.value.Invoice;
  //     address.addressCity = this.reactiveForm.value.city;
  //     address.addressLine1 = this.reactiveForm.value.streetAddress;
  //     address.addressLine2 = this.reactiveForm.value.streetAddress2;
  //     address.addressPostalCode = this.reactiveForm.value.zipCode;
  //     address.addressState = this.reactiveForm.value.state;
  //     address.defaultShippingWarehouse =
  //       this.shippingAddress.defaultShippingWarehouse;
  //     address.defaultShippingWarehouseDesc =
  //       this.shippingAddress.defaultShippingWarehouseDesc;
  //     address.shipVia = this.shippingAddress.defaulthSipVia;

  //     const states1: any = STATES[0];
  //     const states2: any = STATES[1];
  //     let country: any;

  //     country = states1.states.find(
  //       (item: any) => item.abbreviation === this.reactiveForm.value.state
  //     );
  //     if (country) {
  //       address.country = {
  //         isocode: states1.abbreviation,
  //         name: states1.name,
  //       };
  //     }
  //     if (!country) {
  //       country = states2.statesfind(
  //         (item: any) => item.abbreviation === this.reactiveForm.value.state
  //       );
  //       address.country = {
  //         isocode: states2.abbreviation,
  //         name: states2.name,
  //       };
  //     }

  //     const address2 = address?.streetAddress2
  //       ? address?.streetAddress2 + ", "
  //       : "";

  //     address.formattedAddress =
  //       address?.streetAddress +
  //       ", " +
  //       address2 +
  //       address?.city +
  //       " " +
  //       address?.zipCode;
  //   }

  //   const initialState: ModalOptions = {
  //     initialState: {
  //       solutions: [this.initialState?.selectedProduct],
  //       openFromaddressModal: true,
  //       shippingAddress: address,
  //       cartData: this.initialState?.cartData,
  //       feetyardForm: this.initialState?.feetyardForm,
  //       quoteCode: this.initialState?.quoteCode,
  //       productType: this.initialState?.productType,
  //       aptCheckEntrie: this.initialState?.aptCheckEntrie,
  //       multiCutIndication: this.initialState?.multiCutIndication,
  //       viewInventory: this.initialState?.viewInventory,
  //       oneTimeShippingFlag: this.reactiveForm.value.oneTimeShippingAddress,
  //       //  subProductType:this.initialState.solution[0].subProductType,
  //     },
  //   };

  //   this.modalRef.content.solutions = [this.initialState?.selectedProduct];
  // }
  getAddressForModals() {
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
      // address = this.shippingAddress;
      address.addressName = this.reactiveForm.value.name;
      address.requestedDeliveryDate = this.reactiveForm.value?.rdd;
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
    //  this.updateQuoteAddress(address);

    return address;
  }

  onHideModal(id: any) {
    // this.modalService.hide(id);
    if (this.reactiveForm.dirty) {
      this.sharedService.confirmation(this.modalService, id);
    } else {
      this.modalService.hide(id);
    }
    this.alert = "";
    this.cancelClick.emit(true);
  }
  shippingAddress: any;
  originalDefaultShippingMethod:any='';
  originalDefaultSM:any='';

  getShippingAddress() {
    //.log("this.atpcheckdata--->", this.atpCheckData);
    //this.progressShow('fetchingShippingAddress');
    this.defaultAddress
      .getDefaultShippingAddress(
        this.userService.getUserEmail().toLowerCase(),
        false,
        this.atpCheckData.code
      )
      .subscribe((res) => {
        //this.progressHide();
        this.shippingAddress = res.body;
        if(this.userInfo?.isCustomer || this.userInfo?.isSalesPerson  || this.userInfo?.isSalesOps){
          this.originalDefaultShippingMethod = res?.body?.originalDefaultShippingMethod;
          this.originalDefaultSM= res?.body?.originalDefaultShippingMethod;
          this.setDefaultShippingOptions(this.shippingAddress);
          
        }
        this.setDefaultAddressData();
        this.cdr.detectChanges();
      }, () => {
        this.progressHide();
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

  setDefaultShippingOptions(shippingAddress:any){
      this.defaultShippingMethod= shippingAddress?.defaultShippingMethod;
      this.shippingAddress.defaultShippingMethod = this.defaultShippingMethod;
      this.shippingAddress.defaultShippingMethod = this.defaultShippingMethod;
      this.shippingAddress.defaultShippingMethod = this.defaultShippingMethod;
      this.defaultShippingConditionDesc = shippingAddress?.defaultShippingConditionDesc;
      this.defaultShippingWarehouse = shippingAddress?.defaultShippingWarehouse;
      this.defaultShippingWarehouseDesc= shippingAddress?.defaultShippingWarehouseDesc;
      this.defaultIncoTerms = shippingAddress?.defaultIncoTerms;
      this.defaultIncoTermsDesc = shippingAddress?.defaultIncoTermsDesc;
      this.defaultShipVia = shippingAddress?.defaultShipVia;
     this.originalDefaultSM = shippingAddress?.originalDefaultShippingMethod;
     this.originalDefaultShippingMethod = shippingAddress?.originalDefaultShippingMethod;

  }
  shippingIncoTermsData: any = [];
  shippingMethodChange() {
    let val = this.reactiveForm.value.ShipVia;

    const selectedItem = this.shippingMethodDropdownData.find(
      (item: any) => item.value === val
    );

    this.shippingAddress.carrierNumber = undefined;
    this.shippingAddress.satellite = undefined;
    this.satellite = "";
    this.selectedCarrierOption = null;
    // this.reactiveForm.controls["carrierNumber"].setValue(null);
    //this.carrierOptionList = [];
    this.reactiveForm.controls["IncoTerms"].setValue(null);
    if (!this.userInfo.isCustomer && !this.userInfo.isSalesPerson && !this.userInfo?.isSalesOps) {
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
              this.incoTermsSelectedOption = this.shippingIncoTermsData[0]?.value;
              this.incoTermsLoc2SelectedOption = res.body.shipvia;
              this.reactiveForm.controls["IncoTerms"].setValue(this.shippingIncoTermsData[0]?.value);
              this.reactiveForm.controls["shippingWareHouse"].setValue(this.shippingWareHouseDropdownData[0]?.value);

            }
            else{
              this.spinnerLoading = false;
              this.showValidationError = true;
                this.validationErrorMessage = "Shipping Options are not available for customer"
                this.incoTermsLoc2SelectedOption = "";
                this.incoTermsSelectedOption = "";
                
            }
        },
        error: (err) => {
          this.spinnerLoading = false;
        },
      });
    }

    if (val == "CA" && ((this.userInfo?.isCustomer || this.userInfo?.isSalesPerson || this.userInfo?.isSalesOps))){
      this.changeValidatorsNull("incoTermsLoc2");
    }else if(val == "MA" && ((this.userInfo?.isCustomer || this.userInfo?.isSalesPerson || this.userInfo?.isSalesOps))){
      this.changeValidatorsRequired("incoTermsLoc2");
    }
    
  }
  // onSubmit(): void {
  //   this.submitted = true;
  //   let phoneNumber =
  //     this.reactiveForm.value?.Phone ||
  //     this.reactiveForm.value?.Phone ||
  //     "1234567890";
  //   phoneNumber = phoneNumber
  //     .replace("(", "")
  //     .replace(")", "")
  //     .replace(/ /g, "");
  //   const payLoad = {
  //     shippingCondition: this.shippingAddress.defaultShippingMethod ||
  //                         this.shippingAddress.shippingCondition || "",
  //     incoTerms: this.shippingAddress.defaultIncoTerms,
  //     addressCountry: "US",
  //     addressCity: !this.reactiveForm.value.oneTimeShippingAddress
  //       ? this.shippingAddress?.town
  //         ? this.shippingAddress?.town
  //         : ""
  //       : this.reactiveForm.value.city,
  //     addressLine1: !this.reactiveForm.value.oneTimeShippingAddress
  //       ? this.shippingAddress?.line1
  //         ? this.shippingAddress?.line1
  //         : ""
  //       : this.reactiveForm.value.streetAddress,
  //     addressLine2: !this.reactiveForm.value.oneTimeShippingAddress
  //       ? this.shippingAddress?.line2
  //         ? this.shippingAddress?.line2
  //         : ""
  //       : this.reactiveForm.value.streetAddress2,
  //     addressName: !this.reactiveForm.value.oneTimeShippingAddress
  //       ? this.shippingAddress?.companyName
  //         ? this.shippingAddress?.companyName
  //         : ""
  //       : this.reactiveForm.value.name,
  //     addressPostalCode: !this.reactiveForm.value.oneTimeShippingAddress
  //       ? this.shippingAddress?.postalCode
  //         ? this.shippingAddress?.postalCode
  //         : ""
  //       : this.reactiveForm.value.zipCode,
  //     addressState: !this.reactiveForm.value.oneTimeShippingAddress
  //       ? "US-" + this.shippingAddress?.region?.isocodeShort
  //         ? "US-" + this.shippingAddress?.region?.isocodeShort
  //         : ""
  //       : "US-" + this.reactiveForm.value.state,
  //     shipTo: this.shippingAddress?.shippingAddressID
  //       ? this.shippingAddress?.shippingAddressID
  //       : this.shippingAddress?.id,

  //     oneTimeShippingAddress: this.selectedTab == 1 ? false : true,
  //     phoneNumber: phoneNumber ? phoneNumber : "1234567890",
  //     requestedDeliveryDate: this.datePipe.transform(
  //       this.reactiveForm.value.rdd,
  //       "MM/dd/yyyy"
  //     ),
  //     plant:
  //       this.shippingAddress?.defaultShippingWarehouse ||
  //       this.shippingAddress?.shippingWarehouse ||
  //       "",
  //     shipVia:
  //       this.selectedTab == 1
  //         ? this.shippingAddress.defaultShipVia
  //         : this.reactiveForm.value?.ShipVia
  //         ? this.reactiveForm.value?.ShipVia
  //         : "",
  //     shippingInfo: !this.reactiveForm.value.oneTimeShippingAddress
  //       ? ""
  //       : {
  //           acceptDate: this.reactiveForm?.value.lastestacceptDate
  //             ? this.datePipe.transform(
  //                 this.reactiveForm?.value.lastestacceptDate,
  //                 "MM/dd/yyyy"
  //               )
  //             : "",
  //           apptNeeded: this.reactiveForm.value.appoinment,
  //           forkLiftRequired: this.reactiveForm.value.accomodate,
  //           jobSiteDelivery: this.reactiveForm.value.jobsiteDelivery,
  //           largestTruckSize: this.reactiveForm.value.truckSize,
  //           liftGateAndPallet: this.reactiveForm.value.liftGateAndPallet,
  //           loadingDock: this.reactiveForm.value.loading,
  //           location: this.reactiveForm.value.Location,
  //           poleLiftRequired: this.reactiveForm.value.poleLift,
  //           requireNotification: this.reactiveForm.value.notification,
  //           siteContactName: this.reactiveForm.value.ContactName,
  //           siteContactPhone: this.reactiveForm.value.Phone,
  //           storeNumber: this.reactiveForm.value.storeNumber,
  //         },
  //     // shippingInfo: this.shippingAddress?.shippingInfo
  //     //   ? this.shippingAddress?.shippingInfo
  //   };

  //   this.spinnerLoading = true;
  //   this.quoteService
  //     .updateShippingAddress(this.initialState.quoteCode, payLoad)
  //     .subscribe(
  //       (res: any) => {
  //         this.spinnerLoading = false;
  //         let address = this.shippingAddress;
  //         this.shippingAddress.rdd = this.reactiveForm.value.rdd;
  //         this.shippingAddress.requestedDeliveryDate = this.reactiveForm.value.rdd;
  //         if(this.selectedTab == 2){
  //           address = payLoad;
  //           address.shippingAddress = this.shippingAddress;
  //           address.companyName = this.reactiveForm.value.name;
  //           address.line1 = this.reactiveForm.value.streetAddress;
  //           address.town = this.reactiveForm.value.city;
  //           address.postalCode = this.reactiveForm.value.zipCode;
  //           address.defaultShippingMethod = this.shippingAddress.defaultShippingMethod;
  //           address.defaultShippingConditionDesc = this.shippingAddress.defaultShippingConditionDesc;
  //           address.rdd = this.reactiveForm.value.rdd;
  //           address.requestedDeliveryDate = this.reactiveForm.value.rdd;
  //           address.region = {
  //                 isocodeShort: this.reactiveForm.value.state,
  //           };
  //         }

  //         this.goToNextStep(
  //           address,
  //           payLoad.shipVia,
  //           payLoad.shipTo
  //         );
  //       },
  //       (err: any) => {
  //         this.spinnerLoading = false;
  //       }
  //     );
  // }
  onSubmit(): void {
    this.submitted = true;
    this.addtoCartErrorMessage = [];
    this.isPoBoxFlag = false;
    let shippingMethod = this.shipViaSelectedOption || this.shippingAddress?.defaultShippingMethod;
    if (this.shippingAddress?.formattedAddress?.includes("PO BOX") &&
      shippingMethod != 'PS' &&
      shippingMethod != 'PM') {
      this.isPoBoxFlag = true;
      this.addtoCartErrorMessage.push({message:"This shipping address is not allowed, please choose other shipping address"})
      return
    }
    if (this.initialState?.openAddAccessories) {
      const initialState: ModalOptions = {
        initialState: {
          cartData: {},
          itemName: {},
          postOrder:false,
          showSuccessAlert: false,
          loadAllAccessoriesDetails: true,
          shippingAddress: this.getAddressForModals(),
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
    } else if (this.reactiveForm.valid) {
      this.storageService.setItem("shippingAddress", this.shippingAddress);
      this.chooseSolutionModal();
    }
  }
  goToNextStep(address: string, shippingMethod: string, shipTo: string) {
    const initialState: ModalOptions = {
      initialState: {
        quoteCode: this.initialState.quoteCode,
        entry: this.initialState.entry,
        shippingAddress: address,
        shippingMethod: shippingMethod,
        entryIndex: this.initialState.entryIndex,
        shipTo: shipTo,
      },
    };
    this.modalRef = this.modalService.show(
      AddCompanionProductsComponent,
      Object.assign(initialState, {
        class: "modal-xl modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
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
    this.ProductService.progressShow('validateAddress');
    this.ProductService.validateAddress(payload).subscribe({
      next: (res) => {
        this.ProductService.progressHide();
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
      error: (err) => { this.ProductService.progressHide(); },
    });
  }

  isAddressValid: boolean = false;
  validateAddressOnFormChange() {
    if (
      this.reactiveForm.value.streetAddress.toLowerCase().includes(" po box") ||
      this.reactiveForm.value.streetAddress.toLowerCase().includes("p.o.box") ||
      this.reactiveForm.value.streetAddress.toLowerCase().includes(" box") ||
      this.reactiveForm.value.streetAddress.toLowerCase().includes(" po ") ||
      this.reactiveForm.value.streetAddress
        .toLowerCase()
        .includes("post office box") ||
      this.reactiveForm.value.streetAddress.toLowerCase().includes("p.o ") ||
      this.reactiveForm.value.streetAddress.toLowerCase().includes(" post ")
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
        .includes("p.o.box") ||
      this.reactiveForm.value.streetAddress2.toLowerCase().includes(" box") ||
      this.reactiveForm.value.streetAddress2.toLowerCase().includes(" po ") ||
      this.reactiveForm.value.streetAddress2
        .toLowerCase()
        .includes("post office box") ||
      this.reactiveForm.value.streetAddress2.toLowerCase().includes("p.o ") ||
      this.reactiveForm.value.streetAddress2.toLowerCase().includes(" post ")
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

      this.shippingWareHouseDropdownData = [];

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
          this.oneTime = true;
          const EvStatus = res?.d?.EvStatus;
          const EvMessage = res?.d?.EvMessage;
          if(EvStatus == "S"){
            this.isAddressValid = true;
            this.validateAddressModal(this.isAtpCheck, "Valid Address");
          }else if(EvStatus == "E" && EvMessage == "Invalid Address"){
            this.invalidShippingAddress("Invalid Address. Do you want to continue with your entered address?");
          }else if(EvStatus == "E" && EvMessage == "Suggested Address"){
            let EsAddress = res?.d?.EsAddress;
            let formatedAddress = `${EsAddress?.Addressline || ""}, ${EsAddress?.Politicaldivision2 || ""}, ${EsAddress?.Politicaldivision1 || ""}, ${EsAddress?.Postcodeprimarylow || ""}`;
            let suggestedAddress = `Suggested Address is : ${formatedAddress} \n\n <br><br>
                                      Do you want to continue with your entered address?`;
            this.invalidShippingAddress(suggestedAddress);
          }else{
            this.invalidShippingAddress("Invalid Address. Do you want to continue with your entered address?");
          }
         /*  if (res.errorCode === "1111") {
            this.isAddressValid = true;
            this.validateAddressModal(this.isAtpCheck, res?.errorMessage);
          } else if (res.errorCode === "0000") {
            this.isAddressValid = true;
            this.getShippingAddressMethods();
            this.getShippingWareHouseMethods();
          } else {
            this.isAddressValid = false;
            this.getShippingAddressMethods();
            this.getShippingWareHouseMethods();
            this.scrollPageToTop();
            this.errorMessage = res?.errorMessage;
          } */
        },
        error: (err) => {
          this.spinnerLoading = false;
        },
      });
    }
  }

  invalidShippingAddress(EvMessage:any) {
    this.openConfirmationModal({
      title: "Information",
      content: EvMessage,
      primaryActionLabel: "Continue",
      secondaryActionLabel: "Cancel",
      onPrimaryAction: () => {
        this.isAddressValid = true;
        this.getShippingAddressMethods();
        this.getShippingWareHouseMethods();
        this.scrollPageToTop();
      },
      onSecondaryAction: () => {
        this.isAddressValid = false;
        //this.errorMessage = EvMessage;
        this.returnChooseAddress();
      },
    });
  }

  getShippingAddressMethods() {
    this.ProductService.getShippingMethodWithOutFlag(
      this.reactiveForm.value.zipCode,
      this.oneTime,
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
    console.log("onSubmitOnetimeShipping",this.reactiveForm);
    if (this.reactiveForm.valid) {
      this.storageService.setItem("shippingAddress", this.shippingAddress);
      this.chooseSolutionModal();
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
    this.getShippingWareHouseMethods();
  }
  viewCartButton = true;
  cartCodeNumber: any = "";
  addTCart() {
    let phoneNumber =
      this.reactiveForm.value?.Phone ||
      this.reactiveForm.value?.Phone ||
      "1234567890";
    phoneNumber = phoneNumber
      .replace("(", "")
      .replace(")", "")
      .replace(/ /g, "");
    this.spinnerLoading = true;
    const data: any = this.initialState;
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
      shipToUnit: this.shippingAddress?.shippingAddressID
        ? this.shippingAddress?.shippingAddressID
        : this.shippingAddress?.id,

      oneTimeShippingAddress: this.selectedTab == 1 ? false : true,
      oneTimeShipTo: this.selectedTab == 1 ? false : true,
      phoneNumber: phoneNumber ? phoneNumber : "1234567890",
      requestedDeliveryDate: this.datePipe.transform(
        this.reactiveForm.value.rdd,
        "MM/dd/yyyy"
      ),
      incoTerms:
        this.selectedTab == 2
          ? this.reactiveForm.value.IncoTerms 
          : this.shippingAddress?.defaultIncoTerms ||
            this.shippingAddress?.incoTerms,
      shippingCondition:
        this.selectedTab == 2
          ? (this.userInfo?.isCustomer || this.userInfo?.isSalesPerson  || this.userInfo?.isSalesOps) ? this.shippingAddress?.originalDefaultShippingMethod || 
					  this.shippingAddress.defaultShippingMethod ||
                  this.shippingAddress.shippingCondition ||
                  "" : this.reactiveForm.value.ShipVia 
          : this.userInfo?.isCustomer || this.userInfo?.isSalesPerson  || this.userInfo?.isSalesOps ? this.shippingAddress?.originalDefaultShippingMethod || 
					  this.shippingAddress.defaultShippingMethod ||
                  this.shippingAddress.shippingCondition ||
                  "" : this.shippingAddress.defaultShippingMethod || this.shippingAddress.shippingCondition || "",
      shippingWarehouse:
        this.selectedTab == 2
          ? this.reactiveForm.value.shippingWareHouse 
          : this.shippingAddress.defaultShippingWarehouse ||
            this.shippingAddress.shippingWarehouse ||
            "",
      shipVia:
        this.selectedTab == 2
          ? (typeof this.reactiveForm.value?.incoTermsLoc2 == 'object' ? this.reactiveForm.value?.incoTermsLoc2?.label.toUpperCase() :  (this.reactiveForm.value?.incoTermsLoc2 && this.reactiveForm.value?.incoTermsLoc2.toUpperCase() || this.incoTermsLoc2SelectedOption?.label || ""))
          : this.shippingAddress?.defaultShipVia ||
            this.shippingAddress?.incoTermsLoc2 ||
            this.shippingAddress?.shipVia || "",
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
                requireNotification: this.reactiveForm.value.notification,
                siteContactName: this.reactiveForm.value.ContactName,
                siteContactPhone: this.reactiveForm.value.Phone,
                storeNumber: this.reactiveForm.value.storeNumber,
              },
      // shippingInfo: this.shippingAddress?.shippingInfo
      //   ? this.shippingAddress?.shippingInfo
    };
    this.storageService.setItem("shippingAddress", this.shippingAddress);
    this.storageService.setItem("atpCheckData", this.atpCheckData);
    this.cartData = this.storageService.cartData;
    const cartNumber = this.cartData?.code || null;
    this.cartCodeNumber = cartNumber;
    this.progressShow('addToCart');
    this.ProductService.addToCart(
      this.userService.getUserEmail().toLowerCase(),
      cartNumber,
      payLoad
    ).subscribe({
      next: (res) => {
        this.progressHide();
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
              postOrder:false,
              shippingAddress: this.shippingAddress
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
          this.progressHide();
          this.addtoCartErrorMessage =  (res?.body?.messages || []).filter((err:any)=> err?.status && err?.message);
          this.addtoCartFailed = true;
          this.spinnerLoading = false;
        }
      },
      error: (err) => {
        this.progressHide();
        this.addtoCartErrorMessage = err?.error;
        this.addtoCartFailed = true;
        this.spinnerLoading = false;
      },
    });
  }
  setShippingAddress() {
    let val = this.reactiveForm.value?.ShipVia;
    const selectedItem = this.shippingMethodDropdownData.find(
      (item: any) => item.value === val
    );
    let valSW = this.reactiveForm.value?.shippingWareHouse;
    const selectedItemSW = this.shippingWareHouseDropdownData.find(
      (item: any) => item.value === valSW
    );

    this.shippingAddress.defaultShippingMethod = selectedItem.value;
    this.shippingAddress.defaultShippingConditionDesc = selectedItem.label;
    this.shippingAddress.defaultIncoTerms = this.reactiveForm.value?.IncoTerms;
    this.shippingAddress.defaultIncoTermsDesc = "";
    this.shippingAddress.defaultShippingWarehouse = selectedItemSW.value;
    this.shippingAddress.defaultShippingWarehouseDesc = selectedItemSW.label;
    this.shippingAddress.defaultShipVia = typeof this.reactiveForm.value?.incoTermsLoc2 == 'object' ? this.reactiveForm.value?.incoTermsLoc2?.label.toUpperCase() :  (this.reactiveForm.value?.incoTermsLoc2 && this.reactiveForm.value?.incoTermsLoc2.toUpperCase() || "");


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
    this.shippingAddress.requestedDeliveryDate = this.reactiveForm.value?.rdd;
    this.shippingAddress.formattedAddress =
      this.reactiveForm.value?.streetAddress +
      ", " +
      this.reactiveForm.value?.streetAddress2 +
      this.reactiveForm.value?.city;
    +" " + this.reactiveForm.value?.zipCode;

    delete this.shippingAddress.district;
    this.storageService.setItem("shippingAddress", this.shippingAddress);
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
      ShipVia: "",
      replacementReason: "",
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

      notification: null,
      loading: null,
      offloading: true,
      accomodate: null,
      acknowledge: null,
      jobsiteDelivery: null,
      appoinment: null,
      liftGateAndPallet: null,
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
    this.selectedTab = index;
    this.errorMessage = "";
    if (index == 1) {
      this.onReset();
      this.getShippingAddress();
    this.getShippingAddressTotal();
 //   this.getOrderDates();
      this.reactiveForm.patchValue({
        oneTimeShippingAddress: false,
      });
      this.clearValidation();
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
      this.changeValidatorsRequired("ContactName");
      this.reactiveForm.controls["Phone"].setValidators([
        Validators.required,
        Validators.pattern(this.phonePattern),
      ]);
      this.reactiveForm.controls["Phone"].updateValueAndValidity();
      this.changeValidatorsRequired("notification");
      this.changeValidatorsRequired("loading");
      this.changeValidatorsRequired("poleLift");
      this.changeValidatorsRequired("accomodate");
      this.changeValidatorsRequired("acknowledge");

      this.changeValidatorsRequired("jobsiteDelivery");
      this.changeValidatorsRequired("appoinment");
      this.changeValidatorsRequired("liftGateAndPallet");
     // this.changeValidatorsRequired("storeNumber");
      this.changeValidatorsRequired("lastestacceptDate");
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
  userInfo: any;

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
                this.incoTermsOptions.push({
                  value: res.body.incoTerms,
                  label: res.body.incoTermsDesc,
                });
                this.incoTermsSelectedOption = this.incoTermsOptions[0].value;
                this.incoTermsLoc2Options = [];
                this.incoTermsLoc2Options.push({
                  value: res.body.shipvia,
                  label: res.body.shipViaDesc,
                })
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

  changeincoTermsOptions(event: any) {
    this.incoTermsSelectedOption = event;
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
        this.userInfo?.isCustomer || this.userInfo.isSalesPerson,
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
  getIncoTerms(shipVia: any) {
    this.incoTermsOptions = [];
    this.orderService.getIncoTerms(shipVia).subscribe({
      next: (res) => {
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
      error: (err) => {},
    });
  }

  shippingAddressess: any = "";
  satellite: string = "";
  shipViaModalSubmit(id?: any) {
    // this.modalService.hide(id);
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

    // if (this.shippingAddress.defaultShippingMethod == "CA") {
    //   let shipTo = this.shippingAddress?.shippingAddressID
    //     ? this.shippingAddress?.shippingAddressID
    //     : this.shippingAddress?.id;
    //   this.shippingMethodVendorAccountNumbers(shipTo, shipTo);
    // }
    /* if (this.shippingAddress.defaultShippingMethod == "PS") {
      let zipCode = !this.reactiveForm.value.oneTimeShippingAddress
        ? this.shippingAddress?.postalCode
          ? this.shippingAddress?.postalCode
          : ""
        : this.reactiveForm.value.zipCode;
      this.shippingMethodZoneZipcodeDetermination(zipCode);
    } */
  }

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

  shippingWareHouseSelectedOption: any = "";
  incoTermsLoc2SelectedOption: any = "";
  incoTermsLoc2Options: any = [];
  changeShippingWareHouseOptions(event: any) {
    this.shippingWareHouseSelectedOption = event;
    this.getIncoTermsLoc2(event);
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
  getIncoTermsLoc2(shippingWareHouse: any) {
    this.incoTermsLoc2Options = [];
    let postalCode = this.shippingAddress?.postalCode;
    if (this.shippingAddress?.postalCode.includes("-")) {
      postalCode = this.shippingAddress?.postalCode.split("-")[0];
    }
    this.incoTermsLoc2Options = [];
    this.incoTermsLoc2Options = [];
    const selectedShippingMethod = this.shipViaOptions.find(
      (item: any) => item.value === this.shipViaSelectedOption
    );
    this.orderService
      .getIncoTermsLoc2(
        postalCode,
        this.shippingWareHouseSelectedOption,
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

  changeIncoTermsLoc2Options(event: any) {
    this.incoTermsLoc2SelectedOption = event;
    this.shippingWareHouseModalSubmit();
  }

  shippingWareHouseOptions: any = [];
  shippingWareHouseType: string = "";
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
        this.getIncoTermsLoc2(this.shippingWareHouseOptions);
        this.modalRef = this.modalService.show(template, {
          id: "shipingWareHouseModal",
          class: "modal-md modal-dialog-centered",
          backdrop: "static",
          keyboard: false,
        });
      }
    );
  }

  closeShippingWareHouseModal() {
    this.incoTermsLoc2SelectedOption = this.shippingAddress?.defaulthSipVia;
    this.shippingWareHouseSelectedOption = this.shippingAddress?.defaultShippingWarehouse;
    this.incoTermsSelectedOption = this.shippingAddress?.defaultIncoTerms;
    this.shipViaSelectedOption = this.shippingAddress?.defaultShippingMethod;
    this.originalDefaultSM = this.originalDefaultShippingMethod ;
    this.modalService.hide("shipingWareHouseModal");
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
    if (flag === true) {
      this.shippingAddress.defaultShipVia = typeof selectedIncoTermsItem == 'object' ? selectedIncoTermsItem?.label.toUpperCase() : selectedIncoTermsItem ;
      this.shippingAddress.defaultShipViaDesc = typeof selectedIncoTermsItem == 'object' ? selectedIncoTermsItem?.label.toUpperCase() : selectedIncoTermsItem ;
    } else {
      this.shippingAddress.defaultShipVia = selectedIncoTermsItem?.value.toUpperCase();;
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
          this.shippingIncoTermsLoc2Data = [];
          const resObject = res?.body;
          const objectKeys = Object.keys(resObject).sort();

          objectKeys.forEach((key) => {
            this.shippingIncoTermsLoc2Data.push({
              value: res?.body[key].shipvia,
              label: res?.body[key].shipViaDesc,
            });
          });
        },
        error: (err) => {},
      });
    this.shippingAddress.defaultShippingWarehouse = selectedItem?.value;
    this.shippingAddress.defaultShippingWarehouseDesc = selectedItem?.label;
  }

  shippingOptionsModal(template: TemplateRef<any>) {
    // this.spinnerLoading = true;
    this.shippingWareHouseOptions = [];

    this.shippingWareHouseSelectedOption =
      this.shippingAddress?.defaultShippingWarehouse || "";
    this.shipViaOptions = [];
    this.shipViaSelectedOption =
       this.shippingAddress?.defaultShippingMethod ||
      this.shipViaOptions[0].value;
    this.progressShow('fetchingShippingOptions');
    this.ProductService.getShippingMethodWithOutFlag(
      this.shippingAddress.postalCode,
      this.reactiveForm.value.oneTimeShippingAddress,
      (this.userInfo?.isCustomer || this.userInfo?.isSalesPerson || this.userInfo?.isSalesOps),
      this.shipViaSelectedOption
    ).subscribe((res: any) => {
      this.progressHide();
      if (res?.body) {
        this.shipViaOptions = [];
        for (let key of Object.entries(res?.body)) {
          this.shipViaOptions.push({
            value: key[0],
            label: key[1],
          });
        }
      }
      if (this.userInfo.isCustomer || this.userInfo.isSalesPerson || this.userInfo?.isSalesOps) {
        
        this.spinnerLoading = false;
        this.shipViaSelectedOption =
          this.shippingAddress?.defaultShippingMethod ||
          this.shipViaOptions[0].value;
          this.shippingWareHouseOptions.push({
              value: this.shippingAddress?.defaultShippingWarehouse,
              label: this.shippingAddress?.defaultShippingWarehouseDesc,
            });
            this.incoTermsOptions=[];
            this.incoTermsOptions.push({
              value: this.shippingAddress?.defaultIncoTerms,
              label: this.shippingAddress?.defaultIncoTermsDesc,
            });
            this.incoTermsLoc2Options = [];
            this.incoTermsLoc2Options.push({
              value: this.shippingAddress?.defaultShipVia,
              label: this.shippingAddress?.defaultShipViaDesc,
            });

            this.incoTermsLoc2SelectedOption =
              this.shippingAddress?.defaultShipVia;
        this.incoTermsSelectedOption = this.incoTermsOptions[0].value;
         
      }
     if (!this.userInfo.isCustomer && !this.userInfo.isSalesPerson && !this.userInfo?.isSalesOps) {
        this.spinnerLoading = false;
        this.shipViaSelectedOption =
          this.shippingAddress?.defaultShippingMethod ||
          this.shipViaOptions[0].value;

        this.getIncoTerms(this.shipViaSelectedOption);
       // this.incoTermsSelectedOption =this.incoTermsOptions[0].value ||  this.shippingAddress?.defaultIncoTerms;

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

            this.incoTermsLoc2SelectedOption =
              this.shippingAddress?.defaultShipVia;
            this.getIncoTermsLoc2(this.shippingWareHouseSelectedOption);
            this.incoTermsSelectedOption =
              this.shippingAddress?.defaultIncoTerms ||
              this.incoTermsOptions[0].value;
          }
        );
      }
      this.modalRef = this.modalService.show(template, {
        id: "shippingOptionsModal",
        class: "modal-lg modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      });
    }, () => {
      this.progressHide();
    });
  }


  closeShippingOptionModal() {
    this.modalService.hide("shippingOptionsModal");
  }

  // shippingOptionModalSubmit() {
  //   this.shipViaModalSubmit();
  //   this.shippingWareHouseModalSubmit();
  //   this.modalService.hide("shippingOptionModal");
  // }
  addToQuoteClick() {
    this.chooseSolutionModal(true);
  }
  addToQuote() {
    let payload = {};
    let rdd: any = "";
    if (this.reactiveForm.value?.rdd) {
      rdd = this.datePipe.transform(this.reactiveForm.value?.rdd, "MM/dd/yyyy");
    }
    console.log("entryData---->",this.initialState,this.shippingAddress)
    payload = {
      shipToUnit: this.shippingAddress?.shippingAddressID
        ? this.shippingAddress?.shippingAddressID
        : this.shippingAddress?.id,
        incoTerms:
        this.selectedTab == 2
          ? this.reactiveForm.value.IncoTerms 
          : this.shippingAddress?.defaultIncoTerms ||
            this.shippingAddress?.incoTerms,
      shippingCondition:
        this.selectedTab == 2
          ? this.userInfo?.isCustomer || this.userInfo?.isSalesPerson  || this.userInfo?.isSalesOps ? this.shippingAddress?.originalDefaultShippingMethod || 
					this.shippingAddress.defaultShippingMethod ||
                  this.shippingAddress.shippingCondition ||
                  "" : this.reactiveForm.value.ShipVia
          : this.userInfo?.isCustomer || this.userInfo?.isSalesPerson  || this.userInfo?.isSalesOps ? this.shippingAddress?.originalDefaultShippingMethod || 
					  this.shippingAddress.defaultShippingMethod ||
                  this.shippingAddress.shippingCondition ||
                  "" : this.shippingAddress.defaultShippingMethod || this.shippingAddress.shippingCondition || "",
      shippingWarehouse:
        this.selectedTab == 2
          ? this.reactiveForm.value.shippingWareHouse 
          : this.shippingAddress.defaultShippingWarehouse ||
            this.shippingAddress.shippingWarehouse ||
            "",
      shipVia:
        this.selectedTab == 2
          ? (typeof this.reactiveForm.value?.incoTermsLoc2 == 'object' ? this.reactiveForm.value?.incoTermsLoc2?.label.toUpperCase() :  (this.reactiveForm.value?.incoTermsLoc2 && this.reactiveForm.value?.incoTermsLoc2.toUpperCase() || this.incoTermsLoc2SelectedOption?.label || ""))
          : this.shippingAddress?.defaultShipVia ||
            this.shippingAddress?.incoTermsLoc2 ||
            this.shippingAddress?.shipVia || "",
          
      requestedDeliveryDate: rdd,
      oneTimeShipTo: this.selectedTab == 1 ? false : true,
      oneTimeShippingAddress: this.selectedTab == 1 ? false : true,
      item: [
        {
          feet: "",
          inches: "",
          productCode: this.initialState.entry.code,
          requestedQty: this.initialState.entry.quantity.toString(),
          requestedUOM: this.initialState.entry.checkUom,
          sameDyeLot:this.initialState.entry.sameDyeLot,
          dyeLot: this.initialState.entry.requestedDyelot,
          incoTerms:
        this.selectedTab == 2
          ? this.reactiveForm.value.IncoTerms 
          : this.shippingAddress?.defaultIncoTerms ||
            this.shippingAddress?.incoTerms,
      shippingCondition:
        this.selectedTab == 2
          ? this.userInfo?.isCustomer || this.userInfo?.isSalesPerson  || this.userInfo?.isSalesOps ? this.shippingAddress?.originalDefaultShippingMethod || 
					  this.shippingAddress.defaultShippingMethod ||
                  this.shippingAddress.shippingCondition ||
                  "" : this.reactiveForm.value.ShipVia 
          : this.userInfo?.isCustomer || this.userInfo?.isSalesPerson  || this.userInfo?.isSalesOps ? this.shippingAddress?.originalDefaultShippingMethod || 
					  this.shippingAddress.defaultShippingMethod ||
                  this.shippingAddress.shippingCondition ||
                  "" : this.shippingAddress.defaultShippingMethod || this.shippingAddress.shippingCondition || "",
      shippingWarehouse:
        this.selectedTab == 2
          ? this.reactiveForm.value.shippingWareHouse 
          : this.shippingAddress.defaultShippingWarehouse ||
            this.shippingAddress.shippingWarehouse ||
            "",
      shipVia:
        this.selectedTab == 2
          ? (typeof this.reactiveForm.value?.incoTermsLoc2 == 'object' ? this.reactiveForm.value?.incoTermsLoc2?.label.toUpperCase() :  (this.reactiveForm.value?.incoTermsLoc2 && this.reactiveForm.value?.incoTermsLoc2.toUpperCase() || this.incoTermsLoc2SelectedOption?.label || ""))
          : this.shippingAddress?.defaultShipVia ||
            this.shippingAddress?.incoTermsLoc2 ||
            this.shippingAddress?.shipVia || "",
          requestedDeliveryDate: rdd,
          solution: [],
        },
      ],
    };

    // this.spinnerLoading = true;
    this.progressShow('addToQuote')
    this.quoteService
      .addToQuote(
        this.initialState.quoteCode,
        this.initialState.entryIndex,
        payload
      )
      .subscribe(
        (res) => {
          this.progressHide();
          this.spinnerLoading = false;
          if (res.body.messages[0].status === "00001") {
            this.addtoCartFailed = true;
            this.addtoCartErrorMessage.push({
              message: res.body.messages[0].message,
            });
          } else  if (!res?.body?.errorMessages &&
            !(
              res.body.hasOwnProperty("messages") &&
              res?.body?.messages?.length > 0 &&
              (res?.body?.messages[0]?.status === "Error" ||
                res?.body?.messages[1]?.status === "Error" ||
                res?.body?.messages[0]?.status === "Failed")
            )
          ){
            this.modalService.hide("ChooseAddressModal");
          }else {
            this.addtoCartErrorMessage =  (res?.body?.messages || []).filter((err:any)=> err?.status && err?.message);
            this.addtoCartFailed = true;
            this.spinnerLoading = false;
          }
          this.quoteService.updateData.next(true);
        },
        (err: any) => {
          this.progressHide();
          this.spinnerLoading = false;
          this.quoteService.updateData.next(true);
        }
      );
  }
  showMessage: boolean = false;
  
  validationErrorMessage: any;
  erpProductCategory: any;
  shippingOptionFlag: boolean = false;
  validateShipVia(event: any) {
    console.log("sdfhsdhjfgsdjfhgsd",event);
    this.showValidationError = false;

    // Add your code here
  }

  validateShipViaOneTime(event: any) {
    if (event != "" && event != null  && !this.userInfo?.isCustomer && !this.userInfo?.isSalesOps && !this.userInfo?.isSalesPerson) {
     
      this.erpProductCategory = this.initialState.entry.product.erpProductCategory;
      let shipViaSelectedOption =
        this.reactiveForm?.value.ShipVia.label ||
        this.reactiveForm?.value.ShipVia;
      let incoTermsLoc2SelectedOption =
      this.reactiveForm.value?.incoTermsLoc2?.label || this.reactiveForm.value?.incoTermsLoc2 || this.incoTermsLoc2SelectedOption?.label;
      let incoTermsSelectedOption = this.reactiveForm.value?.IncoTerms || this.reactiveForm.value?.IncoTerms?.label;
      let shippingWareHouseSelectedOption = this.reactiveForm.value?.shippingWareHouse || this.reactiveForm.value?.shippingWareHouseSelectedOption?.label;
      incoTermsLoc2SelectedOption = incoTermsLoc2SelectedOption ? incoTermsLoc2SelectedOption.toUpperCase() : incoTermsLoc2SelectedOption;

      this.orderService
      .validateShippingOptions(shippingWareHouseSelectedOption,this.erpProductCategory, incoTermsLoc2SelectedOption)
      .subscribe({
        next: (res) => {
          this.shippingOptionFlag = true;
          if (res.body?.status === "success") {
           
            this.orderService
            .validateShipVia(shipViaSelectedOption, incoTermsLoc2SelectedOption)
            .subscribe({
              next: (res) => {
                if (res.body?.status === "success") {
                } else if (res.body?.status === "error") {
           
                  this.spinnerLoading = false;
            
                  //  this.getIncoTermsLoc2(this.shippingWareHouseSelectedOption);
                  this.showValidationError = true;
                  this.addtoCartFailed = true;
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

      
          } else if (res.body?.status === "error") {
           
                  this.spinnerLoading = false;
            
                  //  this.getIncoTermsLoc2(this.shippingWareHouseSelectedOption);
                  this.showValidationError = true;
                  this.addtoCartFailed = true;
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

  shippingOptionModalSubmit() {
    this.shipViaModalSubmit();
    this.shippingWareHouseModalSubmit();
    this.closeShippingOptionModal();
    this.modalService.hide("shippingOptionModal");
  }

  validateShipViaAddress(type: any) {
    this.addtoCartErrorMessage = [];
    this.isPoBoxFlag = false;
    let shippingMethod = this.shipViaSelectedOption || this.shippingAddress?.defaultShippingMethod;
    if (this.shippingAddress?.formattedAddress?.includes("PO BOX") &&
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

    if(!this.userInfo?.isCustomer && !this.userInfo?.isSalesPerson && !this.userInfo?.isSalesOps ){
      this.progressShow('validateShippingOptions');
      this.orderService
      .validateShippingOptions(
        shippingWareHouseSelectedOption,
        this.erpProductCategory,
        incoTermsLoc2SelectedOption
      )
      .subscribe({
        next: (res) => {
          this.shippingOptionFlag = true;

          if (res.body?.status === "success") {
            this.orderService
              .validateShipVia(
                shipViaSelectedOption,
                incoTermsLoc2SelectedOption
              )
              .subscribe({
                next: (res) => {
                  this.progressHide();
                  this.shippingOptionFlag = true;
                  if (res.body?.status === "success") {
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
                  } else if (res.body?.status === "error") {
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
                error: (err) => {},
              });
          } else if (res.body?.status === "error") {
            // this.shippingWareHouseSelectedOption =
            //   this.shippingAddress?.defaultShippingWarehouse || "";
            this.spinnerLoading = false;
            this.progressHide();
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
          this.progressHide();
        },
      });
    }else{
      this.originalDefaultShippingMethod = this.originalDefaultSM;
      this.shippingAddress.originalDefaultShippingMethod = this.originalDefaultShippingMethod;
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
    }
    
  }
  // validateShipViaAddress(type: any) {
  //   this.addtoCartErrorMessage = [];
  //   this.isPoBoxFlag = false;
  //   if ( this.shippingAddress?.formattedAddress?.includes("PO BOX")) {
  //     this.isPoBoxFlag = true;
  //     this.addtoCartErrorMessage.push({ message: "Shipping to a PO BOX is not permitted. Please select an alternative shipping address" });
  //     this.closeShippingOptionModal();
  //     return
  //   }
  //   console.log(type);
  //   console.log(
  //     "this.shipViaSelectedOption",
  //     this.shipViaSelectedOption,
  //     this.incoTermsLoc2SelectedOption
  //   );
  //   let shipViaSelectedOption =
  //     this.shipViaSelectedOption || this.shippingAddress?.defaultShippingMethod;
  //   let incoTermsLoc2SelectedOption =
  //     this.incoTermsLoc2SelectedOption.label ||
  //     this.incoTermsLoc2SelectedOption ||
  //     this.shippingAddress?.defaultShipVia;
  //   let incoTermsSelectedOption =
  //     this.incoTermsSelectedOption ||
  //     this.defaultIncoTerms ||
  //     this.shippingAddress?.defaultIncoTerms;
  //   let shippingWareHouseSelectedOption =
  //     this.shippingWareHouseSelectedOption ||
  //     this.shippingAddress?.defaultShippingWarehouse;

  //     incoTermsLoc2SelectedOption = incoTermsLoc2SelectedOption ? incoTermsLoc2SelectedOption.toUpperCase() : incoTermsLoc2SelectedOption;

  //   if(!this.userInfo?.isCustomer && !this.userInfo.isSalesPerson && !this.userInfo?.isSalesOps){
  //     this.orderService
  //     .validateShippingOptions(
  //       shippingWareHouseSelectedOption,
  //       this.erpProductCategory,
  //       incoTermsLoc2SelectedOption
  //     )
  //     .subscribe({
  //       next: (res) => {
  //         this.shippingOptionFlag = true;

  //         if (res.body.status === "success") {
  //           this.orderService
  //             .validateShipVia(
  //               shipViaSelectedOption,
  //               incoTermsLoc2SelectedOption
  //             )
  //             .subscribe({
  //               next: (res) => {
  //                 this.shippingOptionFlag = true;
  //                 if (res.body.status === "success") {
  //                   this.populateShippingOptions();
  //                   if (type == "chooseSolution") {
  //                     this.onSubmit();
  //                   }
  //                   if (type == "changeShippingOption") {
  //                     this.shippingOptionModalSubmit();
  //                   }
  //                   if (type == "addTCart") {
  //                     this.addTCart();
  //                     ``;
  //                   }
  //                 } else if (res.body.status === "error") {
  //                   // this.shippingWareHouseSelectedOption =
  //                   //   this.shippingAddress?.defaultShippingWarehouse || "";
  //                   this.spinnerLoading = false;

  //                   //  this.getIncoTermsLoc2(this.shippingWareHouseSelectedOption);
  //                   this.showValidationError = true;
  //                   this.validationErrorMessage = res.body.message;
  //                   this.addtoCartErrorMessage = [
  //                     ...[],
  //                     ...[{ message: this.validationErrorMessage }],
  //                   ];
  //                   setTimeout(() => {
  //                     this.addtoCartErrorMessage = [];
  //                   }, 8000);
  //                   window.scrollTo({
  //                     top: 0,
  //                     behavior: "smooth",
  //                   }); // Handle error
  //                 }
  //               },
  //               error: (err) => {},
  //             });
  //         } else if (res.body.status === "error") {
  //           // this.shippingWareHouseSelectedOption =
  //           //   this.shippingAddress?.defaultShippingWarehouse || "";
  //           this.spinnerLoading = false;

  //           //  this.getIncoTermsLoc2(this.shippingWareHouseSelectedOption);
  //           this.showValidationError = true;
  //           this.validationErrorMessage = res.body.message;
  //           this.addtoCartErrorMessage = [
  //             ...[],
  //             ...[{ message: this.validationErrorMessage }],
  //           ];
  //           setTimeout(() => {
  //             this.addtoCartErrorMessage = [];
  //           }, 8000);
  //           window.scrollTo({
  //             top: 0,
  //             behavior: "smooth",
  //           }); // Handle error
  //         }
  //       },
  //       error: (err) => {},
  //     });
  //   }else{
  //     this.populateShippingOptions();
  //     if (type == "chooseSolution") {
  //       this.onSubmit();
  //     }
  //     if (type == "changeShippingOption") {
  //       this.shippingOptionModalSubmit();
  //     }
  //     if (type == "addTCart") {
  //       this.addTCart();
  //       ``;
  //     }
  //   }
    
  // }
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
    let incoTermsLoc2SelectedOption ='';
      // this.incoTermsLoc2SelectedOption.label ||
      // this.incoTermsLoc2SelectedOption ||
      // this.shippingAddress?.defaultShipVia;
      incoTermsLoc2SelectedOption = incoTermsLoc2SelectedOption ? incoTermsLoc2SelectedOption.toUpperCase() || this.shippingAddress?.defaultShipVia: incoTermsLoc2SelectedOption ||this.shippingAddress?.defaultShipVia;


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

  progressShow(msgType: any) {
    const messageConstants = MESSAGE_CONSTANTS?.quotes?.QuoteDetails?.[msgType]
    this.openProgressModal({
      modalHeaderText: messageConstants?.headerText,
      progressText: messageConstants?.bodyText,
      progressBarText: messageConstants?.barText
    });
  }
  progressHide() {
    this.modalService.hide("progressModal");
  }
  openProgressModal(data = {}, size: any = "md", modalId = "progressModal") {
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
        id: modalId,
        class: `modal-${size} modal-dialog-centered`,
      })
    );
  }
}
