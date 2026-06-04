import { Component, OnInit, TemplateRef, ChangeDetectorRef } from "@angular/core";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl, ValidationErrors } from "@angular/forms";
import { ProductService } from "../../pages/services/product.service";
import { AsmService } from "src/app/features/shared/components/asm/services/asm.service";
import { ProgressModalComponent } from "src/app/features/shared/components/progress-modal/progress-modal.component";
import { MESSAGE_CONSTANTS } from "src/app/features/shared/constants/MESSAGE-CONSTANTS";
import { UserService } from "src/app/features/shared/user/services/user.service";

@Component({
    selector: "app-share-via-email-lightbox",
    templateUrl: "./share-via-email-lightbox.component.html",
    styleUrls: ["./share-via-email-lightbox.component.scss"],
    standalone: false
})
export class ShareViaEmailLightboxComponent implements OnInit {
  modalRef?: BsModalRef;
  toemailForm: FormGroup | any
  data: any;
  spinnerLoading: boolean = false;
  showMessage: any = '';
  alertType:string = '';
  isSuggestionSelected: boolean | any;
  showSuggestions: boolean | any;
  apiLoading: boolean | any;
  suggestions: any;
  cursorPosition: any;
  constructor(
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private fb: FormBuilder,
    private productService: ProductService,
    private userService: UserService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.data = this.modalService.config.initialState;
    
    
    this.toemailForm = this.fb.group({
      senderEmail: ["", [Validators.required, this.multipleEmailValidator]],
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
    this.bsModalRef.hide();
  }
  avoidSpace(event: any) {
    if (event.keyCode === 32) {
      return false;
    } else {
      return undefined;
    }
  }

  sendEmail(){
    let emailIds = this.toemailForm.value.senderEmail.split(',');
    let recipients:any = [];
    emailIds.map((email:any)=>{
      if (email.trim()) {
        recipients.push({
          "email": email.trim(),
          "customer_ids": {
            "email_id": email.trim(),
          },
          "language": "en"
        })
      }
    });
   
   let payload =  {
        "integration_id": "65987c6701781a56cf28625f",
        "email_content":{
          "html": this.data?.fromPDP ? this.data?.content : (this.data?.mailBody || "Attached order details"),
        "subject":this.data?.mailSubject,
          "sender_address": "Xchange_Support@mohawkind.com",
          "sender_name": "XChange Support",
          "attachments": this.data?.fromPDP ? null : [
            {
                "filename": this.data?.pdfName? (this.data.pdfName.includes('.pdf') ? this.data.pdfName : this.data.pdfName + '.pdf') : "order-details.pdf",
                "content": this.data?.content,
                "content_type": "application/pdf"
            }
        ]
        },
        "campaign_name": "Share",
        "recipient": recipients
    }
    this.progressShow('emailsend')
    this.productService.shareViaEmail(payload).subscribe((res: any) => {
      console.log(res);
      this.progressHide();
      this.alertType = res?.success == true ? 'success' : 'danger';
      this.showSuccessMsg(res?.message);
    },(err: any) => {
      this.progressHide();
      console.log(err);
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

  multipleEmailValidator(control: AbstractControl): ValidationErrors | null {
      if (!control.value) {
        return null;
      }
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const emails = control.value.split(',').map((email: string) => email.trim());
      const invalidEmails = emails.filter((email: string) => !emailPattern.test(email));
      if (invalidEmails.length > 0) {
        return { invalidEmails };
      }
      return null;
    }
    onChangeValue(event: Event) {
      this.suggestions = [];
      const control = this.toemailForm.get('senderEmail');
      if (!control) return;
    
      const inputElement = event.target as HTMLTextAreaElement;
      const query = control.value || '';
      const cursorPosition = inputElement.selectionStart ;
      let parts = query.split(',').map((email:any) => email);
      let cumulativeLength = 0;
      let activeFragmentIndex = 0;
    
      for (let i = 0; i < parts.length; i++) {
        cumulativeLength += parts[i].length + 1; 
        if (cursorPosition <= cumulativeLength) {
          activeFragmentIndex = i;
          break;
        }
      }
      const activeFragment = parts[activeFragmentIndex] || '';      
      parts = parts.map((e: any) =>e?.trim());
      let newPart = [...new Set(parts)];
      if ((newPart.length != parts.length && query?.endsWith(','))) {
        const updatedValue = newPart.join(', ').trim();
        this.toemailForm.patchValue({ senderEmail: updatedValue });
      }
      const invalidEmails = this.validateEmails(parts);
      control.setErrors(invalidEmails.length ? { invalidEmails } : null);
      if (query?.endsWith(',')) return;
      this.updateSuggestions(activeFragment);
    }
    
    validateEmails(emails: string[]): string[] {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emails.filter((email) => email && !emailPattern.test(email));
    }
    
    selectSuggestion(suggestion: any) {
      const currentValue = this.toemailForm.get('senderEmail')?.value || '';
      let parts = currentValue.split(',').map((email:any) => email);
      let cumulativeLength = 0;
      let activeFragmentIndex = 0;
    
      for (let i = 0; i < parts.length; i++) {
        cumulativeLength += parts[i].length + 1; 
        if (this.cursorPosition <= cumulativeLength) {
          activeFragmentIndex = i;
          break;
        }
      }
      parts[activeFragmentIndex] = suggestion;
      parts = parts.map((e: any) => e?.trim());
      let newPart = [... new Set(parts)];
      const updatedValue = newPart.join(', ').trim();
      this.toemailForm.patchValue({ senderEmail: updatedValue });
      this.suggestions = [];
      this.showSuggestions = false;
      const invalidEmails = this.validateEmails(parts);
      this.toemailForm.controls['senderEmail'].setErrors(
        invalidEmails.length ? { invalidEmails } : null
      );
    }
    onInputChange(event: Event) {
      const inputElement = event.target as HTMLTextAreaElement;
      this.cursorPosition = inputElement.selectionStart ; 
    }
    updateSuggestions(activeFragment: string) {
      const trimmedFragment = activeFragment.trim();
      this.showSuggestions = trimmedFragment.length >= 3;
    
      if (this.showSuggestions) {
        this.apiLoading = true;
        this.userService.getEmailsByAutoComplete(trimmedFragment).subscribe(
          (res) => {
            this.apiLoading = false;
            this.suggestions = res?.body || [];
          },
          () => {
            this.apiLoading = false;
            this.suggestions = [];
          }
        );
      } else {
        this.suggestions = [];
      }
    }
  
  spaceKeyValidation(e: any) {
    let value = e?.target?.value + e?.key;
    let input: String = e?.target?.value
    if (e?.key == " " && (value == " " || (input.charAt(input?.length - 1) == e?.key))) {
      return false;
    } else {
      return true;
    }
  }


   progressShow(msgType: any) {
        const messageConstants = MESSAGE_CONSTANTS?.orderDetails?.[msgType]
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
