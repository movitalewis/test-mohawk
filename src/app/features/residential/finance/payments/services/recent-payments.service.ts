import { formatDate } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of, take } from 'rxjs';
import { ApiService } from 'src/app/features/http-services/api.service';
import { API_CONSTANTS } from 'src/app/features/shared/constants/API-CONSTANTS';
import { UserService } from 'src/app/features/shared/user/services/user.service';

@Injectable({
  providedIn: 'root',
})
export class RecentPaymentsService {
  constructor(private apiService: ApiService, private userService: UserService) {}

  private isEmpty(obj: Object) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        return false;
      }
    }
    return true;
  }
  /**
   * Get Recent Payments Method
   * @param {boolean} [defaultValues] - If true, returns hardcoded default values.
   * @returns Observable<any>
   */
  public getRecentPayments(
    customerID: string,
    orderby: string = '',
    sortBy: string = '',
    pageNumber : number , pageSize : number
    
  ): Observable<any> {
    return this.apiService
      .get(
        `${API_CONSTANTS.recentPayments.replace(
          "{userId}",
          this.userService.getUserEmail().toLowerCase()
        )}?customerID=${customerID}&fields=DEFAULT&orderby=${orderby}&sortCode=${sortBy}&pageSize=${pageSize}&page=${pageNumber}`
      )
      .pipe(
        take(1),
        map((payments) => {
          if (
            payments instanceof HttpErrorResponse ||
            this.isEmpty(payments?.body)
          ) {
            return [];
          } else {
            // return payments.recentPaymentDataList.map((payment: any) => {
            //   return {
            //     currency: payment.currency,
            //     paymentAmount: `$${payment.paymentAmount.toFixed(2)}`,
            //     paymentDate: formatDate(payment.paymentDate,'MM/dd/yyyy','en-US' ),

            //     paymentType: payment.paymentType,

            //     referenceNumber: payment.referenceNumber,

            //   };

            // });
            return payments?.body;
          }
        })
      );
  }
}
