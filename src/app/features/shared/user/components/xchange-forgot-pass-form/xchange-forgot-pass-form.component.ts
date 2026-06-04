import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { TokenService } from "src/app/features/http-services/token.service";
import { UserService } from "../../services/user.service";
import { switchMap } from "rxjs";

@Component({
    selector: "xchange-forgot-pass-form",
    templateUrl: "./xchange-forgot-pass-form.component.html",
    styleUrls: ["./xchange-forgot-pass-form.component.scss"],
    changeDetection: ChangeDetectionStrategy.Default,
    standalone: false
})
export class XchangeForgotPassFormComponent implements OnInit {
  faAngleLeft = faAngleLeft;
  userEmailSelected: boolean = false;
  alertData: any = {
    message: "",
  };
  alertType: string = "";
  messageSuccess: boolean = false;
  forgotpwdForm!: FormGroup;
  isInternal: boolean = false;
  showLoader = false;
  constructor(
    private fb: FormBuilder,
    private service: UserService,
    private tokenService: TokenService
  ) {}

  ngOnInit(): void {
    this.forgotpwdForm = this.fb.group({
      userEmail: [
        "",
        [
          Validators.required,
          Validators.pattern(
            /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          ),
        ],
      ],
    });
  }

  filterEmail(input: any) {
    let email = input.target.value;
    if (email.includes("mohawkind.com")) {
      this.isInternal = true;
    } else {
      this.isInternal = false;
    }
  }

  onSubmit(value: any) {
    this.showLoader = true;
    this.messageSuccess = false;
    this.service.forgotPassword(value).subscribe({
      next: () => {
        (this.alertData.message =
          "You will receive email shortly with the instructions to reset password"),
          (this.alertType = "success");
        this.messageSuccess = true;
        this.showLoader = false;
      },

      error: () => {
        (this.alertData.message =
          "Password Reset Failed. Please contact Mohawk Customer Support."),
          (this.alertType = "danger");
        this.messageSuccess = true;
        this.showLoader = false;
      },
    });
  }
}
