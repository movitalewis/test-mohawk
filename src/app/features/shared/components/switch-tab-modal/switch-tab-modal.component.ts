import { Component, OnInit } from '@angular/core';
import { BsModalService } from "ngx-bootstrap/modal";
import { StorageService } from 'src/app/features/http-services/storage.service';
@Component({
    selector: 'app-switch-tab-modal',
    templateUrl: './switch-tab-modal.component.html',
    styleUrls: ['./switch-tab-modal.component.scss'],
    standalone: false
})
export class SwitchTabModalComponent implements OnInit {
  onAction: Function = () => { };
  isSalesPerson:boolean = false;
  constructor(private modalService: BsModalService, 
    private storageService: StorageService) { }

  handleAction() {
    this.onAction();
    this.modalService.hide("switchtab");
    if(this.isSalesPerson){
      this.storageService.handleTriggerClearUnit();
    }
  }

  ngOnInit(): void {
    this.isSalesPerson = this.storageService?.userInfo?.isSalesPerson || this.storageService?.userInfo?.isSalesOps;
  }
}

