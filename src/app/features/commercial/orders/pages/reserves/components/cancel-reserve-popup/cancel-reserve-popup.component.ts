import {
  ChangeDetectorRef,
  Component,
  OnInit,
  TemplateRef,
} from "@angular/core";
import { Router } from "@angular/router";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { OrderService } from "../../../../services/order.service";
import { ProductService } from "src/app/features/residential/products/pages/services/product.service";

@Component({
    selector: "cancel-reserve-popup",
    templateUrl: "./cancel-reserve-popup.component.html",
    styleUrls: ["./cancel-reserve-popup.component.scss"],
    standalone: false
})
export class CancelReservePopupComponent implements OnInit {
  modalRef?: BsModalRef;
  cancelCheck: any;
  cancelReserve: any;
  id: any;
  entries: any;
  spinnerLoading = false;
  onCancelReserve: Function = () => {};
  title = "Cancel Reserve?";
  message = "Are you sure you want to cancel this reserve?";
  constructor(
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private orderService: OrderService,
    public router: Router,
    private productService: ProductService
  ) { }

  ngOnInit(): void {
    const initialState: any = this.modalService.config.initialState;
    this.title = initialState?.title || this.title;
    this.message = initialState?.message || this.message;
  }

  onHideModal() {
    this.modalService.hide("cancelReserveModal");
  }
  removeReserve() {
  
    // this.spinnerLoading = true;
    this.productService.progressShow('cancelReserve');
    this.orderService
      .cancelReserve(this.id, this.entries)
      .subscribe((res: any) => {
        this.productService.progressHide();
        this.spinnerLoading = false;
        this.spinnerLoading = false;
        this.onCancelReserve(res);
        this.onHideModal();
        // if(this.cancelReserve){
        //   this.router.url.split("?")[0].includes("commercial")
        //   ? this.router.navigateByUrl("/commercial/orders/reserves")
        //   : this.router.navigateByUrl("/residential/orders/reserves");
        //   this.bsModalRef.hide();
        // }
        // else{
        // this.cancelCheck = res.body;
        // this.spinnerLoading = false;
        // window.location.reload();
        // this.bsModalRef.hide();
        // }
      },
      (err: any) => {
        this.productService.progressHide();
        this.spinnerLoading = false;
      });
  }
}
