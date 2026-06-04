import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { Columns, Config, DefaultConfig } from "ngx-easy-table";

@Component({
    selector: "app-contact-your-credit-analyst",
    templateUrl: "./contact-your-credit-analyst.component.html",
    styleUrls: ["./contact-your-credit-analyst.component.scss"],
    standalone: false
})
export class ContactYourCreditAnalystComponent implements OnInit {
  modalRef?: BsModalRef;
  constructor(private modalService: BsModalService) {}

  openModal(template: TemplateRef<any>) {
    // this.modalRef = this.modalService.show(template);
    this.modalRef = this.modalService.show(template, {
      id: 1,
      class: "modal-lg modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }

  ngOnInit(): void {}
}
