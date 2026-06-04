import { Component, OnInit } from "@angular/core";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { OrderService } from "../../services/order.service";

@Component({
    selector: "app-order-details-cancel-hold-modal",
    templateUrl: "./order-details-cancel-hold-modal.component.html",
    styleUrls: ["./order-details-cancel-hold-modal.component.scss"],
    standalone: false
})
export class OrderDetailsCancelHoldModalComponent implements OnInit {
  constructor(
    public modalService: BsModalService,
    private orderService: OrderService
  ) {}

  onSecondaryAction: Function = () => {};
  onPrimaryAction: Function = (payload: any) => {};
  selectedData: any;
  selectedReason: any;
  itemList: any = [];
  modalRef?: BsModalRef;
  cancellationFee: any;
  type: any;
  placeHolder: any;
  initialState: any;
  ngOnInit(): void {
    let initialState: any = this.modalService.config.initialState;
    this.type = initialState?.type;
    this.selectedData = initialState?.selectedData;
    this.initialState = this.modalService.config.initialState;
    this.selectedReason = this.initialState?.selectedReason;
    this.getItemList(this.type);
    if (
      this.type === "HOLD_REASON_CODE_LINE" ||
      this.type === "HOLD_REASON_CODE_HEADER"
    ) {
      this.placeHolder = "Hold Reason";
    } else {
      this.placeHolder = "Cancellation Reason";
    }
  }
  getItemList(type: any) {
    if (type) {
      this.orderService.getCancelList(type).subscribe((res: any) => {
        this.itemList = Object.entries(res.body || {}).map(([key, value]) => ({
          label: key + " - " + value,
          value: key,
        }));
      });
    }
  }
  submit() {
    if (
      this.type == "HOLD_REASON_CODE_LINE" ||
      this.type == "HOLD_REASON_CODE_HEADER"
    ) {
      this.holdOrder();
    } else {
      this.cancelOrder();
    }
  }
  holdOrder() {
    let payload: any = {
      orderCode: this.initialState.orderDetails.orderCode,
      holdCode: this.selectedReason,
      holdCodeAdded: true,
      lineItems: [],
      type: "hold",
    };
    if (this.selectedData) {
      payload = {
        orderCode: this.initialState.orderDetails.orderCode,
        lineItems: [
          {
            lineNumber: this.selectedData.entryNumber,
            holdCode: this.selectedReason,
            holdCodeAdded: true,
          },
        ],
        type: "hold",
      };
      this.onPrimaryAction(payload);
    } else {
      this.onPrimaryAction(payload);
    }

    this.modalService.hide("1");
  }

  cancelOrder() {
    const selectedItem = this.itemList.find((item: any) => {
      return item?.value === this.selectedReason;
    });
    let payload: any = {
      orderCode: this.initialState.orderDetails.orderCode,
      cancelFeeRequired: true,
      cancelCode: this.selectedReason,
      cancelDescription: selectedItem ? selectedItem?.label : "",
      type: "cancel",
    };
    if (this.selectedData) {
      payload["entries"] = this.selectedData.entryNumber;

      this.onPrimaryAction(payload);
    } else {
      this.onPrimaryAction(payload);
    }

    this.modalService.hide("1");
  }
}
