import { Injectable } from "@angular/core";
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  CanDeactivate,
  RouterStateSnapshot,
} from "@angular/router";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { BehaviorSubject, Observable, Subject, of } from "rxjs";
import { ConfirmationDialogComponent } from "../shared/components/confirmation-dialog/confirmation-dialog.component";
import { StorageService } from "./storage.service";
import { UserService } from "../shared/user/services/user.service";

@Injectable({
  providedIn: "root",
})
export class DeactivateCloneOrdersGaurd implements CanDeactivate<any> {
  constructor(
    public modalService: BsModalService,
    private storageservice: StorageService,
    private userService: UserService
  ) {}
  modalRef!: BsModalRef;
  confirmationButton$ = new Subject<any>();

  canDeactivate(
    component: any,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    if (
      this.storageservice.selectedCloneOrders?.selectedLines?.length > 0 &&
      nextState.url != "/residential/cloneorders" &&
      nextState.url != "/residential/cart"
    ) {
      this.confirmation();
      return this.confirmationButton$;
    } else {
      return true;
    }
  }

  confirmation() {
    this.openConfirmationModal({
      title: "Confirmation",
      content: "Are you certain you wish to navigate away from this page?",
      primaryActionLabel: "YES",
      secondaryActionLabel: "NO",
      onPrimaryAction: () => {
        this.storageservice.setItem("selectedCloneOrders", {
          sampleOrder: "",
          selectedLines: [],
          module: "",
          productNumber: "",
        });
        this.userService.setUnit("?unitUid=").subscribe((res) => {
          this.userService.setAccountInfoState(false);
          localStorage.setItem("accountNumber", "");
          localStorage.setItem("customerName", "");
          localStorage.setItem("accountData", "");
          localStorage.removeItem("customerAddress");

          this.storageservice.setselectedAccount(null);
        });
        this.confirmationButton$.next(true);
        this.userService.currentUserDetails.next(null);
        this.userService.getCurrentUserDetail().subscribe((res) => {});
        this.modalService.hide();
      },
      onSecondaryAction: () => {
        this.confirmationButton$.next(false);
        this.modalService.hide();
      },
    });
  }

  openConfirmationModal(data = {}) {
    const initialState: ModalOptions = {
      backdrop: true,
      ignoreBackdropClick: true,
      initialState: {
        ...data,
      },
    };
    this.modalRef = this.modalService.show(
      ConfirmationDialogComponent,
      Object.assign(initialState, {
        id: "confirmationModal",
        class: "modal-md modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }
}
