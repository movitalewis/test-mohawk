import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
    selector: 'app-xchange-image-view-light-box',
    templateUrl: './xchange-image-view-light-box.component.html',
    styleUrls: ['./xchange-image-view-light-box.component.scss'],
    standalone: false
})
export class XchangeImageViewLightBoxComponent implements OnInit {

  path?: string;

  constructor(public bsModalRef: BsModalRef) { }

  ngOnInit(): void {
  }

  closeModal(){
    this.bsModalRef.hide();
  }

}
