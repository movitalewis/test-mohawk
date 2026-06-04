import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { StorageService } from "src/app/features/http-services/storage.service";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import { BankAccountService } from "../../services/bank-account.service";

@Component({
    selector: "app-edit-account",
    templateUrl: "./edit-account.component.html",
    styleUrls: ["./edit-account.component.scss"],
    standalone: false
})
export class EditAccountComponent implements OnInit {
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
      name: "Edit Bank Account",
      path: "/",
      active: true,
    },
  ];
  public spinnerLoading:boolean=false
  public showErrorMessage: boolean = false;
  public errorMessage = "";

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private bankAccountService: BankAccountService,
    private storageService: StorageService
  ) {}

  public editForm!: FormGroup;
  
  public bankAccountDetails: any = {};
  priceLabel:any;
  ngOnInit(): void {
    this.editForm =  this.fb.group({
    accountName: [
      "",
      [
        Validators.required,
        Validators.pattern(/^\S.*[a-zA-Z ]*$/),
        Validators.minLength(1),
        Validators.maxLength(30),
      ],
    ],
  });
    
    this.storageService.getItem("userInfo").subscribe((response: any) => {
      this.priceLabel = response?.priceLabel;
    });

    this.storageService
      .getItem("bankAccountDetails")
      .subscribe((accountData: any) => {
        this.editForm.controls["accountName"].patchValue(
          accountData?.accountName
        );
        this.bankAccountDetails = accountData;
      });
  }


  splitString(input: string, start: number, end: number): string {
    if (!input || start < 0 || end > input.length || start >= end) {
      return input;
    }

    return input.substring(start, end);
  }
  
  navigateToBankList() {
    this.router.navigate(["residential/finance/bank/accounts-list"]);
  }

  navigateToBankListSave(messageType: any, messageText: any) {
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


  saveClick() {
    this.spinnerLoading = true;
    if (this.editForm.dirty || (this.editForm.value.accountName !== this.bankAccountDetails?.accountName)) {
      const payLoad = { ...this.bankAccountDetails, ...this.editForm.value };
      this.bankAccountService.editBankAccount(payLoad).subscribe({
        next: (res: any) => {
          if (res?.body?.errorCode === "0001") {
            this.showErrorMessage = true;
            this.errorMessage = res?.body?.message;
            this.spinnerLoading = false;
          } else if (res?.body?.errorCode == "0000") {
            let messageType = "message";
            let messageText = "Bank account updated successfully";
            this.spinnerLoading = false;
            this.navigateToBankListSave(messageType, messageText);
          } else {
            this.showErrorMessage = true;
            this.errorMessage = "Unable to update Bank account";
            this.spinnerLoading = false;
          }
        },
        error: (err: any) => {
          this.spinnerLoading = false
        },
      });
    } else {
      this.navigateToBankList();
    }
  }
}
