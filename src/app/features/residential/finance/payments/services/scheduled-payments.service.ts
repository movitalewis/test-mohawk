import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { ApiService } from 'src/app/features/http-services/api.service';
import { API_CONSTANTS } from 'src/app/features/shared/constants/API-CONSTANTS';
import { UserService } from 'src/app/features/shared/user/services/user.service';

@Injectable({
  providedIn: 'root',
})
export class ScheduledPaymentsService {
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
   * Get Suspended Payments Method
   * @param {string} customerId - Customer ID to get suspended payments for.
   * @param {boolean} [defaultValues] - If true, returns hardcoded default values.
   * @returns Observable<any>
   */
  getSuspendedPayments(customerId: any, pageNumber: number, searchTextBy: any) {
    return this.apiService
      .get(
        `${API_CONSTANTS.suspendedPayments.replace(
          "{userId}",
          this.userService.getUserEmail().toLowerCase()
        )}?arCustomerId=${customerId}&fields=DEFAULT&orderby=ASC&page=${pageNumber}&sort=creationtime&searchTextBy=${searchTextBy}`
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

  /**
   * Get Online Payments Method
   * @param {string} customerId - Customer ID to get online payments for.
   * @param {boolean} [defaultValues] - If true, returns hardcoded default values.
   * @returns Observable<any>
   */
  getOnlinePayments(customerId: any, pageNumber: number, searchTextBy: any) {
    return this.apiService
      .get(
        `${API_CONSTANTS.onlinePayments.replace(
          "{userId}",
          this.userService.getUserEmail().toLowerCase()
        )}?arCustomerId=${customerId}&fields=DEFAULT&orderby=ASC&page=${pageNumber}&sort=creationtime&searchTextBy=${searchTextBy}`
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

  /**
   * Get Scheduled Payments Method
   * @param {string} customerId - Customer ID to get scheduled payments for.
   * @param {boolean} [defaultValues] - If true, returns hardcoded default values.
   * @returns Observable<any>
   */
  getScheduledPayments(customerId: any, pageNumber: number, searchTextBy: any) {
    return this.apiService
      .get(
        `${API_CONSTANTS.scheduledPayments.replace(
          "{userId}",
          this.userService.getUserEmail().toLowerCase()
        )}?arCustomerId=${customerId}&fields=DEFAULT&orderby=ASC&page=${pageNumber}&sort=creationtime&searchTextBy=${searchTextBy}`
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

  cancelScheduledPayment(
    pk: any,
    customerId: any,
    payload: any
  ): Observable<any> {
    return this.apiService.post(
      `${API_CONSTANTS.cancelScheduledPayment.replace(
        "{userId}",
        this.userService.getUserEmail().toLowerCase()
      )}?fields=DEFAULT&paymentSelect=${pk}&userId=${customerId}`,
      payload
    );
  }

  cancelSuspendedPayment(
    pk: any,
    customerId: any,
    payload: any
  ): Observable<any> {
    return this.apiService.post(
      `${API_CONSTANTS.cancelSuspendedPayment.replace(
        "{userId}",
        this.userService.getUserEmail().toLowerCase()
      )}?fields=DEFAULT&paymentSelect=${pk}&userId=${customerId}`,
      payload
    );
  }

  scheduleToSuspend(pk: any, customerId: any, payload: any): Observable<any> {
    return this.apiService.post(
      `${API_CONSTANTS.scheduleToSuspend.replace(
        "{userId}",
        this.userService.getUserEmail().toLowerCase()
      )}?fields=DEFAULT&paymentSelect=${pk}&userId=${customerId}`,
      {}
    );
  }

  suspendedToSchedule(pk: any, customerId: any, payload: any) {
    return this.apiService.post(
      `${API_CONSTANTS.suspendToSchedule.replace(
        "{userId}",
        this.userService.getUserEmail().toLowerCase()
      )}?fields=DEFAULT&paymentSelect=${pk}&userId=${customerId}`,
      {}
    );
  }
}
