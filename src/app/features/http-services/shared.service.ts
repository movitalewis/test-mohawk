import { Injectable } from "@angular/core";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { BehaviorSubject } from "rxjs";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { ConfirmationDialogComponent } from "../shared/components/confirmation-dialog/confirmation-dialog.component";

@Injectable({
  providedIn: "root",
})
export class SharedService {
  constructor(
    private userService: UserService,
    public modalService: BsModalService,
    public bsModalRef: BsModalRef
  ) {}
  public baseSiteId = "";
  private untickUnselectedProducts$ = new BehaviorSubject<any>(null);
  modalRef!: BsModalRef;
  getUserInfo() {
    let payload = {
      username: "", //savitha_nuguri@mohawkind.com
      password: "Mohawk@123",
    };
    this.userService.getUserDetails(payload).subscribe((res: any) => {});
  }

  setuntickUnselectedProducts(data: any) {
    this.untickUnselectedProducts$.next(data);
  }
  getuntickUnselectedProducts() {
    return this.untickUnselectedProducts$.asObservable();
  }
  confirmation(modalService: any, modalID: any) {
    this.openConfirmationModal({
      title: "Confirmation",
      content: "Are you certain you wish to navigate away from this page?",
      primaryActionLabel: "YES",
      secondaryActionLabel: "NO",
      onPrimaryAction: () => {
        modalService.hide(modalID);
        this.modalService.hide();
      },
      onSecondaryAction: () => {
        this.modalService.hide("confirmationModal");
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
