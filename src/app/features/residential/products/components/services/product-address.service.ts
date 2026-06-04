import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, of } from "rxjs";
import { Observable } from "rxjs/internal/Observable";
import { ApiService } from "src/app/features/http-services/api.service";
import { API_CONSTANTS } from "src/app/features/shared/constants/API-CONSTANTS";
import { UserService } from "src/app/features/shared/user/services/user.service";

@Injectable({
  providedIn: "root",
})
export class ProductAddressService {
  constructor(
    private apiService: ApiService,
    private userService: UserService
  ) {}

  getDefaultShippingAddress(
    id: any,
    sampleOrder: boolean = false,
    productCode: any = ""
  ): Observable<any> {
    const url = API_CONSTANTS.defaultShippingAddress;
    return this.apiService.get(
      url +
        id +
        "/getDefaultShippingAddress?fields=DEFAULT&isSample=" +
        sampleOrder +
        "&productCode=" +
        productCode
    );
  }
  getDefaultAddress(
    customerID: string,
    currentPage: any,
    searchText: any,
    pageSize: number = 10
  ): Observable<any> {
    const url =
      API_CONSTANTS.allAddress.replace("{userId}", "current") +
      `${customerID}/getAllAddresses?pageSize=${pageSize}&currentPage=${currentPage}&fields=DEFAULT&searchText=${searchText}`;

    return this.apiService.get(url);
  }

  getAddressCount(customerID: string,): Observable<any> {
    const url = API_CONSTANTS?.addressCount?.replace(
      "{userId}",
      customerID
    );
    return this.apiService
      .get(url)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  getPlpData(queryParam: any): Observable<any> {
    const url = API_CONSTANTS?.pdpList?.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()`${queryParam.category}`
    );
    return this.apiService
      .get(url)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  createCart(): Observable<any> {
    const url = API_CONSTANTS?.createCart?.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    return this.apiService
      .post(url, {})
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }
  addToCart(userId: string, cartId: string, payLoad: any): Observable<any> {
    let url = API_CONSTANTS?.addToCart;
    url = url.replace("{userId}", userId);
    url = url.replace("{cartId}", cartId);
    return this.apiService
      .post(url, payLoad)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }
  checkAvailability(payLoad: any) {
    const url = API_CONSTANTS?.checkAvailabilityAPI;
    const requestOptions = { observe: "response", body: payLoad };
    return this.apiService
      .get(url)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }
  addCart(payload: any, userID: any, cartId: any): Observable<any> {
    const url = API_CONSTANTS.setCartDetails.replace(
      "{cartId}/{userId}",
      cartId + "/" + userID
    );
   

    return this.apiService
      .post(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  pricingAllAddress(userId: any, pageSize: any = 10, currentPage: any, searchText: any = "") {
    let url = API_CONSTANTS?.pricingAllAddress.replace("{userId}", userId).replace("{pageSize}", pageSize).replace("{currentPage}", currentPage).replace("{searchText}", searchText);
    
    return this.apiService
      .get(url)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

}
