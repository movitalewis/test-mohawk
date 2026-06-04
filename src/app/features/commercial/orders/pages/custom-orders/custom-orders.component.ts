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
    selector: 'xchange-custom-orders',
    templateUrl: './custom-orders.component.html',
    styleUrl: './custom-orders.component.scss',
    standalone: false
})
export class CustomOrdersComponent implements OnInit {
  public configuration!: Config;
  public columns!: Columns[];
  public successMessage = "";
  alertType: string = "success";
  showAlertMessage:boolean = false;
  breadcrumbItems: BreadcrumbItems = [
    {
      name: "Home",
      path: "/commercial",
      active: false,
    },
    {
      name: "Custom Orders",
      path: "/",
      active: true,
    },
  ];
  orderData:any = [];
  pageIndex: number = 1;
  tableItemsSize: number = 10;
  startValue: number =
    this.pageIndex * this.tableItemsSize - (this.tableItemsSize - 1);
  lastValue: number = this.startValue + this.tableItemsSize - 1;
  totalResults: number = 0;

  constructor(
      private orderService: OrderService,
      private router: Router,
      private route: ActivatedRoute,
      private productService: ProductService
    
  ) {}

  ngOnInit(): void {
    this.configuration = { ...DefaultConfig };
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;
    this.columns = [
       {
        key: "hybrisOrderNumber",
        title: "Order #",
        cssClass: { includeHeader: true, name: "sorting-arrow" },

      },
      {
        key: "camsOrderNumber",
        title: "Cams #",
        cssClass: { includeHeader: true, name: "sorting-arrow" },

      },
     
      {
        key: "status",
        title: "Status Description",
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      {
        key: "status",
        title: "Action",
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
    ];

    this.getCustomOrders(0);

  }

  getCustomOrders(pageIndex: number) {
    this.productService.progressShow('getCustomOrdersList','getCustomOrdersList');
    this.orderService.getCustomOrderHistory(this.tableItemsSize, pageIndex).subscribe((res: any) => {
      this.productService.progressHide('getCustomOrdersList');
      this.orderData = res?.body?.customOrders || [];
      this.totalResults = res.body?.totalResults || 0;
    });
  }

   onTableDataChange(event: any) {
    this.pageIndex = event;
    if (0 == event) {
      this.pageIndex = 1;
    }
    this.startValue =
      this.pageIndex * this.tableItemsSize - (this.tableItemsSize - 1);
    this.lastValue = this.startValue + this.tableItemsSize - 1;
    this.lastValue =
      this.lastValue > this.totalResults
        ? this.totalResults
        : this.lastValue;
    this.getCustomOrders(this.pageIndex-1);
  }

  retryCustomOrder(data:any){
    this.successMessage = "";
    this.productService.progressShow('retryCustomOrder','retryCustomOrder');
    this.orderService.reprocessCustomOrder(data?.camsOrderNumber, data?.status).subscribe((res: any) => {
      this.getCustomOrders(this.pageIndex-1);
      this.showAlert("Custom order reprocessed successfully.", "success");
    }, error => {
      let errorMessage = error?.error || "Failed to reprocess custom order.";
      this.showAlert(errorMessage, "danger");
    });
  }

  showAlert(message: string, type: string) {
    this.productService.progressHide('retryCustomOrder');
    this.alertType = type;
    this.successMessage = message;
    this.showAlertMessage = true;
    setTimeout(() => {
        this.showAlertMessage = false;
      }, 4000);
  }
}
