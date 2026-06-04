import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { BankRoutingModule } from './bank-routing.module';
import { AddAccountComponent } from './pages/add-account/add-account.component';
import { EditAccountComponent } from './pages/edit-account/edit-account.component';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { AccountStatementsComponent } from './pages/account-statements/account-statements.component';
import { AccountStatementDetailsComponent } from './pages/account-statement-details/account-statement-details.component';
import { LegendPopupComponent } from './pages/components/legend-popup/xchange-legend-popup.component';
import { AccountsListComponent } from './pages/accounts-list/accounts-list.component';
import { AdvancedSearchComponent } from './pages/advanced-search/advanced-search.component';
import { EarningStatementsComponent } from './pages/earning-statements/earning-statements.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserDetailsComponent } from './pages/user-details/user-details.component';
import { NgxPaginationModule } from "ngx-pagination";

@NgModule({
  declarations: [
    AddAccountComponent,
    EditAccountComponent,
    AccountStatementsComponent,
    AccountStatementDetailsComponent,
    LegendPopupComponent,
    AccountsListComponent,
    AdvancedSearchComponent,
    EarningStatementsComponent,
    UserDetailsComponent,
  ],
  imports: [
    CommonModule,
    BankRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    NgxPaginationModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [CurrencyPipe, DatePipe],
})
export class BankModule {}
