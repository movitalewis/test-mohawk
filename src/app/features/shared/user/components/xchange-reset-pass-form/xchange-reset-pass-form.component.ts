import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import { ConfirmedValidator } from "../../../form-control-components/confirmed.validator";
import { UserService } from "../../services/user.service";
import { TokenService } from "src/app/features/http-services/token.service";
import { switchMap } from "rxjs";

@Component({
    selector: "xchange-reset-pass-form",
    templateUrl: "./xchange-reset-pass-form.component.html",
    styleUrls: ["./xchange-reset-pass-form.component.scss"],
    standalone: false
})
export class XchangeResetPassFormComponent implements OnInit {
  faAngleLeft = faAngleLeft;
  alertData = {
    message: "Password Changed Successfully",
    type: "info",
  };
  messageSuccess: boolean = false;
  resetForm!: FormGroup;
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private tokenService: TokenService,
    private service: UserService
  ) {}

  ngOnInit(): void {
    this.resetForm = this.fb.group(
      {
        newpassword: [
          "",
          [
            Validators.required,
            Validators.pattern(
              "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&+=,])[A-Za-z\\d!@#$%^&+=,]{16,}$"
            ),
          ],
        ],
        confirmpassword: ["", [Validators.required]],
      },
      { validator: ConfirmedValidator("newpassword", "confirmpassword") }
    );
  }

  submitButtonClick(value: any) {
    // this.service
    //   .getAnonymousToken()
    //   .pipe(
    //     switchMap((token: any) => {
    //       return this.service.forgotPassword(value, token.access_token);
    //     })
    //   )
    //   .subscribe((res) => {
    //     if (res.headers.status = 200) {
    //       this.messageSuccess = true;
    //     }
    //   });
  }
}
