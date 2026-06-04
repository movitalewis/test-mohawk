import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { formatDate } from '@angular/common';
import { catchError, map, Observable, of } from 'rxjs';
import { ApiService } from 'src/app/features/http-services/api.service';
import { API_CONSTANTS } from 'src/app/features/shared/constants/API-CONSTANTS';
import { UserService } from 'src/app/features/shared/user/services/user.service';
import { environment } from "src/environments/environment";
import { ProgressModalComponent } from 'src/app/features/shared/components/progress-modal/progress-modal.component';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { MESSAGE_CONSTANTS } from 'src/app/features/shared/constants/MESSAGE-CONSTANTS';

@Injectable({
  providedIn: 'root',
})
export class MakePaymentService {
  modalRef?: BsModalRef;
  constructor(
    private apiService: ApiService,
    private userService: UserService, 
    private http: HttpClient,
    private modalService: BsModalService,
  ) {}

  /**
   * Get Open Receivables Method
   * @param {string} accountNumber - Account number to get open receivables for.
   * @param {boolean} [defaultValues] - If true, returns hardcoded default values.
   * @returns Observable<any>
   */
  public getOpenReceivables(payload: any, defaultValues?: boolean) {
    if (defaultValues) {
      return of({
        currentDue: 2.0,
        openReceivablesData: [
          {
            checked: false,
            company: 'C',
            customerNumber: '216650',
            deductionEntries:[],
            discountAmount: 45.50,
            documentDate: '2022-12-22T04:00:00+0000',
            documentNumber: 'C6190445',
            finalDueAmount: 0.0,
            finalDueDate: '2022-08-20T04:00:00+0000',
            freightAmount: 30.82,
            hasDeductionFlag: false,
            netAmount: 902.00,
            openAmount: 947.50,
            otherAmount: 0.0,
            pk: '8796093098246',
            poNumber: 'OB001824',
            scheduledAmount: 901.91,
            showPdfURL: true,
            status: 'Open',
            taxAmount: 0.0,
            totalAmount: 901.91,
            type: 'INV',
          },
          {
            checked: false,
            company: 'C',
            customerNumber: '216650',
            deductionEntries: [
              {
                comment: 'Company C',
                comments: 'Company C comments',
                deductionAmount: 50,
                deductionDescription: 'moreabcxyz',
                index: 1,
                netChargeAmount: 'N/A',
                openAmount:600,
                pk: 0,
                selectedPayment: 0,
              },
              {
                comment: 'Company G',
                comments: 'Company G comments',
                deductionAmount: 100,
                deductionDescription: 'moreabcxyz123',
                index: 2,
                netChargeAmount: 'N/A',
                openAmount: 600,
                pk: 0,
                selectedPayment: 0,
              },
            ],
            discountAmount: 100.00,
            documentDate: '2022-07-22T04:00:00+0000',
            documentNumber: 'C6190446',
            finalDueAmount: 0.0,
            finalDueDate: '2022-08-20T04:00:00+0000',
            freightAmount: 30.82,
            hasDeductionFlag: true,
            netAmount: 500.00,
            openAmount: 600.00,
            otherAmount: 0.0,
            pk: '8796093098246',
            poNumber: 'OB001824',
            scheduledAmount: 500.00,
            showPdfURL: true,
            status: 'Open',
            taxAmount: 0.0,
            totalAmount: 500.00,
            type: 'INT',
          },
          {
            checked: false,
            company: 'R',
            customerNumber: '216650',
            discountAmount: 95.85,
            deductionEntries :[] , 
            documentDate: '2022-07-22T04:00:00+0000',
            documentNumber: 'C6190473',
            finalDueAmount: 0.0,
            finalDueDate: '2022-08-20T04:00:00+0000',
            freightAmount: 30.82,
            hasDeductionFlag: false,
            netAmount: 1004.91,
            openAmount: 1100.76,
            otherAmount: 0.0,
            pk: '8796093098246',
            poNumber: 'OB001824',
            scheduledAmount: 1004.91,
            showPdfURL: true,
            status: 'Open',
            taxAmount: 0.0,
            totalAmount: 1004.91,
            type: 'INT',
          },
          {
            checked: false,
            company: 'R',
            customerNumber: '216650',
            deductionEntries: [
              {
                comment: 'Company R',
                comments: 'Company R comments',
                deductionAmount: 0,
                deductionDescription: 'The deduction was made with Company R',
                index: 1,
                netChargeAmount: 0,
                openAmount: 0,
                pk: 0,
                selectedPayment: 0,
              },
            ],
            discountAmount: 35.75,
            documentDate: '2022-07-22T04:00:00+0000',
            documentNumber: 'C6190463',
            finalDueAmount: 0.0,
            finalDueDate: '2022-08-20T04:00:00+0000',
            freightAmount: 30.82,
            hasDeductionFlag: true,
            netAmount: 460.20,
            openAmount: 460.90,
            otherAmount: 0.0,
            pk: '8796093098246',
            poNumber: 'OB001824',
            scheduledAmount: 425.20,
            showPdfURL: true,
            status: 'Open',
            taxAmount: 0.0,
            totalAmount: 425.20,
            type: 'INV',
          },
          {
            checked: false,
            company: 'C',
            customerNumber: '216650',
            deductionEntries: [
              {
                comment: 'Company C',
                comments: 'Company C comments',
                deductionAmount: 0,
                deductionDescription: 'The deduction was made with Company C',
                index: 0,
                netChargeAmount: 0,
                openAmount: 0,
                pk: 0,
                selectedPayment: 0,
              },
            ],
            discountAmount: 75.85,
            documentDate: '2022-07-22T04:00:00+0000',
            documentNumber: 'C6190448',
            finalDueAmount: 0.0,
            finalDueDate: '2022-08-20T04:00:00+0000',
            freightAmount: 30.82,
            hasDeductionFlag: true,
            netAmount: 864.91,
            openAmount: 940.76,
            otherAmount: 0.0,
            pk: '8796093098246',
            poNumber: 'OB001824',
            scheduledAmount: 864.91,
            showPdfURL: true,
            status: 'Open',
            taxAmount: 0.0,
            totalAmount: 864.91,
            type: 'INV',
          },
          {
            checked: false,
            company: 'R',
            customerNumber: '216650',
            deductionEntries: [
              {
                comment: 'Company R',
                comments: 'Company R comments',
                deductionAmount: 0,
                deductionDescription: 'The deduction was made with Company R',
                index: 0,
                netChargeAmount: 0,
                openAmount: 0,
                pk: 0,
                selectedPayment: 0,
              },
            ],
            discountAmount: 96.67,
            documentDate: '2022-07-22T04:00:00+0000',
            documentNumber: 'C6190474',
            finalDueAmount: 0.0,
            finalDueDate: '2022-08-20T04:00:00+0000',
            freightAmount: 30.82,
            hasDeductionFlag: true,
            netAmount: 668.98,
            openAmount: 765.65,
            otherAmount: 0.0,
            pk: '8796093098246',
            poNumber: 'OB001824',
            scheduledAmount: 668.98,
            showPdfURL: true,
            status: 'Open',
            taxAmount: 0.0,
            totalAmount: 668.98,
            type: 'INV',
          },
          {
            checked: false,
            company: 'R',
            customerNumber: '216650',
            discountAmount: 58.45,
            documentDate: '2022-07-22T04:00:00+0000',
            documentNumber: 'C6190466',
            finalDueAmount: 0.0,
            finalDueDate: '2022-08-20T04:00:00+0000',
            freightAmount: 30.82,
            hasDeductionFlag: false,
            netAmount: 816.79,
            openAmount: 875.24,
            otherAmount: 0.0,
            pk: '8796093098246',
            poNumber: 'OB001824',
            scheduledAmount: 816.79,
            showPdfURL: true,
            status: 'Open',
            taxAmount: 0.0,
            totalAmount: 816.79,
            type: 'INV',
          },
          {
            checked: false,
            company: 'R',
            customerNumber: '216650',
            deductionEntries: [
              {
                comment: 'company R',
                comments: 'company R deduction',
                deductionAmount: 0,
                deductionDescription: 'The deduction was made with company R',
                index: 0,
                netChargeAmount: 0,
                openAmount: 0,
                pk: 0,
                selectedPayment: 0,
              },
            ],
            discountAmount: 40.01,
            documentDate: '2022-07-22T04:00:00+0000',
            documentNumber: 'C6190468',
            finalDueAmount: 0.0,
            finalDueDate: '2022-08-20T04:00:00+0000',
            freightAmount: 30.82,
            hasDeductionFlag: true,
            netAmount: 413.70,
            openAmount: 453.71,
            otherAmount: 0.0,
            pk: '8796093098246',
            poNumber: 'OB001824',
            scheduledAmount: 413.70,
            showPdfURL: true,
            status: 'Open',
            taxAmount: 0.0,
            totalAmount: 413.70,
            type: 'INV',
          },
          {
            checked: false,
            company: 'R',
            customerNumber: '216650', 
            deductionEntries: [] ,           
            discountAmount: 75.00,
            documentDate: '2022-07-22T04:00:00+0000',
            documentNumber: 'C6190470',
            finalDueAmount: 0.0,
            finalDueDate: '2022-08-20T04:00:00+0000',
            freightAmount: 30.82,
            hasDeductionFlag: false,
            netAmount: 30.00,
            openAmount: 105.00,
            otherAmount: 0.0,
            pk: '8796093098246',
            poNumber: 'OB001824',
            scheduledAmount: 105.00,
            showPdfURL: true,
            status: 'Open',
            taxAmount: 0.0,
            totalAmount: 105.00,
            type: 'INV',
          },
          {
            checked: false,
            company: 'R',
            customerNumber: '216650',
            deductionEntries: [] , 
            discountAmount: 37.85,
            documentDate: '2022-07-22T04:00:00+0000',
            documentNumber: 'C6190471',
            finalDueAmount: 0.0,
            finalDueDate: '2022-08-20T04:00:00+0000',
            freightAmount: 30.82,
            hasDeductionFlag: false,
            netAmount: 862.91,
            openAmount: 900.76,
            otherAmount: 0.0,
            pk: '8796093098246',
            poNumber: 'OB001824',
            scheduledAmount: 862.91,
            showPdfURL: true,
            status: 'Open',
            taxAmount: 0.0,
            totalAmount: 862.91,
            type: 'INV',
          },
          {
            checked: false,
            company: 'R',
            customerNumber: '216650',
            deductionEntries: [] , 
            discountAmount: 17.76,
            documentDate: '2022-12-22T04:00:00+0000',
            documentNumber: 'C6190461',
            finalDueAmount: 0.0,
            finalDueDate: '2022-08-20T04:00:00+0000',
            freightAmount: 30.82,
            hasDeductionFlag: false,
            netAmount: 930.00,
            openAmount: 947.76,
            otherAmount: 0.0,
            pk: '8796093098246',
            poNumber: 'OB001824',
            scheduledAmount: 930.00,
            showPdfURL: true,
            status: 'Open',
            taxAmount: 0.0,
            totalAmount: 930.00,
            type: 'INV',
          },
          {
            checked: false,
            company: 'R',
            customerNumber: '216650',
            deductionEntries: [
              {
                comment: 'Company R',
                comments: 'Company R comments',
                deductionAmount: 0,
                deductionDescription: 'The deduction was made with Company R',
                index: 0,
                netChargeAmount: 0,
                openAmount: 0,
                pk: 0,
                selectedPayment: 0,
              },
            ],
            discountAmount: 46.10,
            documentDate: '2022-07-22T04:00:00+0000',
            documentNumber: 'C6190467',
            finalDueAmount: 0.0,
            finalDueDate: '2022-08-20T04:00:00+0000',
            freightAmount: 30.82,
            hasDeductionFlag: true,
            netAmount: 901.66,
            openAmount: 947.76,
            otherAmount: 0.0,
            pk: '8796093098246',
            poNumber: 'OB001824',
            scheduledAmount: 901.66,
            showPdfURL: true,
            status: 'Open',
            taxAmount: 0.0,
            totalAmount: 901.66,
            type: 'INV',
          },
          {
            checked: false,
            company: 'R',
            customerNumber: '216650',
            deductionEntries: [
              {
                comment: 'Company R',
                comments: 'Company R comments',
                deductionAmount: 0,
                deductionDescription: 'The deduction was made with Company R',
                index: 0,
                netChargeAmount: 0,
                openAmount: 0,
                pk: 0,
                selectedPayment: 0,
              },
            ],
            discountAmount: 85.10,
            documentDate: '2022-07-22T04:00:00+0000',
            documentNumber: 'C6190465',
            finalDueAmount: 0.0,
            finalDueDate: '2022-08-20T04:00:00+0000',
            freightAmount: 30.82,
            hasDeductionFlag: true,
            netAmount: 589.10,
            openAmount: 674.20,
            otherAmount: 0.0,
            pk: '8796093098246',
            poNumber: 'OB001824',
            scheduledAmount: 589.10,
            showPdfURL: true,
            status: 'Open',
            taxAmount: 0.0,
            totalAmount: 589.10,
            type: 'INV',
          },
          {
            checked: false,
            company: 'R',
            customerNumber: '216650',
            deductionEntries: [
              {
                comment: 'Company R',
                comments: 'Company R comments',
                deductionAmount: 0,
                deductionDescription: 'The deduction was made with Company R',
                index: 0,
                netChargeAmount: 0,
                openAmount: 0,
                pk: 0,
                selectedPayment: 0,
              },
            ],
            discountAmount: 25.75,
            documentDate: '2022-07-22T04:00:00+0000',
            documentNumber: 'C6190443',
            finalDueAmount: 0.0,
            finalDueDate: '2022-08-20T04:00:00+0000',
            freightAmount: 30.82,
            hasDeductionFlag: true,
            netAmount: 405.50,
            openAmount: 430.25,
            otherAmount: 0.0,
            pk: '8796093098246',
            poNumber: 'OB001824',
            scheduledAmount: 405.50,
            showPdfURL: true,
            status: 'Open',
            taxAmount: 0.0,
            totalAmount: 405.50,
            type: 'INV',
          },
          {
            checked: false,
            company: 'R',
            customerNumber: '216650',
            deductionEntries: [] , 
            discountAmount: 5.85,
            documentDate: '2022-07-22T04:00:00+0000',
            documentNumber: 'C6190453',
            finalDueAmount: 0.0,
            finalDueDate: '2022-08-20T04:00:00+0000',
            freightAmount: 30.82,
            hasDeductionFlag: false,
            netAmount: 941.91,
            openAmount: 947.76,
            otherAmount: 0.0,
            pk: '8796093098246',
            poNumber: 'OB001824',
            scheduledAmount: 941.91,
            showPdfURL: true,
            status: 'Open',
            taxAmount: 0.0,
            totalAmount: 941.91,
            type: 'INV',
          },
          {
            checked: false,
            company: 'R',
            customerNumber: '216650',
            deductionEntries: [
              {
                comment: 'Company R',
                comments: 'Company R comments',
                deductionAmount: 0,
                deductionDescription: 'The deduction was made with Company R',
                index: 0,
                netChargeAmount: 0,
                openAmount: 0,
                pk: 0,
                selectedPayment: 0,
              },
            ],
            discountAmount: 100.05,
            documentDate: '2022-07-22T04:00:00+0000',
            documentNumber: 'C6190451',
            finalDueAmount: 0.0,
            finalDueDate: '2022-08-20T04:00:00+0000',
            freightAmount: 30.82,
            hasDeductionFlag: true,
            netAmount: 500.90,
            openAmount: 600.95,
            otherAmount: 0.0,
            pk: '8796093098246',
            poNumber: 'OB001824',
            scheduledAmount: 500.90,
            showPdfURL: true,
            status: 'Open',
            taxAmount: 0.0,
            totalAmount: 500.90,
            type: 'INV',
          },
          {
            checked: false,
            company: 'R',
            customerNumber: '216650',
            deductionEntries: [
              {
                comment: 'Company R',
                comments: 'Company R comments',
                deductionAmount: 0,
                deductionDescription: 'The deduction was made with Company R',
                index: 0,
                netChargeAmount: 0,
                openAmount: 0,
                pk: 0,
                selectedPayment: 0,
              },
            ],
            discountAmount: 1.00,
            documentDate: '2022-07-22T04:00:00+0000',
            documentNumber: 'C6190452',
            finalDueAmount: 0.00,
            finalDueDate: '2022-08-20T04:00:00+0000',
            freightAmount: 30.82,
            hasDeductionFlag: true,
            netAmount: 209.05,
            openAmount: 209.05,
            otherAmount: 0.00,
            pk: '8796093098246',
            poNumber: 'OB001824',
            scheduledAmount: 209.05,
            showPdfURL: true,
            status: 'Open',
            taxAmount: 0.00,
            totalAmount: 209.05,
            type: 'INV',
          },
          {
            checked: false,
            company: 'R',
            customerNumber: '216650',
            deductionEntries: [] , 
            discountAmount: 10.85,
            documentDate: '2022-07-22T04:00:00+0000',
            documentNumber: 'C6190458',
            finalDueAmount: 0.0,
            finalDueDate: '2022-08-20T04:00:00+0000',
            freightAmount: 30.82,
            hasDeductionFlag: false,
            netAmount: 36.91,
            openAmount: 47.76,
            otherAmount: 0.0,
            pk: '8796093098246',
            poNumber: 'OB001824',
            scheduledAmount: 36.91,
            showPdfURL: true,
            status: 'Open',
            taxAmount: 0.0,
            totalAmount: 36.91,
            type: 'INV',
          },
          {
            checked: false,
            company: 'R',
            customerNumber: '216650',
            deductionEntries: [] , 
            discountAmount: 63.00,
            documentDate: '2022-07-22T04:00:00+0000',
            documentNumber: 'C619059',
            finalDueAmount: 0.0,
            finalDueDate: '2022-08-20T04:00:00+0000',
            freightAmount: 30.82,
            hasDeductionFlag: false,
            netAmount: 812.76,
            openAmount: 875.76,
            otherAmount: 0.0,
            pk: '8796093098246',
            poNumber: 'OB001824',
            scheduledAmount: 812.76,
            showPdfURL: true,
            status: 'Open',
            taxAmount: 0.0,
            totalAmount: 812.76,
            type: 'INV',
          },
          {
            checked: false,
            company: 'R',
            customerNumber: '216650',
            deductionEntries: [
              {
                comment: 'Company R',
                comments: 'Company R comments',
                deductionAmount: 0,
                deductionDescription: 'The deduction was made with Company R',
                index: 0,
                netChargeAmount: 0,
                openAmount: 0,
                pk: 0,
                selectedPayment: 0,
              },
            ],
            discountAmount: 54.23,
            documentDate: '2022-07-22T04:00:00+0000',
            documentNumber: 'C6190456',
            finalDueAmount: 0.0,
            finalDueDate: '2022-08-20T04:00:00+0000',
            freightAmount: 30.82,
            hasDeductionFlag: true,
            netAmount: 600.53,
            openAmount: 654.76,
            otherAmount: 0.0,
            pk: '8796093098246',
            poNumber: 'OB001824',
            scheduledAmount: 600.53,
            showPdfURL: true,
            status: 'Open',
            taxAmount: 0.0,
            totalAmount: 600.53,
            type: 'INV',
          },
        ],
        pastDue: 1271.6799999999998,
        totalDue: 1273.6799999999998,
      });
    } else {
      return this.apiService
        .get(
  // `${API_CONSTANTS.receivables}?accountNumber=${accountNumber}&cancel=false&fields=DEFAULT&orderby=ASC&page=0&sort=finalDueDate`
  `${API_CONSTANTS.receivables.replace(
    "{userId}",
    this.userService.getUserEmail().toLowerCase()
  )}?accountNumber=${payload?.accountNumber}&cancel=${payload?.cancelFlag}&fields=${payload?.fieldsFlag}&orderby=${payload?.orderBy}&page=${payload?.page}&sort=${payload?.sortBy}&searchTextBy=${payload?.searchTextBy}&searchKeyword=${payload?.searchKeyword}&company=${payload?.companySelected}&type=${payload?.type}`
  )
        .pipe(
          map((results) => {
            if (results instanceof HttpErrorResponse) {
              return [];
            } else {
              return results.body;
            
              // return {
              //   ...results.body,
              //   currentDue: results.body.currentDue.toFixed(2),
              //   pastDue: results.body.pastDue.toFixed(2),
              //   totalDue: results.body.totalDue.toFixed(2),
              //   openReceivablesData: results?.body?.openReceivablesData.map(
              //     (receivable: any) => {
              //       return {
              //         ...receivable,
              //         documentDate: formatDate(
              //           receivable.documentDate,
              //           'MM/dd/yyyy',
              //           'en-US'
              //         ),
              //         finalDueDate: formatDate(
              //           receivable.finalDueDate,
              //           'MM/dd/yyyy',
              //           'en-US'
              //         ),
              //         openAmount: `$${receivable.openAmount.toFixed(2)}`,
              //         discountAmount: `$${
              //           receivable.discountAmount.toFixed(2) * -1
              //         }`,
              //         scheduledAmount: receivable.scheduledAmount.toFixed(2),
              //       };
              //     }
              //   ),
              // };
            }
          })
        );
    }
  }

  public createSchedulePayment(paylaod:any, customerUid:any){
    const url = `${API_CONSTANTS.createSchedulePayment.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    )}?customerUid=${customerUid}&fields=DEFAULT`;
    return this.apiService.post(url,paylaod)

  }

  public createSuspendPayment(paylaod:any, customerUid:any){
    const url = `${API_CONSTANTS.createSuspendPayment.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    )}?customerUid=${customerUid}&fields=DEFAULT`;
    return this.apiService.post(url,paylaod)

  }
  
  getCreditAnalyst(payload :any ,accountNumber : any): Observable<any> {
    
    const url = API_CONSTANTS.getCreditAnalyst.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    )+accountNumber
    return this.apiService
    .post(url,payload)
    .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  getInvoicePdf(payload: any): Observable<any> {
    let url = `${API_CONSTANTS.invoicePdfDownload.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    )}`;
    url = url.replace("{userId}", this.userService.getUserEmail().toLowerCase());
    return this.apiService.post(url, payload);
  }

  getInvoicePdfFromS4(fileId: any) {
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

  getInvoicePdfFromCAMS(payload: any): Observable<any> {
    const baseUrl = `https://pubtst.virtualservices.mohawkind.com/SOAT305Cloud/vPUB.MHK.eMPower.GetCAMSInvoicePDF.svc`;
    const uname = "eMpower_hybris";
    const pwd = "Gr3@tJo8!";
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
  getSignUpBillPayUsers(uid:any): Observable<any> {
    let url = `${API_CONSTANTS.billPaySignUpUser.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    )}`;
    url = url.replace("{userId}", this.userService.getUserEmail().toLowerCase());
    return this.apiService.get(url);
  }
  submitSignUpBillPayUsers(userEmail:any): Observable<any> {
    let url = `${API_CONSTANTS.invoiceSignUp.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    )}`;
    const payload = {
      customerUid: userEmail
    };
    return this.apiService.post(url,payload);
  }

  ebillExpressAuthentication(){
    let url = API_CONSTANTS.ebillExpressAuthentication.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    return this.apiService.get(url);
  }

  public scheduleToCancel(paymentSelect:any){
    const url = `${API_CONSTANTS.cancelScheduledPayment.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    )}?fields=DEFAULT&paymentSelect=${paymentSelect}&userId=${this.userService.getUserEmail().toLowerCase()}`;
    return this.apiService.post(url,{});
  }  
  progressShow(msgType: any) {
    const messageConstants = MESSAGE_CONSTANTS?.finance?.[msgType]
    this.openProgressModal({
      modalHeaderText: messageConstants?.headerText,
      progressText: messageConstants?.bodyText,
      progressBarText: messageConstants?.barText
    });
  }
  progressHide() {
    this.modalService.hide("progressModal");
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
}
