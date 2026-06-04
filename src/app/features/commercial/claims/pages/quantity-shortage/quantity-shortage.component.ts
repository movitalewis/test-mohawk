import { Component, OnInit, TemplateRef } from "@angular/core";
import { Config, Columns, DefaultConfig } from "ngx-easy-table";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import { BsModalService, BsModalRef, ModalOptions } from "ngx-bootstrap/modal";
import { InvoiceSearchPopupComponent } from "../invoice-search-popup/invoice-search-popup.component";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ClaimsService } from "../../services/claims.service";
import { StorageService } from "src/app/features/http-services/storage.service";
import { UserService } from "src/app/features/shared/user/services/user.service";

@Component({
  selector: "app-quantity-shortage",
  templateUrl: "./quantity-shortage.component.html",
  styleUrls: ["./quantity-shortage.component.scss"],
})
export class QuantityShortageComponent implements OnInit {
  breadcrumbItems: BreadcrumbItems = [
    {
      name: "Home",
      path: "/commercial",
      active: false,
    },
    {
      name: "Create A New Claim",
      path: "/commercial/claims/createclaim",
      active: false,
    },
    {
      name: "Pricing Billing Error",
      path: "/",
      active: true,
    },
  ];
  selectedInvoiceData: any = [];
  modalRef?: BsModalRef;
  newClaimForm: FormGroup = this.fb.group({
    dealerName: ["", [Validators.required]],
    dealerPhone: [
      "",
      [
        Validators.required,
        Validators.pattern(/^[0-9]*$/),
        Validators.min(Number("9".repeat(9))),
        Validators.max(Number("9".repeat(10))),
      ],
    ],
    ext: ["", [Validators.required, Validators.pattern(/^[0-9]*$/)]],
    customerAccountNumber: ["216650"],
    dealerEmail: [
      "",
      [
        Validators.required,
        Validators.pattern(
          /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        ),
      ],
    ],
    dealerClaim: [""],
    role: ["", [Validators.required]],
    comments: ["", [Validators.required]],
  });

  constructor(
    private modalService: BsModalService,
    private fb: FormBuilder,
    public claimsService: ClaimsService,
    public bsModalRef: BsModalRef,
    public storageService: StorageService,
    private userService: UserService
  ) {
    this.claimsService.selectedInvoiceLines.line = [];
  }

  openModal() {
    const initialState: ModalOptions = {
      initialState: {},
    };
    this.bsModalRef = this.modalService.show(
      InvoiceSearchPopupComponent,
      Object.assign(initialState, {
        id: "InvoiceSearchPopupComponent",
        class: "modal-lg modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }

  ngOnInit(): void {
    this.getUserDetails();
  }

  defaultPayload: Object = {
    claimType: "PRICING",
    // create: "true",
    // draft: false,

    invoiceNumber: "12345",
    invoiceYear: "2022",
    line: [
      {
        invoiceLineNumber: "1",
        priceQuoted: "200",
        priceQuotedBy: "sales",
        invoicePrice: "1000",
        disputeAmount: "123.0",
        disputeCurrency:
          this.claimsService.selectedInvoiceLines?.line[0].currency,
        additionalInfoNotes: "Pricing Claim Notes",
        reasonForClaimNotes: "Price quoted differently",
      },
    ],
  };

  saveForm(requestStatus: boolean) {
    let payload = { ...this.newClaimForm.value, ...this.defaultPayload };
    const loadingFor = requestStatus ? 'draft' : 'submit';
      this.userService.progressShow(loadingFor)
    payload.draft = requestStatus;
    payload.create = requestStatus ? false : true;
    payload.invoiceNumber =
      this.selectedInvoiceData.length == 0
        ? ""
        : this.selectedInvoiceData[0].invoiceNumber;
    payload.line[0].disputeAmount =
      this.selectedInvoiceData.length == 0
        ? "0"
        : this.selectedInvoiceData[0].invoiceTotal?.value;
    if (!requestStatus) {
      this.newClaimForm.reset();
      this.removeInvoice(0);
    }
    this.claimsService.createClaim(payload).subscribe(
      (res) => {
        this.userService.progressHide(loadingFor)
      },
      (err) => {
        this.userService.progressHide(loadingFor)
      }
    );
  }

  avoidSpace(event: any) {
    if (event.keyCode === 32) {
      return false;
    } else {
      return undefined;
    }
  }

  invoiceRecords(data: any) {
    this.selectedInvoiceData = data;
  }
  removeInvoice(ind: Number) {
    this.claimsService.selectedInvoiceLines.line = [];
  }
  useMyAccountInfo(checked: any) {
    if (checked.state) {
      this.storageService
        .getItem("accountData")
        .subscribe((accountData: any) => {
          this.newClaimForm.controls["dealerName"].setValue(
            accountData?.accountName
          );
          this.newClaimForm.controls["dealerPhone"].setValue(
            accountData?.phone
          );
        });
    } else {
      this.newClaimForm.controls["dealerName"].setValue("");
      this.newClaimForm.controls["dealerPhone"].setValue("");
    }
  }
  getUserDetails() {
    this.userService.getCurrentUserDetail().subscribe((res) => {
      this.newClaimForm.patchValue({ role: res.body?.primaryRole });
    },(err)=>{
      this.userService.progressHide()
    });
  }
  disableDraftBtn() {
    const myFormControls = this.newClaimForm.controls;
    let disable = false;
    for (let key in myFormControls) {
      if (
        myFormControls[key].valid === false &&
        myFormControls[key].value != "" &&
        myFormControls[key].value != null
      ) {
        disable = true;
      }
    }
    return disable;
  }
}
