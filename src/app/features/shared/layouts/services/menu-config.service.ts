import { Injectable } from "@angular/core";
import {
  BehaviorSubject,
  combineLatest,
  filter,
  Observable,
  of,
  switchMap,
} from "rxjs";
import {
  commercialMenuIsCSR,
  commercialMenuIsProductManager,
  commercialMenuIsSalesOp,
  commercialMenuIsSalesPerson,
} from "../../constants/menu/commercial.config";
import { menuType } from "../../constants/menu/menu.type";
import {
  residentialMenuIsCSR,
  residentialMenuIsProductManager,
  residentialMenuIsSalesOp,
  residentialMenuIsSalesPerson,
} from "../../constants/menu/residential.config";
import {
  menuConfigCommercial,
  menuConfigResidential,
} from "../../constants/PERMISSIONS_CONSTANTS";
import { UserService } from "../../user/services/user.service";
import { StorageService } from "src/app/features/http-services/storage.service";
import { CommercialSiteSelectorService } from "src/app/features/http-services/commercial-site-selector.service";

@Injectable({
  providedIn: "root",
})
export class MenuConfigService {
  // Use Side Nav replace below line with private menuConfig = new BehaviorSubject<string>(menuType.sideNav);
  // Use Top Nav replace below line with  private menuConfig = new BehaviorSubject<string>(menuType.topNav);
  public headerOffSetHeight = new BehaviorSubject<any>(0);
  private menuConfig = new BehaviorSubject<string>(menuType.sideNav);
  currentState = this.menuConfig.asObservable();
  moduleName = "";
  sideNav:any;
  constructor(
    private userService: UserService,
    private storageService: StorageService,
    private commercialSiteSelectorService:CommercialSiteSelectorService
  ) {}
  getMenuData(environment: string, res: any) {
    // return this.userService.getCurrentUserDetail().pipe(
    //   switchMap((res) => {
    if (environment === "residential") {
      const residentialMenu = JSON.parse(JSON.stringify(menuConfigResidential));
      this.moduleName = "residential";
      const menu = this.removeItemsFromMenuIfMissingPermissions(
        residentialMenu,
        res?.userPermissions
      );
      this.sideNav = menu;
      return of(menu);
    } else {
      const commercialMenu = JSON.parse(JSON.stringify(menuConfigCommercial));
      this.moduleName = "commercial";
const menu =this.removeItemsFromMenuIfMissingPermissions(
  commercialMenu,
  res?.userPermissions
)
      this.sideNav = menu;

      return of(menu);
    }
    //   })
    // );
  }

  removeItemsFromMenuIfMissingPermissions(
    menuArray: any,
    userPermissions: any
  ): any {
    let returnArray = [];
    for (let menuItem of menuArray) {
      if (
        this.userMenuAccess(menuItem) &&
        this.userCanAccess(menuItem, userPermissions)
      ) {
        let newNode = menuItem;

        if (menuItem.subNav !== undefined) {
          newNode.subNav = this.removeItemsFromMenuIfMissingPermissions(
            menuItem.subNav,
            userPermissions
          );
          returnArray.push(newNode);
        } else {
          returnArray.push(newNode);
        }
      }

      returnArray.push(null);
    }
    return returnArray.filter((item: any) => {
      if (item === null) return false;

      if (item.subNav === undefined) return true;
      if (item.subNav.length === 0 && item.path === "") return false;

      return true;
    });
  }

  userMenuAccess(menuItem: any) {
    let haveAccess = true;
    for (let personas in menuItem.personas) {
      if (
        this.storageService.userInfo &&
        this.storageService.userInfo != null &&
        this.storageService.userInfo.hasOwnProperty(personas) &&
        menuItem.personas[personas] == false &&
        this.storageService.userInfo[personas] == true
      ) {
        haveAccess = false;
        break;
      }
    }
    if(this.moduleName == "commercial" && haveAccess === true && menuItem.hasOwnProperty('allowedSites')){
      haveAccess = menuItem.allowedSites.includes(this.commercialSiteSelectorService.selectedSite);
    }
    return haveAccess;
  }

  userCanAccess(node: any, userPermissions: any): boolean {
    if (node.permissions === undefined) return true;
    let canAccess = false;
    for (let permissionGroup of node.permissions.is) {
      let passesAllPermissionsInAGroup = true;
      if (permissionGroup === undefined) return true;
      for (let permission of permissionGroup) {
        if (!userPermissions?.includes(permission))
          passesAllPermissionsInAGroup = false;
      }
      if (passesAllPermissionsInAGroup) {
        if (this.checkUserTypePermissions(node)) {
          canAccess = true;
        } else {
          canAccess = false;
        }
        break;
      }
    }
    if (!canAccess) return false;
    if (node.permissions.not.length === 0) return true;

    for (let permissionGroup of node.permissions.not) {
      let excludesAtLeastOneInAGroup = false;
      for (let permission of permissionGroup) {
        if (!userPermissions?.includes(permission))
          excludesAtLeastOneInAGroup = true;
      }
      if (!excludesAtLeastOneInAGroup) {
        return false;
      }
    }
    return true;
  }
  checkUserTypePermissions(menuItem: any) {
    if (
      this.moduleName == "commercial" &&
      menuItem.name === "Quotes" &&
      this.storageService.userInfo?.orgUnit?.inHouseAccount
    ) {
      return false;
    }
    if (
      menuItem.name === "Reserves" &&
      this.storageService.userInfo?.orgUnit?.inHouseAccount
    ) {
      return false;
    }

    if(menuItem.name === "Custom Orders" && !this.storageService.userInfo?.isCustomOrderView){
      return false;
    }
    /* if (
      menuItem.name === "Products" && menuItem.personas['isShipToUser'] == true &&
      !this.storageService.userInfo?.isSalesPerson && !this.storageService.userInfo?.isSalesOps && this.storageService.userInfo?.isShipToUser
    ) {
      return false;
    } */
    if (
      (menuItem.name === "Bank Accounts") &&
      this.storageService.userInfo?.priceLabel === 'USD'
    ) {
      return false;
    }
    if (
      (menuItem.name === "Bank Accounts" ||
        menuItem.name === "Scheduled Payments") &&
      (this.storageService.userInfo?.orgUnit?.paybillFlag == "EMPTY" ||
        this.storageService.userInfo?.orgUnit?.paybillFlag == "Y")
    ) {
      return false;
    }    
    else if((menuItem.name === "Reserves" ) && 
      (this.storageService?.userInfo?.isALCBDM || this.storageService?.userInfo?.isResidentialManager)){
        return false;
      }
    else if (
      (menuItem.name === "Make Payment/Open Receivables" ||
        menuItem.name === "Change Receiver email") &&
      this.storageService?.userInfo?.isCustomer &&
      (this.storageService?.userInfo?.priceLabel == "USD" ||
        !this.storageService?.userInfo?.orgUnit?.uid.includes("8122")) &&
      !this.storageService?.userInfo?.userPermissions.includes("Pay Bills")
    ) {
      return false;
    }
    else if (
      menuItem.name === "Make Payment/Open Receivables" &&
      !this.storageService?.userInfo?.isCustomer &&
      (this.storageService?.userInfo?.priceLabel == "USD" ||
        !this.storageService?.userInfo?.orgUnit?.uid.includes("8122"))
    ) {
      return false;
    }
    // else if((menuItem.name === "Make Payment/Open Receivables")
    //   && (this.storageService.userInfo?.priceLabel == "USD" && !this.storageService.userInfo?.isCustomer )){
    //   return false;
    // }
    // else if(menuItem.name === "Make Payment/Open Receivables" && this.storageService.userInfo?.priceLabel == "CAD"){
    //   return true;
    // }
    else {
      return true;
    }
  }
}
