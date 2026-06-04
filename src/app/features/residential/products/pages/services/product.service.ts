import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ApiService } from "src/app/features/http-services/api.service";
import { XchangeDataLayerService } from "src/app/features/http-services/data-layer.service";
import { StorageService } from "src/app/features/http-services/storage.service";
import { API_CONSTANTS } from "src/app/features/shared/constants/API-CONSTANTS";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { environment } from "src/environments/environment";
import { MESSAGE_CONSTANTS } from "src/app/features/shared/constants/MESSAGE-CONSTANTS";
import { ProgressModalComponent } from "src/app/features/shared/components/progress-modal/progress-modal.component";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";

@Injectable({
  providedIn: "root",
})
export class ProductService {
  defaultAddress: any = {};
  cloneOrderCartId = "";
  addToCartSuccessInfo = "";
  // selectedCloneOrders: any;
  modalRef?: BsModalRef;
  constructor(
    private apiService: ApiService,
    private userService: UserService,
    private storageService: StorageService,
    private http: HttpClient,
    private dataLayer: XchangeDataLayerService,
    public modalService: BsModalService,
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
  getEndUserList(uid: any, search: any): Observable<any> {
    let url = API_CONSTANTS.endUserList
      .replace("{uid}", uid)
      .replace("{search}", search);

    //  url = url.replace("{cartId}", "cartId");
    return this.apiService.get(url);
  }
  getmarketsegment(): Observable<any> {
    let url = "marketSegments?defaultValue=FULL";
    return this.apiService.get(url);
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
  createQuote(body: any): Observable<any> {
    const url = API_CONSTANTS.createQuote.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );

    return this.apiService.post(url + `${"?fields=FULL"}`, body);
  }
  getPdpRecords(id: any, substituteProductFlag: any): Observable<any> {
    const url = API_CONSTANTS.pdpData;
    return this.apiService
      .getUsingDynamicCatalog(
        url + id + `/productDetails` + `${"?fields=FULL"}`+`&substituteProductFlag=${substituteProductFlag}`
      )
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  searchProducts(styleCode:any): Observable<any> {
    const endpoint = API_CONSTANTS.productSearch;
    let formatedURl:  string = endpoint+"&fields=GSVIEW"+"&query="+styleCode+":relevance:";
    return this.apiService.getSearchResults(formatedURl);     
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
    this.getPdpRecords(payload?.pdpProductCode, "").subscribe(
      (records: any) => {
        if (!!records?.body) {
          this.dataLayer.addToCart(this.storageService.userPriceLabel || "", [
            {
              item_id: records?.body?.code || "",
              item_name:
                records?.body?.sellingStyleName ||
                records?.body?.styleName ||
                "",
              index: 0,
              item_brand:
                records?.body?.brand ||
                records?.body?.brandName ||
                records?.body?.brandId ||
                "",
              item_category: records?.body?.subProductType || "",
              item_category2: records?.body?.productLine || "",
              item_category3:
                records?.body?.styleName ||
                records?.body?.sellingStyleName ||
                "",
              item_category4:
                records?.body?.colorName ||
                records?.body?.color ||
                records?.body?.sellingColorName ||
                "",
              item_list_id: "",
              item_list_name: "",
              item_variant: `${records?.body?.productLine || ""} ${
                records?.body?.styleName ||
                records?.body?.sellingStyleName ||
                ""
              }`,
              price:
                payload?.item[0]?.productPriceData?.uom == "YDK"
                  ? payload?.item[0]?.productPriceData?.rollPriceSY ||
                    payload?.item[0]?.productPriceData?.cartonPriceSY ||
                    payload?.item[0]?.productPriceData?.palletPriceSY ||
                    0
                  : payload?.item[0]?.productPriceData?.uom == "FTK"
                  ? payload?.item[0]?.productPriceData?.rollPriceSF ||
                    payload?.item[0]?.productPriceData?.cartonPriceSF ||
                    payload?.item[0]?.productPriceData?.palletPriceSF ||
                    0
                  : payload?.item[0]?.productPriceData?.uom == "EA"
                  ? payload?.item[0]?.productPriceData?.priceEach || 0
                  : 0,
              quantity:
                payload?.item[0]?.productPriceData?.uom == "YDK"
                  ? Number(payload?.item[0]?.solution[0]?.rollAssignedInSY) || 0
                  : payload?.item[0]?.productPriceData?.uom == "FTK"
                  ? Number(payload?.item[0]?.solution[0]?.rollAssignedInSF) || 0
                  : 0,
              uom: payload?.item[0]?.productPriceData?.uom || "",
              selected_uom: payload?.item[0]?.requestedUOM || "",
            },
          ]);
        }
      }
    );
    let url = API_CONSTANTS?.addToCart;
    url = url.replace("{userId}", userId);
    url = url.replace("{cartId}", cartId);
    return this.apiService.getUsingDynamicCatalogPost(url, payload);
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
    return this.apiService
      .getResidential(url + queryParam)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
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
      `${this.userService.getUserEmail().toLowerCase()}/carts/${cartId}/entries`
    );
    return this.apiService.post(url, {});
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

  cartToCheckout(cartId: any) {
    let url = API_CONSTANTS.cartToCheckout.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    url = url.replace("{cartId}", cartId || "123456");
    return this.apiService
      .post(url, "")
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  validateSmallParcel(cartId: any) {
    let url = API_CONSTANTS.validateSmallParcel;
    url = url.replace("{cartId}", cartId || "123456");
    return this.apiService
      .get(url)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }
  smallParcelShippingCondition(carrierId: any) {
    let url = API_CONSTANTS.smallParcelShippingCondition.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    url = url.replace("{carrierId}", carrierId || "123456");
    return this.apiService
      .get(url)
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
  getMiniCartForCloneOrders(uid: any) {
    let url = API_CONSTANTS.miniCart.replace("{customerNumber}", uid);
    url = url.replace("{uid}", this.userService.getUserEmail().toLowerCase());

    return this.apiService.getMiniCartData(`${url}`);
  }

  checkReserveEligibility(cartId: any): Observable<any> {
    let url = API_CONSTANTS.checkReserveEligibility.replace("{cartId}", cartId);
    return this.apiService.get(url);
  }

  getBuilderOrder(
    cartId?: any,
    currentPage: number = 0,
    searchText: string = "",
    pageSize: number = 10,
    sortCode = "desc"
  ) {
    let url = API_CONSTANTS.builderOrder
      .replace("{userId}", this.userService.getUserEmail().toLowerCase())
      .replace("{cartId}", cartId);
    url = `${url}?currentPage=${currentPage}&fields=DEFAULT&pageSize=${pageSize}&sortCode=${sortCode}&builderName=${searchText}`;
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
    return this.apiService.post(endpoint, payload);
  }

  validateAddress(payload: any) {
    console.log("payload is--->",payload)
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

  getDivision(
    cartId?: any,
    data?: any,
    currentPage: number = 0,
    searchText: string = "",
    pageSize: number = 10,
    sortCode = "desc"
  ) {
    let url = API_CONSTANTS.getDivisions
      .replace("{userId}", this.userService.getUserEmail().toLowerCase())
      .replace("{cartId}", cartId);
    url = `${url}?currentPage=${currentPage}&fields=DEFAULT&pageSize=${pageSize}&sortCode=${sortCode}&divName=${searchText}`;
    return this.apiService.post(url, data);
  }
  getSubDivision(
    cartId?: any,
    data?: any,
    currentPage: number = 0,
    searchText: string = "",
    pageSize: number = 10,
    sortCode = "desc"
  ) {
    let url = API_CONSTANTS.getSubDivisions
      .replace("{userId}", this.userService.getUserEmail().toLowerCase())
      .replace("{cartId}", cartId);
    url = `${url}?currentPage=${currentPage}&fields=DEFAULT&pageSize=${pageSize}&sortCode=${sortCode}&subDivName=${searchText}`;

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

  getProductPriceDetails(code: any, shipTo:any = "") {
    let url = API_CONSTANTS.productPriceDetails.replace("{productCode}", code);
    if(shipTo){
      url = url + `&shipTo=${shipTo}`;
    }
    return this.apiService.get(url);
  }

  getMerchandisingPriceDetails(code: any, shipTo:any = "") {
    let url = API_CONSTANTS.merchandisingPriceDetails.replace("{productCode}", code)
              .replace("{userId}", this.userService.getUserEmail().toLowerCase());
    if(shipTo){
      url = url + `&shipTo=${shipTo}`;
    }
    return this.apiService.get(url);
  }

  getMiniCartData(uid: any): Observable<any> {
    let url = API_CONSTANTS.miniCart
      .replace("{customerNumber}", uid?.uid || uid)
      .replace("{uid}", this.userService.getUserEmail().toLowerCase());
    //  url = url.replace("{cartId}", "cartId");
    return this.apiService.get(url);
  }
  getQuoteData(id: any): Observable<any> {
    let url = API_CONSTANTS.getQuoteData
      .replace("{userId}", this.userService.getUserEmail().toLowerCase())
      .replace("{code}", id);
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
  getShippingWareHouse(flag: any, code: any) {
    let url = API_CONSTANTS.getShippingWareHouse
      .replace("{userId}", this.userService.getUserEmail().toLowerCase())
      .replace("{flag}", flag)
      .replace("{code}", code);
    return this.apiService.get(url);
  }
  updateShippingWareHouse(code: any, flag: any, shipCode: any) {
    let url = API_CONSTANTS.updateShippingWareHouse
      .replace("{userId}", this.userService.getUserEmail().toLowerCase())
      .replace("{flag}", flag)
      .replace("{code}", code)
      .replace("{shipCode}", shipCode);
    return this.apiService.get(url);
  }

  getMinMaxRollLength(
    standardRollLength: any,
    soldTo: any,
    shipTo: any,
    productCode: any
  ) {
    const endpoint = API_CONSTANTS.getMinMaxRollLength
      //  .replace("{userId}", this.userService.getUserEmail().toLowerCase())
      .replace("{standardRollLength}", standardRollLength)
      .replace("{soldTo}", soldTo)
      .replace("{shipTo}", shipTo)
      .replace("{productCode}", productCode)
      .replace("{uom}", "ROL");

    return this.apiService
      .get(endpoint)
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

  updateShippingMethodWithOutFlag(code: any, shipCode: any) {
    let url = API_CONSTANTS.updateShippingMethod
      .replace("{userId}", this.userService.getUserEmail().toLowerCase())
      .replace("{code}", code)
      .replace("{shipCode}", shipCode);
    return this.apiService.get(url);
  }

  updateShippingWareHouseWithOutFlag(code: any, shipCode: any) {
    let url = API_CONSTANTS.updateShippingWareHouse
      .replace("{userId}", this.userService.getUserEmail().toLowerCase())
      .replace("{code}", code)
      .replace("{shipCode}", shipCode);
    return this.apiService.get(url);
  }

  shippingQuestionData(payload: any) {
    let url = API_CONSTANTS?.orderEntries;
    url = url.replace("{userId}", this.userService.getUserEmail().toLowerCase());
    return this.apiService
      .post(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  shippingMethodVendorAccountNumbersAPI(shipTo: any, soldTo: any) {
    let url = API_CONSTANTS.getVendorAccountNumbers
      .replace("{userId}", this.userService.getUserEmail().toLowerCase())
      .replace("{shipTo}", shipTo)
      .replace("{soldTo}", soldTo);
    return this.apiService.get(url);
  }

  shippingMethodZoneZipcodeDeterminationAPI(zipcode: any) {
    let url = API_CONSTANTS.getZoneZipcodeDetermination
      .replace("{userId}", this.userService.getUserEmail().toLowerCase())
      .replace("{zipcode}", zipcode);
    return this.apiService.get(url);
  }
  getVendorAccountNumbersForOrderAPI(orderNumber: any, lineNumber: any) {
    let url = API_CONSTANTS.getVendorAccountNumbersForOrder
      .replace("{userId}", this.userService.getUserEmail().toLowerCase())
      .replace("{orderNumber}", orderNumber)
      .replace("{lineNumber}", lineNumber);
    return this.apiService.get(url);
  }
  getAllSamples(productCode: any) {
    const url = API_CONSTANTS.getAllSamples.replace(
      "{productCode}",
      productCode
    );
    return this.apiService.get(url);
  }

  shippingMethodVendorAccountNumbersAPIv2(productCode: any, lineNumber: any) {
    let url = API_CONSTANTS.getVendorAccountNumbersForOrderV2
      .replace("{userId}", this.userService.getUserEmail().toLowerCase())
      .replace("{productCode}", productCode)
      .replace("{lineNumber}", lineNumber);
    return this.apiService.get(url);
  }
  getSmallParcelCarriers() {
    const url = API_CONSTANTS.getSmallParcelCarriers.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    return this.apiService.get(url);
  }
  validateShipperAccount(
    cartId: any,
    accounNum: any,
    zipCode: any,
    carrierId: any
  ) {
    const url = API_CONSTANTS.validateShipperAccount
      .replace("{userId}", this.userService.getUserEmail().toLowerCase())
      .replace("{cartId}", cartId)
      .replace("{zipCode}", zipCode)
      .replace("{accoundNum}", accounNum)
      .replace("{carrierID}", carrierId)
      
    return this.apiService.get(url);
  }
  getNoChargeReasonCodes() {
    const url = API_CONSTANTS.noChargeReasonCodes.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    return this.apiService.get(url);
  }

  updateSmallParcelFields(
    cartId: any,
    payload:any
  ) {
    let url = API_CONSTANTS.updateSmallParcelFields.replace("{cartId}", cartId);
    return this.apiService
      .post(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  shareViaEmail(payload: any = {}) {
    const url = environment.sendEmail;
    return this.http.post(url, payload);
  }

  getPlpPriceSearch(payload: any) {
    let url = API_CONSTANTS.plpPriceSearch.replace(
      "{uid}",
      this.storageService.uid
    );
    url = url.replace("{userId}",this.userService.getUserEmail().toLowerCase());
    return this.apiService.post(url, payload);
  }
  getOrderSamplePriceSearch(payload: any) {
    let url = API_CONSTANTS.samplePriceSearch + this.storageService.uid;
    url = url.replace("{userId}",this.userService.getUserEmail().toLowerCase());
    return this.apiService.post(url, payload);
  }
  getAccessoriesPricing(payload: any) {
    let url = API_CONSTANTS.accessoryPriceSearch + this.storageService.uid;
    url = url.replace("{userId}",this.userService.getUserEmail().toLowerCase());
    return this.apiService.post(url, payload);
  }

  hasCrossOver(id: any) {
    let url = API_CONSTANTS.hasCrossOver.replace("{ProductCode}", id);
    return this.apiService.get(url);
  }

  getcrossOver(id: any) {
    let url = API_CONSTANTS.getcrossOver.replace("{ProductCode}", id);
    return this.apiService.get(url);
  }
  getPaymentTermsList(data: any) {
    let url = API_CONSTANTS.paymentTermsList.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    url = url.replace("{isSampleProduct}", data?.sampleOrder);
    // url = url.replace("{isPackage}", data?.packageProduct);
    url = url.replace("{merchandisingProduct}", data?.merchandisingProduct);
    if (data?.code) {
      url = url.replace("{cartId}", data?.code);
      url = url.replace("{orderId}", "");
    } else if (data?.orderCode) {
      url = url.replace("{cartId}", "");
      url = url.replace("{orderId}", data?.orderCode);
    }

    return this.apiService.get(url);
  }

  getXchangeInventoryStatus(skuId:any){
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
    
    const url = `${environment.getXchangeInventoryStatus}/${skuId}`;
    return this.http.get(url, { headers: headers });
  }

  removeATPCartEntry(payload:any){
    let url = API_CONSTANTS.removeATPCartEntry.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    return this.apiService.delete(url,{body: payload});
  }
  progressShow(msgType: any, modalId:any= "progressModal", size: any = "md") {
    const messageConstants = MESSAGE_CONSTANTS?.pdp?.[msgType]
    this.openProgressModal({
      modalHeaderText: messageConstants?.headerText,
      progressText: messageConstants?.bodyText,
      progressBarText: messageConstants?.barText
    }, size, modalId);
  }
  progressHide(modalId = "progressModal") {
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

  addressReqHistory(payload: any) {
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
    
    const url = environment.addressReqHistoryPS;
    return this.http.post(url, payload, { headers: headers });
  }
}
