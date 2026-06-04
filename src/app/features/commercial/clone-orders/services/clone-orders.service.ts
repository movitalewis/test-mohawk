import { Injectable } from "@angular/core";
import { ApiService } from "src/app/features/http-services/api.service";
import { API_CONSTANTS } from "src/app/features/shared/constants/API-CONSTANTS";
import { UserService } from "src/app/features/shared/user/services/user.service";

@Injectable({
  providedIn: "root",
})
export class CloneOrdersService {
  constructor(
    private apiService: ApiService,
    private userService: UserService
  ) {}
  cloneOrdersAddtoCart(sampleOrdrNum: number, shipToId: number, payload: any) {
    let url = API_CONSTANTS.cloneOrderAddToCart.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    url = url.replace("{sampleOrderNum}", sampleOrdrNum);
    url = url.replace("{shipToId}", shipToId);
    return this.apiService.post(url, payload);
  }
  cloneOrdersValidation(sampleOrdrNum: string, accountList: string) {
    let url = API_CONSTANTS.cloneOrdersValidation.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    ).replace("{sampleOrderCode}", sampleOrdrNum).replace(
      "{accountList}", accountList
    );
    // url = url + sampleOrdrNum;
    return this.apiService.get(url);
  }
}
