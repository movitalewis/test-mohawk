import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class AuthGaurdService implements CanActivate {
  constructor(private router: Router) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    sessionStorage.setItem("inputRoute", state.url);
    return true;

    const isLogedin: any = sessionStorage.getItem("userLogedin");
    if (isLogedin === "true") {
      return true;
    } else {
      this.router.navigateByUrl("/");
      return false;
    }
    return true;
  }
}
