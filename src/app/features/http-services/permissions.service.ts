import { Injectable } from "@angular/core";
import { dropdown } from "../shared/constants/user-dropdown/new-dropdown";
import { StorageService } from "./storage.service";

@Injectable({
  providedIn: "root",
})
export class PermissionsService {
  personas: any;

  constructor(private storage: StorageService) {}
  setUserPersonas(personas: any) {
    this.personas = personas;
  }

  addPath(element: any, environment: string) {
    if (element.paths) {
      if (environment === "commercial") {
        element.path = element.paths.commercial;
      } else {
        element.path = element.paths.residential;
      }
    }
    return element;
  }
  getProfileDropdown(accountInfoSet: boolean, environment: any) {
    let filteredDropdown = [];
    let ignorePermissions = false;
    for (let element of dropdown) {
      if (element.divider) {
        filteredDropdown.push(element);
        continue;
      }

      if (environment === "commercial") {
        if (!element.environment?.commercial) continue;
      }

      if (environment === "residential") {
        if (!element.environment?.residential) continue;
      }

      if (element.personas?.default.state) {
        if (element.personas?.default.accountInfoRequired) {
          if (!accountInfoSet) continue;
        }

        filteredDropdown.push(this.addPath(element, environment));
        continue;
      }

       if(this.personas?.isZmsh === true && element.personas?.isZmsh){
        if (!element.personas?.isZmsh.state) continue;
      }

      if (this.personas?.csr) {
        ignorePermissions = element.personas?.csr?.ignorePermissions || false;
        if (environment === "commercial") {
          if (
            element.personas?.csr?.environment &&
            !element.personas?.csr?.environment.commercial
          )
            continue;
        }

        if (environment === "residential") {
          if (
            element.personas?.csr?.environment &&
            !element.personas?.csr?.environment?.residential
          )
            continue;
        }

        if (!element.personas?.csr.state) continue;
        if (element.personas?.csr.accountInfoRequired) {
          if (!accountInfoSet) continue;
        }
      }
      if (this.personas?.financialAdmin) {
        ignorePermissions =
          element.personas?.financialAdmin?.ignorePermissions || false;
        if (environment === "commercial") {
          if (
            element.personas?.financialAdmin?.environment &&
            !element.personas?.financialAdmin?.environment.commercial
          )
            continue;
        }

        if (environment === "residential") {
          if (
            element.personas?.financialAdmin?.environment &&
            !element.personas?.financialAdmin?.environment?.residential
          )
            continue;
        }
        if (!element.personas?.financialAdmin?.state) continue;
        if (element.personas?.financialAdmin?.accountInfoRequired) {
          if (!accountInfoSet) continue;
        }
      }
      if (this.personas?.financialUser) {
        ignorePermissions =
          element.personas?.financialUser?.ignorePermissions || false;
        if (environment === "commercial") {
          if (
            element.personas?.financialUser?.environment &&
            !element.personas?.financialUser?.environment.commercial
          )
            continue;
        }

        if (environment === "residential") {
          if (
            element.personas?.financialUser?.environment &&
            !element.personas?.financialUser?.environment?.residential
          )
            continue;
        }
        if (!element.personas?.financialUser?.state) continue;
        if (element.personas?.financialUser?.accountInfoRequired) {
          if (!accountInfoSet) continue;
        }
      }

      if (this.personas?.salesPerson ) {
        ignorePermissions =
          element.personas?.salePerson?.ignorePermissions || false;
        if (environment === "commercial") {
          if (
            element.personas?.salePerson.environment &&
            !element.personas?.salePerson.environment.commercial
          )
            continue;
        }

        if (environment === "residential") {
          if (
            element.personas?.salePerson.environment &&
            !element.personas?.salePerson?.environment?.residential
          )
            continue;
        }

        if (!element.personas?.salePerson.state) continue;
        if (element.personas?.salePerson.accountInfoRequired) {
          if (!accountInfoSet) continue;
        }
        if (element.personas?.salePerson.inHouseAccount) { // Inhouse true
          if (accountInfoSet) continue;
        }
      }
      if (this.personas?.salesOps) {
        ignorePermissions =
          element.personas?.salesOps?.ignorePermissions || false;
        if (environment === "commercial") {
          if (
            element.personas?.salesOps?.environment &&
            !element.personas?.salesOps?.environment.commercial
          )
            continue;
        }

        if (environment === "residential") {
          if (
            element.personas?.salesOps?.environment &&
            !element.personas?.salesOps?.environment?.residential
          )
            continue;
        }

        if (!element.personas?.salesOps?.state) continue;
        if (element.personas?.salesOps?.accountInfoRequired) {
          if (!accountInfoSet) continue;
        }
        if (element.personas?.salesOps?.inHouseAccount) { // Inhouse true
          if (accountInfoSet) continue;
        }
      }
      if (this.personas?.customer.state) {
        if (element.personas?.customer.accountInfoRequired) {
          if (!accountInfoSet) continue;
        }
        if (element.personas?.customer.multiAccount) {
          if (environment === "commercial") {
            if (!this.personas?.customer.multiAccount.commercial) continue;
          } else {
            if (!this.personas?.customer.multiAccount.residential) continue;
          }
        }
        if (!element.personas?.customer?.state) continue;

        if (this.personas?.shipToUser) {
          if (!element.personas?.shipToUser.state) continue;
        }
      }

      if (this.personas?.productManager) {
        ignorePermissions =
          element.personas?.productManager?.ignorePermissions || false;
        if (environment === "commercial") {
          if (
            element.personas?.productManager?.environment &&
            !element.personas?.productManager?.environment.commercial
          )
            continue;
        }

        if (environment === "residential") {
          if (
            element.personas?.productManager?.environment &&
            !element.personas?.productManager?.environment?.residential
          )
            continue;
        }
        if (!element.personas?.productManager?.state) continue;
        if (element.personas?.productManager?.accountInfoRequired) {
          if (!accountInfoSet) continue;
        }
      }

      //add more personas here
      if (element.permissions && !ignorePermissions) {
        const menuPermissions: any = element.permissions;
        const userPermissions = this.storage.userInfo?.userPermissions;
        if (userPermissions && userPermissions.length > 0) {
          let hasAccess = false;
          for (let a = 0; a < element.permissions.length; a++) {
            if (
              userPermissions.findIndex(
                (item: any) => item === menuPermissions[a]
              ) != -1
            ) {
              hasAccess = true;
              break;
            }
          }
          if (!hasAccess) {
            continue;
          }
        }
      }

      filteredDropdown.push(this.addPath(element, environment));
    }
    return filteredDropdown;
  }
}
