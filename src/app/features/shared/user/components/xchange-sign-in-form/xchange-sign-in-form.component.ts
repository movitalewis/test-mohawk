import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import { UserService } from "../../services/user.service";

@Component({
    selector: "xchange-sign-in-form",
    templateUrl: "./xchange-sign-in-form.component.html",
    styleUrls: ["./xchange-sign-in-form.component.scss"],
    standalone: false
})
export class XchangeSignInFormComponent implements OnInit {
  @Input("logoType") logoType: string = "residential";
  @Input("logoTheme") logoTheme: string = "dark";
  showPassword: boolean = false;
  userNameSelected: boolean = false;
  passwordSelected: boolean = false;
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private userService: UserService
  ) {}
  loginForm!: FormGroup;

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      userName: [
        "",
        [
          Validators.required,
          Validators.pattern(
            /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          ),
        ],
      ],
      password: [
        "",
        [
          Validators.required,
          Validators.pattern(
            "^(?=.*\\d)(?=.*[a-z])?(?=.*[A-Z])?(?=.*[\\W]).{8,16}$"
          ),
        ],
      ],
    });
  }
  signIn() {}

  showHidePassword() {
    this.showPassword = !this.showPassword;
  }
}
