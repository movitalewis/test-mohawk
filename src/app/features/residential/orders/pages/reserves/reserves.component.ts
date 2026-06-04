import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import {
  API,
  APIDefinition,
  Columns,
  Config,
  DefaultConfig,
} from "ngx-easy-table";
import { OrderService } from "../../services/order.service";
import { ActivatedRoute, Router } from "@angular/router";
import { ProductService } from "../../../products/pages/services/product.service";
@Component({
    selector: "app-reserves",
    templateUrl: "./reserves.component.html",
    styleUrls: ["./reserves.component.scss"],
    standalone: false
})
export class ReservesComponent implements OnInit, AfterViewInit {
  @ViewChild("table", { static: true }) table!: APIDefinition;
  breadcrumbItems: BreadcrumbItems = [
    {
      name: "Home",
      path: "/residential",
      active: false,
    },
    {
      name: "Reserves",
      path: "/",
      active: true,
    },
  ];

  public configuration!: Config;
  public columnss!: Columns[];
  public page: any = [];
  public reservesData: any = [];
  searchBy = null;
  public showErrorMessage = false;
  public errorMessage = "";
  public showSuccessMessage = false;
  public successMessage = "";
  sortDataBy = "CODE";
  sortBy = "desc";
  searchByData = [
    { value: "Reserve #", key: "code" },
    { value: "Reserve Name", key: "reserveName" },
    { value: "Style Name", key: "styleName" },
    { value: "Style #", key: "styleNumber" },
    { value: "Color Name", key: "colorName" },
    { value: "Color #", key: "colorNumber" },
  ];
  sortByData = [
    { value: "Reserve Number", key: "CODE" },
    { value: "Reserve Name", key: "NAME" },
    { value: " User Name / Submitted by ", key: "USER" },
  ];
  sortData = [
    { value: "Ascending", key: "asc" },
    { value: "Descending", key: "desc" },
  ];
  searchString: string = "";
  isGlobalSearchEnabled: boolean = false;
  pageIndex: number = 1;
  tableItemsSize: number = 10;
  startValue: number =
    this.pageIndex * this.tableItemsSize - (this.tableItemsSize - 1);
  lastValue: number = this.startValue + this.tableItemsSize - 1;
  totalReservesLength: number = 0;
  payload: any = {
    code: "",
    reserveName: "",
    styleName: "",
    styleNumber: "",
    colorName: "",
    colorNumber: "",
    sortOrderBy: "CODE",
  };
  spinnerLoading = false;
  searchFlag: boolean = false;

  constructor(
    private orderService: OrderService,
    private router: Router,
    private route: ActivatedRoute,
        private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.errorMessage = "";
    this.successMessage = "";
    const queryParams: any = this.route.snapshot.queryParams;
    if (this.router.url.includes("error")) {
      this.showErrorMessage = true;
     
      this.errorMessage = this.route.snapshot.queryParams["error"];
    }
    if (this.router.url.includes("message")) {
      this.showSuccessMessage = true;
    
      this.successMessage = this.route.snapshot.queryParams["message"];
    }

    this.initTable();
    this.pageIndex = 1;
    this.getReserveDetails(0);
    this.router.navigate([], { relativeTo: this.route, queryParams: {} })
  }

  getReserveDetails(pageIndex: number) {
    // let payload = {
    //   searchText: this.searchDefaultValue,
    // };
    for (let key in this.payload) {
      if (key === this.searchBy) {
        this.payload[key] = this.searchString;
      } else {
        this.payload[key] = "";
      }
    }
    this.payload.sortOrderBy = this.sortDataBy;
    // this.spinnerLoading = true;
    this.productService.progressShow('getReservesList')
    this.orderService
      .getReserveDetails(
        this.payload,
        pageIndex,
        this.tableItemsSize,
        this.sortBy
      )
      .subscribe(
        (res: any) => {
          this.productService.progressHide();
          if (this.searchFlag) {
            this.pageIndex = pageIndex;
          }
          this.spinnerLoading = false;
          this.reservesData = res.body?.reserve || [];
          this.totalReservesLength = res.body?.totalResults || 0;
        },
        () => {
          this.productService.progressHide();
          this.spinnerLoading = false;
        }
      );
  }

  initTable() {
    this.configuration = { ...DefaultConfig };
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;
    this.columnss = [
      {
        key: "code",
        title: "Reserve #",
        cssClass: { includeHeader: true, name: "sorting-arrow" },
        orderEventOnly: true
      },
      {
        key: "projectName",
        title: "Reserve Name",
        cssClass: { includeHeader: true, name: "sorting-arrow" },
        orderEventOnly: true
      },
      {
        key: "submittedBy",
        title: "Reserved By",
        cssClass: { includeHeader: true, name: "sorting-arrow" },
        orderEventOnly: true
      },
    ];
  }

  ngAfterViewInit() {
    this.initTable();
    //this.getReserveDetails();
  }
  onChange(event: any): void {
    this.table.apiEvent({
      type: API.onGlobalSearch,
      value: (event.target as HTMLInputElement).value,
    });
  }

  onTableDataChange(event: any) {
    if (!this.searchFlag) {
      this.searchBy = null;
      this.searchString = "";
    }
    this.pageIndex = event;
    this.getReserveDetails(this.pageIndex-1);
  }
  navigateToReserveDetails(row: any) {
    this.router.navigateByUrl(
      `/residential/orders/reserves-details/${row?.code}`
    );
  }
  
  sortingByColumns(e: any) {
    if (e.event == "onOrder") {
    this.sortDataBy = (e?.value?.key =="projectName" ? "NAME": (e?.value?.key =="submittedBy" ? "USER": (e?.value?.key =="code" ? "CODE": "")));
    this.sortBy = e?.value?.order == undefined ? "desc" : e?.value?.order;
    this.pageIndex = 1;
    this.getReserveDetails(0);
    this.columnss.map((item: any) => {
      if (item.key === e?.value?.key && item.hasOwnProperty("cssClass")) {
        if (e?.value?.order == "asc") {
          item.cssClass = {
            ...{},
            ...{ includeHeader: true, name: "sorting-arrow-active" },
          };
        } else if (e?.value?.order == "desc") {
          item.cssClass = {
            ...{},
            ...{ includeHeader: true, name: "sorting-arrow-down-icon" },
          };
        }
      } else if (item.hasOwnProperty("cssClass")) {
        item.cssClass = {
          ...{},
          ...{ includeHeader: true, name: "sorting-arrow" },
        };
      }
    });
    }
  }
}
