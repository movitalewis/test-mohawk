import { Component, Input } from "@angular/core";
import { BsModalService } from "ngx-bootstrap/modal";
import { UserService } from "../../user/services/user.service";
import { StorageService } from "src/app/features/http-services/storage.service";

@Component({
  selector: "xchange-claim-comments",
  templateUrl: "./claim-comments.html",
  styleUrl: "./claim-comments.scss",
  standalone: false,
})
export class ClaimComments {
  constructor(
    private modalService: BsModalService,
    private storageService: StorageService,
    private userService: UserService,
  ) {}
  @Input() selectedLine: any;

  @Input() claimNumber: any;
  @Input() selectedLineNumber: any;
  @Input() claimsService: any;
  showPostedComments = false;
  showSalesComments = false;
  errorMessage: string = "";
  newComment: string = "";
  submittedFlag: boolean = false;
  onPrimaryAction: Function = (selectedId: any) => {};
  onHideAction: Function = (selectedId: any) => {};

  onHideModal() {
    if (this.submittedFlag) {
      this.onPrimaryAction();
    }
    this.onHideAction();
    this.modalService.hide("addInvoiceCommentPopupModal");
  }

  submitComment() {
    let payload = {
      line: [
        {
          invoiceLineNumber: this.selectedLineNumber,
          additionalInfoNotes: this.newComment,
          component: this.selectedLine.component,
          isSales:
            this.storageService.userInfo?.isSalesPerson ||
            this.storageService.userInfo?.isSalesOps ||
            false,
          disputeCaseId:
            this.selectedLine?.disputeCaseId &&
            this.selectedLine?.disputeCaseId != "NA"
              ? this.selectedLine?.disputeCaseId
              : "",
        },
      ],
      claimNumber: this.claimNumber,
    };
    // this.spinnerLoading = true;
    this.userService.progressShow("claimUpdate");
    this.claimsService.addComment(payload).subscribe(
      (res: any) => {
        // this.spinnerLoading = false;
        this.submittedFlag = true;
        // res?.errorCode;
        this.userService.progressHide("claimUpdate");
        // this.onPrimaryAction();
        // this.onHideModal();

        this.newComment = "";
      },
      (error: any) => {
        // this.spinnerLoading = false;
        this.userService.progressHide("claimUpdate");
        this.errorMessage = error.error;
      },
    );
  }
}
