import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";

@Component({
    selector: "app-cancel-order",
    templateUrl: "./cancel-order.component.html",
    styleUrls: ["./cancel-order.component.scss"],
    standalone: false
})
export class CancelOrderComponent implements OnInit {
  modalRef?: BsModalRef;
  constructor(
    private modalService: BsModalService,
    public bsModalRef: BsModalRef
  ) {}

  ngOnInit(): void {}
}
