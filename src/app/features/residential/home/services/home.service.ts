import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { ApiService } from 'src/app/features/http-services/api.service';
import { API_CONSTANTS } from 'src/app/features/shared/constants/API-CONSTANTS';
import { UserService } from 'src/app/features/shared/user/services/user.service';
import { environment } from 'src/environments/environment';
import {
  HttpClient,
  HttpHeaders,
} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  constructor(
    private apiService: ApiService,
    private userService : UserService,
    private http:HttpClient
  ) {}
  getEdgeTrackingDetails(): Observable<any> {
    const url = `${API_CONSTANTS.edgeTracking.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    )}`;
    return this.apiService
      .get(url)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  getEdgeDashboardNetSales() {
      let headers = new HttpHeaders({
        InterceptorSkipHeader: "",
        "Content-Type":"text/plain"
      });
      let url = `${environment.baseBloomreachAPIURl}resourceBundle/edgeDashboardNetSales`;
      return this.http.get(url, {
        headers: headers,
        responseType:"text"
      });
    }
}
