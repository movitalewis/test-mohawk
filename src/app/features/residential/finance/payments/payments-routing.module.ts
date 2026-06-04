import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { MakePaymentComponent } from './pages/make-payment/make-payment.component';
import { OnlinePaymentHistoryComponent } from './pages/online-payment-history/online-payment-history.component';
import { ReceivablesComponent } from './pages/receivables/receivables.component';
import { PaymentReviewComponent } from './pages/payment-review/payment-review.component';
import { RecentPaymentsComponent } from "./pages/recent-payments/recent-payments.component";
import { DailyPaymentReportComponent } from "./pages/daily-payment-report/daily-payment-report.component";
import { UserBillpaySignUpComponent } from "./pages/receivables/user-signup/user-billpay-signup";
import { SchedulePaymentConfirmationComponent } from "./pages/schedule-payment-confirmation/schedule-payment-confirmation.component";
import { MakeAPaymentGaurdService } from 'src/app/features/http-services/make-a-payment-gaurd.service';

const routes: Routes = [
  {
    path: "make-payment",
    component: MakePaymentComponent,
    canActivate:[MakeAPaymentGaurdService]
  },
  {
    path: "receivables",
    component: ReceivablesComponent,
    canActivate:[MakeAPaymentGaurdService]
  },
  {
    path: "review",
    component: PaymentReviewComponent,
  },
  {
    path: "recent-payments",
    component: RecentPaymentsComponent,
  },
  {
    path: "online-payment-history", // path: 'online-payments',
    component: OnlinePaymentHistoryComponent,
  },
  {
    path: "daily-payment-report",
    component: DailyPaymentReportComponent,
  },
  {
    path: "receivables/select-users",
    component: UserBillpaySignUpComponent,
  },
  {
    path: "schedule-payment-confirmation",
    component: SchedulePaymentConfirmationComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaymentsRoutingModule { }
