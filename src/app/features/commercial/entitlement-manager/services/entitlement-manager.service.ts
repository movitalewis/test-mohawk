import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { API_CONSTANTS } from "src/app/features/shared/constants/API-CONSTANTS";
import { of, ReplaySubject, Observable } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { ApiService } from "src/app/features/http-services/api.service";

@Injectable({
  providedIn: 'root'
})
export class EntitlementManagerService {

  constructor( private apiService: ApiService) { }

  getentitlementMgrFilters(payload: any,
    currentPage: number = 0,
    pageSize: number = 10 ){
    let url = `${API_CONSTANTS.entitlementMgrFilters}?filterBy=${payload?.filterBy}&filterValue=${payload?.filterValue}`;
    return this.apiService.get(url);
  }

  getEntitlementMgrData( payload: any,
    currentPage: number = 0,
    pageSize: number = 10 ){
    let entitled = '';
    if(payload.entitled){
      entitled = `&entitled=${payload.entitled}`;
    }
    let url
    if(payload.styleId){
       url = `${API_CONSTANTS.getentitlementMgrList}?currentPage=${currentPage}&fields=MGRVIEW&query=:name-asc:&pageSize=${pageSize}&filterBy=${payload?.filterBy}&filterValue=${payload?.filterValue}&styleId=${payload.styleId}`;
    }else{
      url = `${API_CONSTANTS.getentitlementMgrList}?currentPage=${currentPage}&fields=MGRVIEW&query=:name-asc:&pageSize=${pageSize}&filterBy=${payload?.filterBy}&filterValue=${payload?.filterValue}&style=${payload?.style}${entitled}`;
    }
    return this.apiService.get(url);
  }

  updateCustEntitlement(payload: any){
    let url = API_CONSTANTS.updateCustomerEntitlement;
    return this.apiService.post(url,payload);
  }
  
}
