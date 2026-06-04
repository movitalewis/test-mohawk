import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { PostModificationProductAddressService } from "../../../post-modification/post-modification-products/post-modification-components/post-modification-services/post-modification-product-address.service";
import { StorageService } from "src/app/features/http-services/storage.service";

@Component({
    selector: "app-shipping-preferences",
    templateUrl: "./shipping-preferences.component.html",
    styleUrls: ["./shipping-preferences.component.scss"],
    standalone: false
})
export class ShippingPreferencesComponent implements OnInit {
  addresses: any;
  currentPage: number = 1;
  pageSize: number = 10;
  selectedPk: any = "";
  apiResponse: any = "";
  showErrorMessage: boolean = false;
  showSuccessMessage: boolean = false;
  totalLength: number = 0;
  spinnerLoading: boolean = false;
  alertData: any = {
    message: "success",
  };
  alertType: any = "success";
  alertTrigger: any = false;
  @ViewChild("scrollToTop", { read: ElementRef }) scrollToTop: any;

  constructor(
    private userService: UserService,
    private defaultAddress: PostModificationProductAddressService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.getDefaultShippingAddress();
    this.getShippingAddress();
  }

  getShippingAddress() {
    this.userService.profileProgress('shippingaddress')
    const pageIndex = this.currentPage - 1 < 0 ? 0 : this.currentPage - 1;
    this.defaultAddress
      .getDefaultAddress(
        this.userService.getUserEmail().toLowerCase(),
        pageIndex,
        "",
        this.pageSize
      )
      .subscribe({
        next: (res) => {
          this.userService.profileProgressHide()

          this.addresses = res?.body.addresses;
          this.totalLength = +res?.body?.totalResults || 0;
          this.startValue =
            this.currentPage * this.pageSize - (this.pageSize - 1);
          this.lastValue = this.startValue + this.pageSize - 1;
          this.lastValue =
            this.lastValue > this.totalLength
              ? this.totalLength
              : this.lastValue;
        },
        error: (err) => {
          this.userService.profileProgressHide()
          this.scrollPageToTop();
          this.alertData = {
            message: err,
          };
          this.alertType = "danger";
          this.alertTrigger = true;
          this.stopAlert();
        },
      });
  }

  getDefaultShippingAddress() {
    // this.userService.getProfileShippingPreferences().subscribe({
    //   next: (res) => {
    //     this.selectedPk = (res?.body?.addresses && res?.body?.addresses.length>0) ? res?.body?.addresses[0]?.pk : '';
    //   },
    //   error: (err) => { },
    // });
    this.selectedPk = this.storageService.userInfo?.defaultAddress?.pk || "";
  }

  selectRecord(pkId: any) {
    this.selectedPk = pkId;
  }

  onSubmitRecords() {
    this.userService.profileProgress('updateShippingAddress')
    if (this.selectedPk) {
      this.userService.setUserDefaultAddress(this.selectedPk).subscribe({
        next: (res) => {
          this.userService.profileProgressHide()
          this.scrollPageToTop();
          if (res?.body) {
            this.alertData = {
              message: res?.body?.message
                ? res?.body?.message
                : "Default Address is set for the current customer.",
            };
            this.alertType = "success";
            this.alertTrigger = true;
            this.userService.currentUserDetails.next(null);
            this.userService
              .getCurrentUserDetail()
              .subscribe((response: any) => {});
            this.stopAlert();
          }
        },
        error: (err) => {
          this.userService.profileProgressHide()
          this.scrollPageToTop();
          this.alertData = {
            message: err,
          };
          this.alertType = "danger";
          this.alertTrigger = true;
          this.stopAlert();
        },
      });
    }
  }
  startValue: number = this.currentPage * this.pageSize - (this.pageSize - 1);
  lastValue: number = this.startValue + this.pageSize - 1;
  pageChangeEvent(e: any) {
    if (e == 0) {
      this.currentPage = 1;
    }
    this.currentPage = e;
    this.getShippingAddress();
  }
  scrollPageToTop() {
    this.scrollToTop.nativeElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest",
    });
  }
  stopAlert() {
    setTimeout(() => {
      this.alertTrigger = false;
    }, 6000);
  }
}
