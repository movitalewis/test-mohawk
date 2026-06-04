import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { CommercialSiteSelectorComponent } from '../shared/components/commercial-site-selector/commercial-site-selector.component';

@Injectable({
  providedIn: 'root'
})
export class CommercialSiteSelectorService {
  storedSiteId: string | null = null;
    bsModalRef?: BsModalRef;
  constructor(
    private storageService: StorageService,
    private modalService: BsModalService, 
  ) {
    this.storageService.getItem("commercialSite").subscribe(siteId => {
      this.storedSiteId = siteId;
      this.selectedSite = siteId ?? 'C';
    });
   }
  selectedSite = 'C';
  setSelectedSite(siteId: string) {
    this.selectedSite = siteId;
    this.storedSiteId = siteId;
    this.storageService.setItem("commercialSite", this.selectedSite);      
  }

  resetSelectedSiteForStorage(){
    this.setStoredSite(undefined);
    this.storageService.setItem("commercialSite", undefined);      
  }

  setStoredSite(siteId:any){
    this.storedSiteId = siteId;
  }

  openSiteSelectionModal(data = {}) {
    const initialState: ModalOptions = {
      backdrop: true,
      ignoreBackdropClick: true,
      initialState: {
        ...data,
      },
    };
    this.bsModalRef = this.modalService.show(
      CommercialSiteSelectorComponent,
      Object.assign(initialState, {
        id: "commercialSelector",
        class: "modal-lg modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
    this.bsModalRef.content.accountData = data;
  }
  isSiteSelected(): boolean {
    return !!this.storedSiteId;
  }
}
