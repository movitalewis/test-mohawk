import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';

import { BankRoutingModule } from './bank-routing.module';
import { AddAccountComponent } from './pages/add-account/add-account.component';
import { EditAccountComponent } from './pages/edit-account/edit-account.component';
import { AccountsListComponent } from './pages/accounts-list/accounts-list.component';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { EarningStatementsComponent } from './pages/earning-statements/earning-statements.component';
import { AccountStatementsComponent } from './pages/account-statements/account-statements.component';
import { AccountStatementDetailsComponent } from './pages/account-statement-details/account-statement-details.component';
import { LegendPopupComponent } from './pages/components/legend-popup/xchange-legend-popup.component';
import { UserDetailsComponent } from './pages/user-details/user-details.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from "ngx-pagination";

@NgModule({
  declarations: [
    AddAccountComponent,
    EditAccountComponent,
    AccountsListComponent,
    EarningStatementsComponent,
    AccountStatementsComponent,
    AccountStatementDetailsComponent,
    LegendPopupComponent,
    UserDetailsComponent,
  ],
  imports: [
    CommonModule,
    BankRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [CurrencyPipe, DatePipe],
})
export class BankModule {}
