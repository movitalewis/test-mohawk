import { NgxPaginationModule } from 'ngx-pagination';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PaymentsRoutingModule } from './payments-routing.module';
import { MakePaymentComponent } from './pages/make-payment/make-payment.component';
import { ReceivablesComponent } from './pages/receivables/receivables.component';
import { PaymentReviewComponent } from './pages/payment-review/payment-review.component';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { RecentPaymentsComponent } from "./pages/recent-payments/recent-payments.component";
import { OnlinePaymentHistoryComponent } from "./pages/online-payment-history/online-payment-history.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { XchangeLegendPopupComponent } from "./pages/make-payment/components/xchange-legend-popup/xchange-legend-popup.component";
import { DailyPaymentReportComponent } from "./pages/daily-payment-report/daily-payment-report.component";
import { UserBillpaySignUpComponent } from "src/app/features/commercial/finance/payments/pages/receivables/user-signup/user-billpay-signup";
import { SchedulePaymentConfirmationComponent } from './pages/schedule-payment-confirmation/schedule-payment-confirmation.component';

@NgModule({
  declarations: [
    MakePaymentComponent,
    ReceivablesComponent,
    PaymentReviewComponent,
    RecentPaymentsComponent,
    XchangeLegendPopupComponent,
    OnlinePaymentHistoryComponent,
    DailyPaymentReportComponent,
    UserBillpaySignUpComponent,
    SchedulePaymentConfirmationComponent
  ],
  imports: [
    CommonModule,
    PaymentsRoutingModule,
    SharedModule,
    FormsModule,
    NgxPaginationModule,
    ReactiveFormsModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PaymentsModule {}
