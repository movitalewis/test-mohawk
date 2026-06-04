import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
import { CSRGuard } from "./features/http-services/CSRGuard";
import { MashupGuard } from "./features/http-services/MashupGuard";
import { PermissionsGuard } from "./features/http-services/permissions-guard";
import { SSOGuard } from "./features/http-services/SSOGuard";
import { TokenService } from "./features/http-services/token.service";
import { DocumentationLayoutComponent } from "./features/shared/layouts/documentation-layout/documentation-layout.component";
import { MainLayoutComponent } from "./features/shared/layouts/main-layout/main-layout.component";
import { RegistrationLayoutComponent } from "./features/shared/layouts/registration-layout/registration-layout.component";
import { ForgotPasswordPageComponent } from "./features/shared/user/pages/forgot-password-page/forgot-password-page.component";
import { LoginPageComponent } from "./features/shared/user/pages/login-page/login-page.component";
import { RegisterOptionsPageComponent } from "./features/shared/user/pages/register-options-page/register-options-page.component";
import { RegistrationPageComponent } from "./features/shared/user/pages/registration-page/registration-page.component";
import { RegistrationPageMTComponent } from "./features/shared/user/pages/registration-page-MT/registration-page-MT.component";
import { CustomerGuard } from "./features/http-services/customer.guard";

const routes: Routes = [
  {
    path: "",
    canActivate: [SSOGuard],
    component: MainLayoutComponent,
  },
  {
    path: "documentation",
    component: DocumentationLayoutComponent,
    loadChildren: () =>
      import("./features/documentation/documentation.module").then(
        (m) => m.DocumentationModule
      ),
  },
  {
    path: "register-options",
    component: RegisterOptionsPageComponent,
  },
  {
    path: "registration",
    component: RegistrationPageComponent,
  },
  {
    path: "registration-mt",
    component: RegistrationPageMTComponent,
  },
  {
    path: "forgot-password",
    component: ForgotPasswordPageComponent,
  },
  {
    path: "commercial",
    component: MainLayoutComponent,
    canActivate: [SSOGuard, MashupGuard, CSRGuard, CustomerGuard],
    data: { project: "commercial" },
    loadChildren: () =>
      import("./features/commercial/commercial.module").then(
        (m) => m.CommercialModule
      ),
  },
  {
    path: "residential",
    component: MainLayoutComponent,
    canActivate: [SSOGuard, MashupGuard, CSRGuard, CustomerGuard],
    data: { project: "residential" },
    loadChildren: () =>
      import("./features/residential/residential.module").then(
        (m) => m.ResidentialModule
      ),
  },
  {
    path:'**',
    redirectTo: '',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {})],
  exports: [RouterModule],
  providers: [TokenService],
})
export class AppRoutingModule {}
