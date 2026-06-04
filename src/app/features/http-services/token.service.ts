import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { Router } from "@angular/router";
import {
  catchError,
  map,
  Observable,
  of,
  Subject,
  take,
  throwError,
} from "rxjs";
import { environment } from "src/environments/environment";
import { ActivityService } from "../shared/user/services/activity.service";
import { StorageService } from "./storage.service";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { InvalidLoginComponent } from "../shared/user/components/invalid-login/invalid-login.component";
import { isPlatformBrowser } from "@angular/common";

@Injectable({ providedIn: "root" })
export class TokenService {
  secondsToRefreshBeforeExpiring = 10;
  tokenGenerated = new Subject();
  isBrowser: boolean;
  setTimer:any;
  userResumedSession:any;
  constructor(
    private http: HttpClient,
    private router: Router,
    private indexedDB: StorageService,
    private activityService: ActivityService,
    private modalService: BsModalService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    // if (this.hasToken()) {
    //   this.setRefreshTimer(
    //     this.getExpirationSeconds() - this.secondsToRefreshBeforeExpiring
    //   );
    // }
  }

  bsModalRef!: BsModalRef;
  isTokenGenerated = false;
  handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      
    } else {
      
    }
    return of(error);
  }

  generateToken(username: string, code: string): Observable<any> {
    const url =
      environment.onDemand.baseUrl +
     environment.onDemand.apiAuth.split("?")[0];

   
    const body = new URLSearchParams();
    body.set("grant_type", "sso");
    body.set("username", username.toLowerCase());
    body.set("auth_token", code);
    body.set("redirect_uri", environment.hostURL);
    body.set("client_id", "sso-client");
    body.set("client_secret", "secret");

    const headers = new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded",
    });
    return this.http.post(url, body.toString(), { headers }).pipe(
      map((token: any) => {
        sessionStorage.setItem("token", token.access_token);
        // sessionStorage.setItem("refresh_token", token.refresh_token);
        this.setExpiration(token.expires_in);
        this.tokenGenerated.next(true);
        this.isTokenGenerated = true;
        return token;
      }),
      catchError(this.handleError)
    );
  }

  getToken() {
    return sessionStorage.getItem("token");
  }

  setExpiration(seconds: number) {
    // if (seconds > 3600) seconds = 3600;
    let currentTime = new Date().getTime() / 1000;
    sessionStorage.setItem("tokenExpires", (currentTime + seconds).toString());
    // this.setRefreshTimer(seconds - this.secondsToRefreshBeforeExpiring);
  }

  // setRefreshTimer(seconds: number) {
  //   if (seconds < 0) seconds = 0;
  //   if (this.setTimer) {
  //     clearTimeout(this.setTimer);
  //   }
  //   this.setTimer = setTimeout(() => {
  //     this.refeshToken();
  //   }, seconds * 1000);
  // }

  // refeshToken() {
  //   if (this.activityService.userIsActive()) {
  //     this.isBrowser = false;
  //     let url =
  //       environment.onDemand.baseUrl +
  //       environment.onDemand.refreshAuth +
  //       "&refresh_token=" +
  //       sessionStorage.getItem("refresh_token");
  //     this.http.post(url, {}).subscribe((token: any) => {
  //       this.isBrowser = true;
  //       sessionStorage.setItem("token", token.access_token);
  //       sessionStorage.setItem("refresh_token", token.refresh_token);
  //       this.setExpiration(token.expires_in);
  //       this.tokenGenerated.next(true);
  //     });
  //   } else {
  //     if(this.userResumedSession){
  //       this.userResumedSession.unsubscribe();
  //     }
  //     this.userResumedSession = this.activityService.userResumedSession.pipe(take(1)).subscribe(() => {
  //       this.refeshToken();
  //       if(this.userResumedSession){
  //         this.userResumedSession.unsubscribe();
  //       }
  //     });
  //   }
  // }

  getExpirationSeconds() {
    let expirationTime = sessionStorage.getItem("tokenExpires");
    let currentTime = new Date().getTime() / 1000;
    return Number(expirationTime) - currentTime;
  }

  hasToken() {
    if (!this.isBrowser) {
      return false;
    }

    return sessionStorage.getItem("token") !== null;
    // return sessionStorage.getItem("token") !== null && !this.tokenIsExpired();
  }

  // tokenIsExpired(): boolean {
  //   let expirationTime = sessionStorage.getItem("tokenExpires");
  //   if (expirationTime === null) return true;
  //   let currentTime = new Date().getTime() / 1000;
  //   console.log('tokenExpires', expirationTime);
  //   console.log('currentTime', currentTime);
  //   return Number(expirationTime) - currentTime < 0;
  // }
}
