import { formatDate } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Workbook } from "exceljs";
import { BsModalService, BsModalRef, ModalOptions } from "ngx-bootstrap/modal";
import { ApiService } from "src/app/features/http-services/api.service";
import { StorageService } from "src/app/features/http-services/storage.service";
import { API_CONSTANTS } from "src/app/features/shared/constants/API-CONSTANTS";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { ProductAddressService } from "../../../products/components/services/product-address.service";
import { ChangeShippingAddressComponent } from "../../../products/components/change-shipping-address/change-shipping-address.component";
import { forkJoin } from "rxjs";
import { ProgressModalComponent } from "src/app/features/shared/components/progress-modal/progress-modal.component";
import { MESSAGE_CONSTANTS } from "src/app/features/shared/constants/MESSAGE-CONSTANTS";

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
  private allCategoriesData:any = []
  public spinnerLoading: boolean = false;
  public data: any = [];
  public headers: any = [];
  public productCategory = [
    { name: "All", value: "" },
    { name: "Broadloom", value: "" },
    { name: "Carpet Tile", value: "" },
    /* { name: "Hero Turf", value: "" }, */
    { name: "Sheet Vinyl", value: "" },
    { name: "LVT", value: "" },
    { name: "Homogeneous Resilient Tile", value: "" },
    { name: "Engineered Wood", value: "" },
    { name: "Rubber Flooring", value: "" },
    { name: "Laminate", value: "" },
    /* { name: "Hero Rubber", value: "" }, */
    { name: "Vinyl Tile", value: "" },
    { name: "Broadloom Pad", value: "" },
    { name: "Adhesives", value: "" },
    { name: "Underlayment", value: "" },
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
  isShiptoUser: boolean = false;
  private originalTemplateType = [...this.templateType];


  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private storageService: StorageService,
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private apiService: ApiService,
    private userService: UserService,
    private productAddressService: ProductAddressService,
  ) {}

  ngOnInit() {
    let todayDate = new Date();
    this.currentDate = formatDate(todayDate, "MM-dd-yyyy", "en-US");
    this.storageService.getItem("uid").subscribe((res) => {
      this.uid = res;
    });
    this.isShiptoUser = this.storageService?.userInfo?.orgUnit?.accountType === 'ZMSH';
    this.createPriceSearchForm();
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
        },
      ],
    };
    this.progressShow();
    //this.spinnerLoading = true;

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
      this.createAllDataExcel()
  },(err:any)=>{
    this.progressHide();
    this.spinnerLoading = false;
  });
  }

  setHeader(productType: any) {
    if (productType === "Standard" || productType === "SingleSheet") {
      return {
        style: "STYLE",
        styleName: "STYLEDSC",
        backing: "BACK",
        sizeCode: "Size Code",
        brand: "BRAND",
        productCategory: "Product Category",
        size: "Size",
        uom: "UOM",
        palletPriceSF: "Pallet Price (Sq. Ft.)",
        jobPackPriceSY: "Roll/Pallet/JobPack Price/SY",
        cutPriceSY: "Cut/Carton/OOW Price/SY",
        rollPriceSF: "Roll/Pallet/Job Pack/EA Price/SF",
        cutPriceSF: "Cut Price (Sq. Ft.)",
        cartonPriceSF: "Carton Price (Sq. Ft.)",
        startDate: "Start Date",
        endDate: "End Date",
      };
    }
    if (productType === "RFMS") {
      return {
        productCategory: "ProductCode*(FM)",
        brand: "Manufacturer*",
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
        fiberType: "FiberType(R)",
        userField10: "SeamSealer(R)",
        itemWidth: "ItemWidth(I)",
        CountryofOrigin: "CountryofOrigin(I)",
        priceEach: "Roll_Item_ServiceCost",
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
      };
    }
    return {};
  }

  addComaToNumber(n: any) {
    var parts = n.toString().split(".");
    parts[0] = parts[0]
      .toString()
      .replace(/\D/g, "")
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  }
  addressData:any =[];
  openChangeShippingAddress() {
    const initialState: ModalOptions = {
      initialState: {
        minRollLength: 0,
        maxRollLength: 0,
        standardRollLength: 0,
        productCode: "",
        isForSelectAddress:true,
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
      this.addressData= [...[],...[data]];
      this.priceSearchForm.controls['shippingAddress'].setValue(data?.id || '');
    })
   
  }
  loadShippingAddressForDefaultValue(){
    this.progressShow();
    //this.isLoading= true
    this.productAddressService.pricingAllAddress(this.userService.getUserEmail().toLowerCase(),10, 0, "").subscribe(
      (res: any) => {
        const data = res.body?.addresses || [];
        if(data.length > 0){
          this.addressData= [...[],...[data[0]]];
          this.priceSearchForm.controls['shippingAddress'].setValue(this.uid || data[0].id || '');
          this.priceSearchForm.controls['shippingAddress'].enable();
          this.progressHide();
        }
      },
       (err) => {
          this.progressHide();
        });
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
            },
          ],
        };
        downloadCalls.push(this.apiService.post(url, payload));
      })
      
      this.spinnerLoading = true;
      
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
          // this.allCategoriesData.push({productType:this.productCategory[ind].name, data: resData.body?.result || []})
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
        this.createAllDataExcel();
      },(err:any)=>{
        this.spinnerLoading = false;
      });
    }

    createAllDataExcel() {
        const workbook = new Workbook();
        let i =0;
        this.allCategoriesData.forEach((item: any) => {
          i = i + 1;
          
          let productType = item?.productType;
          let data: any = item?.data || [];
                  data.sort((a: any, b: any) => {
            const styleNameA = a.styleName?.toLowerCase() || '';
            const styleNameB = b.styleName?.toLowerCase() || '';

            const isAlphaA = /^[a-z]/.test(styleNameA);
            const isAlphaB = /^[a-z]/.test(styleNameB);

            if (isAlphaA && !isAlphaB) return -1; // Alphabetic first
            if (!isAlphaA && isAlphaB) return 1;  // Numeric last

            return styleNameA.localeCompare(styleNameB); // Default alphabetical sorting
        });
          let headers = this.setHeader(this.priceSearchForm.value.templateType);
          const accountName = data.length > 0 ? data[0]?.accountName || '' : '';
          const accountNumber = data.length > 0 ? data[0].accountNumber || '' : '';
          let filename = '';
          let workSheetName = '';
          if (this.allCategoriesData.length > 1) {
            filename =
              productType + "-" + "Price-" + this.currentDate + "-" + i;
            if (filename.length > 31) {
              let productTypeName = productType.substring(
                0,
                filename.length - 31,
              );
              workSheetName =
                productTypeName + "-" + "Price-" + this.currentDate + "-" + i;
            } else {
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
            base64:
              "data:image/png;base64,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",
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
                // d[key] = d[key].replace(/,/g, "");
                // d[key] = (d[key] == 0 || d[key] > 0) ? `$${d[key]?.toFixed(2)}` : d[key];
                // d[key] = "$" + d[key];
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
          if(this.allCategoriesData.length === 1){
            this.saveAllDataExcel(workbook, filename);
          }else{
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
    });
    this.progressHide();
    this.spinnerLoading = false;
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
