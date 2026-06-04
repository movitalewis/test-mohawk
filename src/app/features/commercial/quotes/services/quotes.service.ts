import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, of, Subject } from "rxjs";
import { ApiService } from "src/app/features/http-services/api.service";
import { API_CONSTANTS } from 'src/app/features/shared/constants/API-CONSTANTS';
import { UserService } from 'src/app/features/shared/user/services/user.service';
import { delay, map } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class QuotesService {

  updateData = new Subject<boolean>();
 private checkErrorSubject = new BehaviorSubject<boolean>(false);
 public checkError$ = this.checkErrorSubject.asObservable();
 setCheckError(value: boolean) {
   this.checkErrorSubject.next(value);
 }
  isQuoteCreated = false;
  lastCreatedCode = 0;
  convertOrderClicked = false;
  quoteCartCode = -1;

  convertOrder(quoteCode: number) {
    let url = API_CONSTANTS.quoteCheckout.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    url = url.replace("{quoteCode}", quoteCode);
    return this.apiService.post(url, {});
  }
  placeQuoteOrder(quoteCode: number, queryParams:any="xchange"){
    let url = API_CONSTANTS.placeQuoteOrder.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    url = url.replace("{quoteCode}", quoteCode);
    url = url+'?orderPlacedSite='+queryParams;
    return this.apiService.post(url, {});
  }

  constructor(private apiService: ApiService, private userService: UserService) {}

  getQuotes(userId: string): Observable<any> {
    const url = 'users/'+userId+'/quotes?fields=QUOTELANDING';
    return this.apiService.get(url);
  }

  searchQuotes(userId: string,searchBy:string='',searchValue:string='',status:string=''): Observable<any> {
    let url;
    if(searchBy || searchValue || status){
       url = 'users/'+userId+'/quotes/search?searchBy='+searchBy+'&searchValue='+searchValue+'&status='+status+'&fields=QUOTELANDING'
    }else{
       url = 'users/'+userId+'/quotes?fields=QUOTELANDING';
    }
    return this.apiService.get(url);
  }
  getSubmittedFor(): Observable<any> {
    let url = API_CONSTANTS.submittedFor.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    return this.apiService.get(url);
  }

  updateShippingAddress(quoteCode: number, payload: any){
    let url = API_CONSTANTS.updateQuoteShippingAddress.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    url = url.replace("{quoteCode}", quoteCode);
    return this.apiService.post(url, payload);
  }
  quoteCreated(code: number){
    this.isQuoteCreated = true;
    this.lastCreatedCode = code;
  }

  getQuoteDetails(userId: string, quoteId: string){
    let url;
    url = 'users/'+userId+'/quotes/'+quoteId+'?fields=QUOTEDETAILS';
    return this.apiService.get(url);
  }

  addQuoteComments(userId: string, quoteCode: string, payload:any){
    let url;
    url = 'users/'+userId+'/quotes/'+quoteCode+'/quoteComments';
    return this.apiService.post(url,payload);
  }
  cancelCart(cartId: any): Observable<any> {
    let url = API_CONSTANTS.removeAllFromCart.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    url = url.replace("{cartId}", cartId);
    return this.apiService.post(url, {});
  }
  getQuoteSolutions(payload: any,quoteCode: number, entry: number, skipReserve: boolean, hardcoded: boolean, reserve?: boolean, directAdd?: boolean){
    if (hardcoded){
      if (reserve && !skipReserve) return of(this.reserveHardcode).pipe(delay(2000));
      if (directAdd) return of(this.directHardcode).pipe(delay(2000));
      return of(this.regularHardcode).pipe(delay(2000));
    }
    let url = API_CONSTANTS.getQuoteSolutions.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    url = url.replace('{quoteCode}', quoteCode);
    // url = url.replace('{entry}', entry);
    if (skipReserve) url = url
    return this.apiService.post(url, payload);
  }

  addToQuote(quoteCode:number, entry: number, payload:any){
    let url = API_CONSTANTS.addToQuote.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    url = url.replace('{quoteCode}', quoteCode);
    url = url.replace('{entry}', entry);
    return this.apiService.post(url, payload);
  }
  addAccessoriesProduct(payload:any){
    let url = API_CONSTANTS.addAccessoriesQuote.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    return this.apiService.post(url, payload);
  }

  addMultiAccessoriesToQuoteCart(payload:any){
    let url = API_CONSTANTS.addMultiAccessoriesToQuoteCart.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    return this.apiService.post(url, payload);
  }

  removeEntry(quoteCode: any,entryNumber : any): Observable<any> {

    let url = `${API_CONSTANTS.removeEntryFromCart.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
      )}`;
      url = url.replace('{quoteCode}', quoteCode);
      url = url.replace('{entryNumber}', entryNumber);
    return this.apiService.delete(url);
  }

  quoteEntryRemove(quoteCode: any,entryNumber : any): Observable<any> {
    let url = `${API_CONSTANTS.removeItemsFromCart.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
      )}`;
      url = url.replace('{quoteCode}', quoteCode);
      url = url.replace('{entryNumber}', entryNumber);
    return this.apiService.delete(url);
  }

  rejectQuote(payload :any ,quoteCode : any ): Observable<any> {
    let url = API_CONSTANTS.actionOnQuote.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    url = url.replace('{quoteCode}', quoteCode);
    return this.apiService
    .post(url,payload)
    .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }
  
  getQuoteAdhesives(quoteCode : any ): Observable<any> {
    let url = API_CONSTANTS.getQuoteAdhesives.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    url = url.replace('{quoteId}', quoteCode);
    return this.apiService
    .get(url,{})
    .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  getAllAccessoryDetailsForPopup(productCode: string): Observable<any> {
 
    let url = API_CONSTANTS.allAccessoryData.replace("{productId}", productCode);
    return this.apiService.get(url);
}



  getAllAccessories(quoteCode : any ): Observable<any> {
    let url = API_CONSTANTS.allAccessoryData.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    url = url.replace('{productId}', quoteCode);
    return this.apiService
    .get(url,{})
    .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  updateQuoteEntry(payload : any,quoteCode : any ): Observable<any> {
    let url = API_CONSTANTS.updateQuoteQuantity.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    url = url.replace('{quoteCode}', quoteCode);
    return this.apiService
    .patch(url,payload)
    .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }
  getQuoteList(
   params:any
  ): Observable<any> {
    const url =
      API_CONSTANTS.quoteListFilter.replace("{userId}",this.userService.getUserEmail().toLowerCase()) +
      `/quotes/search`;

    return this.apiService.getDataWithParam(url,params);
  }
  getEndUserList(uid: any, search: any): Observable<any> {
    let url = API_CONSTANTS.endUserList
      .replace("{uid}", uid)
      .replace("{search}", search);

    //  url = url.replace("{cartId}", "cartId");
    return this.apiService.get(url);
  }
  updatecolour(
    payload : any,
    params:any
   ): Observable<any> {
     const url =
       API_CONSTANTS.replaceProduct.replace("{userId}",this.userService.getUserEmail().toLowerCase());
     return this.apiService.put(url,payload,params);
   }

  reserveHardcode = {body: {
    "solution": [
      {
        "assignedQuantity": 3.0,
        "assignedUom": "FTK",
        "backOrder": false,
        "dyeLot": "418216VN",
        "estimatedDeliveryDate": "null",
        "giveAway": false,
        "incoTermsLocation1": "6267",
        "orderMax": "null",
        "orderMin": "null",
        "plant": "6211",
        "rollAssigned": "0.0",
        "rollNumber": "418216VN",
        "sapLineNumber": 101,
        "shippedQuantity": 0,
        "solutionID": "800002800_1"
      },
      {
        "assignedQuantity": 3.0,
        "assignedUom": "FTK",
        "backOrder": false,
        "dyeLot": "418216VN",
        "estimatedDeliveryDate": "null",
        "giveAway": false,
        "incoTermsLocation1": "",
        "orderMax": "null",
        "orderMin": "null",
        "plant": "6211",
        "rollAssigned": "0.0",
        "rollNumber": "418216VN",
        "sapLineNumber": 201,
        "shippedQuantity": 0,
        "solutionID": "800002800_2"
      },
      {
        "assignedQuantity": 3.0,
        "assignedUom": "FTK",
        "backOrder": false,
        "dyeLot": "418216VN",
        "estimatedDeliveryDate": "null",
        "giveAway": false,
        "incoTermsLocation1": "",
        "orderMax": "null",
        "orderMin": "null",
        "plant": "6211",
        "rollAssigned": "0.0",
        "rollNumber": "418216VN",
        "sapLineNumber": 301,
        "shippedQuantity": 0,
        "solutionID": "800002800_3"
      }
    ],
    "solutionFromReserve": true
  }};
  regularHardcode = {body:{
    "error": false,
    "message": "Quote ATP Request has been processed successfully",
    "solution": [
      {
        "backOrder": false,
        "dyeLot": "484078",
        "giveAway": false,
        "orderMax": "600",
        "orderMaxInFeet": "50' 0\"",
        "orderMin": "144",
        "orderMinInFeet": "12' 0\"",
        "plant": "6216",
        "rollAssigned": "600",
        "rollAssignedInFeet": "50' 0\"",
        "rollAssignment": "CUT",
        "rollBal": "261",
        "rollBalInFeet": "21' 9\"",
        "rollInch": "861",
        "rollNumber": "Z237722",
        "saving": 0.0,
        "solutionID": "001"
      }
    ]
  }
  }
  directHardcode = {body:{
    "type": "custAddToQuoteResponseWsDTO",
    "messages": [
      {
        "id": "",
        "message": "Scheduling Agreement has been created successfully!!",
        "number": "",
        "status": "Success"
      }
    ],
    "quoteNumber": "6000000435"
  }}

  viewAllPotentialMatches(quoteCode: any){
    const url = (API_CONSTANTS.potentialMatches.replace("{userId}",this.userService.getUserEmail().toLowerCase())).replace("{quoteId}", quoteCode);
    return this.apiService.get(url,{}).pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  getQuoteRecommendedAccessories(quoteCode:any){
    let url = API_CONSTANTS.quoteRecommendedAccessories.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    url = url.replace("{quoteId}", quoteCode);
    return this.apiService.post(url, {});
  }
}
