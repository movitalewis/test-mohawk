import { Injectable } from "@angular/core";
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from "@angular/router";
import { StorageService } from "./storage.service";
import { UserService } from "../shared/user/services/user.service";

@Injectable({
  providedIn: "root",
})
export class MakeAPaymentGaurdService implements CanActivate {
  isPayBillSignup:boolean = false;

  constructor(
    private router: Router,
    private storageService: StorageService,
    private userService: UserService,
    private activateRoute:ActivatedRoute
  ) {
    this.activateRoute.queryParams.subscribe((params: any) => {
      this.isPayBillSignup = params?.payBillSignup ? true : false;
    });
  }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // return true;
    let userInfo = this.storageService.userInfo;
    
    if (
      !(
        userInfo?.userPermissions?.includes("Pay Bills") ||
        userInfo?.userPermissions?.includes("Receivables Inquiry") ||
        userInfo?.userPermissions?.includes("View Payment Group")
      )
    ) {
      this.navigateUsers();
      return false;
    } else if (
      !userInfo?.isCustomer &&
      (userInfo?.priceLabel == "USD" ||
        !userInfo?.orgUnit?.uid?.includes("8122")) &&
      !userInfo?.userPermissions?.includes("Pay Bills")
    ) {
      this.navigateUsers();
      return false;
    } else if (
      userInfo?.isCustomer &&
      (userInfo?.priceLabel == "USD" ||
        !userInfo?.orgUnit?.uid?.includes("8122")) &&
        !(userInfo?.orgUnit?.paybillFlag === 'Z' || 
          userInfo?.orgUnit?.paybillFlag === 'EMPTY')
    ) {
      // debugger;
      this.navigateUsers();
      return false;
    } else if (this.userService?.isWellsFargo()) {
      this.navigateUsers();
      return false;
    }
    return true;
  }

  navigateUsers() {
    let data = this.storageService.userInfo;
    let storefront =
      (data?.defaultStorefront === "R" || data?.defaultStorefront === "") ? "residential" : "commercial";
    this.userService.setEnvironment(storefront);

    // let store= this.router.url.includes('residential')?'residential':'commercial';
    
    if (data?.isCustomer) {
      this.router.navigate([`/${storefront}`]);
      if (data.accounts?.length > 1) {
        const multiAccounts = data.accounts.filter(
          (item: any) => item.company === data.defaultStorefront
        );
        if (multiAccounts.length == 1) {
          this.router.navigate([`/${storefront}`]);
        } else {
          this.router.navigate([`/${storefront}/account/multi-account`]);
        }
      }
    }
    if (data?.isCSR) {
      this.router.navigate([`/${storefront}`]);
    }
    if (data?.isSalesPerson) {
      this.router.navigate([`/${storefront}/salesperson`]);
    }
    if (data?.isSalesOps) {
      this.router.navigate([`/${storefront}/salesperson/view-accounts`]);
    }
    if (data?.isProductManager) {
      this.router.navigate([`/${storefront}/product-owner`]);
    }
  }
}
