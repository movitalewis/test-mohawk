import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from "@angular/router";
import { Observable, of, ReplaySubject, Subject, throwError } from "rxjs";
import { catchError, mergeMap, take, takeUntil } from "rxjs/operators";

import { environment } from "src/environments/environment";
import { API_CONSTANTS } from "../shared/constants/API-CONSTANTS";
import { StorageService } from "./storage.service";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { ConfirmationDialogComponent } from "../shared/components/confirmation-dialog/confirmation-dialog.component";
import { TokenService } from "./token.service";
import { CommercialSiteSelectorService } from "./commercial-site-selector.service";
import { commercialSites } from "../shared/constants/commercial-sites";
@Injectable({
  providedIn: "root",
})
export class ApiService {
  modalRef?: BsModalRef;
  routingInprocess = false;
  constructor(
    private http: HttpClient,
    private router: Router,
    private tokenService: TokenService,
    private storageService: StorageService,
    private modalService: BsModalService,
    private activeRoute: ActivatedRoute,
    private commercialSiteSelectorService:CommercialSiteSelectorService

  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.routingInprocess = true;
        if (event.url != "/") {
          this.selectedEnvironment = "";
          this.ignoreRedirectURLforBaseSite = false;
        }
      } else if (event instanceof NavigationEnd) {
        this.routingInprocess = false;
        if(window.location.href.includes("salesperson") == false && window.location.href.includes("account/search") == false && window.location.href.includes("registration") == false && this.tokenService?.hasToken()){
          this.handleGetUnitProcess();
        }
      }
    });
  }
  selectedEnvironment: string = "";
  ignoreRedirectURLforBaseSite = false;

  responseType = {
    observe: "response",
  };

  miniCartSubject = new ReplaySubject(1);
  inprocess = false;

  get(url: any, options: any = {}): Observable<any> {
    if (
      this.inprocess == false &&
      window.location.href.includes("account/search") == false && 
      window.location.href.includes("salesperson") == false &&
      window.location.href.includes("code") == false && 
       this.routingInprocess === false && this.storageService?.userInfo
    ) {
     this.handleGetUnitProcess();
    }
    let requestOptions = { ...this.responseType, ...options };
    return this.http.get(this.setBaseSiteId(url), requestOptions).pipe(
      takeUntil(this.cancelRequest$),
      catchError((error: HttpErrorResponse) => of(error))
    );
    
  }

  handleGetUnitProcess(){
    this.inprocess = true;
    this.getDefaultUnit().subscribe((res: any) => {
      if(this.storageService.uidForDuplicate == '' || this.storageService.uidForDuplicate == null || this.storageService.uidForDuplicate == undefined ||  this.storageService.uidForDuplicate != res?.body?.id){
        // this.storageService.uidForDuplicate = this.storageService.userInfo?.orgUnit?.uid
        this.storageService.uidForDuplicate = res?.body?.id !== '' ? res?.body?.id :  this.storageService.userInfo?.orgUnit?.uid || '';
      }
      this.inprocess = false;
      let redirectUrl = this.router.url.includes("commercial")
      ? "commercial"
      : "residential";
      const accountId = res?.body?.id;
      const sessionId = res?.body?.id && res?.body?.id.split("_")[0] || "";
      if (
        accountId === "EMPTY_B2BUNIT" &&
        this.storageService.uidForDuplicate === ""
      ) {
       // this.handleDuplicateAlertNavigation(redirectUrl);
      } else {
        const uid = this.storageService.uidForDuplicate && this.storageService.uidForDuplicate.split("_")[0];
        const groupId = accountId.slice(accountId.length-3,accountId.length)
        redirectUrl = groupId === '_81' ? 'residential' :  groupId === '_82' ? 'commercial' : redirectUrl; 
        if(this.storageService?.userInfo?.isSalesPerson === true && this.storageService.skipMultilogin) {
          this.storageService.skipMultilogin = false;
          return;
        }   
        if (this.storageService.userInfo && this.storageService.userInfo?.orgUnit?.uid !== "EMPTY_B2BUNIT" && sessionId !== uid && this.modalRef == undefined
          && !this.storageService.skipMultilogin && window.location.href.includes("salesperson") == false && 
          window.location.href.includes("account/search") == false && res?.body?.statusCode !== '0001'
        ) {
          this.openConfirmationModal({
            title: "Duplicate Session Detected",
            content: `You have logged in to more than one browser with different accounts. Please select the account again`,
            primaryActionLabel: "Dismiss",
            secondaryActionLabel: "",
            disableSecondaryAction: true,
            onPrimaryAction: () => {
              this.modalService.hide("duplicateSessionModal");
              this.modalRef = undefined;
              this.storageService.uidForDuplicate = '';
              this.routingInprocess = true;
              this.storageService.skipMultilogin = false;
              this.handleDuplicateAlertNavigation(redirectUrl);
            },
          });
          setTimeout(() => {
            if (this.modalRef) {
              var openModals = document.querySelectorAll(".modal.show");
              if(openModals) {
                for(let i = 0; i < openModals.length; i++) {
                  //Get the modal-header of the modal
                  var modalHeader = openModals[i].querySelectorAll(".modal-header");
                  let titleName = openModals[i].querySelectorAll('.modal-title') &&
                                    openModals[i].querySelectorAll('.modal-title')[0].innerHTML;
                  if(modalHeader && modalHeader.length > 0 && titleName !='Duplicate Session Detected') {
                    //Get the close button in the modal header
                    var closeButton : any = modalHeader[0].getElementsByTagName("BUTTON");
                    if(closeButton && closeButton.length > 0) {
                      //simulate click on close button
                      closeButton[0].click();
                    }
                  }
                }
              }
              this.handleDuplicateAlertNavigation(redirectUrl);
            }
          }, 1000);
        } else {
          // this.storageService.setItem("uid", sessionId);
        }
        // });
      }
    });
  }


  openConfirmationModal(data: any = {}) {
    const initialState: ModalOptions = {
      backdrop: true,
      ignoreBackdropClick: true,
      initialState: {
        ...data,
      },
    };
    this.modalRef = this.modalService.show(
      ConfirmationDialogComponent,
      Object.assign(initialState, {
        id: "duplicateSessionModal",
        class: "modal-md modal-dialog-centered",
      })
    );
  }

  handleDuplicateAlertNavigation(redirectUrl:any) {
    if (this.storageService?.userInfo?.isSalesPerson === true) {
      this.cancelRequest();
      this.router.navigate(["/" + redirectUrl + "/salesperson"]).then(res=>{
        if(res === true){
        this.storageService.handleTriggerClearUnit();
        }
      });
    }
    else if (this.storageService?.userInfo?.isCustomer === true) {
      this.cancelRequest();
      this.router.navigate(["/" + redirectUrl]);
    }
    else if (this.storageService?.userInfo?.isProductManager === true) {
      this.cancelRequest();
      this.router.navigate(["/" + redirectUrl]);
    }
    else {
      this.cancelRequest();
      this.router.navigate(["/" + redirectUrl + "/account/search"]).then(res=>{
        if(res === true){
          this.storageService.handleTriggerClearUnit();
        }
      });
    }
  }
 
  private cancelRequest$ = new Subject<any>();
  cancelRequest() {
    this.cancelRequest$.next("");
    this.cancelRequest$.complete();
  }

   getDefaultUnit(options: any = {}) {
    const baseUrl = API_CONSTANTS.getDefaultUnit.replace(
      "{userId}",
      localStorage.getItem("userEmail")
    );
    let requestOptions = { ...this.responseType, ...options };
    return this.http
      .get(this.setBaseSiteId(baseUrl), requestOptions)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  getAsm(url: any, options: any = {}): Observable<any> {
    let token = sessionStorage.getItem("token") || "";
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      // "Access-Control-Allow-Origin": "*",
      // "Access-Control-Allow-Headers": "Content-Type",
      // Accept: "*/*",
    });

    let requestOptions = { ...this.responseType, ...options, headers };
    return this.http
      .get(this.setBaseSiteIdAsm(url), requestOptions)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  postASM(url: any, payload: any, options: any = {}): Observable<any> {
    let requestOptions = { ...options, ...this.responseType };
    return this.http.post(this.setBaseSiteIdAsm(url), payload, requestOptions);
  }

  getDataWithParam(path: string, payload: any): Observable<any> {
    let params = new HttpParams();
    params = params.appendAll(payload);
    return this.http.get(this.setBaseSiteId(path), { params: params }).pipe();
  }

  getMiniCartData(url: any): Observable<any> {
    let params = new HttpParams();
    // params = params.appendAll(payload);
    let apiUrl = this.setBaseSiteId(url);
    // apiUrl=apiUrl.replace('-d3-','-d2-')
    return this.http.get(apiUrl).pipe();
  }
  getMiniCart(customerNumber: any, uid: any) {
    let url = API_CONSTANTS.miniCart.replace(
      "{customerNumber}",
      this.storageService?.userInfo?.orgUnit?.uid
    );
    url = url.replace("{uid}", this.storageService?.userInfo?.uid);

    this.getMiniCartData(`${url}`).subscribe({
      next: (result: any) => {
        this.storageService.setItem("miniCartCount", result);
        this.miniCartSubject.next(result);
      },
      error: (error: any) => {
        this.storageService.setItem("miniCartCount", "");
        this.miniCartSubject.next("");
      },
    });
  }

  getUsingDynamicCatalog(url: any, options: any = {}): Observable<any> {
    let requestOptions = { ...this.responseType, ...options };
    return this.http.get(this.setDynamicSiteID(url), requestOptions).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(error);
      })
    );
  }

  getSalesTeam(uid: any) {
    let url = API_CONSTANTS.salesTeam.replace(
      "{customerNumber}",
      this.storageService.uid
    );

    let apiUrl = this.setBaseSiteId(url);
    // apiUrl=apiUrl.replace('-d3-','-d2-')
    return this.http.get(apiUrl).pipe();
  }

  getResidential(url: any, options: any = {}): Observable<any> {
    let requestOptions = { ...this.responseType, ...options };
    return this.http
      .get(
        `${environment.baseAPIURl}us_b2b_residential/${url}`,
        requestOptions
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(error);
        })
      );
  }

  post(url: any, payload: any, options: any = {}): Observable<any> {
    let requestOptions = { ...options, ...this.responseType };
    return this.http.post(this.setBaseSiteId(url), payload, requestOptions);
  }
  // "application/json; imageBase64; application/pdf; multipart/form-data"

  postFile(url: any, payload: any, options: any = {}): Observable<any> {
    const headers = new HttpHeaders({
      Accept: "*/*",
    });
    return this.http.post(this.setBaseSiteId(url), payload, {
      headers: headers,
    });
  }
  postDifferentUrl(url: any, payload: any, options: any = {}): Observable<any> {
    const headers = new HttpHeaders()
      .set(
        "Authorization",
        "Basic " +
          btoa(
            `${environment.addressValidationClientId}:${environment.addressValidationSecret}`
          )
      )
      .set("Content-Type", "application/json")
      .set("skipAuth", "true")
      .set("InterceptorSkipHeader", "");
    return this.http.post(url, payload, { headers: headers });
  }


  getDifferentUrl(url: any, options: any = {}): Observable<any> {
    console.log("url isss----->", url);
    const headers = new HttpHeaders()
      .set(
        "Authorization",
        "Basic " +
          btoa(
            `${environment.addressValidationClientId}:${environment.addressValidationSecret}`
          )
      )
      .set("Content-Type", "application/json")
      .set("skipAuth", "true")
      .set("InterceptorSkipHeader", "");
    return this.http.get(url, { headers: headers });
  }

  getUsingDynamicCatalogPost(
    url: any,
    payload: any,
    options: any = {}
  ): Observable<any> {
    let requestOptions = { ...options, ...this.responseType };
    return this.http.post(this.setDynamicSiteID(url), payload, requestOptions);
  }

  put(url: any, payload: any, options: any = {}) {
    let requestOptions = { ...options, ...this.responseType };
    return this.http
      .put(this.setBaseSiteId(url), payload, requestOptions)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }
  patch(url: any, payload?: any, options: any = {}) {
    let requestOptions = { ...options, ...this.responseType };
    return this.http
      .patch(this.setBaseSiteId(url), payload, requestOptions)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }
  delete(url: any, options: any = {}): Observable<any> {
    let requestOptions = { ...options, ...this.responseType };
    return this.http
      .delete(this.setBaseSiteId(url), requestOptions)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  setDynamicSiteID(url: string) {
    const formatedURl: string =
      environment.baseAPIURl +  this.getEnvirontment() + "/" + url;
    return formatedURl;
  }

  getEnvirontment() {
    const redirectURL = sessionStorage.getItem("redirectURL");
    if (
      !this.ignoreRedirectURLforBaseSite &&
      redirectURL &&
      redirectURL != "/"
    ) {
      return redirectURL.includes("commercial")
        ? this.getCommercialSiteBaseURL()
        : "us_b2b_residential";
    } else {
      const url =
        this.selectedEnvironment !== ""
          ? this.selectedEnvironment
          : this.router.url == "/"
          ? window.location.href
          : this.router.url.split("?")[0];
      return url.includes("commercial")
        ? this.getCommercialSiteBaseURL()
        : "us_b2b_residential";
    }
  }
  getEnvirontmentAsm() {
    const url =
      this.router.url == "/"
        ? window.location.href
        : this.router.url.split("?")[0];
    return url.includes("commercial")
      ? this.getCommercialSiteBaseURL()
      : "us_b2b_residential";
  }
  setBaseSiteId(url: string) {
    const formatedURl: string =
      environment.baseAPIURl + this.getEnvirontment() + "/" + url;
    return formatedURl;
  }
  setBaseSiteIdAsm(url: string) {
    const formatedURl: string =
      environment.baseASMAPIURl +
      "mohawkflooringasmwebservices/" +
      this.getEnvirontmentAsm() +
      "/" +
      url;
    return formatedURl;
  }

  getEarningStatement(payload: any) {
    let formatedURl: string = environment.earningsStatementUrl;
    return this.http.post(formatedURl, payload);
  }

  getSearchResults(url: string) {
    return this.http
      .get(this.setBaseSiteId(url))
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  getSearchSugestions(url: string) {
    // setBaseSiteId(url: string) {
    //   const formatedURl: string = environment.baseUrl + url;
    //   return formatedURl;
    // }
    return this.http
      .get(this.setBaseSiteId(url))
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  postAptCheckBaseUrl(url: any, payload: any, options: any = {}) {
    let requestOptions = { ...options, ...this.responseType };
    const formatedURl: string =
      environment.baseAPIURl +
      this.getEnvirontment() +
      "/" +
      url;
    return (
      this.http
        .post(formatedURl, payload, requestOptions)
        // .get(requestOptions+"?"+payload)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            return throwError(error);
          })
        )
    );
  }

  getUserDetails(url: any) {
    const requestUrl = environment.baseAPIURl + url;
    const headers = new HttpHeaders()
      .set("Access-Control-Allow-Origin", "*")
      .set("Access-Control-Allow-Headers", "Content-Type")
      .set(
        "Authorization",
        "Basic " +
          btoa(
            `${environment.onDemand.clientId}:${environment.onDemand.secret}`
          )
      )
      .set("Content-Type", "application/json");
    return this.http.post(requestUrl, {}, { headers: headers });
  }

  getHomePageDate(url: any): Observable<any> {
    return this.http
      .get(this.setBaseSiteId(url))
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  getCartEntries(accountNumber: string, userId: any): Observable<any> {
    let url =
      `${environment.baseAPIURl}us_b2b_residential/` +
      API_CONSTANTS.pricingGetCollectionsList.replace(
        "{accountNumber}",
        accountNumber
      );
    url = url.replace("{userId}", userId);
    return this.http.get(url).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(error);
      })
    );
  }

  getCommercialSiteBaseURL(){
    const site = this.commercialSiteSelectorService.selectedSite;
    return commercialSites[site] || commercialSites.C;
  }
}
