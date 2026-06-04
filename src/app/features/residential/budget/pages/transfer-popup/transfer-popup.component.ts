import { Component, OnInit, TemplateRef } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
@Component({
    selector: 'app-transfer-popup',
    templateUrl: './transfer-popup.component.html',
    styleUrls: ['./transfer-popup.component.scss'],
    standalone: false
})
export class TransferPopupComponent implements OnInit {

  modalRef?: BsModalRef;
  data:any;
  onClose: Function = () => {};
  constructor(private modalService: BsModalService, public bsModalRef: BsModalRef) { }

  ngOnInit(): void {
    this.data=this.modalService.config.initialState;
  }

  onHideModal() {
    this.onClose();
    this.bsModalRef.hide();
  }

}