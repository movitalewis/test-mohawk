import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { environment } from "src/environments/environment";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { UserService } from "../../services/user.service";
import { TokenService } from "src/app/features/http-services/token.service";
import {
  faAngleLeft,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import {
  Subscription,
  debounceTime,
  distinctUntilChanged,
  filter,
  of,
  switchMap,
} from "rxjs";
import { ConfirmedValidator } from "../../../form-control-components/confirmed.validator";
import { SessionService } from "src/app/features/http-services/session.service";
import { BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { ConfirmationDialogComponent } from "../../../components/confirmation-dialog/confirmation-dialog.component";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

@Component({
    selector: "xchange-sign-up-mt-form",
    templateUrl: "./xchange-sign-up-mt-form.component.html",
    styleUrls: ["./xchange-sign-up-mt-form.component.scss"],
    standalone: false
})
export class XchangeSignUpMTFormComponent implements OnInit {
  @ViewChild("accountNumberInput") accountNumberInput!: ElementRef;
  faAngleLeft = faAngleLeft;
  accountNotExist: any;
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private userService: UserService,
    private sessionService: SessionService,
    private tokenService: TokenService,
    public modalService: BsModalService
  ) {}
  registrationForm!: FormGroup;
  firstNameUnSelected: boolean = false;
  lastNameUnSelected: boolean = false;
  dealerNameUnSelected: boolean = false;
  accountNumberUnSelected: boolean = false;
  workPhoneUnSelected: boolean = false;
  phoneNumberUnSelected: boolean = false;
  emailAddressUnSelected: boolean = false;
  choosePasswordUnSelected: boolean = false;
  confirmPasswordUnSelected: boolean = false;
  hasMohawkEmail: boolean = false;
  companyData: any;
  account: any;

  errorMessage: string = "";
  spinnerLoading: boolean = false;
  faEye = faEye;
  faEyeSlash = faEyeSlash;
  showPassword: boolean = false;
  showConfirm: boolean = false;

  roles: any = [
    { title: "Advertising", value: "advertising" },
    { title: "Distributor", value: "distributor" },
  ];

  ngOnInit(): void {
    this.registrationForm = this.fb.group(
      {
        firstName: [
          "",
          [
            Validators.minLength(2),
            Validators.maxLength(55),
            Validators.required,
          ],
        ],
        lastName: [
          "",
          [
            Validators.minLength(2),
            Validators.maxLength(55),
            Validators.required,
          ],
        ],
        primaryRole: [null, [Validators.required]],
        workPhone: [
          "",
          [
            Validators.required,
            Validators.pattern(/^[0-9]*$/),
            Validators.min(Number("9".repeat(9))),
            Validators.max(Number("9".repeat(10))),
          ],
        ],
        ext: ["", [Validators.minLength(1), Validators.maxLength(6)]],
        phoneNumber: [
          null,
          [
            Validators.pattern(/^[0-9]*$/),
            Validators.min(Number("9".repeat(9))),
            Validators.max(Number("9".repeat(10))),
          ],
        ],
        emailAddress: [
          "",
          [
            Validators.minLength(5),
            Validators.maxLength(50),
            Validators.required,
            Validators.pattern(
              /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            ),
          ],
        ],
        choosePassword: [
          "",
          [
            Validators.minLength(16),
            Validators.maxLength(50),
            Validators.required,
            Validators.pattern(
              "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&+=,])[A-Za-z\\d!@#$%^&+=,]{16,}$"
            ),
          ],
        ],
        confirmPassword: [
          { value: "", disabled: true },
          [
            Validators.minLength(16),
            Validators.maxLength(50),
            Validators.required,
          ],
        ],
      },
      { validator: ConfirmedValidator("choosePassword", "confirmPassword") }
    );
    this.registrationForm.controls["choosePassword"].valueChanges.subscribe(
      (val: any) => {
        if (val) {
          this.registrationForm.controls["confirmPassword"].enable();
        } else {
          this.registrationForm.controls["confirmPassword"].setValue("");
          this.registrationForm.controls["confirmPassword"].disable();
        }
      }
    );
  }
  setfocus(): void {
    if (this.accountNotExist) {
      this.accountNumberInput.nativeElement.focus();
    }
  }
  getCompany() {
    const accountNumberControl = this.registrationForm.get("accountNumber");
    if (accountNumberControl) {
      // accountNumberControl.valueChanges
      //   .pipe(
      //     debounceTime(1500),
      //     distinctUntilChanged(),
      //   )
      //   .subscribe((account) => {
      if (accountNumberControl.valid) {
        this.getCompanyOptions(accountNumberControl.value);
      }
      // });
    }
  }
  displayEyePassword(): IconProp {
    if (!this.showPassword) return faEyeSlash;
    return faEye;
  }
  showHidePassword() {
    this.showPassword = !this.showPassword;
  }
  displayEyeConfirm(): IconProp {
    if (!this.showConfirm) return faEyeSlash;
    return faEye;
  }
  showHideConfirm() {
    this.showConfirm = !this.showConfirm;
  }

  registerMTUser(formValues: any) {
    this.errorMessage = "";
    const newUser = {
      companyName: formValues.dealerName,
      confirmPassword: formValues.confirmPassword,
      email: formValues.emailAddress,
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      loginId: formValues.emailAddress,
      message: "",
      mobileNumber: formValues.phoneNumber ? formValues.phoneNumber?.replace(/[^0-9]/g, '') : formValues.phoneNumber,
      name: formValues.firstName,
      password: formValues.choosePassword,
      primaryRole: formValues.primaryRole,
      telephone: formValues.workPhone ? formValues.workPhone?.replace(/[^0-9]/g, '') : formValues.workPhone,
      telephoneExtension: formValues.ext,
      titleCode: "",
      useEmailAdd: true,
    };
    this.spinnerLoading = true;
    this.userService
      .getAnonymousToken()
      .pipe(
        switchMap((token: any) => {
          return this.userService.registerMTUser(newUser, token.access_token);
        })
      )
      .subscribe({
        next: (res) => {
          this.spinnerLoading = false;
          if (res.body.errorCode === "0001") {
            this.errorMessage =
              "An unexpected server error occurred during registration. Please try again later.";
          } else {
            this.errorMessage = "";
            this.openSuccessModal({
              title: "Thank you for your request.",
              content:
                "A Mohawk Representative will contact you shortly!",
              primaryActionLabel: "",
              secondaryActionLabel: "close",
              onSecondaryAction: () => {
                this.modalService.hide();
                this.registrationForm.reset();
                this.router.navigateByUrl('/');
              },
            });
          }
        },
        error: (err) => {
          this.spinnerLoading = false;
          if (err.status == 500) {
            this.errorMessage = err.error;
          } else {
            this.errorMessage =
              "An unexpected server error occurred during registration. Please try again later.";
          }
        },
      });
  }

  onEmailInput(e: any) {
    let val = e.target.value;
    this.hasMohawkEmail = val.includes("mohawkind.com");
  }

  openSuccessModal(data = {}) {
    const initialState: ModalOptions = {
      backdrop: true,
      ignoreBackdropClick: true,
      initialState: {
        ...data,
      },
    };
    this.modalService.show(
      ConfirmationDialogComponent,
      Object.assign(initialState, {
        id: "successModal",
        class: "modal-md modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }
  getCompanyOptions(value: any) {
    this.companyData = [];
    this.spinnerLoading = true;
    if (value) {
      this.userService
        .getAnonymousToken()
        .pipe(
          switchMap((token: any) => {
            return this.userService.getCompaniesList(value, token.access_token);
          })
        )
        .subscribe({
          next: (res) => {
            this.spinnerLoading = false;
            if (!res.body.includes("Account Doesn't exist.")) {
              this.companyData = res.body;
              this.registrationForm.get("company")?.enable();
            } else {
              this.accountNotExist = res.body[0];
              this.registrationForm.get("company")?.disable();
              this.setfocus();
              setTimeout(() => {
                this.accountNotExist = null;
              }, 3000);
            }
          },
          error: (err) => {
            this.spinnerLoading = false;
          },
        });
    }
  }

  phonePattern = "[0-9]{9}";
  checkWorkPhoneValidation(e: any) {
    const phoneCharLength = 10;
    let val = e?.target?.value ? e.target.value : e;
    if (
      val.length == phoneCharLength &&
      this.registrationForm.controls["workPhone"].valid
    ) {
      this.registrationForm.controls["workPhone"].clearValidators();
      this.registrationForm.controls["workPhone"].updateValueAndValidity();
      this.registrationForm.patchValue({
        workPhone: this.convertToUsPhoneFormat(val),
      });

      this.registrationForm.controls["workPhone"].setValidators([
        Validators.required,
      ]);
      this.registrationForm.controls["workPhone"].updateValueAndValidity();
    } else {
      let onlyNumbers = this.clearSpeacialCharsFromPhoneNumber(val);
      if (onlyNumbers.length == phoneCharLength) {
        this.registrationForm.patchValue({
          workPhone: this.convertToUsPhoneFormat(onlyNumbers),
        });
        this.registrationForm.controls["workPhone"].setValidators([
          Validators.required,
        ]);
      } else {
        this.registrationForm.patchValue({
          workPhone: onlyNumbers,
        });
        this.registrationForm.controls["workPhone"].setValidators([
          Validators.required,
          Validators.pattern(this.phonePattern),
        ]);
      }
      this.registrationForm.controls["workPhone"].updateValueAndValidity();
    }
  }
  checkPhoneValidation(e: any) {
    const phoneCharLength = 10;

    if (e.target.value !== null) {
      let val = e?.target?.value ? e.target.value : e;
      if (
        val.length == phoneCharLength &&
        this.registrationForm.controls["phoneNumber"].valid
      ) {
        this.registrationForm.controls["phoneNumber"].clearValidators();
        this.registrationForm.controls["phoneNumber"].updateValueAndValidity();
        this.registrationForm.patchValue({
          phoneNumber: this.convertToUsPhoneFormat(val),
        });

        this.registrationForm.controls["phoneNumber"].setValidators([
          Validators.required,
        ]);
        this.registrationForm.controls["phoneNumber"].updateValueAndValidity();
      } else {
        let onlyNumbers = this.clearSpeacialCharsFromPhoneNumber(val);
        if (onlyNumbers.length == phoneCharLength) {
          this.registrationForm.patchValue({
            phoneNumber: this.convertToUsPhoneFormat(onlyNumbers),
          });
          this.registrationForm.controls["phoneNumber"].setValidators([
            Validators.required,
          ]);
        } else {
          this.registrationForm.patchValue({
            phoneNumber: onlyNumbers,
          });
          this.registrationForm.controls["phoneNumber"].setValidators([
            Validators.required,
            Validators.pattern(this.phonePattern),
          ]);
        }
        this.registrationForm.controls["phoneNumber"].updateValueAndValidity();
      }
    }
  }

  convertToUsPhoneFormat(val: any) {
    let formatedValue = "(";
    formatedValue += val.substring(0, 3) + ") ";
    formatedValue += val.substring(3, 6) + " ";
    formatedValue += val.substring(6, 10);
    return formatedValue;
  }

  clearSpeacialCharsFromPhoneNumber(val: any) {
    val = this.removeChar(val, " ");
    val = this.removeChar(val, " ");
    val = this.removeChar(val, "(");
    val = this.removeChar(val, ")");
    return val;
  }
  removeChar(val: any, char: any) {
    let index = val.indexOf(char);
    return index >= 0 ? val.slice(0, index) + val.slice(index + 1) : val;
  }
  preventCopyPaste(event: ClipboardEvent): void {
    event.preventDefault();
  }
}
