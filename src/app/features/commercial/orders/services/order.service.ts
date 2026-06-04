import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { of, ReplaySubject, Observable } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { ApiService } from "src/app/features/http-services/api.service";
import { API_CONSTANTS } from "src/app/features/shared/constants/API-CONSTANTS";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class OrderService {
  constructor(
    private apiService: ApiService,
    private userService: UserService,
    private http: HttpClient
  ) {}

  orders = new ReplaySubject(1);
  showRsrvDtlSuccessMsg = false;
  private getCancelationRequest() {
    return {
      cancellationRequestEntryInputs: [
        {
          orderEntryNumber: 1,
          quantity: 5,
        },
      ],
    };
  }
  private getreserveFields() {
    return "DEFAULT";
  }
  private getreserveNumber() {
    return "99999";
  }
  private getCurrentUserID() {
    return this.userService.getUserEmail().toLowerCase();
  }

  private getCode() {
    return "123";
  }

  getOrder() {
    this.apiService
      .get(`orders/${this.getCode()}`)
      .pipe(
        catchError((error) => {
          return of(error);
        })
      )
      .subscribe((data) => {
        return data.body;
      });
    // return this.orderDetailResponse;
  }

  getSubProductTypeList(productType: string) {
    let url = API_CONSTANTS.getSubProductTypeList;
    url = url.replace("{userId}", this.userService.getUserEmail().toLowerCase());
    url = url.replace("{productType}", productType);
    return this.apiService.get(url);
  }

  getOrderHistory(
    payload: any,
    currentPage: number = 0,
    sortCode = "desc",
    pageSize: number = 10,
    showMode = "Page"
  ) {
    sessionStorage.setItem("ordersPayload", JSON.stringify(payload));
    const url = `users/${this.getCurrentUserID()}/currentOrders?currentPage=${currentPage}&fields=DEFAULT&pageSize=${pageSize}&showMode=${showMode}&sortCode=${sortCode}`;
    return this.apiService.post(url, payload);
    //  this.apiService
    //   .post(url,payload)
    //   .pipe(
    //     catchError((error) => {
    //       return of(error);
    //     })
    //   )
    //   .subscribe((data) => {

    //     // this.orderHistoryResponse = data.body
    //     this.updateOrdersObservable(data.body);

    //   });
    // this.updateOrdersObservable(this.orderHistoryResponse);
  }

  // updateOrdersObservable(orders: any) {
  //   this.orders.next(orders);
  // }

  cancelOrder() {
    this.apiService.post(
      `/users/${this.getCurrentUserID()}/orders/${this.getCode}/cancellation`,
      this.getCancelationRequest()
    );
  }

  //   searchOrders(orderStatus:any,productType:any,searchValue:any): Observable<any>{
  //     let userName = this.getCurrentUserID();
  //     let url, searchParams = '';
  //     if(orderStatus || productType || searchValue){
  //       if(orderStatus){
  //         searchParams = `status=`+orderStatus;
  //       }
  //       if(productType){
  //         searchParams = searchParams ? searchParams+`&productType=`+productType : `productType=`+productType
  //       }
  //       if(searchValue){
  //         searchParams = searchParams ? searchParams+`&searchText=`+searchValue : `searchText=`+searchValue
  //       }
  //     }
  //     url = `users/${userName}/orders/search?${searchParams}`;

  //     return this.apiService.get(url);
  // }

  // b2bSearchOrders(payload: any) {
  //   let userName = this.getCurrentUserID();
  //   const url = `users/${userName}/currentOrders?currentPage=0&fields=DEFAULT&pageSize=5&showMode=Page&sortCode=ASC`;

  //   return this.apiService.post(url, payload);
  // }

  getOrderDetails(orderId: any) {
    let userId = this.getCurrentUserID();
    let url = API_CONSTANTS.order.replace("{userId}", userId);
    url = url.replace("{code}", orderId);
    return this.apiService.get(url);
  }

  //Today's Shipment Orders API logic
  getTodaysShipments(
    payload: any,
    currentPage: number = 0,
    sortCode = "desc",
    pageSize: number = 10,
    showMode = "Page"
  ) {
    const url = `users/${this.getCurrentUserID()}/todaysShipmentOrders?currentPage=${currentPage}&pageSize=${pageSize}&showMode=${showMode}&sortCode=${sortCode}`;
    return this.apiService.post(url, payload);
    // this.updateOrdersObservable(this.orderHistoryResponse);
  }

  getshipmentsDetails(orderCode: any) {
    const url = `users/${this.getCurrentUserID()}/todaysShipmentOrderForOrderCode?orderCode=${orderCode}`;
    return this.apiService.get(url);
  }

  //get all Sample orders list
  getSampleOrdersHistory(
    payload: any,
    currentPage: number = 0,
    sortCode = "desc",
    pageSize: number = 10,
    showMode = "Page"
  ) {
    sessionStorage.setItem("ordersPayload", JSON.stringify(payload));
    const url = `users/${this.getCurrentUserID()}/currentOrders?currentPage=${currentPage}&fields=DEFAULT&pageSize=${pageSize}&showMode=${showMode}&sortCode=${sortCode}`;
    return this.apiService.post(url, payload);
    // this.updateOrdersObservable(this.orderHistoryResponse);
  }

  // get  Sample order details
  getSampleOrderDetails(orderId: any) {
    let userId = this.getCurrentUserID();
    let url = API_CONSTANTS.order.replace("{userId}", userId);
    url = url.replace("{code}", orderId);
    return this.apiService.get(url);
  }

  getReserveList() {
    this.apiService
      .get(`reserve/userId/fields=${this.getreserveFields()}`)
      .pipe(
        catchError((error) => {
          return of(error);
        })
      )
      .subscribe((data) => {
        return data;
      });
  }

  getReserveDetails(
    payload: any,
    currentPage: number = 0,
    pageSize: number = 10,
    sortBy: any
  ): Observable<any> {
    let url = API_CONSTANTS.reserveList.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    url = `${url}?fields=DEFAULT&pageSize=${pageSize}&currentPage=${currentPage}&sort=${sortBy}`;
    return this.apiService
      .post(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  reserveExtend(id: any, entries: any): Observable<any> {
    // const url = `reserve/extendReserve?fields=DEFAULT&reserveNumber=${id}`
    const url = API_CONSTANTS.extendReserve;
    let payload = {
      code: id,
      entries: entries,
    };
    return this.apiService
      .post(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  // cancelReserve(id: any): Observable<any> {
  //   const url = API_CONSTANTS.cancelReserve.replace(
  //     "{reserveNumber}",
  //     id
  //   );
  //   return this.apiService.post(url, id)
  //   .pipe(catchError((error: HttpErrorResponse) => of(error)));
  // }
  cancelReserve(id: any, entries: any): Observable<any> {
    const url = API_CONSTANTS.cancelReserve;
    // .replace(
    //   "{reserveNumber}",
    //    id
    //   );

    let payload = {
      code: id,
      entries: entries,
    };
    return this.apiService
      .post(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }
  reserveToCart(id: any, entries: any): Observable<any> {
    const url = API_CONSTANTS.reserveToCart.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );

    let payload = {
      code: id,
      entries: entries,
    };
    return this.apiService
      .post(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  getReserveNumberDetails(reserveNumberid: any): Observable<any> {
    const url = API_CONSTANTS.getReserveNumberDetail.replace(
      "{reserveNumber}",
      reserveNumberid
    );
    return this.apiService
      .get(url)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }
  editPostOrderModications(load: any): Observable<any> {
    let payload = load;
    const url = API_CONSTANTS.postOrderModification.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    return this.apiService.post(url, payload);
  }
  getDeliveryDate(query: any): Observable<any> {
    const url = API_CONSTANTS.reqDeliveryDate.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    return this.apiService
      .get(url + query)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }
  cancelOrderLine(payload: any, data: any) {
    let url = API_CONSTANTS.orderCancel.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    url = url.replace("{entryNumber}", data);

    return this.apiService.post(url, payload);
  }
  getCancelList(data: any) {
    let url = API_CONSTANTS.CancelReason.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    url = url.replace("{type}", data);
    return this.apiService.get(url);
  }
  postOrderEligibility(orderId: any) {
    let userId = this.getCurrentUserID();
    let url = API_CONSTANTS.postOrderEligibility.replace("{userId}", userId);
    url = url.replace("{code}", orderId);
    return this.apiService.get(url);
  }

  getIncoTerms(shippingMethod: any) {
    let url = API_CONSTANTS.getIncoTerms.replace(
      "{shippingMethod}",
      shippingMethod
    );
    url = url.replace("{userId}", this.userService.getUserEmail().toLowerCase());
    return this.apiService.get(url);
  }

  samplesInventoryCheck(payload: any) {
    let url = API_CONSTANTS.samplesInventoryCheck;
    return this.apiService.post(url, payload);
  }

  removefile(payload: any) {
    let url = API_CONSTANTS.removeFile;
    url = url.replace("{userId}", this.userService.getUserEmail().toLowerCase());
    return this.apiService.post(url, payload);
  }
  validateShipVia(shippingMethod: any, shipVia: any) {
    let url = API_CONSTANTS.validateShipVia
      .replace("{shippingMethod}", shippingMethod)
      .replace("{shipVia}", shipVia);
    url = url.replace("{userId}", this.userService.getUserEmail().toLowerCase());
    return this.apiService.get(url);
  }
  validateShippingOptions(incoTerms: any,productCode:any,shipVia: any) {
    let url = API_CONSTANTS.validateShippingOptions
      .replace("{incoTerm}", incoTerms)
      .replace("{productCategory}", productCode)
      .replace("{shipVia}", shipVia);
    url = url.replace("{userId}", this.userService.getUserEmail().toLowerCase());
    return this.apiService.get(url);
  }
  getIncoTermsLoc2(zipCode: any, incotermsLocation1: any, shippingMethod: any) {
    let url = API_CONSTANTS.getIncoTermsLoc2
      .replace("{incotermsLocation1}", incotermsLocation1)
      .replace("{zipCode}", zipCode)
      .replace("{shippingMethod}", shippingMethod);
    url = url.replace("{userId}", this.userService.getUserEmail().toLowerCase());
    return this.apiService.get(url);
  }

  getTermsCodeList() {
    let url = API_CONSTANTS.getTermsCodeList.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    return this.apiService.get(url);
  }

  getShippingOptions(isSample: any, productCode: any, shipTo: any, soldTo: any) {
    let url = API_CONSTANTS.getShippingOptions
      .replace("{isSample}", isSample)
      .replace("{productCode}", productCode)
      .replace("{shipTo}", shipTo)
      .replace("{soldTo}", soldTo);
    url = url.replace("{userId}", this.userService.getUserEmail().toLowerCase());
    return this.apiService.get(url);
  }
  isShippingMethodReAtpRequired(shippingConditionFrom:any,shippingConditionTo:any): Observable<any> {
    let url = API_CONSTANTS.isShippingMethodReAtpRequired
      .replace("{shippingConditionFrom}", shippingConditionFrom)
      .replace("{shippingConditionTo}", shippingConditionTo);
    url = url.replace("{userId}", this.userService.getUserEmail().toLowerCase());
    return this.apiService.get(url);
  }
  getShippingoptionForCustomers(zipcode: any, shippingCondition: any,shippingWareHouse: any, isOneTimeShipTo: any,b2bUnitId:any) {
    let processedZipcode = zipcode;
    if (zipcode && zipcode.includes("-")) {
      processedZipcode = zipcode.split("-")[0];
    }

    let url = API_CONSTANTS.getShippingoptionForCustomers
      .replace("{isOneTimeShipTo}", isOneTimeShipTo)
      .replace("{shippingWareHouse}", shippingWareHouse)
      .replace("{shippingCondition}", shippingCondition)
      .replace("{code}", processedZipcode)
      .replace("{b2bUnitId}",b2bUnitId)
      ;
    url = url.replace("{userId}", this.userService.getUserEmail().toLowerCase());
    return this.apiService.get(url);
  }
  getCustomerList(search: any): Observable<any> {
    let url = API_CONSTANTS.submittedFor.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    url = `${url}?fullName=` + search;
    return this.apiService.get(url);
  }

  validatePromoCode(code:any){
    let url = API_CONSTANTS.validatePromoCode
    .replace("{userId}", this.userService.getUserEmail().toLowerCase())
    .replace("{code}", code);
    return this.apiService.get(url);
  }
  
  getCAMSOrdersDetails(payload: any) {
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
      
    const url = environment.CAMSOrdersDetails;
    return this.http.post(url, payload, { headers: headers });
  }

  updateOrderDetails(payload: any) {
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
    
    const url = environment.updateOrderPS;
    return this.http.post(url, payload, { headers: headers });
  }

  addNewLine(payload: any) {
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
    
    const url = environment.addNewLinePS;
    return this.http.post(url, payload, { headers: headers });
  }

  viewOrderUpdates(payload: any) {
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
    
    const url = environment.viewOrderUpdatesPS;
    return this.http.post(url, payload, { headers: headers });
  }

  cancelOrderOrLine(payload: any) {
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
    
    const url = environment.cancelOrderOrLinePS;
    return this.http.post(url, payload, { headers: headers });
  }

  getCustomOrderHistory(pageSize: number = 10,currentPage: number = 0,){
    let url = API_CONSTANTS.getCustomOrderHistory;
    url = `${url}?pageSize=${pageSize}&currentPage=${currentPage}`;
    return this.apiService.get(url);
  }

  reprocessCustomOrder(camsOrderNumber:any, status:any){
    let url = API_CONSTANTS.reprocessCustomOrder
      .replace("{camsOrderNumber}", camsOrderNumber).replace("{status}", status);
    return this.apiService.post(url,{});  
  }
}

