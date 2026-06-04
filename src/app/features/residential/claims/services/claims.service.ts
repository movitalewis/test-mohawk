import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, of, BehaviorSubject } from "rxjs";
import { Observable } from "rxjs/internal/Observable";
import { ApiService } from "src/app/features/http-services/api.service";
import { StorageService } from "src/app/features/http-services/storage.service";
import { API_CONSTANTS } from "src/app/features/shared/constants/API-CONSTANTS";
import { cartFileTypeArray } from "src/app/features/shared/constants/CONTENT-CONSTANTS";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { environment } from "src/environments/environment";
@Injectable({
  providedIn: "root",
})
export class ClaimsService {
  selectedProductLines = new BehaviorSubject<any[]>([]);
  approveRejectSuccessMsg = "";
  formMarkAsDirty = new BehaviorSubject<boolean>(false);
  constructor(
    private apiService: ApiService,
    private userService: UserService,
    private http: HttpClient,
    private router: Router,
    private storageService: StorageService,
  ) {}
  claimNumber = "";
  createClaim(payload: any): Observable<any> {
    const url = API_CONSTANTS.claim.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase(),
    );
    return this.apiService.post(url, payload);
  }

  updateClaim(payload: any): Observable<any> {
    let url = API_CONSTANTS.claim.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase(),
    );
    if (
      (this.selectedInvoiceLines?.claimData?.hasOwnProperty(
        "laborLineExists",
      ) === false ||
      this.selectedInvoiceLines?.claimData?.laborLineExists === false) && payload?.laborLineExists === true
    ) {
        url = url + `?isLaborClaim=True`;
    }
    return this.apiService.patch(url, payload);
  }

  getClaimsHistory(
    payload: any,
    pageIndex: any,
    pageSize: any,
  ): Observable<any> {
    const url = API_CONSTANTS.claimHistory.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase(),
    );
    let finalUrl = `${url}?currentPage=${pageIndex}&fields=DEFAULT&pageSize=${pageSize}&showMode=Page`;
    return this.apiService.post(finalUrl, payload);
  }

  claimApproveReject(payload: any): Observable<any> {
    const url = API_CONSTANTS.claimApproveReject.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase(),
    );
    return this.apiService.post(url, payload);
  }
  getClaimsApprovalHistory(payload: any): Observable<any> {
    const url = API_CONSTANTS.claimsApprovalList.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase(),
    );
    return this.apiService.post(url, payload);
  }

  getClaimsDetails(query: string, payload: any): Observable<any> {
    const url = API_CONSTANTS.claimDetails.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase(),
    );
    return this.apiService.post(url + query, payload);
  }

  searchInvoice(
    payload: any,
    pageIndex = 0,
    orderby = "DESC",
    sortby = "invoiceNumber",
  ) {
    let url = `${API_CONSTANTS.invoiceSearch}?fields=DEFAULT&orderby=${orderby}&currentPage=${pageIndex}&sort=${sortby}&path=claim`;
    url = url.replace("{userId}", this.storageService.userInfo?.uid);
    return this.apiService.post(url, payload);
  }

  invoiceDetails(invoiceId: any) {
    const url =
      API_CONSTANTS.invoiceDetails.replace(
        "{userId}",
        this.userService.getUserEmail().toLowerCase(),
      ) + invoiceId;
    return this.apiService.post(url, {});
  }
  selectedInvoiceLines: any = {
    invoiceNumber: "",
    invoiceYear: "",
    line: [],
    businessArea: "",
    salesOrg: "",
  };
  expectedUnitPriceQuotedBy: string = "";
  expectedUnitPrice: any = "";
  claimQuantity: any = "";
  invoiceFieldsValid: boolean = false;
  totalAdjutmentAmount: any;

  discardDraft(claimNumber: any) {
    const url = API_CONSTANTS.discardDraft
      .replace("{userId}", this.userService.getUserEmail().toLowerCase())
      .replace("{claimNumber}", claimNumber);
    return this.apiService.delete(url, {});
  }

  postImage(filesArray: any, url: any) {
    const formData = new FormData();
    filesArray.forEach((item: any) => {
      formData.append("file", item);
    });

    return this.apiService
      .postFile(
        url.replace("{userId}", this.userService.getUserEmail().toLowerCase()),
        formData,
      )
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  uploadFile(event: any, component: any) {
    let files: any = [...[], ...event.target.files];
    component.totalFileSize = component.filesArray.reduce(
      (acc: number, f: any) => acc + (f.size || 0),
      0,
    );
    let fileUploadFailed: boolean = false;
    for (let i = 0; i < files.length; i++) {
      let file = files[i];
      if (component.filesArray.every((f: any) => f.name !== file.name)) {
        const fileType = file.name.split(".").pop().toLowerCase();
        if (cartFileTypeArray.includes(fileType)) {
          if (
            (fileType.includes("mp4") && file.size < 3.3e7) ||
            file.size < 10485760
          ) {
            component.invalidFileString = "";
            if (!fileType.includes("mp4")) {
              component.totalFileSize = component.totalFileSize + file.size;
            }
            let mp4Files = component.filesArray.filter(
              (f: any) => f?.type?.includes("mp4") || f?.name?.includes(".mp4"),
            );
            let selectedmp4Files = files.filter(
              (f: any) => f?.type?.includes("mp4") || f?.name?.includes(".mp4"),
            );
            if (
              fileType.includes("mp4") &&
              (mp4Files.length == 3 || selectedmp4Files.length > 3)
            ) {
              fileUploadFailed = true;
              component.openModal("Maximum 3 mp4 files are allowed");
              break;
            } else if (
              (fileType.includes("mp4") &&
                (mp4Files.length > 4 || selectedmp4Files.length < 4)) ||
              component.totalFileSize < 5e7
            ) {
              //component.filesArray.push(file);
            } else {
              fileUploadFailed = true;
              component.openModal("Size of all files cannot exceed 50 MB");
              break;
            }
          } else {
            fileUploadFailed = true;
            component.openModal(
              "The file exceeds the allowable size for uploading.",
            );
            break;
          }
        } else {
          fileUploadFailed = true;
          component.openModal("File type not supported");
          break;
        }
      } else {
        fileUploadFailed = true;
        component.openModal("File already exist");
        break;
      }
      component.fileInput.nativeElement.value = '';
    }

    if (!fileUploadFailed) {
      component.filesArray = [...component.filesArray, ...files];
      component.newClaimForm.markAsDirty();
    }
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

  addComment(payload: any) {
    const url = API_CONSTANTS.claim.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase(),
    );
    return this.apiService.patch(url, payload);
  }
  navigateBack() {
    if (
      this.selectedInvoiceLines.claimNumber === undefined &&
      !this.claimNumber
    ) {
      this.router.navigate(["/residential/claims/history"]);
    } else {
      this.router.navigate(["/residential/claims/details"], {
        queryParams: {
          claim: this.selectedInvoiceLines?.claimNumber || this.claimNumber,
        },
      });
    }
  }

  shipToAddresses() {
    const url = API_CONSTANTS.shipToAddresses.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase(),
    );
    return this.apiService.get(url);
  }
  setPhoneNumber(workPhone: any, mobilePhone: any) {
    workPhone = this.extractPhoneNumber(workPhone);
    mobilePhone = this.extractPhoneNumber(mobilePhone);
    return workPhone &&
      workPhone != undefined &&
      workPhone != "" &&
      workPhone != null
      ? workPhone
      : mobilePhone;
  }
  extractPhoneNumber(phone: string) {
    const digits = phone?.replace(/\D/g, ""); // keep only digits
    return digits?.slice(-10); // last 10 digits
  }

  /* labor claim's methods can be added here */
  createLaborClaim(payload: any): Observable<any> {
    let url = API_CONSTANTS.claim.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase(),
    );
    url = url + `?isLaborClaim=True`;
    return this.apiService.patch(url, payload);
  }

  navigateToClaimHistory() {
    this.router.navigate(["/residential/claims/history"]);
  }

  determineAssignedRole(userInfo: any): string {
    if (!userInfo) return "";
    if (userInfo?.isCSR == true) return "Commercial Sales Associate";
    if (userInfo?.isSalesOps == true) return "Retail Sales Associate";
    if (userInfo?.isSalesPerson == true) return "Commercial Sales Associate";
    if (userInfo?.isProductManager == true) return "Manager";
    return userInfo?.primaryRole ? userInfo.primaryRole : "";
  }
}
