import { formatDate } from "@angular/common";
import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { BsModalService } from "ngx-bootstrap/modal";
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { ProductService } from "src/app/features/residential/products/pages/services/product.service"; 
import { UserService } from "src/app/features/shared/user/services/user.service";
@Component({
    selector: "app-share-email-modal",
    templateUrl: "./share-email-modal.component.html",
    styleUrls: ["./share-email-modal.component.scss"],
    standalone: false
})
export class ShareEmailModalComponent implements OnInit {
  title: string = "Share via email";
  content: string = "Ramya Dhanapalan(rajeshmulti00@gmail.com)";
  primaryActionLabel: string = "Send";
  secondaryActionLabel: string = "Cancel";
  onSecondaryAction: Function = () => {};
  onPrimaryAction: Function = (data:any) => {};
  selectPDFFlag: boolean = false;
  selectExcelFlag: boolean = false;
  currentDate: any;
  pdfContent: any;
  excelBlob: any;
  @Output() selectedType = new EventEmitter();

  toemailForm: FormGroup | any;
  spinnerLoading: boolean = false;
  showMessage: any = '';
  alertType:string = '';
  subject:any = '';
  data: any;
  emailsList:any = [];
  cursorPosition: any;
  isSuggestionSelected: boolean | any;
  showSuggestions: boolean | any;
  apiLoading: boolean | any;
  suggestions: any;
  constructor(private modalService: BsModalService,
    private fb: FormBuilder,
    private userService: UserService
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

    let todayDate = new Date();
    this.currentDate = formatDate(todayDate, "yyyy-MM-dd", "en-US");
    this.subject = `Price Search Results from MohawkXchange.com - ${this.currentDate}`
    this.toemailForm.patchValue({
      subject: this.subject
    });

    this.getEmailsList();
  }

  getEmailsList(){
    this.userService.getEmailsForUser().subscribe((res: any) => {
      if(res){
        this.emailsList = res?.body;
      }
    });
  }

  onHideModal(){
    this.onSecondaryAction();
  }

  emailPattern:any = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  emailValidator = (control: FormControl) => {
    if(control.value){
      const emails = control.value.split(',');
      const valid = emails.every((email:any) => this.emailPattern.test(email.trim()));
      return valid ? null : { invalidEmails: true };
    }else{
      return { invalidEmails: true }
    }
    
  };


  avoidSpace(event: any) {
    if (event.keyCode === 32) {
      return false;
    } else {
      return undefined;
    }
  }

  docTypeSelection(e: any) {
    if (e.state) {
      switch (e.group) {
        case "PDF":
          this.selectExcelFlag = !e.state;
          this.selectPDFFlag = e.state;
          break;
        case "Excel":
          this.selectExcelFlag = e.state;
          this.selectPDFFlag = !e.state;
          break;
      }
    }
  }

  showSuccessMsg(msg:any){
    this.showMessage = msg;
    setTimeout(() => {
      this.onHideModal();
    }, 2000);
  }

  sendEmail(){
    this.spinnerLoading = true;
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
          "html": this.subject,
          "subject": this.subject,
          "sender_address": "Xchange_Support@mohawkind.com",
          "sender_name": "XChange Support",
        },
        "campaign_name": "Share",
        "recipient": recipients
    }
    let typeOfemail;
    if (this.selectPDFFlag) {
      typeOfemail = 'pdf';
    }
    if (this.selectExcelFlag) {
      typeOfemail = 'excel';
    }
    this.onPrimaryAction(payload,typeOfemail);
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
}
