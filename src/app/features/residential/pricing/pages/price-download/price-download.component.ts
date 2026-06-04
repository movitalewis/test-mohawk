import { formatDate } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { BsModalService, BsModalRef, ModalOptions } from "ngx-bootstrap/modal";
import { StorageService } from "src/app/features/http-services/storage.service";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import { header } from "../price-search/price-search.constants";
import { Workbook } from "exceljs";
import autoTable from "jspdf-autotable";
import { ProductService } from "../../../products/pages/services/product.service";
import { API_CONSTANTS } from "src/app/features/shared/constants/API-CONSTANTS";
import { ApiService } from "src/app/features/http-services/api.service";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { ProductAddressService } from "../../../products/components/services/product-address.service";
import { ChangeShippingAddressComponent } from "../../../products/components/change-shipping-address/change-shipping-address.component";
import { forkJoin } from "rxjs";
import { MESSAGE_CONSTANTS } from "src/app/features/shared/constants/MESSAGE-CONSTANTS";
import { ProgressModalComponent } from "src/app/features/shared/components/progress-modal/progress-modal.component";
import { branndThumbUrl } from "src/app/features/shared/constants/brand-logo";
@Component({
    selector: "app-price-download",
    templateUrl: "./price-download.component.html",
    styleUrls: ["./price-download.component.scss"],
    standalone: false
})
export class PriceDownloadComponent implements OnInit {
  breadcrumbItems: BreadcrumbItems = [
    {
      name: "Home",
      path: "/residential",
      active: false,
    },
    {
      name: "Pricing",
      path: "/residential",
      active: false,
    },
    {
      name: "Price Download",
      path: "/",
      active: true,
    },
  ];
  public spinnerLoading: boolean = false;
  public data: any = [];
  public headers: any = [];
  public productCategory = [
    { name: "Broadloom", value: "" },
    { name: "Cushion", value: "" },
    { name: "Carpet Tile", value: "" },
    { name: "Resilient Sheet", value: "" },
    { name: "Resilient LVT", value: "" },
    { name: "Wood", value: "" },
    /* { name: "Ceramic Tile", value: "" }, */
    { name: "Adhesives", value: "" },
    { name: "Trims", value: "" },
    { name: "Accessories", value: "" },
    { name: "Underlayment", value: "" },
    { name: "Rugs", value: "" },
    { name: "Needlepunch Broadloom", value: "" },
    { name: "Needlepunch Tile", value: "" },
  ];
  public templateType = [
    { name: "Standard", value: "Standard" },
    { name: "RFMS", value: "RFMS" },
    { name: "Single Sheet", value: "SingleSheet" },
  ];
  public currentDate: any;
  public priceSearchForm!: FormGroup;
  public uid: any;
  modalRef?: BsModalRef;
  priceKeys = [
    "rollPriceSY",
    "cutPriceSY",
    "jobPackPriceSY",
    "warehousePriceSY",
    "plantDirectPriceSY",
    "palletPriceSY",
    "cartonPriceSY",
    "rollPriceSF",
    "cutPriceSF",
    "jobPackPriceSF",
    "warehousePriceSF",
    "plantDirectPriceSF",
    "palletPriceSF",
    "cartonPriceSF",
    "priceEach",
    "pricePerEaPallet",
    "cartonsPerPallet",
  ];
  isLoading: boolean = false;
  resultFlag: boolean = false;
  allCategoriesData:any = [];
  isShiptoUser: boolean = false;
  public sellingGroup = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private storageService: StorageService,
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private apiService: ApiService,
    private userService: UserService,
    private productAddressService: ProductAddressService,
  ) { }

  ngOnInit() {
    let todayDate = new Date();
    this.currentDate = formatDate(todayDate, "MM-dd-yyyy", "en-US");
    this.storageService.getItem("uid").subscribe((res) => {
      this.uid = res;
    });
    this.isShiptoUser = this.storageService?.userInfo?.orgUnit?.accountType === 'ZMSH';
    this.createPriceSearchForm();
    this.getPricingBrands();
    if(this.isShiptoUser)
    {
      this.loadShippingAddressForDefaultValue();
    }
  }
  createPriceSearchForm() {
    this.priceSearchForm = this.fb.group({
      productCategory: ["All"],
      templateType: ["SingleSheet"],
      suffix: [null],
      shippingAddress:[ null, [Validators.required]],
      sellingGroup: [""],
    });
  }

  onDownload(priceSearchForm: any) {
    if (priceSearchForm?.productCategory == "All") {
      this.downloadAll()
    } else {
      this.onSearch(priceSearchForm);
    }
  }
  onSearch(priceSearchForm: any) {
    this.allCategoriesData = [];
    let payload = {
      orderOfSort: "DESC",
      isDownloadable: true,
      shipTo: this.priceSearchForm.value.shippingAddress === null ? this.uid : this.priceSearchForm.value.shippingAddress,
      styleDetails: [
        {
          productCategory: priceSearchForm.productCategory,
          sellingGroup: (priceSearchForm.sellingGroup !== null || priceSearchForm.sellingGroup !== 'All') ? priceSearchForm.sellingGroup : "",
        },
      ],
    };
    //this.spinnerLoading = true;
    this.progressShow();

    const uid = this.uid === null ? this.priceSearchForm.value.shippingAddress : this.uid;
    let url = (API_CONSTANTS.priceSearch + uid).replace("{userId}", this.userService.getUserEmail().toLowerCase());
    this.resultFlag = false;
    this.apiService.post(url, payload).subscribe((res: any) => {
      if (priceSearchForm.productCategory == 'Cushion') {
        (res?.body?.result || []).map((item: any) => {
          item.size = `${item?.size} X ${item?.standardRollLength} LF`;
        });
      }
      this.allCategoriesData.push({productType:priceSearchForm.productCategory, data: res.body?.result || []});
      this.exportExcelFile();
    },(err:any)=>{
      this.progressHide();
      this.spinnerLoading = false;
    });
  }
  setHeader(productType: any) {
    if (productType === "Standard") {
      this.headers = {
        style: "STYLE",
        styleName: "STYLEDSC",
        backing: "BACK",
        sizeCode: "Size Code",
        brand: "BRAND",
        productCategory: "Product Category",
        size: "Size",

        //***** */ Std. Roll/Std. Pallet qty
        standardRollQuantity: "Std. Roll qty",
        standardPalletQuantity: "Std. Pallet Qty",
        uom: "UOM",

        //***** */ Roll/Pallet/JobPack Price/SY
        rollPriceSY: "Roll Price (Sq. Yd.)",
        palletPriceSY: "Pallet Price (Sq. Yd.)",
        jobPackPriceSY: "JobPack Price (Sq. Yd.)",

        //***** */ Cut/Carton/OOW Price /SY
        cutPriceSY: "Cut Price (Sq. Yd.)",
        cartonPriceSY: "Carton Price (Sq. Yd.)",
        oowPriceSY: "OOW Price (Sq. Yd.)",

        //***** */ Roll/Pallet/JobPack/EA Price/SF
        rollPriceSF: "Roll Price (Sq. Ft.)",
        palletPriceSF: "Pallet Price (Sq. Ft.)",
        jobPackPriceSF: "JobPack Price (Sq. Ft.)",
        priceEach: "Price Each",

        //***** */ Cut/Carton/JobPack Price/SF
        cutPriceSF: "Cut Price (Sq. Ft.)",
        cartonPriceSF: "Carton Price (Sq. Ft.)",
        // jobPackPriceSF: "JobPack Price (Sq. Ft.)", // Duplicate

        startDate: "Start Date",
        endDate: "End Date",
        dropped: "Drop",
      };
    }
    // standardRoll:'Std. Roll',
    if (productType === "RFMS") {
      this.headers = {
        productCategory: "ProductCode*(FM)",
        brand: "Manufacturer*",
        supplier: "Supplier*(FM)",
        styleName: "Supplier_Style*(FM)",
        style: "Style_ItemNum*(FM)",
        uom: "Units*",
        category: "Collection",
        colorName: "Color(RI*)",
        colorNumber: "ColorNum",
        userField: "ColorCategory",
        userField1: "ReOrderLevel",
        userField2: "ReOrderQty",
        userField3: "SerialNo",
        userField4: "PrivSerialNo",
        userField5: "Private_Collection",
        warehouse: "FOBPoint",
        userField7: "SampleType",
        store: "Store",
        quality: "Quality",
        warranty: "Warranty",
        userfield8: "ToxicityNum",
        FHANum: "FHANum",
        userfield: "User Field (CAF ID1)",
        shippingWeight: "Shipping Weight",
        startDate: "Product In Active Date",
        length: "RollLength(R)",
        width: "Roll Width(R*)",
        backing: "Backing(R)",
        pileHeight: "PileHeight(R)",
        weight: "Weight(R)",
        styleType: "StyleType(R)",
        fiberType: "FiberType(R)",
        adhesiveType: "AdhesiveType(R)",
        userField10: "SeamSealer(R)",
        standardRollLength: "ItemLength_RollMin",
        itemWidth: "ItemWidth(I)",
        userfield30: "CountryofOrigin(I)",
        construction: "Construction(I)",
        CountryofOrigin: "CountryofOrigin(I)",
        priceEach: "Roll_Item_ServiceCost",
        endDate: "Roll_Item_ServiceEndDate",
        unitPricePerCut: "CutCost(R)",
        userfield11: "ContractInstallation",
        userfield12: "RetailInstallation",
        userfield13: "FreightFactor",
        userfield14: "SpecialRoll_ItemCost",
        userfield15: "SpecialCutCost",
        userfield16: "Load",
        userfield17: "LoadPercent",
        userfield18: "SRP",
        userfield19: "Price3",
        userfield20: "Price4",
        userfield21: "Price5",
        userfield22: "Price5",
        userfield23: "Price6",
        userfield24: "Price7",
        userfield25: "Price8",
        userfield26: "Price9",
        userfield27: "Price10",
        userfield28: "Price11",
        userfield29: "Price12",
        userfield31: "MeasureProduct",
        userfield32: "EstimatingUnit",
        patternLength: "PatternLength",
        patternWidth: "PatternWidth",
        patternDrop: "PatternDrop",
        userfield33: "NHMSProduct",
        quantityPerCarton: "QtyPerCarton",
        unitPricePerCarton: "UnitCostPerCarton",
        quantityPerContainer: "QtyPerContainer",
        thickness: "ItemThickness",
        careFee: "RecoveryFee",
      };
    }
  }
  
  addComaToNumber(n: any) {
    var parts = n.toString().split(".");
    parts[0] = parts[0]
      .toString()
      .replace(/\D/g, "")
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  }
  addressData: any = [];
  openChangeShippingAddress() {
    const initialState: ModalOptions = {
      initialState: {
        minRollLength: 0,
        maxRollLength: 0,
        standardRollLength: 0,
        productCode: "",
        isForSelectAddress: true,
        selectedAddress: (this.addressData?.length > 0 && this.priceSearchForm.value.shippingAddress != null) ? this.addressData[0] : null
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
      this.addressData = [...[], ...[data]];
      this.priceSearchForm.controls['shippingAddress'].setValue(data?.id || '');
    })
   
  }
  loadShippingAddressForDefaultValue() {
    this.progressShow();
    this.productAddressService
      .pricingAllAddress(
        this.userService.getUserEmail().toLowerCase(),
        10,
        0,
        ""
      )
      .subscribe(
        (res) => {
          const data = res.body?.addresses || [];
          if (data.length > 0) {
            this.addressData = [...[], ...[data[0]]];
            this.priceSearchForm.controls['shippingAddress'].setValue(this.uid || data[0].id || '');
            this.priceSearchForm.controls['shippingAddress'].enable();
            this.progressHide();
          }
        },
        (err) => {
          this.progressHide();
        }
      );
  }
  exportExcelFile() {
    let logoLink: any = "/assets/images/logo-residential-dark.png";
    branndThumbUrl.map(
      (item: { brandId: any; brandName: any; brandLogoURl: any }) => {
        let itemBrandId = item?.brandId || "";
        if (this.priceSearchForm.value.sellingGroup == itemBrandId && item.brandLogoURl) {
          logoLink = item.brandLogoURl;
          console.log("Brand Logo" + item.brandLogoURl);
        }
      }
    );
    this.convertImageToBase64(logoLink);
  }
  
   convertImageToBase64(imgUrl: any) {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx: any = canvas.getContext("2d");
      canvas.height = image.naturalHeight;
      canvas.width = image.naturalWidth;
      ctx.drawImage(image, 0, 0);
      const dataUrl = canvas.toDataURL();
      this.createAllDataExcel(dataUrl);
    }, () => {
      this.progressHide();
    };
    image.src = imgUrl;
  }

  createAllDataExcel(logoBase64: any) {
    const workbook = new Workbook();
    let i = 0;
    this.allCategoriesData.forEach((item: any) => {
        i = i + 1;

        let productType = item?.productType;
        let data: any = item?.data || [];

        // Sort data by Style Name in ascending alphabetical order
        data.sort((a: any, b: any) => {
            const styleNameA = a.styleName?.toLowerCase() || '';
            const styleNameB = b.styleName?.toLowerCase() || '';

            const isAlphaA = /^[a-z]/.test(styleNameA);
            const isAlphaB = /^[a-z]/.test(styleNameB);

            if (isAlphaA && !isAlphaB) return -1; // Alphabetic first
            if (!isAlphaA && isAlphaB) return 1;  // Numeric last

            return styleNameA.localeCompare(styleNameB); // Default alphabetical sorting
        });

        let headers = this.setAllDataHeader(this.priceSearchForm.value.templateType);
        const accountName = data.length > 0 ? data[0]?.accountName || '' : '';
        const accountNumber = data.length > 0 ? data[0].accountNumber || '' : '';
        let filename = '';
        let workSheetName = '';
        if (this.allCategoriesData.length > 1) {
           filename = productType +
            "-" +
            "Price-" +
            this.currentDate+'-' + i;
             if(filename.length > 31){
            let productTypeName = productType.substring(0, (filename.length - 31));
            workSheetName =  productTypeName +
            "-" +
            "Price-" +
            this.currentDate+'-' + i;
            }else{
              workSheetName = filename;
            }
        } else {
            let acctName = this.sanitizeFileName(accountName);
            filename =
              acctName + "-" + productType + "-" + "Price-" + this.currentDate;
            if (filename.length > 31) {
              if (acctName.length > filename.length - 31) {
                acctName = acctName.substring(
                  0,
                  acctName.length - 1 - (filename.length - 31),
                );
                workSheetName =
                  acctName +
                  "-" +
                  productType +
                  "-" +
                  "Price-" +
                  this.currentDate;
              } else {
                let name = acctName + "-" + productType + "-" + "Price-";
                workSheetName =
                  name.substring(0, name.length - 1 - (filename.length - 31)) +
                  "-" +
                  this.currentDate;
              }
            } else {
              workSheetName = filename;
            }
          }
        + (this.allCategoriesData.length > 1 ? i : '');
        const worksheet = workbook.addWorksheet(workSheetName);
        const logo = workbook.addImage({
            base64: logoBase64,
            extension: "png",
        });
        worksheet.addImage(logo, "A1:C3");
        worksheet.mergeCells("A1:C3");
        worksheet.addRow([]);
        let hdr1 =
            "Price List for Product Type:  " +
            productType +
            " for Account- " +
            accountName;
        let hdr2 = "Account Number:   " + accountNumber;
        let hdr3 = "Active Pricing as of: " + this.currentDate + "EST";
        let hdr4 =
            "Prices subject to all taxes, excise fees and stewardship fees appropriate for your jurisdiction.";
        let hdr5 =
            "CALIFORNIA - CalRecycle has implemented a differential assessment structure for broadloom carpet and carpet tile shipped into California: Broadloom carpet = $1.05 Sy; Broadloom Carpet with =>10% Post Consumer Content = $0.96 Sy;"
        let hdr6 =
            "Carpet Tile = $1.49 Sy; Carpet Tile with => 10% Post Consumer Content = $1.40 Sy.";
        let hdr7 = "Pricing Key: RL = Roll Price; PD = Plant Direct; PAL = Pallet Price; EA = Each; CUT = Cut Price; CAR = Carton Price; OOW = Warehouse";
        worksheet.addRow([hdr1]);
        worksheet.addRow([hdr2]);
        worksheet.addRow([hdr3]);
        worksheet.addRow([hdr4]);
        worksheet.addRow([hdr5]);
        worksheet.addRow([hdr6]);
        worksheet.addRow([hdr7]);
        worksheet.addRow([]);
        const headerRow = worksheet.addRow(Object.values(headers));
        headerRow.font = { bold: true };
        const columnMaxLengths: number[] = Object.keys(headers).map((key) => {
            const columnValues = data.map((d: any) =>
                d[key] !== null && d[key] !== undefined && d[key] !== ""
                    ? d[key].toString().length
                    : 5
            );
            return Math.max(...columnValues);
        });

        Object.values(headers).forEach((val: any, index) => {
            const column = worksheet.getColumn(index + 1);
            const maxLength = columnMaxLengths[index];
            const headerLength = val.toString().length;
            const maxContentLength = Math.max(maxLength, headerLength);
            if (val === "STYLE") {
                column.width = maxContentLength + 5;
            } else {
                column.width = maxContentLength;
            }
        });

        data.forEach((d: any) => {
            let rowData = [];
            for (let key in d) {
                if (this.priceKeys.includes(key)) {
                    d[key] = this.formatCurrency(d[key]);
                }
            }
            for (let key in headers) {
                rowData.push(
                    d[key] !== null && d[key] !== undefined && d[key] !== ""
                        ? d[key]
                        : "N/A"
                );
            }
            worksheet.addRow(rowData);
        });

        if (this.allCategoriesData.length == i) {
            if (this.allCategoriesData.length === 1) {
                this.saveAllDataExcel(workbook, filename);
            } else {
                this.saveAllDataExcel(workbook);
            }
        }
    });
  }

  saveAllDataExcel(workbook: Workbook, fileName = 'All_ProductType_Categories') {
    const info: any = workbook.xlsx.writeBuffer();
    info.then((data: any) => {
      const blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      let a = document.createElement("a");
      var url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = String(fileName + ".xlsx");
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      this.modalService.hide();
      this.progressHide();
    }, (error: any) => {
      this.modalService.hide();
    });
    // this.progressHide();
  }

  setAllDataHeader(productType: any) {
    if (productType === "Standard" || productType === "SingleSheet") {
      this.headers = {
        style: "STYLE",
        styleName: "STYLEDSC",
        backing: "BACK",
        sizeCode: "Size Code",
        brand: "BRAND",
        productCategory: "Product Category",
        size: "Size",

        //***** */ Std. Roll/Std. Pallet qty
        standardRollQuantity: "Std. Roll qty",
        standardPalletQuantity: "Std. Pallet Qty",
        uom: "UOM",

        //***** */ Roll/Pallet/JobPack Price/SY
        rollPriceSY: "Roll Price (Sq. Yd.)",
        palletPriceSY: "Pallet Price (Sq. Yd.)",
        jobPackPriceSY: "JobPack Price (Sq. Yd.)",

        //***** */ Cut/Carton/OOW Price /SY
        cutPriceSY: "Cut Price (Sq. Yd.)",
        cartonPriceSY: "Carton Price (Sq. Yd.)",
        oowPriceSY: "OOW Price (Sq. Yd.)",

        //***** */ Roll/Pallet/JobPack/EA Price/SF
        rollPriceSF: "Roll Price (Sq. Ft.)",
        palletPriceSF: "Pallet Price (Sq. Ft.)",
        jobPackPriceSF: "JobPack Price (Sq. Ft.)",
        priceEach: "Price Each",
        warehousePriceSF:"Warehouse (Sq. Ft.)",
        plantDirectPriceSF:"Plant Direct (Sq. Ft.)",

           //***** */ Roll/Pallet/JobPack/EA Price/SF
   
        warehousePriceSY:"Warehouse (Sq. Yd.)",
        plantDirectPriceSY:"Plant Direct (Sq. Yd)",

        //***** */ Cut/Carton/JobPack Price/SF
        cutPriceSF: "Cut Price (Sq. Ft.)",
        cartonPriceSF: "Carton Price (Sq. Ft.)",
        // jobPackPriceSF: "JobPack Price (Sq. Ft.)", // Duplicate

        startDate: "Start Date",
        endDate: "End Date",
        dropped: "Drop",
      };
    }
    if (productType === "RFMS") {
      this.headers = {
        productCategory: "ProductCode*(FM)",
        brand: "Manufacturer*",
        supplier: "Supplier*(FM)",
        styleName: "Supplier_Style*(FM)",
        style: "Style_ItemNum*(FM)",
        uom: "Units*",
        category: "Collection",
        colorName: "Color(RI*)",
        colorNumber: "ColorNum",
        userField: "ColorCategory",
        userField1: "ReOrderLevel",
        userField2: "ReOrderQty",
        userField3: "SerialNo",
        userField4: "PrivSerialNo",
        userField5: "Private_Collection",
        warehouse: "FOBPoint",
        userField7: "SampleType",
        store: "Store",
        quality: "Quality",
        warranty: "Warranty",
        userfield8: "ToxicityNum",
        FHANum: "FHANum",
        userfield: "User Field (CAF ID1)",
        shippingWeight: "Shipping Weight",
        startDate: "Product In Active Date",
        length: "RollLength(R)",
        width: "Roll Width(R*)",
        backing: "Backing(R)",
        pileHeight: "PileHeight(R)",
        weight: "Weight(R)",
        styleType: "StyleType(R)",
        fiberType: "FiberType(R)",
        adhesiveType: "AdhesiveType(R)",
        userField10: "SeamSealer(R)",
        standardRollLength: "ItemLength_RollMin",
        itemWidth: "ItemWidth(I)",
        userfield30: "CountryofOrigin(I)",
        construction: "Construction(I)",
        CountryofOrigin: "CountryofOrigin(I)",
        priceEach: "Roll_Item_ServiceCost",
        endDate: "Roll_Item_ServiceEndDate",
        unitPricePerCut: "CutCost(R)",
        userfield11: "ContractInstallation",
        userfield12: "RetailInstallation",
        userfield13: "FreightFactor",
        userfield14: "SpecialRoll_ItemCost",
        userfield15: "SpecialCutCost",
        userfield16: "Load",
        userfield17: "LoadPercent",
        userfield18: "SRP",
        userfield19: "Price3",
        userfield20: "Price4",
        userfield21: "Price5",
        userfield22: "Price5",
        userfield23: "Price6",
        userfield24: "Price7",
        userfield25: "Price8",
        userfield26: "Price9",
        userfield27: "Price10",
        userfield28: "Price11",
        userfield29: "Price12",
        userfield31: "MeasureProduct",
        userfield32: "EstimatingUnit",
        patternLength: "PatternLength",
        patternWidth: "PatternWidth",
        patternDrop: "PatternDrop",
        userfield33: "NHMSProduct",
        quantityPerCarton: "QtyPerCarton",
        unitPricePerCarton: "UnitCostPerCarton",
        quantityPerContainer: "QtyPerContainer",
        thickness: "ItemThickness",
        careFee: "RecoveryFee",
      };
    }
    return this.headers;
  }


  downloadAll() {
    let downloadCalls:any = [];
    const uid = this.uid === null ? this.priceSearchForm.value.shippingAddress : this.uid;
    let url = (API_CONSTANTS.priceSearch + uid).replace("{userId}", this.userService.getUserEmail().toLowerCase());
    this.productCategory.forEach(item=>{
      let payload = {
        orderOfSort: "DESC",
        isDownloadable: true,
        shipTo: this.priceSearchForm.value.shippingAddress === null ? this.uid : this.priceSearchForm.value.shippingAddress,
        styleDetails: [
          {
            productCategory: item.name,
            sellingGroup: (this.priceSearchForm.value.sellingGroup !== null || this.priceSearchForm.value.sellingGroup !== 'All') ? this.priceSearchForm.value.sellingGroup : "",
          },
        ],
      };
      this.progressShow();
      downloadCalls.push(this.apiService.post(url, payload));
    })
    
    // this.spinnerLoading = true;
    
    this.resultFlag = false;
    this.allCategoriesData = [];
    forkJoin(downloadCalls).subscribe((res: any) => {
      console.log(res);
      res.forEach((resData:any,ind:any)=>{
        if (this.productCategory[ind].name == 'Cushion') {
        (resData.body?.result || []).map((item: any) => {
          item.size = `${item?.size} X ${item?.standardRollLength} LF`;
        });
      }
      if (this.priceSearchForm?.value?.productCategory == "All" && this.priceSearchForm.value?.templateType == "SingleSheet") {
        if (this.allCategoriesData.length == 0) {
          const resultData = resData.body?.result || [];
          this.allCategoriesData.push({
            productType: 'All',
            data: [...resultData],
          });
        } else {
          const resultData = resData.body?.result || [];
          this.allCategoriesData[0].data = [
            ...this.allCategoriesData[0].data,
            ...resultData,
          ];
        }
      } else {
        this.allCategoriesData.push({
          productType: this.productCategory[ind].name,
          data: resData.body?.result || [],
        });
      }
      
      })
      this.exportExcelFile();
    },(err:any)=>{
      this.progressHide();
      this.spinnerLoading = false;
    });
  }

    progressShow(){
     const messageConstants = MESSAGE_CONSTANTS?.pricing?.download
      this.openProgressModal({
        modalHeaderText: messageConstants?.headerText,
        progressText: messageConstants?.bodyText,
        progressBarText: messageConstants?.barText
      });
    }
    progressHide(){
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
    
  getPricingBrands() {
    const categoryName= this.priceSearchForm.value.productCategory;
    let url = API_CONSTANTS.getPricingBrands + categoryName;
    url = url.replace("{userId}",this.userService.getUserEmail());
    this.apiService.get(url).subscribe((res: any) => {
      this.sellingGroup = res?.body;
    });
  }

  sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, "_"); 
  
}

  formatCurrency(input: any) {
    const number = Number(input?.toString()?.replace(/,/g, ""));
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number);
  }

  private originalTemplateType = [...this.templateType];
  onProductCategoryChange(event: any) {
      if (event !== 'All') {
          this.priceSearchForm.get('templateType')?.setValue(this.templateType[0].value);
          // Hide "Single Sheet" option
          this.templateType = this.originalTemplateType.filter(option => option.value !== 'SingleSheet');
      } else {
          this.priceSearchForm.get('templateType')?.setValue(this.originalTemplateType.find(option => option.value === 'SingleSheet')?.value || '');
          // Restore the original templateType options
          this.templateType = [...this.originalTemplateType];
      }
  }   
}
