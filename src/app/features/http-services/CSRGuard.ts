import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from "@angular/router";
import { combineLatest, merge, Observable, of, switchMap, take } from "rxjs";
import { UserService } from "../shared/user/services/user.service";
import { StorageService } from "./storage.service";

@Injectable({
  providedIn: "root",
})
export class CSRGuard implements CanActivate {
  constructor(
    private router: Router,
    private userService: UserService,
    private storageService: StorageService    
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return combineLatest([
      this.userService.getCurrentUserDetail(),
      this.userService.accountInfoSet,
    ]).pipe(
      switchMap(([res, accountInfoSet]) => {
        // user can access commercial when isMohawkOneuser is true
        this.userService.navigateToMohawkTodayCheck(res);
        if (res.body.isMohawkOneuser && (state.url?.includes("residential") || state.url =="/")) {
          this.router.navigateByUrl("commercial")
        } 
        if (!res.body.isCSR) {
          if (
            !res.body.isFinancialSuperAdmin &&
            !res.body.isFinancialUser &&
            !res.body.isIsAdmin &&
            !res.body.isSalesPerson &&
            !res.body.isSalesOps && !res.body.isProductManager
          ) {
            if (res.body?.accounts?.length == 1) {
              let moduleName =
                res.body.accounts[0].company === "C"
                  ? "/commercial"
                  : "/residential";
              if (state.url.includes(moduleName)) {
                return of(true);
              } else {
                this.router.navigateByUrl(moduleName);
                return of(true);
              }
            } else {
              if (state.url.includes("residential/account/search")) {
                this.router.navigateByUrl("/residential");
              }
              if (state.url.includes("commercial/account/search")) {
                this.router.navigateByUrl("/commercial");
              }
            }
            return of(true);
          }
          if(res.body.isProductManager){
            if (state.url.includes("residential/account/search") || state.url === "/residential") {
              this.router.navigateByUrl("/residential/product-owner");
          }
          if (state.url.includes("commercial/account/search") || state.url === "/commercial") {
            this.router.navigateByUrl("/commercial/product-owner");
          }
          return of(true);
        }
        }
        if (res.body.isCSR) {
          if (state.url.includes("residential/salesperson")) {
            this.router.navigateByUrl("/residential");
            return of(false);
          }
          if (state.url.includes("commercial/salesperson")) {
            this.router.navigateByUrl("/commercial");
            return of(false);
          }
        }
        if ((res.body.isSalesPerson  || res.body.isSalesOps) && !(res.body?.isALCBDM || res.body?.isResidentialManager)) {
          const moduleNameForSalesOPs = res.body.defaultStorefront === "C"
              ? "/commercial/salesperson/view-accounts"
              : "/residential/salesperson/view-accounts";
          if(res.body.isSalesOps){
            if(!state.url.includes(moduleNameForSalesOPs) && (state.url.includes('/residential/salesperson') || state.url.includes('/commercial/salesperson')) && !state.url.includes('/salesperson/view-accounts')  ){
              this.router.navigateByUrl(moduleNameForSalesOPs);
              return of(true);
            }
            return of(true);
          }
          if (res?.body?.accounts?.length == 1) {
            let moduleName = res.body.accounts[0].company === "C"
            ? "/commercial/salesperson"
            : "/residential/salesperson";
              
            let moduleLabel =
              res.body.accounts[0].company === "C"
                ? "commercial"
                : "residential";
            if (state.url.includes(moduleLabel)) {
              return of(true);
            } else {
              this.router.navigateByUrl(moduleName);
              return of(true);
            }
          } else {
            if (
              state.url === "/residential" &&
              this.storageService.userInfo?.orgUnit?.inHouseAccount
            ) {
              this.router.navigateByUrl("/residential/salesperson");
              return of(false);
            }
            //  else if (!this.storageService.userInfo?.orgUnit?.inHouseAccount) {
            //   this.router.navigateByUrl("/residential");
            //   return of(true);
            // }
            if (
              state.url === "/commercial" &&
              this.storageService.userInfo?.orgUnit?.inHouseAccount
            ) {
              this.router.navigateByUrl("/commercial/salesperson");
              return of(false);
            }
          }
          // else if (!this.storageService.userInfo?.orgUnit?.inHouseAccount) {
          //   this.router.navigateByUrl("/commercial");
          //   return of(true);
          // }
        }
        if (state.url.includes("account/search")) return of(true);

        if (accountInfoSet) {
          let accountNumber = localStorage.getItem("accountNumber") || "";
          let isCommercial = state.url.startsWith("/commercial");
          if (accountNumber?.endsWith("81")) {
            if (!isCommercial) {
              return of(true);
            }

            return this.accountExistsForOtherDashboard(
              isCommercial,
              accountNumber
            ).pipe(
              switchMap((exists) => {
                if (exists) {
                  this.storeuid(accountNumber.slice(0, -2) + "82");
                  return of(true);
                }
                this.storePreviousDetails();
                this.router
                  .navigateByUrl("/commercial/account/search")
                  .then(() => {
                    this.userService.clearB2BUnit().subscribe();
                    this.userService.setAccountInfoState(false);
                    localStorage.setItem(
                      "customerAddress",
                      ""
                    );
                  });
                return of(true);
              })
            );
          }
          if (accountNumber?.endsWith("82")) {
            if (isCommercial) {
              return of(true);
            }
            return this.accountExistsForOtherDashboard(
              isCommercial,
              accountNumber
            ).pipe(
              switchMap((exists) => {
                if (exists) {
                  this.storeuid(accountNumber.slice(0, -2) + "81");
                  return of(true);
                }
                this.storePreviousDetails();
                this.router
                  .navigateByUrl("/residential/account/search")
                  .then(() => {
                    this.userService.clearB2BUnit().subscribe();
                    this.userService.setAccountInfoState(false);
                    localStorage.setItem(
                      "customerAddress",
                      ""
                    );
                  });
                return of(true);
              })
            );
          }
        }

        if (this.hasPreviousDetails()) {
          this.restoreDetails();
          return of(true);
        }
        if (!res.body.isSalesPerson && !res.body.isSalesOps) {
          if (state.url.startsWith("/commercial")) {
            this.router.navigateByUrl("/commercial/account/search");
          } else {
            this.router.navigateByUrl("/residential/account/search");
          }
        } else {
          return of(true);
        }
        return of(false);
      })
    );
  }

  accountExistsForOtherDashboard(
    isCommercial: boolean,
    currentUnit: string
  ): Observable<boolean> {
    let newUnit = currentUnit.slice(0, -2);
    newUnit = newUnit + (isCommercial ? "82" : "81");
    return this.userService.setUnit("?unitUid=" + newUnit).pipe(
      switchMap((res: any) => {
        if (
          res?.body?.message ===
          "Default B2B unit is set for the current customer."
        )
          return of(true);

        return of(false);
      })
    );
  }

  hasPreviousDetails(): boolean {
    return localStorage.getItem("previousDetails") === "true";
  }
  storeuid(accountNumber: string) {
    localStorage.setItem("accountNumber", accountNumber);
    this.storageService.setItem("uid", accountNumber);
  }
  storePreviousDetails() {
    localStorage.setItem("previousDetails", "true");
    localStorage.setItem(
      "previousAccountNumber",
      localStorage.getItem("accountNumber") || ""
    );
    localStorage.setItem(
      "previousCustomerName",
      localStorage.getItem("customerName") || ""
    );
    localStorage.setItem(
      "previousCustomerAddress",
      localStorage.getItem("customerAddress") || ""
    );
    this.storageService
      .getItem("accountData")
      .pipe(take(1))
      .subscribe((data) => {
        this.storageService.setItem("previousAccountData", data);
      });
    this.storageService
      .getItem("uid")
      .pipe(take(1))
      .subscribe((data) => {
        this.storageService.setItem("previousuid", data);
      });
  }
  restoreDetails() {
    localStorage.setItem(
      "accountNumber",
      localStorage.getItem("previousAccountNumber") || ""
    );
    localStorage.setItem(
      "customerName",
      localStorage.getItem("previousCustomerName") || ""
    );
    localStorage.setItem(
      "customerAddress",
      localStorage.getItem("previousCustomerAddress") || ""
    );
    localStorage.setItem("accountInfo", "True");
    this.storageService
      .getItem("previousAccountData")
      .pipe(take(1))
      .subscribe((data) => {
        this.storageService.setItem("accountData", data);
      });
    this.storageService
      .getItem("previousuid")
      .pipe(take(1))
      .subscribe((data) => {
        this.storageService.setItem("uid", data);
      });
    this.userService.accountInfoSet.next(true);
    this.getUserInfo();
    // this.storageService.setselectedAccount(row?.customerNumber);
    // setUnit() {
    let accountNumber = localStorage.getItem("accountNumber");
    this.userService.setUnit("?unitUid=" + accountNumber).subscribe(() => {
      this.storageService.setselectedAccount(accountNumber);
    });
    this.clearPreviousDetails();
  }
  clearPreviousDetails() {
    localStorage.setItem("previousDetails", "false");
    localStorage.removeItem("previousAccountNumber");
    localStorage.removeItem("previousCustomerName");
    localStorage.removeItem("previousCustomerAddress");
    this.storageService.removeItem("previousAccountData");
    this.storageService.removeItem("previousuid");
  }

  // Imported from account search
  getUserInfo() {
    this.userService.getCurrentUserDetail().subscribe((response: any) => {
      // let userinfo = {
      //   uid: response.body.uid,
      //   name: response.body.name,
      //   mobilePhone: response.body.mobilePhone,
      //   isCSR: response.body.isCSR,
      //   isProductManager: response.body.isProductManager,
      //   isSalesOps: response.body.isSalesOps,
      //   isSalesPerson: response.body.isSalesPerson,
      //   salesManRole: response.body.salesManRole,
      //   priceLabel: response.body.priceLabel,
      //   isCustomer: response.body.isCustomer,
      //   salesPersonAvailableSites: response.body.salesPersonAvailableSites,
      // };
      // // this.storageService.setselectedAccount(userinfo);
      // this.storageService.setItem("userInfo", userinfo);
    });
  }
}