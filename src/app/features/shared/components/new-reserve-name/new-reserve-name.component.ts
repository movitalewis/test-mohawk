import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef, ModalOptions } from "ngx-bootstrap/modal";
import { StorageService } from "src/app/features/http-services/storage.service";
import { ProductService } from "../../../commercial/products/pages/services/product.service";
import { OrderService } from "../../../commercial/orders/services/order.service";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";

@Component({
    selector: "app-new-reserve-name",
    templateUrl: "./new-reserve-name.component.html",
    styleUrls: ["./new-reserve-name.component.scss"],
    standalone: false
})
export class NewReserveNameComponent implements OnInit {
  modalRef!: BsModalRef;
  reserveNumber: any;
  modalForm!: FormGroup;
  cartNumberData: any = {};
  cartEntries = [];
  spinnerLoading = false;
  getCartAction = (d:any) => {};

  // public reservesData: any = [];

  constructor(
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private productService: ProductService,
    private getStorageService: StorageService,
    private orderService: OrderService,
    private route: ActivatedRoute,
    private router: Router,
    private fb : FormBuilder
  ) {
    this.getStorageService.getItem("miniCartCount").subscribe((res) => {
      this.cartNumberData = res;
    });
  }

  public data = [];

  ngOnInit(): void {
    this.modalForm = this.fb.group({
      reserveName: [ "",[Validators.required, Validators.pattern(/^[a-zA-Z0-9 ]*$/)]],  
    });

    this.reserveNumber = this.route.snapshot.paramMap.get("id");

    this.productService
      .getCartData(this.getStorageService?.cartData?.code)
      .subscribe({
        next: (res: any) => {
          if (res && res.body) {
            this.cartEntries = res.body.entries ? res.body.entries : [];
          }
        },
      });
  }
  reserveNumberDetailing: any = [];
  // handleGetCart() {
  //   this.getCartAction();
  // }
  doneReserve() {
    // this.spinnerLoading = true;
    this.productService.progressShow('placeReserve');
    this.productService
      .placeReserve(this.cartNumberData?.code, this.modalForm.value.reserveName)
      .subscribe({
        next: (res) => {
          this.productService.progressHide();
          this.spinnerLoading = false;
          let data = res?.body;
          this.getCartAction(data);
          // this.reserveNumberDetailing = res.body;
          
          //   // res.body.map((item: any) => {
          //   //   item.reserveEntries.map((resEntry: any) => {
          //   //     this.reservesData = [...this.reservesData, resEntry];
          //   //   });
          //   // });
          // this.data = this.reserveNumberDetailing;
          // this.data.map((item: any) => {
          //   item.projectName = reserveName
          // })
          
          
          
          // if (res?.body?.status == "success") {
          // let message = res?.body?.message || "Successfully created reserve.";
          // this.router.url.split("?")[0].includes("commercial")
          //   ? this.router.navigate(["/commercial/orders/reserves"], {
          //       queryParams: {
          //         message: message,
          //       },
          //     })
          //   : this.router.navigate(["/residential/orders/reserves"], {
          //       queryParams: {
          //         message: message,
          //       },
          //       });
            
          this.modalService.hide();
          // }
        },
        error: (err) => {
          this.productService.progressHide();
          this.modalService.hide();
          this.spinnerLoading = false;
        },
      });
  }

  cancelReserve() {
    this.modalService.hide();
  }

  onInputChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value;
    // Allow only alphanumeric characters and spaces
    const sanitizedValue = value.replace(/[^a-zA-Z0-9 ]/g, '');
    // Update the input field if sanitized value differs
    if (sanitizedValue !== value) {
      inputElement.value = sanitizedValue;
      this.modalForm.controls['reserveName'].setValue(sanitizedValue);
    }
  }
}
