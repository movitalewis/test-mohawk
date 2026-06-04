import { Component, Input, OnInit, TemplateRef } from "@angular/core";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { Config, Columns, DefaultConfig } from "ngx-easy-table";
import { PlpOrderSamplesComponent } from "../plp-order-samples/plp-order-samples.component";
import { PlpSavedAddressComponent } from "../plp-saved-address/plp-saved-address.component";
import { ProductAddressService } from "../services/product-address.service";
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { StorageService } from "src/app/features/http-services/storage.service";
import { UserService } from "src/app/features/shared/user/services/user.service";
@Component({
    selector: "commercial-plp-shipping-address",
    templateUrl: "./plp-shipping-address.component.html",
    styleUrls: ["./plp-shipping-address.component.scss"],
    standalone: false
})
export class PlpShippingAddressComponent implements OnInit {
  reactiveForm!: FormGroup;
  submitted = false;
  isCollapsed = true;
  isCollapsed1 = true;
  isCollapsed2 = true;
  checkboxes = true;
  checkboxes1 = true;
  checkboxes2 = true;
  baseSiteId: string = "";
  cartId: string = "";
  userId: string = "";
  modalRef?: BsModalRef;
  productColorVariantOptions?: any;
  @Input() cartIdNew: any;

  constructor(
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private defaultAddress: ProductAddressService,
    private formBuilder: FormBuilder,
    private storage: StorageService,
    private userService: UserService
  ) {}

  shippingAddressModal(template1: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template1, {
      id: 1,
      class: "modal-lg modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }

  public configuration!: Config;
  public columns!: Columns[];

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

  ngOnInit(): void {
    this.reactiveForm = this.formBuilder.group({
      name: ["", Validators.required],
      streetAddress: ["", Validators.required],
      city: ["", Validators.required],
      streetAddress2: [""],
      state: ["", Validators.required],
      zipCode: ["", Validators.required],
      phone: ["", Validators.required],
    });
    this.getShippingAddress();
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
  }
  changeTab(type: any) {
    if (type == 1) {
      this.isOneTimeShippingAddress = false;
    } else {
      this.isOneTimeShippingAddress = true;
    }
  }
  isOneTimeShippingAddress = false;

  openOrderSamplesModal() {
    let shippingAddress = {
      data: this.isOneTimeShippingAddress
        ? this.reactiveForm.value
        : this.shippingAddress,
      isOneTimeShippingAddress: this.isOneTimeShippingAddress,
    };
    this.storage.setItem("shippingAddress", shippingAddress);
    const data: any = this.modalService.config.initialState;
    const initialState: ModalOptions = {
      initialState: {
        productColorVariantOptions: this.productColorVariantOptions,
        varients: data?.varients,
        selectedVarient: data?.selectedVarient,
      },
    };
    this.bsModalRef = this.modalService.show(
      PlpOrderSamplesComponent,
      Object.assign(initialState, {
        id: "plpordersample",
        class: "modal-xl modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
    this.bsModalRef.content.cartIdNew = this.cartIdNew;
    this.bsModalRef.content.messageEvent?.subscribe((data: any) => {
      this.shippingAddress = data;
    });
  }

  openSavedAddressModal() {
    const initialState: ModalOptions = {
      initialState: {},
    };
    this.bsModalRef = this.modalService.show(
      PlpSavedAddressComponent,
      Object.assign(initialState, {
        id: "plpsaves",
        class: "modal-lg modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
    this.bsModalRef.content.messageEvent.subscribe((data: any) => {
      this.shippingAddress = data;
    });
  }

  onHideModal() {
    this.modalService.hide("PlpShippingAddressComponentcommercial");
    this.modalService.hide("PlpShippingAddressComponent");
    this.modalService.hide("plpshippers");
    this.modalService.hide("PlpOrderSamplesComponent");
  }
  shippingAddress: any;
  getShippingAddress() {
    this.defaultAddress
      .getDefaultShippingAddress(this.userService.getUserEmail().toLowerCase())
      .subscribe((res) => {
        this.shippingAddress = res.body;
      });
  }
  get f(): { [key: string]: AbstractControl } {
    return this.reactiveForm.controls;
  }
  onSubmit(): void {
    this.submitted = true;

    if (this.reactiveForm.invalid) {
      return;
    }
    this.openOrderSamplesModal();
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
}
