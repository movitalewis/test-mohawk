import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { UserRoutingModule } from "./user-routing.module";
import { XchangeSignInFormComponent } from "./components/xchange-sign-in-form/xchange-sign-in-form.component";
import { XchangeSignUpFormComponent } from "./components/xchange-sign-up-form/xchange-sign-up-form.component";
import { XchangeSignUpMTFormComponent } from "./components/xchange-sign-up-mt-form/xchange-sign-up-mt-form.component";
import { XchangeRegistrationBannerComponent } from "./components/xchange-registration-banner/xchange-registration-banner.component";
import { XchangeForgotPassFormComponent } from "./components/xchange-forgot-pass-form/xchange-forgot-pass-form.component";
import { XchangeResetPassFormComponent } from "./components/xchange-reset-pass-form/xchange-reset-pass-form.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { LoginPageComponent } from "./pages/login-page/login-page.component";
import { RegistrationPageComponent } from "./pages/registration-page/registration-page.component";
import { ForgotPasswordPageComponent } from "./pages/forgot-password-page/forgot-password-page.component";
import { ResetPasswordPageComponent } from "./pages/reset-password-page/reset-password-page.component";
import { RegisterOptionsPageComponent } from "./pages/register-options-page/register-options-page.component";
import { RegistrationPageMTComponent } from "./pages/registration-page-MT/registration-page-MT.component";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { SharedModule } from "../shared.module";
import { StorefrontSelectorComponent } from "./components/storefront-selector/storefront-selector.component";
import { InvalidLoginComponent } from "./components/invalid-login/invalid-login.component";
import { XchangeCustomFooterComponent } from "./components/xchange-custom-footer/xchange-custom-footer.component";

@NgModule({
  declarations: [
    XchangeSignInFormComponent,
    XchangeSignUpFormComponent,
    XchangeSignUpMTFormComponent,
    XchangeRegistrationBannerComponent,
    XchangeForgotPassFormComponent,
    XchangeResetPassFormComponent,
    XchangeCustomFooterComponent,
    LoginPageComponent,
    RegistrationPageComponent,
    ForgotPasswordPageComponent,
    ResetPasswordPageComponent,
    RegisterOptionsPageComponent,
    StorefrontSelectorComponent,
    InvalidLoginComponent,
    RegistrationPageMTComponent,
  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    SharedModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class UserModule {}
