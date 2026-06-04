import { ChangeDetectorRef, Component, OnInit, TemplateRef } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { StorageService } from "src/app/features/http-services/storage.service";
import { ProductService } from "../../../products/pages/services/product.service";

@Component({
    selector: 'place-reserve-popup',
    templateUrl: './place-reserve-popup.component.html',
    styleUrls: ['./place-reserve-popup.component.scss'],
    standalone: false
})
export class PlaceReservePopupComponent implements OnInit {
  modalRef!: BsModalRef;
  cartNumberData: any = {};
  cartEntries= []

  constructor(
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private productService: ProductService,
    private getStorageService: StorageService,
    private cdr: ChangeDetectorRef
  ) {
    this.getStorageService
    .getItem("miniCartCount")
    .subscribe((res) => {
      this.cartNumberData = res;
      this.cdr.detectChanges();
    });
  }

  ngOnInit(): void {
    this.productService.getCartData(this.cartNumberData?.code).subscribe({
      next: (res: any) => {
        if(res && res.body){
          this.cartEntries = res.body.entries ? res.body.entries : [];
        }
        this.cdr.detectChanges();
      }
    })
  }

  placeReserve() {
    this.productService.placeReserve(this.cartNumberData?.code).subscribe((res: any) => {
      
    });
  }

  cancelReserve() {
    let payload= {
      "code" : this.cartNumberData?.code,
      "entryNumber" : this.cartEntries
    }
    this.productService
      .cancelReserve(payload)
      .subscribe((res: any) => {
      
      });
  }
}
