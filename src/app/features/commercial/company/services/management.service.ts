import { Injectable } from "@angular/core";
import { API_CONSTANTS } from "src/app/features/shared/constants/API-CONSTANTS";
import { ApiService } from "src/app/features/http-services/api.service";
import { catchError, Observable, of } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { MESSAGE_CONSTANTS } from "src/app/features/shared/constants/MESSAGE-CONSTANTS";
import { ProgressModalComponent } from "src/app/features/shared/components/progress-modal/progress-modal.component";
@Injectable({
  providedIn: "root",
})
export class ManagementService {
  isUserUpdated: boolean = false;
  isUserAdded: boolean = false;
  constructor(
    private apiService: ApiService,
    private userService: UserService,
    private modalService: BsModalService,
  ) {}

  getAccountList(): Observable<any> {
    const url = `${API_CONSTANTS.customers.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    )}/getMultiAccounts`;
    return this.apiService.get(url);
  }
  getCompanyUserAccountList(email: string): Observable<any> {
    const url = `${API_CONSTANTS.customers.replace(
      "{userId}",
      `${email}`
    )}/getMultiAccounts`;
    return this.apiService.get(url);
  }

  getAccountById(selectedAccount: string): Observable<any> {
    const url = `${API_CONSTANTS.customers.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    )}/populateSuffix?selectedAccount=${selectedAccount}&showShipTos=true`;
    return this.apiService.get(url);
  }
  getSearchAccount(searchText: string): Observable<any> {
    const url = `${API_CONSTANTS.customers.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    )}/populateSuffix?selectedAccount=${searchText}`;
    return this.apiService.get(url);
  }

  addCustomer(customerDetails: any): Observable<any> {
    const url = API_CONSTANTS.customers.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    );
    return this.apiService.post(url, customerDetails);
  }

  getAllUsers(): Observable<any> {
    const url = `${API_CONSTANTS.customers.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    )}`;
    return this.apiService.get(url);
  }

  getCustomerList(params: any = {}): Observable<any> {
    let url = `${API_CONSTANTS.getCustomersList.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    )}`;
    if (params?.paramFlag) {
      url = `${url}?searchCustomerId=${params?.searchCustomerId}&userPermissionId=${params?.userPermissionId}&sortBy=${params?.sortBy}&sortCode=${params?.sortCode}&currentPage=${params?.pageIndex}&pageSize=${params?.pageItemSize}&status=${params?.status}`;
    }
    return this.apiService.get(url);
  }

  getUserById(userId: string): Observable<any> {
    const url = `${API_CONSTANTS.customers.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    )}/${encodeURIComponent(userId)}`;
    return this.apiService.get(url);
  }

  updateUserDisplay(userId: string): Observable<any> {
    const url = `${API_CONSTANTS.customers.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    )}/edit?userId=${encodeURIComponent(userId)}`;
    return this.apiService.get(url);
  }
  updateUserSubmit(userId: string, userDetails: any): Observable<any> {
    const url = `${API_CONSTANTS.customers.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    )}/edit?userId=${encodeURIComponent(userId)}`;
    return this.apiService.patch(url, userDetails);
  }

  disableUser(email: any): Observable<any> {
    const url = API_CONSTANTS.UserDisable + email;
    return this.apiService.post(url, email);
  }

  enableUser(email: any): Observable<any> {
    const url = API_CONSTANTS.userEnable + email;
    return this.apiService.post(url, email);
  }

  searchUsers(value: any): Observable<any> {
    const url = `${API_CONSTANTS.getCustomersList.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    )}?searchCustomerId=${encodeURIComponent(value)}`;
    return this.apiService.get(url);
  }

  filterUsersByPermission(permission: any): Observable<any> {
    const url = `${API_CONSTANTS.getCustomersList.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    )}?&&userPermissionId=${permission}`;
    return this.apiService.get(url);
  }

  editAccountsByCsr(payload: any): Observable<any> {
    const url = `${API_CONSTANTS.csrAccountsEdit.replace(
      "{userId}",
      this.userService.getUserEmail().toLowerCase()
    )}`;
    return this.apiService.post(url, payload);
  }

  
    modalRef?: BsModalRef;
      progressShow(msgType: any) {
        console.log(msgType);
        
        const messageConstants = MESSAGE_CONSTANTS?.companyModule?.[msgType]
        console.log(messageConstants);
        
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
