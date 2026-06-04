import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { OrderService } from "../../../../services/order.service";

@Component({
    selector: "extend-popup",
    templateUrl: "./extend-popup.component.html",
    styleUrls: ["./extend-popup.component.scss"],
    standalone: false
})
export class ExtendPopupComponent implements OnInit {
  modalRef?: BsModalRef;
  id: any;
  entries: any;
  ExtendCheck: any;
  reponseMessage: any = "";
  responseStatus: any = "";
  refreshPage = false;
  onCloseAction: Function = () => {};

  constructor(
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    // this.extendReserve();
  }
  onHideModal() {
    this.onCloseAction();
    this.modalService.hide();
    
    // if (this.refreshPage !== true) {
    //   this.modalService.hide();
    // } else {
    //   this.modalService.hide();
    //   window.location.reload();
    // }
  }
  extendReserve() {
   
    // this.orderService
    //   .reserveExtend(this.id,this.entries)
    //   .subscribe((res: any) => {
    //     this.ExtendCheck = res.body;
    //     this.reponseMessage=this.test.message
    //   }),
    //   (err: any) => {};
  }
}
