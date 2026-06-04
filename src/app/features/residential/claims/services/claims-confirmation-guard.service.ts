import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from "@angular/router";
import { Observable, of } from "rxjs";
import { ClaimsService } from "./claims.service";

@Injectable({
  providedIn: "root",
})
export class ClaimsConfirmationGuardService implements CanActivate {
  constructor(private claimsService: ClaimsService, private router: Router) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    if (this.claimsService.claimNumber != "") {
      return of(true);
    } else {
      this.router.navigate(["./residential/claims/createclaim"]);
      return of(false);
    }
  }
}
