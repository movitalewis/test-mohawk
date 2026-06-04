import {
  ChangeDetectorRef,
  Component,
  OnInit,
  TemplateRef,
} from "@angular/core";
import { Router } from "@angular/router";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { ApiService } from "src/app/features/http-services/api.service";
import { StorageService } from "src/app/features/http-services/storage.service";
import { ProductService } from "src/app/features/residential/products/pages/services/product.service";
import { OrderService } from "../../../../services/order.service";

@Component({
    selector: "add-cart-popup",
    templateUrl: "./add-cart-popup.component.html",
    styleUrls: ["./add-cart-popup.component.scss"],
    standalone: false
})
export class AddCartPopupComponent implements OnInit {
  modalRef?: BsModalRef;
  spinnerLoading = false;
  id: any;
  entries: any;
  uid: any;
  userEmail: any;
  onYesAction: Function = () => {};

  constructor(
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private orderService: OrderService,
    private apiService: ApiService,
    private storageService: StorageService,
    public router: Router,
    private productService: ProductService
  ) {}
  ngOnInit(): void {
    this.storageService.getItem("uid").subscribe((res) => {
      this.uid = res;
      // this.getCartValues();
    });
    this.storageService.getItem("userInfo").subscribe((res) => {
      this.userEmail = res.uid;
      // this.getCartValues();
    });
  }

  onHideModal() {
    this.bsModalRef.hide();
  }
  addReserveToCart() {
    this.onYesAction();
    this.bsModalRef.hide();
    
  }

  // processAddReserveToCart() {
  //   this.spinnerLoading = true;
  //   this.orderService
  //     .reserveToCart(this.id, this.entries)
  //     .subscribe((res: any) => {
  //       this.spinnerLoading = false;
  //       // this.cancelCheck = res.body;
  //       this.productService.getMiniCartData(this.uid).subscribe((res: any) => {
  //         this.storageService.setItem("miniCartCount", res.body);
  //         this.router.url.split("?")[0].includes("commercial")
  //           ? this.router.navigateByUrl("/commercial/cart")
  //           : this.router.navigateByUrl("/residential/cart");
  //         this.bsModalRef.hide();
  //       });
  //     }),
  //     (err: any) => {};
  // }
}
