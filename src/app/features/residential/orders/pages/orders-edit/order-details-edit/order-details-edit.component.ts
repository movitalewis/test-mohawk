import { Component, OnInit } from "@angular/core";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import { Columns, Config, DefaultConfig } from "ngx-easy-table";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { Router } from "@angular/router";
import { CancelOrderComponent } from "../components/cancel-order/cancel-order.component";
import { RequestPriceComponent } from "../components/request-price/request-price.component";

@Component({
    selector: "app-order-details-edit",
    templateUrl: "./order-details-edit.component.html",
    styleUrls: ["./order-details-edit.component.scss"],
    standalone: false
})
export class OrderDetailsEditComponent implements OnInit {
  isCollapsed = true;

  breadcrumbItems: BreadcrumbItems = [
    {
      name: "Home",
      path: "/residential",
      active: false,
    },
    {
      name: "Orders",
      path: " ",
      active: false,
    },
    {
      name: "Orders Number - 025632",
      path: "/",
      active: true,
    },
  ];

  constructor(private router: Router, private modalService: BsModalService) {}

  public configuration!: Config;
  public columns!: Columns[];

  public data = [
    {
      orderedQTY: "143’ 00” LF",
      shippedQTY: ".00",
      answeredQTY: "143’ 00” LF",
      dyelot: "601271",
      roll: "16772311",
    },
  ];

  bto() {
    this.router.navigate(["residential/orders"]);
  }

  ngOnInit(): void {
    this.configuration = { ...DefaultConfig };
    this.configuration.checkboxes = false;
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;
    this.columns = [
      { key: "orderedQTY", title: "Ordered QTY" },
      { key: "shippedQTY", title: "Shipped QTY" },
      { key: "answeredQTY", title: "Answered QTY" },
      { key: "dyelot", title: "Dyelot" },
      { key: "roll", title: "Roll #" },
    ];
  }

  bsModalRef?: BsModalRef;

  cancelOrderModal() {
    const initialState: ModalOptions = {
      initialState: {
        // Data to  popup
      },
    };
    this.bsModalRef = this.modalService.show(
      CancelOrderComponent,
      Object.assign(initialState, {
        class: "modal-mg modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }

  priceRequestModal() {
    const initialState: ModalOptions = {
      initialState: {
        // Data to  popup
      },
    };
    this.bsModalRef = this.modalService.show(
      RequestPriceComponent,
      Object.assign(initialState, {
        class: "modal-md modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }
}
