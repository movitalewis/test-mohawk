import { Injectable, TemplateRef } from "@angular/core";
import { environment } from "src/environments/environment";
import { StorageService } from "./storage.service";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { BsModalService } from "ngx-bootstrap/modal";

@Injectable({ providedIn: "root" })
export class SessionService {
  constructor(
    private indexedDB: StorageService,
    private http: HttpClient,
    private modalService: BsModalService
  ) {}
  expiredTemplate: any;
  currentURL = '';
  logout() {
    let token = sessionStorage.getItem("token");
    localStorage.clear();
    sessionStorage.clear();
    this.indexedDB.clear();
    this.authRevoke({ token: token }).subscribe((res: any) => {
      sessionStorage.setItem("loginSource", "xchange");
      window.location.href = environment.openAM + environment.hostURL;
    });
  }

  redirectToLogin(currentURL: string) {
    this.currentURL = currentURL;
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("tokenExpires");

    
    // this.storeCurrentLocation(currentURL);
    // sessionStorage.removeItem("inactiveSession");
    // window.location.href = environment.openAmRedirect +
    //   environment.hostURL +
    //   "#login";
    this.sessionIsExpired();
  }

  storeCurrentLocation(currentURL: string) {
    // debugger;
    sessionStorage.setItem("redirectURL", currentURL);
  }
  authRevoke(payload: any) {
    const url =
      environment.onDemand.baseUrl +
      environment.onDemand.apiAuth.split("?")[0].replace(/token$/, "revoke");

    const body = new URLSearchParams();
    body.set("token", payload.token);
    body.set("client_id", "sso-client");
    body.set("client_secret", "secret");

    const headers = new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded",
    });
    return this.http.post(url, body.toString(), { headers });
  }


  passTemplate(expired: TemplateRef<any>) {
    this.expiredTemplate = expired;
  }

  sessionIsExpired() {
    if((this.modalService?.config.id === undefined) || (this.modalService?.config?.id !== "invalidLoginModal" && this.modalService?.config?.id != "sessionExpiredModal")){
      this.modalService.show(this.expiredTemplate, {
        class: "modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
        id:"sessionExpiredModal"
      });
    }
  }

  redirectLoginPage(){
    this.storeCurrentLocation(this.currentURL);
    sessionStorage.removeItem("inactiveSession");
    sessionStorage.setItem("loginSource", "xchange");
    window.location.href = environment.openAmRedirect +
      environment.hostURL +
      "#login";
  }
}
