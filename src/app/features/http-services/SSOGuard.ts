import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from "@angular/router";
import { Observable, of, switchMap } from "rxjs";
import { UserService } from "../shared/user/services/user.service";
import { MashupService } from "./mashup.service";
import { TokenService } from "./token.service";
import { StorageService } from "src/app/features/http-services/storage.service";
import { SessionService } from "./session.service";
import { ActivityService } from "../shared/user/services/activity.service";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { InvalidLoginComponent } from "../shared/user/components/invalid-login/invalid-login.component";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class SSOGuard implements CanActivate {
  constructor(
    private router: Router,
    private http$: HttpClient,
    private tokenService: TokenService,
    private userService: UserService,
    private mashupService: MashupService,
    private storageService: StorageService,
    private sessionService: SessionService,
    private activityService: ActivityService,
    private modalService: BsModalService
  ) {}

  bsModalRef!: BsModalRef;

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    if (route.queryParams["mashup"] === "true") {
      sessionStorage.setItem("mashup", "true");

      if (route.queryParams["accountNumber"] !== undefined) {
        let accountNumber = route.queryParams["accountNumber"];
        localStorage.setItem("accountNumber", accountNumber);
        this.storageService.setselectedAccount(accountNumber);
      }
      // this.removeMashupFromURL(route, state);
    }
    if (sessionStorage.getItem("mashup") === "true") {
      this.mashupService.isMashup.next(true);
      this.mashupService.setMashupAccount(
        localStorage.getItem("accountNumber"),
        route.queryParams["state"] || route.queryParams["email"]
      );
    }
    console.log(route);
    if (this.tokenCanBeGeneratedFromCurrentURL(route)) {
      if(this.tokenService.hasToken()){
      this.router.navigateByUrl("/");
        return of(true);
      }
      let stateParam = route.queryParams["state"];
      // If login was NOT initiated from Xchange, user came from mohawktoday - redirect back
      const loginSource = sessionStorage.getItem("loginSource");
      sessionStorage.removeItem("loginSource");
      if (loginSource !== "xchange") {
        window.open(environment.mohawkToday, '_self');
        return of(false);
      }
      this.activityService.continueSession();
      let username = stateParam;
      let code = route.queryParams["code"];
      localStorage.setItem("userNames", username);
      this.userService.setUserEmail(username.toLowerCase());
      if (localStorage.getItem("accountNumber") === undefined) {
        localStorage.setItem("accountNumber", "");
      }

      localStorage.setItem("customerName", "");
      localStorage.setItem("customerAddress", "");
      this.userService.setAccountInfoState(false);
      return this.tokenService
        .generateToken(username, code)
        .pipe(
          switchMap((res) => {
            if (res.error) {
              const initialState: ModalOptions = {
                backdrop: true,
                ignoreBackdropClick: true,
              };
              this.bsModalRef = this.modalService.show(
                InvalidLoginComponent,
                Object.assign(initialState, {
                  id: "invalidLoginModal",
                  class: "modal-md modal-dialog-centered",
                  backdrop: "static",
                  keyboard: false,
                })
              );
              return of(false);

            }
            return this.userService.getDefaultPath();
          })
        )
        .pipe(
          switchMap((defaultPath) => {
            this.removeParamsFromURL(route, state);
            let url: string | null = defaultPath;
            if (
              sessionStorage.getItem("redirectURL") !== "/" &&
              sessionStorage.getItem("redirectURL") !== null
            ) {
              url = sessionStorage.getItem("redirectURL");
              sessionStorage.removeItem("redirectURL");
            }
            let directory = url?.split("?")[0];
            let params = url?.split("?")[1] || "";
            let queryParam = this.getQueryParamsFromUrl(url);
            if (params.includes("accountNumber")) {
              const accountParam = params.slice(
                params.indexOf("accountNumber="),
                params.length
              );
              const accountParamArray = accountParam.split("=");
              if (accountParamArray.length > 1 && accountParamArray[1] != "") {
                this.storageService.setItem("uid", accountParamArray[1]);
                this.userService
                  .setUnit("?unitUid=" + accountParamArray[1])
                  .subscribe(() => {
                    this.storageService.setselectedAccount(
                      accountParamArray[1]
                    );
                    this.userService.currentUserDetails.next(null);
                  });
              }
            }
            let formattedParams = new URLSearchParams(params);
            delete queryParam.email;
            delete queryParam.accountNumber;
            delete queryParam.mashup;
            console.log(queryParam);
            this.router.navigate([directory], { queryParams: {...formattedParams,...queryParam} });

            return of(true);
          })
        );
    }
    if (this.tokenService.hasToken()) {
      if (state.url === "/") this.router.navigateByUrl("/residential");
      return of(true);
    } else {
      this.sessionService.currentURL = state.url;
      this.sessionService.redirectLoginPage();
      return of(false);
    }
  }

  getQueryParamsFromUrl(url:any){
    const urlStr = url.replace(url?.split("?")[0]+'?','');
    let urlParam = urlStr.split('&');
    let queryParam:any = {};
    urlParam.forEach((element:any) => {
      const param = element.split('=');
      queryParam[param[0]] = param[1];
    });
return queryParam;
  }

  removeParamsFromURL(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {
    let queryParams = JSON.parse(JSON.stringify(route.queryParams));

    delete queryParams["code"];
    delete queryParams["state"];
    delete queryParams["iss"];
    delete queryParams["client_id"];

    this.router.navigate([state.url.substring(0, state.url.indexOf("?"))], {
      queryParams: queryParams,
      queryParamsHandling: "merge",
    });
  }

  // removeMashupFromURL(
  //   route: ActivatedRouteSnapshot,
  //   state: RouterStateSnapshot
  // ) {
  //   let queryParams = JSON.parse(JSON.stringify(route.queryParams));
  //   delete queryParams["mashup"];
  //   delete queryParams["accountNumber"];

  //   this.router.navigate([state.url.substring(0, state.url.indexOf("?"))], {
  //     queryParams: queryParams,
  //     queryParamsHandling: "merge",
  //   });
  // }

  tokenCanBeGeneratedFromCurrentURL(route: ActivatedRouteSnapshot): boolean {
    return (
      route.queryParams["code"] !== undefined &&
      route.queryParams["state"] !== undefined
    );
  }
}
