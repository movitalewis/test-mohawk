import { Injectable } from "@angular/core";
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  CanActivate,
  NavigationStart,
  Router,
  RouterStateSnapshot,
} from "@angular/router";
import { UserService } from "../shared/user/services/user.service";
import { StorageService } from "./storage.service";
import { Observable, of } from "rxjs";
import { MenuConfigService } from "../shared/layouts/services/menu-config.service";

@Injectable({
  providedIn: "root",
})
export class UserPermissionGuardService implements CanActivate {
  constructor(
    private router: Router,
    private storageService: StorageService,
    private menuConfigService: MenuConfigService
  ) {}
  defaultIgnorePaths = [
    "",
    "account",
    "cloneorders",
    "sample-budget",
    "cart",
    "company",
    "entitlement-manager",
    "pricing-manager",
    "advance-search",
    "post-modification",
  ];
  ignorePaths: any = [];
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const project = state.url.includes("/commercial")
      ? "commercial"
      : "residential";
    let ind = -1;
    let returnVal = true;
    this.menuConfigService
      .getMenuData(project, this.storageService.userInfo)
      .subscribe((menuData) => {
        const test = state;
        const currentPath: any = route?.routeConfig?.path;
        let menuIgnorePaths: any = [];
        menuData.forEach((menu: any) => {
          menuIgnorePaths.push(menu.name.toLowerCase());
        });
        this.ignorePaths = [...this.defaultIgnorePaths, ...menuIgnorePaths];
        if (
          !this.ignorePaths.includes(currentPath.toLowerCase()) &&
          menuData.length > 0
        ) {
          ind = menuData.findIndex(
            (item: any) => item.name.toLowerCase() === currentPath.toLowerCase()
          );
          if (ind === -1) {
            returnVal = false;
            this.router.navigate(["/" + project]);
          } else {
            const pathArray = state.url.split("/");
            if (!pathArray[pathArray.length - 1].includes("products?name")) {
              const subInd = menuData[ind].subNav.findIndex((item: any) => {
                if (state.url.includes(item.path)) {
                  return true;
                }
                if (route?.queryParams) {
                  // for(let key in route?.queryParams){
                  //   if(Object.keys(route?.queryParams))
                  // }
                  for (
                    let a = 0;
                    a < Object.keys(route?.queryParams).length;
                    a++
                  ) {
                    const keys = Object.keys(route?.queryParams);
                    if (a === keys.length - 1) {
                      const updatedPath = item.path.replace(
                        item.path.slice(
                          item.path.indexOf(keys[a]),
                          item.path.length
                        ),
                        `${keys[a]}=${route?.queryParams[keys[a]]}`
                      );
                      return "/" + updatedPath === state.url;
                    }
                  }
                }
                return "/" + item.path === state.url;
              });
              if (subInd === -1) {
                returnVal = false;
                this.router.navigate(["/" + project]);
              }
            } else if (
              pathArray[pathArray.length - 1].includes("products?name")
            ) {
              const currentSubNav = route?.queryParams["name"];
              const currentSubNavItem = menuData[ind].subNav.find(
                (item: any) => item.name === currentSubNav
              );
              if (currentSubNavItem) {
                const subSubInd = currentSubNavItem.subNav.findIndex(
                  (item: any) =>
                    "/" + item.path === decodeURIComponent(state.url)
                );
                if (subSubInd == -1) {
                  returnVal = false;
                  this.router.navigate(["/" + project]);
                }
              } else {
                returnVal = false;
                this.router.navigate(["/" + project]);
              }
            }
          }
        } else {
          returnVal = true;
        }
      });
    return of(returnVal);
  }
}
