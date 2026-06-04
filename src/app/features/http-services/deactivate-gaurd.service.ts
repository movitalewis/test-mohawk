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

@Injectable({
  providedIn: "root",
})
export class DeactivateGaurdService implements CanDeactivate<any> {
  constructor(public modalService: BsModalService) {}
  modalRef!: BsModalRef;
  confirmationButton$ = new Subject<any>();
  alertInfo = '';
  canDeactivate(
    component: any,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    if (component.onDeactivate()) {
      this.alertInfo = component?.deactivateAlertInfo || '';
      this.confirmation();
      return this.confirmationButton$;
    } else {
      return true;
    }
  }

  confirmation() {
    this.openConfirmationModal({
      title: "Unsaved changes",
      content: this.alertInfo === '' ? "Are you certain you wish to navigate away from this page?" : this.alertInfo,
      primaryActionLabel: "YES",
      secondaryActionLabel: "NO",
      onPrimaryAction: () => {
        this.confirmationButton$.next(true);
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
