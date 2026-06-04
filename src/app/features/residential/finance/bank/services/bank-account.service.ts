import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, Observable, of } from "rxjs";
import { ApiService } from "src/app/features/http-services/api.service";
import { API_CONSTANTS } from "src/app/features/shared/constants/API-CONSTANTS";
import { UserService } from "src/app/features/shared/user/services/user.service";

@Injectable({
  providedIn: "root",
})
export class BankAccountService {
  constructor(
    private apiService: ApiService,
    private userService: UserService
  ) {}

  getBankAccounts(
    dealerAccountNo: any,
    orderby: string = "",
    sortBy: string = ""
  ): Observable<any> {
    // const url = `${API_CONSTANTS.bankDetails}?accountNumber=${dealerAccountNo}&fields=DEFAULT&orderby=${orderby}&sortBy=${sortBy}`;
    const url = `${API_CONSTANTS.bankDetails.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    )}?accountNumber=${dealerAccountNo}&fields=DEFAULT`;
    return this.apiService
      .get(url)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  getBankAccountStatements(
    dealerAccountNo: string,
    year: string
  ): Observable<any> {
    const url = `${API_CONSTANTS.bankAccountStatements.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    )}?accountNumber=${dealerAccountNo}&year=${year}`;
    return this.apiService
      .get(url)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }
  getAccountStatementDetails(
    accountNumber: string,
    statementDate: string
  ): Observable<any> {
    const url = `${API_CONSTANTS.statementDetails.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    )}?accountNumber=${accountNumber}&date=${statementDate}`;
    return this.apiService
      .get(url)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  deleteBankAccount(payload: any): Observable<any> {
    return this.apiService
      .post(
        `${
          API_CONSTANTS.deletebankDetails.replace(
            "{userId}",
            this.userService.getUserEmail().toLowerCase()
          )
        }?fields=DEFAULT&accountNumber=${localStorage.getItem(
          "accountNumber"
        )}&customerUid=${this.userService.getUserEmail().toLowerCase()}`,
        payload
      )
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }
  getAddedBankAccount(payload: any, accountNumber: any): Observable<any> {
    let url = API_CONSTANTS.getAddedBankAccount.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    url = url.replace("{accountNumber}", accountNumber);
    url = url.replace("{currency}", payload?.currency);
    url = url.replace("{userId}", this.userService.getUserEmail().toLowerCase());

    return this.apiService
      .post(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }
  editBankAccount(payload: any): Observable<any> {
    const url = `${
      API_CONSTANTS.editBankAccount.replace(
        "{userId}",
        this.userService.getUserEmail().toLowerCase()
      )
    }?fields=DEFAULT&accountNumber=${localStorage.getItem(
      "accountNumber"
    )}&customerUid=${this.userService.getUserEmail().toLowerCase()}`;
    return this.apiService
      .post(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }
  unsettledPayment(token: any) {
    const payLoad = {
      token: token,
    };
    const url = `${API_CONSTANTS.unsettledPayment.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    )}?fields=DEFAULT`;
    return this.apiService.post(url, payLoad);
  }
}
