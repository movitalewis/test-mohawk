import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import {
  debounceTime,
  distinctUntilChanged,
  Subject,
  Subscription,
  switchMap,
  take,
} from 'rxjs';
import { ProductService } from '../../../products/pages/services/product.service'; 
import { PdpPfxPriceFields } from "src/app/features/shared/constants/menu/residential.config";
import { StorageService } from 'src/app/features/http-services/storage.service';

@Component({
    selector: 'residential-add-new-line',
    templateUrl: './add-new-line.component.html',
    styleUrls: ['./add-new-line.component.scss'],
    standalone: false
})
export class AddNewLineComponent implements OnInit {
  sellingStyleUpdate = new Subject<any>();
  productStyleList: any = [];
  @Output() addLineFormEventEmitter = new EventEmitter<any>();
  form!: FormGroup;
  pdpPfxPriceFields = { ...PdpPfxPriceFields };

  constructor(private formBuilder: FormBuilder, 
    private productService: ProductService,
    public storageService: StorageService,) {
    
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
    orderNewLineForm: this.formBuilder.array([]),
  });
  this.addOrderLineForm();
    this.sellingStyleUpdate
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((data: any) => {
        (data?.event?.term || "").length > 2 && this.fetchProductStyle$(data?.event?.term).subscribe(
          (res:any) => {
            this.productStyleList = res?.products || [];
            this.productStyleList = (this.productStyleList || []).map((item: any, index: any) => {
              const isDuplicate = this.productStyleList.some((element: any, ind: any) => {
                return (element.styleNumber === item.styleNumber && element.styleName === item.styleName) && ind !== index
              });
              return {
                ...item,
                isDuplicate
              }
            });
          }
        );
      });
  }

  get orderNewLineForm(): FormArray {
    return this.form.get("orderNewLineForm") as FormArray;
  }

  addOrderLineForm() {
    const addLineForm = this.formBuilder.group({
      styleName: ["", [Validators.required]],
      colorId: [{ value: "", disabled: true }, [Validators.required]],
      size: [{ value: "", disabled: true }, [Validators.required]],
      backing: [{ value: "", disabled: true }, [Validators.required]],
      uom: [{ value: "", disabled: true }, [Validators.required]],
      qty: [{ value: "", disabled: true }, [Validators.required, Validators.min(1)]],
      inches: [""],
      requestedPrice: [{ value: "", disabled: true }, [Validators.min(1)]],
      priceComment: [{ value: "", disabled: true }],
    });
    this.orderNewLineForm.push(addLineForm);
  }

  onReqPriceChange(event: Event, index: number) {
    const requestedPriceControl = this.orderNewLineForm.at(index).get('requestedPrice');
    const priceCommentControl = this.orderNewLineForm.at(index).get('priceComment');
    if (requestedPriceControl && priceCommentControl) {
      if (requestedPriceControl.value) {
        priceCommentControl.setValidators(Validators.required);
        priceCommentControl.enable();
      } else {
        priceCommentControl.clearValidators();
        priceCommentControl.setValue('');
      }
      priceCommentControl.updateValueAndValidity();
    }
  }

  deleteOrderLineForm(index: number) {
    this.orderNewLineForm.removeAt(index);
  }

  resetForm(){
    this.orderNewLineForm.controls[0].patchValue({
      uom: '',
      qty: '',
      inches: '',
      requestedPrice: '',
      priceComment: '',
    });
    this.orderNewLineForm.controls[0].get("priceComment")?.clearValidators();
    this.orderNewLineForm.controls[0].get("priceComment")?.updateValueAndValidity();
  }

  clearAddNewLineForm() {
    this.orderNewLineForm.clear();
  }

  addOrderLine(){
    if (this.form.value.orderNewLineForm?.[0]) {
      let productLinePrice = {
        productPrice1: this.productType === "SOFTSURFACE" ? this.productPriceDetails?.rollPriceSY : 
                        this.productPriceDetails?.cartonPriceSF,
        productPrice2: this.productType === "SOFTSURFACE" ? this.productPriceDetails?.cutPriceSY : 
                        this.productPriceDetails?.palletPriceSF
      };
      const orderLine = this.form.value.orderNewLineForm[0];
      if(orderLine?.uom == 'LF'){
        const inches = orderLine?.inches != "" ? orderLine?.inches.length < 2 ? ".0" + orderLine?.inches?.trim()
                       : "." + orderLine?.inches?.trim() : "";
        orderLine.qty = orderLine?.qty + inches;
      }
      const orderLineData = { ...this.form.value.orderNewLineForm[0], ...this.variantData?.selected, ...productLinePrice };
      this.addLineFormEventEmitter.emit(orderLineData);
    }
    
    for (let key in this.orderNewLineForm.controls) {
      this.orderNewLineForm.controls[key].disable();
      this.orderNewLineForm.controls[key].get("styleName")?.enable();
      this.orderNewLineForm.controls[key].get("priceComment")?.clearValidators();
      this.orderNewLineForm.controls[key].get("priceComment")?.updateValueAndValidity();
    }

    this.orderNewLineForm.reset();
    this.productStyleList = [];
    this.productColorVariantData = [];
    this.variantData = [];
    this.pdbData = '';
    this.sellingStyle = undefined;
  }

  sellingStyle: any = undefined;
  pdbData:any;
  selectedProduct:any;
  productCode:any;
  variantData: any;
  productColorVariantData:any;
  subProductType:any;
  isAtpCheck: boolean = true;
  uomDetails:any;
  erpProductCategory: any = '';
  selectedColor:any;
  selectedSize:any;
  selectedBacking:any;
  unitArray: any = [];
  productType:any;
  fetchProductStyle$(styleName: string) {
    return this.productService.searchProducts(styleName);
  }
  handleStyleChange(event: any) {
    this.sellingStyle = event || '';
    if (event) {
      this.fetchSKU$(event.firstVariantCode).subscribe((res:any) => {
        
        if (res) {
          this.pdbData = res?.body;
          this.productType = this.pdbData.productType;
          this.selectedProduct = { ...this.selectedProduct, ...this.pdbData };
          this.getUOMDetails();
        }
        this.getProductPriceDetails(event.firstVariantCode);
        this.getProductVariantMatrix();
        this.resetForm();
      });
      
      for (let key in this.orderNewLineForm.controls) {
        this.orderNewLineForm.controls[key].enable();
      }
    }
  }

  isPriceLoading:boolean = false;
  productPriceDetails:any;
  pdpPricingUOMValue:any;
  getProductPriceDetails(productCode: any) {
    this.isPriceLoading = true;
    if(this.productType === "MERCHANDISING"){
      this.productService.getMerchandisingPriceDetails(productCode).subscribe(
        (res: any) => {
          this.isPriceLoading = false;
          this.productPriceDetails = res.body;
        },
        (err: any) => {
          this.isPriceLoading = false;
          this.productPriceDetails = {};
        }
      );
    }else{
    this.productService.getProductPriceDetails(productCode).subscribe(
      (res: any) => {
        this.isPriceLoading = false;
        this.productPriceDetails = res?.body;
      },
      (err: any) => {
        this.isPriceLoading = false;
      }
    );
  }
  }

  getProductVariantMatrix() {
    this.productService.getPdpVariantRecords(this.productCode).subscribe(
      (res) => {
        
        if (res) {
          this.variantData = res?.body;
          if(this.variantData?.productColorVariantOptions){
            this.productColorVariantData = this.variantData?.productColorVariantOptions.sort(function (a:any, b:any) {
              return a.value.name.localeCompare(b.value.name);
            });
          }
          
        }
      },
      (err: any) => {
        
      }
    );
  }

  handleCustomStyleSearch(term: string, item: any) {
    return true;
  }

  fetchSKU$(styleCode: string) {
    this.productCode = styleCode;
    return  this.productService.getPdpRecords(styleCode, false)
  }

  getUOMDetails() {
    this.productService.getUOMDetails(this.productCode).subscribe(
      (res) => {
        this.erpProductCategory = res?.body?.erpProductCategory;
        if (
          (this.subProductType == "RESILIENT_VINYL" || this.subProductType == "PAD_CUSHION") &&
          res?.body?.erpProductCategory == "S"
        ) {
          this.isAtpCheck = false;
        }
        this.uomDetails = res?.body;
        this.pdpPricingUOMValue = res?.body?.pricingUom.name;
        this.unitArray = [];
        if (res?.body?.alternateUomData) {
          if(this.uomDetails?.rollOnly != 'true'){
            this.unitArray = res?.body?.alternateUomData.map((element: any) => {
              return {
                type: element?.alternateUom.code,
                value: element?.alternateUom.name,
                alternateUomConversionUnit: element?.alternateUomConversionUnit,
              };
            });
          }
          if(this.uomDetails?.rollOnly == 'true' || this.erpProductCategory === 'B'){
            this.unitArray.push({
              type: 'RO',
              value: "Roll(s)",
              alternateUomConversionUnit: ""
            })
          }
        } else {
          this.getCorrectProducType(
            this.pdbData.productType,
            this.pdbData.subProductType
          );
        }
      },
      (err: any) => {
       
      }
    );
  }

  getCorrectProducType(productType: string, subProductType: string) {
    if (productType === "CARPET") {
      if (subProductType === "CARPETPRODUCT_CARPET_TILE") {
        this.unitArray = [
          {
            type: "Carton(s)",
            value: "CAR",
          },
          {
            type: "Box",
            value: "BOX",
          },
        ];
      } else {
        this.unitArray = [
          {
            type: "LF",
            value: "LF",
          },
          {
            type: "Sq.Yds",
            value: "YD2",
          },
          {
            type: "Sq.Ft",
            value: "FT2",
          },
        ];
      }
    } else if (productType === "Cushion") {
      this.unitArray = [
        {
          type: "Sq.Yds",
          value: "YD2",
        },
      ];
    } else if (
      productType === "RESILIENT_VINYL" ||
      subProductType === "RESILIENT_VINYL"
    ) {
      this.unitArray = [
        {
          type: "Carton(s)",
          value: "CAR",
        },
        {
          type: "Sq.Yds",
          value: "YD2",
        },
        {
          type: "SqFeet",
          value: "FT2",
        },
      ];
    } else if (productType == "WOOD") {
      this.unitArray = [
        {
          type: "Carton(s)",
          value: "CAR",
        },
        {
          type: "Box",
          value: "BOX",
        },
      ];
    } else {
      this.unitArray = [];
    }
  }

  numberOnly(event: any, type: any = ""): boolean {
    const value = event?.currentTarget?.value;
    if (type === "inch" && parseInt(value + event.key) > 11) {
      return false;
    }
    const charCode = event.which ? event.which : event.keyCode;
    if (type === "YDK" || type === "FTK" || type == "rolls") {
      if (event?.key == "." && value.includes(".")) {
        return false;
      }
      return this.isDecimalNumberKey(event);
    } else if (type === "ZCT") {
      if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
      }
      if (event?.key === ".") {
        return false;
      }
      return true;
    } else {
      if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
      }
      return true;
    }
  }

  isDecimalNumberKey(event: any) {
    const value = event?.currentTarget?.value;

    var charCode = event.which ? event.which : event.keyCode;
    if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57))
      return false;
    if (value.includes(".")) {
      let val = value.split(".");
      val = val[val.length - 1].split("");
      if (val.length > 1) {
        return false;
      }
    }
    return true;
  }

  numberAndDcecimalvaluesOnly(event: any): boolean {
    const value = event?.currentTarget?.value;
    const charCode = event.which ? event.which : event.keyCode;

    if (event?.key == "." && value.includes(event?.key)) {
      return false;
    }

    if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    let str = "";

    if (
      event.target.selectionStart == null ||
      event.target.selectionEnd == null
    ) {
      str = event.target.value + event.key;
    } else {
      str =
        event.target.value.slice(0, event.target.selectionStart) +
        event.key +
        event.target.value.slice(
          event.target.selectionEnd,
          event.target.value.length
        );
    }
    if (str.includes(".")) {
      let val = str.split(".");
      val = val[val.length - 1].split("");
      if (val.length > 2) {
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  }

  keyPressNumbers(e: any) {
    let inchesValue = e.currentTarget?.value ? e.currentTarget.value : 0;
    const currentValue = Number(inchesValue + e.key);
    const isTwoDigits = /^\d{0,2}$/.test(currentValue.toString());
    const isWithinRange = currentValue >= 0 && currentValue <= 11;
    
    if (e?.key == ".") {
      return false;
    }
    
    if (isTwoDigits && isWithinRange) {
      return true;
    } else {
      e.preventDefault();
      return false;
    }
  }

  restrictUptoTwoDecimal(e: any) {
    var t = e.target.value;
    e.target.value =
      t.indexOf('.') >= 0
        ? t.substr(0, t.indexOf('.')) + t.substr(t.indexOf('.'), 3)
        : t;
    if ((e.target.value + '')[0] === '0') {
      e.target.value = '';
    }
  }

  onColorChange(event: any){
    if(event){  
      this.handleStyleChange({firstVariantCode: event});
    }
  }

  onSizeChange(event: any){
    this.selectedSize = event ? event : undefined;
    let productCode = this.variantData?.sizeOptions.filter(function (item: any) {
      if (item.key == event) {
        return item.value.code;
      }
    });
    if (productCode.length > 0) {  
      this.handleStyleChange({firstVariantCode: productCode[0].value.code});
    }
  }

  onBackingChange(event: any){
    if(event){
      let backingObj = this.variantData?.backingOptions.filter(
        (item: any) => item.value?.code === event
      );
      this.selectedBacking = backingObj && backingObj[0];
      this.handleStyleChange({firstVariantCode: event});
    }else{
      this.selectedBacking = {}
    }
   }

   getUOMDesc(key: string): string {
    switch (key) {
      case 'YDK': return 'Square Yard';
      case 'FTK': return 'Square foot';
      case 'EA': return 'Each';
      case 'PAL': return 'Pal';
      case 'PF': return 'PF';
      case 'LF': return 'Linear FT';
      case 'ZCT': return 'Carton';
      case 'RO': return 'Roll';
      default: return key;
    }
  }

}
