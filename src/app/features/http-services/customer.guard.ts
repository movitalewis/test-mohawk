import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from "@angular/router";
import { Observable, combineLatest, of, switchMap, take } from "rxjs";
import { UserService } from "../shared/user/services/user.service";
import { StorageService } from "./storage.service";

@Injectable({
  providedIn: "root",
})
export class CustomerGuard implements CanActivate {
  constructor(
    private router: Router,
    private userService: UserService,
    private storageService: StorageService
  ) {}
  pageReloaded = false;

  filterResidentialAccounts(accounts: any) {
    return accounts.filter((account: any) => account.company === "R");
  }
  filterCommercialAccounts(accounts: any) {
    return accounts.filter((account: any) => account.company === "C");
  }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return combineLatest([
      this.userService.getCurrentUserDetail(),
      this.userService.accountInfoSet,
    ]).pipe(
      switchMap(([res, accountInfoSet]) => {
        if (!res.body.isCustomer) {
          return of(true);
        }
        if (state.url.includes("account/multi-account")) return of(true);
        if (res.body.accounts == undefined) return of(true);
        if (state.url.includes("residential")) {
          if (this.filterResidentialAccounts(res.body.accounts).length === 1) {
            const accountNumber = this.storageService?.uid || "";
            return this.accountExistsForOtherDashboard(
              false,
              accountNumber
            ).pipe(
              switchMap((exists) => {
                if (exists) {
                  this.storeuid(accountNumber.slice(0, -2) + "81");
                  return of(true);
                } else {
                  this.storeuid(res.body.accounts[0]?.uid);
                  return of(true);
                }
                // this.storePreviousDetails();
                // return of(true);
              })
            );
            // return of(true);
          }
        }
        if (state.url.includes("commercial")) {
          if (this.filterCommercialAccounts(res.body.accounts).length === 1) {
            const accountNumber = this.storageService?.uid || "";

            return this.accountExistsForOtherDashboard(
              true,
              accountNumber
            ).pipe(
              switchMap((exists) => {
                if (exists) {
                  this.storeuid(accountNumber.slice(0, -2) + "82");
                  return of(true);
                }
                this.storePreviousDetails();
                // this.router
                //   .navigateByUrl("/residential")
                //   .then(() => {
                //     this.userService.clearB2BUnit().subscribe();
                //     this.userService.setAccountInfoState(false);
                //     localStorage.setItem(
                //       "customerAddress",
                //       "Test123 123 ...12345"
                //     );
                //   });
                return of(true);
              })
            );
            // return of(true);
          }
        }

        if (!accountInfoSet) {
          if (state.url.includes("residential"))
            // this.router.navigateByUrl("/residential/account/multi-account");
            this.navigateMultiAccount("residential");
          if (state.url.includes("commercial"))
            // this.router.navigateByUrl("/commercial/account/multi-account");
            this.navigateMultiAccount("commercial");

          return of(false);
        }
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
                // this.router
                //   .navigateByUrl("/commercial/account/multi-account")
                //   .then(() => {
                //     this.userService.clearB2BUnit().subscribe();
                //     this.userService.setAccountInfoState(false);
                //     localStorage.setItem(
                //       "customerAddress",
                //       "Test123 123 ...12345"
                //     );
                //   });
                this.navigateMultiAccount("commercial");
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
                // this.router
                //   .navigateByUrl("/residential/account/multi-account")
                //   .then(() => {
                //     this.userService.clearB2BUnit().subscribe();
                //     this.userService.setAccountInfoState(false);
                //     localStorage.setItem(
                //       "customerAddress",
                //       "Test123 123 ...12345"
                //     );
                //   });
                this.navigateMultiAccount("residential");

                return of(true);
              })
            );
          }
        }

        if (this.hasPreviousDetails()) {
          this.restoreDetails();
          return of(true);
        }

        if (state.url.startsWith("/commercial")) {
          // this.router.navigateByUrl("/commercial/account/multi-account");
          this.navigateMultiAccount("commercial");
        } else {
          // this.router.navigateByUrl("/residential/account/multi-account");
          this.navigateMultiAccount("residential");
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
    let filterItems = [];

    return this.userService.getCurrentUserDetail().pipe(
      switchMap((res) => {
        if (isCommercial) {
          filterItems = this.filterCommercialAccounts(res.body.accounts);
        } else {
          filterItems = this.filterResidentialAccounts(res.body.accounts);
        }
        if (filterItems.length == 1) {
          // if (res.body.accounts.some((account: any) => account.uid === newUnit)) {
          return this.userService
            .setUnit("?unitUid=" + filterItems[0].uid)
            .pipe(
              switchMap((res: any) => {
                return of(true);
              })
            );
          // }
        } else {
          if (
            res.body.accounts.some((account: any) => account.uid === newUnit)
          ) {
            return this.userService.setUnit("?unitUid=" + newUnit).pipe(
              switchMap((res: any) => {
                return of(true);
              })
            );
          }
        }

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
  navigateMultiAccount(module: string) {
    this.router.navigateByUrl(`/${module}/account/multi-account`).then(() => {
      // this.userService.currentUserDetails.next(null);
      this.userService.getCurrentUserDetailData(true).subscribe();
      // this.userService.clearB2BUnit().subscribe();
      // this.userService.setAccountInfoState(false);
      // localStorage.setItem("customerAddress", "Test123 123 ...12345");
    });
  }
}
