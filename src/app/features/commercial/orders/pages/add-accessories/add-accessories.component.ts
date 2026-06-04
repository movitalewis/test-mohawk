import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { Config, Columns, DefaultConfig } from "ngx-easy-table";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { StorageService } from "src/app/features/http-services/storage.service";
import { Router } from "@angular/router";
import { PostModificationProductService } from "../../../post-modification/post-modification-products/post-modification-pages/post-modification-services/post-modification-product.service"
import { UserService } from 'src/app/features/shared/user/services/user.service';
import { OrderService } from '../../services/order.service';

@Component({
    selector: 'app-add-accessories',
    templateUrl: './add-accessories.component.html',
    styleUrls: ['./add-accessories.component.scss'],
    standalone: false
})
export class AddAccessoriesComponent implements OnInit {
  modalRef?: BsModalRef;
  myForm!: FormGroup;
  enableButton: boolean = false;
  accountData: any;
  productDetails: any;
  shippingAddress: any;
  atpCheckData: any;
  solutionsValue: any;
  spinnerLoading: any = false;
  uid = "";
  accessoriesData:any;
  data:any;
  quantityDropdownData: any = [];
  public configuration!: Config;
  public columns!: Columns[];
  accessoryDetails: any = [];
  productCode:any;
  getUpdatedAccessories = (obj: any) => {};
  alertData: any = {
    message: "success",
  };
  alertType: any = "success";
  shippingInfoMessage: any;
  minicartSubscriptionForChange: any;
  shippingOptionChanged: any;
  @ViewChild("changeDeliveryType", { static: true })
  changeDeliveryType!: TemplateRef<any>;
  shipCompleteFlag!: boolean;
  constructor(
    public bsModalRef: BsModalRef,
    private storageService: StorageService,
    private fb: FormBuilder,
    private router: Router,
    private modalService: BsModalService,
    public productService: PostModificationProductService,
    private orderService: OrderService,
    public userService: UserService,
  ) {
    this.storageService.getItem("uid").subscribe((res) => {
      this.uid = res;
    });
   }

  ngOnInit(): void {
    this.userService.getCurrentUserDetail().subscribe((res: any) => {
      this.userInfo = res?.body;
    });
    this.accessoriesData = this.modalService.config.initialState;
    this.data = this.accessoriesData?.data;
    this.productCode = this.accessoriesData?.productCode
    for (let a = 1; a < 10; a++) {
      this.quantityDropdownData.push({ value: a, label: a });
    }
    this.initialFrom();
    this.getAccessoryDetails();
    this.getProductDetails();
    this.configuration = { ...DefaultConfig };
    this.configuration.checkboxes = false;
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;
    this.getShippingAddress();
  }

  modalRefs: BsModalRef[] = [];
  closeModal(modalId?: number) {
    const ids: number[] = this.modalService["loaders"].map(
      (l: any) => l.instance.id
    );
    for (const id of ids) {
      this.modalService.hide(id);
    }
  }

  getProductDetails() {
    this.storageService.getItem("item").subscribe((productDetails: any) => {
      this.productDetails = productDetails;
    });
  }

  orderDetails:any;
  getShippingAddress() {
    const url = this.router.url.split("?")[0];
    let lastIndexOfUrl = url.split("/");
    let orderCode = lastIndexOfUrl[lastIndexOfUrl.length - 1];
    this.orderService.getOrderDetails(orderCode).subscribe((res: any) => {
      this.shippingAddress = res.body?.orderHistoryData[0]?.shippingAddress;
      this.orderDetails = res.body?.orderHistoryData[0];
    });

    // this.storageService
    //   .getItem("shippingAddress")
    //   .subscribe((shippingAddress: any) => {
    //     this.shippingAddress = shippingAddress;
    //   });
  }

  setColumns() {
    if (
      this.accessoryDetails &&
      (this.accessoryDetails[0]?.key == "Floor" ||
        this.accessoryDetails[0]?.key == "Installation")
    ) {
      this.columns = [
        { key: "qty", title: "Qty", cssClass:{ name: "qty-col", includeHeader: true} },
        { key: "colorImgURL", title: "Product Image" },
        { key: "partNumber", title: "Part #" },
        { key: "styleName", title: "Description" },
        { key: "sizeName", title: "Size" },
        { key: "price", title: "Price (USD)" },
      ];
    } else if(this.accessoryDetails[0]?.key == "Trim" ){
      this.columns = [
        { key: "qty", title: "Qty", cssClass:{ name: "qty-col", includeHeader: true} },
        { key: "colorImgURL", title: "Product Image" },
        { key: "partNumber", title: "Part #" },
        { key: "styleName", title: "Description" },
        { key: "colorName", title: "Color" },
        { key: "sizeName", title: "Size" },
        { key: "unitsPerCaton", title: "Units Per Carton" },
        { key: "price", title: "Price (USD)" },
      ];
    } else {
      this.columns = [
        { key: "qty", title: "Qty", cssClass:{ name: "qty-col", includeHeader: true} },
        { key: "colorImgURL", title: "Product Image" },
        { key: "styleName", title: "Description" },
        { key: "sizeName", title: "Size" },
        { key: "density", title: "Density" },
        { key: "thickness", title: "Thickness" },
        { key: "price", title: "Price (USD)" },
      ];
    }

    if (this.accessoryDetails && this.accessoryDetails[0]?.key == "Cushion") {
      let qtyObj = { key: "qty", title: "Qty (Rolls)", cssClass:{ name: "qty-col", includeHeader: true} };
      const index = this.columns.findIndex((item) => item.key === "qty");
      this.columns.splice(index, 1, qtyObj);
    }
  }

  activeTab:any;
  getAccessoryDetails() {
    this.spinnerLoading = true;
    this.productService
      .getAllAccessories(this.productCode)
      .subscribe(
        (res: any) => {
          this.spinnerLoading = false;
          this.accessoryDetails = res?.body?.accessoryTypes || [];
          if (this.accessoryDetails.length > 0) {
            this.accessoryDetails.forEach((item: any) => {
              if (item?.value?.references.length) {
                item?.value?.references.map((ref: any) => {
                  ref._tabKey = item?.key;
                  ref.isLoading = true;
                  this.getAccessoriesPricing(ref);
                });
              }
            });
            this.activeTab=null;
            if (!this.activeTab && this.accessoryDetails.length > 0) {
              this.activeTab = this.accessoryDetails[0].key;
            }
          }
          this.setColumns();
        },
        (err: any) => {
          this.spinnerLoading = false;
          this.setColumns();
          this.modalService.hide();
        }
      );
  }
  selectedTeam = "";
  onSelected(value: string): void {
    this.selectedTeam = value;
  }

  initialFrom() {
    this.myForm = this.fb.group({
      qtyrolls: ["", Validators.required],
    });
    this.myForm.markAsUntouched();
  }

  get f() {
    return this.myForm.controls;
  }

  disableAddToCartBtn() {
    let filteredData: any = [];
    this.accessoryDetails.forEach((item: any) => {
      filteredData = [
        ...filteredData,
        ...item?.value?.references.filter((ref: any) => ref?.quantity > 0),
      ];
    });
    return filteredData.length == 0;
  }

  originalDefaultShippingMethod:any;
  addProduct(){
    // const url = this.router.url.split("?")[0];
    // let lastIndexOfUrl = url.split("/");
    // let orderCode = lastIndexOfUrl[lastIndexOfUrl.length - 1];
    this.spinnerLoading = true;
    let filteredData: any = [];
    this.accessoryDetails.forEach((item: any) => {
      filteredData = [
        ...filteredData,
        ...item?.value?.references.filter((ref: any) => ref?.quantity > 0),
      ];
    });
    const items: any = [];
    filteredData.forEach((item: any) => {
      items.push({
        productCode: item?.code,
        requestedQty: item.quantity,
        requestedUOM: (item?.rollOnly && (item?.erpProductCategory == "S" || item?._tabKey === "Cushion")) ? "RO" : item?.inventoryUOM,
        incoTerms:this.defaultIncoTerms,
        shipVia: this.defaultShipVia,
        shippingCondition:this.userInfo?.isCustomer || this.userInfo?.isSalesOps || this.userInfo?.isSalesPerson ? this.originalDefaultShippingMethod: this.defaultShippingMethod,
        shippingWarehouse:this.defaultShippingWarehouse,
        solution: [],
        lineNumber: "",
      });
    });
    let payLoad = {
      // orderCode: orderCode,
      orderCode: this.orderDetails?.orderCode,
      // shipComplete:this.orderDetails?.shipCompleteOrderFlag,
      shipComplete: this.shipCompleteFlag ? true: false,
      lineItems: items,
    };

    this.productService.addLineOrAccessories(payLoad).subscribe((res:any) => {
    

      let isError = (res?.body?.messages || []).some((d: any) => d?.status == "Error");
      let obj = {};
      if (isError) {
        this.spinnerLoading = false;
        obj = {
          msg: res?.body?.messages || [],
          status: res?.body?.messages[0]?.status
        };
      this.closeModal();
      this.getUpdatedAccessories(obj);
      }

      this.spinnerLoading = false;
        obj = {
          msg: res?.body?.messages || [],
          status: res?.body?.messages[0]?.status
        };
  
       this.closeModal();
        this.getUpdatedAccessories(obj);
   
    })
  }

  items: any = [];
  addtoOrders(val: any, code: any, uom: any, row: any) {
    const inputString = val.target.value.trim();  
    const inputValue = parseFloat(inputString); 
    if (inputString === '') {
      const existingItemIndex = this.items.findIndex((item: any) => item.productCode === code);
      if (existingItemIndex !== -1) {
        this.items.splice(existingItemIndex, 1);
      }
    } else if (!inputString.includes('.') && inputValue > 0) {
      const existingItemIndex = this.items.findIndex((item: any) => item.productCode === code);
      const newItem = {
        productCode: code,
        uom: uom,
        quantity: inputValue, 
      };
  
      if (existingItemIndex !== -1) {
        this.items[existingItemIndex] = newItem;
      } else {
        this.items.push(newItem);
      }
    } else {
      const existingItemIndex = this.items.findIndex((item: any) => item.productCode === code);
      if (existingItemIndex !== -1) {
        this.items.splice(existingItemIndex, 1);
      }
      row.quantity = null;
      
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
  @ViewChild("shippingOption", { static: true })
  shippingOption!: TemplateRef<any>;
  originalDefaultSM:any;
  openShippingOptions() {
    let filteredData: any = [];
    this.accessoryDetails.forEach((item: any) => {
      filteredData = [
        ...filteredData,
        ...item?.value?.references.filter((ref: any) => ref?.quantity > 0),
      ];
    });
    this.spinnerLoading = true;
    console.log("filteredData", this.shippingAddress);
    this.orderService.getShippingOptions(false, this.productCode,this.uid,this.userInfo.orgUnit?.soldTo).subscribe({
      next: (res) => {
        this.spinnerLoading = false;
        this.originalDefaultSM = res?.body?.originalDefaultShippingMethod;
        this.originalDefaultShippingMethod = res?.body?.originalDefaultShippingMethod;
        this.shippingAddress.originalDefaultShippingMethod = this.originalDefaultSM;
        this.defaultIncoTerms = res.body.defaultIncoTerms;
        this.defaultIncoTermsDesc = res.body.defaultIncoTermsDesc;
        this.defaultShipVia = res.body.defaultShipVia;
        this.defaultShippingMethod = res.body.defaultShippingMethod;
        this.defaultShippingWarehouse = res.body.defaultShippingWarehouse;
        this.defaultShippingWarehouseDesc =
          res.body.defaultShippingWarehouseDesc;
        this.defaultShippingConditionDesc =
          res.body.defaultShippingConditionDesc;
        this.defaultShippingMethodDesc = res.body.defaultShippingConditionDesc;
        this.modalRef = this.modalService.show(this.shippingOption, {
          id: "shippingOptionsModal",
          class: "modal-lg modal-dialog-centered",
          backdrop: "static",
          keyboard: false,
        });
      },
      error: (err) => {
        this.spinnerLoading = false;
      },
    });
    // this.openCrossModal(this.shippingOption)
  }
  closeChangeShippingOptionModal() {
    this.modalService.hide("changeShippingOptionsModal");
  }
  closeShippingOptionsModalModal() {
    // this.validateShipViaAddress()
    this.modalService.hide("shippingOptionsModal");
  }
  showValidationError: boolean = false;
  validationErrorMessage: any;
  validateShipViaAddress(type: any) {
    this.shippingOptionChanged = type;
    this.spinnerLoading = true;
    console.log(
      "this.shipViaSelectedOption",
      this.shipViaSelectedOption,
      this.incoTermsLoc2SelectedOption
    );
    let shipViaSelectedOption =
      this.shipViaSelectedOption || this.defaultShippingMethod;
    let incoTermsLoc2SelectedOption =
      this.incoTermsLoc2SelectedOption?.label ||
      this.incoTermsLoc2SelectedOption ||
      this.defaultShipVia;
    let incoTermsSelectedOption =
      this.incoTermsSelectedOption ||
      this.defaultIncoTerms;
    let shippingWareHouseSelectedOption =
      this.shippingWareHouseSelectedOption ||
      this.defaultShippingWarehouse;
    let filteredData: any = [];
    this.accessoryDetails.forEach((item: any) => {
      filteredData = [
        ...filteredData,
        ...item?.value?.references.filter((ref: any) => ref?.quantity > 0),
      ];
    });
    const items: any = [];
    filteredData.forEach((item: any) => {
      items.push({
        productCode: item?.code,
        requestedQty: item.quantity,
        requestedUOM: (item?.rollOnly && (item?.erpProductCategory == "S" || item?._tabKey === "Cushion")) ? "RO" : item?.inventoryUOM,
        incoTerms: this.defaultIncoTerms,
        shipVia: this.defaultShipVia,
        shippingCondition: this.defaultShippingMethod,
        shippingWarehouse: this.defaultShippingWarehouse,
        solution: [],
        lineNumber: "",
      });
    });
    if(!this.userInfo.isCustomer  && !this.userInfo.isSalesPerson && !this.userInfo.isSalesOps){
    this.productService
      .getUOMDetails(items[0].productCode)
      .subscribe((result) => {
        let erpProductCategory = result?.body?.erpProductCategory;
        this.orderService
          .validateShippingOptions(shippingWareHouseSelectedOption, erpProductCategory, incoTermsLoc2SelectedOption)
          .subscribe({
            next: (res) => {
              if (res.body.status === "success") {
                this.orderService
                  .validateShipVia(shipViaSelectedOption, incoTermsLoc2SelectedOption)
                  .subscribe({
                    next: (res) => {
                      if (res?.body?.status === "success") {
                        this.populateShippingOptions();
                        let defaultIncoTerms = this.orderDetails?.incoTerms;
                        let defaultShipVia = this.orderDetails?.shipVia;
                        let defaultShippingMethod =
                        this.orderDetails?.shippingConditions;
                        let defaultShippingWarehouse =
                        this.orderDetails?.shippingWarehouse;
                        if (type == "chooseSolution") {
                          this.spinnerLoading = false;
                          if (this.orderDetails?.orderCode) {
                            if (
                              defaultIncoTerms ==
                              incoTermsSelectedOption &&
                              defaultShipVia ==
                              incoTermsLoc2SelectedOption &&
                              defaultShippingMethod ==
                              shipViaSelectedOption &&
                              defaultShippingWarehouse ==
                              shippingWareHouseSelectedOption
                            ) {
                              this.spinnerLoading = false;
                              this.shipCompleteFlag = this.orderDetails?.shipCompleteOrderFlag;                             
                              this.addProduct();
                              this.closeShippingOptionsModalModal();
                            } else {
                              this.closeShippingOptionsModalModal();
                              this.shippingInfoMessage =
                                "Selected Shipping options are different from the items in your current order. Do you want to continue?";
                              // else{
                              // this.shippingInfoMessage="Saving this changes will impact your cart. Do you want to continue?"}

                              this.modalRef = this.modalService.show(
                                this.changeDeliveryType,
                                {
                                  id: "changeDeliveryType",
                                  class: "modal-lg modal-dialog-centered",
                                  backdrop: "static",
                                  keyboard: false,
                                }
                              );
                            } 
                          }
                        }
                        if (type == "changeShippingOption") {
                          this.spinnerLoading = false;
                          if (
                            defaultIncoTerms ==
                            incoTermsSelectedOption &&
                            defaultShipVia ==
                            incoTermsLoc2SelectedOption &&
                            defaultShippingMethod ==
                            shipViaSelectedOption &&
                            defaultShippingWarehouse ==
                            shippingWareHouseSelectedOption
                          ) {
                            this.spinnerLoading = false;
                            this.shipCompleteFlag = this.orderDetails?.shipCompleteOrderFlag;
                            this.shippingOptionModalSubmit();
                          } else {
                            if (this.orderDetails?.shipCompleteOrderFlag) {
                              this.shippingInfoMessage =
                                "Saving this changes will change " +
                                "Ship Complete order" +
                                " to " +
                                "Ship Order Based on Availability" +
                                " in your current order. Do you want to continue?";
                              // else{
                              // this.shippingInfoMessage="Saving this changes will impact your cart. Do you want to continue?"}

                              this.modalRef = this.modalService.show(
                                this.changeDeliveryType,
                                {
                                  id: "changeDeliveryType",
                                  class:
                                    "modal-lg modal-dialog-centered",
                                  backdrop: "static",
                                  keyboard: false,
                                }
                              );
                            } else {
                              this.submitInfoChanges();
                            }
                          }
                        }
                        // console.log("res---->", res);
                        // this.showValidationError=false;
                        // this.closeModal()
                        // this.();
                        // this.closeChangeShippingOptionModal()
                      } else if (res.body.status === "error") {
                        this.showValidationError = true;
                        this.validationErrorMessage = res.body.message;
                        // this.openModalError(res.body.message);
                        // Handle error
                      }
                    },
                    error: (err) => { },
                  });
              } else if (res.body.status === "error") {
                this.showValidationError = true;
                this.validationErrorMessage = res.body.message;
                // this.openModalError(res.body.message);
                // Handle error
              }
            },
            error: (err) => { },
          });
      });
    }else{
      this.populateShippingOptions();
      let defaultIncoTerms = this.orderDetails?.incoTerms;
      let defaultShipVia = this.orderDetails?.shipVia;
      let defaultShippingMethod =
      this.orderDetails?.shippingConditions;
      let defaultShippingWarehouse =
      this.orderDetails?.shippingWarehouse;
      if (type == "chooseSolution") {
        this.spinnerLoading = false;
        if (this.orderDetails?.orderCode) {
          if (
            defaultIncoTerms ==
            incoTermsSelectedOption &&
            defaultShipVia ==
            incoTermsLoc2SelectedOption &&
            defaultShippingMethod ==
            shipViaSelectedOption &&
            defaultShippingWarehouse ==
            shippingWareHouseSelectedOption
          ) {
            this.spinnerLoading = false;
            this.shipCompleteFlag = this.orderDetails?.shipCompleteOrderFlag;                             
            this.addProduct();
            this.closeShippingOptionsModalModal();
          } else {
            this.closeShippingOptionsModalModal();
            this.shippingInfoMessage =
              "Selected Shipping options are different from the items in your current order. Do you want to continue?";
            // else{
            // this.shippingInfoMessage="Saving this changes will impact your cart. Do you want to continue?"}

            this.modalRef = this.modalService.show(
              this.changeDeliveryType,
              {
                id: "changeDeliveryType",
                class: "modal-lg modal-dialog-centered",
                backdrop: "static",
                keyboard: false,
              }
            );
          } 
        }
      }
      if (type == "changeShippingOption") {
        this.spinnerLoading = false;
        if (
          defaultIncoTerms ==
          incoTermsSelectedOption &&
          defaultShipVia ==
          incoTermsLoc2SelectedOption &&
          defaultShippingMethod ==
          shipViaSelectedOption &&
          defaultShippingWarehouse ==
          shippingWareHouseSelectedOption
        ) {
          this.spinnerLoading = false;
          this.shipCompleteFlag = this.orderDetails?.shipCompleteOrderFlag;
          this.shippingOptionModalSubmit();
        } else {
          if (this.orderDetails?.shipCompleteOrderFlag) {
            this.shippingInfoMessage =
              "Saving this changes will change " +
              "Ship Complete order" +
              " to " +
              "Ship Order Based on Availability" +
              " in your current order. Do you want to continue?";
            // else{
            // this.shippingInfoMessage="Saving this changes will impact your cart. Do you want to continue?"}

            this.modalRef = this.modalService.show(
              this.changeDeliveryType,
              {
                id: "changeDeliveryType",
                class:
                  "modal-lg modal-dialog-centered",
                backdrop: "static",
                keyboard: false,
              }
            );
          } else {
            this.submitInfoChanges();
          }
        }
      }
    }
  }
  validateShipVia(event: any) {
    console.log(event);
    this.showValidationError = false;
  }
  shippingOptionModalSubmit() {
    // this.shipViaModalSubmit();
    // this.shippingWareHouseModalSubmit();
    this.closeChangeShippingOptionModal();
    // this.modalService.hide("shippingOptionModal");
  }
  shippingWareHouseSelectedOption: any = "";
  incoTermsLoc2SelectedOption: any = "";
  incoTermsLoc2Options: any = [];

  shipViaSelectedOption: any = "";
  incoTermsSelectedOption: any = "";
  incoTermsOptions: any = [];
  shipViaOptions: any = [];
  shipViaType: string = "";
  shippingWareHouseOptions: any = [];
  shippingWareHouseType: string = "";
  
  populateShippingOptions() {
    let shipViaSelectedOption =
      this.shipViaSelectedOption ||
      this.defaultShippingMethod ||
      this.shippingAddress?.defaultShippingMethod ||
      this.shippingAddress?.defaultShippingCondition;
    let incoTermsLoc2SelectedOption =
      this.incoTermsLoc2SelectedOption?.label ||
      this.incoTermsLoc2SelectedOption ||
      this.defaultShipVia;
    this.shippingAddress?.defaultShipVia;
    let incoTermsSelectedOption =
      this.incoTermsSelectedOption ||
      this.defaultIncoTerms ||
      this.shippingAddress?.defaultIncoTerms;
    let shippingWareHouseSelectedOption =
      this.shippingWareHouseSelectedOption || this.defaultShippingWarehouse;
    this.shippingAddress?.defaultShippingWarehouse;

    const shipViaSelectedOptionValue = this.shipViaOptions.find(
      (item: any) => item.value === shipViaSelectedOption
    );
    this.defaultShippingMethod =
      shipViaSelectedOption ||
      this.defaultShippingMethod ||
      this.shippingAddress?.defaultShippingMethod ||
      this.shippingAddress?.defaultShippingCondition;
    this.defaultShippingConditionDesc =
      shipViaSelectedOptionValue?.label ||
      this.defaultShippingConditionDesc ||
      this.shippingAddress?.defaultShippingConditionDesc;
    this.defaultShippingMethodDesc =
      shipViaSelectedOptionValue?.label ||
      this.defaultShippingMethodDesc ||
      this.shippingAddress?.defaultShippingConditionDesc;
    let incoTermSelectedOptionValue = this.incoTermsOptions.find(
      (item: any) => item.value === incoTermsSelectedOption
    );
    this.defaultIncoTermsDesc =
      incoTermSelectedOptionValue?.label ||
      this.defaultIncoTermsDesc ||
      this.shippingAddress?.defaultIncoTermsDesc;
    this.defaultIncoTerms = incoTermsSelectedOption || this.defaultIncoTerms;
    if (
      incoTermSelectedOptionValue === undefined ||
      incoTermSelectedOptionValue === null
    ) {
      incoTermSelectedOptionValue = this.incoTermsOptions.find(
        (item: any) => item.label === incoTermsSelectedOption
      );
      this.defaultIncoTermsDesc =
        incoTermSelectedOptionValue?.label ||
        this.defaultIncoTermsDesc ||
        this.shippingAddress?.defaultIncoTermsDesc;
      this.defaultIncoTerms =
        incoTermSelectedOptionValue?.value ||
        incoTermsSelectedOption ||
        this.defaultIncoTerms;
    }

    const shippingWHSelectedOptionValue = this.shippingWareHouseOptions.find(
      (item: any) => item.value === shippingWareHouseSelectedOption
    );
    this.defaultShippingWarehouseDesc =
      shippingWHSelectedOptionValue?.label ||
      this.defaultShippingWarehouseDesc ||
      this.shippingAddress?.defaultShippingWarehouseDesc;
    this.defaultShippingWarehouse =
      shippingWareHouseSelectedOption || this.defaultShippingWarehouse;

    this.defaultShipVia = incoTermsLoc2SelectedOption || this.defaultShipVia;
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

  changeShippingWareHouseOptions(event: any) {
    this.shippingWareHouseSelectedOption = event;
    this.getIncoTermsLoc2(event);
  }

  changeshipViaOptions(event: any) {
    
    if (this.userInfo.isCustomer || this.userInfo.isSalesPerson || this.userInfo.isSalesOps) {
      this.spinnerLoading = false;

      this.shippingWareHouseOptions = [];
      this.shippingWareHouseOptions.push({
        value: this.shippingAddress?.defaultShippingWarehouse || this.orderDetails?.shippingWarehouse,
        label: this.shippingAddress?.defaultShippingWarehouseDesc || this.orderDetails?.shippingWarehouseDesc,
      });
      this.shippingWareHouseSelectedOption = this.shippingWareHouseOptions[0].value;

      this.orderService
        .getShippingoptionForCustomers(
          this.shippingAddress.postalCode,
          this.shipViaSelectedOption,
          this.shippingWareHouseSelectedOption,
          this.orderDetails.oneTimeShipTo === undefined? false: this.orderDetails.oneTimeShipTo,
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
                this.shippingWareHouseOptions = [];
                this.shippingWareHouseOptions.push({
                  value: res.body?.shippingWarehouse ||   this.shippingAddress?.defaultShippingWarehouse || this.orderDetails?.shippingWarehouse,
                  label: res?.body?.shippingWarehouseDesc || this.shippingAddress?.defaultShippingWarehouseDesc || this.orderDetails?.shippingWarehouseDesc,
                });
                this.shippingWareHouseSelectedOption = this.shippingWareHouseOptions[0].value

                this.incoTermsLoc2Options =[];
                this.incoTermsLoc2Options.push({
                  value:res.body.shipvia,
                  label:res.body.shipvia
                })
                 this.originalDefaultSM = res.body?.originalDefaultShippingMethod;
                 this.originalDefaultShippingMethod = res.body?.originalDefaultShippingMethod;
                this.shippingAddress?.originalDefaultShippingMethod - this.originalDefaultShippingMethod;
                this.incoTermsSelectedOption = this.incoTermsOptions[0]?.value;
                this.incoTermsLoc2SelectedOption = res.body.shipvia;

            }
            else{
                  this.spinnerLoading = false;
                  this.showValidationError = true;
                   this.validationErrorMessage = "Shipping Options are not available for customer"
                   this.shippingInfoMessage = "Shipping Options are not available for customer";
                   this.incoTermsLoc2SelectedOption = "";
                   this.incoTermsSelectedOption = "";
                    // this.addtoCartErrorMessage = [
                    //     ...[],
                    //     ...[{ message: this.validationErrorMessage }],
                    // ];
                    setTimeout(() => {
                        this.shippingInfoMessage = "";
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
              label: resObject[key].shipvia,
              preferred: resObject[key].preferred
            });
          });
        },
        error: (err) => {},
      });
  }
  userInfo: any;

  shippingOptionsModal(template: TemplateRef<any>) {
       this.spinnerLoading = true;
       this.shippingWareHouseOptions = [];
   
       this.shippingWareHouseSelectedOption = this.defaultShippingWarehouse ||
         this.shippingAddress?.defaultShippingWarehouse || "";
       this.shipViaOptions = [];
       this.shipViaSelectedOption = this.defaultShippingMethod || 
          this.shippingAddress?.defaultShippingMethod ||
           this.shipViaOptions[0]?.value;
       this.productService.getShippingMethodWithOutFlag(
         this.shippingAddress.postalCode,
         this.shippingAddress?.oneTimeShippingAddress || this.orderDetails?.oneTimeShipTo 
         ? true
         : false,
         this.userInfo.isCustomer || this.userInfo.isSalesPerson || this.userInfo?.isSalesOps,
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
         this.shippingWareHouseOptions = [];
         this.shippingWareHouseOptions.push({
           value:   this.defaultShippingWarehouse || this.orderDetails?.shippingWarehouse,
           label:  this.defaultShippingWarehouseDesc || this.orderDetails?.shippingWarehouseDesc,
         });
         this.shippingWareHouseSelectedOption = this.shippingWareHouseOptions[0].value
         if (this.userInfo.isCustomer || this.userInfo.isSalesPerson || this.userInfo?.isSalesOps) {
           this.spinnerLoading = false;
           this.shipViaSelectedOption = this.defaultShippingMethod || 
             this.shippingAddress?.defaultShippingMethod ||
             this.shipViaOptions[0]?.value;
          
          
           this.orderService
             .getShippingoptionForCustomers(
               this.shippingAddress.postalCode,
               this.shipViaSelectedOption,
               this.shippingWareHouseSelectedOption,
               this.orderDetails.oneTimeShipTo == undefined? false:this.orderDetails.oneTimeShipTo,
               this.uid
             )
             .subscribe({
               next: (res) => {
                 this.spinnerLoading = false;
                 this.originalDefaultSM = res.body?.originalDefaultShippingMethod;
   
                 this.shippingWareHouseOptions = [];
                 this.shippingWareHouseOptions.push({
                   value: res.body?.shippingWarehouse ||   this.defaultShippingWarehouse || this.orderDetails?.shippingWarehouse,
                   label: res?.body?.shippingWarehouseDesc ||  this.defaultShippingWarehouseDesc || this.orderDetails?.shippingWarehouseDesc,
                 });
                 this.shippingWareHouseSelectedOption = this.shippingWareHouseOptions[0].value
   
   
                 this.incoTermsOptions = [];
                 this.incoTermsOptions.push({
                   value: res.body.incoTerms,
                   label: res.body.incoTermsDesc,
                 });
   
                 this.incoTermsLoc2Options = [];
                 this.incoTermsOptions.push({
                   value: res.body.shipvia,
                   label: res.body.shipvia,
                 });
                 this.incoTermsSelectedOption =  this.incoTermsOptions[0].value;
                 this.incoTermsLoc2SelectedOption = res.body.shipvia;
               },
               error: (err) => {
                 this.spinnerLoading = false;
               },
             });
         }
         if (!this.userInfo.isCustomer && !this.userInfo.isSalesPerson && !this.userInfo.isSalesOps) {
           this.spinnerLoading = false;
           this.shipViaSelectedOption = this.defaultShippingMethod || 
             this.shippingAddress?.defaultShippingMethod ||
             this.shipViaOptions[0]?.value;
   
           this.getIncoTerms(this.shipViaSelectedOption);
           this.incoTermsSelectedOption = this.defaultIncoTerms ||
             this.shippingAddress?.defaultIncoTerms ||
             this.incoTermsOptions[0]?.value;
   
           this.productService.getShippingWareHouseWithOutFlag().subscribe(
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
   
               this.incoTermsLoc2SelectedOption = this.defaultShipVia || 
                 this.shippingAddress?.defaultShipVia;
               this.getIncoTermsLoc2(this.shippingWareHouseSelectedOption);
               this.incoTermsSelectedOption = this.defaultIncoTerms ||
                 this.shippingAddress?.defaultIncoTerms ||
                 this.incoTermsOptions[0]?.value;
             }
           );
         }
         this.modalRef = this.modalService.show(template, {
           id: "changeShippingOptionsModal",
           class: "modal-lg modal-dialog-centered",
           backdrop: "static",
           keyboard: false,
         });
       });
     }
  changeincoTermsOptions(event: any) {
    this.incoTermsSelectedOption = event;
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
  getIncoTermsLoc2(shippingWareHouse: any) {
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
        postalCode,
        shippingWareHouse,
        selectedShippingMethod?.value
      )
      .subscribe({
        next: (res) => {
          const resObject = res?.body;
          const objectKeys = Object.keys(resObject).sort();
          objectKeys.forEach((key) => {
            this.incoTermsLoc2Options.push({
              value: resObject[key].shipvia,
              label: resObject[key].shipvia,
              preferred: resObject[key].preferred
            });
          });
          // if (this.incoTermsLoc2Options.length === 0) {
          //   this.incoTermsLoc2Options.push({
          //     value: this.shippingAddress?.defaultShipVia,
          //     label: this.shippingAddress?.defaultShipVia,
          //   });
          // }
        },
        error: (err) => {},
      });
  }

  getAccessoriesPricing(item: any) {
    const payLoad = {
      collection: "",
      promoFlg: "0",
      sortBy: "",
      orderOfSort: "",
      isDownloadable: false,
      futurePrice: false,
      currentPage: "",
      recordsPerPage: "",
      startRow: "",
      endRow: "",
      styleDetails: [
        {
          styleNumber: item?.style,
          productCategory: "",
          sizeCode: item?.size,
          backingCode: item?.sellingBackingId,
          sellingGroup: "",
          styleName: item?.styleName,
          code: item?.code,
          colorNumber: item?.color,
        },
      ],
    };
    return this.productService
      .getAccessoriesPricing(payLoad)
      .subscribe((resp: any) => {
        item.isLoading = false;
        item.price = resp?.body?.result?.length
          ? resp?.body?.result[0]?.priceEach
          : "NA";
      },()=>{item.isLoading = false;});
  }
  
  submitInfoChanges() {
    //this.modalService.hide("changeDeliveryType");
    this.closeChangeShippingOptionModal();
    this.validateShipViaAddress("chooseSolution");
  }
  
  closeInfoChanges() {
    this.modalService.hide("changeDeliveryType");
    this.closeChangeShippingOptionModal();
  }
  
  continueChanges() {
    if (this.shippingOptionChanged == "chooseSolution") {
      this.modalService.hide("changeDeliveryType");
      this.closeShippingOptionsModalModal();
      this.shipCompleteFlag = false;
      this.addProduct();
      // this.validateShipViaAddress("chooseSolution");
      // this.onShippingOptionSubmit();
    }
    if (this.shippingOptionChanged == "changeShippingOption") {
      this.modalService.hide("changeDeliveryType");
      this.submitInfoChanges();
    }
  }

}
