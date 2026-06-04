import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from "@angular/router";
import { BehaviorSubject, Observable, of, Subject, switchMap } from "rxjs";
import { MASHUP_CONSTANTS } from "../shared/constants/URL-PERMISSIONS-CONSTANTS";
import { MashupService } from "./mashup.service";
import { UserService } from "../shared/user/services/user.service";

@Injectable({
  providedIn: "root",
})
export class MashupGuard implements CanActivate {
  constructor(
    private mashupService: MashupService,
    private router: Router,
    private userService: UserService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    

    //get the email id and account number from state variable then set b2b unit
    return of(true);
    // return this.mashupService.isMashup.pipe(switchMap(isMashup => {
    //     if (isMashup) {
    //         if (this.urlIsAllowed(state.url.split("?")[0])) return of(true);
    //         else return of(false);
    //     }
    //     else return of(true);
    // }))
  }
  urlIsAllowed(targetUrl: string): boolean {
    // debugger;
    let targetParts = targetUrl.slice(1).split("/");
    for (let url of MASHUP_CONSTANTS) {
      let parts = url.slice(1).split("/");

      if (targetParts.length != parts.length) continue;

      let matches = true;
      for (let i = 0; i < parts.length; i++) {
        if (parts[i].includes("accountNumber") || parts[i].includes("email"))
          continue;
        if (parts[i] !== targetParts[i]) matches = false;
      }
      if (matches) {
        const targetUrlSlices = targetUrl.split("&");
        if (targetUrlSlices.length > 0) {
          let accoundId = "";
          let email = "";
          targetUrlSlices.forEach((url) => {
            if (url.includes("accountNumber")) {
              accoundId = url.slice(url.indexOf("=") + 1, url.length);
            }
            if (url.includes("email")) {
              email = url.slice(url.indexOf("=") + 1, url.length);
            }
          });
          if (accoundId !== "" && email !== "") {
            this.userService.setUserEmail(email);
            this.userService.setUnit("?unitUid=" + accoundId).subscribe();
          }
        }

        return true;
      }
    }
    return false;
  }
}
