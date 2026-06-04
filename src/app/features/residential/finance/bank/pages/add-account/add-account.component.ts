import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import { BankAccountService } from "../../services/bank-account.service";
import { StorageService } from "src/app/features/http-services/storage.service";
@Component({
    selector: "app-add-account",
    templateUrl: "./add-account.component.html",
    styleUrls: ["./add-account.component.scss"],
    standalone: false
})
export class AddAccountComponent implements OnInit {
  priceLabel: any = "USD";
  breadcrumbItems: BreadcrumbItems = [
    {
      name: "Home",
      path: "/residential",
      active: false,
    },
    {
      name: "Finance",
      path: " ",
      active: false,
    },
    {
      name: "Add Bank Account",
      path: "/",
      active: true,
    },
  ];
  userAccountNumber: any;
  constructor(
    private bankAccountService: BankAccountService,
    private fb: FormBuilder,
    private router: Router,
    public storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.addAccountForm =  this.fb.group({
    accountName: [
      "",
      [
        Validators.required,
        Validators.pattern(/^\S.*[a-zA-Z ]*$/),
        Validators.minLength(1),
        Validators.maxLength(30),
      ],
    ],
    accountType: [null, [Validators.required]],
    currency: [""],
    bankRoutingNumber: [
      "",
      [
        Validators.required,
        Validators.minLength(Number(9)),
        Validators.maxLength(Number(9)),
        Validators.pattern(/^[0-9]*$/),
      ],
    ],
    cnfrmBankRoutingNumber: [
      "",
      [
        Validators.required,
        Validators.minLength(Number(9)),
        Validators.maxLength(Number(9)),
        Validators.pattern(/^[0-9]*$/),
      ],
    ],
    bankInstitutionNumber: [
      "",
      [
        Validators.required,
        Validators.minLength(Number(1)),
        Validators.maxLength(Number(4)),
        Validators.pattern(/^[0-9]*$/),
      ],
    ],
    cnfrmBankInstitutionNumber: [
      "",
      [
        Validators.required,
        Validators.minLength(Number(1)),
        Validators.maxLength(Number(4)),
        Validators.pattern(/^[0-9]*$/),
      ],
    ],
    bankTransitNumber: [
      "",
      [
        Validators.required,
        Validators.minLength(Number(1)),
        Validators.maxLength(Number(5)),
        Validators.pattern(/^[0-9]*$/),
      ],
    ],
    cnfrmBankTransitNumber: [
      "",
      [
        Validators.required,
        Validators.minLength(Number(1)),
        Validators.maxLength(Number(5)),
        Validators.pattern(/^[0-9]*$/),
      ],
    ],
    accountNumber: [
      "",
      [
        Validators.required,
        Validators.pattern(/^[0-9]*$/),
      ],
    ],
    cnfrmaccountNumber: [
      "",
      [
        Validators.required,
        Validators.pattern(/^[0-9]*$/),
      ],
    ],
  });
    this.storageService.getItem("userInfo").subscribe((response: any) => {
      this.priceLabel = response?.priceLabel;
      this.addAccountForm.patchValue({
        currency: response?.priceLabel,
      });
      if (this.priceLabel == "USD") {
        this.addAccountForm.removeControl("bankInstitutionNumber");
        this.addAccountForm.removeControl("cnfrmBankInstitutionNumber");
        this.addAccountForm.removeControl("bankTransitNumber");
        this.addAccountForm.removeControl("cnfrmBankTransitNumber");
      } else {
        this.addAccountForm.removeControl("bankRoutingNumber");
        this.addAccountForm.removeControl("cnfrmBankRoutingNumber");
      }
    });
    this.storageService.getItem("uid").subscribe((res: any) => {
      if (res) {
        this.userAccountNumber = res;
      } else {
        this.userAccountNumber = localStorage.getItem("accountNumber");
      }
    });
  }

  public addAccountForm!: FormGroup ;
 
  public showErrorMessage: boolean = false;
  public errorMessage = "";
  public spinnerLoading: boolean = false;

  saveAccount() {
    let payLoad: any;
    if (this.addAccountForm.value.currency === "CAD") {
      payLoad = {
        accountName: this.addAccountForm.value?.accountName,
        accountNumber: this.addAccountForm.value?.accountNumber,
        accountType: this.addAccountForm.value?.accountType,
        currency: this.addAccountForm.value?.currency,
        bankInstitutionNumber: this.addAccountForm.value?.bankInstitutionNumber,
        pk: 0,
        bankRoutingNumber: this.addAccountForm.value.bankTransitNumber,
        token: "",
      };
    } else {
      payLoad = this.addAccountForm.value;
    }
    payLoad.pk = 0;
    payLoad.token = "";
    this.spinnerLoading = true;
    this.bankAccountService
      .getAddedBankAccount(payLoad, this.userAccountNumber)
      .subscribe({
        next: (res: any) => {
          if (res?.body?.errorCode === "0001") {
            this.showErrorMessage = true;
            this.errorMessage = res?.body?.message;
            this.spinnerLoading = false;
          } else if (res?.body?.errorCode == "0000") {
            let messageType = "message";
            let messageText = " Bank account added successfully";
            this.spinnerLoading = false;
            this.navigateToBankList(messageType, messageText);
          } else {
            this.showErrorMessage = true;
            this.errorMessage = " Unable to add Bank account";
            this.spinnerLoading = false;
          }
        },
        error: (err: any) => {
          this.showErrorMessage = true;
          this.errorMessage = " Unable to add Bank account";
          this.spinnerLoading = false;
        },
      });
  }
  navigateToBankList(messageType: any, messageText: any) {
    const queryParams: any = {};
    queryParams[messageType] = messageText;
    if (this.router.url.split("?")[0].includes("commercial")) {
      this.router.navigate(["//commercial/finance/bank/accounts-list"], {
        queryParams,
      });
    } else {
      this.router.navigate(["//residential/finance/bank/accounts-list"], {
        queryParams,
      });
    }
  }

  keyPressNumbers(event: any) {
    var charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
      return false;
    } else {
      return true;
    }
  }
}
