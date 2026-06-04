import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

@Component({
    selector: "app-post-modification-share-via-email-lightbox",
    templateUrl: "./post-modification-share-via-email-lightbox.component.html",
    styleUrls: ["./post-modification-share-via-email-lightbox.component.scss"],
    standalone: false
})
export class PostModificationShareViaEmailLightboxComponent implements OnInit {
  modalRef?: BsModalRef;
  toemailForm!: FormGroup;
  constructor(
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private fb: FormBuilder
  ) {}

  shareViaEmailModal(template1: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template1, {
      id: 1,
      class: "modal-lg modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }

  ngOnInit(): void {
    this.toemailForm = this.fb.group({
      senderEmail: [
        "",
        [
          Validators.required,
          Validators.pattern(
            /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          ),
        ],
      ],
      subject: ["", [Validators.required]],
    });
  }

  onHideModal() {
    this.bsModalRef.hide();
  }
  avoidSpace(event: any) {
    if (event.keyCode === 32) {
      return false;
    } else {
      return undefined;
    }
  }
}
