import { HttpErrorResponse, HttpClient, HttpHeaders } from "@angular/common/http";
import { HostListener, Injectable } from "@angular/core";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import {
  BehaviorSubject,
  ReplaySubject,
  catchError,
  map,
  of,
  switchMap,
  tap,
} from "rxjs";
import { Observable } from "rxjs/internal/Observable";
import { ApiService } from "src/app/features/http-services/api.service";
import { PermissionsService } from "src/app/features/http-services/permissions.service";
import { StorageService } from "src/app/features/http-services/storage.service";
import { API_CONSTANTS } from "src/app/features/shared/constants/API-CONSTANTS";
import { environment } from "src/environments/environment";
import {
  GuardsCheckEnd,
  NavigationEnd,
  NavigationStart,
  Router,
  RoutesRecognized,
} from "@angular/router";
import { StorefrontSelectorComponent } from "../components/storefront-selector/storefront-selector.component";
import { ConfirmationDialogComponent } from "../../components/confirmation-dialog/confirmation-dialog.component";
import { TokenService } from "src/app/features/http-services/token.service";
import { MESSAGE_CONSTANTS } from "../../constants/MESSAGE-CONSTANTS";
import { ProgressModalComponent } from "../../components/progress-modal/progress-modal.component";

@Injectable({
  providedIn: "root",
})
export class UserService {
  //   this.currentDataSubject.unsubscribe();
  // }
  // this.currentDataSubject = this.currentUserDetails.subscribe(
  //   (res: any) => {
  //     if (res != null) {
  //       this.currentDataSubject.unsubscribe();
  //       this.currentUserDetails.next(res);
  //     }
  //   }
  // );
  // return this.currentUserDetails.asObservable();
  createB2BUnit() {
    throw new Error("Method not implemented.");
  }
  asmUserInfo: any = {};
  userEmail: any;
  userPerona: userPersonas | undefined;
  userAddress = new ReplaySubject<any>(1);
  accountInfoSet = new BehaviorSubject<boolean>(false);
  salesAccountSet = new BehaviorSubject<boolean>(false);
  isCSR = new BehaviorSubject<boolean>(false);
  isCustomer = new BehaviorSubject<boolean>(false);
  isSalesPerson = new BehaviorSubject<boolean>(false);
  isSalesOps = new BehaviorSubject<boolean>(false);
  isALCBDM = new BehaviorSubject<boolean>(false);
  isResidentialManager = new BehaviorSubject<boolean>(false);
  isFinancialSuperAdmin = new BehaviorSubject<boolean>(false);
  isFinancialUser = new BehaviorSubject<boolean>(false);
  isIsAdmin = new BehaviorSubject<boolean>(false);
  isMtAdvertising = new BehaviorSubject<boolean>(false);
  isMtDistributor = new BehaviorSubject<boolean>(false);
  isMtMarketing = new BehaviorSubject<boolean>(false);
  b2bAdmin = new BehaviorSubject<boolean>(false);
  currentUserDetails = new BehaviorSubject<any>(null);
  uidSet = false;
  isInhouseAccount = new BehaviorSubject<boolean>(false);
  isShipToUser = new BehaviorSubject<boolean>(false);
  isMultiAccountCustomer = new BehaviorSubject<boolean>(false);
  modalRef!: BsModalRef;
  isLoading = false;
  isMohawkOneuser = new BehaviorSubject<boolean>(false);
  salesBlocked: boolean = false;  
  getUserPersonas(): Observable<userPersonas> {
    if (this.userPerona === undefined) {
      return this.getCurrentUserDetail().pipe(
        switchMap((response) => {
          this.storageService.setItem("uid", response?.body?.uid);

          let body = response?.body;
          this.userPerona = {
            csr: body.isCSR,
            salesOP: body.isSalesOps,
            productManager: body.isProductManager,
            salesPerson: body.isSalesPerson,
            salesOps: body.isSalesOps || body?.isALCBDM || body?.isResidentialManager,
            cutomer: body.isCustomer,
            financialAdmin: body.isFinancialSuperAdmin,
            financialUser: body.isFinancialUser,
            isIsAdmin: body.isIsAdmin,
            isMohawkOneuser: body.isMohawkOneuser,
            isMtDistributor: body.isMtDistributor,
            isMtAdvertising: body.isMtAdvertising,
            isMtMarketing: body.isMtMarketing,
          };
          return of(this.userPerona);
        })
      );
    }
    return of(this.userPerona);
  }
  environmentForCartModal = "";
  stopCurrentDetailsLoading: boolean = false;
  constructor(
    private apiService: ApiService,
    private storageService: StorageService,
    private http: HttpClient,
    private permissionService: PermissionsService,
    private router: Router,
    private modalService: BsModalService,
    private tokenService:TokenService
  ) {
    if (localStorage.getItem("accountInfo") === "true")
      this.accountInfoSet.next(true);
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.environmentForCartModal = this.router.url.includes("commercial")
          ? "us_b2b_commercial"
          : "us_b2b_residential";

        this.stopCurrentDetailsLoading = true;
      } else if (event instanceof RoutesRecognized) {
        this.stopCurrentDetailsLoading = false;
      }
    });
  }

  registerUser(userDetails: any, token: string): Observable<any> {
    const headers = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        BearerToken: `Bearer ${token}`,
        Authorization:
            "Basic " + btoa(`${environment.sentinentUser}:${environment.sentinentPwd}`)
      }),
    };
     
    const url = `${API_CONSTANTS.customers.replace(
      "{userId}",
      "anonymous"
    )}/register`;

    return this.apiService.post(url, userDetails, headers);
  }
  
  registerMTUser(userDetails: any, token: string): Observable<any> {
    const headers = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
       BearerToken: `Bearer ${token}`,
        Authorization:
            "Basic " + btoa(`${environment.sentinentUser}:${environment.sentinentPwd}`)
      }),
    };
    const url = `${API_CONSTANTS.customers.replace(
      "{userId}",
      "anonymous"
    )}/registerMT`;

    return this.apiService.post(url, userDetails, headers);
  }
  currentDataSubject: any;
  getCurrentUserDetail() {
    // this.getUserEmail();
    // return this.apiService
    //   .get(API_CONSTANTS.userDetailing + this.getUserEmail())
    //   .pipe(
    //     catchError((error: HttpErrorResponse) => of(error)),
    //     tap((response) => {
    //       this.isCSR.next(response.body.isCSR);
    //       if (!response.body.isCSR) this.accountInfoSet.next(true);
    //     })
    //   );
    if (this.currentUserDetails.getValue() === null) {
      if (this.currentUserAPILoading) {
        // if (this.currentDataSubject) {
        //   this.currentDataSubject.unsubscribe();
        // }
        // this.currentDataSubject = this.currentUserDetails.subscribe(
        //   (res: any) => {
        //     if (res != null) {
        //       this.currentDataSubject.unsubscribe();
        //       this.currentUserDetails.next(res);
        //     }
        //   }
        // );
        // return this.currentUserDetails.asObservable();
        this.asmUserInfo = {};
        return this.getCurrentUserDetailData(true);
      } else {
        return this.getCurrentUserDetailData(true);
      }
    } else {
      return new Observable((observaber: any) => {
        observaber.next(this.currentUserDetails.getValue());
        observaber.complete();
      });
      // return test;
      // return this.currentUserDetails.asObservable();
    }
  }
  currentUserAPILoading = false;
  bsModalRef!: BsModalRef;
  getCurrentUserDetailData(setCurrentUserDetails: boolean): Observable<any> {
    // if (this.stopCurrentDetailsLoading) {
    //   return new Observable((observaber: any) => {
    //     observaber.next(this.currentUserDetails.getValue());
    //     observaber.complete();
    //   });
    // }
    this.currentUserAPILoading = true;
    const email = this.getUserEmail();
    let url = API_CONSTANTS.userDetailing + email;
    url = sessionStorage.getItem("startSession")
      ? url + "?impersonateFlag=true"
      : url;
    this.asmUserInfo = {};
    return this.apiService.get(url).pipe(
      catchError((error: HttpErrorResponse) => of(error)),
      map((response) => {
        // currentUserDetails
        this.storageService.setItem(
          "builderOrderAllowed",
          response?.body?.orgUnit?.builderOrderAllowed
        );
        if (
          this.storageService.userInfo?.orgUnit?.uid !== " " &&
          this.storageService.userInfo?.orgUnit?.uid !==
            response?.body?.orgUnit.uid &&
          this.modalService["modalsCount"] === 0 &&
          this.storageService.cartData?.code
        ) {
          const cartId = this.storageService.cartData?.code;
          const selectedEnvironment = this.environmentForCartModal;
          if (this.storageService.userInfo?.isCustomer) {
            this.showCartModal(cartId, selectedEnvironment);
          }
        }

        if (response?.body?.isASMUser) {
          localStorage.setItem("isASMUser", response?.body?.isASMUser);
          localStorage.setItem("loginUser", response?.body?.uid);
        }
        this.currentUserAPILoading = false;
        this.setUserPersonas(response);
        this.isCSR.next(response?.body?.isCSR);
        this.isCustomer.next(response?.body?.isCustomer);
        this.isSalesPerson.next(response?.body?.isSalesPerson);
        this.isSalesOps.next(response?.body?.isSalesOps || response?.body?.isALCBDM || response?.body?.isResidentialManager);
        this.isALCBDM.next(response?.body?.isALCBDM);
        this.isResidentialManager.next(response?.body?.isResidentialManager);
        this.isFinancialSuperAdmin.next(response?.body?.isFinancialSuperAdmin);
        this.isFinancialUser.next(response?.body?.isFinancialUser);
        this.isIsAdmin.next(response?.body?.isIsAdmin);
        this.b2bAdmin.next(response?.body?.b2bAdmin);
        this.isInhouseAccount.next(response?.body?.orgUnit?.inHouseAccount);
        this.isShipToUser.next(response?.body?.orgUnit?.accountType === "ZMSH");
        this.isMohawkOneuser.next(response?.body?.isMohawkOneuser);
        this.isMtAdvertising.next(response?.body?.isMtAdvertising);
        this.isMtDistributor.next(response?.body?.isMtDistributor);
        this.isMtMarketing.next(response?.body?.isMtMarketing);
        this.salesBlocked = response?.body?.orgUnit?.salesBlocked;
        let priceLabel = response?.body?.priceLabel;

        if(response?.body?.priceLabel === ""){
          const uid = response?.body?.orgUnit?.uid.split('_');
          if(uid[1] === '8122'){
            priceLabel = "CAD"
          }else{
            priceLabel = "USD"
          }
        }
        let userinfo = {
          accounts: response?.body?.accounts,
          uid: response?.body?.uid,
          name: response?.body?.name,
          mobilePhone: this.cleanPhoneNumber(response?.body?.mobilePhone),
          isCSR: response?.body?.isCSR,
          isProductManager: response?.body?.isProductManager,
          isSalesOps: response?.body?.isSalesOps || response?.body?.isALCBDM || response?.body?.isResidentialManager,
          isALCBDM: response?.body?.isALCBDM,
          isResidentialManager: response?.body?.isResidentialManager,
          isSalesPerson: response?.body?.isSalesPerson,
          isCSRSuperAdmin: response?.body?.isCSRSuperAdmin,
          isFinancialSuperAdmin: response?.body?.isFinancialSuperAdmin,
          isFinancialUser: response?.body?.isFinancialUser,
          isIsAdmin: response?.body?.isIsAdmin,
          isMtAdvertising: response?.body?.isMtAdvertising,
          isMtDistributor: response?.body?.isMtDistributor,
          isMtMarketing: response?.body?.isMtMarketing,
          b2bAdmin: response?.body?.b2bAdmin,
          isShipToUser: response?.body?.orgUnit?.accountType === "ZMSH",
          salesManRole: response?.body?.salesManRole,
          priceLabel: priceLabel,
          isCustomer: response?.body?.isCustomer,
          salesPersonAvailableSites: response?.body?.salesPersonAvailableSites,
          userPermissions: response?.body?.userPermissions || [],
          orgUnit: response?.body?.orgUnit || {},
          defaultAddress: response?.body?.defaultAddress || {},
          defaultStorefront: response?.body?.defaultStorefront || '',
          isMohawkOneuser: response?.body?.isMohawkOneuser,
          primaryRole: response?.body?.primaryRole,
          workPhone:this.cleanPhoneNumber(response?.body?.workPhone),
          uuid: response?.body?.uuid || '',
          isCustomOrderView: response?.body?.isCustomOrderView
        };
        this.storageService.setItem("userInfo", userinfo);
        this.storageService.setItem("uid", response?.body?.orgUnit?.uid);
        // localStorage.setItem('customerAddress', '');
        if (!this.isCSR.getValue()) {
          if (response?.body?.orgUnit?.uid.includes("_82")) {
            this.apiService.ignoreRedirectURLforBaseSite = true;
            this.apiService.selectedEnvironment = "us_b2b_commercial";
          } else if (response?.body?.orgUnit?.uid.includes("_81")) {
            this.apiService.ignoreRedirectURLforBaseSite = true;
            this.apiService.selectedEnvironment = "us_b2b_residential";
          }
          this.getAddress(response?.body?.orgUnit?.uid).subscribe((res) => {
            this.userAddress.next(res?.body[0]?.addresses[0]?.formattedAddress);
            if(res?.body[0]?.accountType === "ZMSH"){
              localStorage.setItem("soldTo", res?.body[0]?.soldTo);
            }
          });
          // if (sessionStorage.getItem("isUidSet") !== "true") {
          //   if (response?.body?.accounts?.length > 1) {
          //     // if(this.isCustomer.getValue()) this.isMultiAccountCustomer.next(true);
          //   } else {
          //     let custUid = response?.body?.accounts?.uid;

          //     if (
          //       response?.body?.isCustomer === true &&
          //       custUid === undefined
          //     ) {
          //       custUid = response?.body?.accounts?.[0].uid;
          //     }
          //     //***** */ this.setUnit("?unitUid=" + custUid).subscribe(() =>
          //     //   sessionStorage.setItem("isUidSet", "true")
          //     // );
          //   }
          // }
          //this.getMiniCart(response?.body.orgUnit.uid);
        }
        // if (
        //   response?.body?.isCSR &&
        //   response?.body?.orgUnit?.uid === "EMPTY_B2BUNIT"
        // ) {
        //   const url = this.router.url;
        //   const moduleName = url.includes("commercial")
        //     ? "commercial"
        //     : "residential";
        //   this.router.navigate(["/" + moduleName + "/account/search"]);
        // }
        // this.getMiniCart(response?.body.orgUnit.uid);
        // if (!response.body.isCSR) {
        //   this.accountInfoSet.next(true);
        // } else {
        //   this.accountInfoSet.next(false);
        // }
        if ((setCurrentUserDetails = true)) {
          if(response?.body){
            response.body.isSalesOps = response?.body?.isSalesOps || response?.body?.isALCBDM || response?.body?.isResidentialManager; 
          }
          this.currentUserDetails.next(response);
        }
        return this.injectPermissions(response);
      })
    );
  }
  injectPermissions(response: any): any {
    if (
      response?.body?.isCSR ||
      response?.body?.isSalesOps ||
      response?.body?.isSalesPerson || response?.body?.isALCBDM ||
      response?.body?.isResidentialManager
    ) {
      response?.body?.userPermissions?.push("Merchandising");
    }
    return response;
  }

  getReserveDetails(): Observable<any> {
    const url = API_CONSTANTS.customerDetail.replace(
      "{userId}",
      this.getUserEmail()
    );
    return this.apiService
      .get(url)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }
  getCurrentCustomerDetail(): Observable<any> {
    this.getUserEmail();
    // return this.apiService
    //   .get(API_CONSTANTS.customerDetail + this.getUserEmail())
    //   .pipe(catchError((error: HttpErrorResponse) => of(error)));
    const url = API_CONSTANTS.customerDetail.replace(
      "{userId}",
      this.getUserEmail()
    );
    return this.apiService
      .get("users/" + url + this.getUserEmail())
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  setUserEmail(userEmail: string) {
    this.userEmail = userEmail;
    localStorage.setItem("userEmail", userEmail);
  }

  getUserEmail() {
    if (this.userEmail === undefined) {
      this.userEmail = localStorage.getItem("userNames");
      localStorage.setItem("userEmail", this.userEmail);
      let userEmail:any = this.userEmail ? this.userEmail.toLowerCase() : this.userEmail;
      return userEmail;
    } else {
      localStorage.setItem("userEmail", this.userEmail);
      let userEmail:any = this.userEmail ? this.userEmail.toLowerCase() : this.userEmail;
      return userEmail;
    }
  }

  gteAcoountNumber() {
    return localStorage.getItem("accountNumber");
  }

  getAddress(selectedAccount: any) {
    const url = `${API_CONSTANTS.customers.replace(
      "{userId}",
      this.getUserEmail().toLowerCase()
    )}/populateSuffix?selectedAccount=${selectedAccount}`;
    return this.apiService.get(url);
  }

  setAccountInfoState(state: boolean) {
    this.accountInfoSet.next(state);
    localStorage.setItem("accountInfo", state ? "true" : "false");
  }

  setUserPersonas(response: any) {
    this.permissionService.setUserPersonas({
      asm: response?.body?.isASMUser,
      csr: response?.body?.isCSR,
      csrAdmin: response?.body?.isCSRSuperAdmin,
      productManager: response?.body?.isProductManager,
      salesPerson: response?.body?.isSalesPerson,
      salesOps: response?.body?.isSalesOps || response?.body?.isALCBDM || response?.body?.isResidentialManager,
      financialAdmin: response?.body?.isFinancialSuperAdmin,
      financialUser: response?.body?.isFinancialUser,
      isIsAdmin: response?.body?.isIsAdmin,
      customer: {
        state: response?.body?.isCustomer,
        multiAccount: {
          commercial:
            response?.body?.accounts?.filter(
              (account: any) => account?.company === "C"
            ).length > 1,
          residential:
            response?.body?.accounts?.filter(
              (account: any) => account?.company === "R"
            ).length > 1,
        },
      },
      shipToUser: response?.body?.orgUnit?.accountType === "ZMSH",
      isZmsh: response?.body?.orgUnit?.accountType === "ZMSH",
      isMohawkOneuser : response?.body?.isMohawkOneuser,
      isMtAdvertising: response?.body?.isMtAdvertising,
      isMtDistributor: response?.body?.isMtDistributor,
      isMtMarketing: response?.body?.isMtMarketing,
      // isSalesBlocked: response?.body?.salesBlocked,
    });
  }

  getDefaultPath() {
    return this.getCurrentUserDetailData(false)
      .pipe(
        switchMap((response: any) => this.resolveDefaultStorefront(response))
      )
      .pipe(
        switchMap((response: any) => this.getPathBasedOnUserPersona(response))
      );
  }
  getPathBasedOnUserPersona(response: any): Observable<any> {
    {
      this.storageService.setItem("uid", response?.body?.orgUnit?.uid);
      let userinfo = {
        uid: response?.body?.uid,
        name: response?.body?.name,
        mobilePhone: this.cleanPhoneNumber(response?.body?.mobilePhone),
        isCSR: response?.body?.isCSR,
        isProductManager: response?.body?.isProductManager,
        isSalesOps: response?.body?.isSalesOps || response?.body?.isALCBDM || response?.body?.isResidentialManager,
        isALCBDM: response?.body?.isALCBDM,
        isResidentialManager: response?.body?.isResidentialManager,
        isSalesPerson: response?.body?.isSalesPerson,
        isCustomer: response?.body?.isCustomer,
        isFinancialSuperAdmin: response?.body?.isFinancialSuperAdmin,
        isFinancialUser: response?.body?.isFinancialUser,
        isIsAdmin: response?.body?.isIsAdmin,
        b2bAdmin: response?.body?.b2bAdmin,
        salesManRole: response?.body?.salesManRole,
        priceLabel: response?.body?.priceLabel,
        salesPersonAvailableSites: response?.body?.salesPersonAvailableSites,
        orgUnit: response?.body?.orgUnit,
        defaultAddress: response?.body?.defaultAddress || {},
        userPermissions: response?.body?.userPermissions,
        defaultStorefront: response?.body?.defaultStorefront || '',
        isMohawkOneuser: response?.body?.isMohawkOneuser,
        isMtAdvertising: response?.body?.isMtAdvertising,
        isMtDistributor: response?.body?.isMtDistributor,
        isMtMarketing: response?.body?.isMtMarketing,
        primaryRole: response?.body?.primaryRole,
        workPhone:this.cleanPhoneNumber(response?.body?.workPhone),
         uuid: response?.body?.uuid || '',
      };
      let storefront =
        response?.body?.defaultStorefront === "R"
          ? "residential"
          : "commercial";
      this.setEnvironment(storefront);
      this.storageService.setItem("userInfo", userinfo);
      this.storageService.setItem("uid", response?.body?.orgUnit?.uid);
      if(userinfo?.isSalesPerson && !userinfo?.isSalesOps && userinfo?.orgUnit?.inHouseAccount){
        this.storageService.setItem("inHouseAccount", userinfo?.orgUnit);
      }
      this.setUserPersonas(response);

      if (
        response?.body?.isCSR ||
        response?.body?.isFinancialSuperAdmin ||
        response?.body?.isFinancialUser ||
        response?.body?.isIsAdmin
      ) {
        return this.clearB2BUnit().pipe(
          switchMap(() => {
            return of(`${storefront}/account/search`);
          })
        );
      }
      if (response?.body?.isCustomer) {
        let filteredAccounts = response?.body?.accounts?.filter(
          (account: any) =>
            account.company === response?.body?.defaultStorefront
        );
        if (filteredAccounts?.length > 1) {
          this.isMultiAccountCustomer.next(true);
          return this.clearB2BUnit().pipe(
            switchMap(() => {
              return of(`${storefront}/account/multi-account`);
            })
          );
        }
        //***** */ this.setUnit("?unitUid=" + filteredAccounts?.[0].uid).subscribe();
        this.setAccountInfoState(true);
        return of(`${storefront}`);
      }
      if (response?.body?.isSalesPerson || response?.body?.isSalesOps ||
        response?.body?.isALCBDM || response?.body?.isResidentialManager
      ) {
        return this.clearB2BUnit().pipe(
          switchMap(() => {
            let url = this.isSalesPerson
              ? "salesperson"
              : "salesperson/view-accounts";

            return of(`${storefront}/${url}`);
          })
        );
      }
      if (response?.body.isProductManager
      ) {
        return this.clearB2BUnit().pipe(
          switchMap(() => {
            let url = "product-owner";
            return of(`${storefront}/${url}`);
          })
        );
      }
      return of(`${storefront}`);
    }
  }
  resolveDefaultStorefront(response: any): Observable<any> {
    this.navigateToMohawkTodayCheck(response);
    {
      const hasOnlyResidential = response?.body?.accounts?.every(
        (account: any) => account.company === "R"
      );
      const hasOnlyCommercial = response?.body?.accounts?.every(
        (account: any) => account.company === "C"
      );

      if (response?.body?.defaultStorefront === "") {
        if (response?.body?.isCustomer) {
          if (hasOnlyCommercial) {
            this.setDefaultStorefront("C").subscribe();
            response.body.defaultStorefront = "C";
            this.setEnvironment("commercial");
            return of(response);
          }
          if (hasOnlyResidential) {
            this.setDefaultStorefront("R").subscribe();
            response.body.defaultStorefront = "R";
            this.setEnvironment("residential");
            return of(response);
          }
        }

        if (response?.body?.isSalesPerson || response?.body?.isSalesOps || response?.body?.isALCBDM 
              || response?.body?.isResidentialManager
        ) {
          let availableSites = response?.body?.salesPersonAvailableSites;
          if (availableSites?.length === 1) {
            this.setDefaultStorefront(availableSites[0]);
            response.body.defaultStorefront = availableSites[0];
            return of(response);
          }
        }

        const initialState: ModalOptions = {
          backdrop: true,
          ignoreBackdropClick: true,
        };
        this.bsModalRef = this.modalService.show(
          StorefrontSelectorComponent,
          Object.assign(initialState, {
            id: "storefrontSelectorModal",
            class: "modal-md modal-dialog-centered",
            keyboard: false,
          })
        );
        return this.bsModalRef.content.optionSelected?.pipe(
          switchMap((selectedDefaultStorefront) => {
            response.body.defaultStorefront = selectedDefaultStorefront;
            return of(response);
          })
        );
      }
      return of(response);
    }
  }

  getUserDetails(payload: any) {
    const url =
      API_CONSTANTS.getUserInfo +
      `?grant_type=password&username=${this.getUserEmail()}&password=${
        payload.password
      }`;
    return this.apiService
      .getUserDetails(url)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  getDefaultAddressWithEmail(): Observable<any> {
    const url =
      API_CONSTANTS.allAddress.replace("{userId}", "current") +
      `${this.getUserEmail().toLowerCase()}/getAllAddresses`;

    return this.apiService.get(url);
  }
  setUnit(urlExt: string) {
    let url;
    let loginUserUrl;
    const impersonateFlag: boolean = true;
    const loginUser = localStorage.getItem("loginUser");
    const startSession = sessionStorage.getItem("startSession");
    // const loginUser=this.storageService.getItem('loginUser')
    if (urlExt === "?unitUid=undefined") {
      urlExt = "?unitUid=";
      url =
        startSession === "true"
          ? API_CONSTANTS.setUnit.replace("{userId}", this.getUserEmail().toLowerCase()) +
            urlExt +
            `&impersonateFlag=${impersonateFlag}`
          : API_CONSTANTS.setUnit.replace("{userId}", this.getUserEmail().toLowerCase()) +
            urlExt;
      loginUserUrl =
        API_CONSTANTS.setUnit.replace("{userId}", loginUser?.toLowerCase()) + urlExt;
    } else {
      urlExt = urlExt.includes("unitUid") ? urlExt : "?unitUid=";
      url =
        startSession === "true"
          ? API_CONSTANTS.setUnit.replace("{userId}", this.getUserEmail()) +
            urlExt +
            `&impersonateFlag=${impersonateFlag}`
          : API_CONSTANTS.setUnit.replace("{userId}", this.getUserEmail().toLowerCase()) +
            urlExt;
      loginUserUrl =
        API_CONSTANTS.setUnit.replace("{userId}", loginUser?.toLowerCase()) + urlExt;
    }
    if (sessionStorage.getItem("startSession")) {
      this.apiService.patch(loginUserUrl, {}).subscribe();
    }
    // const url =
    //   API_CONSTANTS.setUnit.replace("{userId}", this.getUserEmail()) + urlExt;
    this.isLoading = true;
    if (url.includes("_82")) {
      this.apiService.ignoreRedirectURLforBaseSite = true;
      this.apiService.selectedEnvironment = "us_b2b_commercial";
    } else if (url.includes("_81")) {
      this.apiService.ignoreRedirectURLforBaseSite = true;
      this.apiService.selectedEnvironment = "us_b2b_residential";
    }
    return this.apiService.patch(url, {}).pipe(
      switchMap((res: any) => {
        if (
          res?.body?.message.includes(
            "Default B2B unit is set for the current customer."
          )
        )
          this.isLoading = false;
        localStorage.removeItem("plpUrl");
        this.getCurrentUserDetailData(true).subscribe();
        return of(res);
      })
    );
  }
  clearB2BUnit() {
    const url =
      API_CONSTANTS.setUnit.replace("{userId}", this.getUserEmail().toLowerCase()) +
      "?unitUid=";
    return this.apiService.patch(url, {}).pipe(
      tap((res) => {
        this.getCurrentUserDetailData(true).subscribe();
      })
    );
  }

  // getAnonymousToken() {
  //   const base = environment.baseASMAPIURl;
  //   const grant_type = "grant_type=" + environment.onDemand.grant_types.client;
  //   const userName = "client_id=" + environment.onDemand.clientId;
  //   const secret = "client_secret=" + environment.onDemand.secret;

  //   return this.http.post(
  //     `${base}authorizationserver/oauth/token`,
  //     {}
  //   );
  // }
  getAnonymousToken() {
  const base = environment.baseASMAPIURl;

  const body = new URLSearchParams();
  body.set('grant_type', environment.onDemand.grant_types.client);

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': 'Basic ' + btoa(
      `${environment.onDemand.clientId}:${environment.onDemand.secret}`
    )
  };

  return this.http.post(
    `${base}authorizationserver/oauth/token`,
    body.toString(),
    { headers }
  );
}


  forgotPassword(email: any) {
    const url = environment.openAMForgot +`${email}`;
    return this.http.get(url);
  }

  resetPassword(payload: any) {
    const url = `${API_CONSTANTS.customers.replace(
      "{userId}",
      "anonymous"
    )}/change`;
    return this.apiService.post(url, payload);
  }

  getMiniCart(uid: any) {
    let url = API_CONSTANTS.miniCart.replace("{customerNumber}", uid);
    url = url.replace("{uid}", this.getUserEmail().toLowerCase());
    this.apiService.getMiniCartData(`${url}`).subscribe({
      next: (result: any) => {
        this.storageService.setItem("miniCartCount", result);
      },
      error: (error: any) => {
        this.storageService.setItem("miniCartCount", "");
      },
    });
  }

  updateProfile(payload: any): Observable<any> {
    let url = API_CONSTANTS.updateProfile.replace(
      "{userId}",
      this.getUserEmail().toLowerCase()
    );
    return this.apiService
      .patch(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  getSalePersonNotification() {
    let headers = new HttpHeaders({
      InterceptorSkipHeader: "",
    });
    let url = `${environment.baseBloomreachAPIURl}resourceBundle/salePersonNotifications`;
    return this.http.get(url, {
      headers: headers,
    });
  }

  updateNotifications(payload: any) {
    let url = API_CONSTANTS.updateNotifications.replace(
      "{userId}",
      this.getUserEmail().toLowerCase()
    );
    return this.apiService.post(url, payload);
  }

  getProfileShippingPreferences(): Observable<any> {
    let url = API_CONSTANTS.profileShippingPreferences.replace(
      "{userId}",
      this.getUserEmail().toLowerCase()
    );
    return this.apiService.get(url);
  }

  setDefaultStorefront(storefront: any): Observable<any> {
    let url = API_CONSTANTS.setDefaultStorefront
      .replace("{userId}", this.getUserEmail().toLowerCase())
      .replace("{defaultStorefront}", storefront);
    return this.apiService.patch(url);
  }

  getCompaniesList(searchText: string, token: string): Observable<any> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    });
    const path = API_CONSTANTS.getCompaniesList.replace(
      "{selectedAccount}",
      searchText
    );
    const redirectURL = sessionStorage.getItem("redirectURL");
    let siteId: string;
    if (redirectURL && redirectURL !== "/") {
      siteId = redirectURL.includes("commercial")
        ? this.apiService.getCommercialSiteBaseURL()
        : "us_b2b_residential";
    } else {
      const ctxUrl =
        this.apiService.selectedEnvironment !== ""
          ? this.apiService.selectedEnvironment
          : this.router.url === "/"
          ? window.location.href
          : this.router.url.split("?")[0];
      siteId = ctxUrl.includes("commercial")
        ? this.apiService.getCommercialSiteBaseURL()
        : "us_b2b_residential";
    }
    const fullUrl = `${environment.baseASMAPIURl}/rest/v2/${siteId}/${path}`;
    return this.http
      .get(fullUrl, { headers, observe: "response" })
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  setEnvironment(menu: any) {
    this.apiService.selectedEnvironment =
      menu === "commercial" ? "us_b2b_commercial" : "us_b2b_residential";
  }
  showCartModal(cartId: string, selectedEnvironment: string) {
    this.openConfirmationModal({
      title: "Did you forget something?",
      content: `You have items in your cart.
        Would you like to save this session to return later?`,
      primaryActionLabel: "Save",
      secondaryActionLabel: "Discard",
      errorMessage: "",
      onPrimaryAction: () => {
        this.closeCartModal();
      },
      onSecondaryAction: () => {
        this.modalRef.content.spinnerLoading = true;
        this.removeAllFromCart(cartId, selectedEnvironment).subscribe(
          (res: any) => {
            this.modalRef.content.spinnerLoading = false;
            this.closeCartModal();
          },
          (err: any) => {
            this.modalRef.content.errorMessage = err?.error?.errors[0].message;
            this.modalRef.content.spinnerLoading = false;
          }
        );
      },
    });
  }
  removeAllFromCart(cartId: any, selectedEnvironment: string): Observable<any> {
    const url = API_CONSTANTS.removeAllFromCart.replace(
      "{userId}/carts/{cartId}/entries",
      `${this.getUserEmail()}/carts/${cartId}/entries`
    );
    const formatedURl =
      environment.baseAPIURl +  selectedEnvironment + "/" + url;

    return this.http.post(formatedURl, {});
  }
  closeCartModal() {
    this.modalService.hide("confirmationModal");
  }
  openConfirmationModal(data = {}) {
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
        id: "confirmationModal",
        class: "modal-md modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }

  setUserDefaultAddress(pkId: any): Observable<any> {
    let url = API_CONSTANTS.setDefaultAddress.replace(
      "{userId}",
      this.getUserEmail().toLowerCase()
    );
    return this.apiService
      .get(url.replace("{addressId}", pkId))
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  getEmailsForUser(): Observable<any> {
    let url = API_CONSTANTS.populateEmailsForAutoComplete.replace(
      "{userId}",
      this.getUserEmail().toLowerCase()
    );
    return this.apiService
      .get(url)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  getEmailsByAutoComplete(customerQueries: any): Observable<any> {
    let url = API_CONSTANTS.populateEmailsForAutoComplete.replace(
      "{userId}",
      this.getUserEmail().toLowerCase()
    );
    url = `${url}?customerQuery=${customerQueries}`
    return this.apiService
      .get(url)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }
  updateMaxSize() {
    return window.innerWidth < 768 ? 6 : 10;
  }

  getDeviceType() {
    let deviceType, mtClass, poMtclass, pLine, header, pro, air, mini;
    const screenWidth = window.innerWidth;
    if (screenWidth < 768) {
      deviceType = "mobile";
      mtClass = "mt-3";
      header = "mt-3";
      poMtclass = "";
      pLine = "mt-3";
    } else if (screenWidth >= 834 && screenWidth < 1024) {
      deviceType = "air";
      air = "mt-3";
    } else if (screenWidth >= 768 && screenWidth < 834) {
      mini = "mt-3";
      deviceType = "mini";
    } else if (screenWidth >= 768 && screenWidth < 1024) {
      deviceType = "iPad";
      mtClass = "mt-3";
      poMtclass = "mt-3";
      header = "mt-3";
      pLine = "";
    } else if (screenWidth >= 1024 && screenWidth < 1366) {
      pro = "mt-3";
      deviceType = "pro";
    } else {
      deviceType = "desktop";
      mtClass = "";
      poMtclass = "mt-3";
      pLine = "";
      header = "";
    }
    return { deviceType, mtClass, poMtclass, pLine, header, pro, air, mini };
  }

  cancelCart(cartId: any): Observable<any> {
    let url = API_CONSTANTS.removeAllFromCart.replace(
      "{userId}",
      this.getUserEmail().toLowerCase()
    );
    url = url.replace("{cartId}", cartId);
    return this.apiService.post(url, {});
  }
  scrollToTop(){
    const scroll = document.querySelectorAll(".custom-scrollbar");
    scroll.forEach((element) => {
      const elem = element as HTMLElement;
      elem.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
  isWellsFargo()
  {
    return (this.storageService?.userInfo?.isCustomer &&
    (this.storageService?.userInfo?.priceLabel == "USD" || 
      !this.storageService?.userInfo?.orgUnit?.uid.includes(8122)) && 
      (this.storageService?.userInfo?.userPermissions?.includes('Pay Bills') && 
      !(this.storageService?.userInfo?.orgUnit?.paybillFlag === 'Z' || 
        this.storageService?.userInfo?.orgUnit?.paybillFlag === 'EMPTY')))
  }
  isShowPrice()
  {
    return this.storageService?.userInfo?.userPermissions.includes('Pricing Visibility & Inquiry');
  }
  isMarketingReadOnly()
  {
    return this.storageService?.userInfo?.userPermissions.includes('CSR Marketing read only group');
  }
  
  getClaimApprovalCount() {
    return this.apiService.get(
      API_CONSTANTS.myApprovalClaimsCount.replace('{userId}',this.getUserEmail().toLowerCase())
    );
  }

  
  progressShow(msgType:any){
    const messageConstants = MESSAGE_CONSTANTS?.claims?.[msgType];
    const  modalId = msgType ? msgType + "ProgressModal" : 'progressModal';
     this.openProgressModal({
       modalHeaderText: messageConstants?.headerText,
       progressText: messageConstants?.bodyText,
       progressBarText: messageConstants?.barText
     }, "md", modalId);
   }
   progressHide(msgType:any = ''){
     const modalId = msgType ? msgType + "ProgressModal" : 'progressModal';
     this.modalService.hide(modalId);
   }
   openProgressModal(data = {}, size: any = "md", modalId = "progressModal") {
     const initialState: ModalOptions = {
       backdrop: true,
       ignoreBackdropClick: true,
       initialState: {
         ...data,
       },
     };
     this.modalRef = this.modalService.show(
       ProgressModalComponent,
       Object.assign(initialState, {
         id: modalId,
         class: `modal-${size} modal-dialog-centered`,
       })
     );
   }
   profileProgress(msgType:any){
    const messageConstants = MESSAGE_CONSTANTS?.myProfile?.[msgType]
     this.openProfileModal({
       modalHeaderText: messageConstants?.headerText,
       progressText: messageConstants?.bodyText,
       progressBarText: messageConstants?.barText
     });
   }
   profileProgressHide(){
     this.modalService.hide("progressModal");
   }
   openProfileModal(data = {}, size: any = "md", modalId = "progressModal") {
     const initialState: ModalOptions = {
       backdrop: true,
       ignoreBackdropClick: true,
       initialState: {
         ...data,
       },
     };
     this.modalRef = this.modalService.show(
       ProgressModalComponent,
       Object.assign(initialState, {
         id: modalId,
         class: `modal-${size} modal-dialog-centered`,
       })
     );
   }

  navigateToMohawkTodayCheck(response:any){
    if(response.body?.isMtAdvertising === true || response.body?.isMtDistributor === true){
      window.open(environment.mohawkToday, '_self');
    }
  }
  cleanPhoneNumber(phone: any) {
    return phone ? phone.replace(/[^0-9]/g, '') : phone;
  }
}

interface userPersonas {
  csr: boolean;
  salesOP: boolean;
  productManager: boolean;
  salesPerson: boolean;
  salesOps: boolean;
  cutomer: boolean;
  financialAdmin: boolean;
  financialUser: boolean;
  isIsAdmin: boolean;
  isMohawkOneuser: boolean;
  isMtAdvertising?: boolean;
  isMtDistributor?: boolean;
  isMtMarketing?: boolean;
}
