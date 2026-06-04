import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { StorageService } from 'src/app/features/http-services/storage.service';


@Component({
    selector: 'app-builder-details',
    templateUrl: './builder-details.component.html',
    styleUrls: ['./builder-details.component.scss'],
    standalone: false
})
export class BuilderDetailsComponent implements OnInit {
  modalRef!: BsModalRef;
  data: any
  builderInfo:any;
  fromPage:any;
  customerFlag: boolean = false;
  constructor(public bsModalRef: BsModalRef,
    public modalService: BsModalService,
    private getStorageService: StorageService,
  ) {
      this.getStorageService.getItem("userInfo").subscribe((res) => {
        this.customerFlag = res?.isCustomer ? true : false;
      });
    }

  ngOnInit(): void {
    this.data = this.modalService.config.initialState;
    this.builderInfo = this.data.builderInfo;
    this.fromPage = this.data.fromPage;
  }

  closeModal() {
    this.bsModalRef.hide();
  }

}
