import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, of } from "rxjs";
import { ApiService } from "src/app/features/http-services/api.service";
import { API_CONSTANTS } from "src/app/features/shared/constants/API-CONSTANTS";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { MESSAGE_CONSTANTS } from "src/app/features/shared/constants/MESSAGE-CONSTANTS";
import { ProgressModalComponent } from "src/app/features/shared/components/progress-modal/progress-modal.component";

@Injectable({
  providedIn: "root",
})
export class AccountService {
  modalRef?: BsModalRef;
  constructor(
    private apiService: ApiService,
    private userService: UserService,
    private modalService: BsModalService,
  ) {}

  validatePasskey(payload: any) {
    let url = API_CONSTANTS.validatePassKey.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    return this.apiService
      .post(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  getSalesHierarchyForUser(isSalesperson:boolean = false) {
    let url = API_CONSTANTS.getSalesHierarchy.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );

    if(isSalesperson){
      url = API_CONSTANTS.salesHierarchyforSalesOps.replace(
        "{userId}",
        this.userService.getUserEmail().toLowerCase()
      );
    }

    return this.apiService.get(url);
  }

  salesHierarchyforSalesManager(){
    let url = API_CONSTANTS.salesHierarchyforSalesManager.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );

    return this.apiService.get(url);
  }

  getChildHierarchy(hierarchyCode: any, role: any) {
    let url = API_CONSTANTS.getChildHierarchy.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    url = `${url}?salesHierarchyRole=${role}&salesHierarchyCode=${hierarchyCode}`;

    return this.apiService.get(url);
  }

  getsalesListAccounts(resObj: any, pageIndex: any, itemsPerPage: any) {
    let url = API_CONSTANTS.getsalesListAccounts.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    url =
      url +
      "?currentPage=" +
      pageIndex +
      "&fields=FULL&pageSize=" +
      itemsPerPage;
    return this.apiService.post(url, resObj);
  }

  getSalesTeam(accountId: any) {
    const url = API_CONSTANTS.getSalesTeam.replace("{accountId}", accountId);

    return this.apiService.get(url);
  }
  
  progressShow(msgType: any) {
    const messageConstants = MESSAGE_CONSTANTS?.accountSearch?.[msgType]
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
