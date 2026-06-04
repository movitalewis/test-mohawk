import { Component, OnInit } from "@angular/core";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
@Component({
    selector: "app-request-price",
    templateUrl: "./request-price.component.html",
    styleUrls: ["./request-price.component.scss"],
    standalone: false
})
export class RequestPriceComponent implements OnInit {
  modalRef?: BsModalRef;
  constructor(
    private modalService: BsModalService,
    public bsModalRef: BsModalRef
  ) {}

  ngOnInit(): void {}
}
