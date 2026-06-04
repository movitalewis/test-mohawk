import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiService } from "src/app/features/http-services/api.service";
import { StorageService } from "src/app/features/http-services/storage.service";
import { API_CONSTANTS } from "src/app/features/shared/constants/API-CONSTANTS";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { environment } from "src/environments/environment";
@Injectable({
  providedIn: "root",
})
export class InvoiceListService {
  constructor(
    private apiService: ApiService,
    private http: HttpClient,
    private storageService: StorageService,
    private userService: UserService
  ) {}

  postInovice(payload: any): Observable<any> {
    return this.apiService.post(API_CONSTANTS.invoiceSearch.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    ), payload);
  }

  getListOfInvoices(
    payload: any,
    pageIndex: any,
    orderby: any,
    sortby: any,
    pageSize: any = 10
  ): Observable<any> {
    let url = `${API_CONSTANTS.invoiceSearch.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    )}?fields=DEFAULT&orderby=${orderby}&currentPage=${pageIndex}&sort=${sortby}&path=finance`;
    url = url.replace("{userId}", this.storageService.userInfo?.uid);
    return this.apiService.post(url, payload);
  }
  getInvoicePdf(payload: any): Observable<any> {
    const baseUrl = `${environment.camsSourceInvoice}`;
    const uname = `${environment.sentinentUser}`;
    const pwd = `${environment.sentinentPwd}`;
    const httpOptions = new HttpHeaders({
      Accept: "*/*",
      Authorization: "Basic " + btoa(uname + ":" + pwd),
      InterceptorSkipHeader: "",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    return this.http.post(baseUrl, payload, {
      headers: httpOptions,
      responseType: "json",
      observe: "response",
    });
    // }
  }
  downloadFile(fileId: any) {
    const baseUrl = `${environment.s4SourceInvoice}/${fileId}/content`;
    const uname = `${environment.attachmentDownloadUser}`;
    const pwd = `${environment.attachmentDownloadPwd}`;    
    const httpOptions = new HttpHeaders({
      Accept: "*/*",
      Authorization: "Basic " + btoa(uname + ":" + pwd),
      InterceptorSkipHeader: "",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    return this.http.get(baseUrl, {
      headers: httpOptions,
      responseType: "blob" as "json",
      observe: "response",
    });
  }

  getMsalToken() {
    const baseUrl = `${environment.msalToken}`;
    const uname = `${environment.sentinentUser}`;
    const pwd = `${environment.sentinentPwd}`;
    const httpOptions = new HttpHeaders({
      Accept: "*/*",
      Authorization: "Basic " + btoa(uname + ":" + pwd),
      InterceptorSkipHeader: "",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    return this.http.post(baseUrl, {"accessLevel": "view"},{
      headers: httpOptions,
      observe: "response",
    });
  }
}
