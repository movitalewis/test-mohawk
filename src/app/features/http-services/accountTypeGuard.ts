import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from "@angular/router";
import { Observable, combineLatest, of, switchMap } from "rxjs";
import { UserService } from "../shared/user/services/user.service";
import { StorageService } from "./storage.service";
import { MenuConfigService } from "../shared/layouts/services/menu-config.service";

@Injectable({
  providedIn: "root",
})
export class AccountTypeGuard implements CanActivate {
  constructor(
    private router: Router,
    private userService: UserService,
    private storageService: StorageService,
    private menuConfigService:MenuConfigService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return combineLatest([this.storageService.getItem("userInfo")]).pipe(
      switchMap(([res]) => {
        if (state.url.includes("/account/accounts-list") || state.url.includes("/advance-search")) {
          return of(true);
        }
        if (res?.isCustomer) return of(true);
        let userCanOnlySeeOrderHistory =
          res?.orgUnit?.accountType === "ZMSH" || false;
        if (!userCanOnlySeeOrderHistory) return of(true);
        console.log(this.menuConfigService.sideNav)
        if (state.url.includes("orders")) {
          return of(true);
        }
        const sideNaveMenuNames:string[] =  this.menuConfigService.sideNav.map( (item:any) => (item.name).toLowerCase());
        const stateUrl = state.url.toLowerCase()
        let isPathMatched = false;
        sideNaveMenuNames.forEach((item:any) => {
          if (stateUrl.includes(item)) {
            isPathMatched = true;
          }
        });
        if(isPathMatched){
          return of(true);
        }
        
        if (state.url.startsWith("/commercial")) {
          this.router.navigateByUrl("/commercial/orders");
        } else {
          this.router.navigateByUrl("/residential/orders");
        }
        return of(true);
      })
    );
  }
  
}
