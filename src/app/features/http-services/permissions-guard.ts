import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanLoad,
  Route,
  Router,
  RouterStateSnapshot,
  UrlSegment,
  UrlTree,
} from "@angular/router";
import { Observable, of, switchMap } from "rxjs";
import {
  MASHUP_CONSTANTS,
  Permissions_CONSTANTS as PERMISSIONS_CONSTANTS,
} from "../shared/constants/URL-PERMISSIONS-CONSTANTS";
import { UserService } from "../shared/user/services/user.service";

@Injectable({
  providedIn: "root",
})
export class PermissionsGuard implements CanActivate {
  constructor(private router: Router, private userService: UserService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.userService.getCurrentUserDetail().pipe(
      switchMap((res: any) => {
        if (
          this.urlIsAllowed(state.url.split("?")[0], res.body.userPermissions)
        ) {
          return of(true);
        } else return of(false);
      })
    );
  }

  urlIsAllowed(targetUrl: string, permissions: any): boolean {
    let targetParts = targetUrl.slice(1).split("/");
    for (let item of PERMISSIONS_CONSTANTS) {
      let parts = item.url.slice(1).split("/");
      if (targetParts.length != parts.length) continue;

      let matches = true;
      for (let i = 0; i < parts.length; i++) {
        if (parts[i] === "{VARIABLE}") continue;
        if (parts[i] !== targetParts[i]) {
          

          matches = false;
        }
      }

      if (matches) {
        if (this.userCanAccess(item, permissions)) {
          return true;
        }
      }
    }
    return false;
  }
  userCanAccess(node: any, userPermissions: any): boolean {
    if (node.permissions === undefined) return true;
    let canAccess = false;
    for (let permissionGroup of node.permissions.is) {
      let passesAllPermissionsInAGroup = true;
      for (let permission of permissionGroup) {
        if (!userPermissions.includes(permission))
          passesAllPermissionsInAGroup = false;
      }
      if (passesAllPermissionsInAGroup) {
        canAccess = true;
        break;
      }
    }
    if (!canAccess) return false;
    if (node.permissions.not.length === 0) return true;

    for (let permissionGroup of node.permissions.not) {
      let excludesAtLeastOneInAGroup = false;
      for (let permission of permissionGroup) {
        if (!userPermissions.includes(permission))
          excludesAtLeastOneInAGroup = true;
      }
      if (!excludesAtLeastOneInAGroup) {
        return false;
      }
    }
    return true;
  }
}
