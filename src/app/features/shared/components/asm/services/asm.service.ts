import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, catchError, Observable, of, Subject } from "rxjs";
import { ApiService } from "src/app/features/http-services/api.service";
import { API_CONSTANTS } from "src/app/features/shared/constants/API-CONSTANTS";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { delay, map, switchMap } from "rxjs/operators";
import { StorageService } from "src/app/features/http-services/storage.service";
import { Router } from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class AsmService {
  constructor(
    private apiService: ApiService,
    private userService: UserService,
    private storageService: StorageService,
    private router: Router
  ) {}
  getCustomerList(): Observable<any> {
    let url = API_CONSTANTS.getCustomerList;
    return this.apiService.getAsm(url, {}).pipe(map((error) => error));
  }
  getAutoComplete(customerQueries: any): Observable<any> {
    let url = API_CONSTANTS.listAutocomplete;
    return this.apiService
      .getAsm(`${url}?customerQuery=${customerQueries}`, {})
      .pipe(map((error) => error));
  }
  startSession(data: any): Observable<any> {
    if (data.cart == null) {
      data.cart = "";
    }
    let url = API_CONSTANTS.emulateCustomer;
    return this.apiService
      .postASM(`${url}?customerId=${data.email}&cartId=${data.cart}`, {})
      .pipe(map((error) => error));
  }
  stopSession(): Observable<any> {
    let url = API_CONSTANTS.stopSession;
    return this.apiService.getAsm(url, {}).pipe(map((error) => error));
  }
  updateProfile(email: any): Observable<any> {
    // let url = API_CONSTANTS.setProfile.replace(
    //   "{userId}", email
    // )
    // const impersonateFlag: boolean = true
    // return this.apiService.get(`${url}?impersonateFlag=${impersonateFlag}`, {}).pipe(map(error => error));
    this.userService.asmUserInfo = {
      isAsmUser: true,
      asmUser: email,
    };
    if (email === "") {
      this.userService.asmUserInfo = {};
      const prevUser: any = localStorage.getItem("userNamesTemp");
      localStorage.setItem("userNames", prevUser);
      this.userService.setUserEmail(String(localStorage.getItem("loginUser")));
      localStorage.setItem("userNamesTemp", "");
    } else {
      localStorage.setItem("userNamesTemp", this.userService.getUserEmail().toLowerCase());
      localStorage.setItem("userNames", email);
      this.userService.setUserEmail(email);
      this.userService.asmUserInfo = {
        isAsmUser: true,
        asmUser: email,
      };
    }
    // this.userService.userEmail = undefined;
    this.userService.currentUserDetails.next(null);

    return this.userService.getCurrentUserDetail();
  }

  getUserEmail() {
    const storedEmail = sessionStorage.getItem("storedEmail");
    return storedEmail;
  }

  // setUnit(urlExt: string) {
  //   let url;
  //   if (urlExt === "?unitUid=undefined") {
  //     urlExt = "?unitUid=";
  //     url =
  //       API_CONSTANTS.setUnit.replace("{userId}", this.getUserEmail()) + urlExt;
  //   } else {
  //     url =
  //       API_CONSTANTS.setUnit.replace("{userId}", this.getUserEmail()) + urlExt;
  //   }
  //   return this.apiService.patch(url, {}).pipe(
  //     map((res: any) => {
  //     })
  //   );
  // }

  getMiniCart(uid: any) {
    let url = API_CONSTANTS.miniCart.replace("{customerNumber}", uid);
    url = url.replace("{uid}", this.getUserEmail());
    this.apiService.getMiniCartData(`${url}`).subscribe({
      next: (result: any) => {
        
        this.storageService.setItem("miniCartCount", result);
      },
      error: (error: any) => {
        this.storageService.setItem("miniCartCount", "");
      },
    });
  }

  navigateUsers(data: any) {
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
      this.router.navigate([`/${storefront}/account/search`]);
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
