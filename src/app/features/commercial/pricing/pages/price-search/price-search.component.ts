import { formatDate } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Columns, Config, DefaultConfig } from "ngx-easy-table";
import { StorageService } from "src/app/features/http-services/storage.service";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import { columnHeader, header } from "./price-search.constants";
import autoTable, { Row } from "jspdf-autotable";
import { BsModalService, BsModalRef, ModalOptions } from "ngx-bootstrap/modal";
import { ShareEmailModalComponent } from "src/app/features/shared/components/share-email-modal/share-email-modal.component";
import { API_CONSTANTS } from "src/app/features/shared/constants/API-CONSTANTS";
import { ApiService } from "src/app/features/http-services/api.service";
import { ProductService } from "src/app/features/residential/products/pages/services/product.service";
import { branndThumbUrl } from "src/app/features/shared/constants/brand-logo";
import { Workbook } from "exceljs";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { ProductAddressService } from "../../../products/components/services/product-address.service";
import { ChangeShippingAddressComponent } from "../../../products/components/change-shipping-address/change-shipping-address.component";
import { ProgressModalComponent } from "src/app/features/shared/components/progress-modal/progress-modal.component";
import { MESSAGE_CONSTANTS } from "src/app/features/shared/constants/MESSAGE-CONSTANTS";
@Component({
    selector: "app-price-search",
    templateUrl: "./price-search.component.html",
    styleUrls: ["./price-search.component.scss"],
    standalone: false
})
export class PriceSearchComponent implements OnInit {
  public priceSearchForm!: FormGroup | any;

  breadcrumbItems: BreadcrumbItems = [
    {
      name: "Home",
      path: "/commercial",
      active: false,
    },
    {
      name: "Pricing",
      path: "/commercial",
      active: false,
    },
    {
      name: "Search & Download Pricing",
      path: "/",
      active: true,
    },
  ];
  public spinnerLoading: boolean = false;
  public pdfHeader: any = [];
  public pdfValues: any = [];
  productType: any = "ALL";
  public pdfblob: any;
  public excelblob: any;
  public showTable: boolean = false;
  dateString: any;
  public emptyMessage = false;
  public showErrorMessage = false;
  public errorMessage: any;
  public totalDataLength: number = 0;

  public productCategory = [
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
    { name: "Underlayment", value: "" }
  ];
  public productPrice = [
    // { name: "All", value: 'all' },
    { name: "Future Price", value: 'future' },
    { name: "Active Price", value: 'active' },
  ];
  public productLine: any = "";
  public collection: any = "";
  public currentDate: any;
  public headers: any = {};
  public sellingGroup = [
    // { name: "Karastan", value: "" },
    // { name: "Godfrey Hirst", value: "" },
    // { name: "Mohawk", value: "" },
    // { name: "Portico", value: "" },
    // { name: "Pergo", value: "" },
    // { name: "Aladdin Commercial", value: "" },
    // { name: "Quickstep", value: "" },
  ];

  public configuration1!: Config;
  public columns1!: Columns[];
  public data: any = [];
  public uid: any;

  public data1 = [
    {
      style: "2E47",
      styleName: "ACHIEVER",
      backing: "KANGAHYD",
      size: "12FT 00IN",
      brand: "MOHAWKRE",
      minQTY: "N/A",
      effectiveDate: "2021-10-01",
      rollPrice: "$6.39",
      cutPrice: "N/A",
      rollPrice1: "$0.71",
      cutPrice1: "N/A",
    },
    {
      style: "2E47",
      styleName: "ACHIEVER",
      backing: "KANGAHYD",
      size: "12FT 00IN",
      brand: "MOHAWKRE",
      minQTY: "N/A",
      effectiveDate: "2021-10-01",
      rollPrice: "$6.39",
      cutPrice: "N/A",
      rollPrice1: "$0.71",
      cutPrice1: "N/A",
    },
    {
      style: "2E47",
      styleName: "ACHIEVER",
      backing: "KANGAHYD",
      size: "12FT 00IN",
      brand: "MOHAWKRE",
      minQTY: "N/A",
      effectiveDate: "2021-10-01",
      rollPrice: "$6.39",
      cutPrice: "N/A",
      rollPrice1: "$0.71",
      cutPrice1: "N/A",
    },
    {
      style: "2E47",
      styleName: "ACHIEVER",
      backing: "KANGAHYD",
      size: "12FT 00IN",
      brand: "MOHAWKRE",
      minQTY: "N/A",
      effectiveDate: "2021-10-01",
      rollPrice: "$6.39",
      cutPrice: "N/A",
      rollPrice1: "$0.71",
      cutPrice1: "N/A",
    },
    {
      style: "2E47",
      styleName: "ACHIEVER",
      backing: "KANGAHYD",
      size: "12FT 00IN",
      brand: "MOHAWKRE",
      minQTY: "N/A",
      effectiveDate: "2021-10-01",
      rollPrice: "$6.39",
      cutPrice: "N/A",
      rollPrice1: "$0.71",
      cutPrice1: "N/A",
    },
  ];
  modalRef?: BsModalRef;
  emailPayload: any;
  showEmailMessage: string = "";
  alertType: string = "";
  allData: any = [];
  priceKeys = [
    "rollPriceSY",
    "cutPriceSY",
    "rollPriceSF",
    "cutPriceSF",
    "jobPackPriceSY",
    "warehousePriceSY",
    "plantDirectPriceSY",
    "palletPriceSY",
    "cartonPriceSY",
    "rollPriceSY",
    "cutPriceSY",
    "rollPriceSF",
    "cutPriceSF",
    "palletPriceSF",
    "cartonPriceSF",
    "priceEach",
    "pricePerEaPallet",
  ];
  collectionList: any = [];
  isLoading: boolean = false;
  isShiptoUser: boolean = false;
  contentType: any;
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    public storageService: StorageService,
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private apiService: ApiService,
    private productService: ProductService,
    private userService: UserService,
    private productAddressService: ProductAddressService,
  ) {}

  ngOnInit(): void {
    let todayDate = new Date();
    this.currentDate = formatDate(todayDate, "MM-dd-yyyy HH:mm:ss", "en-US");
    this.dateString = todayDate.toDateString();
    this.createPriceSearchForm();
    this.storageService.getItem("uid").subscribe((res) => {
      this.uid = res;

      this.onCollectionList(this.uid);
    });
    this.isShiptoUser = this.storageService?.userInfo?.orgUnit?.accountType === 'ZMSH';
    this.configuration1 = { ...DefaultConfig };
    this.configuration1.checkboxes = false;
    this.configuration1.tableLayout.striped = true;
    this.configuration1.tableLayout.hover = false;
    this.configuration1.paginationRangeEnabled = false;
    this.configuration1.paginationEnabled = false;
    this.configuration1.rows = 100;
    this.columns1 = [];
    this.getPricingBrands();
    if(this.isShiptoUser)
    {
      this.loadShippingAddressForDefaultValue();
    }
  }
  createPriceSearchForm() {
    this.priceSearchForm = this.fb.group({
      sellingGroup: [""],
      collection: [null],
      promoFlg: [0],
      styleNumber: [null],
      styleName: [""],
      productCategory: ["Broadloom", [Validators.required]],
      shippingAddress: [ null, [Validators.required]],
      sizeCode: [""],
      backingCode: [null],
      sortBy: "",
      orderOfSort: "DESC",
      isDownloadable: false,
      futurePrice: false,
      priceType: ["active", [Validators.required]],
      currentPage: this.pageIndex,
      recordsPerPage: this.tableItemsSize,
      startRow: "",
      endRow: "",
      dropped: [0],
    });
  }
  downloadPayload: any;
  payloadPDF: any;
  onSearch(payload: any) {
    if (payload.promoFlg) {
      payload.promoFlg = 1;
    } else {
      payload.promoFlg = 0;
    }
    if (payload.dropped) {
      payload.dropped = 1;
    } else {
      payload.dropped = 0;
    }

    let pload = {
      collection: payload.collection !== null ? payload.collection : "",
      promoFlg: payload.promoFlg !== null ? payload.promoFlg : 0,
      dropped: payload.dropped !== null ? payload.dropped : 0,
      sortBy: payload.sortBy !== null ? payload.sortBy : "",
      orderOfSort: payload.orderOfSort !== null ? payload.orderOfSort : "DESC",
      isDownloadable:
        payload.isDownloadable !== null
          ? payload.isDownloadable == true
          : false,
      futurePrice: false,
      priceType:
        payload.priceType !== null ? payload.priceType : "",      currentPage: payload.currentPage !== null ? payload.currentPage : 1,
      recordsPerPage:
        payload.recordsPerPage !== null ? payload.recordsPerPage : 10,
      startRow: payload.startRow !== null ? payload.startRow : "",
      endRow: payload.endRow !== null ? payload.endRow : "",
      shipTo:
        this.priceSearchForm.value.shippingAddress === null
          ? this.uid
          : this.priceSearchForm.value.shippingAddress,
      styleDetails: [
        {
          styleNumber: payload.styleNumber !== null ? payload.styleNumber : "",
          productCategory:
            payload.productCategory !== null ? payload.productCategory : "",
          sellingGroup:
            payload.sellingGroup !== null ? payload.sellingGroup : "",
          styleName: payload.styleName !== null ? payload.styleName : ""
        },
      ],
    };

    this.showErrorMessage = false;
    this.productType = payload.productCategory;
    this.setColumn(payload.productCategory);
    this.setHeader(payload.productCategory);
    this.progressShow('search')
    //this.spinnerLoading = true;

    this.downloadPayload = payload;
    this.payloadPDF = pload;
    const uid =
      this.uid === null ? this.priceSearchForm.value.shippingAddress : this.uid;
    let url = (API_CONSTANTS.priceSearch + uid).replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    this.apiService.post(url, pload).subscribe({
      next: (res: any) => {
        this.downloadPayload.isDownloadable = false;
        this.spinnerLoading = false;
        this.progressHide()
        this.totalDataLength = res.body?.totalCount || 0;
        this.pageIndex = pload.currentPage;
        this.startValue = this.pageIndex * Number(this.tableItemsSize) -(Number(this.tableItemsSize) - 1);
        this.lastValue = this.startValue + Number(this.tableItemsSize) - 1;
        this.lastValue = this.lastValue > this.totalDataLength ? this.totalDataLength : this.lastValue;
        if (res.status == 200) {
          if (res.body?.totalCount > 0) {
            this.emptyMessage = false;
            this.data = res.body.result;
            this.data.forEach((obj: any) => {
              for (const key in obj) {
                if (key.toLowerCase().includes("price")) {
                  const value = obj[key];

                  if (typeof value === "number") {
                    obj[key] = this.addComaToNumber(obj[key]);
                  }
                }
              }
            });
            this.showTable = true;
            this.data.map((item: any) => {
              for (let key in item) {
                if (this.priceKeys.includes(key)) {
                  item[key] = this.formatCurrency(item[key]);
                  // item[key] = item[key].replace(/,/g, "");
                  // let value: any = +item[key];
                  // item[key] = (value == 0 || value > 0) ? value?.toFixed(2) : value;
                  // item[key] = "$" + item[key];
                }
              }
              if (item?.startDate) {
                item.startDate = this.dateConvert(item?.startDate);
              }
              if (item?.endDate) {
                item.endDate = this.dateConvert(item?.endDate);
              }
              if (this.productType == 'Cushion') {
                item.size = `${item?.size} X ${item?.standardRollLength} LF`;
              }
            });
          } else {
            this.data = [];
            this.emptyMessage = true;
          }
        }
      },
      error: (err: any) => {
        this.progressHide()
        this.spinnerLoading = false;
        this.showErrorMessage = true;
        this.errorMessage = err.error.errors[0].message;
      },
    });
  }
  onSort(e: any) {
    if (e.event == "onOrder") {
      if (this.productType === "Ceramic Tile") {
        this.downloadPayload.sortBy =
          e.value.key === "weightCarton" ? "weightpercarton" : e.value.key;
      }
      else if (this.productType === "Resilient Sheet") {
        this.downloadPayload.sortBy =
          e.value.key === "guage" ? "gauge" : e.value.key;
      }
      else{
        this.downloadPayload.sortBy = e.value.key;
      }

      this.downloadPayload.orderOfSort = e.value.order.toUpperCase();
      this.pageIndex = 1;
      this.downloadPayload.currentPage = this.pageIndex;
      this.onSearch(this.downloadPayload);
      this.columns1 = this.columns1.map((item: any) => {
        if (item.key === e?.value?.key) {
          let existingClass = item.cssClass?.name || "";
          if (e?.value?.order === "asc") {
            item.cssClass = {
              ...item.cssClass,
              name: `${existingClass} sorting-arrow-active`.trim(),
            };
          } else if (e?.value?.order === "desc") {
            item.cssClass = {
              ...item.cssClass,
              name: `${existingClass} sorting-arrow-down-icon`.trim(),
            };
          }
        } else if (item.hasOwnProperty("cssClass")) {
          let existingClass = item.cssClass?.name || "";
          item.cssClass = {
            ...item.cssClass,
            name: `${existingClass.replace(/sorting-arrow-active|sorting-arrow-down-icon/g, '').trim()} sorting-arrow`.trim(),
          };
        }
        return item;
      });
    }
  }

  downloadAllPrices(type: any = "pdf", email: boolean = false) {
    if (!email) {
      this.progressShow('download', type);
    }
    else{
      this.progressShow('preparing',type);
    }
    this.payloadPDF.isDownloadable = true;
    let url = (API_CONSTANTS.priceSearch + this.uid).replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    this.apiService.post(url, this.payloadPDF).subscribe({
      next: (res: any) => {
        this.spinnerLoading = false;
        if (res.status == 200) {
          if (res.body?.totalCount > 0) {
            this.allData = res.body.result;
            this.emptyMessage = false;
            this.allData.forEach((obj: any) => {
              for (const key in obj) {
                if (key.toLowerCase().includes("price")) {
                  const value = obj[key];
                  if (typeof value === "number") {
                    // obj[key] = value.toFixed(2);
                    obj[key] = this.addComaToNumber(obj[key]);
                  }
                }
              }
            });
            this.allData.map((item: any) => {
              for (let key in item) {
                if (this.priceKeys.includes(key)) {
                  item[key] = this.formatCurrency(item[key]);
                  // item[key] = item[key].replace(/,/g, "");
                  // let value: any = +item[key];
                  // item[key] = (value == 0 || value > 0) ? value?.toFixed(2) : value;
                  // item[key] = "$" + item[key];
                }
              }
              if (this.productType == 'Cushion') {
                item.size = `${item?.size} X ${item?.standardRollLength} LF`;
              }
            });
            if (type == "pdf") {
              this.contentType = type
              this.printPage(email);
            } else {
              this.contentType = 'excel'
              this.exportExcelFile(email);
            }
          } else {
            this.data = [];
          }
        }
      },
      error: (err: any) => {
        this.progressHide()
        this.spinnerLoading = false;
        this.showErrorMessage = true;
        this.errorMessage = err.error.errors[0].message;
      },
    });
  }

  printPage(isShare: boolean) {
    this.spinnerLoading = true;
    const data = this.allData;
    var headers: any = [];
    var rows = [];
    headers = [
      [
        "Style #",
        "Style Name",
        "Backing",
        "Size",
        "Start Date",
        "End Date",
        "Roll Price(Sq. Yd.)",
        "Cut Price(Sq. Yd.)",
        "Roll Price(Sq. Ft.)",
        "Cut Price(Sq. Ft.)",
      ],
    ];
    rows = data.map((item: any) => [
      item.style,
      item.styleName,
      item.backing,
      item.size,
      item.startDate,
      item.endDate,
      item.rollPriceSY,
      item.cutPriceSY,
      item.rollPriceSF,
      item.cutPriceSF,
    ]);
    if (this.productType == "Broadloom" /* || this.productType == "Hero Turf" */) {
      headers = [
        [
          "Style #",
          "Style Name",
          "Backing",
          "Size",
          "Start Date",
          "End Date",
          "Roll Price(Sq. Yd.)",
          "Cut Price(Sq. Yd.)",
          "Roll Price(Sq. Ft.)",
          "Cut Price(Sq. Ft.)",
        ],
      ];
      rows = data.map((item: any) => [
        item.style,
        item.styleName,
        item.backing,
        item.size,
        item.startDate,
        item.endDate,
        item.rollPriceSY,
        item.cutPriceSY,
        item.rollPriceSF,
        item.cutPriceSF,
      ]);
    }
    if (this.productType == "Cushion" || this.productType == "Broadloom Pad") {
      headers = [
        [
          "Style #",
          "Style Name",
          "Backing",
          "Density",
          "Thickness",
          "SY/Roll",
          "Size",
          "Start Date",
          "End Date",
          "Job Pack (< 25 rolls)Price/SY",
          "Warehouse (25-49 rolls)Price/SY",
          "Plant Direct (50+ rolls)Price/SY",
        ],
      ];
        rows = data.map((item: any) => [
        item.style,
        item.styleName,
        item.backing,
        item.density,
        item.thickness,
        item.SYPerRoll,
        item.size,
        item.startDate,
        item.endDate,
        item.jobPackPriceSY,
        item.warehousePriceSY,
        item.plantDirectPriceSY,
      ]);
    }
    if (this.productType == "Carpet Tile" /* || this.productType == "Hero Rubber" */) {
      headers = [
        [
          "Style #",
          "Style Name",
          "Backing",
          "Size",
          "SY/Carton",
          "Cartons/Pallet",
          "Start Date",
          "End Date",
          "Pallet Price (Sq.Yd.)",
          "Carton Price (Sq.Yd.)",
          "Pallet Price (Sq. Ft.)",
          "Carton Price (Sq. Ft.)",
        ],
      ];
      rows = data.map((item: any) => [
        item.style,
        item.styleName,
        item.backing,
        item.size,
        item.SYPerCarton,
        item.cartonsPerPallet,
        item.startDate,
        item.endDate,
        item.palletPriceSY,
        item.cartonPriceSY,
        item.palletPriceSF,
        item.cartonPriceSF,
      ]);
    }
    if (
      this.productType == "Resilient Sheet" ||
      this.productType == "Sheet Vinyl"
    ) {
      headers = [
        [
          "Style #",
          "Style Name",
          "Backing",
          "Size",
          "Gauge(Thickness)",
          "Start Date",
          "End Date",
          "Roll Price(Sq. Yd.)",
          "Cut Price(Sq. Yd.)",
          "Roll Price(Sq. Ft.)",
          "Cut Price(Sq. Ft.)",
        ],
      ];
      rows = data.map((item: any) => [
        item.style,
        item.styleName,
        item.backing,
        item.size,
        item.guage,
        item.startDate,
        item.endDate,
        item.rollPriceSY,
        item.cutPriceSY,
        item.rollPriceSF,
        item.cutPriceSF,
      ]);
    }
    if (
      this.productType == "Resilient LVT" ||
      this.productType == "Vinyl Tile" ||
      this.productType == "LVT"
    ) {
      headers = [
        [
          "Style #",
          "Style Name",
          "Backing",
          "Size",
          "Thickness",
          "Start Date",
          "End Date",
          "SF/Carton",
          "Cartons/Pallet",
          "Pallet Price (Sq.Ft.)",
          "Carton Price (Sq.Ft.)",
        ],
      ];
      rows = data.map((item: any) => [
        item.style,
        item.styleName,
        item.backing,
        item.size,
        item.thickness,
        item.startDate,
        item.endDate,
        item.SFPerCarton,
        item.cartonsPerPallet,
        item.palletPriceSF,
        item.cartonPriceSF,
      ]);
    }
    if (
      this.productType == "Wood" ||
      this.productType == "Laminate" ||
      this.productType == "Solid Wood" ||
      this.productType == "Engineered Wood"
    ) {
      headers = [
        [
          "Style #",
          "Style Name",
          "Backing",
          "Size",
          "Thickness",
          "Start Date",
          "End Date",
          "SF/Carton",
          "Cartons/Pallet",
          "Pallet Price (Sq.Ft.)",
          "Carton Price (Sq.Ft.)",
        ],
      ];
      rows = data.map((item: any) => [
        item.style,
        item.styleName,
        item.backing,
        item.size,
        item.thickness,
        item.startDate,
        item.endDate,
        item.SFPerCarton,
        item.cartonsPerPallet,
        item.palletPriceSF,
        item.cartonPriceSF,
      ]);
    }
    if (this.productType == "Ceramic Tile") {
      headers = [
        [
          "Style #",
          "Style Name",
          "Backing",
          "Application",
          "Size",
          "Start Date",
          "End Date",
          "SF/Carton",
          "Cartons/Pallet",
          "Pallet Price (Sq.Ft.)",
          "Carton Price (Sq.Ft.)",
          "Weight / Carton",
        ],
      ];
      rows = data.map((item: any) => [
        item.style,
        item.styleName,
        item.backing,
        item.application,
        item.size,
        item.startDate,
        item.endDate,
        item.SFPerCarton,
        item.cartonsPerPallet,
        item.palletPriceSF,
        item.cartonPriceSF,
        item.weightCarton,
      ]);
    }
    if (this.productType == "Adhesives") {
      headers = [
        [
          "Style #",
          "Style Name",
          "Part#",
          "Brand",
          "Size",
          "Start Date",
          "End Date",
          "Pails / Pallet",
          "UOM",
          "Price Each",
          "Price/ EA Pallet",
        ],
      ];
      rows = data.map((item: any) => [
        item.style,
        item.styleName,
        item.partNumber,
        item.brand,
        item.size,
        item.startDate,
        item.endDate,
        item.pailsPerPallet,
        item.uom,
        item.priceEach,
        item.pricePerEaPallet,
      ]);
    }
    if (this.productType == "Trims") {
      headers = [
        [
          "Style #",
          "Style Name",
          "Product Category",
          "Brand",
          "Length",
          "Start Date",
          "End Date",
          "Price Each",
          "UOM",
          "Cartons/Pallet",
          "Width",
        ],
      ];
      rows = data.map((item: any) => [
        item.style,
        item.styleName,
        item.productCategory,
        item.brand,
        item.length,
        item.startDate,
        item.endDate,
        item.priceEach,
        item.uom,
        item.cartonsPerPallet,
        item.width,
      ]);
    }
    if (this.productType == "Accessories") {
      headers = [
        [
          "Style #",
          "Style Name",
          "Part#",
          "Product Category",
          "Brand",
          "Start Date",
          "End Date",
          "Price Each",
          "UOM",
        ],
      ];
      rows = data.map((item: any) => [
        item.style,
        item.styleName,
        item.partNumber,
        item.productCategory,
        item.brand,
        item.startDate,
        item.endDate,
        item.priceEach,
        item.uom,
      ]);
    }
    if (this.productType == "Underlayment") {
      headers = [
        [
          "Style #",
          "Style Name",
          "Brand",
          "SF/Unit",
          "Units/Pallet",
          "Start Date",
          "End Date",
          "UOM",
          "Pallet Price (Sq.Ft.)",
          "Price Each",
        ],
      ];
      rows = data.map((item: any) => [
        item.style,
        item.styleName,
        item.brand,
        item.SFPerUnit,
        item.unitsPerPallet,
        item.startDate,
        item.endDate,
        item.uom,
        item.palletPriceSF,
        item.priceEach,
      ]);
    }
    if (this.productType == "All") {
      headers = [
        [
          "Style #",
          "Style Name",
          "Backing",
          "Size",
          "Start Date",
          "End Date",
          "Roll Price(Sq. Yd.)",
          "Cut Price(Sq. Yd.)",
          "Roll Price(Sq. Ft.)",
          "Cut Price(Sq. Ft.)",
        ],
      ];
      rows = data.map((item: any) => [
        item.style,
        item.styleName,
        item.backing,
        item.size,
        item.startDate,
        item.endDate,
        item.rollPriceSY,
        item.cutPriceSY,
        item.rollPriceSF,
        item.cutPriceSF,
      ]);
    }

    let logo = "/assets/images/logo-residential-dark.png";
    branndThumbUrl.map(
      (item: { brandId: any; brandName: any; brandLogoURl: any }) => {
        let itemBrandId = item?.brandId || "";
        if (this.priceSearchForm.value.sellingGroup == itemBrandId && item.brandLogoURl) {
          logo = item.brandLogoURl;
        }
      }
    );
    let footerText =
      "Prices subject to all taxes, excise fees and stewardship fees appropriate for your jurisdiction.";
    let footerText2 =
      "CALIFORNIA - CalRecycle has implemented a differential assessment structure for broadloom carpet and carpet tile shipped into California: Broadloom carpet = $1.05 Sy; Broadloom Carpet with =>10% Post Consumer Content = $0.96 Sy;"
    let footerText3 =
      "Carpet Tile = $1.49 Sy; Carpet Tile with => 10% Post Consumer Content = $1.40 Sy.";
    const doc = new jsPDF("l", "mm", "a4");
    doc.text(
      this.allData[0]?.accountName?.replaceAll(" ", "_") +
        "-" +
        "Price Chart for " +
        this.productType,
      20,
      25
    );
    doc.setFontSize(10);
    doc.text(
      "Currency:" + this.storageService.userInfo.priceLabel,
      doc.internal.pageSize.width - 50,
      50
    );
    doc.text(
      "Active Pricing as of " + this.currentDate + " EST",
      doc.internal.pageSize.width - 100,
      30
    );
    doc.addImage(logo, "PNG", 15, 35, 80, 15);
    doc.setFontSize(12);
    doc.setFontSize(12);
    const headerRow = headers[0];
    const startIndex = headerRow.findIndex((col: string) => col.includes("Start Date"));
    const columnStyles: any = {};
    for (let i = startIndex; i < headerRow.length; i++) {
      columnStyles[i] = { halign: "right" };
    }
    autoTable(doc, {
      head: headers,
      body: rows,
      startY: 60,
      styles: { fontSize: 8 },
      columnStyles: columnStyles, 
      didParseCell: (data) => {
        if (data.section === 'head' && data.column.index >= startIndex) {
          data.cell.styles.halign = 'right'; 
        }
      },
    });
    
    for (var i = 1; i <= doc.getNumberOfPages(); i++) {
      doc.setPage(i);
      doc.setFontSize(6);
      doc.text(footerText, 10, doc.internal.pageSize.height - 12);
      doc.text(footerText2, 10, doc.internal.pageSize.height - 10);
      doc.text(footerText3, 10, doc.internal.pageSize.height - 8);

      doc.setFontSize(8);
      doc.text(
        "Page " + i + " of " + doc.getNumberOfPages(),
        doc.internal.pageSize.width - 50,
        10
      );
    }
    if (!isShare) {
      let fileName =
       this.sanitizeFileName(this.allData[0].accountName) +
          "-" +
        "-" +
        this.productType +
        "-" +
        "Price-" +
        this.currentDate;
      doc.save(fileName);
        this.progressHide()
    }
    if (isShare) {
      let pdfContent = doc.output("datauristring");
      let pricePDFData = pdfContent.split(",");
      this.emailPayload.email_content.attachments = [
        {
          filename: "price-seach-details.pdf",
          content: pricePDFData[1],
          content_type: "application/pdf",
        },
      ];
      this.sendEmail();
    }
    this.spinnerLoading = false;
  }

  sendEmail() {
    this.progressShow('emailsend',this.contentType);
    this.productService.shareViaEmail(this.emailPayload).subscribe(
      (res: any) => {
        this.showSuccessMsg(res?.message);
        this.alertType = res?.success == true ? "success" : "danger";
      },
      (err: any) => {
        if (err.status == 200) {
          this.alertType = "success";
          this.showSuccessMsg(err?.error?.text);
        } else {
          this.showEmailMessage = "Error while sending email";
          this.alertType = "danger";
        }
      }
    );
  }

  showSuccessMsg(msg: any) {
    this.progressHide();
    this.hideConfirmationModal();
    this.showEmailMessage = msg;
    setTimeout(() => {
      this.showEmailMessage = "";
    }, 3000);
  }

  setColumn(productType: any) {
    this.columns1 = columnHeader.Broadloom;
    if (productType == "Broadloom" /* || productType == "Hero Turf" */) {
      this.columns1 = columnHeader.Broadloom;
    }
    if (productType == "Cushion" || productType == "Broadloom Pad") {
      this.columns1 = columnHeader.Cushion;
    }
    if (productType == "Carpet Tile" /* || productType == "Hero Rubber" */) {
      this.columns1 = columnHeader.CarpetTile;
    }
    if (productType == "Resilient Sheet" || productType == "Sheet Vinyl") {
      this.columns1 = columnHeader.ResilientSheet;
    }
    if (productType == "Resilient LVT" || productType == "Vinyl Tile" || productType == "LVT") {
      this.columns1 = columnHeader.ResilientLVT;
    }
    if (
      productType == "Wood" ||
      productType == "Laminate" ||
      productType == "Solid Wood" ||
      productType == "Engineered Wood"
    ) {
      this.columns1 = columnHeader.Wood;
    }
    if (productType == "Ceramic Tile") {
      this.columns1 = columnHeader.CeramicTile;
    }
    if (productType == "Adhesives") {
      this.columns1 = columnHeader.Adhesives;
    }
    if (productType == "Trims") {
      this.columns1 = columnHeader.Trims;
    }
    if (productType == "Accessories") {
      this.columns1 = columnHeader.Accessories;
    }
    if (productType == "Underlayment") {
      this.columns1 = columnHeader.Underlayment;
    }
    let alignRight = false;
    this.columns1 = this.columns1.map((item: any) => {
      if (item.title.includes("USD")) {
        item.title = item.title.replace(
          "USD",
          this.storageService.userPriceLabel
        );
      }
      if (item?.key === "startDate" || alignRight) {
        alignRight = true;
        item.cssClass = {
          ...item.cssClass,
          name: `${item.cssClass?.name || ""} align-right`.trim(),
        };
      }
      if (item?.key === "startDate" || item?.key === "endDate") {
        item.cssClass = {
          ...item.cssClass,
          name: `${item.cssClass?.name || ""} sorting-arrow date-width align-right`.trim(),
        };
      }
      return item;
    });
  }
  setHeader(productType: any) {
    this.headers = header.Broadloom;
    if (productType == "Broadloom" /* || productType == "Hero Turf" */) {
      this.headers = header.Broadloom;
    }
    if (productType == "Cushion" || productType == "Broadloom Pad") {
      this.headers = header.Cushion;
    }
    if (productType == "Carpet Tile" /* || productType == "Hero Rubber" */) {
      this.headers = header.CarpetTile;
    }
    if (productType == "Resilient Sheet" || productType == "Sheet Vinyl") {
      this.headers = header.ResilientSheet;
    }
    if (productType == "Resilient LVT" || productType == "Vinyl Tile" || productType == "LVT") {
      this.headers = header.ResilientLVT;
    }
    if (
      productType == "Wood" ||
      productType == "Laminate" ||
      productType == "Solid Wood" ||
      productType == "Engineered Wood"
    ) {
      this.headers = header.Wood;
    }
    if (productType == "Ceramic Tile") {
      this.headers = header.CeramicTile;
    }
    if (productType == "Adhesives") {
      this.headers = header.Adhesives;
    }
    if (productType == "Trims") {
      this.headers = header.Trims;
    }
    if (productType == "Accessories") {
      this.headers = header.Accessories;
    }
    if (productType == "Underlayment") {
      this.headers = header.Underlayment;
    }
  }
  exportExcelFile(isShare: boolean, payload: any = "") {
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
    this.convertImageToBase64(logoLink, isShare, payload);
  }
  exportExcel(isShare: boolean, payload: any = "", logoBase64: any) {
    const workbook = new Workbook();
    const logo: any = workbook.addImage({
      base64: logoBase64,
      extension: "png",
    });
    const filename =
       this.sanitizeFileName(this.allData[0].accountName) +
      "-" +
      this.productType +
      "-" +
      "Price-" +
      this.currentDate.replaceAll(":", "_");
    const worksheet = workbook.addWorksheet(filename);

    worksheet.getRow(1).height;
    worksheet.getRow(3).height;
    worksheet.addImage(logo, "A1:C3");
    worksheet.mergeCells("A1:C3");
    worksheet.getRow(1).height;
    worksheet.getRow(3).height;
    worksheet.addRow([]);
    worksheet.addRow([]);
    let hdr1 =
      "Price List for Product Type:  " +
      this.productType +
      " for Account- " +
      this.allData[0].accountName;
    let hdr2 = "Account Number:   " + this.allData[0].accountNumber;
    let hdr3 = "Active Pricing as of: " + this.currentDate + "EST";
    let hdr4 = "Currency:" + this.storageService.userInfo.priceLabel;
    let hdr5 =
      "Prices subject to all taxes, excise fees and stewardship fees appropriate for your jurisdiction.";
    let hdr6 =
      "CALIFORNIA - CalRecycle has implemented a differential assessment structure for broadloom carpet and carpet tile shipped into California: Broadloom carpet = $1.05 Sy; Broadloom Carpet with =>10% Post Consumer Content = $0.96 Sy;"
    let hdr7 =
      "Carpet Tile = $1.49 Sy; Carpet Tile with => 10% Post Consumer Content = $1.40 Sy.";
    worksheet.addRow([hdr1]);
    worksheet.addRow([hdr2]);
    worksheet.addRow([hdr3]);
    worksheet.addRow([hdr4]);
    worksheet.addRow([hdr5]);
    worksheet.addRow([hdr6]);
    worksheet.addRow([hdr7]);
    worksheet.addRow([]);
    const headerRow = worksheet.addRow(Object.values(this.headers));
    headerRow.font = { bold: true };
    const columnMaxLengths: number[] = Object.keys(this.headers).map((key) => {
      const columnValues = this.data.map((d: any) => {
        if (d[key] !== null && d[key] !== undefined && d[key] !== "") {
          if (key.length > d[key].toString().length) {
            return key.length + 5;
          } else {
            return d[key].toString().length + 5;
          }
        } else {
          return key.length + 5;
        }
      });
      return Math.max(...columnValues);
    });

    Object.values(this.headers).forEach((val: any, index) => {
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

    this.allData.forEach((d: any) => {
      let rowData = [];
      for (let key in this.headers) {
        rowData.push(d[key] !== null && d[key] !== undefined ? d[key] : "N/A");
      }
      worksheet.addRow(rowData);
    });
    const info: any = workbook.xlsx.writeBuffer();
    info.then((data: any) => {
      const blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      let a = document.createElement("a");
      if (!isShare) {
        var url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = String(filename + ".xlsx");
        a.click();
        a.remove();
        this.progressHide();
      } else {
        let reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = () => {
          let excelContent: any = reader.result || "";
          let priceExcelData = excelContent.split(",");
          this.emailPayload.email_content.attachments = [
            {
              filename: "price-seach-details.xlsx",
              content: priceExcelData[1],
              content_type:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            },
          ];
          this.sendEmail();
        };
      }
    });
    this.spinnerLoading = false;
  }

  openShareEmailModal() {
    if (this.downloadPayload.productCategory == "All") {
      this.showEmailMessage =
        "To enable sharing, please select a product type instead of choosing All.";
      this.alertType = "danger";
      setTimeout(() => {
        this.showEmailMessage = "";
      }, 3000);
      return;
    }
    this.openConfirmationModal({
      title: "Share via email",
      content: "Ramya Dhanapalan(rajeshmulti00@gmail.com)",
      primaryActionLabel: "CONTINUE",
      secondaryActionLabel: "CANCEL",
      pdfContent: "",
      excelBlob: "",
      onPrimaryAction: (payload: any, type: string) => {
        this.emailPayload = payload;
        this.downloadAllPrices(type, true);
      },
      onSecondaryAction: () => this.hideConfirmationModal(),
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
      ShareEmailModalComponent,
      Object.assign(initialState, {
        id: "confirmationModal",
        class: "modal-lg modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }
  hideConfirmationModal() {
    this.modalService.hide("confirmationModal");
  }
  convertImageToBase64(imgUrl: any, isShare: boolean, payload: any = "") {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx: any = canvas.getContext("2d");
      canvas.height = image.naturalHeight;
      canvas.width = image.naturalWidth;
      ctx.drawImage(image, 0, 0);
      const dataUrl = canvas.toDataURL();
      this.exportExcel(isShare, payload, dataUrl);
    };
    image.src = imgUrl;
  }
  pageIndex: number = 1;
  tableItemsSize: number = 50;
  startValue: number =
    this.pageIndex * this.tableItemsSize - (this.tableItemsSize - 1);
  lastValue: number = this.startValue + this.tableItemsSize - 1;

  onTableDataChange(event: any) {
    this.pageIndex = event;
    if (0 >= event || event == null) {
      this.pageIndex = 1;
    }
    this.downloadPayload.currentPage = this.pageIndex;
    this.onSearch(this.downloadPayload);
  }

  onRowPerPageChange(e: any) {
    this.downloadPayload = {
      ...this.downloadPayload,
      recordsPerPage: e?.target?.value,
    };
    this.tableItemsSize = e?.target?.value;
    this.onSearch(this.downloadPayload);
  }

  onCollectionList(accountNumber: string) {
    this.apiService
      .getCartEntries(accountNumber, this.userService.getUserEmail().toLowerCase())
      .subscribe({
        next: (res: any) => {
          this.collectionList = res;
        },
        error: (err: any) => {
          this.collectionList = [];
        },
      });
  }
  getPricingBrands() {
    const categoryName = this.priceSearchForm.value.productCategory;
    let url = API_CONSTANTS.getPricingBrands + categoryName;
    url = url.replace("{userId}", this.userService.getUserEmail().toLowerCase());
    this.apiService.get(url).subscribe((res: any) => {
      this.sellingGroup = res?.body;
    });
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
        selectedAddress:
          this.addressData?.length > 0 &&
          this.priceSearchForm.value.shippingAddress != null
            ? this.addressData[0]
            : null,
        isPriceSearch:true,
      },
    };
    this.modalRef = this.modalService.show(
      ChangeShippingAddressComponent,
      Object.assign(initialState, {
        id: "ChangeShippingAddressComponent",
        class: "modal-xl modal-dialog-centered shipping-address",
        backdrop: "static",
        keyboard: false,
      })
    );
    this.modalRef.content.messageEvent.subscribe((data: any) => {
      this.addressData = [...[], ...[data]];
      this.priceSearchForm.controls["shippingAddress"].setValue(data?.id || "");
    });
  }
  loadShippingAddressForDefaultValue() {
    this.isLoading = true;
    this.productAddressService
      .getDefaultAddress(this.userService.getUserEmail().toLowerCase(), 0, "")
      .subscribe((res) => {
        const data = res.body?.addresses || [];
        if (data.length > 0) {
          this.addressData = [...[], ...[data[0]]];
          this.priceSearchForm.controls['shippingAddress'].setValue(this.uid || data[0].id || '');
          this.priceSearchForm.controls['shippingAddress'].enable();
          this.isLoading= false
        }
      });
  }
  
   dateConvert(d: any) {
    return new Date(d).toISOString().slice(0, 10);
  }

  changeDateFormat(val: any) {
    if (!(val instanceof Date)) {
      try {
        val = new Date(val);
      } catch (error) {
        return "";
      }
    }
    const month = (val.getMonth() + 1).toString().padStart(2, "0"); // Month is zero-based
    const day = val.getDate().toString().padStart(2, "0");
    const year = val.getFullYear();
    return `${month}-${day}-${year}`;
  }
  progressShow(msgType: any, exportType?: string) {
    let messageConstants = MESSAGE_CONSTANTS?.pricing?.search_download_pricing?.[msgType];
    if (!messageConstants) {
      messageConstants = MESSAGE_CONSTANTS?.pricing?.[msgType];
    }
    const modalMessages = { ...messageConstants };
    if (exportType) {
      Object.keys(modalMessages).forEach(key => {
        if (typeof modalMessages[key] === 'string') {
          modalMessages[key] = modalMessages[key].replace('{type}', exportType.toUpperCase());
        }
      });
    }
    this.openProgressModal({
      modalHeaderText: modalMessages.headerText,
      progressText: modalMessages.bodyText,
      progressBarText: modalMessages.barText
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
}
