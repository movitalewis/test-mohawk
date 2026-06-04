import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";

@Component({
    selector: "xchange-place-reserve-popup",
    templateUrl: "./xchange-place-reserve-popup.component.html",
    styleUrls: ["./xchange-place-reserve-popup.component.scss"],
    standalone: false
})
export class XchangePlaceReservePopupComponent implements OnInit {
  modalRef!: BsModalRef;

  constructor(private modalService: BsModalService) {}

  openModal1(template1: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template1, {
      id: 1,
      class: "modal-xl modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }

  ngOnInit(): void {}
}
