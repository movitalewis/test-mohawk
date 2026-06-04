import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountRoutingModule } from './account-routing.module';
import { AccountSearchComponent } from './pages/account-search/account-search.component';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SalesAccountSearchComponent } from './pages/sales-account-search/sales-account-search.component';
import { NgxPaginationModule } from "ngx-pagination";
import { MultiAccountComponent } from './pages/multi-account/multi-account.component';
// import { AsmModule } from '../asm/asm.module';
import { CsrListAccountsComponent } from './pages/csr-list-accounts/csr-list-accounts.component';

@NgModule({
  declarations: [
    AccountSearchComponent,
    SalesAccountSearchComponent,
    MultiAccountComponent,
    CsrListAccountsComponent
  ],
  imports: [
    CommonModule,
    AccountRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    NgxPaginationModule,
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class AccountModule { }
