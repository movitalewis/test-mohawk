import { Component, OnInit } from "@angular/core";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { OrderService } from "src/app/features/residential/orders/services/order.service";

@Component({
    selector: "app-quanity-change-popup",
    templateUrl: "./quanity-change-popup.component.html",
    styleUrls: ["./quanity-change-popup.component.scss"],
    standalone: false
})
export class QuanityChangePopupComponent implements OnInit {
  modalRef?: BsModalRef;
  selectedEntry:any;
  enteredQuantity:any;
  onSecondaryAction: Function = () => {};
  onPrimaryAction: Function = (payload: any) => {};
  constructor(
    public modalService: BsModalService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.selectedEntry=this.modalService.config.initialState;
    
    
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
    if (value.includes(".")) {
      let val = value.split(".");
      val = val[val.length - 1].split("");
      if (val.length > 1) {
        return false;
      }
    }
    return true;
  }
  submit(){
    this.modalService?.hide('6');
    this.onPrimaryAction(this.enteredQuantity)
  }
}
