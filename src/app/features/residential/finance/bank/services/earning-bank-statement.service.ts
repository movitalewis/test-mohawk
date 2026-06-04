import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/features/http-services/api.service';
import { API_CONSTANTS } from 'src/app/features/shared/constants/API-CONSTANTS';
import { UserService } from 'src/app/features/shared/user/services/user.service';

@Injectable({
  providedIn: 'root',
})
export class EarningBankStatementService {
  constructor(private apiService: ApiService, private userService: UserService) {}

  getEarningStatement(
    accountNumber: any,
    quarter: any,
    year: any
  ): Observable<any> {
    return this.apiService.post(
      `${API_CONSTANTS.earningStatements.replace(
        "{userId}",
        this.userService.getUserEmail().toLowerCase()
      )}?customerNumber=${accountNumber}&quarterNumber=${quarter}&year=${year}`,
      {}
    );
  }
}
