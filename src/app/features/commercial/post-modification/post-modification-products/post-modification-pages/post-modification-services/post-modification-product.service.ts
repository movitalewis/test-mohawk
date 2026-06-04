import { HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ApiService } from "src/app/features/http-services/api.service";
import { StorageService } from "src/app/features/http-services/storage.service";
import { API_CONSTANTS } from "src/app/features/shared/constants/API-CONSTANTS";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class PostModificationProductService {
  defaultAddress: any = {};
  constructor(
    private apiService: ApiService,
    private userService: UserService,
    private storageService: StorageService
  ) {
    this.storageService.getItem("shippingAddress").subscribe((res) => {
   
      this.defaultAddress = res;
      // this.defaultAddress = {
      //   ...res,
      //   ...{
      //     formattedAddress: `${res?.addressLine1}, ${res?.addressLine2}, ${res?.addressCity}, ${res?.addressState}, ${res?.addressPostalCode}`,
      //   },
      // };
    });
  }
  getDefaulAddress() {
    return this.defaultAddress;
  }

  getPlpData(queryParam: any): Observable<any> {
    const url = API_CONSTANTS.plpList;
    return this.apiService
      .getUsingDynamicCatalog(url + queryParam.category + "/products")
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  searchPlpRecords(queryParam: any): Observable<any> {
    const url = API_CONSTANTS.plpSearch.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    return this.apiService
      .getUsingDynamicCatalog(url)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }
  getPdpRecords(id: any, substituteProductFlag: any): Observable<any> {
    const url = API_CONSTANTS.pdpData;
    return this.apiService
      .getUsingDynamicCatalog(
        url + id + `/productDetails` + `${"?fields=FULL"}`+`&substituteProductFlag=${substituteProductFlag}`
      )
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  getCartData(cartId: any): Observable<any> {
    let url = API_CONSTANTS.cartData.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    url = url.replace("{cartId}", cartId);
    return this.apiService.get(url);
  }
  validatePO(cartID: any, poNumber: any): Observable<any> {
    let url = `${API_CONSTANTS.poValidation.replace("{cartID}", cartID)}`;
    url = url.replace("{poNumber}", poNumber);
    return this.apiService.get(url);
  }

  getSubmittedFor(): Observable<any> {
    let url = API_CONSTANTS.submittedFor.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    return this.apiService.get(url);
  }

  checkAvailabilityForProduct(payload: any): Observable<any> {
    let url = `${API_CONSTANTS.checkAvailability}`;
    url = url.replace("{userId}", this.userService.getUserEmail().toLowerCase());

    return this.apiService
      .postAptCheckBaseUrl(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  checkAvailability(payLoad: any) {
    const url = API_CONSTANTS?.checkAvailabilityAPI;
    const requestOptions = { observe: "response", body: payLoad };
    return this.apiService
      .getUsingDynamicCatalog(url, requestOptions)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }
  getAllAccessoryDetailsForPopup(productCode: string): Observable<any> {
    let url = API_CONSTANTS.allAccessory;
    url.replace(productCode, "{productId}");
    return this.apiService
      .getUsingDynamicCatalog(url)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }
  allAccessoryDetails(type: string): Observable<any> {
    return this.apiService
      .getUsingDynamicCatalog(`${API_CONSTANTS.allAccessoryData}/${type}`)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }
  getDefaultAddress(customerID: string): Observable<any> {
    const url =
      API_CONSTANTS.allAddress.replace("{userId}", "current") +
      `${customerID}/getAllAddresses`;

    return this.apiService.get(url);
  }

  addressesValidates(payload: any, cartId: any): Observable<any> {
    const url = API_CONSTANTS.addressesValidatesDetails.replace(
      "{userId​}/carts​/{cartId}",
      `${this.userService.getUserEmail().toLowerCase()}/quotes/current/addresses​/validate`
    );
    return this.apiService.post(url, payload);
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
  addToCart(userId: string, cartId: string, payload: any): Observable<any> {
    let url = API_CONSTANTS?.addToCart;
    url = url.replace("{userId}", userId);
    url = url.replace("{cartId}", cartId);
    return this.apiService
      .getUsingDynamicCatalogPost(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }
  continueFromOrdres(payload: any): Observable<any> {
    let url = API_CONSTANTS?.orderEntries;
    url = url.replace("{userId}", this.userService.getUserEmail().toLowerCase());
    return this.apiService
      .post(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }
  addCart(payload: any, userID: any, cartId: any): Observable<any> {
    const url = API_CONSTANTS.setCartDetails.replace(
      "{userId}/carts/{cartId}",
      userID + `/carts/` + cartId
    );
    return this.apiService
      .getUsingDynamicCatalogPost(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }
  getCartEntries(cartId: any): Observable<any> {
    let url = API_CONSTANTS.cartEntries.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    url = url.replace("{cartId}", cartId);
    return this.apiService.get(url);
  }

  getalldisplaytypes(queryParam: any): Observable<any> {
    const url = API_CONSTANTS.getAllAccessoryTypes;
    return this.apiService.getUsingDynamicCatalog(url + queryParam);
  }
  getPdpVariantRecords(id: any): Observable<any> {
    const url = API_CONSTANTS.pdpData;
    return this.apiService
      .getUsingDynamicCatalog(
        url + id + `/productVariantMatrix${"?fields=FULL"}`
      )
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  getUOMDetails(id: any) {
    const url = API_CONSTANTS.UOMDetails.replace("{productId}", id);
    return this.apiService.getUsingDynamicCatalog(url);
  }

  removeSelectedItemFromCart(cartId: any, entryNumber: any): Observable<any> {
    const url = API_CONSTANTS.removeItemFromCart.replace(
      "{userId}/carts/{cartId}/entries/{entryNumber}",
      `${this.userService.getUserEmail().toLowerCase()}/carts/${cartId}/entries/${entryNumber}`
    );
    return this.apiService.post(url, {});
  }

  removeAllFromCart(cartId: any): Observable<any> {
    const url = API_CONSTANTS.removeAllFromCart.replace(
      "{userId}/carts/{cartId}/entries",
      `${this.userService.getUserEmail().toLowerCase()}/carts/${cartId}/entries/null`
    );
    return this.apiService.get(url);
  }

  cancelCart(cartId: any): Observable<any> {
    let url = API_CONSTANTS.removeAllFromCart.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    url = url.replace("{cartId}", cartId);
    return this.apiService.post(url, {});
  }

  placeOrder(payload: any, cartId: any): Observable<any> {
    const url = API_CONSTANTS.placeOrder.replace(
      "{userId}",
      `${this.userService.getUserEmail().toLowerCase()}/orders?cartId=${cartId}`
    );
    return this.apiService
      .post(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  quotes(payload: any): Observable<any> {
    const url = API_CONSTANTS.quotesCreates.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    return this.apiService.post(url, payload);
  }

  ActionQuotes(payload: any, quoteId: any): Observable<any> {
    const url = API_CONSTANTS.actionQuoto.replace(
      "{userId}/quotes/{quoteId}",
      `${this.userService.getUserEmail().toLowerCase()}/quotes/${quoteId}`
    );
    return this.apiService.post(url, payload);
  }
  removeItemsFromCart(quoteCode: any, entryNumber: any): Observable<any> {
    let url = API_CONSTANTS.removeItemsFromCart.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    url = url.replace("{quoteCode}", quoteCode);
    url = url.replace("{entryNumber}", entryNumber);
    return this.apiService.delete(url, {});
  }
  proceedToCheckout(payload: any, cartId: any) {
    let url = API_CONSTANTS.proceedToCheckout.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    url = url.replace("{cartId}", cartId || "123456");
    return this.apiService
      .post(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }
  submitOrder(cartId: any, payload: any) {
    let url = API_CONSTANTS.submitOrder.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    url = url.replace("{cartId}", cartId || "123456");
    return this.apiService
      .post(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }
  getAllAccessories(productId: any) {
    let url = API_CONSTANTS.allAccessoryData.replace("{productId}", productId);
    return this.apiService.get(url);
  }
  getLatestMiniCart(uid: any) {
    let url = API_CONSTANTS.miniCart.replace("{customerNumber}", uid);
    url = url.replace("{uid}", this.userService.getUserEmail().toLowerCase());

    this.apiService.getMiniCartData(`${url}`).subscribe({
      next: (result: any) => {
   

        this.storageService.setItem("miniCartCount", result);
      },
      error: (error: any) => {
        this.storageService.setItem("miniCartCount", "");
      },
    });
  }

  checkReserveEligibility(cartId: any): Observable<any> {
    let url = API_CONSTANTS.checkReserveEligibility.replace("{cartId}", cartId);
    return this.apiService.get(url);
  }

  getBuilderOrder(cartId?: any) {
    let url = API_CONSTANTS.builderOrder
      .replace("{userId}", this.userService.getUserEmail().toLowerCase())
      .replace("{cartId}", cartId);
    return this.apiService.get(url);
  }

  placeReserve(cartId: any): Observable<any> {
    let url = API_CONSTANTS.placeReserve.replace("{cartId}", cartId);
    url = url.replace("{reserveName}", this.userService.getUserEmail().toLowerCase());
    return this.apiService
      .post(url, {})
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  cancelReserve(payload: any): Observable<any> {
    const url = API_CONSTANTS.cancelReserveCase;
    return this.apiService
      .post(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  createNewUser(data: any, payload: any) {
    const endpoint = API_CONSTANTS.createNewUser
      .replace("{userId}", data.username)
      .replace("{cartId}", data.cartId);
    return this.apiService
      .post(endpoint, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  validateAddress(payload: any) {
    let params = new HttpParams();
        params = params.set('$format','json');
        const endpoint = environment.virtualServicesAddressValidate ;
        return this.apiService
          .getDifferentUrl(`${endpoint}${payload}`, { params: params })
          .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  compareProducts(queryParam: any): Observable<any> {
    let url = API_CONSTANTS.compareProduct;
    return this.apiService.get(url + "?" + queryParam);
  }

  getDivision(cartId?: any, data?: any) {
    let url = API_CONSTANTS.getDivisions
      .replace("{userId}", this.userService.getUserEmail().toLowerCase())
      .replace("{cartId}", cartId);
    return this.apiService.post(url, data);
  }
  getSubDivision(cartId?: any, data?: any) {
    let url = API_CONSTANTS.getSubDivisions
      .replace("{userId}", this.userService.getUserEmail().toLowerCase())
      .replace("{cartId}", cartId);

    return this.apiService.post(url, data);
  }
  submitBuilderInfo(cartId?: any, data?: any) {
    let url = API_CONSTANTS.submitBuilderInfo
      .replace("{userId}", this.userService.getUserEmail().toLowerCase())
      .replace("{cartId}", cartId);

    return this.apiService.post(url, data);
  }

  getProductMedias(code: any) {
    let url = API_CONSTANTS.productMedias.replace("{productCode}", code);
    //  url = url.replace("{cartId}", "cartId");
    return this.apiService.get(url);
  }

  getProductPriceDetails(code: any) {
    let url = API_CONSTANTS.productPriceDetails.replace("{productCode}", code);
    //  url = url.replace("{cartId}", "cartId");
    return this.apiService.get(url);
  }

  getMiniCartData(uid: any): Observable<any> {
   

    let url = API_CONSTANTS.miniCart
      .replace("{customerNumber}", uid?.uid)
      .replace("{uid}", this.userService.getUserEmail().toLowerCase());
    //  url = url.replace("{cartId}", "cartId");
    return this.apiService.get(url);
  }

  requestingNewPrice(data: any, payload: any) {
    const endpoint = API_CONSTANTS.requestingNewPrice
      .replace("{userId}", data.username)
      .replace("{cartId}", data.cartId)
      .replace("{entryNumber}", data.entryNumber)
      .replace("{requestedPrice}", data.requestedPrice)
      .replace("{priceComment}", data.priceComment);
    return this.apiService
      .post(endpoint, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  getShippingMethod(flag: any, code: any) {
    let url = API_CONSTANTS.getShippingMethod
      .replace("{userId}", this.userService.getUserEmail().toLowerCase())
      .replace("{flag}", flag)
      .replace("{code}", code);
    return this.apiService.get(url);
  }
  updateShippingMethod(code: any, flag: any, shipCode: any) {
    let url = API_CONSTANTS.updateShippingMethod
      .replace("{userId}", this.userService.getUserEmail().toLowerCase())
      .replace("{flag}", flag)
      .replace("{code}", code)
      .replace("{shipCode}", shipCode);
    return this.apiService.get(url);
  }
  getMinMaxRollLength(standardRollLength: any,soldTo:any,shipTo:any,productCode:any) {
    const endpoint = API_CONSTANTS.getMinMaxRollLength
    //  .replace("{userId}", this.userService.getUserEmail().toLowerCase())
      .replace("{standardRollLength}", standardRollLength)
      .replace("{soldTo}",soldTo)
      .replace("{shipTo}",shipTo)
      .replace("{productCode}",productCode)
      .replace("{uom}","ROL");

    return this.apiService
      .get(endpoint)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }
  addLineOrAccessories(payLoad?:any) {
    const endpoint = API_CONSTANTS.addLineOrAccessories
      .replace("{userId}", this.userService.getUserEmail().toLowerCase())

    return this.apiService
      .post(endpoint,payLoad)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }
  updatePostOrder(payLoad?:any) {
    const endpoint = API_CONSTANTS.updatePostOrderEntry   
      .replace("{userId}", this.userService.getUserEmail().toLowerCase())

    return this.apiService
      .post(endpoint,payLoad)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }
  getShippingMethodWithOutFlag(
    code: any,
    oneTime: any,
    isCustomer: any,
    shippingMethod: any
  ) {
    let url = API_CONSTANTS.getShippingMethod
      .replace("{userId}", this.userService.getUserEmail().toLowerCase())
      .replace("{isOneTimeShipTo}", oneTime)
      .replace("{isCustomer}", isCustomer)
      .replace("{shippingMethod}", shippingMethod)
      .replace("{code}", code);
    return this.apiService.get(url);
  }
  getShippingWareHouseWithOutFlag() {
    let url = API_CONSTANTS.getShippingWareHouse.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    return this.apiService.get(url);
  }
  getAccessoriesPricing(payload: any) {
    let url = API_CONSTANTS.accessoryPriceSearch + this.storageService.uid;
    url = url.replace("{userId}",this.userService.getUserEmail().toLowerCase());
    return this.apiService.post(url, payload);
  }
}
