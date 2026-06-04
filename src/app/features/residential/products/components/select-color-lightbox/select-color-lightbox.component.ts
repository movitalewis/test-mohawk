import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { Config, Columns, DefaultConfig } from "ngx-easy-table";

@Component({
    selector: "app-select-color-lightbox",
    templateUrl: "./select-color-lightbox.component.html",
    styleUrls: ["./select-color-lightbox.component.scss"],
    standalone: false
})
export class SelectColorLightboxComponent implements OnInit {
  modalRef?: BsModalRef;
  constructor(
    private modalService: BsModalService,
    public bsModalRef: BsModalRef
  ) {}

  selectColorModal(template1: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template1, {
      id: 1,
      class: "modal-md modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }

  ngOnInit(): void {}

  onHideModal() {
    this.bsModalRef.hide();
  }
}
