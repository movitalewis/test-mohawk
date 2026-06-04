import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ForgotPasswordPageComponent } from './pages/forgot-password-page/forgot-password-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { RegistrationPageComponent } from './pages/registration-page/registration-page.component';
import { ResetPasswordPageComponent } from './pages/reset-password-page/reset-password-page.component';
import { RegisterOptionsPageComponent } from './pages/register-options-page/register-options-page.component';
import { RegistrationPageMTComponent } from './pages/registration-page-MT/registration-page-MT.component';

const routes: Routes = [
  {
    path: '',
    component: LoginPageComponent
  },
  {
    path: 'registration',
    component: RegistrationPageComponent
  },
  {
    path: 'registration-mt',
    component: RegistrationPageMTComponent
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordPageComponent
  },
  {
    path: 'reset-password',
    component: ResetPasswordPageComponent
  },
  { path: 'register-options', component: RegisterOptionsPageComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
