import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/features/http-services/api.service';
import { API_CONSTANTS } from 'src/app/features/shared/constants/API-CONSTANTS';
import { UserService } from 'src/app/features/shared/user/services/user.service';

@Injectable({
  providedIn: 'root',
})
export class DailyPaymentReportService {
  constructor(private apiService: ApiService, private userService: UserService) {}

  getReport(date: any, accountNo: any) {
    const url = `${API_CONSTANTS.dailyPaymentReport.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    )}?date=${date}&arCustomerId=${accountNo}&fields=DEFAULT`;
    const payload = {};
    return this.apiService.post(url, payload);
  }
}
