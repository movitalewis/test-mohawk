import { Component, OnInit, TemplateRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { BsModalService, BsModalRef,ModalOptions } from "ngx-bootstrap/modal";

import { QuotesService } from "../../services/quotes.service";
import { ProgressModalComponent } from "src/app/features/shared/components/progress-modal/progress-modal.component";
import { MESSAGE_CONSTANTS } from "src/app/features/shared/constants/MESSAGE-CONSTANTS";

@Component({
    selector: "cancel-quote-popup",
    templateUrl: "./cancel-quote-popup.component.html",
    styleUrls: ["./cancel-quote-popup.component.scss"],
    standalone: false
})
export class CancelQuotePopupComponent implements OnInit {
  modalRef?: BsModalRef;

  quoteCode: any;
  comments: any;
  alertData: any = {
    message: "success",
  };
  alertType: any = "success";
  alertTrigger: any = false;
  spinnerLoading: boolean = false;

  constructor(
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private route: ActivatedRoute,
    private quotesService: QuotesService,
    private router: Router
  ) {}

  cancelQuoteModal(template1: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template1, {
      id: 2,
      class: "modal-md modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }

  onHideModal() {
    this.bsModalRef.hide();
  }

  ngOnInit(): void {}

  isDisabled: boolean = true;
  onComment(event: any) {
    this.comments = event.target.value;
    if (event.target.value.length > 0) {
      this.isDisabled = false;
    } else {
      this.isDisabled = true;
    }
  }

  cancelQuote() {
    this.progressShow('cancel')
    let payload = {
      comment: this.comments,
      editMode: true,
      endUserCode: "string",
      endUserDescription: "string",
      jobLocation: "string",
      marketSegment: "string",
      name: "string",
      projectLocation: "string",
      projectName: "string",
      quoteActionWsDTO: {
        action: "CANCEL",
      },
      quoteCode: this.quoteCode,
      quoteEditDetailsAddAccessory: "string",
      submittedBy: "string",
      submittedFor: "string",
    };
    this.spinnerLoading = true;
    this.quotesService.rejectQuote(payload, this.quoteCode).subscribe(
      (res: any) => {
       this.progressHide()
        if (res) {
          this.alertData = {
            message: "Quote Cancelled Successfully",
          };
          this.alertType = "success";
          this.alertTrigger = true;
          this.stopAlert();
        }
      },
      (err: any) => {
        this.progressHide()
      }
    );
  }
  stopAlert() {
    setTimeout(() => {
      this.alertTrigger = false;
      this.onHideModal();
      this.router.navigate(["commercial/quotes/quote"]);
    }, 4000);
  }

   progressShow(msgType: any) {
  
      const messageConstants = MESSAGE_CONSTANTS?.quotes?.QuoteDetails?.[msgType]
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
