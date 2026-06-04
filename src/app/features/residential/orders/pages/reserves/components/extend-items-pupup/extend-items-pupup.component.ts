import { Component, OnInit, TemplateRef } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
    selector: 'extend-items-pupup',
    templateUrl: './extend-items-pupup.component.html',
    styleUrls: ['./extend-items-pupup.component.scss'],
    standalone: false
})
export class ExtendItemsPupupComponent implements OnInit {


  modalRef?: BsModalRef;

  constructor(private modalService: BsModalService, public bsModalRef: BsModalRef) { }

  ngOnInit(): void {
  }

  onHideModal() {
    this.bsModalRef.hide()
  }

  extendReservedItems() {
    this.bsModalRef.content?.abc();  
  }
}
