import { Component, OnInit, TemplateRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { BsModalService, BsModalRef,ModalOptions } from "ngx-bootstrap/modal";

import { QuotesService } from "../../services/quotes.service";
import { ProgressModalComponent } from "src/app/features/shared/components/progress-modal/progress-modal.component";
import { MESSAGE_CONSTANTS } from "src/app/features/shared/constants/MESSAGE-CONSTANTS";
@Component({
    selector: 'reject-quote-popup',
    templateUrl: './reject-quote-popup.component.html',
    styleUrls: ['./reject-quote-popup.component.scss'],
    standalone: false
})
export class RejectQuotePopupComponent implements OnInit {
  modalRef?: BsModalRef;
  quoteCode :  any;
  alertData: any = {
    message: "success",
  };
  alertType: any = "success";
  alertTrigger: any = false;
  comments: any;
  isDisabled: boolean = true;
  spinnerLoading: boolean = false;
  constructor(
    public bsModalRef: BsModalRef,
    private quotesService: QuotesService,
    private router: Router,
    private modalService: BsModalService
  ) { }

  ngOnInit(): void {
  }
  onHideModal() {
    this.bsModalRef.hide();
  }
  rejectQuote() {
    this.progressShow('reject')
    let payload = {
      comment: this.comments, 
      quoteActionWsDTO: {
        action: "REJECT",
      },
      quoteCode: this.quoteCode,
    };
    this.quotesService
      .rejectQuote(payload, this.quoteCode)
      .subscribe((res: any) => {
        this.progressHide()
        if (res) {
          this.alertData = {
            message: "Quote Rejected Successfully",
          };
          this.alertType = "success";
          this.alertTrigger = true;
          this.stopAlert();
        }
      },
        (err: any) => {
          this.progressHide()
        });
  }
  onComment(event: any) {
    this.comments = event.target.value
    if (event.target.value.length > 0) {
      this.isDisabled = false
    } else {
      this.isDisabled = true;
    }
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
