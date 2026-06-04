import { ChangeDetectorRef, Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef, ModalOptions } from "ngx-bootstrap/modal";
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { ProductService } from "../../../products/pages/services/product.service"; 
import { ProgressModalComponent } from "src/app/features/shared/components/progress-modal/progress-modal.component";
import { MESSAGE_CONSTANTS } from "src/app/features/shared/constants/MESSAGE-CONSTANTS";
@Component({
    selector: "share-via-email",
    templateUrl: "./share-via-email.component.html",
    styleUrls: ["./share-via-email.component.scss"],
    standalone: false
})
export class ShareViaEmailComponent implements OnInit {
  modalRef?: BsModalRef;
  toemailForm!: FormGroup;
  data: any;
  spinnerLoading: boolean = false;
  showMessage: any = '';
  alertType:string = '';
  constructor(
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private fb: FormBuilder,
    private productService: ProductService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.data = this.modalService.config.initialState;
   
    
    this.toemailForm = this.fb.group({
      senderEmail: [
        "",
        [
          Validators.required,
          this.emailValidator,
        ],
      ],
      subject: ["", [Validators.required]],
    });

    if (this.data?.mailSubject) {
      this.toemailForm.patchValue({
        subject: this.data?.mailSubject,
      });
    }
  }

  emailPattern:any = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  emailValidator = (control: FormControl) => {
    const emails = control.value.split(',');
    const valid = emails.every((email:any) => this.emailPattern.test(email.trim()));
    return valid ? null : { invalidEmails: true };
  };

  onHideModal() {
   // this.modalService.hide(this.modalService.config.id);
   this.bsModalRef.hide();
  }

  sendEmail(){
    this.progressShow('emailsend')
    let emailIds = this.toemailForm.value.senderEmail.split(',');
    let recipients:any = [];
    emailIds.map((email:any)=>{
      recipients.push({
        "email": email.trim(),
        "customer_ids": {
          "email_id": email.trim(),
        },
        "language": "en"
      })
    });

    let payload =  {
         "integration_id": "65987c6701781a56cf28625f",
         "email_content":{
           "html": 'Attached quote details',
           "subject":this.data?.mailSubject,
           "sender_address": "Xchange_Support@mohawkind.com",
           "sender_name": "XChange Support",
           "attachments": [
             {
                 "filename": "Quote-Detail.pdf",
                 "content": this.data?.content,
                 "content_type": "application/pdf"
             }
         ]
         },
         "campaign_name": "Share",
         "recipient": recipients
     }
     this.spinnerLoading = true;
     this.productService.shareViaEmail(payload).subscribe((res: any) => {
       this.progressHide();
        this.alertType = res?.success == true ? 'success' : 'danger';
        this.showSuccessMsg(res?.message);
     },(err: any) => {
       this.progressHide();
      if(err.status == 200){
        this.alertType = 'success';
        this.showSuccessMsg(err?.error?.text);
      }else{
        this.showMessage = 'Error while sending email';
        this.alertType = 'danger';
      }
     });
   }

   showSuccessMsg(msg:any){
    this.showMessage = msg || "Email sent successfully";
    this.cd?.detectChanges();
    setTimeout(() => {
      this.onHideModal();
      this.showMessage = '';
    }, 2000);
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
