import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, catchError, Observable, of } from 'rxjs';
import { ApiService } from 'src/app/features/http-services/api.service';
import { API_CONSTANTS } from 'src/app/features/shared/constants/API-CONSTANTS';
import { UserService } from 'src/app/features/shared/user/services/user.service';

@Injectable({
  providedIn: 'root'
})
export class SampleBudgetService {

  constructor(private apiService: ApiService, private userService: UserService) { }
  
  private isEmpty(obj: Object) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        return false;
      }
    }
    return true;
  }

  getCustomerBudgetsList (payload: any, currentPage: number = 0,pageSize: number = 5, sortBy: any = "tmNumber", orderby: any = "asc"): any {
    let url = API_CONSTANTS.sampleBudgetAllocation;
    url = `${url}/users/${this.userService.getUserEmail().toLowerCase()}/getListSampleBudgets?currentPage=${currentPage}&fields=DEFAULT&pageSize=${pageSize}&orderby=${orderby}&sort=${sortBy}`;
    return this.apiService
    .post(`${ url}`,payload)
    .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  getSpecificBudget(tmNumber: any, defaultValues?: boolean) {
    if (defaultValues) {
      return of([]);
    } else {
     
      return this.apiService
        .get(
          `${API_CONSTANTS.ssampleBudgetAllocation}getAllBugets?fields=DEFAULT&tmNumber=${tmNumber}`
        )
        .pipe(
          map((results) => {
            if (
              results instanceof HttpErrorResponse ||
              this.isEmpty(results?.body)
            ) {
              return [];
            } else {
              return results;
            }
          })
        );
    }
  }


createOrUpdateSampleBudget(payload: any): Observable<any> {

  return this.apiService.post(
    `${API_CONSTANTS.sampleBudgetAllocation}/users/${this.userService.getUserEmail().toLowerCase()}/createOrUpdateSampleBudget`,
    payload
  );
}

transferBudget(payload: any): Observable<any>{
  return this.apiService.post(`${API_CONSTANTS.sampleBudgetAllocation}/users/${this.userService.getUserEmail().toLowerCase()}/transferBudget`,payload);
}

  getSampleBudgetForCart(cartId:any): Observable<any> {
    let url = `${API_CONSTANTS.getSampleBudgetForCart.replace(
      '{userId}',
      this.userService.getUserEmail().toLowerCase()
    )}`;
    url = url.replace('{cartId}', cartId);
    return this.apiService.get(url);
  }

  getFromTmNumbers(searchText:any = '',isFutureBudget:any='',currency:any=''){
    let url = `${API_CONSTANTS.getFromTmNumbers.replace("{userId}",this.userService.getUserEmail().toLowerCase()
                  )}`;
        url = url.replace("{searchText}", searchText);
        url= url.replace("{isFutureBudget}", isFutureBudget);
        url= url.replace("{currency}", currency);
        

    return this.apiService.get(url);
  }

  getToTMNUmbers(searchText:any = ''){
    const url = `${API_CONSTANTS.getToTMNUmbers.replace("{userId}",this.userService.getUserEmail().toLowerCase()
                  )}${searchText}`;
    return this.apiService.get(url);
  }
  
}
