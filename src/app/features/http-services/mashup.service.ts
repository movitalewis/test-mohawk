import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { environment } from "src/environments/environment";
import { API_CONSTANTS } from "../shared/constants/API-CONSTANTS";

@Injectable({ providedIn: "root" })
export class MashupService {
  constructor(private http: HttpClient) {}

  isMashup = new BehaviorSubject(false);

  setMashupAccount(accountNumber: any, email: string) {
    //debugger;
    let url = environment.baseUrl + API_CONSTANTS.mashup;
    url = url.replace("{email}", email);
    this.http
      .post(url, {
        accountID: accountNumber,
      })
      .subscribe();
  }
}
