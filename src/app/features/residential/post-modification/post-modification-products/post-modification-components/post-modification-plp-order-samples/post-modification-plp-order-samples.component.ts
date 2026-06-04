import { Component, Input, OnInit, TemplateRef } from "@angular/core";
import { Route, Router } from "@angular/router";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { Config, Columns, DefaultConfig } from "ngx-easy-table";
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { StorageService } from "src/app/features/http-services/storage.service";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { PostModificationProductAddressService } from "../post-modification-services/post-modification-product-address.service";
@Component({
    selector: "residential-post-modification-plp-order-samples",
    templateUrl: "./post-modification-plp-order-samples.component.html",
    styleUrls: ["./post-modification-plp-order-samples.component.scss"],
    standalone: false
})
export class PostModificationPlpOrderSamplesComponent implements OnInit {
  modalRef?: BsModalRef;
  cards: any = [];
  showGotoCartBtn = false;
  selectedSize: any = '24" X 24"';
  selectedQuantity: any = "1";
  // orderSamples: any;
  reactiveForm!: FormGroup;
  initialState: any;
  submitted = false;
  enableButton: boolean = false;
  @Input() productColorVariantOptions: any = [];
  @Input() cartIdNew: any;
  image: any =
    "https://s7d4.scene7.com/is/image/MohawkResidential/28074_819_repeat?wid=200&hei=200&scl=3";
  orderSamples: any = [
    {
      src: "https://s7d4.scene7.com/is/image/MohawkResidential/28074_717_swatch?wid=200&hei=200&scl=3",
      title: "Crackled Glaze",
      price: "717",
      size: '24" X 24"',
      quantity: "1",
    },
    {
      src: "https://s7d4.scene7.com/is/image/MohawkResidential/28074_727_swatch?wid=200&hei=200&scl=3",
      title: "Gleaming Tan",
      price: "727",
      size: '30" X 30"',
      quantity: "2",
    },
    {
      src: "https://s7d4.scene7.com/is/image/MohawkResidential/28074_729_swatch?wid=200&hei=200&scl=3",
      title: "Homestead",
      price: "729",
      size: '36" X 36"',
      quantity: "3",
    },
    {
      src: "https://s7d4.scene7.com/is/image/MohawkResidential/28074_732_repeat?wid=200&hei=200&scl=3",
      title: "Adobe",
      price: "732",
      size: '24" X 24"',
      quantity: "1",
    },
    {
      src: "https://s7d4.scene7.com/is/image/MohawkResidential/28074_752_repeat?wid=200&hei=200&scl=3",
      title: "Redstone Lasso",
      price: "752",
      size: '30" X 30"',
      quantity: "2",
    },
    {
      src: "https://s7d4.scene7.com/is/image/MohawkResidential/28074_819_repeat?wid=200&hei=200&scl=3",
      title: "Shimmer",
      price: "819",
      size: '36" X 36"',
      quantity: "3",
    },
  ];
  productDetails: any;
  accountData: any;
  constructor(
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private productService: PostModificationProductAddressService,
    private route: Router,
    private formBuilder: FormBuilder,
    private router: Router,
    private storageService: StorageService,
    private userService: UserService
  ) {}

  orderSamplesModal(template1: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template1, {
      id: 1,
      class: "modal-xl modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }
  sidebarPath: any;
  selectedVarient = "";

  ngOnInit(): void {
    this.sidebarPath = localStorage.getItem("path");
    this.getAccountData();
    const initialData: any = this.modalService.config.initialState;

    this.orderSamples = initialData?.varients || [];
    this.selectedVarient = initialData?.selectedVarient;
    this.reactiveForm = this.formBuilder.group({
      Adobe: ["", Validators.required],
      AdobeQuantity: ["", Validators.required],
    });
    this.orderSamples?.map((element: any) => {
      if (element.value.code == initialData?.selectedVarient) {
        element.selected = true;
        element.size = '24" X 24"';
        element.quantity = "1";
      } else {
        element.selected = false;
        element.size = '24" X 24"';
        element.quantity = "1";
      }
    });
    this.getPdp();
  }
  getAccountData() {
    this.storageService
      .getItem("shippingAddress")
      .subscribe((accountData: any) => {
        this.accountData = accountData;
      });
  }
    onHideModal() {
      this.bsModalRef.hide();
    }
  value: boolean = true;
  onSelectItem(item: any) {
    item.selected = item.selected === undefined ? true : !item.selected;
    let anyItemSelected = false;
    for (let i = 0; i < this.orderSamples.length; i++) {
      if (this.orderSamples[i].selected) {
        anyItemSelected = true;
        break;
      }
    }

    this.enableButton = anyItemSelected;
    this.value = !this.value;
  }

  clearSamples() {
    this.showGotoCartBtn = false;
    this.orderSamples.map((item: any) => {
      item.selected = false;
      item.size = "";
      item.quantity = "";
    });
  }

  getPdp() {
    // this.productService.getPlpData("").subscribe((res) => {
    //   // this.orderSamples = res?.body?.backingOptions;
    // });
  }
  checkCartAdded() {
    const filterData = this.orderSamples.filter(
      (item: any) => item.quantity != "" && item.quantity != null
    );
    return filterData.length == 0;
  }
  addToCartClick() {
    this.showGotoCartBtn = true;
    let mockcartRequest;

    mockcartRequest = {
      addressCity: this.accountData?.isOneTimeShippingAddress
        ? this.accountData?.data?.city
          ? this.accountData?.data?.city
          : ""
        : this.accountData?.data?.town
        ? this.accountData?.data?.town
        : "",
      addressCountry: this.accountData?.isOneTimeShippingAddress
        ? this.accountData?.data?.country
          ? this.accountData?.data?.country
          : ""
        : this.accountData?.data?.country
        ? this.accountData?.data?.country
        : "",
      addressLine1: this.accountData?.isOneTimeShippingAddress
        ? this.accountData?.data?.streetAddress
          ? this.accountData?.data?.streetAddress
          : ""
        : this.accountData?.data?.line1
        ? this.accountData?.data?.line1
        : "",
      addressLine2: this.accountData?.isOneTimeShippingAddress
        ? this.accountData?.data?.streetAddress2
          ? this.accountData?.data?.streetAddress2
          : ""
        : this.accountData?.data?.line2
        ? this.accountData?.data?.line2
        : "",
      addressName: "Mohawk Group",
      addressPostalCode: this.accountData?.isOneTimeShippingAddress
        ? this.accountData?.data?.zipCode
          ? this.accountData?.data?.zipCode
          : ""
        : this.accountData?.data?.postalCode
        ? this.accountData?.data?.postalCode
        : "",
      addressState: this.accountData?.isOneTimeShippingAddress
        ? this.accountData?.data?.state
          ? this.accountData?.data?.state
          : ""
        : this.accountData?.data?.region
        ? this.accountData?.data?.region?.isocodeShort
        : "",
      claimNumber: "",
      hasClaimSubmitted: false,
      invoiceNumber: "",
      item: [
        {
          feet: this.productDetails?.feet,
          inches: this.productDetails?.inches,
          productCode: this.productDetails?.code,
          requestedQty: this.productDetails?.quantity,
          requestedUOM: this.productDetails?.unit,
          solution: [
            {
              plant: "6225",
              giveAway: true,
              rollAssignment: "",
              rollNumber: "11018811",
              orderMin: "3.00",
              orderMax: "3.00",
              dyeLot: "P23414",
              rollAssigned: "5",
              solutionID: "600",
            },
          ],
        },
      ],
      oneTimeShippingAddress: true,
      orderNumber: "0001120",
      purchaseOrderNumber: "POTest",
      replacementOrder: true,
      replacementReason: "reason",
      requestedDeliveryDate: "2022-11-03T17:59:05.430Z",
      sampleProduct: true,
      shipVia: "",
      orderSamples: this.productColorVariantOptions.filter(
        (itm: any) => itm.selected
      ),
      shippingInfo: {
        jobSite: true,
        loadingDock: true,
        location: "location",
        offloadEqptRequired: true,
        requireNotification: true,
        siteContactName: "ContactName",
        siteContactPhone: "111-2222-3333",
        unLoadAssistance: true,
        loadingDockDoorAvailable: "",
        poleLiftRequired: "",
        forkLiftRequired: "",
        largestTruckSize: "",
        jobSiteDelivery: "",
        liftGateAndPallet: "",
        strapsNeeded: "",
      },
    };

    let userId = this.userService.getUserEmail().toLowerCase();
    let cartId = localStorage.getItem("cartId");
    let payload = mockcartRequest;

    this.productService
      .addCart(payload, userId, this.cartIdNew)
      .subscribe((res: any) => {
        // this.accessoriesData = res.body;
      }),
      (err: any) => {};
  }
  get f(): { [key: string]: AbstractControl } {
    return this.reactiveForm.controls;
  }
  onSubmit(): void {
    this.submitted = true;

    if (this.reactiveForm.invalid) {
      return;
    }
    // this.openOrderSamplesModal();
  }

  onReset(): void {
    this.submitted = false;
    this.reactiveForm.reset();
  }
  validateNo(e: any) {
    const charCode = e.which ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  continueShopping(modalId?: number) {
    this.modalService.hide(modalId);
    this.router.navigateByUrl(this.sidebarPath);
  }
  checkoutPage(modalId?: number) {
    this.modalService.hide(modalId);
    this.router.navigateByUrl("residential/cart");
  }
}
